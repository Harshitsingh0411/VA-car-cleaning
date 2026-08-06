import { compressImage } from "../utils/imageCompressor";
import { compressVideo } from "../utils/videoCompressor";

export interface UploadMediaResult {
  url: string;        // Always starts with https://res.cloudinary.com/
  publicId?: string;
  resourceType: "image" | "video";
  originalSize?: number;
  compressedSize?: number;
  reductionPercentage?: number;
}

/**
 * Uploads media (images/videos) to Cloudinary.
 *
 * POLICY: This function MUST NEVER return a data: URL or blob: URL.
 * If Cloudinary upload fails or credentials are missing, it throws an error.
 * Callers MUST NOT save any image data to Firestore unless this resolves.
 *
 * Correct flow:
 *   User selects file → compress → upload to Cloudinary → store secure_url
 */
export async function uploadMediaToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadMediaResult> {
  // Priority: env var → localStorage → empty string
  const cloudName =
    (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) ||
    (typeof localStorage !== "undefined" && localStorage.getItem("admin_cloudinary_cloud_name")) ||
    "";
  const uploadPreset =
    (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) ||
    (typeof localStorage !== "undefined" && localStorage.getItem("admin_cloudinary_upload_preset")) ||
    "";

  // ─── Validate Cloudinary credentials before doing anything ───────────────
  if (!cloudName || !cloudName.trim() || !uploadPreset || !uploadPreset.trim()) {
    throw new Error(
      "Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and " +
      "VITE_CLOUDINARY_UPLOAD_PRESET (or configure them via Admin Settings). " +
      "Image upload failed — record was not saved."
    );
  }

  // ─── Detect resource type ────────────────────────────────────────────────
  const isVideo = file.type.startsWith("video/");

  let fileToUpload: File = file;
  let originalSize = file.size;
  let compressedSize = file.size;
  let reductionPercentage = 0;

  // ─── 1. Client-side compression pipeline (before upload) ─────────────────
  if (!isVideo && file.type.startsWith("image/")) {
    try {
      const compResult = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.80
      });
      fileToUpload = compResult.compressedFile;
      originalSize = compResult.originalSize;
      compressedSize = compResult.compressedSize;
      reductionPercentage = compResult.reductionPercentage;
    } catch (err) {
      console.warn("Image compression fallback to raw file:", err);
      // Continue with original file — still upload to Cloudinary
    }
  } else if (isVideo) {
    try {
      const vidResult = await compressVideo(file, {
        maxWidth: 1280,
        maxHeight: 720,
        targetBitrate: 1500000
      }, onProgress);
      fileToUpload = vidResult.compressedFile;
      originalSize = vidResult.originalSize;
      compressedSize = vidResult.compressedSize;
      reductionPercentage = vidResult.reductionPercentage;
    } catch (err) {
      console.warn("Video compression fallback to raw file:", err);
      // Continue with original file — still upload to Cloudinary
    }
  }

  // ─── 2. Upload to Cloudinary via multipart/form-data (NEVER base64) ──────
  const resourceType = isVideo ? "video" : "image";
  const formData = new FormData();
  formData.append("file", fileToUpload);           // Raw File object — NOT base64
  formData.append("upload_preset", uploadPreset.trim());
  formData.append("folder", "va-car-bike-care");

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/${resourceType}/upload`;

  let response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  // Retry via 'auto' resourceType endpoint if video returned 401/400
  if (!response.ok && isVideo) {
    const autoEndpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/auto/upload`;
    const autoResp = await fetch(autoEndpoint, {
      method: "POST",
      body: formData
    });
    if (autoResp.ok) {
      response = autoResp;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Cloudinary upload failed:", response.status, errorData);
    throw new Error(
      `Image upload failed (Cloudinary responded with ${response.status}). ` +
      "Record was not saved. Please check your Cloudinary credentials and try again."
    );
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(
      "Image upload failed — Cloudinary did not return a secure URL. Record was not saved."
    );
  }

  // ─── 3. Return ONLY Cloudinary metadata — NEVER a data: URL ──────────────
  return {
    url: data.secure_url,           // Always https://res.cloudinary.com/...
    publicId: data.public_id,
    resourceType,
    originalSize,
    compressedSize,
    reductionPercentage
  };
}

/**
 * Generates a lightweight JPEG poster snapshot from a video file.
 *
 * ⚠️  FOR LOCAL PREVIEW ONLY — NEVER save this data URL to Firestore.
 * Use it only to show a thumbnail in the UI while the video uploads to Cloudinary.
 */
export async function generateVideoPosterDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.5;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        video.remove();
      };

      video.onloadeddata = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = Math.min(video.videoWidth || 640, 640);
          const height = Math.round((width * (video.videoHeight || 360)) / (video.videoWidth || 640));
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            // toDataURL is PREVIEW-ONLY — do NOT save this to Firestore
            const posterDataUrl = canvas.toDataURL("image/jpeg", 0.6);
            cleanup();
            resolve(posterDataUrl);
            return;
          }
        } catch (e) {}
        cleanup();
        resolve("");
      };

      video.onerror = () => {
        cleanup();
        resolve("");
      };
    } catch (e) {
      resolve("");
    }
  });
}

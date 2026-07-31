import { compressImage } from "../utils/imageCompressor";
import { compressVideo } from "../utils/videoCompressor";

export interface UploadMediaResult {
  url: string;
  publicId?: string;
  resourceType: "image" | "video";
  originalSize?: number;
  compressedSize?: number;
  reductionPercentage?: number;
}

/**
 * Uploads media (images/videos) to Cloudinary with automatic client-side compression.
 * If Cloudinary environment variables are not set, it gracefully returns an optimized Object/Data URL.
 */
export async function uploadMediaToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadMediaResult> {
  const isVideo = file.type.startsWith("video/");
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || "795785485242389";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "unsigned_reviews";

  let fileToUpload: File = file;
  let dataUrlPreview = "";
  let originalSize = file.size;
  let compressedSize = file.size;
  let reductionPercentage = 0;

  // 1. Client-side Image & Video Reducer pipeline
  if (!isVideo && file.type.startsWith("image/")) {
    try {
      const compResult = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.75
      });
      fileToUpload = compResult.compressedFile;
      dataUrlPreview = compResult.dataUrl;
      originalSize = compResult.originalSize;
      compressedSize = compResult.compressedSize;
      reductionPercentage = compResult.reductionPercentage;
    } catch (err) {
      console.warn("Image compression fallback to raw file:", err);
    }
  } else if (isVideo) {
    try {
      const vidResult = await compressVideo(file, {
        maxWidth: 1280,
        maxHeight: 720,
        targetBitrate: 1500000
      }, onProgress);
      fileToUpload = vidResult.compressedFile;
      dataUrlPreview = vidResult.previewUrl;
      originalSize = vidResult.originalSize;
      compressedSize = vidResult.compressedSize;
      reductionPercentage = vidResult.reductionPercentage;
    } catch (err) {
      console.warn("Video compression fallback to raw file:", err);
      dataUrlPreview = URL.createObjectURL(file);
    }
  }

  // 2. Upload to Cloudinary API if valid Cloud Name and Preset exist
  const hasCloudinaryConfig =
    Boolean(cloudName && cloudName.trim().length > 0 && uploadPreset && uploadPreset.trim().length > 0);

  if (hasCloudinaryConfig) {
    try {
      const resourceType = isVideo ? "video" : "image";
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", uploadPreset.trim());

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/${resourceType}/upload`;

      let response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      // Retry via 'auto' resourceType endpoint if video upload returned 401/400
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

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url || data.url) {
          return {
            url: data.secure_url || data.url,
            publicId: data.public_id,
            resourceType,
            originalSize,
            compressedSize,
            reductionPercentage
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Cloudinary upload status notice:", response.status, errorData);
      }
    } catch (err) {
      console.warn("⚠️ Cloudinary network upload notice, using compressed fallback URL:", err);
    }
  }

  // 3. Persistent Local Fallback: Generate compact poster data URL for videos & compressed data URL for photos
  let persistentDataUrl = dataUrlPreview;
  if (isVideo) {
    persistentDataUrl = await generateVideoPosterDataUrl(file);
  }

  if (!persistentDataUrl || persistentDataUrl.startsWith("blob:")) {
    persistentDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileToUpload);
    });
  }

  // Safety cap: Ensure data URL never exceeds 400KB to fit safely in Firestore limits
  if (persistentDataUrl.length > 400000 && persistentDataUrl.startsWith("data:")) {
    persistentDataUrl = persistentDataUrl.substring(0, 400000);
  }

  return {
    url: persistentDataUrl,
    resourceType: isVideo ? "video" : "image",
    originalSize,
    compressedSize,
    reductionPercentage
  };
}

/** Helper to generate lightweight (< 50KB) JPEG poster snapshot from video files */
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

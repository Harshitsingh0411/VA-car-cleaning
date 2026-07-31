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

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

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

  // 3. Fallback: Return persistent Data URL (never a temporary local blob: URL)
  let persistentDataUrl = dataUrlPreview;
  if (!persistentDataUrl || persistentDataUrl.startsWith("blob:")) {
    persistentDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileToUpload);
    });
  }

  return {
    url: persistentDataUrl,
    resourceType: isVideo ? "video" : "image",
    originalSize,
    compressedSize,
    reductionPercentage
  };
}

import { compressImage } from "../utils/imageCompressor";

export interface UploadMediaResult {
  url: string;
  publicId?: string;
  resourceType: "image" | "video";
  originalSize?: number;
  compressedSize?: number;
  reductionPercentage?: number;
}

/**
 * Uploads media (images/videos) to Cloudinary with automatic client-side image compression.
 * If Cloudinary environment variables are not set, it gracefully returns an optimized Data URL.
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

  // 1. Client-side Image Size Reducer pipeline for photos
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
    // For video, create preview URL
    dataUrlPreview = URL.createObjectURL(file);
  }

  // 2. Upload to Cloudinary API if valid Cloud Name and Preset exist
  const hasCloudinaryConfig =
    cloudName &&
    cloudName.trim().length > 0 &&
    cloudName !== "va-car-cleaning" &&
    uploadPreset &&
    uploadPreset !== "unsigned_reviews";

  if (hasCloudinaryConfig) {
    try {
      const resourceType = isVideo ? "video" : "image";
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", uploadPreset);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }
      formData.append("folder", "va_car_cleaning_reviews");

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/${resourceType}/upload`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
      }

      const data = await response.json();

      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
        resourceType,
        originalSize,
        compressedSize,
        reductionPercentage
      };
    } catch (err) {
      console.warn("⚠️ Cloudinary network upload notice, using compressed fallback URL:", err);
    }
  }

  // 3. Fallback: Return Data URL / Object URL
  if (!dataUrlPreview) {
    dataUrlPreview = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(fileToUpload);
    });
  }

  return {
    url: dataUrlPreview,
    resourceType: isVideo ? "video" : "image",
    originalSize,
    compressedSize,
    reductionPercentage
  };
}

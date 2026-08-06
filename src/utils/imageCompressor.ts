/**
 * Image Compressor Utility using HTML5 Canvas.
 *
 * Resizes large user-uploaded photos to a specified max dimension and reduces
 * file size before uploading to Cloudinary.
 *
 * ─── IMAGE STORAGE POLICY ────────────────────────────────────────────────────
 * The `dataUrl` field in CompressionResult is for LOCAL UI PREVIEW ONLY.
 * It MUST NEVER be saved to Firestore, localStorage, or any database.
 * Only Cloudinary secure_url values (https://res.cloudinary.com/...) may be saved.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export interface CompressionResult {
  compressedFile: File;
  /**
   * ⚠️ FOR LOCAL PREVIEW ONLY — NEVER save this to Firestore or any database.
   * Use it only to display a local thumbnail before the file is uploaded to Cloudinary.
   * After upload, use the Cloudinary secure_url instead.
   */
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.80,
    mimeType = "image/jpeg"
  } = options;

  return new Promise((resolve, reject) => {
    // ── Non-image files: return as-is (no compression) ───────────────────────
    // We do NOT use FileReader.readAsDataURL here — it would produce a data: URL
    // which must never be saved to Firestore.
    if (!file.type.startsWith("image/")) {
      resolve({
        compressedFile: file,
        dataUrl: "",  // Empty — caller should use URL.createObjectURL() for preview
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercentage: 0
      });
      return;
    }

    // ── Image files: use Canvas API (no FileReader.readAsDataURL) ─────────────
    const img = new Image();
    // URL.createObjectURL is safe for local preview; we revoke it after use
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Maintain aspect ratio while bounding dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // toDataURL result is for LOCAL PREVIEW ONLY — NEVER save to Firestore
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".jpg"),
            { type: mimeType, lastModified: Date.now() }
          );

          const reductionPercentage = Math.max(
            0,
            Math.round((1 - blob.size / file.size) * 100)
          );

          console.log(
            `🗜️ Canvas Compressor: ${(file.size / 1024).toFixed(1)} KB → ` +
            `${(blob.size / 1024).toFixed(1)} KB (${reductionPercentage}% reduced)`
          );

          resolve({
            compressedFile,
            dataUrl,  // ⚠️ LOCAL PREVIEW ONLY — NEVER save to Firestore
            originalSize: file.size,
            compressedSize: blob.size,
            reductionPercentage
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

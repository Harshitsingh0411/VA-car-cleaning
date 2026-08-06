import React, { useState } from "react";
import {
  Upload, Image as ImageIcon, Check, Loader2,
  ExternalLink, Settings, AlertCircle, X
} from "lucide-react";
import imageCompression from "browser-image-compression";
import GlassImage from "../ui/GlassImage";

/**
 * IMAGE STORAGE POLICY:
 * This component MUST ONLY call onChange() with a Cloudinary secure_url.
 * It MUST NEVER call onChange() with a data:image/... URL or blob: URL.
 * Local object URLs (URL.createObjectURL) may be used for preview only and
 * are NEVER passed to onChange().
 */

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface CloudinaryUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  cloudName?: string;
  uploadPreset?: string;
}

export default function CloudinaryUploader({
  value,
  onChange,
  label = "Upload Image",
  cloudName: initialCloudName = "d4j2s2kep",
  uploadPreset: initialUploadPreset = "unsigned_reviews"
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  // Local preview only — NEVER saved to Firestore
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const [customCloudName, setCustomCloudName] = useState(() => {
    // Priority: env var → localStorage → prop default
    const envName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
    if (envName?.trim()) return envName.trim();
    const stored = localStorage.getItem("admin_cloudinary_cloud_name");
    // Clear stale old cloud name if it still has the wrong value
    if (stored === "va-car-cleaning") {
      localStorage.removeItem("admin_cloudinary_cloud_name");
      return initialCloudName;
    }
    return stored || initialCloudName;
  });
  const [customUploadPreset, setCustomUploadPreset] = useState(() => {
    // Priority: env var → localStorage → prop default
    const envPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
    if (envPreset?.trim()) return envPreset.trim();
    const stored = localStorage.getItem("admin_cloudinary_upload_preset");
    // Clear stale old preset if it still has the wrong value
    if (stored === "ml_default") {
      localStorage.removeItem("admin_cloudinary_upload_preset");
      return initialUploadPreset;
    }
    return stored || initialUploadPreset;
  });

  const saveConfig = (cName: string, preset: string) => {
    setCustomCloudName(cName);
    setCustomUploadPreset(preset);
    localStorage.setItem("admin_cloudinary_cloud_name", cName);
    localStorage.setItem("admin_cloudinary_upload_preset", preset);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // ── Validate file type ────────────────────────────────────────────────
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file format. Please upload JPG, PNG, WebP, or AVIF.`);
      return;
    }

    // ── Validate file size ────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      return;
    }

    // ── Check Cloudinary credentials before doing anything ────────────────
    const hasConfig = Boolean(
      customCloudName?.trim() && customUploadPreset?.trim()
    );
    if (!hasConfig) {
      setError(
        "Cloudinary is not configured. Please click the ⚙ gear icon to enter your Cloud Name and Upload Preset before uploading."
      );
      setShowConfig(true);
      return;
    }

    setUploading(true);

    // ── Show local preview immediately (URL.createObjectURL — preview only) ─
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);

    try {
      // ── Compress image before upload (never readAsDataURL) ──────────────
      let fileToUpload = file;
      try {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          // fileType stays the same — we upload the File object directly
        });
      } catch (compressionError) {
        console.warn("Image compression failed, uploading original file:", compressionError);
        fileToUpload = file;
      }

      // ── Upload to Cloudinary via multipart/form-data (NEVER base64) ─────
      const formData = new FormData();
      formData.append("file", fileToUpload);           // Raw File — NOT base64
      formData.append("upload_preset", customUploadPreset.trim());
      // Include api_key for account validation (safe for unsigned presets)
      const envApiKey = (import.meta.env.VITE_CLOUDINARY_API_KEY as string | undefined)?.trim();
      if (envApiKey) formData.append("api_key", envApiKey);
      // folder is NOT appended — unsigned presets may reject it

      console.log("☁️ Cloudinary upload attempt:", {
        cloudName: customCloudName.trim(),
        preset: customUploadPreset.trim(),
        fileSize: `${(fileToUpload.size / 1024).toFixed(1)} KB`,
        fileType: fileToUpload.type
      });

      // Log every FormData field to detect any unexpected api_key injection
      console.log("☁️ FormData fields being sent:");
      for (const [key, val] of formData.entries()) {
        if (typeof val === "string") {
          console.log(` → ${key}: "${val}"`);
        } else {
          console.log(` → ${key}: [File name=${val.name} size=${val.size}B type=${val.type}]`);
        }
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${customCloudName.trim()}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("☁️ Cloudinary full error:", res.status, JSON.stringify(errorData));
        throw new Error(
          `Upload failed (HTTP ${res.status}). ` +
          (errorData?.error?.message || "Please check your Cloudinary credentials.")
        );
      }

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary did not return a valid image URL.");
      }

      // ── SUCCESS: call onChange with the Cloudinary URL ONLY ──────────────
      // data.secure_url always starts with https://res.cloudinary.com/
      onChange(data.secure_url);

      // Revoke the local preview and replace with Cloudinary URL
      URL.revokeObjectURL(previewUrl);
      setLocalPreviewUrl(null);

    } catch (err: any) {
      // ── FAILURE: do NOT call onChange() — record must not be saved ────────
      URL.revokeObjectURL(previewUrl);
      setLocalPreviewUrl(null);
      setError(
        err?.message ||
        "Image upload failed. Record was not saved. Please try again."
      );
      console.error("CloudinaryUploader error:", err);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    }
  };

  // The currently displayed preview:
  // - localPreviewUrl while uploading (URL.createObjectURL)
  // - value (Cloudinary URL) after successful upload
  // Never show data: URLs here
  const displayPreview = localPreviewUrl || (
    value && value.startsWith("https://") ? value : null
  );

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={12} className="text-primary" />
          <span>{label}</span>
        </label>

        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-400 hover:text-dark text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          title="Cloudinary Cloud Settings"
        >
          <Settings size={12} />
        </button>
      </div>

      {showConfig && (
        <div className="p-[#f0f7ff] border border-blue-100 rounded-xl p-3 space-y-2 text-xs">
          <div className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
            <Settings size={10} />
            Cloudinary Unsigned Upload Credentials
          </div>
          <p className="text-[10px] text-blue-500">
            Required to upload images. Get these from your Cloudinary dashboard.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-gray-400 block font-semibold">Cloud Name</span>
              <input
                type="text"
                value={customCloudName}
                onChange={(e) => saveConfig(e.target.value, customUploadPreset)}
                placeholder="your_cloud_name"
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono text-dark"
              />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 block font-semibold">Upload Preset</span>
              <input
                type="text"
                value={customUploadPreset}
                onChange={(e) => saveConfig(customCloudName, e.target.value)}
                placeholder="ml_default"
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono text-dark"
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <label className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold cursor-pointer transition-colors border border-dashed ${
          uploading
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600"
        }`}>
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Uploading Image...</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-primary" />
              <span>Choose Image to Upload (JPG, PNG, WebP · Max 10MB)</span>
            </>
          )}
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview — only shows Cloudinary URLs or local objectURL during upload */}
      {displayPreview && (
        <div className="relative h-28 w-full rounded-xl overflow-hidden border border-gray-200 shadow-xs group bg-gray-900">
          <GlassImage src={displayPreview} alt="Preview" className="w-full h-full object-cover" containerClassName="w-full h-full" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {!uploading && value && value.startsWith("https://") && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 text-dark text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"
              >
                <span>View on Cloudinary</span>
                <ExternalLink size={10} />
              </a>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={() => { onChange(""); setLocalPreviewUrl(null); setError(null); }}
                className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"
              >
                <X size={10} />
                Remove
              </button>
            )}
          </div>
          <div className={`absolute top-1.5 right-1.5 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 ${
            uploading ? "bg-blue-500" : "bg-emerald-500"
          }`}>
            {uploading ? (
              <><Loader2 size={9} className="animate-spin" /> Uploading</>
            ) : (
              <><Check size={10} /> Cloudinary</>
            )}
          </div>
        </div>
      )}

      {/* Cloudinary URL badge when value is set */}
      {value && value.startsWith("https://res.cloudinary.com/") && !uploading && (
        <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
          <Check size={9} />
          Stored as Cloudinary URL ✓
        </div>
      )}
    </div>
  );
}

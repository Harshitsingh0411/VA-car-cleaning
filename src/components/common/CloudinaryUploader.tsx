import React, { useState } from "react";
import { Upload, Image as ImageIcon, Check, Loader2, Link as LinkIcon, ExternalLink, Settings } from "lucide-react";

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
  label = "Image URL (Cloudinary Supported)",
  placeholder = "https://res.cloudinary.com/...",
  cloudName: initialCloudName = "va-car-cleaning",
  uploadPreset: initialUploadPreset = "ml_default"
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"url" | "file">("url");
  const [showConfig, setShowConfig] = useState(false);

  const [customCloudName, setCustomCloudName] = useState(
    () => localStorage.getItem("admin_cloudinary_cloud_name") || initialCloudName
  );
  const [customUploadPreset, setCustomUploadPreset] = useState(
    () => localStorage.getItem("admin_cloudinary_upload_preset") || initialUploadPreset
  );

  const saveConfig = (cName: string, preset: string) => {
    setCustomCloudName(cName);
    setCustomUploadPreset(preset);
    localStorage.setItem("admin_cloudinary_cloud_name", cName);
    localStorage.setItem("admin_cloudinary_upload_preset", preset);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const convertToDataUrl = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onChange(reader.result.toString());
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };

    try {
      // Try Cloudinary Unsigned Upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", customUploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${customCloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          onChange(data.secure_url);
          setUploading(false);
          return;
        }
      }

      // If Cloudinary returned non-200 (e.g. 401 unsigned preset not set), fallback to local DataURL
      convertToDataUrl();
    } catch (err: any) {
      console.warn("Cloudinary upload fallback to DataURL:", err);
      convertToDataUrl();
    }
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={12} className="text-primary" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-gray-400 hover:text-dark text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Cloudinary Cloud Settings"
          >
            <Settings size={12} />
          </button>

          <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                mode === "url" ? "bg-white text-dark shadow-xs" : "text-gray-400"
              }`}
            >
              Cloudinary URL
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                mode === "file" ? "bg-white text-dark shadow-xs" : "text-gray-400"
              }`}
            >
              Upload File
            </button>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
          <div className="text-[10px] font-bold text-gray-500 uppercase">Cloudinary Unsigned Upload Credentials</div>
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

      {mode === "url" ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all pl-9"
          />
          <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
        </div>
      ) : (
        <div className="relative">
          <label className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl py-3 px-4 text-xs font-bold text-gray-600 cursor-pointer transition-colors">
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Processing & Uploading Image...</span>
              </>
            ) : (
              <>
                <Upload size={16} className="text-primary" />
                <span>Choose Image to Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-[10px] text-rose-500 font-bold">{error}</p>}

      {/* Image Preview Thumbnail */}
      {value && (
        <div className="relative h-28 w-full rounded-xl overflow-hidden border border-gray-200 shadow-xs group bg-gray-900">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 text-dark text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <span>View Full Image</span>
              <ExternalLink size={10} />
            </a>
          </div>
          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
            <Check size={10} /> Valid
          </div>
        </div>
      )}
    </div>
  );
}

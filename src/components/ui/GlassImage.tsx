import React, { useState } from "react";
import { Loader2, ImageOff, Sparkles } from "lucide-react";

interface GlassImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  fallbackIcon?: React.ReactNode;
}

export default function GlassImage({
  src,
  alt = "Image",
  className = "",
  containerClassName = "",
  aspectRatio = "",
  fallbackIcon,
  onLoad,
  onError,
  ...props
}: GlassImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName} ${aspectRatio}`}>
      {/* Glassmorphism Loader UI (Active while image is loading) */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300">
          {/* Moving Glass Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent -translate-x-full animate-glass-shimmer pointer-events-none" />

          {/* Centered Glass Loader Pill */}
          <div className="relative z-20 flex flex-col items-center justify-center p-3 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-2xl border border-white/30 flex items-center justify-center shadow-lg">
              <Loader2 size={20} className="text-amber-400 animate-spin" />
            </div>
            <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/90 bg-black/40 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm flex items-center gap-1">
              <Sparkles size={10} className="text-amber-400 animate-pulse" /> Loading Media...
            </span>
          </div>
        </div>
      )}

      {/* Error Glass Fallback */}
      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 p-4 text-center">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-1.5 shadow-md">
            {fallbackIcon || <ImageOff size={20} />}
          </div>
          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Unable to load image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-all duration-500 ease-out ${
            loaded ? "opacity-100 scale-100 filter-none" : "opacity-0 scale-95 blur-md"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}

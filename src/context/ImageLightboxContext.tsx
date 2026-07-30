import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

export interface LightboxMedia {
  url: string;
  type?: "image" | "video";
  title?: string;
  caption?: string;
}

interface ImageLightboxContextType {
  openLightbox: (media: string | LightboxMedia | (string | LightboxMedia)[], index?: number) => void;
  closeLightbox: () => void;
}

const ImageLightboxContext = createContext<ImageLightboxContextType>({
  openLightbox: () => {},
  closeLightbox: () => {},
});

export const useImageLightbox = () => useContext(ImageLightboxContext);

export const ImageLightboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LightboxMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const openLightbox = useCallback(
    (media: string | LightboxMedia | (string | LightboxMedia)[], index: number = 0) => {
      let formatted: LightboxMedia[] = [];

      if (Array.isArray(media)) {
        formatted = media.map((item) =>
          typeof item === "string" ? { url: item, type: item.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? "video" : "image" } : item
        );
      } else if (typeof media === "string") {
        formatted = [{ url: media, type: media.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? "video" : "image" }];
      } else {
        formatted = [media];
      }

      if (formatted.length === 0) return;

      setItems(formatted);
      setCurrentIndex(Math.min(Math.max(0, index), formatted.length - 1));
      setZoomLevel(1);
      setIsOpen(true);
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setZoomLevel(1);
  }, []);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, handleNext, handlePrev]);

  const activeMedia = items[currentIndex];

  return (
    <ImageLightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}

      <AnimatePresence>
        {isOpen && activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 select-none"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Title & Counter */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-white text-xs font-semibold">
                <span>{activeMedia.title || activeMedia.caption || "Full Image Display"}</span>
                {items.length > 1 && (
                  <span className="text-[#F4B400] font-bold">
                    {currentIndex + 1} / {items.length}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {activeMedia.type !== "video" && (
                  <>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 3))}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={18} />
                    </button>

                    <button
                      onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={18} />
                    </button>

                    {zoomLevel > 1 && (
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Reset Zoom"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={closeLightbox}
                  className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Left Prev Arrow */}
            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 sm:left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-md"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Main Display Container */}
            <div
              className="relative max-w-full max-h-full flex items-center justify-center overflow-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={activeMedia.url + currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: zoomLevel, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="transition-transform duration-200"
              >
                {activeMedia.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[85vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain border border-white/10"
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.title || "Full display image"}
                    className="max-h-[85vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain border border-white/10 cursor-zoom-in"
                  />
                )}
              </motion.div>
            </div>

            {/* Right Next Arrow */}
            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 sm:right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-md"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ImageLightboxContext.Provider>
  );
};

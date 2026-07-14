import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { getBeforeAfterSettings, dbBeforeAfterSettings } from "../../services/dbService";

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [settings, setSettings] = useState<dbBeforeAfterSettings>({
    beforeImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
    afterImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
    useSeparateImages: false
  });

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getBeforeAfterSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const afterImage = settings.afterImage;
  const beforeImage = settings.useSeparateImages ? settings.beforeImage : settings.afterImage;
  const beforeClassName = settings.useSeparateImages
    ? "absolute inset-0 h-full object-cover pointer-events-none"
    : "absolute inset-0 h-full object-cover pointer-events-none filter sepia-[0.35] saturate-[0.4] brightness-[0.5] blur-[0.8px]";

  return (
    <section className="py-24 bg-white text-dark relative border-t border-gray-100" id="before-after">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
            — BEFORE & AFTER —
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-dark">
            See The Real Difference
          </h2>
        </div>

        {/* Interactive Comparison Slider */}
        <div className="max-w-4xl mx-auto relative select-none">
          <div
            ref={containerRef}
            className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* After Image (Full width background) */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={afterImage}
                alt="After Detailing Clean Wash"
                className="w-full h-full object-cover pointer-events-none"
              />
              {/* After label */}
              <div className="absolute right-4 bottom-4 bg-[#F4B400] text-dark font-heading font-extrabold text-xs uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-md z-10">
                After
              </div>
            </div>

            {/* Before Image (Overlay clipped by slider position) */}
            <div
              className="absolute inset-y-0 left-0 h-full overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeImage}
                alt="Before Detailing Dirty"
                className={beforeClassName}
                style={{ width: containerRef.current?.getBoundingClientRect().width || "800px", maxWidth: "none" }}
              />
              {/* Before label */}
              <div className="absolute left-4 bottom-4 bg-black/60 text-white font-heading font-extrabold text-xs uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-md z-10">
                Before
              </div>
            </div>

            {/* Drag Slider Handler line and button */}
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-dark shadow-2xl border-2 border-[#F4B400] flex items-center justify-center cursor-ew-resize">
                <span className="text-[10px] font-black tracking-tighter">⇄</span>
              </div>
            </div>
          </div>

          {/* Prompt instruction text */}
          <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
            <Sparkles size={14} className="text-[#F4B400]" />
            <span>Drag the center bar to slide between Before (Left) & After (Right)</span>
          </div>
        </div>

      </div>
    </section>
  );
}

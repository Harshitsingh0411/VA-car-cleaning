import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [tilt, setTilt] = useState(0);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    // Detect touch-only devices or low-end hardware
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    let animationFrameId: number;
    let lastX = -100;

    const updateMousePosition = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - lastX;
        if (Math.abs(deltaX) > 1) {
          setTilt(Math.max(-15, Math.min(15, deltaX * 1.2)));
        }
        lastX = e.clientX;
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (isTouchDevice || prefersReducedMotion || isLowEnd) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Outer Speed Ring / Glow Aura */}
      <motion.div
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-[#F4B400]/40 bg-[#F4B400]/5 pointer-events-none transform-gpu shadow-[0_0_12px_rgba(244,180,0,0.25)]"
        animate={{
          x: mousePosition.x - 18,
          y: mousePosition.y - 18,
          scale: isHovering ? 1.5 : isClicking ? 0.8 : 1,
          borderColor: isHovering ? "#F4B400" : "rgba(244,180,0,0.35)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.3 }}
      />

      {/* Main Car Shaped Cursor Pointer */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none transform-gpu flex items-center justify-center"
        animate={{
          x: mousePosition.x - 14,
          y: mousePosition.y - 14,
          scale: isHovering ? 1.35 : isClicking ? 0.85 : 1,
          rotate: tilt,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30, mass: 0.2 }}
      >
        <div className="relative flex items-center justify-center w-7 h-7 bg-[#070C16]/90 border border-[#F4B400] rounded-full shadow-[0_0_10px_rgba(244,180,0,0.6)] p-1">
          {/* Detailed Sleek Car Silhouette SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-[#F4B400] drop-shadow-[0_0_4px_rgba(244,180,0,0.8)]"
          >
            {/* Car body path */}
            <path
              d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7.5c-.7 0-1.4.3-1.8.8C4.8 8.7 3.5 10 3.5 10S1.8 10.5 1 11.2C.4 11.7 0 12.4 0 13.2V16c0 .6.4 1 1 1h2"
              fill="#F4B400"
            />
            {/* Car wheels */}
            <circle cx="5.5" cy="16.5" r="2.5" fill="#070C16" stroke="#F4B400" strokeWidth="1.5" />
            <circle cx="16.5" cy="16.5" r="2.5" fill="#070C16" stroke="#F4B400" strokeWidth="1.5" />
            {/* Headlight detail */}
            <path d="M21.5 13h1v2h-1z" fill="#FFF" />
          </svg>

          {/* Glowing Headlight Beam on hover */}
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 0.9, width: 12 }}
              className="absolute -right-3 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-[#F4B400] to-transparent rounded-r-full blur-[1px] pointer-events-none"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}


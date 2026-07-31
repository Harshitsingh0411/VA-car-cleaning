import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    // Detect touch-only devices or low-end hardware
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    let animationFrameId: number;

    const updateMousePosition = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
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
        target.getAttribute("role") === "button"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (isTouchDevice || prefersReducedMotion || isLowEnd) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-[#0D3B8E] rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block transform-gpu"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 2.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30, mass: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#0D3B8E]/50 rounded-full pointer-events-none z-50 hidden md:block transform-gpu"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      />
    </>
  );
}

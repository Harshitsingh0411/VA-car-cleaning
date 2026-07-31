import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    // Disable smooth inertia scrolling if user requests reduced motion
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: isLowEnd ? 0.7 : 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: isLowEnd ? 1 : 1.4,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isLowEnd, prefersReducedMotion]);

  // Reset scroll to top smoothly on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <>{children}</>;
}

import { useState, useEffect } from "react";

export interface PerformanceConfig {
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
  durationMultiplier: number;
  enableParallax: boolean;
  enableBackdropBlur: boolean;
  ease: string | number[];
}

export function usePerformanceMode(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>({
    isLowEnd: false,
    prefersReducedMotion: false,
    durationMultiplier: 1,
    enableParallax: true,
    enableBackdropBlur: true,
    ease: [0.22, 1, 0.36, 1], // Custom smooth cubic-bezier curve
  });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = reducedMotionQuery.matches;

    // Detect hardware limits: logical CPU cores <= 4 or system memory <= 4GB
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
    const isLowEndDevice = cores <= 4 || memory <= 4;

    setConfig({
      isLowEnd: isLowEndDevice || prefersReducedMotion,
      prefersReducedMotion,
      durationMultiplier: prefersReducedMotion ? 0 : isLowEndDevice ? 0.7 : 1,
      enableParallax: !isLowEndDevice && !prefersReducedMotion,
      enableBackdropBlur: !isLowEndDevice,
      ease: [0.22, 1, 0.36, 1],
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setConfig((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
        isLowEnd: isLowEndDevice || e.matches,
        durationMultiplier: e.matches ? 0 : isLowEndDevice ? 0.7 : 1,
      }));
    };

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener("change", handleMotionChange);
    } else {
      reducedMotionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener("change", handleMotionChange);
      } else {
        reducedMotionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  return config;
}

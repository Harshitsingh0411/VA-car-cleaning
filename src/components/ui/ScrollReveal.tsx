import React from "react";
import { motion, Variants } from "framer-motion";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

export type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "fade-in";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  staggerIndex?: number;
  key?: React.Key;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
  staggerIndex = 0,
}: ScrollRevealProps) {
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Calculate adjusted distance and duration for low-end hardware efficiency
  const distance = isLowEnd ? 12 : 28;
  const computedDuration = isLowEnd ? duration * 0.7 : duration;
  const computedDelay = delay + staggerIndex * (isLowEnd ? 0.04 : 0.08);

  const getVariants = (): Variants => {
    switch (variant) {
      case "fade-up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case "fade-down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 },
        };
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: isLowEnd ? 0.96 : 0.92 },
          visible: { opacity: 1, scale: 1 },
        };
      case "fade-in":
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={getVariants()}
      transition={{
        duration: computedDuration,
        delay: computedDelay,
        ease: [0.215, 0.61, 0.355, 1], // Smooth cubic-bezier cubic curve
      }}
      className={`transform-gpu ${className}`}
      style={{
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  );
}

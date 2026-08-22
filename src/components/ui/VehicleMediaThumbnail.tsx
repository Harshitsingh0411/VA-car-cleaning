import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface VehicleMediaThumbnailProps {
  serviceName?: string;
  vehicleDetails?: string;
  vehicleType?: "car" | "bike" | "auto";
  className?: string;
}

export default function VehicleMediaThumbnail({
  serviceName = "",
  vehicleDetails = "",
  vehicleType,
  className = "w-16 h-14"
}: VehicleMediaThumbnailProps) {
  // Determine if it's a bike or a car based on strings
  const combinedText = `${serviceName} ${vehicleDetails} ${vehicleType || ""}`.toLowerCase();

  const isBike =
    vehicleType === "bike" ||
    combinedText.includes("bike") ||
    combinedText.includes("motorcycle") ||
    combinedText.includes("scooter") ||
    combinedText.includes("scooty") ||
    combinedText.includes("twowheeler") ||
    combinedText.includes("two-wheeler") ||
    combinedText.includes("2 wheeler") ||
    combinedText.includes("bullet") ||
    combinedText.includes("activa") ||
    combinedText.includes("pulsar") ||
    combinedText.includes("royal enfield") ||
    combinedText.includes("splendor") ||
    combinedText.includes("jupiter") ||
    combinedText.includes("ktm") ||
    combinedText.includes("apache");

  // Premium Animated Bike Image (high resolution detailing wash render)
  const bikeImageUrl = "https://static.vecteezy.com/system/resources/previews/027/526/205/non_2x/sport-bike-racing-motorcycle-cartoon-illustration-isolated-on-white-background-vector.jpg";

  // Premium Animated Car Image (high resolution care render)
  const carImageUrl = "https://cdnl.iconscout.com/lottie/premium/thumb/running-car-8287933-6621764.gif";

  const selectedImage = isBike ? bikeImageUrl : carImageUrl;
  const label = isBike ? "Bike Detailing" : "Car Detailing";

  return (
    <div className={`relative rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-sm group ${className}`}>
      {/* Animated Background Image */}
      <motion.img
        src={selectedImage}
        alt={label}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full h-full object-cover"
      />

      {/* Glassmorphism & Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

      {/* Micro Floating Animated Badge */}
      <motion.div
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/20"
      >
        <Sparkles size={8} className="text-[#F4B400] animate-pulse" />
        <span className="text-[8px] font-black text-white uppercase tracking-wider">
          {isBike ? "BIKE" : "CAR"}
        </span>
      </motion.div>

      {/* Shine Light Flare Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </div>
  );
}

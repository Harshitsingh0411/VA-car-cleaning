import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";
import { Star, Shield, Car, Users } from "lucide-react";
import { getRealtimeCompanyStats, RealtimeCompanyStats } from "../../services/dbService";

export default function Hero() {
  const [realtimeStats, setRealtimeStats] = useState<RealtimeCompanyStats>({
    carsCleaned: "500+",
    topRating: "4.9",
    satisfaction: "98%",
    teamMembers: "25+",
    totalBookingsCount: 500,
    completedBookingsCount: 500,
    averageRating: 4.9,
    totalReviewsCount: 50,
    activeCrewCount: 25
  });

  useEffect(() => {
    getRealtimeCompanyStats()
      .then(setRealtimeStats)
      .catch((err) => console.warn("Could not sync realtime hero stats:", err));
  }, []);

  const stats = [
    { icon: <Car size={20} className="text-[#F4B400]" />, count: realtimeStats.carsCleaned, label: "Cars Cleaned" },
    { icon: <Star size={20} className="text-[#F4B400] fill-[#F4B400]" />, count: realtimeStats.topRating, label: "Top Rating" },
    { icon: <Shield size={20} className="text-[#F4B400]" />, count: realtimeStats.satisfaction, label: "Satisfaction" },
    { icon: <Users size={20} className="text-[#F4B400]" />, count: realtimeStats.teamMembers, label: "Team Members" },
  ];

  return (
    <section className="relative pt-24 pb-10 md:pt-28 md:pb-12 overflow-hidden bg-[#070C16]">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=2000"
          alt="Premium Detailing Car Wash at Home"
          className="w-full h-full object-cover opacity-70 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070C16] via-[#070C16]/60 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-[#070C16] via-[#070C16]/70 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 gap-8 items-center">
          
          {/* Heading, Copy, Buttons */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-[11px] uppercase block">
                — PREMIUM CAR CARE —
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-heading font-extrabold text-white leading-[1.1] tracking-tight max-w-2xl">
                Professional Car Cleaning<br />
                <span className="text-[#F4B400] font-extrabold">At Your Doorstep</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed font-normal">
                We bring the shine back to your car with premium cleaning & detailing services. 100% water conservation doorstep service.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center gap-3.5"
            >
              <Link to="/book">
                <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-7 py-3 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg shadow-[#F4B400]/20 cursor-pointer">
                  Book Service <span className="ml-1">→</span>
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:border-white/40 font-bold px-7 py-3 h-auto text-xs uppercase tracking-wider rounded-xl cursor-pointer">
                  Apply For Job
                </Button>
              </Link>
            </motion.div>

            {/* Stats row inside capsule container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4 backdrop-blur-md"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-heading font-black text-white leading-none mb-0.5">
                      {stat.count}
                    </h4>
                    <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

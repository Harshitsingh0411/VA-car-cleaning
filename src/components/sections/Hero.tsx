import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";
import { Star, Shield, Car, Users } from "lucide-react";

export default function Hero() {

  const stats = [
    { icon: <Car size={20} className="text-[#F4B400]" />, count: "1000+", label: "Cars Cleaned" },
    { icon: <Star size={20} className="text-[#F4B400] fill-[#F4B400]" />, count: "4.9", label: "Top Rating" },
    { icon: <Shield size={20} className="text-[#F4B400]" />, count: "100%", label: "Satisfaction" },
    { icon: <Users size={20} className="text-[#F4B400]" />, count: "50+", label: "Team Members" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-[#070C16]">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=2000"
          alt="Premium Detailing Car Wash at Home"
          className="w-full h-full object-cover opacity-35 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070C16] via-[#070C16]/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-[#070C16] via-[#070C16]/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 gap-12 items-center">
          
          {/* Heading, Copy, Buttons */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
                — PREMIUM CAR CARE —
              </span>
              <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-white leading-tight tracking-tight">
                Professional Car Cleaning<br />
                <span className="text-[#F4B400]">At Your Doorstep</span>
              </h1>
              <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed">
                We bring the shine back to your car with premium cleaning & detailing services. 100% water conservation doorstep service.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/book">
                <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-sm uppercase tracking-wider rounded-xl border-none shadow-lg shadow-[#F4B400]/25">
                  Book Service <span className="ml-1">→</span>
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:border-white/40 font-bold px-8 py-3.5 h-auto text-sm uppercase tracking-wider rounded-xl">
                  Apply For Job
                </Button>
              </Link>
            </motion.div>

            {/* Stats row inside capsule container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[24px] p-6 max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-6 backdrop-blur-md"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-heading font-black text-white leading-none mb-1">
                      {stat.count}
                    </h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
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

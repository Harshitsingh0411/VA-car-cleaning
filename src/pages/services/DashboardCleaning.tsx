import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Clock, ArrowRight, Eye, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { servicePrices } from "../../lib/prices";

export default function DashboardCleaning() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const steps = [
    { title: "Vent Micro-dusting", desc: "Super-soft detailing brushes extract trapped dust from air vents & seams." },
    { title: "Active pH-Safe Clean", desc: "Wipes vinyl & plastics clean without stripping surface protectants." },
    { title: "UV-Blocker Conditioning", desc: "Applies a premium UV-blocking coat to prevent solar fading and cracks." },
    { title: "Satin Matte Dress", desc: "Dries to a non-sticky satin matte finish that repels static dust." }
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Dashboard Cleaning</span>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Copy & Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest block">— CONSOLE RESTORATION —</span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Dashboard Cleaning</h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Restore the deep rich color of your vinyl dashboard. We clear air vents with micro-dusting brushes, clean steering consoles, and apply premium matte UV blocks to prevent future solar cracking.
              </p>
              <div className="inline-flex items-center gap-3 bg-primary/5 py-2 px-4 rounded-xl border border-primary/10">
                <span className="text-2xl font-black text-primary">{servicePrices.dashboardCleaning.formatted}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Starting From</span>
              </div>
            </div>

            {/* Steps timeline */}
            <div className="space-y-6">
              <h3 className="text-lg font-heading font-extrabold text-dark">Our Process Steps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-5 bg-white border border-gray-100 rounded-2xl relative shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary mb-3">
                      {idx + 1}
                    </div>
                    <h4 className="font-heading font-bold text-dark text-sm mb-1">{step.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Link to="/book" className="inline-block pt-2">
              <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg">
                Book This Service <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          {/* RIGHT: Slider Preview */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-dark flex items-center gap-2">
              <Eye size={18} className="text-primary" />
              Interactive Dashboard Condition
            </h3>

            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              className="relative h-80 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 cursor-ew-resize select-none"
            >
              {/* After: Clean shiny */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800"
                  alt="Shiny car console dash"
                  className="w-full h-full object-cover"
                />
                <div className="absolute right-4 bottom-4 bg-[#F4B400] text-dark font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded shadow">
                  Conditioned
                </div>
              </div>

              {/* Before: Faded */}
              <div
                className="absolute inset-y-0 left-0 h-full overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800"
                  alt="Faded car console dash"
                  className="absolute inset-0 h-full object-cover filter saturate-[0.1] brightness-[0.7] contrast-[0.9]"
                  style={{ width: containerRef.current?.getBoundingClientRect().width || "400px", maxWidth: "none" }}
                />
                <div className="absolute left-4 bottom-4 bg-black/60 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded shadow">
                  Faded Vinyl
                </div>
              </div>

              {/* Handle */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow z-10"
                style={{ left: `${sliderPos}%` }}
              />
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs text-gray-500 leading-relaxed">
              <strong>✨ Note:</strong> Drag your mouse over the panel above. UV solar rays bleach plastic carbon links. Our dashboard dressing replenishes plasticizers to restore original satin black finishes!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Clock, ArrowRight, Eye, Droplet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { servicePrices } from "../../lib/prices";

export default function FoamWash() {
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
    { title: "Snow Foam Cannon Spray", desc: "Coats the vehicle in a thick blanket of hyper-concentrated snow foam." },
    { title: "Active Dirt Emulsifying", desc: "Foam clings to surface for 5 mins, lifting dirt particles safely off paint." },
    { title: "Double-Bucket Glove Wipe", desc: "Safe contact wash with specialized lubricated shampoo grids." },
    { title: "High-Pressure Water Rinse", desc: "Complete clean wash rinse leaving zero residue film behind." }
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      {/* Floating bubbles background animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((b) => (
          <motion.div
            key={b}
            animate={{
              y: [400, -100],
              x: [0, (b % 2 === 0 ? 30 : -30), 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8 + b * 2,
              repeat: Infinity,
              delay: b * 1.5,
              ease: "easeInOut"
            }}
            className="absolute w-8 h-8 rounded-full bg-sky-200/20 border border-white/50"
            style={{
              left: `${b * 15}%`,
              bottom: 0
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Foam Wash</span>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Copy & Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest block">— ACTIVE DIRT SUSPENSION —</span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Foam Wash</h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Experience the safest wash. Thick layers of high-foaming detergents lift and encapsulate abrasive mud particles, allowing them to rinse away without touching the paint directly.
              </p>
              <div className="inline-flex items-center gap-3 bg-primary/5 py-2 px-4 rounded-xl border border-primary/10">
                <span className="text-2xl font-black text-primary">{servicePrices.foamWash.formatted}</span>
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
              Interactive Foam Coverage
            </h3>

            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              className="relative h-80 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 cursor-ew-resize select-none"
            >
              {/* After: Clean shiny */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=800"
                  alt="Foamed car paint clean"
                  className="w-full h-full object-cover"
                />
                <div className="absolute right-4 bottom-4 bg-[#F4B400] text-dark font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded shadow">
                  Rinsed
                </div>
              </div>

              {/* Before: Foamy */}
              <div
                className="absolute inset-y-0 left-0 h-full overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=800"
                  alt="Foamed car paint lather"
                  className="absolute inset-0 h-full object-cover filter saturate-[0.1] brightness-[1.2]"
                  style={{ width: containerRef.current?.getBoundingClientRect().width || "400px", maxWidth: "none" }}
                />
                {/* Simulated suds layout overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)]" />
                <div className="absolute left-4 bottom-4 bg-black/60 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded shadow">
                  Thick Snow Foam
                </div>
              </div>

              {/* Handle */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow z-10"
                style={{ left: `${sliderPos}%` }}
              />
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs text-gray-500 leading-relaxed">
              <strong>✨ Note:</strong> Drag over the car body to see our heavy foam action. Active foam lifts heavy mud so that contact scrubbing never leaves hairline scratch lines!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

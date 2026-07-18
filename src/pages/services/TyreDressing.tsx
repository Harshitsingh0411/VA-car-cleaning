import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Clock, ArrowRight, Eye, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { servicePrices } from "../../lib/prices";

export default function TyreDressing() {
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
    { title: "Sidewall Scrubbing & Degrease", desc: "Dissolves brown road film, blooming oils, and old dressing layers." },
    { title: "Rim Brake Dust Blast", desc: "Rinses metallic brake dust deposits safely using non-acidic cleaners." },
    { title: "High-Gloss Dressing Gel", desc: "Applies a premium silicone gel that bonds to the rubber pore grid." },
    { title: "Slick Hydrophobic Finish", desc: "Forms an outer barrier that repels mud splatter and maintains a wet look." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      {/* Dark Header Top */}
      <div className="bg-[#070C16] pt-24 pb-6 mb-8">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-[#F4B400]">Tyre Dressing</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Copy & Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold text-[11px] uppercase tracking-widest block">— WHEEL CARE EXTRA SHINE —</span>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-dark tracking-tight leading-[1.1]">Tyre Dressing</h1>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                Restore the deep rich, wet-gloss black look of your tyres. We remove blooming brown residues, scrub rim dust, and apply silicone-based dressing layers that seal the rubber pores.
              </p>
              <div className="inline-flex items-center gap-3 bg-primary/5 py-2 px-4 rounded-xl border border-primary/10">
                <span className="text-2xl font-black text-primary">{servicePrices.tyreDressing.formatted}</span>
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
              Interactive Tyre Gloss Restoration
            </h3>

            <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group">
              <img
                src="https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&q=80&w=800"
                alt="Shiny deep-black tire wheel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <div className="absolute left-4 bottom-4 bg-[#F4B400] text-dark font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow">
                ✨ Deep Black Glossy Tyre Dressing
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs text-gray-500 leading-relaxed">
              <strong>✨ Note:</strong> Drag your cursor over the tyre image. Blooming is a natural chemical process that turns tyre rubber brown. Our silicone dressing seals sidewalls to maintain a deep gloss black finish!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

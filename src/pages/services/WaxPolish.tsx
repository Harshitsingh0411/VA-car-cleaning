import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Clock, ArrowRight, ShieldCheck, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { servicePrices } from "../../lib/prices";

export default function WaxPolish() {
  const [triggerhydrophobic, setTriggerHydrophobic] = useState(false);

  const steps = [
    { title: "Clay Bar Decontamination", desc: "Clays surface to lift microscopic embedded particles, iron, and overspray." },
    { title: "Pre-Wax Paint Clean", desc: "Polishes clean to remove light oxidation and ensure absolute bonding." },
    { title: "Carnauba Wax Apply", desc: "Hand-apply high-grade Brazilian carnauba paste wax layers." },
    { title: "Plush Towel Buffing", desc: "Buff to a deep, warm, wet-gloss mirror shine with ultra-soft microfibers." }
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
          <span className="text-primary">Wax Polish</span>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Copy & Steps */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest block">— Hydrophobic GLOSS SEALANTS —</span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Wax Polish</h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Add an intense wet-look mirror gloss and protect your clear coat. Our premium Brazilian carnauba paste wax forms a slick, water-beading shield against UV rays, acid rain, and road dust.
              </p>
              <div className="inline-flex items-center gap-3 bg-primary/5 py-2 px-4 rounded-xl border border-primary/10">
                <span className="text-2xl font-black text-primary">{servicePrices.waxPolish.formatted}</span>
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

          {/* RIGHT: Hydrophobic visualizer */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-dark flex items-center gap-2">
              <Droplets size={18} className="text-primary" />
              Hydrophobic Water-Beading Simulator
            </h3>

            {/* SVG Visualizer */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-80 relative overflow-hidden flex flex-col justify-between items-center text-center">
              
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/40 text-[9px] font-bold text-white uppercase tracking-wider">
                Hydrophobic Protection
              </div>

              {/* Hydrophobic Surface */}
              <div className="my-auto relative w-full h-44 flex flex-col items-center justify-center">
                {/* Surface line */}
                <div className="absolute bottom-10 left-4 right-4 h-1 bg-white/20 rounded-full" />
                <span className="absolute bottom-4 text-[10px] uppercase font-bold text-slate-500">Waxed Paint Shield</span>

                {/* Animated droplets */}
                {triggerhydrophobic ? (
                  <div className="absolute inset-0">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <motion.div
                        key={d}
                        animate={{
                          y: [0, 160],
                          x: [d * 30 + 10, d * 30 + 20, d * 30 + 35],
                          scale: [0.8, 1.2, 0.9],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: d * 0.2,
                          ease: "easeIn"
                        }}
                        className="absolute w-3 h-3.5 rounded-full bg-cyan-400 border border-white"
                        style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs px-6">
                    A coated paint shield prevents water from pooling. Click below to test water-beading release!
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setTriggerHydrophobic(!triggerhydrophobic)}
                className="bg-primary/80 hover:bg-primary text-white border border-primary/20 rounded-xl py-2.5 px-4 font-bold text-xs uppercase tracking-wider z-10 cursor-pointer shadow-md"
              >
                {triggerhydrophobic ? "Stop Simulator" : "Pour Water"}
              </button>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs text-gray-500 leading-relaxed">
              <strong>✨ Note:</strong> Brazilian carnauba paste wax fills microscopic paint pockets. This forces water to bead up into tight droplets and slide off immediately, preventing hard-water stains.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

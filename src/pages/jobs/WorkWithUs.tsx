import React from "react";
import { motion } from "motion/react";
import { Users, Compass, Award, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function WorkWithUs() {
  const steps = [
    { title: "Apprentice Trainee", desc: "4-week detox training academy. Learn detailing tools, paint mechanics, and client communication." },
    { title: "Detailing Technician", desc: "Start dispatching doorstep wash rides. Build detailing skills and earn commissions." },
    { title: "Master Detailer", desc: "Handle premium detailing packages (paint claying, 9H ceramic coatings) at high rates." },
    { title: "Franchise Partner", desc: "Manage your local district crew, fleet vehicles, and doorstep operations." }
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl space-y-16">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/jobs" className="hover:text-primary transition-colors">Careers</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Work With Us</span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block">— COMPANY CULTURE —</span>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Work With Us</h1>
            <p className="text-gray-600 text-base leading-relaxed">
              We are building the future of mobile car & bike detailing. We believe in providing vocational growth, technical knowledge, safety compliance, and a friendly, supportive environment for all.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link to="/jobs/apply">
              <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg">
                Join Our Crew <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Career Growth Roadmap */}
        <div className="space-y-8">
          <h3 className="text-2xl font-heading font-extrabold text-dark text-center">Your Detailing Career Path</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200" />

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 relative shadow-sm text-center flex flex-col items-center justify-between"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center font-bold text-sm shadow-md mb-4 relative z-10">
                  {idx + 1}
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading font-bold text-dark text-sm">{step.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Culture statement cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <h4 className="font-heading font-bold text-dark text-lg">Supportive Crew Family</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              We aren't just details; we are a family. Our local coordinators assist detailers, manage travel schedules, and support you on site when dealing with complex paint issues.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Compass size={20} />
            </div>
            <h4 className="font-heading font-bold text-dark text-lg">Vocational Pride</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              We teach vocational skills that remain high-paying for life. Detailing dual-action polishers, chemical compositions, and leather conditioning are high-demand technician careers.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Award, Users, Droplets, Sparkles, ShieldCheck, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { getRealtimeCompanyStats, RealtimeCompanyStats } from "../../services/dbService";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

const features = [
  { label: "Eco Friendly Products", icon: <Droplets size={16} className="text-[#0D3B8E]" /> },
  { label: "Quick & Efficient Service", icon: <Sparkles size={16} className="text-[#0D3B8E]" /> },
  { label: "100% Satisfaction Guarantee", icon: <ShieldCheck size={16} className="text-[#0D3B8E]" /> },
  { label: "Trained & Verified Professionals", icon: <Users size={16} className="text-[#0D3B8E]" /> },
  { label: "Advanced Cleaning Equipment", icon: <ClipboardCheck size={16} className="text-[#0D3B8E]" /> }
];

const jobsChecklist = [
  "5-6 Hours of Work",
  "₹4500 - ₹5000 Monthly",
  "Incentives & Bonus",
  "Flexible Timing",
  "Friendly Team Environment"
];

export default function JobOpportunity() {
  const [realtimeStats, setRealtimeStats] = useState<RealtimeCompanyStats>({
    carsCleaned: "1000+",
    topRating: "4.9",
    satisfaction: "100%",
    teamMembers: "50+",
    totalBookingsCount: 0,
    completedBookingsCount: 0,
    averageRating: 4.9,
    totalReviewsCount: 0,
    activeCrewCount: 0
  });

  const { isLowEnd } = usePerformanceMode();

  useEffect(() => {
    getRealtimeCompanyStats().then(setRealtimeStats).catch(console.warn);
  }, []);

  const stats = [
    { count: realtimeStats.carsCleaned, label: "Cars Cleaned", icon: <Award size={20} className="text-[#F4B400]" /> },
    { count: `${realtimeStats.completedBookingsCount}+`, label: "Happy Customers", icon: <ShieldCheck size={20} className="text-[#F4B400]" /> },
    { count: realtimeStats.teamMembers, label: "Team Members", icon: <Users size={20} className="text-[#F4B400]" /> },
  ];

  return (
    <section className="py-24 bg-white text-dark relative border-t border-gray-100" id="jobs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN: Achievements */}
          <div className="lg:col-span-6 space-y-10">
            <ScrollReveal variant="fade-up">
              <div className="space-y-4">
                <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
                  — OUR ACHIEVEMENTS —
                </span>
                <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">
                  We Take Pride In Our Work
                </h2>
              </div>
            </ScrollReveal>

            {/* Achievements Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <ScrollReveal key={i} variant="fade-up" staggerIndex={i}>
                  <motion.div
                    whileHover={{ y: isLowEnd ? 0 : -3 }}
                    className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow transform-gpu"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F4B400]/10 flex items-center justify-center shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-heading font-black text-dark leading-none mb-1">
                        {stat.count}
                      </h4>
                      <p className="text-xs font-semibold text-gray-500">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            {/* Trust Badges Banner */}
            <ScrollReveal variant="fade-up" delay={0.2}>
              <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-y-4 gap-x-6 text-xs font-bold text-gray-600">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0D3B8E]/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT COLUMN: Part-Time Job Card */}
          <div className="lg:col-span-6">
            <ScrollReveal variant="slide-left" delay={0.15}>
              <motion.div
                whileHover={{ scale: isLowEnd ? 1 : 1.01 }}
                className="bg-[#0B1220] border-2 border-[#F4B400]/30 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl transform-gpu"
              >
                {/* Grid map trace inside card */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start">

                  {/* Job Info Checklist */}
                  <div className="space-y-6 flex-1">
                    <div>
                      <span className="text-[#F4B400] text-xs font-bold uppercase tracking-widest block mb-1">
                        — PART-TIME JOB OPPORTUNITY —
                      </span>
                      <h3 className="text-2xl font-heading font-extrabold tracking-tight text-white">
                        Earn Extra Income
                      </h3>
                    </div>

                    <ul className="space-y-3 text-sm">
                      {jobsChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-gray-300">
                          <CheckCircle size={16} className="text-[#F4B400] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/jobs" className="block pt-2">
                      <motion.div whileHover={{ scale: isLowEnd ? 1 : 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Button className="w-full md:w-auto bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg cursor-pointer transform-gpu transition-all">
                          Apply Now
                        </Button>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Detailing Partner Picture Block */}
                  <div className="w-full md:w-44 h-56 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/5 relative">
                    <img
                      src="https://thumbs.dreamstime.com/b/cheerful-cartoon-boy-diligently-washes-dark-colored-suv-hose-bucket-soapy-water-cartoon-boy-washing-car-369051625.jpg?w=768"
                      alt="Detailing Partner Job"
                      className="w-full h-full object-cover object-top filter saturate-[0.8]"
                    />
                    <div className="absolute inset-0 bg-[#0D3B8E]/20 mix-blend-overlay" />
                  </div>

                </div>
              </motion.div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}

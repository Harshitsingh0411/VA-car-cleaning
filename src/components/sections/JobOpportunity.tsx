import { motion } from "motion/react";
import { CheckCircle, Award, Users, MapPin, Sparkles, Droplets, ShieldCheck, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const stats = [
  { count: "1000+", label: "Cars Cleaned", icon: <Award size={20} className="text-[#F4B400]" /> },
  { count: "500+", label: "Happy Customers", icon: <ShieldCheck size={20} className="text-[#F4B400]" /> },
  { count: "50+", label: "Team Members", icon: <Users size={20} className="text-[#F4B400]" /> },
  { count: "10+", label: "Cities We Serve", icon: <MapPin size={20} className="text-[#F4B400]" /> }
];

const features = [
  { label: "Eco Friendly Products", icon: <Droplets size={16} className="text-primary" /> },
  { label: "Quick & Efficient Service", icon: <Sparkles size={16} className="text-primary" /> },
  { label: "100% Satisfaction Guarantee", icon: <ShieldCheck size={16} className="text-primary" /> },
  { label: "Trained & Verified Professionals", icon: <Users size={16} className="text-primary" /> },
  { label: "Advanced Cleaning Equipment", icon: <ClipboardCheck size={16} className="text-primary" /> }
];

const jobsChecklist = [
  "5-6 Hours of Work",
  "₹4500 - ₹5000 Monthly",
  "Incentives & Bonus",
  "Flexible Timing",
  "Friendly Team Environment"
];

export default function JobOpportunity() {
  return (
    <section className="py-24 bg-white text-dark relative border-t border-gray-100" id="jobs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: Achievements */}
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-4">
              <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
                — OUR ACHIEVEMENTS —
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">
                We Take Pride In Our Work
              </h2>
            </div>

            {/* Achievements Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
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
                </div>
              ))}
            </div>

            {/* Trust Badges Banner */}
            <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-y-4 gap-x-6 text-xs font-bold text-gray-600">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Part-Time Job Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#0B1220] border-2 border-[#F4B400]/30 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
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
                    <Button className="w-full md:w-auto bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg">
                      Apply Now
                    </Button>
                  </Link>
                </div>

                {/* Detailing Partner Picture Block */}
                <div className="w-full md:w-44 h-56 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/5 relative">
                  <img
                    src="https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=600"
                    alt="Detailing Partner Job"
                    className="w-full h-full object-cover object-top filter saturate-[0.8]"
                  />
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

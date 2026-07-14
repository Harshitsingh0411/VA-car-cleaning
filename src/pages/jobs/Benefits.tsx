import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Award, Clock, DollarSign, Heart, Shield, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

// Component for a 3D-tilting benefit card
function BenefitCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode; key?: React.Key }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const rotateX = useTransform(cardY, [-100, 100], [10, -10]);
  const rotateY = useTransform(cardX, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    cardX.set(mouseX);
    cardY.set(mouseY);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
      >
        <div style={{ transform: "translateZ(30px)" }} className="relative z-10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            {icon}
          </div>
          <h3 className="font-heading font-extrabold text-dark text-lg">{title}</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Benefits() {
  const benefitsList = [
    {
      title: "Detailing Academy Course",
      desc: "Free comprehensive technical training course teaching dual-action buffing, paint sealant, leather conditioning, and detailing chemistry.",
      icon: <Award size={24} />
    },
    {
      title: "Flexible Timing Slots",
      desc: "Shift allocations built specifically around college schedules, exam dates, or freelance detailing commitments.",
      icon: <Clock size={24} />
    },
    {
      title: "High Earning Commissions",
      desc: "Earn ₹4500-₹5000 monthly base salary with extra incentive commissions for high-grade ceramic coatings or fleet detailing.",
      icon: <DollarSign size={24} />
    },
    {
      title: "Professional Uniform Kit",
      desc: "Look like a master detailing craftsman. We provide branded VA black polo shirts, caps, safety boots, and goggles.",
      icon: <Shield size={24} />
    },
    {
      title: "Fuel & Travel Allowance",
      desc: "Dedicated travel compensation paid per doorstep wash ride, ensuring your vehicle costs are fully compensated.",
      icon: <Heart size={24} />
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/jobs" className="hover:text-primary transition-colors">Careers</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Benefits</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-primary font-bold text-xs uppercase tracking-widest block">— WORK PARTNER PERKS —</span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Detailing Benefits</h1>
          <p className="text-gray-600 text-sm">
            We value our detailing crew. We invest in free vocational technical training, safety kits, and commissions to build careers.
          </p>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsList.map((item, idx) => (
            <BenefitCard key={idx} title={item.title} desc={item.desc} icon={item.icon} />
          ))}
        </div>

        {/* Apply Call to Action */}
        <div className="bg-[#0B1220] border border-white/5 rounded-3xl p-8 text-center text-white space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-heading font-extrabold text-[#F4B400]">Ready to Join the Shiners?</h3>
            <p className="text-gray-300 text-xs max-w-md mx-auto leading-relaxed">
              Become a certified doorstep cleaning partner today. Zero previous experience required—we train you from scratch!
            </p>
            <Link to="/jobs/apply" className="inline-block pt-2">
              <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg">
                Apply For Slot <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

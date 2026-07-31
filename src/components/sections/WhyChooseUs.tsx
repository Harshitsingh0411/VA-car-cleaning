import { motion } from "framer-motion";
import { Users, Award, ShieldCheck, MapPin, BadgePercent } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

const features = [
  {
    icon: <Users className="text-[#F4B400]" size={24} />,
    title: "Professional Team",
    description: "Trained & experienced cleaning experts"
  },
  {
    icon: <Award className="text-[#F4B400]" size={24} />,
    title: "Premium Products",
    description: "High quality products for best results"
  },
  {
    icon: <MapPin className="text-[#F4B400]" size={24} />,
    title: "Doorstep Service",
    description: "We come to you, save your time"
  },
  {
    icon: <BadgePercent className="text-[#F4B400]" size={24} />,
    title: "Affordable Price",
    description: "Best service at reasonable price"
  },
  {
    icon: <ShieldCheck className="text-[#F4B400]" size={24} />,
    title: "Satisfaction Guarantee",
    description: "100% customer satisfaction"
  }
];

export default function WhyChooseUs() {
  const { isLowEnd } = usePerformanceMode();

  return (
    <section className="py-24 bg-[#070C16] text-white border-t border-white/5 relative" id="why-choose-us">
      {/* Abstract blur backdrop */}
      {!isLowEnd && (
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Block */}
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
              — WHY CHOOSE US —
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight">
              Why We Are The Best Choice
            </h2>
          </div>
        </ScrollReveal>

        {/* 5 Column Grid Card layouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={index} variant="fade-up" staggerIndex={index}>
              <motion.div
                whileHover={{ y: isLowEnd ? -2 : -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 text-center hover:border-[#F4B400]/40 hover:bg-[#0B1220]/80 transition-all duration-300 group shadow-lg h-full transform-gpu"
              >
                {/* Circular yellow-accented Icon container */}
                <div className="w-12 h-12 rounded-full bg-[#F4B400]/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-base font-heading font-extrabold tracking-tight mb-2 text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-xs leading-relaxed max-w-[170px] mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}

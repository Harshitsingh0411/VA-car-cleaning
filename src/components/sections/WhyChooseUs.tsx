import { motion } from "framer-motion";
import { Users, Award, ShieldCheck, MapPin, BadgePercent } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

const features = [
  {
    icon: Users,
    title: "Professional Team",
    description: "Trained & experienced cleaning experts"
  },
  {
    icon: Award,
    title: "Premium Products",
    description: "High quality products for best results"
  },
  {
    icon: MapPin,
    title: "Doorstep Service",
    description: "We come to you, save your time"
  },
  {
    icon: BadgePercent,
    title: "Affordable Price",
    description: "Best service at reasonable price"
  },
  {
    icon: ShieldCheck,
    title: "Satisfaction Guarantee",
    description: "100% customer satisfaction"
  }
];

export default function WhyChooseUs() {
  const { isLowEnd } = usePerformanceMode();

  return (
    <section className="py-6 sm:py-14 md:py-20 bg-[#070C16] text-white border-t border-white/5 relative" id="why-choose-us">
      {/* Abstract blur backdrop */}
      {!isLowEnd && (
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      )}

      <div className="container mx-auto px-2 sm:px-4 md:px-6 relative z-10">
        
        {/* Header Block */}
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 md:mb-14 space-y-1.5 sm:space-y-2 md:space-y-4">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-[10px] sm:text-xs uppercase block">
              — WHY CHOOSE US —
            </span>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-heading font-extrabold tracking-tight">
              Why We Are The Best Choice
            </h2>
          </div>
        </ScrollReveal>

        {/* 5 Cards Grid - All 5 visible on single line on smartphone */}
        <div className="grid grid-cols-5 gap-1 xs:gap-2 sm:gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={index}
                variant="fade-up"
                staggerIndex={index}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: isLowEnd ? -2 : -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-[#0B1220] border border-white/5 rounded-lg xs:rounded-xl sm:rounded-2xl p-1.5 xs:p-2 sm:p-4 md:p-6 text-center hover:border-[#F4B400]/40 hover:bg-[#0B1220]/80 transition-all duration-300 group shadow-lg h-full transform-gpu flex flex-col justify-between"
                >
                  {/* Circular yellow-accented Icon container */}
                  <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#F4B400]/10 flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <Icon className="text-[#F4B400] w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[9px] xs:text-[11px] sm:text-sm md:text-base font-heading font-extrabold tracking-tight mb-0.5 sm:mb-2 text-white leading-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 text-[7.5px] xs:text-[9px] sm:text-xs leading-tight sm:leading-relaxed mx-auto">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}


import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Sparkles, CheckCircle } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

const steps = [
  {
    icon: <CalendarCheck size={32} />,
    title: "Book Service",
    description: "Choose your preferred service, date, and time through our easy booking system."
  },
  {
    icon: <MapPin size={32} />,
    title: "We Arrive",
    description: "Our professional team arrives at your location fully equipped and on time."
  },
  {
    icon: <Sparkles size={32} />,
    title: "We Clean",
    description: "We perform the selected premium cleaning and detailing services with care."
  },
  {
    icon: <CheckCircle size={32} />,
    title: "You Smile",
    description: "Inspect your sparkling clean car. Satisfaction guaranteed."
  }
];

export default function HowItWorks() {
  const { isLowEnd } = usePerformanceMode();

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#0D3B8E] font-semibold tracking-wider uppercase text-sm mb-4 block">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-dark mb-6">
              How It Works
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200" />

          {steps.map((step, index) => (
            <ScrollReveal key={index} variant="fade-up" staggerIndex={index}>
              <motion.div
                whileHover={{ y: isLowEnd ? 0 : -4 }}
                className="relative flex flex-col items-center text-center group transform-gpu"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 shadow-xl flex items-center justify-center mb-6 relative z-10 group-hover:border-[#0D3B8E] group-hover:text-[#0D3B8E] transition-all duration-300">
                  <div className="absolute inset-0 bg-[#0D3B8E]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0F172A] text-white rounded-full flex items-center justify-center font-bold font-heading text-sm shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold font-heading text-dark mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

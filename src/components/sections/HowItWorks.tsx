import { motion } from "motion/react";
import { CalendarCheck, MapPin, Sparkles, CheckCircle } from "lucide-react";

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
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
          >
            Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold text-dark mb-6"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-white rounded-full border-4 border-light shadow-xl flex items-center justify-center mb-6 relative z-10 group-hover:border-primary group-hover:text-primary transition-colors">
                <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-dark text-white rounded-full flex items-center justify-center font-bold font-heading text-sm shadow-md">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold font-heading text-dark mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

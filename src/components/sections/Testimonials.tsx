import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Amazing service! My car looks brand new. The team was punctual, extremely professional, and left absolutely no water mess in my driveway.",
    name: "Rahul Sharma",
    role: "Verified Customer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    text: "Loved the doorstep chain cleaning and polishing for my premium superbike. Highly recommended for any bike enthusiast who wants showroom care at home.",
    name: "Arjun Mehta",
    role: "Verified Bike Owner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 3,
    text: "The double-bucket system they use is fantastic. Zero swirl marks on my black luxury SUV, and the interior dashboard conditioning smells incredibly fresh.",
    name: "Pooja Malhotra",
    role: "Verified SUV Owner",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-[#070C16] text-white relative border-t border-white/5" id="testimonials">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
            — TESTIMONIALS —
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel Block */}
        <div className="max-w-4xl mx-auto relative px-12">
          
          {/* Main Card Container */}
          <div className="bg-[#0B1220] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative min-h-[250px] flex flex-col justify-between">
            {/* Big quote mark graphic */}
            <div className="absolute top-6 left-6 text-7xl font-serif text-[#F4B400]/10 select-none pointer-events-none">
              “
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 5 Rating Stars */}
                <div className="flex gap-1 text-[#F4B400]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="fill-[#F4B400]" />
                  ))}
                </div>

                {/* Review Message Quote */}
                <p className="text-gray-300 text-base md:text-lg italic leading-relaxed">
                  "{testimonials[index].text}"
                </p>

                {/* Reviewer Details */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={testimonials[index].avatar}
                      alt={testimonials[index].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-extrabold text-white leading-none">
                      {testimonials[index].name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      {testimonials[index].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 hover:bg-[#F4B400] hover:text-dark border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 hover:bg-[#F4B400] hover:text-dark border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicator Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  index === idx ? "bg-[#F4B400] w-6" : "bg-white/20 hover:bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

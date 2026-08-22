import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllReviews } from "../../services/dbService";
import { useImageLightbox } from "../../context/ImageLightboxContext";
import { isLocalBlobUrl } from "../../utils/mediaUtils";
import { getCartoonAvatar, handleAvatarError } from "../../utils/avatar";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";
import GlassImage from "../ui/GlassImage";

interface DisplayTestimonial {
  id: string;
  text: string;
  name: string;
  role: string;
  avatar: string;
  stars: number;
  images?: string[];
  videos?: string[];
}

const defaultTestimonials: DisplayTestimonial[] = [
  {
    id: "default-1",
    text: "VA Car Cleaning transformed my vehicle! The interior detailing brought back that brand-new showroom smell and shine. Highly recommended!",
    name: "Alex Rivera",
    role: "Verified Customer (Full Interior Detailing)",
    avatar: getCartoonAvatar("Alex Rivera"),
    stars: 5,
  },
  {
    id: "default-2",
    text: "Exceptional service and extreme attention to detail. The ceramic coating and exterior polish made my paint look completely mirror-finish.",
    name: "Sarah Jenkins",
    role: "Verified Customer (Paint Correction & Ceramic)",
    avatar: getCartoonAvatar("Sarah Jenkins"),
    stars: 5,
  },
  {
    id: "default-3",
    text: "Super easy booking process and punctual professional technicians. They removed stubborn stains effortlessly.",
    name: "Michael Chen",
    role: "Verified Customer (Express Care)",
    avatar: getCartoonAvatar("Michael Chen"),
    stars: 5,
  },
];

export default function Testimonials() {
  const { openLightbox } = useImageLightbox();
  const [testimonials, setTestimonials] = useState<DisplayTestimonial[]>(defaultTestimonials);
  const [index, setIndex] = useState(0);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    async function loadLiveReviews() {
      try {
        const liveRevs = await getAllReviews();
        if (liveRevs && liveRevs.length > 0) {
          const mapped: DisplayTestimonial[] = liveRevs.map((r, i) => ({
            id: r.id || `live-${i}`,
            text: r.review,
            name: r.customerName || "Happy Customer",
            role: r.serviceName ? `Verified Customer (${r.serviceName})` : "Verified Customer",
            avatar: getCartoonAvatar(r.customerName || r.customerId),
            stars: r.stars || 5,
            images: r.images,
            videos: r.videos
          }));
          setTestimonials(mapped);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      }
    }
    loadLiveReviews();
  }, []);

  const handleNext = () => {
    if (!testimonials.length) return;
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (!testimonials.length) return;
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index] || testimonials[0];

  if (!current) {
    return null;
  }

  return (
    <section className="py-24 bg-[#070C16] text-white relative border-t border-white/5" id="testimonials">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header Block */}
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
              — VERIFIED REVIEWS —
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
              What Our Customers Say
            </h2>
          </div>
        </ScrollReveal>

        {/* Carousel Block */}
        <div className="max-w-4xl mx-auto relative px-12">

          {/* Main Card Container */}
          <ScrollReveal variant="scale-up" delay={0.1}>
            <div className="bg-[#0B1220] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative min-h-[280px] flex flex-col justify-between transform-gpu">
              {/* Big quote mark graphic */}
              <div className="absolute top-6 left-6 text-7xl font-serif text-[#F4B400]/10 select-none pointer-events-none">
                “
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id || index}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : isLowEnd ? 10 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReducedMotion ? 0 : isLowEnd ? -10 : -20 }}
                  transition={{ duration: prefersReducedMotion ? 0 : isLowEnd ? 0.2 : 0.3 }}
                  className="space-y-6"
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 text-[#F4B400]">
                    {Array.from({ length: current?.stars || 5 }).map((_, s) => (
                      <Star key={s} size={18} className="fill-[#F4B400]" />
                    ))}
                  </div>

                  {/* Review Message Quote */}
                  <p className="text-gray-200 text-base md:text-lg italic leading-relaxed">
                    "{current.text}"
                  </p>

                  {/* Customer Uploaded Photos/Videos attachments */}
                  {(current.images?.length || current.videos?.length) ? (
                    <div className="flex gap-3 pt-2 overflow-x-auto">
                      {current.images?.map((imgUrl, i) => (
                        <motion.button
                          whileHover={{ scale: isLowEnd ? 1 : 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          key={i}
                          type="button"
                          onClick={() => openLightbox({ url: imgUrl, type: "image", title: `Review Photo by ${current.name}` })}
                          className="shrink-0 cursor-pointer group relative overflow-hidden rounded-xl border border-white/15 transform-gpu"
                        >
                          <GlassImage src={imgUrl} alt={`Photo by ${current.name}`} className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-300" containerClassName="w-16 h-16" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                            View
                          </div>
                        </motion.button>
                      ))}
                      {current.videos?.map((vidUrl, i) => (
                        <motion.button
                          whileHover={{ scale: isLowEnd ? 1 : 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          key={i}
                          type="button"
                          onClick={() => openLightbox({ url: vidUrl, type: "video", title: `Review Video by ${current.name}` })}
                          className="shrink-0 cursor-pointer group relative overflow-hidden rounded-xl border border-white/15 bg-black transform-gpu"
                        >
                          {!isLocalBlobUrl(vidUrl) ? (
                            <video src={vidUrl} className="w-24 h-16 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-24 h-16 bg-gray-900 flex items-center justify-center text-amber-400 text-[9px] font-bold p-1 text-center">
                              Local Clip
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-8 h-8 rounded-full bg-[#F4B400] text-dark flex items-center justify-center font-bold text-xs shadow-md">
                              ▶
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : null}

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5">
                      <GlassImage
                        src={current.avatar}
                        onError={(e) => handleAvatarError(e, current.name)}
                        alt={current.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-white leading-none">
                        {current.name}
                      </h4>
                      <p className="text-[10px] text-[#F4B400] font-bold uppercase tracking-wider mt-1">
                        {current.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollReveal>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: isLowEnd ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 hover:bg-[#F4B400] hover:text-dark border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer z-10 transform-gpu"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: isLowEnd ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 hover:bg-[#F4B400] hover:text-dark border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer z-10 transform-gpu"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </motion.button>

          {/* Indicator Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${index === idx ? "bg-[#F4B400] w-6" : "bg-white/20 hover:bg-white/30"
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

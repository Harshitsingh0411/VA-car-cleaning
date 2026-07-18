import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronLeft, ChevronRight, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { getAllReviews, dbReview } from "../../services/dbService";
import { getCartoonAvatar, handleAvatarError } from "../../utils/avatar";

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
    id: "t1",
    text: "Amazing service! My car looks brand new. The team was punctual, extremely professional, and left absolutely no water mess in my driveway.",
    name: "Rahul Sharma",
    role: "Verified Car Owner",
    avatar: getCartoonAvatar("Rahul Sharma"),
    stars: 5
  },
  {
    id: "t2",
    text: "Loved the doorstep chain cleaning and polishing for my premium superbike. Highly recommended for any bike enthusiast who wants showroom care at home.",
    name: "Arjun Mehta",
    role: "Verified Bike Owner",
    avatar: getCartoonAvatar("Arjun Mehta"),
    stars: 5
  },
  {
    id: "t3",
    text: "The double-bucket system they use is fantastic. Zero swirl marks on my black luxury SUV, and the interior dashboard conditioning smells incredibly fresh.",
    name: "Pooja Malhotra",
    role: "Verified SUV Owner",
    avatar: getCartoonAvatar("Pooja Malhotra"),
    stars: 5
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<DisplayTestimonial[]>(defaultTestimonials);
  const [index, setIndex] = useState(0);

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
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index] || testimonials[0];

  return (
    <section className="py-24 bg-[#070C16] text-white relative border-t border-white/5" id="testimonials">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
            — VERIFIED REVIEWS —
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel Block */}
        <div className="max-w-4xl mx-auto relative px-12">

          {/* Main Card Container */}
          <div className="bg-[#0B1220] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative min-h-[280px] flex flex-col justify-between">
            {/* Big quote mark graphic */}
            <div className="absolute top-6 left-6 text-7xl font-serif text-[#F4B400]/10 select-none pointer-events-none">
              “
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 text-[#F4B400]">
                  {Array.from({ length: current.stars || 5 }).map((_, s) => (
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
                      <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={imgUrl} alt="Review photo" className="w-16 h-16 rounded-xl object-cover border border-white/15 hover:scale-105 transition-transform" />
                      </a>
                    ))}
                    {current.videos?.map((vidUrl, i) => (
                      <video key={i} src={vidUrl} controls className="w-24 h-16 rounded-xl object-cover border border-white/15 bg-black shrink-0" />
                    ))}
                  </div>
                ) : null}

                {/* Reviewer Details */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5">
                    <img
                      src={current.avatar}
                      onError={(e) => handleAvatarError(e, current.name)}
                      alt={current.name}
                      className="w-full h-full object-cover"
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

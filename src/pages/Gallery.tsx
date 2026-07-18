import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Star, Sparkles, X, Filter, Video as VideoIcon, CheckCircle2, Shield } from "lucide-react";
import { getAllReviews, dbReview } from "../services/dbService";

interface GalleryItem {
  id: string;
  url: string;
  type: "image" | "video";
  category: "customer" | "exterior" | "interior" | "shine";
  title: string;
  rating?: number;
  serviceName?: string;
}

const defaultShowcaseItems: GalleryItem[] = [
  {
    id: "s1",
    url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
    type: "image",
    category: "exterior",
    title: "Eco Foam Exterior Wash Gloss",
    rating: 5,
    serviceName: "Exterior Wash"
  },
  {
    id: "s2",
    url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1200",
    type: "image",
    category: "shine",
    title: "Mirror Paint Hydrophobic Wax",
    rating: 5,
    serviceName: "Wax Polish"
  },
  {
    id: "s3",
    url: "https://images.unsplash.com/photo-1507136566006-cfc505b114fe?auto=format&fit=crop&q=80&w=1200",
    type: "image",
    category: "interior",
    title: "Deep Cabin Disinfection & Polish",
    rating: 5,
    serviceName: "Interior Cleaning"
  },
  {
    id: "s4",
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200",
    type: "image",
    category: "shine",
    title: "Windshield Rain-Repellent Coating",
    rating: 5,
    serviceName: "Glass Polish"
  },
  {
    id: "s5",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
    type: "image",
    category: "exterior",
    title: "Rim Brake-Dust Blast & Tyre Dressing",
    rating: 5,
    serviceName: "Tyre Dressing"
  }
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(defaultShowcaseItems);
  const [activeFilter, setActiveFilter] = useState<"all" | "customer" | "exterior" | "interior" | "shine">("all");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchCustomerMedia() {
      try {
        const reviews = await getAllReviews();
        const userUploadedItems: GalleryItem[] = [];

        reviews.forEach((r: dbReview, index: number) => {
          // Process uploaded images - STRICT PRIVACY: User details are hidden
          if (r.images && r.images.length > 0) {
            r.images.forEach((imgUrl, imgIdx) => {
              if (imgUrl) {
                userUploadedItems.push({
                  id: `user-img-${r.id}-${imgIdx}`,
                  url: imgUrl,
                  type: "image",
                  category: "customer",
                  title: r.serviceName ? `Verified Customer (${r.serviceName})` : "Verified Doorstep Wash Result",
                  rating: r.stars || 5,
                  serviceName: r.serviceName || "Doorstep Detailing"
                });
              }
            });
          }

          // Process uploaded videos - STRICT PRIVACY: User details are hidden
          if (r.videos && r.videos.length > 0) {
            r.videos.forEach((vidUrl, vidIdx) => {
              if (vidUrl) {
                userUploadedItems.push({
                  id: `user-vid-${r.id}-${vidIdx}`,
                  url: vidUrl,
                  type: "video",
                  category: "customer",
                  title: r.serviceName ? `Customer Video (${r.serviceName})` : "Doorstep Detailing Clip",
                  rating: r.stars || 5,
                  serviceName: r.serviceName || "Mobile Detailing"
                });
              }
            });
          }
        });

        if (userUploadedItems.length > 0) {
          setItems([...userUploadedItems, ...defaultShowcaseItems]);
        }
      } catch (err) {
        console.error("Failed to load customer review gallery media:", err);
      }
    }

    fetchCustomerMedia();
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.category === activeFilter;
  });

  const customerItemCount = items.filter((i) => i.category === "customer").length;

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-[11px] mb-2 block"
          >
            Showroom Detailing Gallery
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold max-w-3xl mx-auto leading-[1.1] tracking-tight mb-3"
          >
            Real Customer Wash Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Explore real doorstep detailing transformations and verified customer uploaded review photos.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            All Works ({items.length})
          </button>

          <button
            onClick={() => setActiveFilter("customer")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "customer"
                ? "bg-amber-500 text-white shadow-md"
                : "bg-white text-amber-600 hover:bg-amber-50 border border-amber-100"
            }`}
          >
            <Camera size={13} />
            Verified Customer Uploads ({customerItemCount})
          </button>

          <button
            onClick={() => setActiveFilter("exterior")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "exterior"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            Exterior Wash
          </button>

          <button
            onClick={() => setActiveFilter("interior")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "interior"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            Interior Cleaning
          </button>

          <button
            onClick={() => setActiveFilter("shine")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "shine"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            Wax & Gloss Polish
          </button>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 text-center max-w-2xl mx-auto flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
          <Shield size={16} className="text-emerald-600 shrink-0" />
          <span>Customer Privacy Protection: All review photo uploads showcase vehicle detailing quality while personal user details are strictly hidden.</span>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMedia(item)}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                {item.type === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {item.category === "customer" && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified Customer Upload
                  </span>
                )}

                {item.type === "video" && (
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <VideoIcon size={12} /> Video Clip
                  </span>
                )}
              </div>

              <div className="p-5 flex justify-between items-center bg-white border-t border-gray-50">
                <div>
                  <h4 className="font-heading font-extrabold text-dark text-sm truncate">{item.title}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.serviceName || "Detailing Service"}</span>
                </div>

                <div className="flex text-[#F4B400] gap-0.5 items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                  <Star size={12} className="fill-[#F4B400]" />
                  <span className="text-[10px] font-black text-dark">{item.rating || 5}.0</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Media Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-50 bg-dark/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="bg-black aspect-video flex items-center justify-center">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.url} controls autoPlay className="max-h-[70vh] w-full object-contain" />
                ) : (
                  <img src={selectedMedia.url} alt={selectedMedia.title} className="max-h-[70vh] w-full object-contain" />
                )}
              </div>

              <div className="p-6 bg-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      User Details Protected
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{selectedMedia.serviceName}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-dark text-lg">{selectedMedia.title}</h3>
                </div>

                <div className="flex text-[#F4B400] gap-1 items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                  <Star size={16} className="fill-[#F4B400]" />
                  <span className="text-xs font-black text-dark">{selectedMedia.rating || 5}.0 Verified Result</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

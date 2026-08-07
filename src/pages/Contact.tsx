import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Send,
  Sparkles,
  Car,
  Compass,
  CheckCircle,
  AlertCircle,
  Droplet,
  ShieldCheck,
  Smartphone,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  Navigation,
  Shield,
  ExternalLink
} from "lucide-react";
import { getContactSettings, dbContactSettings, DEFAULT_CONTACT_SETTINGS } from "../services/dbService";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "../utils/seoSchemas";

export default function ContactPage() {
  const [contactSettings, setContactSettings] = useState<dbContactSettings>(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    async function loadContactSettings() {
      const data = await getContactSettings();
      setContactSettings(data);
    }
    loadContactSettings();
  }, []);

  const [vehicleMode, setVehicleMode] = useState<"car" | "bike">("car");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const cardRef = useRef<HTMLDivElement>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  const rotateX = useTransform(cardY, [-150, 150], [12, -12]);
  const rotateY = useTransform(cardX, [-150, 150], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !message || rating === 0) {
      alert("Please fill in all fields and select a star rating!");
      return;
    }

    setIsSubmitting(true);
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    try {
      const response = await fetch(formEl.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [{ name: "Contact Us", path: "/contact" }];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <SEO 
        title="Contact Us | Book Doorstep Car & Bike Wash"
        description="Contact VA Car & Bike Care to book your premium doorstep car wash, detailing, or ceramic coating in Kanpur. Call us or book online instantly."
        keywords="Contact VA Car Care, car wash phone number, doorstep car wash booking, kanpur car detailing helpline"
        schemas={[
          getBreadcrumbSchema(breadcrumbs),
          getLocalBusinessSchema()
        ]}
      />
      {/* Dark Header Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden mb-10 text-center">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F4B400]/20 text-[#F4B400] font-semibold text-[11px] uppercase tracking-wider mb-2 rounded-full"
          >
            <Smartphone size={14} className="animate-pulse" />
            {contactSettings.badge}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-3 tracking-tight leading-[1.1]"
          >
            {contactSettings.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            {contactSettings.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Floating water droplet background elements */}
      <div className="absolute top-48 left-[-5%] w-[45vw] h-[45vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-[35vw] h-[35vw] bg-secondary/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* DOORSTEP VS SHOP COMPARATIVE DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-6xl mx-auto mb-16 text-left"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-dark">Why Home Detailing is Superior</h3>
            <p className="text-gray-500 text-sm mt-1">Comparing doorstep detailing to traditional brick-and-mortar garage washes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                <Clock size={24} />
              </div>
              <h4 className="font-heading font-bold text-dark text-lg mb-2">0 Mins Travel Time</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Traditional garages force you to drive, wait in lines, and waste 3+ hours. We clean while you work or spend time with family.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/60 py-1 px-2.5 rounded-lg">VA: 100% Home Convenience</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-sky-50/50 to-blue-50/30 rounded-2xl border border-sky-100/50">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 mb-4">
                <Droplet size={24} />
              </div>
              <h4 className="font-heading font-bold text-dark text-lg mb-2">Preserving Water</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Conventional shop bays waste over 150 liters of water per car. Our advanced polymer systems clean perfectly with less than 10 liters.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-sky-600 bg-sky-100/60 py-1 px-2.5 rounded-lg">VA: Advanced Dry Wash Tech</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-100/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-heading font-bold text-dark text-lg mb-2">Paint-Safe Detailing</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Shop washes use abrasive automated bristles and dirty rags that leave swirl marks. We use clean, plush microfibers and double-bucket wash grids.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-100/60 py-1 px-2.5 rounded-lg">VA: Zero Scratch Guarantee</span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 2-COLUMN DETAILS + FORM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
          
          <div className="lg:col-span-6 space-y-10">
            
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center justify-between">
              <span className="font-heading font-bold text-dark text-sm">Select Service Mode:</span>
              <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setVehicleMode("car")}
                  className={`py-2 px-5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    vehicleMode === "car"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-500 hover:text-dark"
                  }`}
                >
                  <Car size={14} />
                  Car Details
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleMode("bike")}
                  className={`py-2 px-5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    vehicleMode === "bike"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-500 hover:text-dark"
                  }`}
                >
                  🏍️
                  Bike Details
                </button>
              </div>
            </div>

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
                className="bg-gradient-to-br from-[#0D3B8E] to-[#1E293B] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 text-left"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#F4B400]/20 rounded-full blur-2xl pointer-events-none" />

                <div style={{ transform: "translateZ(50px)" }} className="relative z-10 space-y-6">
                  <div>
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest block mb-1">
                      HQ Booking Line
                    </span>
                    <h2 className="text-3xl font-heading font-extrabold tracking-tight">
                      VA Home Detailing
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                        <MapPin size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Operational Coverage</span>
                        <span className="text-sm font-semibold">100% Doorstep service in your garage, driveway, or lawn.</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${(contactSettings.whatsappNumber || contactSettings.phone1 || "919569949626").replace(/[^\d]/g, "")}?text=${encodeURIComponent(contactSettings.whatsappMessage || "Hello VA Detailing, I have an inquiry regarding car cleaning services.")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 group hover:opacity-90 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#F4B400]">
                        <Phone size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Call / WhatsApp Helpline</span>
                        <span className="text-sm font-semibold group-hover:text-[#F4B400] transition-colors">{contactSettings.phone1} {contactSettings.phone2 ? `/ ${contactSettings.phone2}` : ""}</span>
                      </div>
                    </a>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                        <Mail size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Dispatch Email</span>
                        <span className="text-sm font-semibold">{contactSettings.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                        <Clock size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Dispatch Hours</span>
                        <span className="text-sm font-semibold">Mon - Sun: 7:30 AM - 6:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  style={{ transform: "translateZ(30px)" }} 
                  className="absolute bottom-4 right-4 opacity-5 pointer-events-none text-white animate-pulse"
                >
                  {vehicleMode === "car" ? <Car size={180} /> : <span className="text-[140px] leading-none">🏍️</span>}
                </div>
              </motion.div>
            </div>

          </div>

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden text-left"
            >
              <h3 className="text-2xl font-heading font-bold text-dark mb-2 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-[#F4B400]">
                  <Star size={18} className="fill-[#F4B400]" />
                </span>
                Send Us a Review
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Your direct ratings shape our academy and maintain pristine service quality. Share your feedback!
              </p>

              <AnimatePresence mode="wait">
                {submitStatus === "idle" && (
                  <motion.form
                    key="contact-form"
                    action="https://formsubmit.co/contact@vacarcleaning.com"
                    method="POST"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <input type="hidden" name="_subject" value={`New ${vehicleMode === "car" ? "Car" : "Bike"} Detailing Service Review!`} />
                    <input type="hidden" name="_template" value="table" />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="vehicle-type" value={vehicleMode} />

                    <div className="space-y-1.5">
                      <label htmlFor="form-name" className="text-xs font-bold text-gray-500 uppercase">
                        Full Name
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="form-email" className="text-xs font-bold text-gray-500 uppercase">
                        Email Address
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        name="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-600">
                      <span>Service vehicle category:</span>
                      <span className="font-bold text-primary uppercase">{vehicleMode === "car" ? "🚗 Car Detailing" : "🏍️ Bike Detailing"}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-gray-500 uppercase">
                        Service Rating
                      </span>
                      <input type="hidden" name="star-rating" value={rating} />
                      <div className="flex gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="focus:outline-none cursor-pointer"
                          >
                            <Star
                              size={32}
                              className={`transition-colors duration-200 ${
                                star <= (hoverRating || rating)
                                  ? "fill-[#F4B400] text-[#F4B400] drop-shadow-[0_0_6px_rgba(244,180,0,0.4)]"
                                  : "text-gray-200 hover:text-gray-300"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="form-message" className="text-xs font-bold text-gray-500 uppercase">
                        Review Feedback
                      </label>
                      <textarea
                        id="form-message"
                        name="message"
                        required
                        rows={4}
                        placeholder={
                          vehicleMode === "car"
                            ? "Tell us about the doorstep wash crew, convenience, or paint shine quality..."
                            : "Tell us about the motorcycle chain cleaning, bike polishing, or doorstep shine quality..."
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-medium text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary hover:bg-[#0b327b] disabled:bg-gray-200 text-white font-bold rounded-2xl transition-all duration-300 text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Review...
                        </>
                      ) : (
                        <>
                          Submit Review
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {submitStatus === "success" && (
                  <motion.div
                    key="review-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-5"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
                      <CheckCircle size={36} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-2xl text-dark">Review Submitted!</h4>
                      <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                        Thank you for your {rating}-star rating! Your submission was sent via FormSubmit to our service crew.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitStatus("idle");
                        setName("");
                        setEmail("");
                        setRating(0);
                        setMessage("");
                      }}
                      className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-6 rounded-2xl text-xs transition-colors shadow cursor-pointer"
                    >
                      Send Another Submission
                    </button>
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    key="review-error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-5"
                  >
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-md">
                      <AlertCircle size={36} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-2xl text-dark">Submission Failed</h4>
                      <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                        Something went wrong during submission. Please check your internet connection or try again.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitStatus("idle")}
                      className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-6 rounded-2xl text-xs transition-colors shadow cursor-pointer"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

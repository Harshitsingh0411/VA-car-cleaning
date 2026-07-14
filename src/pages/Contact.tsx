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
  MessageSquare
} from "lucide-react";

// Service zones definition for the animated map
interface Zone {
  id: string;
  name: string;
  x: number; // percentage width
  y: number; // percentage height
  eta: string;
  desc: string;
}

const serviceZones: Zone[] = [
  { id: "north", name: "North VA District", x: 50, y: 15, eta: "30-45 mins", desc: "Residential estates & golf club details" },
  { id: "central", name: "Downtown Metro Hub", x: 50, y: 50, eta: "15-20 mins", desc: "Corporate garages & office detailing" },
  { id: "south", name: "South VA Shoreline", x: 50, y: 85, eta: "35-50 mins", desc: "Eco-wash & coastal paint protection" },
  { id: "west", name: "West Valley Suburbs", x: 15, y: 50, eta: "25-35 mins", desc: "SUV family wash & leather treatment" },
  { id: "east", name: "East Industrial Park", x: 85, y: 50, eta: "20-30 mins", desc: "Fleet washing & heavy duty stain removal" }
];

export default function ContactPage() {
  // --- VEHICLE MODE STATE (CAR VS BIKE) ---
  const [vehicleMode, setVehicleMode] = useState<"car" | "bike">("car");

  // --- FORM STATES ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // --- MAP STATES ---
  const [selectedZone, setSelectedZone] = useState<Zone>(serviceZones[1]); // default to central
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50 }); // start at central

  // 3D Card Hover Ref
  const cardRef = useRef<HTMLDivElement>(null);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  // Rotation matrices for 3D card tilt
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

  // Trigger vehicle drive animation to selected zone
  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setCarPosition({ x: zone.x, y: zone.y });
  };

  // Handle form submit post to FormSubmit
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

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      {/* Floating water droplet background elements */}
      <div className="absolute top-20 left-[-5%] w-[45vw] h-[45vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-[35vw] h-[35vw] bg-secondary/5 rounded-full blur-[90px] pointer-events-none" />

      {/* FLOATING WHATSAPP WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/90 backdrop-blur-md border border-gray-100 py-2 px-4 rounded-2xl shadow-xl hidden md:flex items-center text-xs font-semibold text-gray-700 max-w-[200px]"
        >
          <span>Need a quick quote? Chat on WhatsApp!</span>
        </motion.div>
        
        <motion.a
          href="https://wa.me/918882540255"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl border-2 border-white cursor-pointer relative"
        >
          {/* Pulse ping ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
          
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.871-6.956C16.612 1.93 14.14 9.12 12.009 9.12c-5.437 0-9.863 4.42-9.866 9.865-.001 1.662.457 3.293 1.348 4.767l-.999 3.648 3.73-.978z" />
          </svg>
          {/* Online status indicator dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-sky-400 border-2 border-white rounded-full" />
        </motion.a>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-semibold text-xs uppercase tracking-wider mb-4"
          >
            <Smartphone size={14} className="animate-pulse" />
            100% Home & Doorstep Service
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-heading font-extrabold text-dark mb-6 tracking-tight"
          >
            No Shop Footprint,<br />
            We Come to <span className="text-primary">Your Driveway</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg md:text-xl leading-relaxed"
          >
            Save time and fuel. We bring the complete detailing wash setup directly to your doorstep. Proudly cleaning Cars and Bikes across active districts.
          </motion.p>
        </div>

        {/* DOORSTEP VS SHOP COMPARATIVE DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-dark">Why Home Detailing is Superior</h3>
            <p className="text-gray-500 text-sm mt-1">Comparing doorstep detailing to traditional brick-and-mortar garage washes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Compare item 1: Time */}
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

            {/* Compare item 2: Eco Water */}
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

            {/* Compare item 3: Safe Paint */}
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
          
          {/* LEFT COLUMN: 3D CARD & MAP SIMULATOR */}
          <div className="lg:col-span-6 space-y-10">
            
            {/* VEHICLE TOGGLE SWITCH */}
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

            {/* WIDGET 1: 3D PERSPECTIVE TILT COMPANY INFO CARD */}
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
                className="bg-gradient-to-br from-[#0D3B8E] to-[#1E293B] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-white/10"
              >
                {/* Holographic background grid */}
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

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                        <Phone size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Call / WhatsApp Helpline</span>
                        <span className="text-sm font-semibold">+91 88825 40255</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                        <Mail size={20} className="text-secondary" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Dispatch Email</span>
                        <span className="text-sm font-semibold">bookings@vacarcleaning.com</span>
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

            {/* WIDGET 2: DOORSTEP MOBILE SERVICE MAP SIMULATOR */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative"
            >
              <h3 className="text-2xl font-heading font-bold text-dark mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  🗺️
                </span>
                Active Service Zones
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Click any zone to test mobile dispatch. See how quickly our {vehicleMode === "car" ? "vans" : "motorcycles"} reach you!
              </p>

              {/* Grid map wrapper */}
              <div className="relative h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                {/* SVG background styling roads & routes */}
                <svg className="absolute inset-0 w-full h-full stroke-slate-800/80 fill-none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="0" y1="0" x2="100%" y2="100%" strokeWidth="1" strokeDasharray="5 5" />
                  <line x1="100%" y1="0" x2="0" y2="100%" strokeWidth="1" strokeDasharray="5 5" />
                  <circle cx="50%" cy="50%" r="40" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="80" strokeWidth="1" />
                </svg>

                {/* Dispatch HQ Center */}
                <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-primary/80 border-2 border-white animate-pulse flex items-center justify-center text-[10px] font-bold text-white z-10">
                    HQ
                  </div>
                </div>

                {/* Service Zone Hotspots */}
                {serviceZones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => handleZoneSelect(zone)}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none"
                    style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedZone.id === zone.id 
                        ? "bg-secondary text-dark border-2 border-white scale-110 shadow-lg shadow-secondary/40" 
                        : "bg-slate-700 text-slate-300 border border-slate-500"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </button>
                ))}

                {/* Traveling Mobile Detailing Vehicle (Varying based on toggle selection) */}
                <motion.div
                  animate={{ left: `${carPosition.x}%`, top: `${carPosition.y}%` }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-secondary border border-dark flex items-center justify-center text-dark shadow-md z-20 pointer-events-none"
                >
                  {vehicleMode === "car" ? (
                    <Car size={16} className="text-dark" />
                  ) : (
                    <span className="text-sm">🏍️</span>
                  )}
                </motion.div>
              </div>

              {/* Selected Zone ETA Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedZone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-heading font-bold text-dark text-sm">{selectedZone.name}</h4>
                    <p className="text-gray-500 text-xs mt-0.5">{selectedZone.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[9px] uppercase font-bold text-gray-400">Dispatch ETA</span>
                    <span className="text-sm font-extrabold text-primary">{selectedZone.eta}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: CONTACT & REVIEW FORMSUBMIT FORM */}
          <div className="lg:col-span-6">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden"
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
                    {/* Formsubmit Configuration settings */}
                    <input type="hidden" name="_subject" value={`New ${vehicleMode === "car" ? "Car" : "Bike"} Detailing Service Review!`} />
                    <input type="hidden" name="_template" value="table" />
                    <input type="hidden" name="_captcha" value="false" />
                    
                    {/* Hidden Vehicle selection for FormSubmit */}
                    <input type="hidden" name="vehicle-type" value={vehicleMode} />

                    {/* Name input */}
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

                    {/* Email input */}
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

                    {/* Active vehicle type confirmation */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-600">
                      <span>Service vehicle category:</span>
                      <span className="font-bold text-primary uppercase">{vehicleMode === "car" ? "🚗 Car Detailing" : "🏍️ Bike Detailing"}</span>
                    </div>

                    {/* Interactive Star Rating */}
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

                    {/* Review text field */}
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

                    {/* Submit Button */}
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

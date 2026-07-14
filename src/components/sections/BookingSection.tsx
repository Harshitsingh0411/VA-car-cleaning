import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, User, Phone, Settings, ShieldCheck, MapPin, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { servicePrices } from "../../lib/prices";

export default function BookingSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service || !vehicleType || !date || !time) {
      alert("Please fill in all booking details!");
      return;
    }
    setIsBooked(true);
  };

  return (
    <section className="py-24 bg-[#070C16] text-white relative border-t border-white/5" id="booking-section">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* LEFT: Booking Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
                — BOOK YOUR SERVICE —
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
                Easy Booking In Just Few Steps
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {!isBooked ? (
                <motion.form
                  key="booking-form"
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {/* Your Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Your Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all"
                      />
                      <User size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="Enter your phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all"
                      />
                      <Phone size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Select Service */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Select Service</label>
                    <div className="relative">
                      <select
                        required
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Choose service</option>
                        <option value="exterior">Exterior Wash - {servicePrices.exteriorWash.formatted}</option>
                        <option value="interior">Interior Cleaning - {servicePrices.interiorCleaning.formatted}</option>
                        <option value="foam">Foam Wash - {servicePrices.foamWash.formatted}</option>
                        <option value="wax">Wax Polish - {servicePrices.waxPolish.formatted}</option>
                        <option value="dashboard">Dashboard Cleaning - {servicePrices.dashboardCleaning.formatted}</option>
                        <option value="premium">Premium Detailing - {servicePrices.premiumDetailing.formatted}</option>
                      </select>
                      <Settings size={16} className="absolute right-3.5 top-[50%] -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Vehicle Type</label>
                    <div className="relative">
                      <select
                        required
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select vehicle type</option>
                        <option value="hatchback">Hatchback (Car)</option>
                        <option value="sedan">Sedan (Car)</option>
                        <option value="suv">SUV / MUV (Car)</option>
                        <option value="bike">Motorcycle / Scooter (Bike)</option>
                        <option value="superbike">Premium Superbike (Bike)</option>
                      </select>
                      <Settings size={16} className="absolute right-3.5 top-[50%] -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Preferred Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Preferred Time</label>
                    <div className="relative">
                      <select
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#0B1220] border border-white/10 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select time slot</option>
                        <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                        <option value="evening">Evening (4:00 PM - 7:00 PM)</option>
                      </select>
                      <Clock size={16} className="absolute right-3.5 top-[50%] -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#F4B400] hover:bg-[#ffe258] text-dark font-heading font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Book Now <span className="text-base leading-none">→</span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-[#0B1220] border border-emerald-500/20 rounded-3xl text-center space-y-4 shadow-xl"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-extrabold text-white">Booking Request Received!</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                      Thank you, {name}! Our mobile detailing service coordinator will contact you at {phone} shortly to confirm your doorstep slot.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBooked(false)}
                    className="text-xs text-[#F4B400] font-bold hover:underline cursor-pointer"
                  >
                    Submit another slot
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Foam Wash Graphic */}
          <div className="lg:col-span-5 relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/5 shrink-0 group">
            <img
              src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1000"
              alt="Doorstep Foam Wash detailing"
              className="w-full h-full object-cover filter saturate-[0.8] contrast-[1.1] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070C16] via-transparent to-transparent" />
            
            {/* Doorstep Badge */}
            <div className="absolute bottom-6 right-6 bg-[#F4B400] text-dark font-heading font-extrabold text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-1.5">
              <MapPin size={14} className="stroke-[2.5]" />
              Doorstep Service
            </div>

            {/* Info badge */}
            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-sm text-white py-2 px-3.5 rounded-xl border border-white/10 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
              <Info size={12} className="text-[#F4B400]" />
              No Shop Visit Required
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Send, ClipboardCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { submitJobApplication } from "../../services/dbService";

export default function ApplyNow() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleSkill, setVehicleSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !email || !vehicleSkill || !experience) {
      alert("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    try {
      // Save application directly to central database
      await submitJobApplication({
        name,
        phone,
        email,
        skill: vehicleSkill,
        exp: experience,
        cover: message
      });

      // Submit to Formsubmit as a fallback log notification
      try {
        await fetch(formEl.action, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
      } catch (postErr) {
        console.warn("FormSubmit POST ignored/failed, DB save completed: ", postErr);
      }

      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-2xl">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/jobs" className="hover:text-primary transition-colors">Careers</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Apply Now</span>
        </div>

        {/* Portal Box */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ClipboardCheck size={160} className="text-primary" />
          </div>

          <div className="space-y-4 mb-8">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">— VA CAREERS —</span>
            <h1 className="text-3xl font-heading font-extrabold text-dark tracking-tight">Join Our Detailing Team</h1>
            <p className="text-gray-500 text-xs">
              Complete the form below. Your application details will be forwarded via FormSubmit.co to our recruitment director.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitStatus === "idle" && (
              <motion.form
                key="apply-form"
                action="https://formsubmit.co/contact@vacarcleaning.com"
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Formsubmit parameters */}
                <input type="hidden" name="_subject" value="New Detailer Application Submission!" />
                <input type="hidden" name="_captcha" value="false" />

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="job-name" className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input
                    id="job-name"
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="job-phone" className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    id="job-phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="job-email" className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input
                    id="job-email"
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Vehicle skill preference */}
                <div className="space-y-1.5">
                  <label htmlFor="job-skill" className="text-xs font-bold text-gray-500 uppercase">Vehicle Detailing Preference</label>
                  <select
                    id="job-skill"
                    name="vehicle-skill"
                    required
                    value={vehicleSkill}
                    onChange={(e) => setVehicleSkill(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select vehicle category</option>
                    <option value="cars">Car Detailing (Exterior/Interior/Foam)</option>
                    <option value="bikes">Bike Detailing (Chains/Polishing)</option>
                    <option value="both">Both Cars & Bikes Detailing</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label htmlFor="job-exp" className="text-xs font-bold text-gray-500 uppercase">Detailing Experience Level</label>
                  <select
                    id="job-exp"
                    name="experience-level"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select experience level</option>
                    <option value="apprentice">Apprentice / Trainee (Detox Academy student)</option>
                    <option value="experienced">Experienced Detailer (1+ Years Buffing/Coating)</option>
                  </select>
                </div>

                {/* Cover note message */}
                <div className="space-y-1.5">
                  <label htmlFor="job-message" className="text-xs font-bold text-gray-500 uppercase">Cover Note (Optional)</label>
                  <textarea
                    id="job-message"
                    name="cover-message"
                    rows={3}
                    placeholder="Tell us about yourself, why you want to join, or previous wash garage experience..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-medium text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary hover:bg-[#0b327b] disabled:bg-gray-200 text-white font-bold rounded-2xl transition-all duration-300 text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Send Application
                      <Send size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {submitStatus === "success" && (
              <motion.div
                key="apply-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-5"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
                  <CheckCircle size={36} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-2xl text-dark">Application Sent!</h4>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                    Thank you, {name}! Your detailing job application was successfully sent. Our academy directors will review it and contact you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus("idle")}
                  className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-6 rounded-2xl text-xs transition-colors shadow cursor-pointer"
                >
                  Submit Another Form
                </button>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                key="apply-error"
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
        </div>
      </div>
    </div>
  );
}

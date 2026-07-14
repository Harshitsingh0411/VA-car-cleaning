import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { Briefcase, Clock, Banknote, Users, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

interface ApplicationInputs {
  name: string;
  phone: string;
  email: string;
  age: string;
  city: string;
  education: string;
  availableTime: string;
  experience: string;
  notes: string;
}

export default function JobsPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationInputs>();

  const onSubmit = (data: ApplicationInputs) => {
    console.log("Job Application Data Submitted:", data);
    // Simulate successful form submit with animation
    setIsSubmitted(true);
    setTimeout(() => {
      reset();
    }, 1000);
  };

  return (
    <div className="pt-24 min-h-screen bg-light">
      {/* Banner */}
      <div className="bg-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-sm mb-4 block animate-pulse"
          >
            Join Our Team
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-extrabold mb-6"
          >
            Part-Time Job Opportunities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Earn extra income with a professional, friendly, and fully flexible car detailing schedule. Perfect for college students and freelancers!
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Job details side (Left 5-columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">
                The Role
              </span>
              <h2 className="text-3xl font-heading font-extrabold text-dark mb-4">
                Mobile Detailing Partner
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">
                As a detailing partner, you will join an elite, friendly team executing premium washing and interior restoration services at customer doorsteps. We provide training, professional apparel, and all necessary equipment.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-6">
              <h3 className="text-xl font-heading font-bold text-dark">
                Benefits & Package
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-base">Flexible Hours</h4>
                  <p className="text-gray-500 text-sm">Shift options are 5-6 hours daily. Fits classes and freelance routines perfectly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Banknote size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-base">₹4,500 - ₹5,000 / Month</h4>
                  <p className="text-gray-500 text-sm">Reliable base payment + amazing performance bonuses and incentives.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-dark text-base">Friendly Environment</h4>
                  <p className="text-gray-500 text-sm">A supportive management team with great room for professional career growth.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side (Right 7-columns) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-2xl border border-gray-50">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-dark mb-4">
                    Application Submitted!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Thank you for applying. Our Operations team will review your application and contact you via Phone or Email within 48 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mx-auto"
                  >
                    Submit Another Application
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-dark mb-2">
                    Application Form
                  </h3>
                  <p className="text-gray-500 text-sm mb-8">
                    Complete the fields below. No formal experience is required to apply.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Aditya Kumar"
                          {...register("name", { required: "Name is required" })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.name ? "border-red-500" : ""
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          {...register("phone", {
                            required: "Phone is required",
                            pattern: { value: /^[0-9+ ]{10,15}$/, message: "Invalid Phone Number" }
                          })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.phone ? "border-red-500" : ""
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email & Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="aditya@example.com"
                          {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid Email Address" }
                          })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.email ? "border-red-500" : ""
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Age (Years) *
                        </label>
                        <input
                          type="number"
                          placeholder="21"
                          {...register("age", { required: "Age is required", min: { value: 18, message: "Must be 18 or older" } })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.age ? "border-red-500" : ""
                          }`}
                        />
                        {errors.age && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.age.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* City & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City / Location *
                        </label>
                        <input
                          type="text"
                          placeholder="New Delhi"
                          {...register("city", { required: "City is required" })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.city ? "border-red-500" : ""
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Education / College *
                        </label>
                        <input
                          type="text"
                          placeholder="B.Tech Student (Final Year)"
                          {...register("education", { required: "Education details are required" })}
                          className={`w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            errors.education ? "border-red-500" : ""
                          }`}
                        />
                        {errors.education && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.education.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Available Time & Detailing Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preferred Available Shift *
                        </label>
                        <select
                          {...register("availableTime", { required: "Shift preference is required" })}
                          className="w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="morning">Morning shift (7:00 AM - 1:00 PM)</option>
                          <option value="afternoon">Afternoon shift (1:00 PM - 7:00 PM)</option>
                          <option value="evening">Evening shift (4:00 PM - 10:00 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prior Detailing Experience? *
                        </label>
                        <select
                          {...register("experience", { required: "This selection is required" })}
                          className="w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="none">No experience (We provide full training)</option>
                          <option value="beginner">1-6 Months Experience</option>
                          <option value="expert">More than 1 year Experience</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tell us why you want to join (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Share any details about yourself..."
                        {...register("notes")}
                        className="w-full px-5 py-3.5 bg-light rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-xl text-base font-semibold">
                      Submit Application Form
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

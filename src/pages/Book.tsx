import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { CheckCircle, Calendar, Sparkles, Car, ShieldCheck, User, Phone, Mail, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { servicePrices } from "../lib/prices";
import { createBooking } from "../services/dbService";

interface BookingInputs {
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  vehicleSelect: string;
  customVehicleName: string;
  customVehicleNumber: string;
  bookingDate: string;
  bookingTime: string;
  notes: string;
}

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const { user, profile, addAppointment } = useAuth();
  const [step, setStep] = useState(1);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);

  // Read service package query parameter (default to 'foam')
  const queryService = searchParams.get("service") || "foam";

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<BookingInputs>({
    defaultValues: {
      serviceType: queryService,
      bookingTime: "Morning (8:00 AM - 12:00 PM)",
      vehicleSelect: "",
      bookingDate: new Date().toISOString().split("T")[0]
    }
  });

  const selectedServiceKey = watch("serviceType");
  const selectedVehicleId = watch("vehicleSelect");
  const selectedAddress = watch("address");

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
      if (profile?.contactNumber) {
        setValue("phone", profile.contactNumber);
      }
      if (profile?.addresses && profile.addresses.length > 0) {
        setValue("address", profile.addresses[0]);
      }
      if (profile?.vehicles && profile.vehicles.length > 0) {
        setValue("vehicleSelect", profile.vehicles[0].id);
      }
    }
  }, [user, profile, setValue]);

  // Lookup service details from central prices config
  const getServiceInfo = (key: string) => {
    switch (key) {
      case "exterior":
        return { name: "Exterior Wash", price: servicePrices.exteriorWash.formatted };
      case "interior":
        return { name: "Interior Cleaning", price: servicePrices.interiorCleaning.formatted };
      case "foam":
        return { name: "Foam Wash", price: servicePrices.foamWash.formatted };
      case "wax":
        return { name: "Wax Polish", price: servicePrices.waxPolish.formatted };
      case "dashboard":
        return { name: "Dashboard Cleaning", price: servicePrices.dashboardCleaning.formatted };
      case "tyre":
        return { name: "Tyre Dressing", price: servicePrices.tyreDressing.formatted };
      default:
        return { name: "Premium Detailing", price: servicePrices.premiumDetailing.formatted };
    }
  };

  const serviceInfo = getServiceInfo(selectedServiceKey);

  const nextStep = async () => {
    let fields: Array<keyof BookingInputs> = [];
    if (step === 1) {
      fields = ["bookingDate", "bookingTime", "address", "serviceType"];
    }
    const isValid = await trigger(fields);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: BookingInputs) => {
    let finalVehicle = "";
    if (user && profile?.vehicles && profile.vehicles.length > 0) {
      const matched = profile.vehicles.find(v => v.id === data.vehicleSelect);
      finalVehicle = matched ? `${matched.name} (${matched.number})` : data.vehicleSelect;
    } else {
      finalVehicle = `${data.customVehicleName} (${data.customVehicleNumber})`;
    }

    const sInfo = getServiceInfo(data.serviceType);

    // Save to user appointment history & centralized bookings db
    if (user) {
      const bookingPrice = Number(sInfo.price.replace(/[^\d]/g, "")) || 0;
      await createBooking({
        customerId: user.uid,
        customerName: data.name,
        customerPhone: data.phone,
        vehicleId: data.vehicleSelect || "custom",
        vehicleDetails: finalVehicle,
        serviceId: data.serviceType,
        serviceName: sInfo.name,
        scheduledDate: data.bookingDate,
        timeSlot: data.bookingTime,
        price: bookingPrice,
        notes: data.notes
      });
      await addAppointment(sInfo.name, finalVehicle, data.bookingDate, data.bookingTime, sInfo.price);
    }

    setBookedDetails({
      service: sInfo.name,
      vehicle: finalVehicle,
      date: data.bookingDate,
      time: data.bookingTime,
      price: sInfo.price,
      address: data.address
    });
    setIsBooked(true);
  };

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC]">
      {/* Upper header */}
      <div className="bg-[#070C16] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <span className="text-[#F4B400] font-heading font-semibold tracking-wider uppercase text-xs mb-3 block">
            — PREMIUM DOORSTEP CARE —
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 text-white">
            Book Doorstep Detailing
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            Select your schedule slot and location. Our equipped mobile detailing experts will shine your vehicle at your doorstep.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* Progress Indicators */}
          {!isBooked && (
            <div className="flex items-center justify-between mb-12 max-w-xs mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                  step >= 1 ? "bg-primary border-primary text-white" : "border-gray-200 text-gray-400 bg-white"
                }`}>
                  1
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                  step >= 2 ? "bg-primary border-primary text-white" : "border-gray-200 text-gray-400 bg-white"
                }`}>
                  2
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Details</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
            {isBooked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
                  <CheckCircle className="stroke-[2.5]" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-dark">
                    Booking Request Confirmed!
                  </h3>
                  <p className="text-gray-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                    Your doorstep cleaning slot is booked. Our dispatch crew will call you shortly to confirm coordinates.
                  </p>
                </div>

                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl max-w-md mx-auto text-left space-y-3 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span>Service Package:</span>
                    <span className="text-primary font-bold">{bookedDetails?.service}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span>Vehicle:</span>
                    <span className="text-dark font-bold">{bookedDetails?.vehicle}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span>Scheduled Date:</span>
                    <span className="text-dark">{bookedDetails?.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span>Time Slot:</span>
                    <span className="text-dark">{bookedDetails?.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span>Address:</span>
                    <span className="text-dark max-w-[200px] text-right truncate">{bookedDetails?.address}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-dark pt-1">
                    <span>Estimated Price:</span>
                    <span className="text-primary text-base font-black">{bookedDetails?.price}</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-2">
                  <Link to={user ? "/account" : "/"}>
                    <Button variant="outline" className="px-6 h-11 text-xs">
                      {user ? "Go To Account Dashboard" : "Back to Home"}
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setIsBooked(false);
                      setStep(1);
                      setBookedDetails(null);
                    }}
                    className="bg-primary hover:bg-[#0b327b] text-white px-6 h-11 text-xs"
                  >
                    Book Another Slot
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: SCHEDULE */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-heading font-extrabold text-dark">
                          1. Choose Package & Schedule
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Verify detailing service, select desired date, and doorstep address.
                        </p>
                      </div>

                      {/* Service Selection dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Service Package</label>
                        <select
                          {...register("serviceType", { required: "Service is required" })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                          <option value="exterior">Exterior Wash - {servicePrices.exteriorWash.formatted}</option>
                          <option value="interior">Interior Cleaning - {servicePrices.interiorCleaning.formatted}</option>
                          <option value="foam">Foam Wash - {servicePrices.foamWash.formatted}</option>
                          <option value="wax">Wax Polish - {servicePrices.waxPolish.formatted}</option>
                          <option value="dashboard">Dashboard Cleaning - {servicePrices.dashboardCleaning.formatted}</option>
                          <option value="tyre">Tyre Dressing - {servicePrices.tyreDressing.formatted}</option>
                          <option value="premium">Premium Detailing - {servicePrices.premiumDetailing.formatted}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Booking Date */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Preferred Date</label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            {...register("bookingDate", { required: "Date is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
                          />
                        </div>

                        {/* Booking Time Slot */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time Slot</label>
                          <select
                            {...register("bookingTime", { required: "Time slot is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                            <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                            <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      {/* Service Address */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Service Address</label>
                        {user && profile?.addresses && profile.addresses.length > 0 ? (
                          <select
                            {...register("address", { required: "Address is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            {profile.addresses.map((addr, idx) => (
                              <option key={idx} value={addr}>{addr}</option>
                            ))}
                          </select>
                        ) : (
                          <textarea
                            rows={3}
                            placeholder="Provide details where vehicle is parked..."
                            {...register("address", { required: "Address is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                          />
                        )}
                        {errors.address && (
                          <p className="text-red-500 text-[10px] font-bold">{errors.address.message}</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400 font-bold">
                          Est. Price: <span className="text-primary text-sm font-black">{serviceInfo.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-heading font-extrabold text-dark">
                          2. Vehicle & Personal Details
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Select vehicle to wash and provide contact information.
                        </p>
                      </div>

                      {/* Vehicle selection (Dropdown of saved, or inputs if empty/logged-out) */}
                      <div className="space-y-4">
                        {user && profile?.vehicles && profile.vehicles.length > 0 ? (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Saved Vehicle</label>
                            <select
                              {...register("vehicleSelect", { required: "Vehicle is required" })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                              {profile.vehicles.map((v) => (
                                <option key={v.id} value={v.id}>{v.name} ({v.number})</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vehicle Brand & Model</label>
                              <input
                                type="text"
                                placeholder="Hyundai Creta, Honda City"
                                {...register("customVehicleName", { required: !user && "Vehicle details required" })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registration Number</label>
                              <input
                                type="text"
                                placeholder="DL-3C-AS-1234"
                                {...register("customVehicleNumber", { required: !user && "Registration number required" })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Personal contact */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Rahul Roy"
                              {...register("name", { required: "Name is required" })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            <input
                              type="tel"
                              required
                              placeholder="+91 98765 43210"
                              {...register("phone", { required: "Phone number is required" })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="rahul@example.com"
                            {...register("email", { required: "Email is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Special Requests (Optional)</label>
                          <textarea
                            rows={2}
                            placeholder="Provide any instructions..."
                            {...register("notes")}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="text-xs text-gray-400 font-bold hover:underline cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
                        >
                          Confirm Booking Slot
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

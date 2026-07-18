import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { CheckCircle, Calendar, Sparkles, Car, ShieldCheck, User, Phone, Mail, Clock, MapPin, ArrowRight, Gift, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { servicePrices } from "../lib/prices";
import {
  createBooking,
  getAllServices,
  dbService,
  getLoyaltySettings,
  getUserLoyaltyPoints,
  grantOrAdjustLoyaltyPoints,
  dbLoyaltySettings
} from "../services/dbService";
import { CustomerLocationPicker, LocationCoords } from "../components/location/LocationPickerMap";

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
  const [services, setServices] = useState<dbService[]>([]);
  const [loyaltySettings, setLoyaltySettings] = useState<dbLoyaltySettings | null>(null);
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState<number>(0);
  const [redeemLoyalty, setRedeemLoyalty] = useState<boolean>(false);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(0);

  useEffect(() => {
    getAllServices().then(setServices).catch(console.error);
    getLoyaltySettings().then(setLoyaltySettings).catch(console.error);
    if (user) {
      getUserLoyaltyPoints(user.uid).then((pts) => {
        setUserLoyaltyPoints(pts);
        setPointsToRedeemInput(pts);
      }).catch(console.error);
    }
  }, [user]);

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

  // Lookup service details from dynamic services list
  const matchedService = services.find(s => s.id === selectedServiceKey);
  const rawServicePrice = matchedService ? matchedService.price : 1999;

  // Loyalty calculations
  const pointValue = loyaltySettings?.pointRedemptionValue || 1;
  const maxDiscountPercent = loyaltySettings?.maxDiscountPercent || 50;
  const maxAllowedPoints = Math.min(
    userLoyaltyPoints,
    Math.floor((rawServicePrice * (maxDiscountPercent / 100)) / pointValue)
  );

  const activeRedeemedPoints = (redeemLoyalty && loyaltySettings?.enabled)
    ? Math.min(pointsToRedeemInput > 0 ? pointsToRedeemInput : userLoyaltyPoints, maxAllowedPoints)
    : 0;
  const loyaltyDiscount = activeRedeemedPoints * pointValue;
  const finalPayablePrice = Math.max(0, rawServicePrice - loyaltyDiscount);
  const estimatedEarnedPoints = Math.floor((finalPayablePrice / 100) * (loyaltySettings?.pointsPer100Spent || 10));

  const serviceInfo = {
    name: matchedService ? matchedService.name : "Premium Detailing",
    price: `₹${finalPayablePrice}`,
    rawPrice: rawServicePrice,
    discount: loyaltyDiscount,
    finalPrice: finalPayablePrice
  };

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

  const [pinnedLocation, setPinnedLocation] = useState<LocationCoords | null>(null);

  const onSubmit = async (data: BookingInputs) => {
    let finalVehicle = "";
    if (user && profile?.vehicles && profile.vehicles.length > 0) {
      const matched = profile.vehicles.find(v => v.id === data.vehicleSelect);
      finalVehicle = matched ? `${matched.name} (${matched.number})` : data.vehicleSelect;
    } else {
      finalVehicle = `${data.customVehicleName} (${data.customVehicleNumber})`;
    }

    const matchedServiceSubmit = services.find(s => s.id === data.serviceType);
    const serviceName = matchedServiceSubmit ? matchedServiceSubmit.name : data.serviceType;
    const servicePrice = matchedServiceSubmit ? matchedServiceSubmit.price : 0;

    // Save to user appointment history & centralized bookings db
    if (user) {
      const newBookingId = await createBooking({
        customerId: user.uid,
        customerName: data.name,
        customerPhone: data.phone,
        vehicleId: data.vehicleSelect || "custom",
        vehicleDetails: finalVehicle,
        serviceId: data.serviceType,
        serviceName: serviceName,
        scheduledDate: data.bookingDate,
        timeSlot: data.bookingTime,
        price: finalPayablePrice,
        notes: data.notes,
        address: data.address,
        customerLatitude: pinnedLocation?.latitude,
        customerLongitude: pinnedLocation?.longitude,
        customerLocationUrl: pinnedLocation?.mapsUrl,
        loyaltyPointsRedeemed: activeRedeemedPoints,
        loyaltyPointsDiscount: loyaltyDiscount,
        loyaltyPointsEarned: estimatedEarnedPoints
      });

      await addAppointment(serviceName, finalVehicle, data.bookingDate, data.bookingTime, `₹${finalPayablePrice}`);

      // Deduct redeemed points & grant earned points
      if (activeRedeemedPoints > 0) {
        await grantOrAdjustLoyaltyPoints(user.uid, -activeRedeemedPoints, "redeemed", `Redeemed ${activeRedeemedPoints} pts on ${serviceName}`, newBookingId);
      }
      if (estimatedEarnedPoints > 0) {
        await grantOrAdjustLoyaltyPoints(user.uid, estimatedEarnedPoints, "earned", `Earned ${estimatedEarnedPoints} pts on ${serviceName}`, newBookingId);
      }
    }

    setBookedDetails({
      service: serviceName,
      vehicle: finalVehicle,
      date: data.bookingDate,
      time: data.bookingTime,
      price: `₹${servicePrice}`,
      address: data.address
    });
    setIsBooked(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Upper header */}
      <div className="bg-[#070C16] text-white pt-24 pb-10 md:pt-28 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <span className="text-[#F4B400] font-heading font-semibold tracking-wider uppercase text-[11px] mb-1.5 block">
            — PREMIUM DOORSTEP CARE —
          </span>
          <h1 className="text-2xl md:text-4xl font-heading font-extrabold mb-2 text-white max-w-xl mx-auto leading-[1.1] tracking-tight">
            Book Doorstep Detailing
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Select your schedule slot and location. Our equipped mobile detailing experts will shine your vehicle at your doorstep.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
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
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                          ))}
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

                        <CustomerLocationPicker
                          onLocationSelected={(loc) => {
                            setPinnedLocation(loc);
                            if (loc.addressText) {
                              setValue("address", loc.addressText);
                            }
                          }}
                        />
                      </div>

                      {/* Loyalty Points Option & Redemption Box */}
                      {loyaltySettings?.enabled !== false && (
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-2xl space-y-3 text-left shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-900 font-heading font-extrabold text-xs">
                              <Gift size={18} className="text-[#F4B400]" />
                              <span>VA Rewards & Loyalty Points</span>
                            </div>
                            {user && (
                              <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                                Balance: {userLoyaltyPoints} pts
                              </span>
                            )}
                          </div>

                          {!user ? (
                            <div className="text-xs text-amber-950 font-semibold space-y-1">
                              <p>Log in to apply your earned loyalty points for instant cash discounts on this booking.</p>
                              <Link to="/login" className="inline-block text-[11px] font-bold text-primary hover:underline">
                                → Log In or Register Now
                              </Link>
                            </div>
                          ) : userLoyaltyPoints >= (loyaltySettings?.minPointsToRedeem || 50) ? (
                            <div className="space-y-3">
                              <label className="flex items-center gap-2.5 cursor-pointer pt-0.5 select-none">
                                <input
                                  type="checkbox"
                                  checked={redeemLoyalty}
                                  onChange={(e) => {
                                    setRedeemLoyalty(e.target.checked);
                                    if (e.target.checked && pointsToRedeemInput <= 0) {
                                      setPointsToRedeemInput(maxAllowedPoints);
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#F4B400] cursor-pointer"
                                />
                                <span className="text-xs font-extrabold text-dark">
                                  Use Loyalty Points for instant discount (Save up to ₹{maxAllowedPoints * (loyaltySettings?.pointRedemptionValue || 1)})
                                </span>
                              </label>

                              {redeemLoyalty && (
                                <div className="space-y-2 pt-2 border-t border-amber-200/80 text-xs">
                                  <div className="flex justify-between items-center text-amber-950">
                                    <span className="font-bold">Points to Redeem:</span>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min={loyaltySettings?.minPointsToRedeem || 50}
                                        max={maxAllowedPoints}
                                        value={pointsToRedeemInput}
                                        onChange={(e) => setPointsToRedeemInput(Math.min(maxAllowedPoints, Math.max(0, parseInt(e.target.value) || 0)))}
                                        className="w-24 bg-white border border-amber-300 rounded-xl px-3 py-1 font-bold text-dark text-right focus:outline-none focus:ring-2 focus:ring-primary"
                                      />
                                      <span className="text-[10px] text-gray-500 font-bold">pts</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold text-amber-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                                    <span className="text-emerald-800 font-extrabold">Instant Loyalty Discount Applied:</span>
                                    <span className="font-black text-emerald-600 text-sm">-₹{loyaltyDiscount}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-900 font-medium space-y-1">
                              <p>
                                You have <strong>{userLoyaltyPoints} points</strong>. Minimum <strong>{loyaltySettings?.minPointsToRedeem || 50} points</strong> required to redeem instant cash discount.
                              </p>
                            </div>
                          )}

                          {estimatedEarnedPoints > 0 && (
                            <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1.5 pt-1 border-t border-amber-200/50">
                              <Star size={13} className="fill-amber-400 text-amber-500" />
                              <span>You will earn <strong className="text-amber-950">+{estimatedEarnedPoints} bonus loyalty points</strong> upon booking completion!</span>
                            </div>
                          )}
                        </div>
                      )}

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

                      {/* Price Summary Breakdown */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs text-left">
                        <div className="flex justify-between text-gray-500 font-semibold">
                          <span>Base Package Fee ({serviceInfo.name}):</span>
                          <span className="font-bold text-dark">₹{rawServicePrice}</span>
                        </div>

                        {loyaltyDiscount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <span>Loyalty Points Cash Discount:</span>
                            <span className="font-extrabold">-₹{loyaltyDiscount}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-dark font-extrabold text-sm pt-2 border-t border-gray-200">
                          <span>Total Payable Amount:</span>
                          <span className="text-primary text-base font-black">₹{finalPayablePrice}</span>
                        </div>
                      </div>

                      {/* Pay on Delivery Guarantee Box */}
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs space-y-1 text-left">
                        <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                          <span>💵 100% Pay on Delivery — Zero Advance Needed!</span>
                        </div>
                        <p className="text-emerald-700 text-[11px] leading-relaxed">
                          No upfront payment required. Pay via Cash or UPI to your detailing squad technician only after your car wash is finished & inspected to your 100% satisfaction.
                        </p>
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
                          Confirm Booking (Pay on Delivery)
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

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { CheckCircle, Calendar, Sparkles, Car, ShieldCheck, User, Phone, Mail, Clock, MapPin, ArrowRight, Gift, Star, Tag, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { servicePrices } from "../lib/prices";
import { validateCoupon, Coupon } from "../lib/coupons";
import {
  createBooking,
  getAllServices,
  dbService,
  getLoyaltySettings,
  getUserLoyaltyPoints,
  grantOrAdjustLoyaltyPoints,
  dbLoyaltySettings,
  getAllCoupons,
  getCouponSettings
} from "../services/dbService";
import { CustomerLocationPicker, LocationCoords } from "../components/location/LocationPickerMap";
import {
  getVehicleBrands,
  getVehicleModels,
  getOrFetchVehicleImage,
  VehicleBrand,
  VehicleModel
} from "../services/vehicleDbService";

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
  const { user, profile, addAppointment, addAddress, addVehicle } = useAuth();
  const [step, setStep] = useState(1);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);
  const [services, setServices] = useState<dbService[]>([]);
  const [loyaltySettings, setLoyaltySettings] = useState<dbLoyaltySettings | null>(null);
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState<number>(0);
  const [redeemLoyalty, setRedeemLoyalty] = useState<boolean>(false);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(0);
  const [saveNewVehicle, setSaveNewVehicle] = useState<boolean>(true);

  // Vehicle system states
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [vehicleType, setVehicleType] = useState<"Car" | "Bike">("Car");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [customBrandName, setCustomBrandName] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [vehicleImagePreview, setVehicleImagePreview] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);

  // Read query parameters
  const queryService = searchParams.get("service");
  const queryCoupon = searchParams.get("coupon");
  const isRevisit = searchParams.get("revisit") === "true";

  // Coupon state
  const [dbCouponsList, setDbCouponsList] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState<string>(queryCoupon || "");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string>("");
  const [showCouponSection, setShowCouponSection] = useState(true);

  useEffect(() => {
    getAllCoupons().then(list => {
      const available = list.filter(c => c.status === "active" && (!c.assignedUserId || c.assignedUserId === "all" || (user && c.assignedUserId === user.uid)));
      setDbCouponsList(available);
    }).catch(console.error);
    getCouponSettings().then((settings) => {
      setShowCouponSection(settings.showCouponSection);
    }).catch(console.error);
  }, [user]);

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<BookingInputs>({
    defaultValues: {
      serviceType: queryService || "",
      bookingTime: "Morning (8:00 AM - 12:00 PM)",
      vehicleSelect: "",
      bookingDate: new Date().toISOString().split("T")[0]
    }
  });

  const selectedServiceKey = watch("serviceType");
  const selectedVehicleId = watch("vehicleSelect");
  const selectedAddress = watch("address");

  useEffect(() => {
    getAllServices().then((loadedServices) => {
      setServices(loadedServices);
      if (loadedServices.length > 0) {
        const targetKey = queryService || selectedServiceKey;
        const found = loadedServices.find(s =>
          s.id === targetKey ||
          s.id.toLowerCase() === targetKey?.toLowerCase() ||
          s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetKey?.toLowerCase()
        );
        if (found) {
          setValue("serviceType", found.id);
        } else {
          setValue("serviceType", loadedServices[0].id);
        }
      }
    }).catch(console.error);
    getLoyaltySettings().then(setLoyaltySettings).catch(console.error);
    if (user) {
      getUserLoyaltyPoints(user.uid).then((pts) => {
        setUserLoyaltyPoints(pts);
        setPointsToRedeemInput(pts);
      }).catch(console.error);
    }
  }, [user, queryService, setValue]);

  useEffect(() => {
    getVehicleBrands().then(setBrands).catch(console.error);
    getVehicleModels().then(setModels).catch(console.error);
  }, []);

  useEffect(() => {
    let brandName = "";
    let modelName = "";

    if (selectedBrandId && selectedBrandId !== "custom") {
      const b = brands.find(brand => brand.id === selectedBrandId);
      brandName = b ? b.name : "";
    } else {
      brandName = customBrandName;
    }

    if (selectedModelId && selectedModelId !== "custom") {
      const m = models.find(mod => mod.id === selectedModelId);
      modelName = m ? m.name : "";
    } else {
      modelName = customModelName;
    }

    if (brandName && modelName) {
      setLoadingImage(true);
      getOrFetchVehicleImage(brandName, modelName)
        .then((url) => {
          setVehicleImagePreview(url);
        })
        .catch(console.error)
        .finally(() => setLoadingImage(false));
    } else {
      setVehicleImagePreview("");
    }
  }, [selectedBrandId, selectedModelId, customBrandName, customModelName, brands, models]);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
      if (profile?.contactNumber) {
        setValue("phone", profile.contactNumber);
      }
      if (profile?.addresses && profile.addresses.length > 0) {
        const firstAddr = profile.addresses[0];
        setValue("address", typeof firstAddr === "string" ? firstAddr : `${firstAddr.addressLine}, ${firstAddr.cityStateZip}`);
      }
      if (profile?.vehicles && profile.vehicles.length > 0) {
        setValue("vehicleSelect", profile.vehicles[0].id);
      }
    }
  }, [user, profile, setValue]);

  // Lookup service details from dynamic services list
  const matchedService = services.find(s =>
    s.id === selectedServiceKey ||
    s.id.toLowerCase() === selectedServiceKey?.toLowerCase() ||
    s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === selectedServiceKey?.toLowerCase()
  );
  const fallbackPrice = services.length > 0 ? services[0].price : 0;
  const rawServicePrice = isRevisit ? 0 : (matchedService ? matchedService.price : fallbackPrice);

  // Coupon validation handlers
  const handleApplyCouponCode = useCallback((codeToApply: string) => {
    setCouponError("");
    setCouponSuccessMsg("");
    const res = validateCoupon(codeToApply, rawServicePrice, dbCouponsList);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discountAmount);
      setCouponSuccessMsg(`${res.coupon.description} applied!`);
      setCouponInput(res.coupon.code);
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(res.error || "Invalid coupon code");
    }
  }, [rawServicePrice, dbCouponsList]);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput("");
    setCouponError("");
    setCouponSuccessMsg("");
  };

  // Auto-apply query coupon code if passed in URL (/book?coupon=CLEAN15)
  useEffect(() => {
    if (queryCoupon && rawServicePrice > 0 && !appliedCoupon) {
      handleApplyCouponCode(queryCoupon);
    }
  }, [queryCoupon, rawServicePrice, appliedCoupon, handleApplyCouponCode]);

  // Recalculate coupon discount if raw service price changes
  useEffect(() => {
    if (appliedCoupon && rawServicePrice > 0) {
      const res = validateCoupon(appliedCoupon.code, rawServicePrice);
      if (res.valid) {
        setCouponDiscount(res.discountAmount);
      }
    }
  }, [rawServicePrice, appliedCoupon]);

  // Pricing & Loyalty calculations (Price after Coupon -> then apply Loyalty Points)
  const priceAfterCoupon = Math.max(0, rawServicePrice - couponDiscount);
  const pointValue = loyaltySettings?.pointRedemptionValue || 1;
  const maxDiscountPercent = loyaltySettings?.maxDiscountPercent || 50;
  const maxAllowedPoints = Math.min(
    userLoyaltyPoints,
    Math.floor((priceAfterCoupon * (maxDiscountPercent / 100)) / pointValue)
  );

  const activeRedeemedPoints = (redeemLoyalty && loyaltySettings?.enabled)
    ? Math.min(pointsToRedeemInput > 0 ? pointsToRedeemInput : userLoyaltyPoints, maxAllowedPoints)
    : 0;
  const loyaltyDiscount = activeRedeemedPoints * pointValue;
  const finalPayablePrice = Math.max(0, priceAfterCoupon - loyaltyDiscount);
  const estimatedEarnedPoints = Math.floor((finalPayablePrice / 100) * (loyaltySettings?.pointsPer100Spent || 10));

  const serviceInfo = {
    name: isRevisit ? `Revisit Request (${matchedService?.name || "Service"})` : (matchedService ? matchedService.name : (services[0]?.name || "Car Cleaning Service")),
    price: isRevisit ? "Included in Plan" : `₹${finalPayablePrice}`,
    rawPrice: rawServicePrice,
    couponDiscount,
    loyaltyDiscount,
    finalPrice: finalPayablePrice
  };

  const renderNewVehicleFields = () => {
    const filteredModels = models.filter(m => {
      const brandMatches = selectedBrandId === "custom" || m.brandId === selectedBrandId;
      const typeMatches = vehicleType === "Car" ? m.type !== "Bike" : m.type === "Bike";
      return brandMatches && typeMatches;
    });

    return (
      <div className="p-5 border border-primary/10 bg-primary/5 rounded-2xl space-y-4 text-left">
        <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">Configure Vehicle Target</h4>

        {/* Car / Bike Selector Toggle */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Vehicle Category</label>
          <div className="flex gap-2">
            {(["Car", "Bike"] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setVehicleType(type);
                  setSelectedBrandId("");
                  setSelectedModelId("");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${vehicleType === type
                    ? "bg-primary border-primary text-white shadow-xs"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
              >
                <span>{type === "Car" ? "🚗" : "🏍️"}</span>
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vehicle Brand</label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setSelectedModelId("");
              }}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">-- Choose Brand --</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              <option value="custom">+ Other / Custom Brand</option>
            </select>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vehicle Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              disabled={!selectedBrandId}
            >
              <option value="">-- Choose Model --</option>
              {filteredModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
              <option value="custom">+ Other / Custom Model</option>
            </select>
          </div>
        </div>

        {/* Custom Brand / Model Input boxes */}
        {(selectedBrandId === "custom" || selectedModelId === "custom") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-3">
            {selectedBrandId === "custom" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Enter Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aston Martin, Vespa"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            {selectedModelId === "custom" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Enter Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DB11, SXL 150"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
        )}

        {/* Registration Number */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registration Number</label>
          <input
            type="text"
            placeholder="e.g. UP-78-AB-1234"
            {...register("customVehicleNumber", { required: "Registration number is required" })}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.customVehicleNumber && (
            <p className="text-red-500 text-[10px] font-bold">{errors.customVehicleNumber.message}</p>
          )}
        </div>

        {/* Live Image Preview frame */}
        {(loadingImage || vehicleImagePreview) && (
          <div className="border border-gray-100 rounded-2xl bg-white p-3 space-y-2 text-center shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider font-sans">Vehicle Visualization</span>
            {loadingImage ? (
              <div className="h-28 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-bold">Searching & caching vehicle model image...</span>
              </div>
            ) : (
              <div className="relative h-28 bg-gray-50 rounded-xl overflow-hidden border border-gray-200/40">
                <img src={vehicleImagePreview} alt="Vehicle preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {user && (
          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={saveNewVehicle}
              onChange={(e) => setSaveNewVehicle(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-700">Save vehicle to my account for faster future bookings</span>
          </label>
        )}
      </div>
    );
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
    let vehicleNameText = "";
    if (user && profile?.vehicles && profile.vehicles.length > 0 && data.vehicleSelect !== "new") {
      const matched = profile.vehicles.find(v => v.id === data.vehicleSelect);
      finalVehicle = matched ? `${matched.name} (${matched.number})` : data.vehicleSelect;
    } else {
      let brand = "";
      let model = "";
      if (selectedBrandId && selectedBrandId !== "custom") {
        const b = brands.find(brand => brand.id === selectedBrandId);
        brand = b ? b.name : "";
      } else {
        brand = customBrandName;
      }
      if (selectedModelId && selectedModelId !== "custom") {
        const m = models.find(mod => mod.id === selectedModelId);
        model = m ? m.name : "";
      } else {
        model = customModelName;
      }
      vehicleNameText = `${brand} ${model}`.trim();
      finalVehicle = `${vehicleNameText} (${data.customVehicleNumber})`;

      if (user && saveNewVehicle && vehicleNameText && data.customVehicleNumber && addVehicle) {
        try {
          await addVehicle(vehicleNameText, data.customVehicleNumber, {
            image: vehicleImagePreview,
            status: "ACTIVE"
          });
        } catch (e) {
          console.warn("Could not save new vehicle to user profile:", e);
        }
      }
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
        discount: couponDiscount + loyaltyDiscount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        notes: data.notes,
        address: data.address,
        customerLatitude: pinnedLocation?.latitude,
        customerLongitude: pinnedLocation?.longitude,
        customerLocationUrl: pinnedLocation?.mapsUrl,
        loyaltyPointsRedeemed: activeRedeemedPoints,
        loyaltyPointsDiscount: loyaltyDiscount,
        loyaltyPointsEarned: estimatedEarnedPoints,
        vehicleImageUrl: vehicleImagePreview || undefined
      });

      // Execute post-booking side-effects in parallel for maximum speed
      const sideEffects: Promise<any>[] = [];
      if (addAppointment) {
        sideEffects.push(addAppointment(serviceName, finalVehicle, data.bookingDate, data.bookingTime, `₹${finalPayablePrice}`));
      }
      if (activeRedeemedPoints > 0) {
        sideEffects.push(grantOrAdjustLoyaltyPoints(user.uid, -activeRedeemedPoints, "redeemed", `Redeemed ${activeRedeemedPoints} pts on ${serviceName}`, newBookingId));
      }
      if (estimatedEarnedPoints > 0) {
        sideEffects.push(grantOrAdjustLoyaltyPoints(user.uid, estimatedEarnedPoints, "earned", `Earned ${estimatedEarnedPoints} pts on ${serviceName}`, newBookingId));
      }
      if (data.address) {
        const addressExists = profile?.addresses?.some((addr: string) => addr.trim() === data.address.trim());
        if (!addressExists && addAddress) {
          sideEffects.push(addAddress(data.address));
        }
      }
      await Promise.all(sideEffects);
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= 1 ? "bg-primary border-primary text-white" : "border-gray-200 text-gray-400 bg-white"
                  }`}>
                  1
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step >= 2 ? "bg-primary border-primary text-white" : "border-gray-200 text-gray-400 bg-white"
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

                      {/* Service Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Service Package</label>
                        {queryService ? (
                          <div className="relative w-full bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <input type="hidden" {...register("serviceType")} value={queryService} />
                            <div className="flex flex-col">
                              <span className="text-dark font-extrabold text-sm">{matchedService ? matchedService.name : (services[0]?.name || "Car Cleaning Service")}</span>
                              <span className="text-gray-500 text-xs font-semibold mt-0.5">₹{matchedService ? matchedService.price : fallbackPrice}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle size={14} className="stroke-[2.5]" />
                              SELECTED
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              {...register("serviceType", { required: "Service is required" })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                              {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                              ))}
                            </select>
                          </div>
                        )}
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
                        <div className="space-y-2">
                          {user && profile?.addresses && profile.addresses.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {profile.addresses.map((addr, idx) => {
                                const textVal = typeof addr === "string" ? addr : `${addr.addressLine}, ${addr.cityStateZip}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setValue("address", textVal)}
                                    className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-left truncate max-w-[200px] cursor-pointer hover:bg-primary/20"
                                    title={textVal}
                                  >
                                    {typeof addr === "string" ? addr : (addr.name || "Address")}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <textarea
                            rows={3}
                            placeholder="Provide details where vehicle is parked..."
                            {...register("address", { required: "Address is required" })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                          />
                        </div>
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

                      {/* Promo / Coupon Code Box */}
                      {!isRevisit && showCouponSection && (
                        <div className="p-4 bg-gradient-to-br from-blue-50/60 to-purple-50/40 border border-blue-100 rounded-2xl space-y-3 text-left shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary font-heading font-extrabold text-xs">
                              <Tag size={18} className="text-[#F4B400]" />
                              <span>Apply Promo / Coupon Code</span>
                            </div>
                            {appliedCoupon && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                {appliedCoupon.code} APPLIED
                              </span>
                            )}
                          </div>

                          {/* Input & Apply Button */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter promo code (e.g. CLEAN15)"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError("");
                              }}
                              className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono uppercase text-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                            />
                            {appliedCoupon ? (
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer border border-rose-200 transition-colors flex items-center gap-1"
                              >
                                <X size={14} />
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApplyCouponCode(couponInput)}
                                className="bg-primary hover:bg-[#0b327b] text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                              >
                                Apply Code
                              </button>
                            )}
                          </div>

                          {/* Success or Error feedback */}
                          {couponSuccessMsg && (
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                              <span>✅ {couponSuccessMsg}</span>
                              <span className="font-black text-sm text-emerald-600">-₹{couponDiscount}</span>
                            </div>
                          )}
                          {couponError && (
                            <p className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-xl">
                              ⚠️ {couponError}
                            </p>
                          )}

                          {/* Available Coupons Badges */}
                          {dbCouponsList.length > 0 && (
                            <div className="pt-1 border-t border-blue-100/80">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                Available Codes for You (Click to Apply):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {dbCouponsList.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => handleApplyCouponCode(c.code)}
                                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${appliedCoupon?.code === c.code
                                        ? "bg-primary text-white border-primary shadow-xs"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
                                      }`}
                                    title={c.description}
                                  >
                                    🎁 {c.code} ({c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

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

                      {/* Vehicle selection (Dropdown of saved + option to add new vehicle, or inputs if empty/logged-out) */}
                      <div className="space-y-4">
                        {user && profile?.vehicles && profile.vehicles.length > 0 ? (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Vehicle</label>
                              <select
                                {...register("vehicleSelect", { required: "Vehicle selection is required" })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer"
                              >
                                {profile.vehicles.map((v) => (
                                  <option key={v.id} value={v.id}>{v.name} ({v.number})</option>
                                ))}
                                <option value="new">+ Add / Select New Vehicle</option>
                              </select>
                            </div>

                            {selectedVehicleId === "new" && renderNewVehicleFields()}
                          </div>
                        ) : (
                          renderNewVehicleFields()
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
                              placeholder="+91 95699 49626
+91 92501 64163"
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
                      {!isRevisit ? (
                        <>
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs text-left">
                            <div className="flex justify-between text-gray-500 font-semibold">
                              <span>Base Package Fee ({serviceInfo.name}):</span>
                              <span className="font-bold text-dark">₹{rawServicePrice}</span>
                            </div>

                            {couponDiscount > 0 && (
                              <div className="flex justify-between text-purple-700 font-bold bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                                <span>Promo Coupon Discount ({appliedCoupon?.code}):</span>
                                <span className="font-extrabold text-purple-600">-₹{couponDiscount}</span>
                              </div>
                            )}

                            {loyaltyDiscount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                                <span>Loyalty Points Cash Discount:</span>
                                <span className="font-extrabold text-emerald-600">-₹{loyaltyDiscount}</span>
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
                        </>
                      ) : (
                        <div className="p-4 bg-[#F4B400]/10 border border-[#F4B400]/30 rounded-2xl text-amber-900 text-xs space-y-1 text-left">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <Star size={16} className="text-[#F4B400] shrink-0 fill-[#F4B400]" />
                            <span>Subscription Revisit Request</span>
                          </div>
                          <p className="text-amber-800 text-[11px] leading-relaxed font-semibold">
                            This revisit is completely free and included in your active subscription plan.
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
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
                        <p className="text-[11px] text-gray-400 text-center font-medium">
                          By booking, you agree to our{" "}
                          <Link to="/terms" className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer">
                            Terms & Conditions
                          </Link>
                          .
                        </p>
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

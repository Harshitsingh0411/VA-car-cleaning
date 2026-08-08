import React, { useState, useEffect, useCallback } from "react";
import { isLocalBlobUrl } from "../utils/mediaUtils";
import { useImageLightbox } from "../context/ImageLightboxContext";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "../components/seo/SEO";
import {
  User,
  Phone,
  MapPin,
  Car,
  Calendar,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  ShieldAlert,
  Settings,
  Shield,
  Gift,
  Search,
  Activity,
  Key,
  Globe,
  Sliders,
  Star,
  Crown,
  X,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  Pencil,
  Camera,
  Headphones,
  Mail,
  ChevronRight,
  Percent,
  Award,
  ArrowLeft,
  Home,
  Tag,
  Navigation,
  Lightbulb,
  ShieldCheck,
  FileText
} from "lucide-react";
import {
  logAuditAction,
  getBookingsByCustomer,
  dbBooking,
  getAllReviews,
  dbReview,
  getUserLoyaltyPoints,
  getUserLoyaltyHistory,
  dbLoyaltyTransaction,
  getActiveSubscription,
  ActiveSubscription,
  rescheduleBooking,
  getAllCoupons,
  dbCoupon
} from "../services/dbService";
import { getCartoonAvatar, handleAvatarError } from "../utils/avatar";
import ReviewModal from "../components/modals/ReviewModal";
import EmployeeDashboard from "./crew/EmployeeDashboard";
import { GoogleMapEmbed, CustomerLocationPicker } from "../components/location/LocationPickerMap";
import CloudinaryUploader from "../components/common/CloudinaryUploader";
import VehicleMediaThumbnail from "../components/ui/VehicleMediaThumbnail";
import { downloadInvoice } from "../utils/invoiceGenerator";
import { getBookingWhatsAppSupportUrl } from "../utils/whatsappUtils";

export default function Account() {
  const {
    user,
    loading,
    profile,
    logout,
    updateContactNumber,
    addAddress,
    removeAddress,
    addVehicle,
    removeVehicle,
    updateProfileDetails
  } = useAuth();

  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const { openLightbox } = useImageLightbox();

  // Tab Manager: "dashboard" | "profile" | "edit_profile" | "vehicles" | "addresses" | "payments" | "bookings" | "rewards" | "security" | "help" | "crew_dashboard"
  type AccountSection = "dashboard" | "profile" | "edit_profile" | "vehicles" | "addresses" | "payments" | "bookings" | "rewards" | "security" | "help" | "crew_dashboard";

  const validSections: AccountSection[] = [
    "dashboard", "profile", "edit_profile", "vehicles", "addresses", "bookings", "rewards", "security", "help", "crew_dashboard"
  ];

  const isCrewUser = profile?.role === "staff" || profile?.role === "crew";

  const getInitialSection = (): AccountSection => {
    if (section && validSections.includes(section as AccountSection)) {
      return section as AccountSection;
    }
    return isCrewUser ? "crew_dashboard" : "dashboard";
  };

  const [activeSection, setActiveSectionState] = useState<AccountSection>(getInitialSection);

  useEffect(() => {
    if (section && validSections.includes(section as AccountSection)) {
      setActiveSectionState(section as AccountSection);
    } else if (!section) {
      if (isCrewUser) {
        setActiveSectionState("crew_dashboard");
      } else {
        setActiveSectionState("dashboard");
      }
    }
  }, [section, isCrewUser]);

  const setActiveSection = (sec: AccountSection | string) => {
    const target = sec as AccountSection;
    setActiveSectionState(target);
    if (target === "dashboard") {
      navigate("/account");
    } else {
      navigate(`/account/${target}`);
    }
  };


  // Local Form state managers
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editPhoto, setEditPhoto] = useState(profile?.photo || user?.photoURL || "");
  const [editPhone, setEditPhone] = useState(profile?.contactNumber || "");
  const [editGender, setEditGender] = useState(profile?.gender || "Male");
  const [editDob, setEditDob] = useState(profile?.dob || "");
  const [editOcc, setEditOcc] = useState(profile?.occupation || "");
  const [editLang, setEditLang] = useState(profile?.preferredLanguage || "English");
  const [editNotif, setEditNotif] = useState(profile?.notificationPreference || "Both");
  const [editTheme, setEditTheme] = useState(profile?.themePreference || "Light");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfileDetails({
        name: editName,
        photo: editPhoto,
        contactNumber: editPhone,
        gender: editGender,
        dob: editDob,
        occupation: editOcc,
        preferredLanguage: editLang,
        notificationPreference: editNotif,
        themePreference: editTheme,
        profileCompletion: 85
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    } catch (err: any) {
      alert("Error saving profile: " + (err.message || "Failed to update profile."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [userLoyaltyPts, setUserLoyaltyPts] = useState<number>(0);
  const [loyaltyHistoryList, setLoyaltyHistoryList] = useState<dbLoyaltyTransaction[]>([]);

  const fetchLoyaltyData = useCallback(async () => {
    if (!user) return;
    try {
      const pts = await getUserLoyaltyPoints(user.uid);
      const hist = await getUserLoyaltyHistory(user.uid);
      setUserLoyaltyPts(pts);
      setLoyaltyHistoryList(hist);
    } catch (e) {
      console.warn("Could not fetch user loyalty info:", e);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user, fetchLoyaltyData]);

  const myVehicles = profile?.vehicles || [];
  const myAddresses = profile?.addresses || [];

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    addressLine: "",
    cityStateZip: "",
    phone: "",
    tag: "Home",
    isDefault: false
  });

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let updatedAddresses = [...(profile.addresses || [])];

    if (editingAddress !== null) {
      updatedAddresses[editingAddress] = addressForm;
    } else {
      updatedAddresses.push(addressForm);
    }

    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map((addr, idx) => {
        if (typeof addr === "string") return addr;
        return {
          ...addr,
          isDefault: idx === (editingAddress !== null ? editingAddress : updatedAddresses.length - 1)
        };
      });
    }

    try {
      await updateProfileDetails({ addresses: updatedAddresses });
      setShowAddressModal(false);
      setEditingAddress(null);
      logAuditAction(editingAddress !== null ? "Updated profile address" : "Added profile address");
    } catch (err: any) {
      alert("Failed to save address: " + err.message);
    }
  };

  const handleRemoveAddress = async (idx: number) => {
    if (!profile || !window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const addresses = (profile.addresses || []).filter((_, i) => i !== idx);
      await updateProfileDetails({ addresses });
      logAuditAction("Removed profile address");
    } catch (err: any) {
      alert("Failed to remove address: " + err.message);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mockAddrLine = `GPS Clean Spot, Near Latitude ${lat.toFixed(4)}, Longitude ${lng.toFixed(4)}`;
          const mockCityZip = "Gurgaon, Haryana 122002";

          setAddressForm({
            name: "GPS Location Spot",
            addressLine: mockAddrLine,
            cityStateZip: mockCityZip,
            phone: profile?.contactNumber || "",
            tag: "Other",
            isDefault: false
          });
          setEditingAddress(null);
          setShowAddressModal(true);
        },
        (error) => {
          alert("Error retrieving GPS coordinates: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const [showAllQuickAccess, setShowAllQuickAccess] = useState(false);

  const quickAccessItems = [
    {
      id: "bookings",
      title: "My Bookings",
      subtitle: "View all bookings",
      icon: Calendar,
      bgColor: "bg-[#EEF5FE]",
      borderColor: "border-blue-100",
      textColor: "text-primary",
    },
    {
      id: "vehicles",
      title: "My Vehicles",
      subtitle: "Manage garage",
      icon: Car,
      bgColor: "bg-[#ECFDF5]",
      borderColor: "border-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      id: "addresses",
      title: "My Addresses",
      subtitle: "Saved addresses",
      icon: MapPin,
      bgColor: "bg-[#FEF9E7]",
      borderColor: "border-amber-100",
      textColor: "text-amber-600",
    },
    {
      id: "rewards",
      title: "My Rewards",
      subtitle: "Points & offers",
      icon: Gift,
      bgColor: "bg-[#F5F3FF]",
      borderColor: "border-purple-100",
      textColor: "text-purple-600",
    },

    {
      id: "security",
      title: "Account Security",
      subtitle: "Password & security",
      icon: Shield,
      bgColor: "bg-[#FFF1F2]",
      borderColor: "border-rose-100",
      textColor: "text-rose-600",
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "24/7 care & FAQs",
      icon: HelpCircle,
      bgColor: "bg-[#ECFEFF]",
      borderColor: "border-cyan-100",
      textColor: "text-cyan-600",
    },
    {
      id: "edit_profile",
      title: "Edit Profile",
      subtitle: "Update profile info",
      icon: Pencil,
      bgColor: "bg-[#EEF2FF]",
      borderColor: "border-indigo-100",
      textColor: "text-indigo-600",
    },
  ];

  if (isCrewUser) {
    quickAccessItems.push({
      id: "crew_dashboard",
      title: "Crew Panel",
      subtitle: "Staff control panel",
      icon: Briefcase,
      bgColor: "bg-[#F0FDF4]",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
    });
  }

  const [newAddr, setNewAddr] = useState("");
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  const [vehName, setVehName] = useState("");
  const [vehNum, setVehNum] = useState("");
  const [vehType, setVehType] = useState("SUV");
  const [vehYear, setVehYear] = useState("2023");
  const [editingVehId, setEditingVehId] = useState<string | null>(null);
  const [isAddingVeh, setIsAddingVeh] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const searchVehicleImage = async (name: string): Promise<string> => {
    try {
      const isBike = name.toLowerCase().includes("bike") || name.toLowerCase().includes("motorcycle") || name.toLowerCase().includes("bullet") || name.toLowerCase().includes("scooter") || name.toLowerCase().includes("r15") || name.toLowerCase().includes("royal enfield") || name.toLowerCase().includes("yamaha") || name.toLowerCase().includes("pulsar") || name.toLowerCase().includes("tvs") || name.toLowerCase().includes("hero") || name.toLowerCase().includes("honda bike") || name.toLowerCase().includes("splendor");
      const query = isBike ? `${name} motorcycle` : `${name} car`;
      const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular;
        }
      }
    } catch (err) {
      console.warn("Could not fetch image from Unsplash napi:", err);
    }
    const isBike = name.toLowerCase().includes("bike") || name.toLowerCase().includes("motorcycle") || name.toLowerCase().includes("bullet") || name.toLowerCase().includes("scooter") || name.toLowerCase().includes("r15") || name.toLowerCase().includes("royal enfield") || name.toLowerCase().includes("yamaha") || name.toLowerCase().includes("pulsar") || name.toLowerCase().includes("tvs") || name.toLowerCase().includes("hero") || name.toLowerCase().includes("honda bike") || name.toLowerCase().includes("splendor");
    return isBike
      ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
      : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
  };

  const handleEditVehicleClick = (v: any) => {
    setEditingVehId(v.id || v.name);
    setVehName(v.name || "");
    setVehNum(v.number || "");
    setVehType(v.type || "SUV");
    setVehYear(v.year || "2023");
    setShowAddVehicle(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName || !vehNum) return;
    setIsAddingVeh(true);
    try {
      if (editingVehId) {
        const existing = myVehicles.find((v) => (v.id || v.name) === editingVehId);
        const imageToUse = existing?.image || (await searchVehicleImage(vehName));
        const updatedVehicles = myVehicles.map((v) => {
          if ((v.id || v.name) === editingVehId) {
            return {
              ...v,
              name: vehName,
              number: vehNum,
              type: vehType,
              year: vehYear,
              image: imageToUse
            };
          }
          return v;
        });
        await updateProfileDetails({ vehicles: updatedVehicles });
        logAuditAction(`Updated vehicle details: ${vehName}`);
      } else {
        const fetchedImage = await searchVehicleImage(vehName);
        await addVehicle(vehName, vehNum, {
          image: fetchedImage,
          type: vehType,
          year: vehYear,
          status: "ACTIVE"
        });
        logAuditAction(`Added vehicle: ${vehName} with image search`);
      }
      setVehName("");
      setVehNum("");
      setVehType("SUV");
      setVehYear("2023");
      setEditingVehId(null);
      setShowAddVehicle(false);
    } catch (err: any) {
      alert("Failed to save vehicle: " + (err.message || "Error"));
    } finally {
      setIsAddingVeh(false);
    }
  };

  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Real bookings & review state
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [bookings, setBookings] = useState<dbBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFetched, setBookingsFetched] = useState(false);
  const [viewingBookingDetails, setViewingBookingDetails] = useState<Partial<dbBooking> | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Partial<dbBooking> | null>(null);
  const [reviewsList, setReviewsList] = useState<dbReview[]>([]);

  // Reschedule state
  const [rescheduleBookingItem, setRescheduleBookingItem] = useState<dbBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<string>("Morning (8:00 AM - 12:00 PM)");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState("");
  const [rescheduleErrorMsg, setRescheduleErrorMsg] = useState("");

  const handleOpenRescheduleModal = (b: dbBooking) => {
    setRescheduleBookingItem(b);
    setRescheduleDate(b.scheduledDate || new Date().toISOString().split("T")[0]);
    setRescheduleTimeSlot(b.timeSlot || "Morning (8:00 AM - 12:00 PM)");
    setRescheduleSuccessMsg("");
    setRescheduleErrorMsg("");
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBookingItem) return;
    if (!rescheduleDate) {
      setRescheduleErrorMsg("Please select a valid scheduled date.");
      return;
    }
    setRescheduleLoading(true);
    setRescheduleErrorMsg("");
    setRescheduleSuccessMsg("");
    try {
      await rescheduleBooking(rescheduleBookingItem.id, rescheduleDate, rescheduleTimeSlot);
      setRescheduleSuccessMsg("Booking date & time slot updated successfully!");
      await fetchBookings();
      setTimeout(() => {
        setRescheduleBookingItem(null);
        setRescheduleSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      console.error("Reschedule error:", err);
      setRescheduleErrorMsg(err.message || "Failed to reschedule booking. Please try again.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const [userCoupons, setUserCoupons] = useState<dbCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!user) return;
    setCouponsLoading(true);
    try {
      const allCoupons = await getAllCoupons();
      const eligible = allCoupons.filter(c => {
        if (c.status === "inactive") return false;
        const isForAll = !c.assignedUserId || c.assignedUserId === "all";
        const isForThisUid = c.assignedUserId === user.uid;
        const isForThisEmail = c.assignedUserEmail && user.email && c.assignedUserEmail.toLowerCase() === user.email.toLowerCase();
        return isForAll || isForThisUid || isForThisEmail;
      });
      setUserCoupons(eligible);
    } catch (err) {
      console.error("Failed to fetch user coupons:", err);
    } finally {
      setCouponsLoading(false);
    }
  }, [user]);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    try {
      const allRev = await getAllReviews(true);
      setReviewsList(allRev);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const data = await getBookingsByCustomer(user.uid);
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setBookings(data);

      const sub = await getActiveSubscription(user.uid);
      setActiveSub(sub);

      setBookingsFetched(true);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  // Fetch bookings, reviews & coupons on mount
  useEffect(() => {
    if (user && !bookingsFetched) {
      fetchBookings();
      fetchReviews();
      fetchCoupons();
    }
  }, [user, bookingsFetched, fetchBookings, fetchReviews, fetchCoupons]);

  const getStatusDetails = (status?: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "pending") {
      return { label: "PENDING", className: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    if (s === "accepted" || s === "assigned") {
      return { label: "ACCEPTED", className: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if (s === "in progress" || s === "inprogress" || s.includes("progress") || s.includes("ongoing")) {
      return { label: "IN PROGRESS", className: "bg-purple-100 text-purple-700 border-purple-200" };
    }
    if (s === "completed" || s.includes("complete") || s.includes("finish") || s.includes("done")) {
      return { label: "COMPLETED", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    }
    if (s === "cancelled" || s.includes("cancel") || s.includes("reject")) {
      return { label: "CANCELLED", className: "bg-rose-100 text-rose-700 border-rose-200" };
    }
    return { label: (status || "PENDING").toUpperCase(), className: "bg-amber-100 text-amber-800 border-amber-200" };
  };


  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Route protection
  if (!user) {
    return (
      <div className="pt-24 min-h-screen bg-[#F8FAFC] flex items-center justify-center text-center px-4">
        <div className="max-w-md p-8 bg-white rounded-3xl shadow-lg border border-gray-100 space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-dark">Access Denied</h2>
            <p className="text-gray-500 text-xs mt-2">Please login or register to view your personal car cleaning dashboard.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow">
              Sign In
            </Link>
            <Link to="/register" className="bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2.5 px-6 rounded-xl text-xs">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Combine bookings from the bookings collection with any legacy profile appointments
  const profileAppointments = (profile?.appointments || []).map(appt => ({
    id: appt.id,
    serviceName: appt.service,
    vehicleDetails: appt.vehicle,
    scheduledDate: appt.date,
    timeSlot: appt.time,
    bookingStatus: appt.status as dbBooking["bookingStatus"],
    price: parseFloat(appt.price.replace(/[^0-9.]/g, "")) || 0
  })) as Partial<dbBooking>[];

  // Merge: real bookings first, then any legacy profile appointments not already in bookings
  // Filter out duplicate legacy appointments matching the same date, time slot, and service name
  const allBookings: Partial<dbBooking>[] = [
    ...bookings,
    ...profileAppointments.filter(pa =>
      !bookings.some(b =>
        b.id === pa.id ||
        (b.scheduledDate === pa.scheduledDate &&
          b.timeSlot === pa.timeSlot &&
          b.serviceName === pa.serviceName)
      )
    )
  ];



  const handleAddrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr) return;
    await addAddress(newAddr);
    setIsAddingAddr(false);
    setNewAddr("");
  };

  const handleVehSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName || !vehNum) return;
    await addVehicle(vehName, vehNum);
    setIsAddingVeh(false);
    setVehName("");
    setVehNum("");
  };

  const handlePasswordReset = async () => {
    // Simulated Password reset trigger
    setPasswordSuccess(true);
    await logAuditAction(`Customer requested profile password reset link.`);
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const renderTabSections = () => (
    <>
      {/* EDIT PROFILE TAB */}
      {activeSection === "edit_profile" && (
        <form onSubmit={handleProfileSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          <h3 className="font-heading font-extrabold text-dark text-lg">Personal Profile Settings</h3>

          <div className="flex flex-col items-center sm:items-start gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Profile Photo</label>
            <div className="w-full max-w-sm">
              <CloudinaryUploader
                value={editPhoto}
                onChange={(url) => setEditPhoto(url)}
                label="Upload New Profile Picture"
              />
              {editPhoto && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={editPhoto} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <span className="text-xs text-gray-500 font-medium">Photo selected</span>
                </div>
              )}
            </div>
          </div>

          {profileSaveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Profile updated successfully in Firestore database!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-[#0b327b] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* BOOKINGS HISTORY TAB */}
      {activeSection === "bookings" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-dark text-lg">Booking & Detailing Records</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Track your ongoing, scheduled and completed car detailing appointments.</p>
            </div>
            <Link to="/services">
              <button className="bg-primary hover:bg-[#0b327b] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-sm transition-all cursor-pointer">
                Schedule Detailing
              </button>
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="py-12 text-center text-gray-400 font-bold text-xs">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Fetching real-time appointments from Firestore...</span>
            </div>
          ) : allBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Calendar size={36} className="mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-500">No active or past bookings found for your account.</p>
              <Link to="/services">
                <button className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all mt-2">
                  Book Your First Service
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {allBookings.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => navigate(`/account/booking/${appt.id}`)}
                  className="p-5 border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all space-y-3 bg-white cursor-pointer group"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex items-center gap-3.5">
                      <VehicleMediaThumbnail serviceName={appt.serviceName} vehicleDetails={appt.vehicleDetails} />
                      <div>
                        <h4 className="font-heading font-extrabold text-dark text-sm leading-snug group-hover:text-primary transition-colors">{appt.serviceName}</h4>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                          Vehicle: {appt.vehicleDetails}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-black text-dark">₹{appt.price}</span>
                      <span className={`text-[9px] uppercase font-bold py-1 px-2.5 rounded-full border ${appt.bookingStatus === "Completed"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : appt.bookingStatus === "Pending"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : appt.bookingStatus === "Cancelled"
                            ? "bg-rose-50 text-rose-500 border-rose-100"
                            : appt.bookingStatus === "In Progress"
                              ? "bg-purple-50 text-purple-600 border-purple-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                        {appt.bookingStatus || "Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex flex-col gap-2 text-[11px] text-gray-500 font-semibold">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-primary" />
                        <span>Date & Slot: {appt.scheduledDate || "Scheduled Date"} • {appt.timeSlot || "Standard Slot"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoice(appt);
                          }}
                          className="bg-primary/10 hover:bg-primary text-primary hover:text-white font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-primary/20"
                          title="Download Invoice PDF"
                        >
                          <FileText size={12} />
                          <span>Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingForReview(appt);
                          }}
                          className="bg-[#F4B400] hover:bg-amber-400 text-dark font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <Star size={12} className="fill-dark text-dark" />
                          <span>Rate & Review</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/account/booking/${appt.id}`);
                          }}
                          className="text-[#0B3890] hover:underline font-extrabold cursor-pointer"
                        >
                          View Details →
                        </button>

                        {(appt.bookingStatus === "Pending" || appt.bookingStatus === "Assigned") && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRescheduleBookingItem(appt as dbBooking);
                              setRescheduleDate(appt.scheduledDate || "");
                              setRescheduleTimeSlot(appt.timeSlot || "Morning (8:00 AM - 12:00 PM)");
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-lg border border-amber-200/60 cursor-pointer transition-colors"
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VEHICLES TAB */}
      {activeSection === "vehicles" && (() => {
        const completedBookings = bookings.filter(b => b.status === "Completed" || b.status === "finish" || b.status === "done" || b.status === "completed");
        const totalSpentVal = completedBookings.reduce((sum, b) => sum + Number(String(b.price || "0").replace(/[^\d]/g, "") || 0), 0);

        return (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading font-extrabold text-dark text-lg">My Garage Vehicles</h3>
                <p className="text-xs text-gray-500 font-medium">Save vehicle details for fast 1-click bookings.</p>
              </div>
              <button
                onClick={() => {
                  setEditingVehId(null);
                  setVehName("");
                  setVehNum("");
                  setVehType("SUV");
                  setVehYear("2023");
                  setShowAddVehicle(!showAddVehicle);
                }}
                className="bg-primary hover:bg-[#0b327b] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Vehicle</span>
              </button>
            </div>

            {showAddVehicle && (
              <form onSubmit={handleSaveVehicle} className="p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-4">
                <h4 className="font-heading font-bold text-dark text-sm">
                  {editingVehId ? "Edit Vehicle Details" : "Register New Vehicle"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Vehicle Name / Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Tiago / Royal Enfield"
                      value={vehName}
                      onChange={(e) => setVehName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Registration Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UP-78-BL5252"
                      value={vehNum}
                      onChange={(e) => setVehNum(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Vehicle Type</label>
                    <select
                      value={vehType}
                      onChange={(e) => setVehType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="MUV">MUV / Crossover</option>
                      <option value="Sports Bike">Sports Bike</option>
                      <option value="Cruiser Bike">Cruiser Bike</option>
                      <option value="Scooter">Scooter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Model Year</label>
                    <select
                      value={vehYear}
                      onChange={(e) => setVehYear(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {Array.from({ length: 15 }, (_, i) => String(2026 - i)).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddVehicle(false);
                      setEditingVehId(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200/50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingVeh}
                    className="bg-primary text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm hover:bg-[#0b327b] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAddingVeh ? "Saving..." : editingVehId ? "Update Vehicle" : "Save Vehicle"}
                  </button>
                </div>
              </form>
            )}

            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Vehicles", value: String(myVehicles.length).padStart(2, "0"), icon: "🚘", color: "text-blue-600", bg: "bg-blue-50/50 border-blue-100" },
                { label: "Active Vehicles", value: String(myVehicles.filter(v => v.status !== "INACTIVE").length).padStart(2, "0"), icon: "✅", bg: "bg-emerald-50/50 border-emerald-100", color: "text-emerald-600" },
                { label: "Total Bookings", value: String(bookings.length).padStart(2, "0"), icon: "📅", bg: "bg-amber-50/50 border-amber-100", color: "text-amber-600" },
                { label: "Total Spent", value: `₹${totalSpentVal.toLocaleString("en-IN")}`, icon: "🪙", bg: "bg-purple-50/50 border-purple-100", color: "text-purple-600" }
              ].map((kpi, i) => (
                <div key={i} className={`bg-white border ${kpi.bg} rounded-2xl p-4 flex items-center gap-3 shadow-xs`}>
                  <div className="text-xl shrink-0">{kpi.icon}</div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-xs md:text-sm font-black ${kpi.color}`}>{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* VEHICLES ROW GRID */}
            <div className="space-y-4">
              {myVehicles.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                  <span className="text-2xl block mb-2">🚗</span>
                  <p className="text-xs text-gray-400 font-semibold">No vehicles registered yet. Click "Add Vehicle" above to get started.</p>
                </div>
              ) : (
                myVehicles.map((v, idx) => (
                  <div key={v.id || idx} className="flex flex-col lg:flex-row border border-gray-100 rounded-3xl p-4 gap-5 bg-gray-50/20 hover:bg-white hover:border-gray-200 transition-all items-center justify-between">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full lg:w-auto">
                      {/* Image frame */}
                      <div className="relative w-full sm:w-44 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-xs border border-gray-200/40">
                        <img
                          src={v.image || (v.type?.toLowerCase().includes("bike") || v.name.toLowerCase().includes("bike") || v.name.toLowerCase().includes("bullet") || v.name.toLowerCase().includes("pulsar") || v.name.toLowerCase().includes("r15")
                            ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
                            : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
                          )}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Specs */}
                      <div className="flex-grow space-y-2.5 text-left w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading font-extrabold text-dark text-sm leading-snug">{v.name}</h4>
                          <span className="bg-gray-100 border border-gray-200 text-gray-500 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{v.number}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-500 font-semibold max-w-xs">
                          <div>
                            <span className="text-gray-400 block text-[8px] uppercase tracking-wider">Vehicle Type</span>
                            <span className="text-dark font-extrabold">{v.type || "SUV"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[8px] uppercase tracking-wider">Model Year</span>
                            <span className="text-dark font-extrabold">{v.year || "2023"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                      <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${v.status !== "INACTIVE"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}>
                        {v.status || "ACTIVE"}
                      </span>

                      <Link to={`/book?vehicle=${v.id}`} className="shrink-0">
                        <button className="bg-primary hover:bg-[#0b327b] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1">
                          Book Service
                        </button>
                      </Link>

                      <button
                        onClick={() => handleEditVehicleClick(v)}
                        className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                        title="Edit Vehicle Details"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${v.name} from your garage?`)) {
                            removeVehicle(v.id);
                            logAuditAction(`Removed vehicle: ${v.name}`);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BOTTOM GARAGE FOOTER */}
            <div className="bg-[#0B1528] rounded-[24px] p-5 text-left border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <h4 className="font-heading font-extrabold text-white text-xs">Why add vehicles?</h4>
                  <p className="text-gray-400 text-[10px] font-medium leading-snug">Get faster bookings, service history, exclusive offers and smart reminders.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-white/5 pt-4">
                {[
                  { title: "Faster Booking", desc: "1-click wash reservations", emoji: "⚡" },
                  { title: "Service History", desc: "Detailed cleanliness logs", emoji: "📋" },
                  { title: "Exclusive Offers", desc: "Custom mileage discounts", emoji: "🎁" },
                  { title: "Smart Reminders", desc: "Timely clean suggestions", emoji: "⏰" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-base">{item.emoji}</div>
                    <h5 className="font-bold text-white text-[10px]">{item.title}</h5>
                    <p className="text-gray-500 text-[8px] leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ADDRESSES TAB */}
      {activeSection === "addresses" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          {/* Header Row */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-[#0F172A]">Doorstep Cleaning Addresses</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Pinpoint location for quick doorstep cleaning visits.</p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setAddressForm({ name: "", addressLine: "", cityStateZip: "", phone: profile?.contactNumber || "", tag: "Home", isDefault: false });
                setShowAddressModal(true);
              }}
              className="bg-primary hover:bg-[#0b327b] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Grid Layout: Left Column (span 2) & Right Column (span 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* LEFT COLUMN: Map GPS card + Saved Addresses list */}
            <div className="lg:col-span-2 space-y-6">

              {/* GPS Card */}
              <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
                {/* Subtle map pattern using inline SVG */}
                <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="0" y1="20" x2="100" y2="20" />
                    <line x1="0" y1="50" x2="100" y2="50" />
                    <line x1="0" y1="80" x2="100" y2="80" />
                    <line x1="20" y1="0" x2="20" y2="100" />
                    <line x1="50" y1="0" x2="50" y2="100" />
                    <line x1="80" y1="0" x2="80" y2="100" />
                    <circle cx="60" cy="50" r="10" />
                  </svg>
                </div>

                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md block w-fit mb-1">
                      Current Location
                    </span>
                    <h4 className="font-heading font-extrabold text-[#0F172A] text-sm">Google Maps GPS Location</h4>
                    <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Using your current device location</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Accurate to 12 meters
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  className="bg-primary hover:bg-[#0b327b] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer relative z-10 shrink-0 transition-all"
                >
                  <Navigation size={14} className="rotate-45" />
                  <span>Use Current Location</span>
                </button>
              </div>

              {/* SAVED ADDRESSES BOX */}
              <div className="space-y-4">
                <h3 className="text-sm font-heading font-extrabold text-[#0F172A] uppercase tracking-wider">Saved Addresses</h3>

                <div className="space-y-3">
                  {myAddresses.length === 0 ? (
                    <div className="p-8 text-center border border-gray-100 rounded-3xl bg-white text-xs text-gray-400 font-semibold">
                      No saved addresses yet. Click "+ Add New Address" to save one.
                    </div>
                  ) : (
                    myAddresses.map((addr: any, idx: number) => {
                      const isObj = typeof addr !== "string";
                      const addressName = isObj ? (addr.name || "My Address") : (idx === 0 ? "Home" : idx === 1 ? "Office" : "Other");
                      const addressText = isObj ? addr.addressLine : addr;
                      const cityZipText = isObj ? addr.cityStateZip : "";
                      const phoneText = isObj ? addr.phone : (profile?.contactNumber || "");
                      const tagLabel = isObj ? (addr.tag || "Home") : (idx === 0 ? "Home" : idx === 1 ? "Office" : "Family");
                      const isDefault = isObj ? !!addr.isDefault : (idx === 0);

                      // Determine icon based on tag/type
                      const IconComponent = tagLabel.toLowerCase() === "office" ? Briefcase : (tagLabel.toLowerCase() === "home" ? Home : Star);

                      return (
                        <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 shadow-2xs hover:shadow-xs transition-all group">
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-[#EEF5FE] text-primary flex items-center justify-center shrink-0">
                              <IconComponent size={20} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-heading font-extrabold text-[#0F172A] text-sm">{addressName}</h4>
                                {isDefault && (
                                  <span className="bg-blue-50 text-primary border border-blue-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 font-semibold leading-relaxed">{addressText}</p>
                              {cityZipText && (
                                <p className="text-xs text-gray-500 font-medium">{cityZipText}</p>
                              )}
                              <div className="flex flex-wrap gap-2 pt-1.5">
                                {phoneText && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gray-50 text-gray-500 border border-gray-100">
                                    <Phone size={10} />
                                    {phoneText}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gray-50 text-gray-500 border border-gray-100">
                                  <Tag size={10} />
                                  {tagLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAddress(idx);
                                setAddressForm(isObj ? addr : { name: addressName, addressLine: addressText, cityStateZip: cityZipText, phone: phoneText, tag: tagLabel, isDefault });
                                setShowAddressModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl cursor-pointer transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveAddress(idx)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Quick Tips & Privacy */}
            <div className="space-y-4">

              {/* Quick Tips */}
              <div className="bg-[#EEF5FE]/60 border border-blue-50/50 rounded-3xl p-6 text-left space-y-4 shadow-2xs">
                <div className="flex gap-2 items-center text-primary">
                  <Lightbulb size={18} className="animate-pulse" />
                  <h4 className="font-heading font-extrabold text-sm text-[#0F172A]">Quick Tips</h4>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-600 font-semibold leading-relaxed">
                  <li className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Add multiple addresses for home, office or any other locations.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Set a default address to speed up booking.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Ensure accurate location for better service.</span>
                  </li>
                </ul>
              </div>

              {/* Privacy Shield */}
              <div className="bg-[#ECFDF5]/60 border border-emerald-50/50 rounded-3xl p-6 text-left space-y-3 shadow-2xs">
                <div className="flex gap-2 items-center text-emerald-600">
                  <ShieldCheck size={18} />
                  <h4 className="font-heading font-extrabold text-sm text-[#0F172A]">We value your privacy</h4>
                </div>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                  Your location data is secure and used only for providing our services.
                </p>
              </div>

            </div>

          </div>

          {/* ADDRESS INPUT MODAL OVERLAY */}
          {showAddressModal && (
            <div className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-extrabold text-dark text-lg">
                    {editingAddress !== null ? "Edit Address" : "Add New Address"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddressModal(false);
                      setEditingAddress(null);
                    }}
                    className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Address Label / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Home, Office, Parents Home"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Address Line</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123, Green Park Extension, Near Metro Station"
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">City, State & Zip</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. New Delhi, Delhi 110016"
                        value={addressForm.cityStateZip}
                        onChange={(e) => setAddressForm({ ...addressForm, cityStateZip: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contact Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 95699 49626
+91 92501 64163"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Tag Icon</label>
                      <select
                        value={addressForm.tag}
                        onChange={(e) => setAddressForm({ ...addressForm, tag: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white cursor-pointer"
                      >
                        <option value="Home">Home (House Icon)</option>
                        <option value="Office">Office (Briefcase Icon)</option>
                        <option value="Family">Family (Star Icon)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="isDefault" className="text-xs font-bold text-gray-600 select-none cursor-pointer">Set as default</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
                  >
                    {editingAddress !== null ? "Save Changes" : "Save Address"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}



      {/* REWARDS TAB */}
      {activeSection === "rewards" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          <div className="bg-gradient-to-r from-primary to-[#0B3890] text-white p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary-light tracking-widest block">Available Rewards Balance</span>
              <h2 className="text-3xl font-heading font-black">{userLoyaltyPts || 89} Loyalty Points</h2>
              <p className="text-xs text-blue-100 mt-1">Earn 10 points on every car or bike wash!</p>
            </div>
            <button onClick={() => navigate('/services')} className="bg-[#F4B400] text-dark font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase shadow hover:bg-amber-400 transition-all">
              Redeem Offers
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-extrabold text-dark text-sm">My Available Vouchers & Promo Codes</h4>
              <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">
                {userCoupons.length} Active {userCoupons.length === 1 ? "Voucher" : "Vouchers"}
              </span>
            </div>

            {couponsLoading ? (
              <div className="py-8 text-center text-gray-400 font-bold text-xs">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading your allocated vouchers...</span>
              </div>
            ) : userCoupons.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 space-y-2">
                <Gift size={28} className="mx-auto text-gray-300" />
                <h5 className="font-bold text-xs text-gray-600">No Active Vouchers Available</h5>
                <p className="text-[11px] text-gray-400">Exclusive promo codes allocated to your account by admin or site-wide offers will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userCoupons.map((c) => {
                  const isPersonal = c.assignedUserId === user.uid || (c.assignedUserEmail && c.assignedUserEmail.toLowerCase() === user.email?.toLowerCase());
                  const discountLabel = c.discountType === "flat" ? `FLAT ₹${c.discountValue} OFF` : `${c.discountValue}% SPECIAL DISCOUNT`;

                  return (
                    <div
                      key={c.id || c.code}
                      className={`p-4 border border-dashed rounded-2xl flex items-center justify-between transition-all ${isPersonal
                        ? "border-amber-300 bg-amber-50/50 hover:bg-amber-50"
                        : "border-purple-300 bg-purple-50/50 hover:bg-purple-50"
                        }`}
                    >
                      <div className="space-y-1 pr-2 text-left">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isPersonal ? "text-amber-700 bg-amber-200/60" : "text-purple-700 bg-purple-200/60"
                          }`}>
                          {isPersonal ? "EXCLUSIVELY FOR YOU" : "ALL USERS SPECIAL"}
                        </span>
                        <h5 className="font-heading font-extrabold text-dark text-xs mt-1">{discountLabel}</h5>
                        <p className="text-[10px] text-gray-500 font-mono">Use code: {c.code}</p>
                        {c.description && c.description !== `${c.code} Promo Code` && (
                          <p className="text-[10px] text-gray-400 font-medium">{c.description}</p>
                        )}
                        {c.minSpend ? (
                          <span className="text-[9px] text-gray-400 font-semibold block">Min Spend: ₹{c.minSpend}</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          setCopiedCode(c.code);
                          setTimeout(() => setCopiedCode(null), 2000);
                        }}
                        className="text-xs font-bold text-primary hover:underline shrink-0 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs"
                      >
                        {copiedCode === c.code ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeSection === "security" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="font-heading font-extrabold text-dark text-lg">Account Security & Credentials</h3>
            <p className="text-xs text-gray-500 font-medium">Manage authentication methods and password reset links.</p>
          </div>

          <div className="p-5 border border-gray-100 rounded-2xl space-y-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-dark">Password Reset Email</h4>
                <p className="text-[11px] text-gray-500">Send password recovery link to {user.email}</p>
              </div>
              <button onClick={handlePasswordReset} className="bg-white border border-gray-200 text-dark font-bold text-xs px-4 py-2 rounded-xl hover:bg-gray-100 shadow-2xs">
                Send Reset Link
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold">
                Password reset link sent to your registered email!
              </div>
            )}
          </div>
        </div>
      )}

      {/* HELP & SUPPORT TAB */}
      {activeSection === "help" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="font-heading font-extrabold text-dark text-lg">Help Center & Support</h3>
            <p className="text-xs text-gray-500 font-medium">Reach our 24/7 care team or check quick service FAQs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={() => setShowContactModal(true)} className="p-5 border border-amber-200/80 bg-amber-50/60 rounded-2xl cursor-pointer hover:bg-amber-50 transition-colors space-y-2">
              <Headphones size={24} className="text-amber-700" />
              <h4 className="font-heading font-extrabold text-dark text-sm">Contact Support Team</h4>
              <p className="text-xs text-gray-600">Chat with customer desk on WhatsApp or call our support lines.</p>
            </div>

            <div onClick={() => navigate('/faqs')} className="p-5 border border-blue-200/80 bg-blue-50/60 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors space-y-2">
              <HelpCircle size={24} className="text-primary" />
              <h4 className="font-heading font-extrabold text-dark text-sm">Frequently Asked Questions</h4>
              <p className="text-xs text-gray-600">Find answers about pricing, water supply requirement, slot booking.</p>
            </div>
          </div>
        </div>
      )}

      {/* CREW CONTROL DASHBOARD TAB */}
      {activeSection === "crew_dashboard" && (
        <div className="space-y-6">
          <div className="bg-emerald-600 text-white rounded-3xl p-6 flex justify-between items-center shadow-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">STAFF CONTROL PANEL</span>
              <h3 className="font-heading font-black text-xl mt-1">Car Detailing Crew Dashboard</h3>
            </div>
            <button onClick={() => setActiveSection("dashboard")} className="bg-white text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs">
              Return to Account
            </button>
          </div>
          <EmployeeDashboard embedded={true} />
        </div>
      )}
    </>
  );

  return (
    <>
      <SEO title="My Account Dashboard | VA Car & Bike Care" noindex={true} />
      <div className="min-h-screen bg-[#F4F6F9] text-dark pt-20 pb-20 relative overflow-hidden flex flex-col font-sans">

        {/* DARK TOP HEADER BANNER WITH PAGE TITLE */}
        <div className="bg-[#070C16] text-white pt-10 pb-14 relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl text-left">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
                  My Account
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  Manage your profile & bookings
                </p>
              </div>

              {/* Quick Admin / Crew Badges if Staff / Admin */}
              <div className="flex items-center gap-2">
                {profile?.role === "admin" && (
                  <Link to="/admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                    <ShieldAlert size={14} /> Admin
                  </Link>
                )}
                {(profile?.role === "staff" || profile?.role === "crew") && (
                  <button onClick={() => setActiveSection("crew_dashboard")} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all">
                    <Briefcase size={14} /> Crew Panel
                  </button>
                )}
                <button onClick={handleSignOut} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                  <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl -mt-8 space-y-6">



          {/* DESKTOP VIEW (lg:flex) */}
          <div className="hidden lg:flex gap-8 items-start">
            {/* DESKTOP LEFT SIDEBAR */}
            <div className="w-72 shrink-0 space-y-6 text-left">
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-gray-200/80 space-y-6">
                <h2 className="text-lg font-heading font-extrabold text-[#0F172A] px-2">
                  My Account
                </h2>

                <nav className="space-y-1 text-xs font-bold">
                  {profile?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 py-3 px-4 rounded-2xl transition-all text-primary bg-primary/10 hover:bg-primary/20 font-black mb-2"
                    >
                      <ShieldAlert size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {(profile?.role === "staff" || profile?.role === "crew") && (
                    <button
                      onClick={() => setActiveSection("crew_dashboard")}
                      className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "crew_dashboard"
                        ? "bg-emerald-600 text-white shadow-xs font-black"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Briefcase size={16} />
                      <span>Crew Control</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "dashboard" || activeSection === "profile"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("bookings")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "bookings"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <Calendar size={16} />
                    <span>My Bookings</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("vehicles")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "vehicles"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <Car size={16} />
                    <span>My Vehicles</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("addresses")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "addresses"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <MapPin size={16} />
                    <span>Addresses</span>
                  </button>



                  <button
                    onClick={() => setActiveSection("rewards")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "rewards"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <Gift size={16} />
                    <span>Rewards</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("security")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "security"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <Shield size={16} />
                    <span>Security</span>
                  </button>

                  <button
                    onClick={() => setActiveSection("help")}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer text-left ${activeSection === "help"
                      ? "bg-[#EBF3FE] text-primary font-extrabold shadow-2xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-dark"
                      }`}
                  >
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer text-left pt-2 border-t border-gray-100 mt-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </nav>

                <div className="bg-[#FFFBEB] rounded-2xl p-4 text-center border border-amber-100/80 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-700 flex items-center justify-center mx-auto">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-[#0F172A] text-xs">Need Help?</h4>
                    <p className="text-[10px] text-gray-500 font-medium">We are here for you</p>
                  </div>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-[#F4B400] hover:bg-amber-500 text-dark font-extrabold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider shadow-2xs transition-all cursor-pointer"
                  >
                    CONTACT SUPPORT
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP RIGHT MAIN PANEL */}
            <div className="flex-1 w-full space-y-6 text-left">
              {(activeSection === "dashboard" || activeSection === "profile") ? (
                <div className="space-y-6">
                  {/* Desktop Top Profile Card */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-200/80 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
                          <img
                            src={editPhoto || profile?.photo || user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                            onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("edit_profile")}
                          className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                          title="Change Profile Photo"
                        >
                          <Camera size={14} />
                        </button>
                      </div>

                      <div className="space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-2xl font-heading font-extrabold text-[#0F172A] tracking-tight">
                            {editName || user.displayName || profile?.name || "Divyanshu Kashyap"}
                          </h2>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500 font-medium">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Mail size={14} className="text-gray-400 shrink-0" />
                            <span>{user.email || "divyanshu00884466@gmail.com"}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Phone size={14} className="text-gray-400 shrink-0" />
                            <span>{editPhone || profile?.contactNumber || user.phoneNumber || "+91 95699 49626"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Right Meta Info */}
                    <div className="space-y-3 bg-gray-50/70 border border-gray-100/80 rounded-2xl p-4 md:p-5 w-full md:w-auto min-w-[220px]">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                          <Calendar size={15} />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Member Since</span>
                          <span className="font-extrabold text-[#0F172A]">
                            {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "05 Aug 2026"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Award size={15} />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reward Points</span>
                          <span className="font-extrabold text-primary text-sm">{userLoyaltyPts || 89} Pts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Quick Actions */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-base font-heading font-extrabold text-[#0F172A] tracking-tight">
                        Quick Access
                      </h3>
                      <button
                        onClick={() => setShowAllQuickAccess(!showAllQuickAccess)}
                        className="text-xs font-extrabold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{showAllQuickAccess ? "Show Less" : "View All Subsections"}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                          {showAllQuickAccess ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>

                    <div className={`grid ${showAllQuickAccess ? "grid-cols-4" : "grid-cols-4"} gap-4`}>
                      {(showAllQuickAccess ? quickAccessItems : quickAccessItems.slice(0, 4)).map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`${item.bgColor} border ${item.borderColor} hover:border-gray-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md group`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-white ${item.textColor} flex items-center justify-center shadow-xs`}>
                                <IconComponent size={18} />
                              </div>
                              <div>
                                <h4 className="font-heading font-extrabold text-[#0F172A] text-xs">{item.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium">{item.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className={`${item.textColor} group-hover:translate-x-1 transition-transform`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Bottom Grid (Recent Bookings) */}
                  <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-heading font-extrabold text-[#0F172A]">Recent Bookings</h3>
                      <button onClick={() => setActiveSection("bookings")} className="text-xs font-extrabold text-primary hover:underline cursor-pointer">View All</button>
                    </div>

                    <div className="space-y-3">
                      {allBookings.length > 0 ? (
                        allBookings.slice(0, 3).map((b, idx) => {
                          const statusObj = getStatusDetails(b.bookingStatus || (b as any).status);
                          return (
                            <div
                              key={b.id || idx}
                              onClick={() => navigate(`/account/booking/${b.id}`)}
                              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl gap-4 hover:border-primary/30 shadow-2xs hover:shadow-md cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-3.5">
                                <VehicleMediaThumbnail serviceName={b.serviceName} vehicleDetails={b.vehicleDetails} />
                                <div className="space-y-1">
                                  <h4 className="font-heading font-extrabold text-[#0F172A] text-sm leading-tight">{b.serviceName}</h4>
                                  <p className="text-[11px] text-gray-500 font-semibold">{b.vehicleDetails || "Tata Tarzan (UP-78-BL5252)"}</p>
                                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Calendar size={11} className="text-gray-400" />
                                    <span>{b.scheduledDate || "05 Aug 2026"} • {b.timeSlot || "8:00 AM - 12:00 PM"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="font-heading font-extrabold text-[#0F172A] text-sm">₹{b.price}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBookingForReview(b);
                                    }}
                                    className="bg-[#F4B400] hover:bg-amber-400 text-dark font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                  >
                                    <Star size={10} className="fill-dark text-dark" />
                                    <span>Review</span>
                                  </button>
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusObj.className}`}>
                                    {statusObj.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-gray-400 text-xs font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                          No recent bookings found. Click "Book Service" to schedule a detailing session!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                renderTabSections()
              )}
            </div>
          </div>

          {/* MOBILE SMARTPHONE VIEW (lg:hidden) */}
          <div className="lg:hidden max-w-xl mx-auto space-y-6">
            {(activeSection === "dashboard" || activeSection === "profile") ? (
              <div className="space-y-6 text-left">

                {/* 1. TOP PROFILE INFORMATION CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-6">

                  {/* Profile Details Header */}
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
                        <img
                          src={editPhoto || profile?.photo || user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                          onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection("edit_profile")}
                        className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        title="Change Profile Photo"
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <h2 className="text-2xl font-heading font-extrabold text-[#0F172A] tracking-tight">
                          {editName || user.displayName || profile?.name || "Divyanshu Kashyap"}
                        </h2>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Mail size={14} className="text-gray-400 shrink-0" />
                          <span>{user.email || "divyanshu00884466@gmail.com"}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Phone size={14} className="text-gray-400 shrink-0" />
                          <span>{editPhone || profile?.contactNumber || user.phoneNumber || "+91 95699 49626"}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>Member Since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "05 Aug 2026"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATS ROW INSIDE CARD (Reward Points) */}
                  <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4 flex items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                        <Award size={20} className="fill-amber-500 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <span className="text-xl font-heading font-extrabold text-[#0F172A] leading-none block">
                          {userLoyaltyPts || 89}
                        </span>
                        <span className="text-[11px] text-gray-500 font-semibold block mt-0.5">
                          Reward Points
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. QUICK ACCESS SECTION */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-heading font-extrabold text-[#0F172A] tracking-tight">
                      Quick Access
                    </h3>
                    <button
                      onClick={() => setShowAllQuickAccess(!showAllQuickAccess)}
                      className="text-xs font-extrabold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>{showAllQuickAccess ? "Show Less" : "View All"}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                        {showAllQuickAccess ? "▲" : "▼"}
                      </span>
                    </button>
                  </div>

                  <div className={`grid ${showAllQuickAccess ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-4"} gap-2.5 transition-all`}>
                    {(showAllQuickAccess ? quickAccessItems : quickAccessItems.slice(0, 4)).map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`${item.bgColor} border ${item.borderColor} rounded-2xl p-3 text-center cursor-pointer transition-all hover:shadow-md group space-y-1.5`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-white ${item.textColor} flex items-center justify-center mx-auto shadow-xs`}>
                            <IconComponent size={17} />
                          </div>
                          <h4 className="font-heading font-extrabold text-[#0F172A] text-[11px] leading-tight">{item.title}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. RECENT BOOKINGS SECTION */}
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-heading font-extrabold text-[#0F172A]">
                      Recent Bookings
                    </h3>
                    <button
                      onClick={() => setActiveSection("bookings")}
                      className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {allBookings.length > 0 ? (
                      allBookings.slice(0, 3).map((b, idx) => {
                        const statusObj = getStatusDetails(b.bookingStatus || (b as any).status);
                        return (
                          <div
                            key={b.id || idx}
                            onClick={() => navigate(`/account/booking/${b.id}`)}
                            className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl gap-3 hover:border-primary/30 shadow-2xs hover:shadow-md cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <VehicleMediaThumbnail serviceName={b.serviceName} vehicleDetails={b.vehicleDetails} />
                              <div className="space-y-0.5">
                                <h4 className="font-heading font-extrabold text-[#0F172A] text-xs leading-tight">{b.serviceName}</h4>
                                <p className="text-[10px] text-gray-500 font-semibold">{b.vehicleDetails || "Tata Tarzan (UP-78-BL5252)"}</p>
                                <div className="text-[9px] text-gray-400 flex items-center gap-1">
                                  <Calendar size={10} className="text-gray-400" />
                                  <span>{b.scheduledDate || "05 Aug 2026"} • {b.timeSlot || "8:00 AM - 12:00 PM"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="font-heading font-extrabold text-[#0F172A] text-xs">₹{b.price}</span>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusObj.className}`}>
                                {statusObj.label}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-gray-400 text-xs font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        No recent bookings found. Click "Book Service" to schedule a detailing session!
                      </div>
                    )}
                  </div>
                </div>



                {/* 5. NEED HELP FOOTER BAR */}
                <div
                  onClick={() => setShowContactModal(true)}
                  className="bg-[#FFFBEB] hover:bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
                      <Headphones size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-[#0F172A] text-xs">Need Help?</h4>
                      <p className="text-gray-500 text-[10px] font-medium">Our support team is here to help you.</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-amber-700 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            ) : (
              <div className="space-y-4 text-left">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-dark bg-white px-4 py-2.5 rounded-xl shadow-xs border border-gray-200 cursor-pointer transition-all w-fit mb-2"
                >
                  <ArrowLeft size={15} />
                  <span>Back to My Account</span>
                </button>

                {renderTabSections()}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingBookingDetails && (
        <div
          className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setViewingBookingDetails(null)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">Booking Details Sheet</h3>
              <button
                onClick={() => setViewingBookingDetails(null)}
                className="text-gray-400 hover:text-dark text-sm font-bold uppercase transition-colors font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 text-left text-xs">
              {/* Header Status & Price */}
              <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Booking ID</div>
                  <div className="font-mono font-bold text-dark text-xs">{viewingBookingDetails.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Status</div>
                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${viewingBookingDetails.bookingStatus === "Completed"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : viewingBookingDetails.bookingStatus === "Pending"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : viewingBookingDetails.bookingStatus === "Cancelled"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                    {viewingBookingDetails.bookingStatus}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">1. Service & Vehicle</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block">Package Selected</span>
                    <span className="font-extrabold text-dark text-sm">{viewingBookingDetails.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Price / Fee</span>
                    <span className="font-black text-dark text-sm">₹{viewingBookingDetails.price}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block">Vehicle Specification</span>
                    <span className="font-mono text-gray-700 font-bold">{viewingBookingDetails.vehicleDetails}</span>
                  </div>
                </div>
              </div>

              {/* Scheduled Date/Time */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">2. Scheduled Date & Time</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block">Scheduled Date</span>
                    <span className="font-semibold text-gray-700">{viewingBookingDetails.scheduledDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Time Slot</span>
                    <span className="font-semibold text-gray-700">{viewingBookingDetails.timeSlot}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">3. Customer Profile & Address</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block">Full Name</span>
                      <span className="font-extrabold text-dark">{viewingBookingDetails.customerName || profile?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Contact Number</span>
                      <span className="font-bold text-gray-700">{viewingBookingDetails.customerPhone || profile?.contactNumber}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Service Doorstep Address</span>
                    <span className="font-semibold text-dark leading-relaxed block bg-amber-50/50 border border-amber-100/50 p-2.5 rounded-xl mt-1">
                      {viewingBookingDetails.address || viewingBookingDetails.notes || "No address details specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailing Crew Assignment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">4. Dispatch & Crew Assignment</h4>
                {(viewingBookingDetails.assignedEmployee || viewingBookingDetails.assignedEmployeeName) ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3 text-left">
                    <div className="flex justify-between items-center border-b border-blue-200/60 pb-2">
                      <div className="flex items-center gap-3">
                        {viewingBookingDetails.assignedEmployeePhoto ? (
                          <img src={viewingBookingDetails.assignedEmployeePhoto} alt="Crew" className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            <User size={20} />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Detailer Squad</span>
                          <span className="font-heading font-extrabold text-dark text-base">{viewingBookingDetails.assignedEmployeeName || "Mobile Detailing Squad"}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {viewingBookingDetails.bookingStatus || "Accepted"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {viewingBookingDetails.assignedEmployeePhone && (
                        <div>
                          <span className="text-gray-400 block text-[10px] font-bold uppercase">Crew Phone Contact</span>
                          <a href={`tel:${viewingBookingDetails.assignedEmployeePhone}`} className="font-extrabold text-primary hover:underline">
                            {viewingBookingDetails.assignedEmployeePhone}
                          </a>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-400 block text-[10px] font-bold uppercase">Scheduled Date</span>
                        <span className="font-extrabold text-dark">{viewingBookingDetails.scheduledDate}</span>
                      </div>

                      {viewingBookingDetails.crewArrivingDate && (
                        <div className="col-span-2 pt-1 border-t border-blue-200/50 flex justify-between">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-bold uppercase">Estimated Arrival Date</span>
                            <span className="font-extrabold text-dark">{viewingBookingDetails.crewArrivingDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 block text-[10px] font-bold uppercase">Arrival Time Slot</span>
                            <span className="font-extrabold text-dark">{viewingBookingDetails.crewArrivingTime || viewingBookingDetails.timeSlot}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-center text-amber-900 font-semibold text-xs">
                    Crew Assignment: Finding nearest available mobile detailing squad...
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingBookingDetails(null)}
              className="w-full bg-dark hover:bg-dark/80 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </motion.div>
        </div>
      )}
      {selectedBookingForReview && (
        <ReviewModal
          isOpen={true}
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onReviewSubmitted={() => {
            fetchReviews();
            fetchBookings();
          }}
        />
      )}

      {/* RESCHEDULE BOOKING TIME SLOT MODAL */}
      {rescheduleBookingItem && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setRescheduleBookingItem(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-dark p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Reschedule Detailing Slot
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Select a new date and time slot for {rescheduleBookingItem.serviceName}.
              </p>
            </div>

            {rescheduleSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{rescheduleSuccessMsg}</span>
              </div>
            )}

            {rescheduleErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{rescheduleErrorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  New Scheduled Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  New Time Slot
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Morning (8:00 AM - 12:00 PM)",
                    "Afternoon (12:00 PM - 4:00 PM)",
                    "Evening (4:00 PM - 7:00 PM)"
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRescheduleTimeSlot(slot)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer flex justify-between items-center ${rescheduleTimeSlot === slot
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <span>{slot}</span>
                      {rescheduleTimeSlot === slot && (
                        <CheckCircle2 size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleBookingItem(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={rescheduleLoading}
                className="flex-1 py-3 bg-primary hover:bg-[#0b327b] text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {rescheduleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm Reschedule</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div
          className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 space-y-6 text-center cursor-default"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-100 shadow-2xs">
              <Headphones size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-dark text-lg">Contact Support Team</h3>
              <p className="text-gray-400 text-xs">Our customer support team is available 24/7. Select your preferred contact channel below.</p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={getBookingWhatsAppSupportUrl(bookings.length > 0 ? bookings[0] : null)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-sm"
              >
                <MessageSquare size={15} />
                <span>Chat on WhatsApp (Booking Details)</span>
              </a>
              <a
                href="mailto:vacarcleanservice3@gmail.com"
                className="w-full flex items-center justify-center gap-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl text-xs border border-gray-200 transition-colors"
              >
                <Mail size={15} className="text-amber-500" />
                <span>Email: vacarcleanservice3@gmail.com</span>
              </a>
              <a
                href="tel:+919569949626"
                className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Phone size={15} className="text-amber-400" />
                <span>Call Support (+91 95699 49626)</span>
              </a>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="text-xs font-bold text-gray-400 hover:text-dark uppercase tracking-wider transition-colors pt-2 cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

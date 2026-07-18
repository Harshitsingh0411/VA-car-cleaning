import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
  Star
} from "lucide-react";
import {
  logAuditAction,
  getBookingsByCustomer,
  dbBooking,
  getAllReviews,
  dbReview,
  getUserLoyaltyPoints,
  getUserLoyaltyHistory,
  dbLoyaltyTransaction
} from "../services/dbService";
import { getCartoonAvatar, handleAvatarError } from "../utils/avatar";
import ReviewModal from "../components/modals/ReviewModal";
import EmployeeDashboard from "./crew/EmployeeDashboard";
import { GoogleMapEmbed } from "../components/location/LocationPickerMap";


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

  // Tab Manager: "crew_dashboard" | "profile" | "vehicles" | "addresses" | "bookings" | "loyalty" | "security"
  const isCrewUser = profile?.role === "staff" || profile?.role === "crew";
  const [activeSection, setActiveSection] = useState<"crew_dashboard" | "profile" | "vehicles" | "addresses" | "bookings" | "loyalty" | "security">(
    isCrewUser ? "crew_dashboard" : "bookings"
  );

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

  useEffect(() => {
    if (profile?.role === "staff" || profile?.role === "crew") {
      setActiveSection("crew_dashboard");
    }
  }, [profile?.role]);


  // Local Form state managers
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editPhone, setEditPhone] = useState(profile?.contactNumber || "");
  const [editGender, setEditGender] = useState(profile?.gender || "Male");
  const [editDob, setEditDob] = useState(profile?.dob || "");
  const [editOcc, setEditOcc] = useState(profile?.occupation || "");
  const [editLang, setEditLang] = useState(profile?.preferredLanguage || "English");
  const [editNotif, setEditNotif] = useState(profile?.notificationPreference || "Both");
  const [editTheme, setEditTheme] = useState(profile?.themePreference || "Light");
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const [newAddr, setNewAddr] = useState("");
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  const [vehName, setVehName] = useState("");
  const [vehNum, setVehNum] = useState("");
  const [isAddingVeh, setIsAddingVeh] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Real bookings & review state
  const [bookings, setBookings] = useState<dbBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFetched, setBookingsFetched] = useState(false);
  const [viewingBookingDetails, setViewingBookingDetails] = useState<Partial<dbBooking> | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Partial<dbBooking> | null>(null);
  const [reviewsList, setReviewsList] = useState<dbReview[]>([]);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    try {
      const allRev = await getAllReviews();
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
      setBookingsFetched(true);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  // Fetch bookings and reviews on mount and when switching to bookings tab
  useEffect(() => {
    if (user && activeSection === "bookings" && !bookingsFetched) {
      fetchBookings();
      fetchReviews();
    }
  }, [user, activeSection, bookingsFetched, fetchBookings, fetchReviews]);


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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileDetails({
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
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden flex flex-col">
      {/* Dark Header Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-10 md:pt-28 md:pb-12 relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <span className="text-[#F4B400] font-heading font-semibold tracking-wider uppercase text-[11px] mb-1 block">
            — USER PORTAL —
          </span>
          <h1 className="text-2xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            My Account & Profile
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-6">

        {/* MINIMAL TOP USER & NAVIGATION HEADER BAR */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-5 shadow-sm space-y-4">

          {/* User info & quick actions row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 shadow-xs">
                <img
                  src={user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                  onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-extrabold text-dark tracking-tight text-sm md:text-base">{user.displayName || "Valued Customer"}</h4>
                  <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded border ${profile?.role === "admin"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : profile?.role === "staff"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                    {profile?.role === "staff" ? "crew" : (profile?.role || "customer")}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
              <button
                onClick={() => setActiveSection("loyalty")}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs font-black text-amber-800 transition-all cursor-pointer"
                title="Loyalty Points"
              >
                <Gift size={14} className="text-amber-600" />
                <span>{userLoyaltyPts} Pts</span>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* MINIMAL RESPONSIVE ICON TAB BAR (SMALL ICONS, CLEAN & MINIMAL FOR SMARTPHONE & PC) */}
          <div className="border-t border-gray-100 pt-3">
            <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs font-bold">
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all bg-primary/10 hover:bg-primary/20 text-primary font-black shrink-0 text-xs shadow-2xs"
                  title="Admin Dashboard"
                >
                  <ShieldAlert size={15} />
                  <span>Admin</span>
                </Link>
              )}

              {(profile?.role === "staff" || profile?.role === "crew") && (
                <button
                  onClick={() => setActiveSection("crew_dashboard")}
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "crew_dashboard"
                      ? "bg-emerald-600 text-white shadow-2xs font-black"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold"
                    }`}
                  title="Crew Control Panel"
                >
                  <Briefcase size={15} />
                  <span>Crew</span>
                </button>
              )}

              <button
                onClick={() => setActiveSection("bookings")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "bookings"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <Calendar size={15} />
                <span>Bookings</span>
              </button>

              <button
                onClick={() => setActiveSection("profile")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "profile"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <User size={15} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setActiveSection("vehicles")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "vehicles"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <Car size={15} />
                <span>Vehicles ({profile?.vehicles?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveSection("addresses")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "addresses"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <MapPin size={15} />
                <span>Addresses ({profile?.addresses?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveSection("loyalty")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "loyalty"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <Gift size={15} />
                <span>Rewards</span>
              </button>

              <button
                onClick={() => setActiveSection("security")}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer shrink-0 text-xs ${activeSection === "security"
                    ? "bg-primary text-white shadow-2xs font-black"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                  }`}
              >
                <Shield size={15} />
                <span>Security</span>
              </button>
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="space-y-6">
          {/* CREW CONTROL PANEL TAB (EMBEDDED DIRECTLY IN ACCOUNT PAGE) */}
          {activeSection === "crew_dashboard" && (
            <EmployeeDashboard embedded={true} />
          )}

          {/* EDIT PROFILE TAB */}
          {activeSection === "profile" && (
            <form onSubmit={handleProfileSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Personal Profile Settings</h3>

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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Occupation</label>
                  <input
                    type="text"
                    value={editOcc}
                    onChange={(e) => setEditOcc(e.target.value)}
                    placeholder="e.g. Architect, Engineer"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Preferred Language</label>
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Notification Preference</label>
                  <select
                    value={editNotif}
                    onChange={(e) => setEditNotif(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Email">Email Only</option>
                    <option value="SMS">SMS Only</option>
                    <option value="Both">Both (Email & SMS)</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Theme</label>
                  <select
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Light">Light Mode</option>
                    <option value="Dark">Dark Mode</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
              >
                Save Profile Configuration
              </button>
            </form>
          )}

          {/* MY VEHICLES TAB */}
          {activeSection === "vehicles" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                  <Car size={20} className="text-primary" />
                  My Saved Vehicles
                </h3>
                <button
                  onClick={() => setIsAddingVeh(!isAddingVeh)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  Add Vehicle
                </button>
              </div>

              {isAddingVeh && (
                <form onSubmit={handleVehSubmit} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 max-w-md">
                  <h4 className="font-bold text-dark text-xs uppercase tracking-wider">Save New Vehicle</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Vehicle Model / Brand</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hyundai Creta, Honda City"
                        value={vehName}
                        onChange={(e) => setVehName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Registration Plate</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL-3C-AS-1234"
                        value={vehNum}
                        onChange={(e) => setVehNum(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingVeh(false)}
                      className="text-xs text-gray-400 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-[#0b327b] text-white py-1.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Vehicle
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.vehicles && profile.vehicles.length > 0 ? (
                  profile.vehicles.map((v) => (
                    <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Car size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-dark">{v.name}</h4>
                          <span className="text-[10px] uppercase font-mono text-gray-400 font-black">{v.number}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeVehicle(v.id)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer p-1.5"
                        title="Delete vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 col-span-2">No vehicles saved. Save your vehicle to book cleanings faster.</p>
                )}
              </div>
            </div>
          )}

          {/* SAVED ADDRESSES TAB */}
          {activeSection === "addresses" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  Service Addresses
                </h3>
                <button
                  onClick={() => setIsAddingAddr(!isAddingAddr)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  Add Address
                </button>
              </div>

              {isAddingAddr && (
                <form onSubmit={handleAddrSubmit} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 max-w-md">
                  <h4 className="font-bold text-dark text-xs uppercase tracking-wider">Save New Address</h4>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Service Location Coordinates</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Flat 402, Sunshine Heights, Dwarka, New Delhi"
                      value={newAddr}
                      onChange={(e) => setNewAddr(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddr(false)}
                      className="text-xs text-gray-400 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-[#0b327b] text-white py-1.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add Address
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {profile?.addresses && profile.addresses.length > 0 ? (
                  profile.addresses.map((addr, idx) => (
                    <div key={idx} className="flex justify-between items-start p-4 bg-gray-50 border border-gray-100 rounded-2xl gap-4 hover:border-primary/20 transition-all shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={16} />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-semibold">{addr}</p>
                      </div>
                      <button
                        onClick={() => removeAddress(idx)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer shrink-0 p-1"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No service addresses registered yet.</p>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS HISTORY TAB */}
          {activeSection === "bookings" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Booking & Detailing Records
                </h3>
                <Link to="/book">
                  <button className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-5 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all">
                    Schedule Detailing
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : allBookings.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-dark text-sm">No Bookings Yet</h4>
                      <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                        You haven't booked any car cleaning services yet. Schedule your first detailing now!
                      </p>
                    </div>
                    <Link to="/book">
                      <button className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all mt-2">
                        Book Your First Service
                      </button>
                    </Link>
                  </div>
                ) : (
                  allBookings.map((appt) => (
                    <div key={appt.id} className="p-5 border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all space-y-3 bg-white">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h4 className="font-heading font-extrabold text-dark text-sm leading-snug">{appt.serviceName}</h4>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                            Vehicle: {appt.vehicleDetails}
                          </span>
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
                            {appt.bookingStatus}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex flex-col gap-2 text-[11px] text-gray-500 font-semibold">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-[#F4B400]" />
                            <span>Scheduled: {appt.scheduledDate}</span>
                          </div>
                          <span>Slot: {appt.timeSlot}</span>
                        </div>

                        {/* Assigned Crew Details */}
                        {(appt.assignedEmployee || appt.assignedEmployeeName) ? (
                          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border border-blue-200/80 rounded-2xl p-3.5 space-y-2 mt-1 text-left">
                            <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  <User size={14} />
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Detailer Crew</span>
                                  <span className="font-heading font-extrabold text-dark text-xs">{appt.assignedEmployeeName || "Mobile Detailing Squad"}</span>
                                </div>
                              </div>

                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={10} /> {appt.bookingStatus || "Accepted"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-0.5">
                              {appt.assignedEmployeePhone && (
                                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                                  <Phone size={12} className="text-primary shrink-0" />
                                  <span>Call Crew: </span>
                                  <a href={`tel:${appt.assignedEmployeePhone}`} className="text-primary font-extrabold hover:underline">
                                    {appt.assignedEmployeePhone}
                                  </a>
                                </div>
                              )}

                              {appt.crewArrivingDate ? (
                                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                                  <Clock size={12} className="text-amber-500 shrink-0" />
                                  <span>Est. Arrival: </span>
                                  <span className="text-dark font-extrabold">{appt.crewArrivingDate} at {appt.crewArrivingTime || appt.timeSlot}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                                  <Clock size={12} className="text-amber-500 shrink-0" />
                                  <span>Schedule: </span>
                                  <span className="text-dark font-bold">{appt.scheduledDate} ({appt.timeSlot})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-amber-900 text-[11px] font-semibold flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-amber-500 shrink-0" />
                            <span>Crew Assignment: Finding nearest available detailing squad...</span>
                          </div>
                        )}

                        {/* Google Maps Location Preview */}
                        {(appt.customerLatitude || appt.crewLatitude) && (
                          <div className="pt-2 space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              <span>📍 Doorstep Location (Google Maps)</span>
                              {appt.crewLatitude && (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-extrabold">
                                  Live Crew GPS Active
                                </span>
                              )}
                            </div>
                            <GoogleMapEmbed
                              latitude={appt.crewLatitude || appt.customerLatitude || 26.4499}
                              longitude={appt.crewLongitude || appt.customerLongitude || 80.3319}
                              title="Booking Location Map"
                              className="h-36 w-full rounded-xl overflow-hidden shadow-sm border border-gray-100"
                            />
                          </div>
                        )}

                        {/*    Style Review Section for Completed Bookings */}
                        {appt.bookingStatus === "Completed" && (() => {
                          const existingReview = reviewsList.find((r) => r.bookingId === appt.id);

                          if (existingReview) {
                            return (
                              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 space-y-2 mt-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1 text-[#F4B400]">
                                    {Array.from({ length: existingReview.stars || 5 }).map((_, i) => (
                                      <Star key={i} size={14} className="fill-[#F4B400]" />
                                    ))}
                                    <span className="text-[10px] font-extrabold text-dark ml-1">Verified Customer Rating</span>
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Reviewed</span>
                                </div>
                                <p className="text-xs text-dark font-medium italic">"{existingReview.review}"</p>

                                {/* Uploaded Photos & Videos Preview */}
                                {(existingReview.images?.length || existingReview.videos?.length) ? (
                                  <div className="flex gap-2 pt-1 overflow-x-auto">
                                    {existingReview.images?.map((imgUrl, i) => (
                                      <img key={i} src={imgUrl} alt="Review attachment" className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0" />
                                    ))}
                                    {existingReview.videos?.map((vidUrl, i) => (
                                      <video key={i} src={vidUrl} className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0 bg-black" />
                                    ))}
                                  </div>
                                ) : null}

                                {existingReview.adminReply && (
                                  <div className="bg-white p-2.5 rounded-lg text-[10px] text-gray-600 border border-amber-200/50 space-y-0.5 mt-1">
                                    <span className="font-extrabold text-primary block">💬 Admin Response:</span>
                                    <p>{existingReview.adminReply}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <button
                              onClick={() => setSelectedBookingForReview(appt)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-dark hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all mt-1 cursor-pointer shadow-sm"
                            >
                              <Star size={14} className="fill-white/30 text-white" />
                              Rate & Review Service
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => setViewingBookingDetails(appt)}
                          className="w-full text-center py-2 bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors text-gray-500 cursor-pointer mt-1"
                        >
                          View Booking Details Sheet
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeSection === "security" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Account Security Logs</h3>

              <div className="space-y-5">
                <div className="p-5 border border-gray-100 bg-gray-50/20 rounded-2xl space-y-4">
                  <h4 className="text-dark font-heading font-bold text-sm flex items-center gap-2">
                    <Key size={18} className="text-primary" />
                    Reset Account Password
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                    Click below to trigger a secure verification password-reset email to **{user.email}**. Verify your inbox immediately.
                  </p>
                  {passwordSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-1.5 w-fit">
                      <CheckCircle2 size={14} />
                      Reset URL dispatched to your email!
                    </div>
                  ) : (
                    <button
                      onClick={handlePasswordReset}
                      className="bg-primary hover:bg-[#0b327b] text-white py-2 px-5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
                    >
                      Trigger Password Reset
                    </button>
                  )}
                </div>

                <div className="p-5 border border-gray-100 bg-gray-50/20 rounded-2xl space-y-3">
                  <h4 className="text-dark font-heading font-bold text-sm flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    Active Device Sessions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-dark">Chrome (Windows NT 10.0)</p>
                        <span className="text-[10px] text-gray-400">IP: 192.168.1.1 (Simulated)</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOYALTY & REWARDS TAB */}
          {activeSection === "loyalty" && (
            <div className="space-y-6">
              {/* Balance Banner */}
              <div className="bg-gradient-to-br from-[#0B1220] to-dark p-6 md:p-8 rounded-3xl text-white space-y-4 shadow-xl relative overflow-hidden border border-white/10 text-left">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#F4B400]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-wrap justify-between items-start gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[#F4B400] font-heading font-extrabold text-[11px] uppercase tracking-wider block">
                      — VA REWARDS & LOYALTY CLUB —
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                      {userLoyaltyPts} <span className="text-amber-400 text-lg font-bold">Loyalty Points Available</span>
                    </h3>
                    <p className="text-gray-400 text-xs max-w-md leading-relaxed">
                      Redeem your earned points at checkout to receive instant cash discounts on your doorstep detailing bookings.
                    </p>
                  </div>

                  <Link to="/book">
                    <button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-extrabold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all border-none">
                      Book & Redeem Points
                    </button>
                  </Link>
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
                <h4 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                  <Gift size={20} className="text-[#F4B400]" />
                  Loyalty Points Transaction History
                </h4>

                {loyaltyHistoryList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 bg-amber-50 text-[#F4B400] rounded-full flex items-center justify-center mx-auto border border-amber-200">
                      <Gift size={24} />
                    </div>
                    <h5 className="font-heading font-extrabold text-dark text-sm">No Points History Yet</h5>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto">
                      Earn loyalty points on every booking service completed or receive special welcome & bonus rewards!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {loyaltyHistoryList.map((tx) => (
                      <div key={tx.id} className="py-3.5 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-dark block">{tx.description}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <span className={`font-black text-sm ${tx.points >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {viewingBookingDetails && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto"
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
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Assigned Detailer Squad</span>
                        <span className="font-heading font-extrabold text-dark text-base">{viewingBookingDetails.assignedEmployeeName || "Mobile Detailing Squad"}</span>
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
    </div>
  );
}

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
  DollarSign
} from "lucide-react";
import { logAuditAction, getBookingsByCustomer, dbBooking } from "../services/dbService";

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

  // Tab Manager: "dashboard" | "profile" | "vehicles" | "addresses" | "bookings" | "security"
  const [activeSection, setActiveSection] = useState<"dashboard" | "profile" | "vehicles" | "addresses" | "bookings" | "security">("dashboard");

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

  // Real bookings state
  const [bookings, setBookings] = useState<dbBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFetched, setBookingsFetched] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const data = await getBookingsByCustomer(user.uid);
      // Sort by most recent first
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setBookings(data);
      setBookingsFetched(true);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  // Fetch bookings on mount and when switching to bookings/dashboard tab
  useEffect(() => {
    if (user && (activeSection === "bookings" || activeSection === "dashboard") && !bookingsFetched) {
      fetchBookings();
    }
  }, [user, activeSection, bookingsFetched, fetchBookings]);

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
  const allBookings: Partial<dbBooking>[] = [
    ...bookings,
    ...profileAppointments.filter(pa => !bookings.some(b => b.id === pa.id))
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
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden flex">
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT Sidebar Menu */}
        <div className="w-full lg:w-72 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
              <img
                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded border ${
                profile?.role === "admin"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : profile?.role === "staff"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-blue-50 text-blue-600 border-blue-100"
              }`}>
                {profile?.role || "customer"}
              </span>
              <h4 className="font-heading font-extrabold text-dark tracking-tight truncate">{user.displayName || "Valued Customer"}</h4>
              <p className="text-gray-400 text-[10px] truncate">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-gray-500 border-t border-gray-100 pt-4">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "dashboard" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Activity size={16} />
              Overview Dashboard
            </button>
            <button
              onClick={() => setActiveSection("profile")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "profile" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <User size={16} />
              Personal Profile
            </button>
            <button
              onClick={() => setActiveSection("vehicles")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "vehicles" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Car size={16} />
              My Vehicles ({profile?.vehicles?.length || 0})
            </button>
            <button
              onClick={() => setActiveSection("addresses")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "addresses" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <MapPin size={16} />
              Saved Addresses ({profile?.addresses?.length || 0})
            </button>
            <button
              onClick={() => setActiveSection("bookings")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "bookings" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Calendar size={16} />
              Booking History
            </button>
            <button
              onClick={() => setActiveSection("security")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeSection === "security" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Shield size={16} />
              Account Security
            </button>
          </nav>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {(profile?.role === "admin" || profile?.role === "staff") && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 px-4 rounded-xl text-xs font-bold transition-all justify-center"
              >
                <ShieldAlert size={16} />
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 border border-rose-100 text-rose-500 hover:bg-rose-50 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer justify-center"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* RIGHT main content panel */}
        <div className="flex-1 space-y-6">
          
          {/* DASHBOARD TAB */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Dashboard metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">My Cars/Bikes</span>
                  <div className="text-2xl font-black text-dark leading-none">{profile?.vehicles?.length || 0}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Addresses</span>
                  <div className="text-2xl font-black text-dark leading-none">{profile?.addresses?.length || 0}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Bookings</span>
                  <div className="text-2xl font-black text-dark leading-none">{bookingsLoading ? "…" : allBookings.length}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Loyalty Points</span>
                  <div className="text-2xl font-black text-emerald-500 leading-none flex items-center gap-1">
                    <Gift size={20} />
                    <span>320</span>
                  </div>
                </div>
              </div>

              {/* Graphical info block */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-dark text-base flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  Recent Detailing Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl text-xs font-semibold text-gray-600">
                    <span className="text-dark font-bold">First Simulated Login</span>
                    <span className="text-gray-400">Just now</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl text-xs font-semibold text-gray-600">
                    <span className="text-dark font-bold">Profile synchronized with LocalStorage DB</span>
                    <span className="text-gray-400">Just now</span>
                  </div>
                </div>
              </div>
            </div>
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
                          <span className={`text-[9px] uppercase font-bold py-1 px-2.5 rounded-full border ${
                            appt.bookingStatus === "Completed"
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

                      <div className="pt-3 border-t border-gray-50 flex justify-between text-[11px] text-gray-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-[#F4B400]" />
                          <span>{appt.scheduledDate}</span>
                        </div>
                        <span>{appt.timeSlot}</span>
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

        </div>

      </div>
    </div>
  );
}

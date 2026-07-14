import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { getAuditLogs, getAllBookings, updateBookingStatus, getJobApplications, updateJobStatus as updateJobStatusInDb, getAllReviews, getBeforeAfterSettings, updateBeforeAfterSettings } from "../services/dbService";
import NotificationCenterTab from "../components/admin/NotificationCenterTab";
import {
  ShieldAlert,
  Users,
  Calendar,
  Briefcase,
  Layers,
  Star,
  Settings,
  DollarSign,
  Trash2,
  TrendingUp,
  Image,
  MessageSquare,
  CheckCircle,
  XCircle,
  Sparkles,
  Info,
  Clipboard,
  Bell
} from "lucide-react";
import { servicePrices } from "../lib/prices";

interface AdminAppointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  price: string;
  status: string;
  address: string;
}

interface AdminUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  vehicleCount: number;
  addressCount: number;
  role?: "admin" | "customer" | "staff";
}

interface AdminJobApp {
  id: string;
  name: string;
  phone: string;
  email: string;
  skill: string;
  exp: string;
  cover: string;
  status: string;
}

interface AdminReview {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  date: string;
}

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "appointments" | "users" | "jobs" | "services" | "reviews" | "logs" | "notifications">("stats");

  // Load state variables
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJobApp[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [beforeAfterInputs, setBeforeAfterInputs] = useState({
    beforeImage: "",
    afterImage: "",
    useSeparateImages: false
  });

  // Service form bindings
  const [servicePriceInputs, setServicePriceInputs] = useState<Record<string, number>>({});
  const [serviceImageInputs, setServiceImageInputs] = useState<Record<string, string>>({});
  const [serviceDescInputs, setServiceDescInputs] = useState<Record<string, string>>({});
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  const fetchDirectoryUsers = async () => {
    try {
      if (isFirebaseConfigured) {
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const fbUsersList: AdminUser[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fbUsersList.push({
              uid: docSnap.id,
              name: data.name || data.displayName || "Unknown User",
              email: data.email || "",
              phone: data.contactNumber || "",
              vehicleCount: data.vehicles?.length || 0,
              addressCount: data.addresses?.length || 0,
              role: data.role || "customer"
            });
          });
          if (fbUsersList.length > 0) {
            setUsers(fbUsersList);
            return;
          }
        } catch (fbErr) {
          console.warn("Could not fetch users list from Firestore, falling back to simulator:", fbErr);
        }
      }

      // Simulator fallback
      const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
      const list: AdminUser[] = [];
      for (const u of simUsers) {
        const profileRaw = localStorage.getItem(`sim_db_users_${u.uid}`);
        const profileData = profileRaw ? JSON.parse(profileRaw) : null;
        list.push({
          uid: u.uid,
          name: u.displayName || "Valued Customer",
          email: u.email,
          phone: profileData?.contactNumber || "",
          vehicleCount: profileData?.vehicles?.length || 0,
          addressCount: profileData?.addresses?.length || 0,
          role: profileData?.role || "customer"
        });
      }
      setUsers(list);
    } catch (err) {
      console.error("Error fetching directory users:", err);
    }
  };

  const handleRoleChange = async (uid: string, newRole: "admin" | "customer" | "staff") => {
    try {
      if (isFirebaseConfigured) {
        try {
          const userDocRef = doc(db, "users", uid);
          await setDoc(userDocRef, { role: newRole }, { merge: true });
        } catch (fbErr) {
          console.warn("Could not update user role in Firestore, falling back to simulator:", fbErr);
        }
      }

      // Simulator update
      const storeKey = `sim_db_users_${uid}`;
      const profileRaw = localStorage.getItem(storeKey);
      const profileData = profileRaw ? JSON.parse(profileRaw) : { contactNumber: "", addresses: [], vehicles: [], appointments: [] };
      profileData.role = newRole;
      localStorage.setItem(storeKey, JSON.stringify(profileData));

      // Refresh list
      await fetchDirectoryUsers();
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Error fetching audits:", err);
    }
  };

  const fetchAdminBookings = async () => {
    try {
      const data = await getAllBookings();
      const mapped = data.map((b) => ({
        id: b.id,
        name: b.customerName,
        phone: b.customerPhone,
        service: b.serviceName,
        vehicle: b.vehicleDetails,
        date: b.scheduledDate,
        time: b.timeSlot,
        price: `₹${b.price}`,
        status: b.bookingStatus,
        address: b.notes || ""
      }));
      setAppointments(mapped);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchAdminJobs = async () => {
    try {
      const data = await getJobApplications();
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      const mapped = data.map((j) => ({
        id: j.id,
        name: j.name,
        phone: j.phone,
        email: j.email,
        skill: j.skill,
        exp: j.exp,
        cover: j.cover,
        status: j.status
      }));
      setJobs(mapped);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchAdminReviews = async () => {
    try {
      const data = await getAllReviews();
      const mapped = data.map((r) => ({
        id: r.id,
        name: r.customerName,
        email: `Customer: ${r.customerId}`,
        rating: r.stars,
        message: r.review,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchAuditLogs();
    }
    if (activeTab === "appointments" || activeTab === "stats") {
      fetchAdminBookings();
    }
    if (activeTab === "jobs") {
      fetchAdminJobs();
    }
    if (activeTab === "reviews") {
      fetchAdminReviews();
    }
  }, [activeTab]);

  // Initialize structures
  useEffect(() => {
    // 1. Appointments Setup
    fetchAdminBookings();

    // 2. Users Directory Setup
    fetchDirectoryUsers();

    // 3. Job Applications Setup
    fetchAdminJobs();

    // 4. Reviews Setup
    fetchAdminReviews();

    // Load price, image and description inputs
    const loadedPrices: Record<string, number> = {};
    const loadedImages: Record<string, string> = {};
    const loadedDescs: Record<string, string> = {};

    const serviceKeys = ["exteriorWash", "interiorCleaning", "foamWash", "waxPolish", "dashboardCleaning", "tyreDressing", "premiumDetailing"];
    serviceKeys.forEach((key) => {
      loadedPrices[key] = servicePrices[key]?.price || 0;
    });

    const services = ["exterior", "interior", "foam", "wax", "dashboard", "tyre"];
    const fallbackImages: Record<string, string> = {
      exterior: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=800",
      foam: "https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=800",
      wax: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
      dashboard: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800",
      tyre: "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&q=80&w=800"
    };
    const fallbackDescs: Record<string, string> = {
      exterior: "High pressure foam wash for exterior body.",
      interior: "Deep cleaning of seats, floor & interior.",
      foam: "Premium foam wash for deep cleaning.",
      wax: "Protects your car paint & gives extra shine.",
      dashboard: "Shine & protection for your dashboard.",
      tyre: "Restore the deep rich, wet-gloss black look of your tyres."
    };

    services.forEach((s) => {
      // images
      const customImgRaw = localStorage.getItem("admin_service_images");
      const customImgs = customImgRaw ? JSON.parse(customImgRaw) : {};
      loadedImages[s] = customImgs[s] || fallbackImages[s];

      // descs
      const customDescRaw = localStorage.getItem("admin_service_descriptions");
      const customDescs = customDescRaw ? JSON.parse(customDescRaw) : {};
      loadedDescs[s] = customDescs[s] || fallbackDescs[s];
    });

    setServicePriceInputs(loadedPrices);
    setServiceImageInputs(loadedImages);
    setServiceDescInputs(loadedDescs);

    const loadBeforeAfter = async () => {
      const s = await getBeforeAfterSettings();
      setBeforeAfterInputs(s);
    };
    loadBeforeAfter();
  }, []);

  // Update Appointment status
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status as any);
      await fetchAdminBookings();
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  // Update Job Application status
  const updateJobStatus = async (id: string, status: string) => {
    try {
      await updateJobStatusInDb(id, status as any);
      await fetchAdminJobs();
    } catch (err) {
      console.error("Error updating job status:", err);
    }
  };

  // Save Service Config Overrides
  const saveServiceConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Prices
    const priceOverrides: Record<string, number> = {};
    Object.keys(servicePriceInputs).forEach((k) => {
      priceOverrides[k] = Number(servicePriceInputs[k]);
    });
    localStorage.setItem("admin_pricing_overrides", JSON.stringify(priceOverrides));

    // 2. Save Images
    localStorage.setItem("admin_service_images", JSON.stringify(serviceImageInputs));

    // 3. Save Descriptions
    localStorage.setItem("admin_service_descriptions", JSON.stringify(serviceDescInputs));

    // 4. Save Before & After Settings
    try {
      await updateBeforeAfterSettings(beforeAfterInputs);
    } catch (err) {
      console.error("Error updating before/after settings:", err);
    }

    setShowConfigAlert(true);
    setTimeout(() => {
      setShowConfigAlert(false);
    }, 3000);
  };

  // Calculated Stats Metrics
  const totalRevenue = appointments
    .filter((a) => a.status === "Completed")
    .reduce((sum, a) => sum + Number(a.price.replace(/[^\d]/g, "")), 0);

  const pendingAppts = appointments.filter((a) => a.status === "Pending").length;
  const pendingJobs = jobs.filter((j) => j.status === "Under Review").length;

  // Calculate dynamic weekly growth stats from live data
  const getWeeklyStats = () => {
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    appointments.forEach((appt) => {
      if (!appt.date) return;
      const apptDate = new Date(appt.date);
      if (isNaN(apptDate.getTime())) return;
      
      const diffTime = now.getTime() - apptDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 49) {
        const weekIndex = 6 - Math.floor(diffDays / 7);
        if (weekIndex >= 0 && weekIndex < 7) {
          weeklyCounts[weekIndex]++;
        }
      }
    });
    return weeklyCounts;
  };
  const weeklyCounts = getWeeklyStats();
  const maxWeeklyCount = Math.max(...weeklyCounts, 1);

  if (authLoading) {
    return (
      <div className="pt-24 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile?.role !== "admin" && profile?.role !== "staff")) {
    return (
      <div className="pt-24 min-h-screen bg-[#F8FAFC] flex items-center justify-center text-center px-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-lg border border-gray-100 space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-dark">Access Denied</h2>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              You do not have the required permissions to access the VA Control Panel. Please log in with an administrator or staff account.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow transition-all">
              Sign In
            </Link>
            <Link to="/account" className="bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2.5 px-6 rounded-xl text-xs transition-all">
              Go to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden flex">
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* LEFT Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <span className={`${
              profile?.role === "staff" ? "bg-[#34A853] text-white" : "bg-[#F4B400] text-dark"
            } text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded`}>
              {profile?.role === "staff" ? "Staff Crew" : "Super Admin"}
            </span>
            <h2 className="text-xl font-heading font-extrabold text-dark tracking-tight">
              {profile?.role === "staff" ? "Staff Control Panel" : "VA Control Panel"}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {profile?.role === "staff" ? "Staff System View" : "Live System Manager"}
            </p>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "stats" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <TrendingUp size={16} />
              System Overview
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "appointments" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Calendar size={16} />
              Bookings & Slots ({pendingAppts})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "users" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Users size={16} />
              Client Directory
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "jobs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Briefcase size={16} />
              Job Applications ({pendingJobs})
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "services" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Layers size={16} />
              Pricing & Showcase
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "reviews" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Star size={16} />
              Customer Reviews
            </button>
            {profile?.role !== "staff" && (
              <>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                    activeTab === "notifications" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <Bell size={16} />
                  Notification Center
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                    activeTab === "logs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <Clipboard size={16} />
                  System Audits
                </button>
              </>
            )}
          </nav>
        </div>

        {/* RIGHT Main Content panels */}
        <div className="flex-1 space-y-6">
          
          {/* STATS PANEL */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Bookings</span>
                  <div className="text-2xl font-black text-dark leading-none">{appointments.length}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Completed Earnings</span>
                  <div className="text-2xl font-black text-emerald-500 leading-none">₹{totalRevenue}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Active Clients</span>
                  <div className="text-2xl font-black text-dark leading-none">{users.length}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Open Job Apps</span>
                  <div className="text-2xl font-black text-dark leading-none">{pendingJobs}</div>
                </div>
              </div>

              {/* Graphical info block */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-dark text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Detailing Bookings Growth
                </h3>
                <div className="h-44 flex items-end justify-between gap-2 pt-6 border-b border-gray-100">
                  {weeklyCounts.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/10 rounded-t-lg group hover:bg-primary transition-all relative cursor-pointer" style={{ height: `${(val / maxWeeklyCount) * 120}px` }}>
                        <span className="absolute -top-6 left-[50%] -translate-x-1/2 bg-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">W{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* APPOINTMENTS PANEL */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Active Bookings & Appointments</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Service Package</th>
                      <th className="pb-3 pr-4">Vehicle</th>
                      <th className="pb-3 pr-4">Date/Time</th>
                      <th className="pb-3 pr-4 text-right">Price</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-dark">{a.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{a.phone}</div>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-gray-700">{a.service}</td>
                        <td className="py-4 pr-4 font-mono text-gray-500">{a.vehicle}</td>
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-gray-700">{a.date}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{a.time}</div>
                        </td>
                        <td className="py-4 pr-4 text-right font-black text-dark">{a.price}</td>
                        <td className="py-4 pr-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            a.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : a.status === "Pending"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : a.status === "Cancelled"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-1.5 shrink-0">
                          {a.status === "Pending" && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "In Progress")}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Dispatch Crew
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "Cancelled")}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {a.status === "In Progress" && (
                            <button
                              onClick={() => updateAppointmentStatus(a.id, "Completed")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer"
                            >
                              Complete Detox
                            </button>
                          )}
                          {(a.status === "Completed" || a.status === "Cancelled") && (
                            <span className="text-[10px] text-gray-300 font-bold uppercase">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Registered Clients Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">User Details</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Saved Contact</th>
                      <th className="pb-3 pr-4 text-center">Vehicles</th>
                      <th className="pb-3 text-center">Addresses</th>
                      <th className="pb-3 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-dark">{u.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{u.uid}</div>
                        </td>
                        <td className="py-4 pr-4 font-mono">{u.email}</td>
                        <td className="py-4 pr-4 font-semibold text-gray-700">{u.phone}</td>
                        <td className="py-4 pr-4 text-center font-bold text-dark">{u.vehicleCount}</td>
                        <td className="py-4 text-center font-bold text-dark">{u.addressCount}</td>
                        <td className="py-4 text-right">
                          {profile?.role === "staff" ? (
                            <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border ${
                              u.role === "admin"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : u.role === "staff"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-blue-50 text-blue-600 border-blue-200"
                            }`}>
                              {u.role || "customer"}
                            </span>
                          ) : (
                            <select
                              value={u.role || "customer"}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                              className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                              <option value="customer">Customer</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JOBS PANEL */}
          {activeTab === "jobs" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Detailer Partner Applications</h3>
              
              <div className="space-y-4">
                {jobs.map((j) => (
                  <div key={j.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-4 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h4 className="font-heading font-extrabold text-dark text-base">{j.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                          {j.email} | {j.phone}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border uppercase tracking-wider ${
                        j.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : j.status === "Rejected"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {j.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 bg-white border border-gray-100 rounded-xl p-3.5">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Skill Focus</span>
                        <span>{j.skill}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Exp Level</span>
                        <span>{j.exp}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-gray-100/50 rounded-xl text-xs text-gray-500 italic leading-relaxed">
                      "{j.cover}"
                    </div>

                    {j.status === "Under Review" && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => updateJobStatus(j.id, "Rejected")}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                        <button
                          onClick={() => updateJobStatus(j.id, "Approved")}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Approve Partner
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRICING & SHOWCASE PANEL */}
          {activeTab === "services" && (
            <form onSubmit={saveServiceConfig} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-extrabold text-dark text-lg">Services, Prices & Image URLs</h3>
                {profile?.role !== "staff" && (
                  <button
                    type="submit"
                    className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer"
                  >
                    Save Global Config
                  </button>
                )}
              </div>

              {profile?.role === "staff" && (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Info size={16} />
                  <span>Read-Only: Detailing service pricing and showcase configs can only be modified by Super Admins.</span>
                </div>
              )}

              {showConfigAlert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Config Saved Globally! All homepage prices and image cards are immediately updated.</span>
                </motion.div>
              )}

              <div className="space-y-6">
                {[
                  { label: "Exterior Wash", key: "exterior", priceKey: "exteriorWash" },
                  { label: "Interior Cleaning", key: "interior", priceKey: "interiorCleaning" },
                  { label: "Foam Wash", key: "foam", priceKey: "foamWash" },
                  { label: "Wax Polish", key: "wax", priceKey: "waxPolish" },
                  { label: "Dashboard Cleaning", key: "dashboard", priceKey: "dashboardCleaning" },
                  { label: "Tyre Dressing", key: "tyre", priceKey: "tyreDressing" }
                ].map((s) => (
                  <div key={s.key} className="p-5 border border-gray-100 rounded-2xl space-y-4">
                    <h4 className="font-heading font-extrabold text-dark text-sm border-b border-gray-100 pb-2">{s.label}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Price input */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Base Price (₹)</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            disabled={profile?.role === "staff"}
                            value={servicePriceInputs[s.priceKey] || ""}
                            onChange={(e) => setServicePriceInputs({ ...servicePriceInputs, [s.priceKey]: Number(e.target.value) })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                          />
                          <span className="absolute left-3 top-[50%] -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                        </div>
                      </div>

                      {/* Image input */}
                      <div className="md:col-span-9 space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Showcase Image URL</label>
                        <div className="relative">
                          <input
                            type="url"
                            required
                            disabled={profile?.role === "staff"}
                            value={serviceImageInputs[s.key] || ""}
                            onChange={(e) => setServiceImageInputs({ ...serviceImageInputs, [s.key]: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-xs font-mono text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                          />
                          <Image size={14} className="absolute left-3 top-[50%] -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Description input */}
                      <div className="md:col-span-12 space-y-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Card Description</label>
                        <input
                          type="text"
                          required
                          disabled={profile?.role === "staff"}
                          value={serviceDescInputs[s.key] || ""}
                          onChange={(e) => setServiceDescInputs({ ...serviceDescInputs, [s.key]: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BEFORE & AFTER PHOTO COMPARISON OVERRIDES */}
              <div className="p-5 border border-gray-100 rounded-2xl space-y-4 bg-[#F8FAFC]/50">
                <h4 className="font-heading font-extrabold text-dark text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#F4B400]" />
                  Before & After Comparison Slider Config
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Checkbox to choose whether to use separate images */}
                  <div className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      id="useSeparateImages"
                      disabled={profile?.role === "staff"}
                      checked={beforeAfterInputs.useSeparateImages}
                      onChange={(e) => setBeforeAfterInputs({ ...beforeAfterInputs, useSeparateImages: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="useSeparateImages" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                      Use separate before/after photos (if unchecked, CSS dirty-car filter is applied to the after photo)
                    </label>
                  </div>

                  {/* After image input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">After Image (or Main Comparison Image) URL</label>
                    <input
                      type="url"
                      required
                      disabled={profile?.role === "staff"}
                      value={beforeAfterInputs.afterImage}
                      onChange={(e) => setBeforeAfterInputs({ ...beforeAfterInputs, afterImage: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 shadow-sm"
                    />
                  </div>

                  {/* Before image input */}
                  {beforeAfterInputs.useSeparateImages && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Before Image URL (Left Side)</label>
                      <input
                        type="url"
                        required
                        disabled={profile?.role === "staff"}
                        value={beforeAfterInputs.beforeImage}
                        onChange={(e) => setBeforeAfterInputs({ ...beforeAfterInputs, beforeImage: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* REVIEWS PANEL */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Customer Reviews & Review Requests</h3>
              
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-dark text-sm">{r.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{r.email}</span>
                      </div>
                      <div className="flex text-[#F4B400] gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={13} className="fill-[#F4B400]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{r.message}"</p>
                    <div className="text-[9px] text-gray-400 font-bold">{r.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS PANEL */}
          {activeTab === "logs" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                <Clipboard size={20} className="text-primary" />
                Security Audit Log
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Timestamp</th>
                      <th className="pb-3 pr-4">User ID</th>
                      <th className="pb-3 pr-4">Action Event</th>
                      <th className="pb-3 pr-4">Browser/Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pr-4 font-mono text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 pr-4 font-mono font-bold text-gray-700">{log.userId}</td>
                        <td className="py-4 pr-4 text-dark font-semibold">{log.action}</td>
                        <td className="py-4 text-gray-400 truncate max-w-xs" title={log.device}>
                          {log.device || "Unknown Device"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATION CENTER PANEL */}
          {activeTab === "notifications" && (
            <NotificationCenterTab />
          )}

        </div>

      </div>
    </div>
  );
}

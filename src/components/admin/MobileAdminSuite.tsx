import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Users,
  User,
  Wrench,
  Sparkles,
  Search,
  Filter,
  Phone,
  Edit,
  Trash2,
  Download,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  DollarSign,
  Menu,
  Bell,
  LogOut,
  Sliders,
  Star,
  Gift,
  Briefcase,
  ChevronDown,
  ArrowUpRight,
  Eye,
  EyeOff,
  Car,
  Bike,
  Tag,
  UserCheck,
  ShieldCheck,
  Smartphone,
  Image,
  MessageSquare,
  Layers,
  CheckCircle,
  XCircle,
  Sparkles as SparklesIcon
} from "lucide-react";
/**
 * Mobile-First Car & Bike Service Management Platform Suite
 */
import {
  getAllBookings,
  getAllEmployees,
  getAllServices,
  getAllCustomers,
  getAuditLogs,
  getJobApplications,
  updateJobStatus,
  getAllReviews,
  toggleHideReview,
  getAllCoupons,
  createOrUpdateCoupon,
  deleteCoupon,
  assignCouponToUser,
  getBeforeAfterItems,
  createOrUpdateBeforeAfterItem,
  deleteBeforeAfterItem,
  getAllBlogPosts,
  createOrUpdateBlogPost,
  deleteBlogPost,
  grantOrAdjustLoyaltyPoints,
  getLoyaltySettings,
  updateLoyaltySettings,
  dbBooking,
  dbEmployee,
  dbService,
  dbCoupon,
  dbBeforeAfterItem,
  dbBlogPost,
  createBooking,
  updateBookingStatus,
  rescheduleBooking,
  createOrUpdateEmployee,
  deleteEmployeeProfile,
  createOrUpdateService,
  deleteServiceProfile,
  getCompanyStatsSync,
  logAuditAction
} from "../../services/dbService";
import NotificationCenterTab from "./NotificationCenterTab";
import { useAuth } from "../../context/AuthContext";

export interface MobileAdminSuiteProps {
  onLogout?: () => void;
}

export default function MobileAdminSuite({ onLogout }: MobileAdminSuiteProps) {
  const { user, profile } = useAuth();

  // Navigation & Screen States
  const [activeScreen, setActiveScreen] = useState<
    "splash" | "login" | "dashboard" | "bookings" | "bookingDetails" | "addBooking" | "clients" | "services" | "mechanics" | "reports" | "profile" | "team" | "jobs" | "loyalty" | "reviews" | "notifications" | "audits" | "coupons" | "before_after" | "blogs"
  >("dashboard");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<dbBooking | null>(null);

  // Data collections from dbService
  const [bookingsList, setBookingsList] = useState<dbBooking[]>([]);
  const [servicesList, setServicesList] = useState<dbService[]>([]);
  const [mechanicsList, setMechanicsList] = useState<dbEmployee[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<dbCoupon[]>([]);
  const [beforeAfterList, setBeforeAfterList] = useState<dbBeforeAfterItem[]>([]);
  const [blogsList, setBlogsList] = useState<dbBlogPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters & Search State
  const [bookingFilterTab, setBookingFilterTab] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("All");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [mechanicSearchQuery, setMechanicSearchQuery] = useState("");
  const [reviewFilterTab, setReviewFilterTab] = useState<"All" | "Visible" | "Hidden">("All");
  const [reportsTimeFilter, setReportsTimeFilter] = useState<"This Week" | "This Month" | "All Time">("This Week");

  // Mobile Edit Modals & Form States
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<dbService | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", price: 499, duration: "45m", description: "", category: "Car" });

  const [editCouponModalOpen, setEditCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<dbCoupon | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", discountType: "percentage" as "percentage" | "flat", value: 10, minSpend: 500 });

  const [editBeforeAfterModalOpen, setEditBeforeAfterModalOpen] = useState(false);
  const [editingBeforeAfter, setEditingBeforeAfter] = useState<dbBeforeAfterItem | null>(null);
  const [beforeAfterForm, setBeforeAfterForm] = useState({ title: "", beforeImage: "", afterImage: "", category: "Car care" });

  const [manageBookingModalOpen, setManageBookingModalOpen] = useState(false);
  const [managingBooking, setManagingBooking] = useState<dbBooking | null>(null);
  const [bookingStatusInput, setBookingStatusInput] = useState<"Pending" | "Accepted" | "Assigned" | "In Progress" | "Completed" | "Cancelled">("Pending");
  const [assignedCrewInput, setAssignedCrewInput] = useState("");

  // Fetch real data on mount
  useEffect(() => {
    async function loadAdminData() {
      setLoadingData(true);
      try {
        const [bData, sData, eData, cData, aData, jData, rData, cpData, baData, blData] = await Promise.all([
          getAllBookings(),
          getAllServices(),
          getAllEmployees(),
          getAllCustomers(),
          getAuditLogs(),
          getJobApplications(),
          getAllReviews(true),
          getAllCoupons(),
          getBeforeAfterItems(),
          getAllBlogPosts()
        ]);
        setBookingsList(bData);
        setServicesList(sData);
        setMechanicsList(eData);
        setClientsList(cData);
        setAuditLogs(aData);
        setJobsList(jData);
        setReviewsList(rData);
        setCouponsList(cpData);
        setBeforeAfterList(baData);
        setBlogsList(blData);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadAdminData();
  }, []);

  // Compute stats
  const totalBookings = bookingsList.length || 10;
  const totalEarnings = bookingsList.reduce((sum, b) => sum + (b.price || 0), 0) || 6593;
  const activeClientsCount = clientsList.length || 8;
  const pendingJobsCount = bookingsList.filter((b) => b.bookingStatus === "Pending").length || 0;

  // Handle Add Booking submit
  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddBookingSubmitting(true);
    try {
      const selectedSvc = servicesList.find((s) => s.name === newBookingService) || servicesList[0];
      const price = selectedSvc ? selectedSvc.price : 699;

      await createBooking({
        customerId: "admin-created-" + Date.now(),
        customerName: newBookingCustomer || "Walk-in Customer",
        customerPhone: newBookingPhone || "+91 95699 49626 / +91 92501 64163",
        vehicleDetails: newBookingVehicle,
        serviceName: selectedSvc ? selectedSvc.name : "Car Wash",
        scheduledDate: newBookingDate,
        timeSlot: newBookingTime,
        price,
        notes: newBookingNotes
      });

      const updated = await getAllBookings();
      setBookingsList(updated);
      setActiveScreen("bookings");
      setQuickActionModalOpen(false);
    } catch (err) {
      console.error("Failed to create booking:", err);
    } finally {
      setAddBookingSubmitting(false);
    }
  };

  // Helper filter lists
  const filteredBookings = bookingsList.filter((b) => {
    const matchesTab =
      bookingFilterTab === "All"
        ? true
        : bookingFilterTab === "Confirmed"
          ? b.bookingStatus === "Accepted" || b.bookingStatus === "Assigned"
          : b.bookingStatus === bookingFilterTab;
    const matchesQuery =
      !bookingSearchQuery ||
      b.customerName?.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.vehicleDetails?.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      b.id?.toLowerCase().includes(bookingSearchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const filteredClients = clientsList.filter((c) => {
    if (!clientSearchQuery) return true;
    const q = clientSearchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const filteredServices = servicesList.filter((s) => {
    if (!serviceSearchQuery) return true;
    const q = serviceSearchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  const filteredMechanics = mechanicsList.filter((m) => {
    if (!mechanicSearchQuery) return true;
    const q = mechanicSearchQuery.toLowerCase();
    return m.name?.toLowerCase().includes(q) || m.department?.toLowerCase().includes(q) || m.phone?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#081220] font-sans text-dark flex justify-center selection:bg-primary/20">
      <div className="w-full max-w-md bg-[#081220] min-h-screen flex flex-col relative shadow-2xl overflow-hidden border-x border-white/5">

        {/* 1. SPLASH SCREEN */}
        {activeScreen === "splash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-[#081220] flex flex-col items-center justify-center p-6 text-center text-white relative"
          >
            <div className="w-28 h-28 bg-gradient-to-tr from-primary to-blue-400 rounded-full p-1 shadow-2xl shadow-primary/40 mb-6 animate-pulse flex items-center justify-center">
              <div className="w-full h-full bg-[#081220] rounded-full flex items-center justify-center border border-white/10">
                <span className="font-heading font-black text-3xl text-amber-400 tracking-tighter">VA</span>
              </div>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">VA CAR & BIKE CARE</h1>
            <p className="text-xs text-blue-300 font-bold tracking-widest uppercase mt-1">Admin Panel</p>

            <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden mt-12">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="bg-primary h-full rounded-full"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-2 font-medium">Loading...</span>

            <button
              onClick={() => setActiveScreen("dashboard")}
              className="mt-8 text-xs text-primary bg-white/10 px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition-all cursor-pointer"
            >
              Continue to Dashboard →
            </button>
          </motion.div>
        )}

        {/* 2. LOGIN SCREEN */}
        {activeScreen === "login" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white flex flex-col justify-between p-6"
          >
            <div className="space-y-6 pt-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary text-amber-400 rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-primary/30 border border-white/20">
                  VA
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-dark">Welcome Back!</h2>
                <p className="text-xs text-gray-500 font-medium">Login to your admin account</p>
              </div>

              <form className="space-y-4 pt-4" onSubmit={(e) => { e.preventDefault(); setActiveScreen("dashboard"); }}>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email or Phone</label>
                  <input
                    type="text"
                    placeholder="Enter email or phone"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 font-semibold text-gray-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                    Remember me
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-primary font-bold hover:underline">Forgot Password?</a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-[#0b327b] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/30 cursor-pointer transition-all mt-2"
                >
                  Login
                </button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400"><span className="bg-white px-2">or continue with</span></div>
              </div>

              <div className="flex gap-3">
                <button type="button" className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
                  <span>Google</span>
                </button>
                <button type="button" className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium py-4">
              Don't have an account? <a href="#contact" onClick={(e) => e.preventDefault()} className="text-primary font-bold hover:underline">Contact Admin</a>
            </p>
          </motion.div>
        )}

        {/* MAIN APPLICATION HEADER (For Screens 3, 4, 7, 8, 9, 10, 11) */}
        {activeScreen !== "splash" && activeScreen !== "login" && (
          <header className="bg-[#081220] text-white p-4 flex justify-between items-center sticky top-0 z-30 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-black text-amber-400 text-xs">
                  VA
                </div>
                <div>
                  <h1 className="font-heading font-extrabold text-sm text-white leading-tight capitalize">
                    {activeScreen === "dashboard" ? "Dashboard" : activeScreen}
                  </h1>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Admin Panel</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen("reports")}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white relative transition-colors cursor-pointer"
                title="Notifications & Reports"
              >
                <Bell size={16} />
                <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 ring-2 ring-[#081220]" />
              </button>

              <div
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 shadow-sm cursor-pointer"
              >
                <img
                  src={profile?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt="Profile"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>
            </div>
          </header>
        )}

        {/* 3. SCREEN: DASHBOARD */}
        {activeScreen === "dashboard" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-5 overflow-y-auto pb-24 text-white">
            {/* Top Greeting */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  👋 Good Morning,
                </span>
                <h2 className="font-heading font-extrabold text-lg text-white">
                  {profile?.name || user?.displayName || "Divyanshu"}
                </h2>
              </div>
              <span className="text-[10px] font-extrabold text-gray-400 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Statistics Grid (2x2) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-heading font-black text-2xl text-dark">{totalBookings}</span>
                  <button onClick={() => setActiveScreen("bookings")} className="text-[10px] font-bold text-primary hover:underline">View all</button>
                </div>
              </div>

              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Earnings</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-heading font-black text-2xl text-emerald-600">₹{totalEarnings}</span>
                  <button onClick={() => setActiveScreen("reports")} className="text-[10px] font-bold text-primary hover:underline">View all</button>
                </div>
              </div>

              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Clients</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-heading font-black text-2xl text-dark">{activeClientsCount}</span>
                  <button onClick={() => setActiveScreen("clients")} className="text-[10px] font-bold text-primary hover:underline">View all</button>
                </div>
              </div>

              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Open Job Apps</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-heading font-black text-2xl text-dark">{pendingJobsCount}</span>
                  <button onClick={() => setActiveScreen("bookings")} className="text-[10px] font-bold text-primary hover:underline">View all</button>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Quick Actions</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveScreen("mechanics")}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Wrench size={18} />
                  <span>Mechanics</span>
                </button>

                <button
                  onClick={() => setActiveScreen("services")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  <Sparkles size={18} />
                  <span>Services</span>
                </button>

                <button
                  onClick={() => setActiveScreen("reports")}
                  className="bg-primary hover:bg-[#0b327b] text-white p-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer transition-all"
                >
                  <FileText size={18} />
                  <span>Reports</span>
                </button>
              </div>
            </div>

            {/* Recent Bookings List */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Bookings</span>
                <button onClick={() => setActiveScreen("bookings")} className="text-xs font-bold text-primary hover:underline">View All</button>
              </div>

              <div className="space-y-2.5">
                {bookingsList.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => { setSelectedBookingDetails(b); setActiveScreen("bookingDetails"); }}
                    className="bg-white text-dark p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <VehicleMediaThumbnail serviceName={b.serviceName} vehicleDetails={b.vehicleDetails} className="w-12 h-11" />
                      <div>
                        <h4 className="font-heading font-extrabold text-xs text-dark">{b.vehicleDetails || "Honda City"}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold block">{b.serviceName || "Car Wash"}</span>
                        <span className="text-[9px] text-gray-400 font-mono block">Today, {b.timeSlot || "10:00 AM"}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block ${b.bookingStatus === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        b.bookingStatus === "Pending" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}>
                        {b.bookingStatus}
                      </span>
                      <span className="font-heading font-black text-xs text-dark block">₹{b.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. SCREEN: BOOKINGS LIST */}
        {activeScreen === "bookings" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBookingFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${bookingFilterTab === tab ? "bg-primary text-white shadow-sm" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Bookings Card List */}
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => { setSelectedBookingDetails(b); setActiveScreen("bookingDetails"); }}
                  className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 shrink-0">
                        {b.vehicleDetails?.toLowerCase().includes("bike") ? <Bike size={20} /> : <Car size={20} />}
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-dark">{b.vehicleDetails}</h4>
                        <span className="text-xs text-gray-500 font-medium block">{b.serviceName}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${b.bookingStatus === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      b.bookingStatus === "Pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        b.bookingStatus === "Cancelled" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}>
                      {b.bookingStatus}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      <span>{b.scheduledDate}, {b.timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm text-dark">₹{b.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setManagingBooking(b);
                          setBookingStatusInput(b.bookingStatus as any || "Pending");
                          setAssignedCrewInput(b.assignedEmployeeName || "");
                          setManageBookingModalOpen(true);
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg border border-blue-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <UserCheck size={12} />
                        <span>Assign</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <Calendar size={32} className="mx-auto text-gray-500" />
                  <p className="text-xs text-gray-400 font-bold">No bookings match current filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SCREEN: BOOKING DETAILS */}
        {activeScreen === "bookingDetails" && selectedBookingDetails && (
          <div className="flex-1 bg-white text-dark p-4 space-y-5 overflow-y-auto pb-24">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <button onClick={() => setActiveScreen("bookings")} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                ← Back to Bookings
              </button>
              <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                ID: {selectedBookingDetails.id}
              </span>
            </div>

            {/* Vehicle Header Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-dark text-white p-5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white">{selectedBookingDetails.vehicleDetails}</h3>
                  <span className="text-xs text-amber-400 font-bold block">{selectedBookingDetails.serviceName}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${selectedBookingDetails.bookingStatus === "Completed" ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  }`}>
                  {selectedBookingDetails.bookingStatus}
                </span>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Details</span>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-dark">{selectedBookingDetails.customerName}</h4>
                  <span className="text-xs text-gray-500 font-mono block">{selectedBookingDetails.customerPhone || "+91 95699 49626 / +91 92501 64163"}</span>
                </div>
                <a
                  href={`tel:${selectedBookingDetails.customerPhone || "9876543210"}`}
                  className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>

            {/* Service & Mechanic Details Card */}
            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Service Details</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Service Type</span>
                  <span className="font-bold text-dark">{selectedBookingDetails.serviceName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Date & Time</span>
                  <span className="font-bold text-dark">{selectedBookingDetails.scheduledDate}, {selectedBookingDetails.timeSlot}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Assigned Mechanic</span>
                  <span className="font-bold text-dark">{selectedBookingDetails.assignedEmployeeName || "Amit Kumar"}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Payment Status</span>
                  <span className="font-bold text-emerald-600">{selectedBookingDetails.paymentStatus || "Paid"}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Details</span>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedBookingDetails.price}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span>₹{Math.round(selectedBookingDetails.price * 0.18)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-600 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>₹{Math.round(selectedBookingDetails.price * 1.18)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. SCREEN: ADD NEW BOOKING */}
        {activeScreen === "addBooking" && (
          <div className="flex-1 bg-white text-dark p-4 space-y-5 overflow-y-auto pb-24">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-dark">New Booking</h3>
              <button onClick={() => setActiveScreen("dashboard")} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-gray-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Select or enter customer"
                  value={newBookingCustomer}
                  onChange={(e) => setNewBookingCustomer(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1">Customer Phone</label>
                <input
                  type="text"
                  placeholder="+91 95699 49626
+91 92501 64163"
                  value={newBookingPhone}
                  onChange={(e) => setNewBookingPhone(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1">Vehicle Details</label>
                <select
                  value={newBookingVehicle}
                  onChange={(e) => setNewBookingVehicle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                >
                  <option value="Honda City (Car)">Honda City (Car)</option>
                  <option value="Maruti Swift (Car)">Maruti Swift (Car)</option>
                  <option value="Hyundai Creta (SUV)">Hyundai Creta (SUV)</option>
                  <option value="Royal Enfield (Bike)">Royal Enfield (Bike)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 block mb-1">Select Service</label>
                <select
                  value={newBookingService}
                  onChange={(e) => setNewBookingService(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} — ₹{s.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newBookingDate}
                    onChange={(e) => setNewBookingDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-gray-700 block mb-1">Time Slot</label>
                  <select
                    value={newBookingTime}
                    onChange={(e) => setNewBookingTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-700 block mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Enter any special requests..."
                  value={newBookingNotes}
                  onChange={(e) => setNewBookingNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-dark focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={addBookingSubmitting}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all mt-4"
              >
                {addBookingSubmitting ? "Creating Booking..." : "Create Booking"}
              </button>
            </form>
          </div>
        )}

        {/* 7. SCREEN: CLIENTS / CUSTOMERS */}
        {activeScreen === "clients" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Clients Directory</h3>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-3">
              {(filteredClients.length > 0 ? filteredClients : [

              ]).map((c, i) => (
                <div key={i} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-dark">{c.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono block">{c.phone}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {c.bookingsCount || 1} Bookings
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SCREEN: SERVICES MANAGEMENT */}
        {activeScreen === "services" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Services catalog</h3>
              <button
                onClick={() => setNewServiceModalOpen(true)}
                className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-3">
              {filteredServices.map((s) => (
                <div key={s.id} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-dark">{s.name}</h4>
                      <span className="font-heading font-black text-sm text-emerald-600">₹{s.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2.5 py-1 rounded-full">
                      {s.duration || "45m"}
                    </span>
                    <button
                      onClick={() => {
                        setEditingService(s);
                        setServiceForm({
                          name: s.name,
                          price: s.price,
                          duration: s.duration || "45m",
                          description: s.description || "",
                          category: s.category || "Car"
                        });
                        setEditServiceModalOpen(true);
                      }}
                      className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete service "${s.name}"?`)) {
                          await deleteServiceProfile(s.id);
                          const updated = await getAllServices();
                          setServicesList(updated);
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. SCREEN: MECHANICS / TEAM */}
        {activeScreen === "mechanics" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Mechanics</h3>
              <button className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white cursor-pointer">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mechanics..."
                value={mechanicSearchQuery}
                onChange={(e) => setMechanicSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-3">
              {(filteredMechanics.length > 0 ? filteredMechanics : [
                { name: "Amit Kumar", role: "Senior Mechanic", status: "Available" },
                { name: "Ramesh Yadav", role: "Mechanic", status: "Available" },
                { name: "Suresh Patil", role: "Electrician", status: "Busy" },
                { name: "Manoj Singh", role: "Helper", status: "Offline" }
              ]).map((m, i) => (
                <div key={i} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-dark">{m.name}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold block">{m.role || m.department || "Detailer Squad"}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${m.status === "Available" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    m.status === "Busy" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                    {m.status || "Available"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. SCREEN: REPORTS / EARNINGS */}
        {activeScreen === "reports" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-5 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Reports</h3>
              <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setReportsTimeFilter("This Week")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg ${reportsTimeFilter === "This Week" ? "bg-primary text-white" : "text-gray-400"}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setReportsTimeFilter("This Month")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg ${reportsTimeFilter === "This Month" ? "bg-primary text-white" : "text-gray-400"}`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Earnings</span>
                <span className="font-heading font-black text-xl text-emerald-600">₹{totalEarnings}</span>
                <span className="text-[9px] font-bold text-emerald-600 block">▲ 12% from last week</span>
              </div>

              <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
                <span className="font-heading font-black text-xl text-dark">{totalBookings}</span>
                <span className="text-[9px] font-bold text-gray-400 block">+0 from last week</span>
              </div>
            </div>

            {/* Simulated Earnings Overview Bar Chart */}
            <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Earnings Overview</span>
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { day: "Mon", val: 40 },
                  { day: "Tue", val: 65 },
                  { day: "Wed", val: 35 },
                  { day: "Thu", val: 80 },
                  { day: "Fri", val: 55 },
                  { day: "Sat", val: 95 },
                  { day: "Sun", val: 70 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-primary/20 rounded-t-lg transition-all" style={{ height: `${item.val}%` }}>
                      <div className="w-full bg-primary rounded-t-lg" style={{ height: "70%" }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service-Wise Earnings Breakdown */}
            <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Service Wise Earnings</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="font-bold text-dark">Car Wash</span>
                  <span className="font-heading font-black text-dark">₹2309</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="font-bold text-dark">General Service</span>
                  <span className="font-heading font-black text-dark">₹2598</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-dark">Oil Change</span>
                  <span className="font-heading font-black text-dark">₹1686</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 11. SCREEN: TEAM ACCOUNTS */}
        {activeScreen === "team" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">Team Accounts</h3>
            <div className="space-y-3">
              {mechanicsList.map((t, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-dark">{t.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono block">{t.phone || "+91 95699 49626 / +91 92501 64163"}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                    {t.department || "Staff"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. SCREEN: JOB APPLICATIONS */}
        {activeScreen === "jobs" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">Job Applications</h3>
            <div className="space-y-3">
              {(jobsList.length > 0 ? jobsList : [
                { id: "demo-1", name: "Rahul Patel", skill: "Senior Car Detailer", exp: "4 Years", phone: "+91 91234 56789", status: "Pending" },
                { id: "demo-2", name: "Vikram Kumar", skill: "Bike Specialist", exp: "2 Years", phone: "+91 98765 12345", status: "Accepted" }
              ]).map((j, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-dark">{j.name}</h4>
                      <span className="text-xs text-amber-500 font-semibold block">{j.skill || j.role || "Detailer"}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${j.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      j.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                      {j.status || "Pending"}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-500 flex justify-between pt-1 border-t border-gray-100 font-mono">
                    <span>Exp: {j.exp || "3+ Years"}</span>
                    <a href={`tel:${j.phone}`} className="text-primary font-bold">{j.phone}</a>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={async () => {
                        await updateJobStatus(j.id, "Accepted");
                        const updated = await getJobApplications();
                        setJobsList(updated);
                      }}
                      className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await updateJobStatus(j.id, "Rejected");
                        const updated = await getJobApplications();
                        setJobsList(updated);
                      }}
                      className="flex-1 py-1.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. SCREEN: LOYALTY & REWARDS */}
        {activeScreen === "loyalty" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">Loyalty & Rewards</h3>
            <div className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Program Config</span>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Points Multiplier</span>
                  <span className="font-bold text-primary">1 Point per ₹10</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Min Redemption</span>
                  <span className="font-bold text-dark">500 Points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signup Bonus</span>
                  <span className="font-bold text-emerald-600">100 Points</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 14. SCREEN: CUSTOMER REVIEWS */}
        {activeScreen === "reviews" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Customer Reviews</h3>
              <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                {(["All", "Visible", "Hidden"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setReviewFilterTab(tab)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg ${reviewFilterTab === tab ? "bg-primary text-white" : "text-gray-400"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviewsList.filter(r => reviewFilterTab === "All" ? true : reviewFilterTab === "Visible" ? !r.isHidden : r.isHidden).map((r, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-dark">{r.customerName || "Customer Review"}</h4>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.stars || 5 }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHideReview(r.id, Boolean(r.isHidden))}
                      className={`text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${r.isHidden ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}
                    >
                      {r.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{r.isHidden ? "Hidden" : "Visible"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">"{r.review || "Excellent detailing service!"}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 15. SCREEN: NOTIFICATION CENTER */}
        {activeScreen === "notifications" && (
          <div className="flex-1 bg-white text-dark p-4 overflow-y-auto pb-24">
            <NotificationCenterTab />
          </div>
        )}

        {/* 16. SCREEN: SYSTEM AUDITS */}
        {activeScreen === "audits" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">System Audits & Security Logs</h3>
            <div className="space-y-2">
              {(auditLogs.length > 0 ? auditLogs : [
                { id: "a-1", timestamp: new Date().toISOString(), performedBy: "Divyanshu Kashyap (Super Admin)", actionDescription: "Multi-Device Notification permission granted for device." },
                { id: "a-2", timestamp: new Date(Date.now() - 3600000).toISOString(), performedBy: "Super Admin", actionDescription: "Updated service catalog & coupon configuration." },
                { id: "a-3", timestamp: new Date(Date.now() - 86400000).toISOString(), performedBy: "System Auditor", actionDescription: "Security Audit Log system active." }
              ]).slice(0, 10).map((log, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}</span>
                    <span className="text-amber-400 font-bold">{log.performedBy || "Super Admin"}</span>
                  </div>
                  <p className="text-gray-200 font-medium text-[11px]">{log.actionDescription || "System activity recorded."}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. SCREEN: COUPON MANAGER */}
        {activeScreen === "coupons" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-sm text-white">Coupon Manager</h3>
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({ code: "", discountType: "percentage", value: 10, minSpend: 500 });
                  setEditCouponModalOpen(true);
                }}
                className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {(couponsList.length > 0 ? couponsList : [
                { id: "c-1", code: "WELCOME50", discountType: "percentage", value: 50, minSpend: 499, status: "active" },
                { id: "c-2", code: "FLAT100", discountType: "flat", value: 100, minSpend: 999, status: "active" },
                { id: "c-3", code: "FESTIVE20", discountType: "percentage", value: 20, minSpend: 799, status: "active" }
              ]).map((cp, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-xs text-dark">{cp.code}</h4>
                      <span className="text-[10px] text-emerald-600 font-bold block">{cp.discountType === "percentage" ? `${cp.value}% OFF` : `₹${cp.value} OFF`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCoupon(cp);
                        setCouponForm({
                          code: cp.code,
                          discountType: cp.discountType || "percentage",
                          value: cp.value,
                          minSpend: cp.minSpend || 500
                        });
                        setEditCouponModalOpen(true);
                      }}
                      className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete coupon ${cp.code}?`)) {
                          await deleteCoupon(cp.id);
                          const updated = await getAllCoupons();
                          setCouponsList(updated);
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 18. SCREEN: BEFORE & AFTER GALLERY */}
        {activeScreen === "before_after" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">Before & After Showcase</h3>
            <div className="space-y-3">
              {(beforeAfterList.length > 0 ? beforeAfterList : [
                { id: "ba-1", title: "Sedan Ceramic Coating & Paint Protection", beforeImage: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400", afterImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400" },
                { id: "ba-2", title: "SUV Interior Deep Clean & Gloss Protection", beforeImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400", afterImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400" },
                { id: "ba-3", title: "Superbike Polish & Chain Degreasing", beforeImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400", afterImage: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400" }
              ]).map((ba, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-dark">{ba.title}</h4>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete "${ba.title}"?`)) {
                          await deleteBeforeAfterItem(ba.id);
                          const updated = await getBeforeAfterItems();
                          setBeforeAfterList(updated);
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <img src={ba.beforeImage} alt="Before" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                    <img src={ba.afterImage} alt="After" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 19. SCREEN: BLOG POSTS */}
        {activeScreen === "blogs" && (
          <div className="flex-1 bg-[#081220] p-4 space-y-4 overflow-y-auto pb-24 text-white">
            <h3 className="font-heading font-extrabold text-sm text-white">Blog & SEO Articles</h3>
            <div className="space-y-3">
              {(blogsList.length > 0 ? blogsList : [
                { id: "bl-1", title: "Top 5 Monsoon Car Paint Protection Tips", excerpt: "Learn how monsoon rain damages clear coat and how ceramic coating protects gloss.", coverImage: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300" },
                { id: "bl-2", title: "Why Regular Bike Chain Cleaning Increases Mileage", excerpt: "A clean chain reduces engine friction by up to 15%. Discover the best care routine.", coverImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300" },
                { id: "bl-3", title: "Interior Cleaning Explained", excerpt: "Deep stain extraction vs surface cleaning — which care service does your vehicle need?", coverImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=300" }
              ]).map((bl, idx) => (
                <div key={idx} className="bg-white text-dark p-4 rounded-2xl border border-gray-100 space-y-2 shadow-xs">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                      <img src={bl.coverImage || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200"} alt="Cover" className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-dark line-clamp-1">{bl.title}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{bl.excerpt}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete blog post "${bl.title}"?`)) {
                          await deleteBlogPost(bl.id);
                          const updated = await getAllBlogPosts();
                          setBlogsList(updated);
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLOATING ACTION BUTTON (FAB) & BOTTOM NAVIGATION (Screens 3, 4, 7, 8, 9, 10, 11) */}
        {activeScreen !== "splash" && activeScreen !== "login" && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#081220] border-t border-white/10 px-4 py-2 flex justify-between items-center z-40">
            <button
              onClick={() => setActiveScreen("dashboard")}
              className={`flex flex-col items-center gap-1 cursor-pointer ${activeScreen === "dashboard" ? "text-primary" : "text-gray-400 hover:text-white"}`}
            >
              <LayoutDashboard size={20} />
              <span className="text-[9px] font-bold">Home</span>
            </button>

            <button
              onClick={() => setActiveScreen("bookings")}
              className={`flex flex-col items-center gap-1 cursor-pointer ${activeScreen === "bookings" ? "text-primary" : "text-gray-400 hover:text-white"}`}
            >
              <Calendar size={20} />
              <span className="text-[9px] font-bold">Bookings</span>
            </button>

            {/* Central Floating Quick Action Button (+) */}
            <button
              onClick={() => setQuickActionModalOpen(true)}
              className="w-12 h-12 bg-primary hover:bg-[#0b327b] text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/50 border-2 border-[#081220] -mt-5 transition-transform hover:scale-105 cursor-pointer"
            >
              <Plus size={24} />
            </button>

            <button
              onClick={() => setActiveScreen("clients")}
              className={`flex flex-col items-center gap-1 cursor-pointer ${activeScreen === "clients" ? "text-primary" : "text-gray-400 hover:text-white"}`}
            >
              <Users size={20} />
              <span className="text-[9px] font-bold">Clients</span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex flex-col items-center gap-1 cursor-pointer ${drawerOpen ? "text-primary" : "text-gray-400 hover:text-white"}`}
            >
              <User size={20} />
              <span className="text-[9px] font-bold">Profile</span>
            </button>
          </nav>
        )}

        {/* 11. PROFILE & SETTINGS / DRAWER MENU */}
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 bg-dark/70 backdrop-blur-xs"
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-5 text-dark z-10"
              >
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-amber-400 flex items-center justify-center font-black text-lg shadow-md">
                      VA
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-sm text-dark">{profile?.name || "Divyanshu"}</h3>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Super Admin</span>
                    </div>
                  </div>

                  {/* Navigation Links (14 Complete System Manager Options) */}
                  <div className="space-y-1 text-xs font-bold max-h-[65vh] overflow-y-auto pr-1 no-scrollbar">
                    {[
                      { id: "dashboard", label: "System Overview", icon: TrendingUp },
                      { id: "bookings", label: `Bookings & Slots (${bookingsList.length})`, icon: Calendar },
                      { id: "clients", label: "Client Directory", icon: Users },
                      { id: "team", label: "Team Accounts", icon: UserCheck },
                      { id: "mechanics", label: "Crew Directory", icon: Wrench },
                      { id: "jobs", label: `Job Applications (${jobsList.length})`, icon: Briefcase },
                      { id: "services", label: "Services Management", icon: Sparkles },
                      { id: "loyalty", label: "Loyalty & Rewards", icon: Gift },
                      { id: "reviews", label: "Customer Reviews", icon: Star },
                      { id: "notifications", label: "Notification Center", icon: Bell },
                      { id: "audits", label: "System Audits", icon: FileText },
                      { id: "coupons", label: `Coupon Manager (${couponsList.length})`, icon: Tag },
                      { id: "blogs", label: `Blog Posts (${blogsList.length})`, icon: FileText }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveScreen(item.id as any); setDrawerOpen(false); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${activeScreen === item.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={14} className="opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* QUICK ACTION MODAL (Triggered by central + FAB) */}
        <AnimatePresence>
          {quickActionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setQuickActionModalOpen(false)}
                className="fixed inset-0 bg-dark/70 backdrop-blur-xs"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 z-10 text-dark"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-heading font-extrabold text-sm text-dark">Quick Action Menu</h3>
                  <button onClick={() => setQuickActionModalOpen(false)} className="text-gray-400 hover:text-dark">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => { setQuickActionModalOpen(false); setActiveScreen("services"); }}
                    className="p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl flex flex-col items-center gap-2 font-bold text-xs text-center cursor-pointer"
                  >
                    <Sparkles size={22} />
                    <span>Services</span>
                  </button>

                  <button
                    onClick={() => { setQuickActionModalOpen(false); setActiveScreen("mechanics"); }}
                    className="p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-2xl flex flex-col items-center gap-2 font-bold text-xs text-center cursor-pointer"
                  >
                    <Wrench size={22} />
                    <span>Mechanics</span>
                  </button>

                  <button
                    onClick={() => { setQuickActionModalOpen(false); setActiveScreen("reports"); }}
                    className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl flex flex-col items-center gap-2 font-bold text-xs text-center cursor-pointer"
                  >
                    <FileText size={22} />
                    <span>Reports</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EDIT / CREATE SERVICE MODAL SHEET */}
        <AnimatePresence>
          {editServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditServiceModalOpen(false)} className="fixed inset-0 bg-dark/70 backdrop-blur-xs" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 z-10 text-dark">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-heading font-extrabold text-sm text-dark">{editingService ? "Edit Service" : "Add New Service"}</h3>
                  <button onClick={() => setEditServiceModalOpen(false)} className="text-gray-400 hover:text-dark"><X size={18} /></button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await createOrUpdateService({ ...serviceForm, id: editingService?.id });
                  const updated = await getAllServices();
                  setServicesList(updated);
                  setEditServiceModalOpen(false);
                }} className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="text-gray-700 block mb-1">Service Name</label>
                    <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-700 block mb-1">Price (₹)</label>
                      <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-gray-700 block mb-1">Duration</label>
                      <input type="text" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Description</label>
                    <textarea rows={2} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                    {editingService ? "Save Service Changes" : "Create Service"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EDIT / CREATE COUPON MODAL SHEET */}
        <AnimatePresence>
          {editCouponModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditCouponModalOpen(false)} className="fixed inset-0 bg-dark/70 backdrop-blur-xs" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 z-10 text-dark">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-heading font-extrabold text-sm text-dark">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
                  <button onClick={() => setEditCouponModalOpen(false)} className="text-gray-400 hover:text-dark"><X size={18} /></button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await createOrUpdateCoupon({ ...couponForm, id: editingCoupon?.id });
                  const updated = await getAllCoupons();
                  setCouponsList(updated);
                  setEditCouponModalOpen(false);
                }} className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="text-gray-700 block mb-1">Promo Code</label>
                    <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary uppercase font-mono font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-700 block mb-1">Discount Type</label>
                      <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 block mb-1">Discount Value</label>
                      <input type="number" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Min Spend (₹)</label>
                    <input type="number" value={couponForm.minSpend} onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                    {editingCoupon ? "Save Coupon Changes" : "Create Coupon"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MANAGE BOOKING & ASSIGN CREW MODAL SHEET */}
        <AnimatePresence>
          {manageBookingModalOpen && managingBooking && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManageBookingModalOpen(false)} className="fixed inset-0 bg-dark/70 backdrop-blur-xs" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 z-10 text-dark">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-dark">Manage Booking</h3>
                    <span className="text-[10px] text-gray-400 font-mono block">{managingBooking.vehicleDetails}</span>
                  </div>
                  <button onClick={() => setManageBookingModalOpen(false)} className="text-gray-400 hover:text-dark"><X size={18} /></button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await updateBookingStatus(managingBooking.id, bookingStatusInput);
                  const updated = await getAllBookings();
                  setBookingsList(updated);
                  setManageBookingModalOpen(false);
                }} className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="text-gray-700 block mb-1">Booking Status</label>
                    <select value={bookingStatusInput} onChange={(e) => setBookingStatusInput(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary">
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted / Confirmed</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Assign Detailer Squad</label>
                    <select value={assignedCrewInput} onChange={(e) => setAssignedCrewInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-dark focus:outline-none focus:border-primary">
                      <option value="">Unassigned</option>
                      {mechanicsList.map((m) => (
                        <option key={m.id} value={m.name}>{m.name} ({m.department || "Crew"})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer">
                    Save Booking Changes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

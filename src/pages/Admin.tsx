import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { isLocalBlobUrl } from "../utils/mediaUtils";
import { useImageLightbox } from "../context/ImageLightboxContext";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { GoogleMapEmbed } from "../components/location/LocationPickerMap";
import SEO from "../components/seo/SEO";

import {
  getAuditLogs,
  getAllBookings,
  updateBookingStatus,
  getJobApplications,
  updateJobStatus as updateJobStatusInDb,
  getAllReviews,
  toggleHideReview,
  createOrUpdateEmployee,
  deleteEmployeeProfile,
  getAllEmployees,
  updateEmployeeProfile,
  getAllServices,
  createOrUpdateService,
  deleteServiceProfile,
  dbService,
  getAllPricingPlans,
  createOrUpdatePricingPlan,
  deletePricingPlan,
  dbPricingPlan,
  getAboutSettings,
  updateAboutSettings,
  dbAboutSettings,
  DEFAULT_ABOUT_SETTINGS,
  getContactSettings,
  updateContactSettings,
  dbContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  getLoyaltySettings,
  updateLoyaltySettings,
  grantOrAdjustLoyaltyPoints,
  dbLoyaltySettings,
  DEFAULT_LOYALTY_SETTINGS,
  getBeforeAfterItems,
  createOrUpdateBeforeAfterItem,
  deleteBeforeAfterItem,
  dbBeforeAfterItem,
  getAllBlogPosts,
  createOrUpdateBlogPost,
  deleteBlogPost,
  dbBlogPost,
  dbCoupon,
  getAllCoupons,
  createOrUpdateCoupon,
  deleteCoupon,
  assignCouponToUser,
  getCouponSettings,
  updateCouponSettings
} from "../services/dbService";
import NotificationCenterTab from "../components/admin/NotificationCenterTab";
import MobileAdminSuite from "../components/admin/MobileAdminSuite";
import CloudinaryUploader from "../components/common/CloudinaryUploader";
import AdminVehicleManager from "../components/admin/AdminVehicleManager";
import { getCartoonAvatar, getUserAvatar, handleAvatarError } from "../utils/avatar";
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
  Gift,
  CheckCircle,
  XCircle,
  Sparkles,
  Info,
  Clipboard,
  Bell,
  Plus,
  UserCheck,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  Eye,
  EyeOff,
  Tag,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Car,
  LayoutDashboard,
  BarChart3,
  LogOut,
  User,
  Clock,
  Wrench,
  FileText,
  ShieldCheck
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
  customerLatitude?: number;
  customerLongitude?: number;
  crewLatitude?: number;
  crewLongitude?: number;
  assignedEmployee?: string;
  assignedEmployeeName?: string;
  assignedEmployeePhone?: string;
  crewArrivingDate?: string;
  crewArrivingTime?: string;
  createdAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}

interface AdminUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  vehicleCount: number;
  addressCount: number;
  role?: "admin" | "customer" | "staff" | "super_admin";
  addresses?: string[];
  vehicles?: any[];
  userCoupons?: dbCoupon[];
  loyaltyPoints?: number;
  createdAt?: string;
  photoURL?: string;
  photo?: string;
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
  images?: string[];
  videos?: string[];
  serviceName?: string;
  adminReply?: string;
  isHidden?: boolean;
  createdAt?: string;
}

export default function Admin() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const { openLightbox } = useImageLightbox();
  const isAdminUser = profile?.role === "admin";
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const tabToUrlMap: Record<string, string> = {
    stats: "/admin/dashboard",
    appointments: "/admin/bookings",
    users: "/admin/customers",
    team_accounts: "/admin/team-accounts",
    staff: "/admin/mechanics",
    jobs: "/admin/job-applications",
    services: "/admin/services",
    loyalty: "/admin/loyalty",
    reviews: "/admin/reviews",
    notifications: "/admin/notifications",
    logs: "/admin/audits",
    coupons: "/admin/coupons",
    before_after: "/admin/before-after",
    blogs: "/admin/blogs",
    vehicles: "/admin/vehicles"
  };

  const urlToTabMap: Record<string, any> = {
    "/admin": "stats",
    "/admin/": "stats",
    "/admin/dashboard": "stats",
    "/admin/overview": "stats",
    "/admin/bookings": "appointments",
    "/admin/appointments": "appointments",
    "/admin/customers": "users",
    "/admin/users": "users",
    "/admin/team-accounts": "team_accounts",
    "/admin/mechanics": "staff",
    "/admin/staff": "staff",
    "/admin/job-applications": "jobs",
    "/admin/jobs": "jobs",
    "/admin/services": "services",
    "/admin/loyalty": "loyalty",
    "/admin/reviews": "reviews",
    "/admin/notifications": "notifications",
    "/admin/audits": "logs",
    "/admin/logs": "logs",
    "/admin/coupons": "coupons",
    "/admin/before-after": "before_after",
    "/admin/blogs": "blogs",
    "/admin/vehicles": "vehicles"
  };

  const activeTab = useMemo(() => {
    return urlToTabMap[location.pathname] || "stats";
  }, [location.pathname]);

  const setActiveTab = (tabId: string) => {
    const targetUrl = tabToUrlMap[tabId] || "/admin/dashboard";
    if (location.pathname !== targetUrl) {
      navigate(targetUrl);
    }
  };

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile Touch Swipe Gesture Handler (Swipe Right from edge to open, Swipe Left to close)
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onGlobalTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const onGlobalTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Ensure horizontal gesture is dominant over vertical scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        // Swipe Right from left edge (startX < 60px) -> Open Drawer
        if (deltaX > 0 && startX < 60) {
          setMobileDrawerOpen(true);
        }
        // Swipe Left (deltaX < -40px) -> Close Drawer
        else if (deltaX < -40) {
          setMobileDrawerOpen(false);
        }
      }
    };

    window.addEventListener("touchstart", onGlobalTouchStart, { passive: true });
    window.addEventListener("touchend", onGlobalTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onGlobalTouchStart);
      window.removeEventListener("touchend", onGlobalTouchEnd);
    };
  }, []);

  // Client Directory Search & Sorting State
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientSortOption, setClientSortOption] = useState<"recent" | "name_asc" | "points_desc">("recent");

  // Loyalty Management State
  const [loyaltyConfig, setLoyaltyConfig] = useState<dbLoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [loyaltySavedAlert, setLoyaltySavedAlert] = useState(false);
  const [targetLoyaltyUserId, setTargetLoyaltyUserId] = useState("");
  const [pointsAmountInput, setPointsAmountInput] = useState(100);

  // Assign Coupon Modal State
  const [selectedUserForCoupon, setSelectedUserForCoupon] = useState<AdminUser | null>(null);
  const [assignCouponInput, setAssignCouponInput] = useState("CLEAN15");
  const [assignCouponMsg, setAssignCouponMsg] = useState(false);

  // Coupons Manager Tab State
  const [couponsList, setCouponsList] = useState<dbCoupon[]>([]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<dbCoupon | null>(null);
  const [showCouponSection, setShowCouponSection] = useState(true);

  const [couponFormCode, setCouponFormCode] = useState("");
  const [couponFormType, setCouponFormType] = useState<"percentage" | "flat">("percentage");
  const [couponFormValue, setCouponFormValue] = useState<number>(15);
  const [couponFormDesc, setCouponFormDesc] = useState("");
  const [couponFormMinSpend, setCouponFormMinSpend] = useState<string>("");
  const [couponFormTargetUser, setCouponFormTargetUser] = useState("all");
  const [couponFormStatus, setCouponFormStatus] = useState<"active" | "inactive">("active");
  const [couponSavedAlert, setCouponSavedAlert] = useState(false);

  const fetchAdminCoupons = async () => {
    try {
      const data = await getAllCoupons();
      setCouponsList(data);
      const settings = await getCouponSettings();
      setShowCouponSection(settings.showCouponSection);
    } catch (e) {
      console.error("Error fetching admin coupons:", e);
    }
  };

  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponFormCode("");
    setCouponFormType("percentage");
    setCouponFormValue(15);
    setCouponFormDesc("");
    setCouponFormMinSpend("");
    setCouponFormTargetUser("all");
    setCouponFormStatus("active");
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponFormCode || !couponFormDesc) {
      alert("Please enter coupon code and description!");
      return;
    }

    const payload: Partial<dbCoupon> & { code: string } = {
      id: editingCoupon ? editingCoupon.id : undefined,
      code: couponFormCode.toUpperCase().trim(),
      discountType: couponFormType,
      discountValue: Number(couponFormValue) || 10,
      description: couponFormDesc,
      minSpend: couponFormMinSpend ? Number(couponFormMinSpend) : undefined,
      assignedUserId: couponFormTargetUser,
      status: couponFormStatus
    };

    await createOrUpdateCoupon(payload);
    setCouponSavedAlert(true);
    setTimeout(() => setCouponSavedAlert(false), 3000);
    setShowAddCouponModal(false);
    resetCouponForm();
    fetchAdminCoupons();
    fetchDirectoryUsers();
  };

  const handleDeleteCouponItem = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon code from the database?")) return;
    await deleteCoupon(couponId);
    fetchAdminCoupons();
    fetchDirectoryUsers();
  };

  const handleGrantCouponToClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCoupon || !assignCouponInput) return;
    await assignCouponToUser(assignCouponInput, selectedUserForCoupon.uid, selectedUserForCoupon.email);
    setAssignCouponMsg(true);
    setTimeout(() => {
      setAssignCouponMsg(false);
      setSelectedUserForCoupon(null);
    }, 2000);
    fetchDirectoryUsers();
    fetchAdminCoupons();
  };
  const [pointsTypeInput, setPointsTypeInput] = useState<"admin_bonus" | "admin_adjustment">("admin_bonus");
  const [pointsDescInput, setPointsDescInput] = useState("Loyalty Bonus Grant");
  const [grantSuccessMsg, setGrantSuccessMsg] = useState(false);

  // Load state variables
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJobApp[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"all" | "visible" | "hidden">("all");
  const [togglingReviewId, setTogglingReviewId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Staff Form state
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffAddress, setStaffAddress] = useState("");
  const [staffPhoto, setStaffPhoto] = useState("");
  const [staffDept, setStaffDept] = useState("Detailing Crew");
  const [staffSalary, setStaffSalary] = useState("₹18,000/month");
  const [staffBank, setStaffBank] = useState("");
  const [staffKYC, setStaffKYC] = useState<"Pending" | "Verified" | "Rejected">("Verified");
  const [staffAvail, setStaffAvail] = useState<"online" | "offline">("online");

  // Crew assignment modal state
  const [selectedBookingForAssign, setSelectedBookingForAssign] = useState<AdminAppointment | null>(null);
  const [assignCrewId, setAssignCrewId] = useState("");
  const [assignArrivalDate, setAssignArrivalDate] = useState("");
  const [assignArrivalTime, setAssignArrivalTime] = useState("");
  const [viewingBookingDetails, setViewingBookingDetails] = useState<AdminAppointment | null>(null);

  // Custom dynamic services state
  const [servicesList, setServicesList] = useState<dbService[]>([]);
  const [editingService, setEditingService] = useState<dbService | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);

  // Blogs CMS state
  const [blogsList, setBlogsList] = useState<dbBlogPost[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<dbBlogPost | null>(null);
  const [blogFormTitle, setBlogFormTitle] = useState("");
  const [blogFormExcerpt, setBlogFormExcerpt] = useState("");
  const [blogFormContent, setBlogFormContent] = useState("");
  const [blogFormCoverImage, setBlogFormCoverImage] = useState("");
  const [blogFormTags, setBlogFormTags] = useState("");

  const [serviceFormId, setServiceFormId] = useState("");
  const [serviceFormName, setServiceFormName] = useState("");
  const [serviceFormPrice, setServiceFormPrice] = useState(0);
  const [serviceFormImage, setServiceFormImage] = useState("");
  const [serviceFormDesc, setServiceFormDesc] = useState("");

  // Dynamic Pricing Plans & Subscriptions state
  const [pricingPlans, setPricingPlans] = useState<dbPricingPlan[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<dbPricingPlan | null>(null);

  const [planId, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDiscount, setPlanDiscount] = useState(15);
  const [planIcon, setPlanIcon] = useState("zap");
  const [planFeaturesText, setPlanFeaturesText] = useState("");
  const [planPopular, setPlanPopular] = useState(false);
  const [planCta, setPlanCta] = useState("Book Now");

  // System Overview Date Range Filter State
  const [statsStartDate, setStatsStartDate] = useState<string>("");
  const [statsEndDate, setStatsEndDate] = useState<string>("");
  const [statsPreset, setStatsPreset] = useState<"all" | "7days" | "30days" | "month" | "custom">("all");

  const applyStatsPreset = (preset: "all" | "7days" | "30days" | "month") => {
    setStatsPreset(preset);
    const today = new Date();
    if (preset === "all") {
      setStatsStartDate("");
      setStatsEndDate("");
    } else if (preset === "7days") {
      const d = new Date(today);
      d.setDate(today.getDate() - 6);
      setStatsStartDate(d.toISOString().slice(0, 10));
      setStatsEndDate(today.toISOString().slice(0, 10));
    } else if (preset === "30days") {
      const d = new Date(today);
      d.setDate(today.getDate() - 29);
      setStatsStartDate(d.toISOString().slice(0, 10));
      setStatsEndDate(today.toISOString().slice(0, 10));
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStatsStartDate(d.toISOString().slice(0, 10));
      setStatsEndDate(today.toISOString().slice(0, 10));
    }
  };

  // Bookings Sorting, Searching & Filtering State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [bookingSortOption, setBookingSortOption] = useState<string>("date_desc");
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");

  const filteredAndSortedAppointments = useMemo(() => {
    let result = [...appointments];

    if (result.length === 0 && !bookingSearchQuery.trim() && bookingStatusFilter === "all") {
      result = [

      ];
    }

    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q) ||
          a.vehicle.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (bookingStatusFilter !== "all") {
      result = result.filter((a) => a.status.toLowerCase() === bookingStatusFilter.toLowerCase());
    }

    result.sort((a, b) => {
      if (bookingSortOption === "date_desc") {
        return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
      }
      if (bookingSortOption === "date_asc") {
        return new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime();
      }
      if (bookingSortOption === "status_cancelled") {
        if (a.status === "Cancelled" && b.status !== "Cancelled") return -1;
        if (a.status !== "Cancelled" && b.status === "Cancelled") return 1;
      }
      if (bookingSortOption === "status_completed") {
        if (a.status === "Completed" && b.status !== "Completed") return -1;
        if (a.status !== "Completed" && b.status === "Completed") return 1;
      }
      if (bookingSortOption === "status_inprogress") {
        if (a.status === "In Progress" && b.status !== "In Progress") return -1;
        if (a.status !== "In Progress" && b.status === "In Progress") return 1;
      }
      if (bookingSortOption === "status_pending") {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
      }
      if (bookingSortOption === "price_desc") {
        const pA = Number((a.price || "").replace(/[^\d]/g, "")) || 0;
        const pB = Number((b.price || "").replace(/[^\d]/g, "")) || 0;
        return pB - pA;
      }
      if (bookingSortOption === "price_asc") {
        const pA = Number((a.price || "").replace(/[^\d]/g, "")) || 0;
        const pB = Number((b.price || "").replace(/[^\d]/g, "")) || 0;
        return pA - pB;
      }
      if (bookingSortOption === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [appointments, bookingStatusFilter, bookingSortOption, bookingSearchQuery]);

  const bookingCounts = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "Pending").length,
      inProgress: appointments.filter((a) => a.status === "In Progress").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
      cancelled: appointments.filter((a) => a.status === "Cancelled").length
    };
  }, [appointments]);

  const filteredUsers = useMemo(() => {
    let clientList = users.filter(u => u.role !== "admin" && u.role !== "staff" && u.role !== "super_admin");

    // Add rich fallback users matching the screenshot design if empty
    if (clientList.length === 0) {
      clientList = [

      ];
    }

    if (clientSearchQuery.trim()) {
      const q = clientSearchQuery.toLowerCase();
      clientList = clientList.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    if (clientSortOption === "name_asc") {
      clientList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (clientSortOption === "points_desc") {
      clientList.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
    }

    return clientList;
  }, [users, clientSearchQuery, clientSortOption]);

  // Single unified management sub-tab for Services, Pricing, Before & After, About & Contact
  const [serviceSubTab, setServiceSubTab] = useState<"catalog" | "pricing" | "before_after" | "about" | "contact">("catalog");

  // Before & After Gallery State
  const [beforeAfterItems, setBeforeAfterItems] = useState<dbBeforeAfterItem[]>([]);
  const [showBaModal, setShowBaModal] = useState(false);
  const [editingBaItem, setEditingBaItem] = useState<dbBeforeAfterItem | null>(null);
  const [isSavingBa, setIsSavingBa] = useState(false);

  const [baFormId, setBaFormId] = useState("");
  const [baFormTitle, setBaFormTitle] = useState("");
  const [baFormCategory, setBaFormCategory] = useState("Exterior Care");
  const [baFormBeforeImage, setBaFormBeforeImage] = useState("");
  const [baFormAfterImage, setBaFormAfterImage] = useState("");
  const [baFormDesc, setBaFormDesc] = useState("");

  const fetchBeforeAfterGallery = async () => {
    const data = await getBeforeAfterItems();
    setBeforeAfterItems(data);
  };

  const resetBaForm = () => {
    setBaFormId("");
    setBaFormTitle("");
    setBaFormCategory("Exterior Care");
    setBaFormBeforeImage("");
    setBaFormAfterImage("");
    setBaFormDesc("");
  };

  const openAddBaModal = () => {
    setEditingBaItem(null);
    resetBaForm();
    setShowBaModal(true);
  };

  const openEditBaModal = (item: dbBeforeAfterItem) => {
    setEditingBaItem(item);
    setBaFormId(item.id);
    setBaFormTitle(item.title);
    setBaFormCategory(item.category || "Exterior Care");
    setBaFormBeforeImage(item.beforeImage);
    setBaFormAfterImage(item.afterImage);
    setBaFormDesc(item.description || "");
    setShowBaModal(true);
  };

  const handleSaveBeforeAfterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baFormTitle) {
      alert("Please fill in Title.");
      return;
    }

    setIsSavingBa(true);
    try {
      const item: dbBeforeAfterItem = {
        id: baFormId || `ba-${Date.now()}`,
        title: baFormTitle,
        category: baFormCategory || "Exterior Care",
        beforeImage: baFormBeforeImage || "",
        afterImage: baFormAfterImage || "",
        description: baFormDesc || "",
        displayOrder: editingBaItem ? editingBaItem.displayOrder : beforeAfterItems.length + 1
      };

      await createOrUpdateBeforeAfterItem(item);
      setShowBaModal(false);
      resetBaForm();
      await fetchBeforeAfterGallery();
    } catch (err: any) {
      console.error("Error saving Before & After card:", err);
      alert("Error saving showcase card: " + (err?.message || "Failed to update card."));
    } finally {
      setIsSavingBa(false);
    }
  };

  const handleDeleteBeforeAfterItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this Before & After showcase card?")) return;
    await deleteBeforeAfterItem(id);
    fetchBeforeAfterGallery();
  };

  // About Us Page State
  const [aboutInputs, setAboutInputs] = useState<dbAboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [aboutSavedAlert, setAboutSavedAlert] = useState(false);

  // Contact Us Page State
  const [contactInputs, setContactInputs] = useState<dbContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [contactSavedAlert, setContactSavedAlert] = useState(false);

  const fetchAboutSettings = async () => {
    const data = await getAboutSettings();
    setAboutInputs(data);
  };

  const handleSaveAboutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAboutSettings(aboutInputs);
    setAboutSavedAlert(true);
    setTimeout(() => setAboutSavedAlert(false), 3000);
  };

  const fetchContactSettings = async () => {
    const data = await getContactSettings();
    setContactInputs(data);
  };

  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContactSettings(contactInputs);
    setContactSavedAlert(true);
    setTimeout(() => setContactSavedAlert(false), 3000);
  };

  const fetchLoyaltyConfig = async () => {
    const data = await getLoyaltySettings();
    setLoyaltyConfig(data);
  };

  const handleSaveLoyaltyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLoyaltySettings(loyaltyConfig);
    setLoyaltySavedAlert(true);
    setTimeout(() => setLoyaltySavedAlert(false), 3000);
  };

  const handleGrantLoyaltyPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLoyaltyUserId) {
      alert("Please select a registered client to grant points.");
      return;
    }
    const finalPoints = pointsTypeInput === "admin_adjustment" && pointsAmountInput > 0 ? -pointsAmountInput : pointsAmountInput;
    await grantOrAdjustLoyaltyPoints(
      targetLoyaltyUserId,
      finalPoints,
      pointsTypeInput,
      pointsDescInput || "Admin Points Adjustment"
    );
    setGrantSuccessMsg(true);
    setTimeout(() => setGrantSuccessMsg(false), 3500);
    fetchDirectoryUsers();
  };



  const fetchDirectoryUsers = async () => {
    try {
      const allCoupons = await getAllCoupons();

      if (isFirebaseConfigured) {
        try {
          const querySnapshot = await db.collection("users").get();
          const fbUsersList: AdminUser[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const userAddrs: string[] = Array.isArray(data.addresses) ? [...data.addresses] : [];
            const userVehs: any[] = Array.isArray(data.vehicles) ? [...data.vehicles] : [];

            if (userAddrs.length === 0) {
              const userAppts = appointments.filter(a => a.name === data.name || (data.contactNumber && a.phone === data.contactNumber));
              userAppts.forEach(a => {
                if (a.address && !userAddrs.includes(a.address)) userAddrs.push(a.address);
              });
            }

            const userCouponsList = allCoupons.filter(c => c.assignedUserId === docSnap.id || c.assignedUserId === "all" || (data.email && c.assignedUserEmail === data.email));

            fbUsersList.push({
              uid: docSnap.id,
              name: data.name || data.displayName || "Unknown User",
              email: data.email || "",
              phone: data.contactNumber || "",
              vehicleCount: userVehs.length,
              addressCount: userAddrs.length,
              role: data.role || "customer",
              addresses: userAddrs,
              vehicles: userVehs,
              userCoupons: userCouponsList,
              loyaltyPoints: data.loyaltyPoints || 0
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
        const userAddrs: string[] = Array.isArray(profileData?.addresses) ? [...profileData.addresses] : [];
        const userVehs: any[] = Array.isArray(profileData?.vehicles) ? [...profileData.vehicles] : [];

        const userCouponsList = allCoupons.filter(c => c.assignedUserId === u.uid || c.assignedUserId === "all" || (u.email && c.assignedUserEmail === u.email));

        list.push({
          uid: u.uid,
          name: u.displayName || "Valued Customer",
          email: u.email,
          phone: profileData?.contactNumber || "",
          vehicleCount: userVehs.length,
          addressCount: userAddrs.length,
          role: profileData?.role || "customer",
          addresses: userAddrs,
          vehicles: userVehs,
          userCoupons: userCouponsList,
          loyaltyPoints: profileData?.loyaltyPoints || 0
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
          await db.collection("users").doc(uid).set({ role: newRole }, { merge: true });
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

      // Sync with employees collection
      try {
        if (newRole === "staff") {
          // Fetch user data
          const userSnap = await db.collection("users").doc(uid).get();
          const userData = userSnap.exists() ? userSnap.data() : null;

          // Check if employee already exists
          const empSnap = await db.collection("employees").doc(uid).get();
          const empData = empSnap.exists() ? empSnap.data() : null;

          // Fetch simulator registered user details for email/name fallback
          let simUserEmail = "";
          let simUserDisplayName = "";
          try {
            const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
            const found = simUsers.find((u: any) => u.uid === uid);
            if (found) {
              simUserEmail = found.email || "";
              simUserDisplayName = found.displayName || "";
            }
          } catch { }

          const newEmpProfile = {
            id: uid,
            name: userData?.name || userData?.displayName || simUserDisplayName || profileData?.name || "New Detailer Crew",
            email: userData?.email || simUserEmail || profileData?.email || "",
            photo: userData?.photo || profileData?.photo || userData?.photoURL || profileData?.photoURL || getCartoonAvatar(userData?.email || simUserEmail || "detailer"),
            phone: userData?.contactNumber || userData?.phone || profileData?.contactNumber || "+91 88888 88888",
            address: userData?.address || (profileData?.addresses && profileData.addresses[0]) || "N/A",
            department: empData?.department || "Detailing Crew",
            salary: empData?.salary || "₹18,000/month",
            bankDetails: empData?.bankDetails || "N/A",
            KYCStatus: empData?.KYCStatus || "Verified",
            availability: empData?.availability || "online",
            rating: empData?.rating || 5.0,
            updatedAt: new Date().toISOString(),
            isDeleted: false
          };

          await db.collection("employees").doc(uid).set(newEmpProfile, { merge: true });
        } else {
          // If they were staff, soft delete
          const empSnap = await db.collection("employees").doc(uid).get();
          if (empSnap.exists()) {
            await db.collection("employees").doc(uid).set({ isDeleted: true }, { merge: true });
          }
        }
      } catch (syncErr) {
        console.warn("Could not sync employee profile:", syncErr);
      }

      // Refresh lists
      await fetchDirectoryUsers();
      await fetchAdminEmployees();
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
        address: b.notes || b.address || "",
        customerLatitude: b.customerLatitude,
        customerLongitude: b.customerLongitude,
        crewLatitude: b.crewLatitude,
        crewLongitude: b.crewLongitude,
        assignedEmployee: b.assignedEmployee || "",
        assignedEmployeeName: b.assignedEmployeeName || "",
        assignedEmployeePhone: b.assignedEmployeePhone || "",
        assignedEmployeePhoto: b.assignedEmployeePhoto || "",
        crewArrivingDate: b.crewArrivingDate || "",
        crewArrivingTime: b.crewArrivingTime || "",
        acceptedAt: b.acceptedAt || "",
        completedAt: b.completedAt || "",
        createdAt: b.createdAt || ""
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
      const data = await getAllReviews(true);
      const mapped = data.map((r) => ({
        id: r.id,
        name: r.customerName || "Customer",
        email: `Customer: ${r.customerId}`,
        rating: r.stars,
        message: r.review,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        images: r.images,
        videos: r.videos,
        serviceName: r.serviceName,
        adminReply: r.adminReply,
        isHidden: Boolean(r.isHidden)
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleToggleHideReview = async (reviewId: string, currentHiddenStatus: boolean) => {
    setTogglingReviewId(reviewId);
    try {
      await toggleHideReview(reviewId, !currentHiddenStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isHidden: !currentHiddenStatus } : r))
      );
    } catch (err) {
      console.error("Failed to toggle review visibility:", err);
    } finally {
      setTogglingReviewId(null);
    }
  };

  const fetchAdminEmployees = async () => {
    setEmployeesLoading(true);
    try {
      // 1. Get all employees from employees collection
      const empData = await getAllEmployees();

      // 2. Get all staff users from users collection (they have actual Firebase UIDs)
      let staffUsers: any[] = [];
      try {
        const usersSnap = await db.collection("users").get();
        usersSnap.forEach((docSnap: any) => {
          const d = docSnap.data();
          if (d.role === "staff" && !d.isDeleted) {
            staffUsers.push({
              uid: docSnap.id,
              name: d.name || d.displayName || "Crew Member",
              email: d.email || "",
              phone: d.contactNumber || d.phone || "",
            });
          }
        });
      } catch (fbErr) {
        // Simulator fallback: check sim_registered_users
        try {
          const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
          for (const u of simUsers) {
            const profileRaw = localStorage.getItem(`sim_db_users_${u.uid}`);
            const profileData = profileRaw ? JSON.parse(profileRaw) : null;
            if (profileData?.role === "staff") {
              staffUsers.push({
                uid: u.uid,
                name: u.displayName || profileData?.name || "Crew Member",
                email: u.email || "",
                phone: profileData?.contactNumber || "",
              });
            }
          }
        } catch { }
      }

      // 3. Build merged list: prefer employees collection data, but ensure id = Firebase UID
      const mergedMap = new Map<string, any>();

      // First add all employees keyed by email (lowercased) to allow re-keying
      const empByEmail = new Map<string, any>();
      for (const emp of empData) {
        if (emp.email) empByEmail.set(emp.email.toLowerCase(), emp);
      }

      // Add staff users - if a matching employee profile exists, merge it; use Firebase UID as id
      for (const su of staffUsers) {
        const existingEmp = empByEmail.get(su.email.toLowerCase());
        const merged = {
          ...(existingEmp || {}),
          id: su.uid, // Always use Firebase UID
          name: existingEmp?.name || su.name,
          email: su.email,
          phone: existingEmp?.phone || su.phone,
          department: existingEmp?.department || "Detailing Crew",
          availability: existingEmp?.availability || "online",
          KYCStatus: existingEmp?.KYCStatus || "Verified",
          rating: existingEmp?.rating || 5.0,
          photo: existingEmp?.photo || getCartoonAvatar(su.email || su.displayName),
          isLinkedToAuth: true,
        };
        mergedMap.set(su.uid, merged);

        // If the employees doc had a random id (emp-xxx), auto-fix it in Firestore
        if (existingEmp && existingEmp.id !== su.uid) {
          try {
            await db.collection("employees").doc(su.uid).set({ ...existingEmp, id: su.uid }, { merge: true });
          } catch { }
        }
      }

      // Also include employees that have no linked auth account (manual-only, can't receive bookings)
      for (const emp of empData) {
        const alreadyMerged = [...mergedMap.values()].some((m) => m.email?.toLowerCase() === emp.email?.toLowerCase());
        if (!alreadyMerged && !emp.isDeleted) {
          mergedMap.set(emp.id, { ...emp, isLinkedToAuth: false });
        }
      }

      setEmployees([...mergedMap.values()]);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone || !staffAddress) {
      alert("Please fill in Name, Email, Mobile Number, and Address.");
      return;
    }

    try {
      if (editingStaff) {
        await updateEmployeeProfile(editingStaff.id, {
          name: staffName,
          email: staffEmail,
          photo: staffPhoto || getCartoonAvatar(staffName || staffEmail),
          phone: staffPhone,
          address: staffAddress,
          department: staffDept,
          salary: staffSalary,
          bankDetails: staffBank,
          KYCStatus: staffKYC,
          availability: staffAvail
        });

        if (!editingStaff.id.startsWith("emp-")) {
          await db.collection("users").doc(editingStaff.id).set({
            name: staffName,
            contactNumber: staffPhone,
            photoURL: staffPhoto || getCartoonAvatar(staffName || staffEmail)
          }, { merge: true });
        }
      } else {
        await createOrUpdateEmployee({
          name: staffName,
          email: staffEmail,
          photo: staffPhoto || undefined,
          phone: staffPhone,
          address: staffAddress,
          department: staffDept,
          salary: staffSalary,
          bankDetails: staffBank || undefined,
          KYCStatus: staffKYC,
          availability: staffAvail
        });
      }

      setStaffName("");
      setStaffEmail("");
      setStaffPhone("");
      setStaffAddress("");
      setStaffPhoto("");
      setStaffDept("Detailing Crew");
      setStaffSalary("₹18,000/month");
      setStaffBank("");
      setStaffKYC("Verified");
      setStaffAvail("online");

      setShowAddStaffModal(false);
      setEditingStaff(null);
      await fetchAdminEmployees();
      await fetchDirectoryUsers();
    } catch (err: any) {
      console.error("Error saving staff profile:", err);
      alert("Failed to save staff profile: " + err.message);
    }
  };

  const handleDeleteStaff = async (empId: string) => {
    if (!window.confirm("Are you sure you want to remove this staff member? This will remove their crew profile and demote their user account back to a customer.")) {
      return;
    }

    try {
      await deleteEmployeeProfile(empId);
      await fetchAdminEmployees();
      await fetchDirectoryUsers();
    } catch (err: any) {
      console.error("Error deleting staff:", err);
      alert("Failed to remove staff member: " + err.message);
    }
  };

  const fetchServicesList = async () => {
    try {
      const data = await getAllServices();
      setServicesList(data);
    } catch (err) {
      console.error("Failed to load services list:", err);
    }
  };

  const fetchPricingPlans = async () => {
    setPricingLoading(true);
    try {
      const data = await getAllPricingPlans();
      setPricingPlans(data);
    } catch (err) {
      console.error("Error loading pricing plans:", err);
    } finally {
      setPricingLoading(false);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice || !planDescription) {
      alert("Please fill in Package Name, Price, and Description.");
      return;
    }

    const featuresArray = planFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const generatedId = editingPlan
      ? editingPlan.id
      : "plan-" + planName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

    const planData: dbPricingPlan = {
      id: generatedId,
      name: planName,
      description: planDescription,
      price: planPrice.startsWith("₹") ? planPrice : `₹${planPrice}`,
      subscriptionDiscountPercent: Number(planDiscount) || 15,
      icon: planIcon,
      features: featuresArray.length > 0 ? featuresArray : ["Standard Detailing Service"],
      popular: planPopular,
      cta: planCta || "Book Now"
    };

    try {
      await createOrUpdatePricingPlan(planData);
      setShowPlanModal(false);
      setEditingPlan(null);
      resetPlanForm();
      await fetchPricingPlans();
      alert("Pricing package saved successfully!");
    } catch (err: any) {
      console.error("Error saving plan:", err);
      alert("Failed to save pricing package: " + err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pricing package? It will be removed from the public Pricing page.")) {
      return;
    }
    try {
      await deletePricingPlan(id);
      await fetchPricingPlans();
      alert("Pricing package deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      alert("Failed to delete pricing package.");
    }
  };

  const resetPlanForm = () => {
    setPlanId("");
    setPlanName("");
    setPlanDescription("");
    setPlanPrice("");
    setPlanDiscount(15);
    setPlanIcon("zap");
    setPlanFeaturesText("");
    setPlanPopular(false);
    setPlanCta("Book Now");
  };

  const openAddPlanModal = () => {
    setEditingPlan(null);
    resetPlanForm();
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan: dbPricingPlan) => {
    setEditingPlan(plan);
    setPlanId(plan.id);
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanPrice(plan.price);
    setPlanDiscount(plan.subscriptionDiscountPercent ?? 15);
    setPlanIcon(plan.icon || "zap");
    setPlanFeaturesText((plan.features || []).join("\n"));
    setPlanPopular(plan.popular || false);
    setPlanCta(plan.cta || "Book Now");
    setShowPlanModal(true);
  };

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    const isAdminUser = profile.role === "admin" || profile.role === "super_admin";

    if (activeTab === "logs" && isAdminUser) {
      fetchAuditLogs();
    }
    if ((activeTab === "appointments" || activeTab === "stats") && isAdminUser) {
      fetchAdminBookings();
    }
    if (activeTab === "jobs" && isAdminUser) {
      fetchAdminJobs();
    }
    if (activeTab === "reviews") {
      fetchAdminReviews();
    }
    if (activeTab === "staff" && isAdminUser) {
      fetchAdminEmployees();
    }
    if (activeTab === "services") {
      fetchServicesList();
      fetchBeforeAfterGallery();
    }
    if (activeTab === "blogs") {
      fetchBlogPosts();
    }
    if (activeTab === "pricing") {
      fetchPricingPlans();
    }
    if (activeTab === "loyalty") {
      fetchLoyaltyConfig();
      fetchDirectoryUsers();
    }
    if (activeTab === "coupons") {
      fetchAdminCoupons();
      fetchDirectoryUsers();
    }
    if ((activeTab === "users" || activeTab === "team_accounts") && isAdminUser) {
      fetchDirectoryUsers();
    }
  }, [activeTab, authLoading, user, profile]);


  // Initialize structures
  useEffect(() => {
    if (authLoading || !user || !profile) return;
    const isAdminUser = profile.role === "admin" || profile.role === "super_admin";
    const isStaffUser = profile.role === "staff";

    if (!isAdminUser && !isStaffUser) return;

    // 1. Appointments Setup
    if (isAdminUser) {
      fetchAdminBookings();
    }

    // 2. Users Directory Setup
    if (isAdminUser) {
      fetchDirectoryUsers();
      fetchAdminCoupons();
    }

    // 3. Job Applications Setup
    if (isAdminUser) {
      fetchAdminJobs();
    }

    // 4. Reviews Setup
    fetchAdminReviews();

    // 5. Staff Directory Setup
    if (isAdminUser) {
      fetchAdminEmployees();
    }

    // 6. Custom Services & Pricing Setup
    fetchServicesList();
    fetchBlogPosts();
    fetchPricingPlans();
    fetchAboutSettings();
    fetchContactSettings();

    // Load price, image and description inputs
    const loadedPrices: Record<string, number> = {};
    const loadedImages: Record<string, string> = {};
    const loadedDescs: Record<string, string> = {};

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

  const handleAssignCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAssign) return;
    if (!assignCrewId || !assignArrivalDate || !assignArrivalTime) {
      alert("Please select a crew member and specify both arrival date and time.");
      return;
    }

    const emp = employees.find((x) => x.id === assignCrewId);
    if (!emp) {
      alert("Selected crew member not found.");
      return;
    }

    try {
      const { assignEmployee: dbAssignEmployee } = await import("../services/dbService");
      await dbAssignEmployee(
        selectedBookingForAssign.id,
        emp.id,
        emp.name,
        assignArrivalDate,
        assignArrivalTime
      );

      setSelectedBookingForAssign(null);
      setAssignCrewId("");
      setAssignArrivalDate("");
      setAssignArrivalTime("");
      await fetchAdminBookings();
    } catch (err: any) {
      console.error("Error assigning crew member:", err);
      alert("Failed to assign crew member: " + err.message);
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

  const fetchBlogPosts = async () => {
    try {
      const data = await getAllBlogPosts();
      setBlogsList(data);
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    }
  };

  const handleCreateOrUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = editingBlog ? editingBlog.slug : blogFormTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newBlog: dbBlogPost = {
        id: editingBlog?.id || `blog_${Date.now()}`,
        slug: slug,
        title: blogFormTitle,
        excerpt: blogFormExcerpt,
        content: blogFormContent,
        date: editingBlog?.date || new Date().toISOString().split("T")[0],
        author: editingBlog?.author || profile?.name || "Admin",
        coverImage: blogFormCoverImage,
        tags: blogFormTags.split(",").map(t => t.trim()).filter(Boolean)
      };
      await createOrUpdateBlogPost(newBlog);
      alert(editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
      setIsBlogModalOpen(false);
      fetchBlogPosts();
    } catch (err) {
      console.error("Error saving blog:", err);
      alert("Error saving blog post.");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      try {
        await deleteBlogPost(id);
        alert("Blog deleted successfully!");
        fetchBlogPosts();
      } catch (err) {
        console.error("Error deleting blog:", err);
        alert("Error deleting blog post.");
      }
    }
  };

  const openAddBlogModal = () => {
    setEditingBlog(null);
    setBlogFormTitle("");
    setBlogFormExcerpt("");
    setBlogFormContent("");
    setBlogFormCoverImage("");
    setBlogFormTags("");
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (blog: dbBlogPost) => {
    setEditingBlog(blog);
    setBlogFormTitle(blog.title);
    setBlogFormExcerpt(blog.excerpt);
    setBlogFormContent(blog.content);
    setBlogFormCoverImage(blog.coverImage);
    setBlogFormTags(blog.tags.join(", "));
    setIsBlogModalOpen(true);
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceFormId("");
    setServiceFormName("");
    setServiceFormPrice(0);
    setServiceFormImage("");
    setServiceFormDesc("");
    setIsAddingService(true);
  };

  const closeServiceModal = () => {
    setIsAddingService(false);
    setEditingService(null);
    setServiceFormId("");
    setServiceFormName("");
    setServiceFormPrice(0);
    setServiceFormImage("");
    setServiceFormDesc("");
  };

  const openEditServiceModal = (s: dbService) => {
    setEditingService(s);
    setServiceFormId(s.id);
    setServiceFormName(s.name);
    setServiceFormPrice(s.price);
    setServiceFormImage(s.image || "");
    setServiceFormDesc(s.description || "");
    setIsAddingService(true);
  };

  const handleCreateOrUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormId || !serviceFormName || serviceFormPrice <= 0) {
      alert("Please fill in all required service details!");
      return;
    }

    try {
      await createOrUpdateService({
        id: serviceFormId.trim().toLowerCase().replace(/\s+/g, "-"),
        name: serviceFormName,
        price: Number(serviceFormPrice),
        image: serviceFormImage || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=600",
        description: serviceFormDesc,
        isCustom: editingService ? editingService.isCustom : true
      });

      alert(editingService ? "Service updated successfully!" : "New service created successfully!");
      closeServiceModal();
      fetchServicesList();
    } catch (err) {
      console.error("Failed to save service:", err);
      alert("Error saving service.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this service? This will delete it from the website homepage and booking panels.")) {
      return;
    }
    try {
      await deleteServiceProfile(id);
      alert("Service deleted successfully!");
      fetchServicesList();
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Error deleting service.");
    }
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
      <div className="pt-24 min-h-screen bg-[#070C16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F4B400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile?.role !== "admin" && profile?.role !== "staff")) {
    return (
      <div className="pt-24 min-h-screen bg-[#070C16] flex items-center justify-center text-center px-4">
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
    <div className="pt-20 md:pt-24 min-h-screen bg-[#070C16] pb-24 relative overflow-hidden flex">
      <SEO title="Admin Control Dashboard | VA Car & Bike Care" noindex={true} />
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,#0B1424_0%,#070C16_100%)] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row gap-5 xl:gap-8">

        {/* MOBILE TOP HEADER BAR & NAVIGATION DRAWER (Visible on Mobile Screens) */}
        <div className="md:hidden w-full bg-[#081220] border border-white/10 rounded-2xl p-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="w-10 h-10 bg-[#101B2D] hover:bg-[#1A2C4B] text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm cursor-pointer transition-transform active:scale-95"
            >
              <Menu size={20} className="text-blue-400" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-amber-400 flex items-center justify-center font-black text-xs shadow-md">
                VA
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xs text-white leading-tight">VA Car & Bike Care</h3>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">Super Admin</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="px-3 py-1.5 bg-[#101B2D] text-blue-400 text-[10px] font-bold rounded-xl border border-blue-500/20 flex items-center gap-1 cursor-pointer"
          >
            <span className="capitalize">{activeTab === "team_accounts" ? "Team Accounts" : activeTab.replace("_", " ")}</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* FULL-HEIGHT MATERIAL DESIGN 3 SIDE DRAWER */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
              />

              {/* Slide-over Left Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="relative w-[85vw] max-w-[320px] h-full fixed top-0 left-0 z-50 bg-[#081220] border-r border-white/10 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* DRAWER HEADER */}
                <div className="p-5 space-y-4 border-b border-white/10 bg-[#070D18]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-amber-400 flex items-center justify-center font-black text-sm shadow-md">
                        VA
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-xs text-white">VA Car & Bike Care</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
                          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider ml-1">• Super Admin</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="w-8 h-8 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* WELCOME BANNER */}
                  <div className="bg-gradient-to-r from-[#101B2D] via-[#16253D] to-[#1D2F4E] border border-blue-500/20 rounded-2xl p-3.5 space-y-1 shadow-md">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Welcome back,</span>
                    <h4 className="font-heading font-extrabold text-sm text-white">{profile?.name || "Divyanshu"}</h4>
                    <span className="text-[9px] text-gray-400 font-semibold block">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* DRAWER MENU ITEMS (SECTION GROUPED) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
                  {/* GROUP 1: MAIN */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 block">MAIN</span>

                    {[
                      { id: "stats", label: "Dashboard", icon: LayoutDashboard },
                      { id: "appointments", label: "Bookings", badge: pendingAppts, icon: Calendar },
                      { id: "users", label: "Customers", icon: Users },
                      { id: "services", label: "Services", icon: Wrench }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => { setActiveTab(item.id as any); setMobileDrawerOpen(false); }}
                          className={`w-full h-14 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer active:scale-98 ${isActive
                            ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 font-bold"
                            : "bg-[#101B2D] text-gray-300 hover:bg-[#1A283E] hover:text-white border border-white/5 font-semibold"
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon size={18} className={isActive ? "text-white" : "text-blue-400"} />
                            <span className="text-xs">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-400"}`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight size={14} className={isActive ? "text-white/70" : "text-gray-500"} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* GROUP 2: OPERATIONS */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 block">OPERATIONS</span>

                    {[
                      ...(profile?.role !== "staff" ? [{ id: "team_accounts", label: "Team Accounts", icon: ShieldCheck }] : []),
                      { id: "staff", label: "Mechanics", icon: UserCheck },
                      { id: "jobs", label: "Job Applications", badge: pendingJobs, icon: Briefcase }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => { setActiveTab(item.id as any); setMobileDrawerOpen(false); }}
                          className={`w-full h-14 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer active:scale-98 ${isActive
                            ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 font-bold"
                            : "bg-[#101B2D] text-gray-300 hover:bg-[#1A283E] hover:text-white border border-white/5 font-semibold"
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon size={18} className={isActive ? "text-white" : "text-blue-400"} />
                            <span className="text-xs">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-400"}`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight size={14} className={isActive ? "text-white/70" : "text-gray-500"} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* GROUP 3: MANAGEMENT */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 block">MANAGEMENT</span>

                    {[
                      { id: "coupons", label: "Coupons", icon: Tag },
                      { id: "loyalty", label: "Loyalty & Rewards", icon: Gift },
                      { id: "vehicles", label: "Vehicles & Media", icon: Car },
                      { id: "reviews", label: "Reviews", icon: Star },
                      { id: "notifications", label: "Notifications", icon: Bell }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => { setActiveTab(item.id as any); setMobileDrawerOpen(false); }}
                          className={`w-full h-14 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer active:scale-98 ${isActive
                            ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 font-bold"
                            : "bg-[#101B2D] text-gray-300 hover:bg-[#1A283E] hover:text-white border border-white/5 font-semibold"
                            }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon size={18} className={isActive ? "text-white" : "text-blue-400"} />
                            <span className="text-xs">{item.label}</span>
                          </div>
                          <ChevronRight size={14} className={isActive ? "text-white/70" : "text-gray-500"} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DRAWER FOOTER */}
                <div className="p-4 border-t border-white/10 bg-[#070D18] text-[10px] text-gray-400 font-medium text-center">
                  <span className="font-bold text-white block">© VA Car & Bike Care</span>
                  <span className="text-gray-500">Enterprise SaaS Platform v1.0.0</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DESKTOP LEFT Sidebar (Visible on Tablet & Desktop Screens) */}
        <div className="hidden md:block w-full md:w-72 shrink-0 bg-white border border-white/70 rounded-2xl p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] h-fit sticky top-24 space-y-5">
          <div className="space-y-2 text-center md:text-left border-b border-gray-100 pb-5">
            <span className={`${profile?.role === "staff" ? "bg-[#34A853] text-white" : "bg-[#F4B400] text-dark"
              } text-[9px] font-black uppercase tracking-wider py-1 px-2 rounded-md`}>
              {profile?.role === "staff" ? "Crew" : "Super Admin"}
            </span>
            <h2 className="text-xl font-heading font-extrabold text-dark tracking-tight leading-tight">
              {profile?.role === "staff" ? "Crew Control Panel" : "VA Control Panel"}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {profile?.role === "staff" ? "Crew System View" : "Live System Manager"}
            </p>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "stats" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <TrendingUp size={16} />
              System Overview
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "appointments" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Calendar size={16} />
              Bookings & Slots ({pendingAppts})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "users" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Users size={16} />
              Client Directory
            </button>
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("team_accounts")}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "team_accounts" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <UserCheck size={16} />
                Team Accounts
              </button>
            )}
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("staff")}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "staff" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <UserCheck size={16} />
                Crew Directory
              </button>
            )}
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "jobs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Briefcase size={16} />
              Job Applications ({pendingJobs})
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "services" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Layers size={16} />
              Services Management
            </button>
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("loyalty")}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "loyalty" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <Gift size={16} />
                Loyalty & Rewards
              </button>
            )}
            {profile?.role !== "staff" && (
              <>
                <button
                  onClick={() => setActiveTab("coupons")}
                  className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "coupons" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                    }`}
                >
                  <Tag size={16} />
                  Coupon Manager ({couponsList.length})
                </button>
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "vehicles" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                    }`}
                >
                  <Car size={16} />
                  Vehicles & Media
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "reviews" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Star size={16} />
              Customer Reviews
            </button>
            {profile?.role !== "staff" && (
              <>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "notifications" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                    }`}
                >
                  <Bell size={16} />
                  Notification Center
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-3 py-3 px-3.5 rounded-lg transition-all cursor-pointer ${activeTab === "logs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
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

          {/* SYSTEM OVERVIEW PANEL */}
          {activeTab === "stats" && (() => {
            // Filter appointments by selected Date Range (statsStartDate to statsEndDate)
            const statsAppointments = appointments.filter(a => {
              if (!statsStartDate && !statsEndDate) return true;
              const dateStr = a.date || a.createdAt;
              if (!dateStr) return true;
              const bookingDate = new Date(dateStr);
              if (isNaN(bookingDate.getTime())) return true;

              if (statsStartDate) {
                const start = new Date(statsStartDate);
                start.setHours(0, 0, 0, 0);
                if (bookingDate < start) return false;
              }
              if (statsEndDate) {
                const end = new Date(statsEndDate);
                end.setHours(23, 59, 59, 999);
                if (bookingDate > end) return false;
              }
              return true;
            });

            const completedBookings = statsAppointments.filter(a => a.status === "Completed" || a.status === "finish" || a.status === "done" || a.status === "completed");
            const inProgressBookings = statsAppointments.filter(a => a.status === "In Progress" || a.status === "in_progress");
            const scheduledBookings = statsAppointments.filter(a => a.status === "Scheduled" || a.status === "Pending" || a.status === "pending" || a.status === "scheduled");
            const cancelledBookings = statsAppointments.filter(a => a.status === "Cancelled" || a.status === "cancelled");
            const totalRevLocal = completedBookings.reduce((sum, a) => sum + Number(a.price.replace(/[^\d]/g, "")), 0);
            const pendingPayments = scheduledBookings.reduce((sum, a) => sum + Number(a.price.replace(/[^\d]/g, "")), 0);

            // Calculate daily chart bins for the date range
            const today = new Date();
            const dailyLabels: string[] = [];
            const dailyTotals: number[] = [];
            const dailyCompleted: number[] = [];

            const startRange = statsStartDate ? new Date(statsStartDate) : new Date(today.getTime() - 6 * 86400000);
            const endRange = statsEndDate ? new Date(statsEndDate) : today;
            const diffDays = Math.max(1, Math.min(31, Math.round((endRange.getTime() - startRange.getTime()) / 86400000) + 1));

            for (let i = 0; i < diffDays; i++) {
              const d = new Date(startRange);
              d.setDate(startRange.getDate() + i);
              const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
              dailyLabels.push(label);
              const dayStr = d.toISOString().slice(0, 10);
              const dayBookings = statsAppointments.filter(a => (a.date || a.createdAt || "").slice(0, 10) === dayStr);
              dailyTotals.push(dayBookings.length);
              dailyCompleted.push(dayBookings.filter(a => a.status === "Completed" || a.status === "finish" || a.status === "done" || a.status === "completed").length);
            }
            const maxVal = Math.max(...dailyTotals, 1);

            // Top Services
            const serviceCountMap: Record<string, number> = {};
            statsAppointments.forEach(a => { if (a.service) { serviceCountMap[a.service] = (serviceCountMap[a.service] || 0) + 1; } });
            const topServices = Object.entries(serviceCountMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

            // Donut chart percentages
            const total = statsAppointments.length || 1;
            const compPct = Math.round((completedBookings.length / total) * 100);
            const inPrgPct = Math.round((inProgressBookings.length / total) * 100);
            const schPct = Math.round((scheduledBookings.length / total) * 100);
            const canPct = Math.round((cancelledBookings.length / total) * 100);

            // Donut SVG
            const radius = 50;
            const circ = 2 * Math.PI * radius;
            const seg = (pct: number) => (pct / 100) * circ;
            const statColors = ["#1B5EFF", "#F4B400", "#8B5CF6", "#EF4444"];
            const statPcts = [compPct, inPrgPct, schPct, canPct];
            let offset = 0;
            const segments = statPcts.map((pct, i) => {
              const dash = seg(pct);
              const gap = circ - dash;
              const el = { dash, gap, offset, color: statColors[i] };
              offset += dash;
              return el;
            });

            // Today's & Weekly stats
            const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 6);
            const todayStr = today.toISOString().slice(0, 10);
            const todayBookings = statsAppointments.filter(a => (a.date || "").slice(0, 10) === todayStr);
            const todayRevenue = todayBookings.filter(a => a.status === "Completed" || a.status === "finish").reduce((s, a) => s + Number(a.price.replace(/[^\d]/g, "")), 0);
            const reviewsThisWeek = reviews.filter(r => { if (!r.createdAt) return false; const d = new Date(r.createdAt); return d >= sevenDaysAgo; }).length;
            const newClientsThisWeek = users.filter(u => { if (!u.createdAt) return false; const d = new Date(u.createdAt); return d >= sevenDaysAgo; }).length;

            return (
              <div className="space-y-6">
                {/* PAGE HEADER & DATE RANGE SELECTOR BAR */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-gray-100 p-5 rounded-3xl shadow-xs">
                  <div>
                    <h2 className="text-xl md:text-2xl font-heading font-extrabold text-dark">System Overview</h2>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Real-time business performance and custom date range analytics</p>
                  </div>

                  {/* Interactive Date Range Filter Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200/80 text-xs">
                    {/* Presets */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                      {(["all", "7days", "30days", "month"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => applyStatsPreset(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${statsPreset === p ? "bg-primary text-white shadow-2xs" : "text-gray-500 hover:text-dark"
                            }`}
                        >
                          {p === "all" ? "All Time" : p === "7days" ? "7 Days" : p === "30days" ? "30 Days" : "This Month"}
                        </button>
                      ))}
                    </div>

                    {/* Date Pickers: Start Date to End Date */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
                      <Calendar size={13} className="text-primary shrink-0" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Start</span>
                      <input
                        type="date"
                        value={statsStartDate}
                        onChange={(e) => {
                          setStatsStartDate(e.target.value);
                          setStatsPreset("custom");
                        }}
                        className="bg-transparent text-xs font-bold text-dark focus:outline-none cursor-pointer"
                      />
                      <span className="text-gray-400 font-bold px-0.5">–</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">End</span>
                      <input
                        type="date"
                        value={statsEndDate}
                        onChange={(e) => {
                          setStatsEndDate(e.target.value);
                          setStatsPreset("custom");
                        }}
                        className="bg-transparent text-xs font-bold text-dark focus:outline-none cursor-pointer"
                      />
                    </div>

                    {(statsStartDate || statsEndDate) && (
                      <button
                        type="button"
                        onClick={() => applyStatsPreset("all")}
                        className="px-2.5 py-1.5 text-gray-500 hover:text-rose-600 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Clear Date Filter"
                      >
                        <X size={13} />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* TOP KPI CARDS ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Bookings", value: statsAppointments.length, icon: "📋", color: "text-blue-600", bg: "bg-blue-50 border-blue-100", trend: "+18.6%" },
                    { label: "Completed Bookings", value: completedBookings.length, icon: "✅", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", trend: "+16.3%" },
                    { label: "Total Revenue", value: `₹${totalRevLocal.toLocaleString("en-IN")}`, icon: "💰", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", trend: "+22.4%" },
                    { label: "Active Clients", value: users.length, icon: "👥", color: "text-purple-600", bg: "bg-purple-50 border-purple-100", trend: "+14.2%" },
                    { label: "Crew Members", value: employees.length, icon: "🧑‍🔧", color: "text-rose-600", bg: "bg-rose-50 border-rose-100", trend: "-2.0%" }
                  ].map((card, i) => (
                    <div key={i} className={`bg-white border ${card.bg} rounded-2xl p-4 space-y-2 shadow-sm`}>
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{card.icon}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${card.trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {card.trend} from last week
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{card.label}</p>
                      <p className={`text-2xl font-black ${card.color} leading-none`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* MIDDLE ROW: Chart + Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bookings Overview Interactive Chart */}
                  {(() => {
                    const chartW = 420;
                    const chartH = 120;
                    const n = dailyTotals.length;
                    const divisor = n > 1 ? n - 1 : 1;
                    const chartLabel = diffDays <= 1 ? "Today" : diffDays === 7 ? "Last 7 Days" : `Last ${diffDays} Days`;
                    // For large ranges, only show every Nth x-axis label
                    const labelStep = n > 20 ? 5 : n > 10 ? 3 : 1;
                    return (
                      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-extrabold text-dark text-sm">Bookings Overview</h3>
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-3 py-1 rounded-lg">{chartLabel}</span>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" />Total Bookings</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Completed</span>
                        </div>
                        {/* Interactive SVG Chart */}
                        <div className="relative h-44 select-none">
                          <svg
                            viewBox={`0 0 ${chartW} ${chartH}`}
                            className="w-full h-full overflow-visible"
                            preserveAspectRatio="none"
                          >
                            {/* Horizontal grid lines */}
                            {[0, 25, 50, 75, 100].map(y => (
                              <line key={y} x1="0" y1={y} x2={chartW} y2={y} stroke="#F3F4F6" strokeWidth="1" />
                            ))}
                            <defs>
                              <linearGradient id="ovTotalGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1B5EFF" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#1B5EFF" stopOpacity="0" />
                              </linearGradient>
                              <linearGradient id="ovCompGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34A853" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#34A853" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Area fill for total */}
                            <polygon
                              points={[
                                ...dailyTotals.map((v, i) => `${(i / divisor) * chartW},${chartH - (v / maxVal) * 100}`),
                                `${chartW},${chartH}`, `0,${chartH}`
                              ].join(" ")}
                              fill="url(#ovTotalGrad)"
                            />
                            {/* Area fill for completed */}
                            <polygon
                              points={[
                                ...dailyCompleted.map((v, i) => `${(i / divisor) * chartW},${chartH - (v / maxVal) * 100}`),
                                `${chartW},${chartH}`, `0,${chartH}`
                              ].join(" ")}
                              fill="url(#ovCompGrad)"
                            />
                            {/* Total Bookings line */}
                            <polyline
                              points={dailyTotals.map((v, i) => `${(i / divisor) * chartW},${chartH - (v / maxVal) * 100}`).join(" ")}
                              fill="none" stroke="#1B5EFF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                            />
                            {/* Completed Bookings line */}
                            <polyline
                              points={dailyCompleted.map((v, i) => `${(i / divisor) * chartW},${chartH - (v / maxVal) * 100}`).join(" ")}
                              fill="none" stroke="#34A853" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                            />
                            {/* Hover vertical line */}
                            {hoveredChartIdx !== null && (
                              <line
                                x1={(hoveredChartIdx / divisor) * chartW}
                                y1="0"
                                x2={(hoveredChartIdx / divisor) * chartW}
                                y2={chartH}
                                stroke="#6B7280"
                                strokeWidth="1"
                                strokeDasharray="3 2"
                              />
                            )}
                            {/* Interactive dots for total */}
                            {dailyTotals.map((v, i) => (
                              <g key={i}>
                                <circle
                                  cx={(i / divisor) * chartW}
                                  cy={chartH - (v / maxVal) * 100}
                                  r="16"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredChartIdx(i)}
                                  onMouseLeave={() => setHoveredChartIdx(null)}
                                />
                                <circle
                                  cx={(i / divisor) * chartW}
                                  cy={chartH - (v / maxVal) * 100}
                                  r={hoveredChartIdx === i ? 6 : 4}
                                  fill="#1B5EFF"
                                  stroke="white"
                                  strokeWidth="2"
                                  className="cursor-pointer transition-all"
                                  onMouseEnter={() => setHoveredChartIdx(i)}
                                  onMouseLeave={() => setHoveredChartIdx(null)}
                                />
                              </g>
                            ))}
                            {/* Dots for completed */}
                            {dailyCompleted.map((v, i) => (
                              <circle
                                key={i}
                                cx={(i / divisor) * chartW}
                                cy={chartH - (v / maxVal) * 100}
                                r={hoveredChartIdx === i ? 5 : 3}
                                fill="#34A853"
                                stroke="white"
                                strokeWidth="1.5"
                                className="transition-all"
                              />
                            ))}
                          </svg>

                          {/* Hover Tooltip */}
                          {hoveredChartIdx !== null && (() => {
                            const pctX = (hoveredChartIdx / divisor) * 100;
                            const alignRight = hoveredChartIdx >= Math.floor(n * 0.6);
                            return (
                              <div
                                className="absolute top-0 pointer-events-none z-20"
                                style={{
                                  left: alignRight ? undefined : `${pctX}%`,
                                  right: alignRight ? `${100 - pctX}%` : undefined,
                                  transform: alignRight ? "translateX(8px)" : "translateX(-50%)"
                                }}
                              >
                                <div className="bg-dark text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap">
                                  <p className="text-gray-400 text-[9px] mb-1">{dailyLabels[hoveredChartIdx]}</p>
                                  <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Total: <span className="text-blue-300 font-black ml-1">{dailyTotals[hoveredChartIdx]}</span></p>
                                  <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Completed: <span className="text-emerald-300 font-black ml-1">{dailyCompleted[hoveredChartIdx]}</span></p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* X-axis Labels */}
                          <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[9px] text-gray-400 font-bold">
                            {dailyLabels.map((l, i) => (
                              i % labelStep === 0 || i === n - 1 ? (
                                <span
                                  key={i}
                                  className={`cursor-pointer transition-colors ${hoveredChartIdx === i ? "text-primary font-black" : ""}`}
                                  style={{ position: "absolute", left: `${(i / divisor) * 100}%`, transform: i === 0 ? "none" : i === n - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
                                  onMouseEnter={() => setHoveredChartIdx(i)}
                                  onMouseLeave={() => setHoveredChartIdx(null)}
                                >{l}</span>
                              ) : null
                            ))}
                          </div>
                        </div>
                        {/* Y-axis hint */}
                        <div className="flex justify-between text-[8px] text-gray-300 font-bold mt-2 border-t border-gray-100 pt-2">
                          {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((v, i) => (
                            <span key={i}>{v}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bookings by Status Donut */}

                  <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h3 className="font-heading font-extrabold text-dark text-sm">Bookings by Status</h3>
                    <div className="flex justify-center">
                      <svg viewBox="0 0 120 120" className="w-32 h-32">
                        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth="18" />
                        {segments.map((seg, i) => (
                          <circle
                            key={i}
                            cx="60" cy="60" r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="18"
                            strokeDasharray={`${seg.dash} ${seg.gap}`}
                            strokeDashoffset={-seg.offset}
                            transform="rotate(-90 60 60)"
                            strokeLinecap="butt"
                            opacity={seg.dash > 0 ? 1 : 0}
                          />
                        ))}
                        <text x="60" y="58" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900" fontFamily="sans-serif">{statsAppointments.length}</text>
                        <text x="60" y="70" textAnchor="middle" fill="#9CA3AF" fontSize="6" fontFamily="sans-serif">Total</text>
                      </svg>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Completed", count: completedBookings.length, pct: compPct, color: "bg-blue-500" },
                        { label: "In Progress", count: inProgressBookings.length, pct: inPrgPct, color: "bg-amber-400" },
                        { label: "Scheduled", count: scheduledBookings.length, pct: schPct, color: "bg-purple-500" },
                        { label: "Cancelled", count: cancelledBookings.length, pct: canPct, color: "bg-rose-500" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                            <span className="text-gray-600 font-semibold">{item.label}</span>
                          </div>
                          <span className="text-dark font-bold">{item.count} ({item.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW: Top Services + Recent Bookings + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Services This Week */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-extrabold text-dark text-sm">Top Services This Week</h3>
                      <button onClick={() => setActiveTab("services")} className="text-[10px] text-primary font-bold hover:underline cursor-pointer">View All</button>
                    </div>
                    <div className="space-y-3">
                      {topServices.length > 0 ? topServices.map(([name, count], i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-dark truncate">{name}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold shrink-0">{count} Bookings</span>
                        </div>
                      )) : (
                        <div className="py-6 text-center text-gray-400 text-xs">No service data yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-extrabold text-dark text-sm">Recent Bookings</h3>
                      <button onClick={() => setActiveTab("appointments")} className="text-[10px] text-primary font-bold hover:underline cursor-pointer">View All</button>
                    </div>
                    <div className="space-y-3">
                      {statsAppointments.slice(0, 4).map((a, i) => {
                        const statusConfig: Record<string, { label: string; cls: string }> = {
                          "Completed": { label: "Completed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                          "finish": { label: "Completed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                          "done": { label: "Completed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                          "In Progress": { label: "In Progress", cls: "bg-amber-100 text-amber-700 border-amber-200" },
                          "Scheduled": { label: "Scheduled", cls: "bg-purple-100 text-purple-700 border-purple-200" },
                          "Pending": { label: "Scheduled", cls: "bg-purple-100 text-purple-700 border-purple-200" },
                          "Cancelled": { label: "Cancelled", cls: "bg-rose-100 text-rose-700 border-rose-200" }
                        };
                        const sc = statusConfig[a.status] || { label: a.status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                              <Car size={14} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-dark truncate">{a.service}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{a.name} • {a.date} {a.time ? `• ${a.time}` : ""}</p>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${sc.cls} shrink-0 uppercase`}>{sc.label}</span>
                          </div>
                        );
                      })}
                      {statsAppointments.length === 0 && (
                        <div className="py-6 text-center text-gray-400 text-xs">No bookings yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h3 className="font-heading font-extrabold text-dark text-sm">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { label: "Manage Crew", Icon: UserCheck, tab: "staff", color: "border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700" },
                        { label: "Manage Services", Icon: Wrench, tab: "services", color: "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700" },
                        { label: "System Settings", Icon: Settings, tab: "notifications", color: "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600" }
                      ] as const).map((action, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTab(action.tab)}
                          className={`border rounded-xl p-3 text-left space-y-2 transition-all cursor-pointer ${action.color}`}
                        >
                          <action.Icon size={18} className="block" />
                          <span className="text-[10px] font-extrabold leading-tight block">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM KPI STRIP */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Today's Bookings", value: todayBookings.length, icon: "📋", color: "text-blue-600" },
                    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString("en-IN")}`, icon: "💵", color: "text-emerald-600" },
                    { label: "Pending Payments", value: `₹${pendingPayments.toLocaleString("en-IN")}`, icon: "💳", color: "text-rose-600" },
                    { label: "Reviews This Week", value: reviewsThisWeek, icon: "⭐", color: "text-amber-600" },
                    { label: "New Clients This Week", value: newClientsThisWeek, icon: "👥", color: "text-purple-600" }
                  ].map((kpi, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                      <span className="text-xl shrink-0">{kpi.icon}</span>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-tight">{kpi.label}</p>
                        <p className={`text-lg font-black leading-tight ${kpi.color}`}>{kpi.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* APPOINTMENTS PANEL */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    Bookings & Appointments Sequence
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sequence listing of customer bookings with sorting by date, status, price, and customer details.
                  </p>
                </div>

                {/* Status Badges & Quick Filter Buttons */}
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <button
                    onClick={() => setBookingStatusFilter("all")}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${bookingStatusFilter === "all" ? "bg-dark text-white border-dark shadow" : "bg-gray-100 text-gray-700 border-gray-200"}`}
                  >
                    All: {bookingCounts.total}
                  </button>
                  <button
                    onClick={() => setBookingStatusFilter("pending")}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${bookingStatusFilter === "pending" ? "bg-amber-500 text-white border-amber-500 shadow" : "bg-amber-50 text-amber-600 border-amber-200"}`}
                  >
                    Pending: {bookingCounts.pending}
                  </button>
                  <button
                    onClick={() => setBookingStatusFilter("in progress")}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${bookingStatusFilter === "in progress" ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                  >
                    In Progress: {bookingCounts.inProgress}
                  </button>
                  <button
                    onClick={() => setBookingStatusFilter("completed")}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${bookingStatusFilter === "completed" ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}
                  >
                    Completed: {bookingCounts.completed}
                  </button>
                  <button
                    onClick={() => setBookingStatusFilter("cancelled")}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${bookingStatusFilter === "cancelled" ? "bg-rose-600 text-white border-rose-600 shadow" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                  >
                    Cancelled: {bookingCounts.cancelled}
                  </button>
                </div>
              </div>

              {/* Filters & Sorting Control Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, vehicle or package..."
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Filter Status:</label>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses ({bookingCounts.total})</option>
                    <option value="pending">Pending ({bookingCounts.pending})</option>
                    <option value="in progress">In Progress ({bookingCounts.inProgress})</option>
                    <option value="completed">Completed ({bookingCounts.completed})</option>
                    <option value="cancelled">Cancelled ({bookingCounts.cancelled})</option>
                  </select>
                </div>

                {/* Sort Option Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Sort By:</label>
                  <select
                    value={bookingSortOption}
                    onChange={(e) => setBookingSortOption(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="date_desc">📅 Date (Newest First)</option>
                    <option value="date_asc">📅 Date (Oldest First)</option>
                    <option value="status_pending">⏳ Sort by Pending First</option>
                    <option value="status_inprogress">🚚 Sort by In Progress First</option>
                    <option value="status_completed">✅ Sort by Completed First</option>
                    <option value="status_cancelled">❌ Sort by Cancelled First</option>
                    <option value="price_desc">💰 Price (High to Low)</option>
                    <option value="price_asc">💰 Price (Low to High)</option>
                    <option value="name_asc">👤 Customer Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Booking Cards Grid */}
              {filteredAndSortedAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAndSortedAppointments.map((a) => {
                    const statusColors: Record<string, string> = {
                      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      Pending: "bg-amber-50 text-amber-700 border-amber-200",
                      Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
                      "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
                      Assigned: "bg-purple-50 text-purple-700 border-purple-200",
                    };
                    const statusClass = statusColors[a.status] || "bg-gray-50 text-gray-500 border-gray-200";
                    return (
                      <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-black text-sm">{a.name?.charAt(0)?.toUpperCase() || "?"}</span>
                            </div>
                            <div>
                              <button
                                onClick={() => setViewingBookingDetails(a)}
                                className="font-bold text-dark text-sm hover:text-primary transition-colors text-left leading-tight block"
                              >
                                {a.name}
                              </button>
                              <div className="text-[10px] text-gray-400 font-mono">{a.phone}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusClass}`}>
                            {a.status}
                          </span>
                        </div>

                        {/* Service & Vehicle */}
                        <div className="flex flex-col gap-1 bg-gray-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <span></span>
                            {a.service}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                            <span>🚗</span>
                            {a.vehicle}
                          </div>
                        </div>

                        {/* Date / Crew row */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 rounded-xl px-3 py-2">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled</div>
                            <div className="font-bold text-dark leading-tight">{a.date}</div>
                            <div className="text-[10px] text-gray-400">{a.time}</div>
                          </div>
                          <div className="bg-gray-50 rounded-xl px-3 py-2">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Crew</div>
                            {(a.assignedEmployeeName || a.assignedEmployee) ? (
                              <>
                                <div className="font-bold text-[#0f3b94] leading-tight truncate text-[10px]">{a.assignedEmployeeName || a.assignedEmployee}</div>
                                {a.crewArrivingDate && (
                                  <div className="text-[10px] text-gray-500">ETA: {a.crewArrivingDate}</div>
                                )}
                              </>
                            ) : (
                              <div className="text-[10px] text-gray-400 font-semibold">Unassigned</div>
                            )}
                          </div>
                        </div>

                        {/* Price + Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2 flex-wrap">
                          <span className="font-black text-dark text-sm">{a.price}</span>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {a.status !== "Completed" && a.status !== "Cancelled" && (
                              <button
                                onClick={() => {
                                  setSelectedBookingForAssign(a);
                                  setAssignCrewId(a.assignedEmployee || "");
                                  setAssignArrivalDate(a.crewArrivingDate || a.date);
                                  setAssignArrivalTime(a.crewArrivingTime || "");
                                }}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-purple-200"
                              >
                                {a.assignedEmployee ? "Reassign" : "Assign Crew"}
                              </button>
                            )}
                            {a.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(a.id, "In Progress")}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-blue-200"
                                >
                                  Dispatch
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(a.id, "Cancelled")}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-rose-200"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {a.status === "Assigned" && (
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "In Progress")}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-blue-200 animate-pulse"
                              >
                                Dispatch Crew
                              </button>
                            )}
                            {a.status === "In Progress" && (
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "Completed")}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-emerald-200"
                              >
                                Mark Complete
                              </button>
                            )}
                            {(a.status === "Completed" || a.status === "Cancelled") && (
                              <button
                                onClick={() => setViewingBookingDetails(a)}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-500 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer border border-gray-200"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
                  <Calendar size={36} className="text-gray-300 stroke-1" />
                  <p className="font-semibold text-sm text-gray-400">No bookings found matching the current filters.</p>
                  <button
                    onClick={() => { setBookingStatusFilter("all"); setBookingSearchQuery(""); }}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Reset filters & search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* USERS DIRECTORY (Ultra-Compact White Theme View - Fits 5+ users on screen without scrolling) */}
          {activeTab === "users" && (
            <div className="space-y-3">
              {/* Header & Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <h2 className="font-heading font-extrabold text-white text-lg tracking-tight">Client Directory</h2>
                  <p className="text-gray-400 text-[11px]">Registered clients directory ({filteredUsers.length} total)</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-dark focus:ring-2 focus:ring-primary focus:outline-none shadow-2xs"
                    />
                    <Users size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                  </div>

                  <select
                    value={clientSortOption}
                    onChange={(e) => setClientSortOption(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-dark focus:outline-none cursor-pointer shrink-0 shadow-2xs"
                  >
                    <option value="recent">Sort: Recent</option>
                    <option value="name_asc">Sort: A-Z</option>
                    <option value="points_desc">Sort: Points</option>
                  </select>
                </div>
              </div>

              {/* Ultra-Compact Client List (Each card ~48px height -> 5-8 users visible at once) */}
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.uid} className="bg-white border border-gray-200/80 hover:border-blue-300 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5">
                    {/* Left: Compact Avatar & Client Summary */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {u.photoURL || u.photo ? (
                          <img
                            src={u.photoURL || u.photo}
                            alt={u.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-100 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-100 flex items-center justify-center shadow-2xs">
                            {(u.name || "C").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-heading font-extrabold text-dark text-xs truncate max-w-[140px] sm:max-w-xs">{u.name || "Client"}</h4>
                          <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-blue-100 shrink-0">
                            Active
                          </span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5 shrink-0">
                            ⭐ {u.loyaltyPoints || 0} Pts
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-gray-400 truncate flex items-center gap-2">
                          <span className="truncate">{u.email}</span>
                          {u.phone && <span className="font-semibold text-gray-600 shrink-0">• {u.phone}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Compact Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForCoupon(u)}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>{u.userCoupons && u.userCoupons.length > 0 ? `${u.userCoupons.length} Coupons` : "No Coupons"}</span>
                        <ChevronRight size={12} />
                      </button>

                      {profile?.role !== "staff" && (
                        <select
                          value={u.role || "customer"}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-1.5 py-1 text-[10px] font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Crew</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEAM ACCOUNTS DIRECTORY */}
          {activeTab === "team_accounts" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="text-left">
                <h3 className="font-heading font-extrabold text-dark text-lg">Crew & Admin Accounts</h3>
                <p className="text-gray-400 text-xs mt-0.5">Manage administrative roles and detailer permissions for registered team members.</p>
              </div>
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
                    {users.filter(u => u.role === "admin" || u.role === "super_admin" || u.role === "staff").map((u) => (
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
                            <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border ${u.role === "admin"
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
                              <option value="staff">Crew</option>
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
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-dark text-xl">Detailer Partner Applications</h3>
                  <p className="text-xs text-gray-500 mt-1">Review candidate applications and initiate direct contact via WhatsApp, Phone, or Email.</p>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold py-1.5 px-3 rounded-full">
                  Total Applications: {jobs.length}
                </span>
              </div>

              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
                    <Briefcase size={36} className="mx-auto text-gray-300 stroke-1" />
                    <p className="text-gray-500 font-medium text-sm">No job applications submitted yet.</p>
                  </div>
                ) : (
                  jobs.map((j) => {
                    const cleanPhone = (j.phone || "").replace(/[^\d]/g, "");
                    const defaultMsg = `Hello ${j.name}, regarding your application for ${j.skill || "Mobile Detailing Partner"} at VA Car Cleaning Service...`;
                    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;
                    const mailLink = `mailto:${j.email}?subject=${encodeURIComponent("VA Car Cleaning Service - Job Application Update")}&body=${encodeURIComponent(`Hello ${j.name},\n\nThank you for applying for the ${j.skill || "Mobile Detailing Partner"} position at VA Car Cleaning Service.\n\n`)}`;

                    return (
                      <div key={j.id} className="p-6 border border-gray-100 rounded-2xl bg-white space-y-5 shadow-sm hover:shadow-md transition-shadow">
                        {/* Header: Name, Contact badges & Status */}
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-heading font-extrabold text-dark text-lg">{j.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                              <span className="normal-case text-gray-600 font-mono flex items-center gap-1">
                                ✉️ {j.email}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="font-mono text-gray-700 flex items-center gap-1">
                                📞 {j.phone}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-black py-1.5 px-3 rounded-full border uppercase tracking-wider ${j.status === "Approved"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : j.status === "Rejected"
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}>
                            {j.status}
                          </span>
                        </div>

                        {/* Direct Action Contact Toolbar */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-b border-gray-100 py-3">
                          {/* WhatsApp Direct Action Button */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#25D366]/20"
                            title="Send pre-typed WhatsApp message"
                          >
                            <MessageCircle size={15} />
                            WhatsApp Candidate
                          </a>

                          {/* Phone Call Action Button */}
                          <a
                            href={`tel:${j.phone}`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-100"
                            title="Call candidate phone"
                          >
                            <Phone size={15} />
                            Call Candidate
                          </a>

                          {/* Email Direct Action Button */}
                          <a
                            href={mailLink}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-100"
                            title="Send email to candidate"
                          >
                            <Mail size={15} />
                            Email Candidate
                          </a>
                        </div>

                        {/* Skill Focus & Exp Level Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700 bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Skill Focus / Shift</span>
                            <span className="text-dark font-medium leading-relaxed block">{j.skill}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Experience & Background</span>
                            <span className="text-dark font-medium leading-relaxed block">{j.exp}</span>
                          </div>
                        </div>

                        {/* Cover Note */}
                        {j.cover && j.cover !== "None" && (
                          <div className="p-4 bg-amber-50/40 border border-amber-100/60 rounded-xl text-xs text-gray-700 leading-relaxed space-y-1">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Candidate Cover Note</span>
                            <p className="italic text-gray-700">"{j.cover}"</p>
                          </div>
                        )}

                        {/* Approval / Rejection Controls */}
                        {j.status === "Under Review" && (
                          <div className="flex gap-3 justify-end pt-1">
                            <button
                              onClick={() => updateJobStatus(j.id, "Rejected")}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-rose-100 transition-colors"
                            >
                              <XCircle size={15} />
                              Reject
                            </button>
                            <button
                              onClick={() => updateJobStatus(j.id, "Approved")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-emerald-100 transition-colors shadow-sm"
                            >
                              <CheckCircle size={15} />
                              Approve Partner
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          {activeTab === "services" && (
            <div className="space-y-6">
              {/* Sub-Tabs Selector Bar */}
              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-wrap gap-2 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setServiceSubTab("catalog")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${serviceSubTab === "catalog"
                      ? "bg-primary text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Layers size={14} />
                    Homepage Services ({servicesList.length})
                  </button>

                  <button
                    onClick={() => setServiceSubTab("before_after")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${serviceSubTab === "before_after"
                      ? "bg-primary text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Image size={14} />
                    Before & After Cards ({beforeAfterItems.length})
                  </button>

                  <button
                    onClick={() => setServiceSubTab("about")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${serviceSubTab === "about"
                      ? "bg-primary text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Info size={14} />
                    About Us Details
                  </button>

                  <button
                    onClick={() => setServiceSubTab("contact")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${serviceSubTab === "contact"
                      ? "bg-primary text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Phone size={14} />
                    Contact Us Details
                  </button>
                </div>

                {profile?.role !== "staff" && (
                  <div>
                    {serviceSubTab === "catalog" && (
                      <button
                        onClick={openAddServiceModal}
                        className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        Add Service
                      </button>
                    )}
                    {serviceSubTab === "pricing" && (
                      <button
                        onClick={openAddPlanModal}
                        className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        Add Package
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SUB-TAB 1: CATALOG SERVICES */}
              {serviceSubTab === "catalog" && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-heading font-extrabold text-dark text-lg">Detailing Services Catalog</h3>
                        <p className="text-gray-400 text-xs">Manage base rates, showcase images, and card descriptions.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {servicesList.map((s) => (
                        <div key={s.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex justify-between items-start pt-1">
                              <h4 className="font-bold text-dark text-sm">{s.name}</h4>
                              <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">₹{s.price}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
                            <a
                              href={`/services/${s.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-50 hover:bg-blue-100 text-primary font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 transition-colors"
                            >
                              View Webpage ↗
                            </a>
                            {profile?.role !== "staff" && (
                              <>
                                <button
                                  onClick={() => openEditServiceModal(s)}
                                  className="bg-gray-100 hover:bg-gray-200 text-dark font-bold py-1.5 px-3 rounded-xl text-xs cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteService(s.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-1.5 px-3 rounded-xl text-xs cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB: BEFORE & AFTER SHOWCASE CARDS */}
              {serviceSubTab === "before_after" && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                        <Image size={20} className="text-primary" />
                        Before & After Showcase Manager
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">Manage side-by-side detailing comparison cards with Cloudinary image hosting support.</p>
                    </div>
                    {profile?.role !== "staff" && (
                      <button
                        type="button"
                        onClick={openAddBaModal}
                        className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-5 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        Add Before/After Card
                      </button>
                    )}
                  </div>

                  {beforeAfterItems.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                        <Image size={24} />
                      </div>
                      <h4 className="font-heading font-extrabold text-dark text-sm">No Before & After Cards Yet</h4>
                      <p className="text-gray-400 text-xs max-w-xs mx-auto">Click 'Add Before/After Card' above to publish detailing result cards.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {beforeAfterItems.map((ba) => (
                        <div key={ba.id} className="border border-gray-200 rounded-3xl p-5 space-y-4 shadow-sm bg-gray-50/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                {ba.category || "Detailing"}
                              </span>
                              <h4 className="font-heading font-extrabold text-dark text-base mt-1">{ba.title}</h4>
                              {ba.description && <p className="text-xs text-gray-500 font-semibold">{ba.description}</p>}
                            </div>
                            {profile?.role !== "staff" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditBaModal(ba)}
                                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBeforeAfterItem(ba.id)}
                                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Image Comparison Thumbnail */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Before Detailing</span>
                              <div className="h-32 rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
                                {ba.beforeImage ? (
                                  <img src={ba.beforeImage} alt="Before" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold">No Image</div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">After VA Detailing</span>
                              <div className="h-32 rounded-2xl overflow-hidden border border-emerald-300 bg-gray-900">
                                {ba.afterImage ? (
                                  <img src={ba.afterImage} alt="After" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-emerald-500 text-[10px] font-bold">No Image</div>
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

              {/* SUB-TAB 3: ABOUT US PAGE DETAILS */}
              {serviceSubTab === "about" && (
                <form onSubmit={handleSaveAboutSettings} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-extrabold text-dark text-xl flex items-center gap-2">
                        <Info size={22} className="text-primary" />
                        About Us Page Content Management
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Edit the hero titles, story paragraphs, image, and dynamic statistics displayed on the /about page.
                      </p>
                    </div>
                    {profile?.role !== "staff" && (
                      <button
                        type="submit"
                        className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer"
                      >
                        Save About Details
                      </button>
                    )}
                  </div>

                  {aboutSavedAlert && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>About Us page content updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Eyebrow Tag</label>
                      <input
                        type="text"
                        required
                        value={aboutInputs.badge}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, badge: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Main Heading</label>
                      <input
                        type="text"
                        required
                        value={aboutInputs.title}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Subtitle Paragraph</label>
                      <textarea
                        required
                        rows={2}
                        value={aboutInputs.subtitle}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, subtitle: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Main Story Title</label>
                      <input
                        type="text"
                        required
                        value={aboutInputs.storyHeading}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, storyHeading: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Story Paragraph 1</label>
                      <textarea
                        required
                        rows={3}
                        value={aboutInputs.storyText1}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, storyText1: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Story Paragraph 2</label>
                      <textarea
                        required
                        rows={3}
                        value={aboutInputs.storyText2}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, storyText2: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <CloudinaryUploader
                        label="Story Showcase Image"
                        value={aboutInputs.storyImageUrl}
                        onChange={(url) => setAboutInputs({ ...aboutInputs, storyImageUrl: url })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 text-left">
                    <span className="text-xs font-bold text-dark uppercase tracking-wider block mb-3">Company Statistics Grid</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Stat 1 Count</label>
                        <input
                          type="text"
                          value={aboutInputs.stat1Number}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat1Number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-dark"
                        />
                        <input
                          type="text"
                          value={aboutInputs.stat1Label}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat1Label: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-[10px] text-gray-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Stat 2 Count</label>
                        <input
                          type="text"
                          value={aboutInputs.stat2Number}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat2Number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-dark"
                        />
                        <input
                          type="text"
                          value={aboutInputs.stat2Label}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat2Label: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-[10px] text-gray-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Stat 3 Count</label>
                        <input
                          type="text"
                          value={aboutInputs.stat3Number}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat3Number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-dark"
                        />
                        <input
                          type="text"
                          value={aboutInputs.stat3Label}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat3Label: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-[10px] text-gray-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Stat 4 Count</label>
                        <input
                          type="text"
                          value={aboutInputs.stat4Number}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat4Number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-dark"
                        />
                        <input
                          type="text"
                          value={aboutInputs.stat4Label}
                          onChange={(e) => setAboutInputs({ ...aboutInputs, stat4Label: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-[10px] text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* SUB-TAB 4: CONTACT US PAGE DETAILS */}
              {serviceSubTab === "contact" && (
                <form onSubmit={handleSaveContactSettings} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-extrabold text-dark text-xl flex items-center gap-2">
                        <Phone size={22} className="text-primary" />
                        Contact Us Page & Support Details
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Edit phone numbers, email, operational coverage address, and WhatsApp widget details.
                      </p>
                    </div>
                    {profile?.role !== "staff" && (
                      <button
                        type="submit"
                        className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer"
                      >
                        Save Contact Details
                      </button>
                    )}
                  </div>

                  {contactSavedAlert && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>Contact Us page details updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Eyebrow Badge</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.badge}
                        onChange={(e) => setContactInputs({ ...contactInputs, badge: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Title</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.title}
                        onChange={(e) => setContactInputs({ ...contactInputs, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Subtitle</label>
                      <textarea
                        required
                        rows={2}
                        value={contactInputs.subtitle}
                        onChange={(e) => setContactInputs({ ...contactInputs, subtitle: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Primary Helpline Phone 1</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.phone1}
                        onChange={(e) => setContactInputs({ ...contactInputs, phone1: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secondary Helpline Phone 2</label>
                      <input
                        type="text"
                        value={contactInputs.phone2}
                        onChange={(e) => setContactInputs({ ...contactInputs, phone2: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Support Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactInputs.email}
                        onChange={(e) => setContactInputs({ ...contactInputs, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Coverage Area Address</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.address}
                        onChange={(e) => setContactInputs({ ...contactInputs, address: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Number (e.g. 918882540255)</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.whatsappNumber}
                        onChange={(e) => setContactInputs({ ...contactInputs, whatsappNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Floating Widget Message</label>
                      <input
                        type="text"
                        required
                        value={contactInputs.whatsappMessage}
                        onChange={(e) => setContactInputs({ ...contactInputs, whatsappMessage: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100">
                      <h4 className="font-heading font-bold text-dark text-sm mb-4">Social Media Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook URL</label>
                          <input
                            type="url"
                            value={contactInputs.facebook || ""}
                            onChange={(e) => setContactInputs({ ...contactInputs, facebook: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                          <input
                            type="url"
                            value={contactInputs.instagram || ""}
                            onChange={(e) => setContactInputs({ ...contactInputs, instagram: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">YouTube URL</label>
                          <input
                            type="url"
                            value={contactInputs.youtube || ""}
                            onChange={(e) => setContactInputs({ ...contactInputs, youtube: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twitter URL</label>
                          <input
                            type="url"
                            value={contactInputs.twitter || ""}
                            onChange={(e) => setContactInputs({ ...contactInputs, twitter: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* REVIEWS PANEL */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-dark text-lg">Customer Reviews & Public Visibility</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Control which customer reviews are visible on service pages and the public website.</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl border border-gray-200/50">
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reviewFilter === "all" ? "bg-white text-dark shadow-sm" : "text-gray-500 hover:text-dark"
                      }`}
                  >
                    All ({reviews.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter("visible")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reviewFilter === "visible" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-dark"
                      }`}
                  >
                    Visible ({reviews.filter((r) => !r.isHidden).length})
                  </button>
                  <button
                    onClick={() => setReviewFilter("hidden")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reviewFilter === "hidden" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-dark"
                      }`}
                  >
                    Hidden ({reviews.filter((r) => r.isHidden).length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {reviews
                  .filter((r) => {
                    if (reviewFilter === "visible") return !r.isHidden;
                    if (reviewFilter === "hidden") return r.isHidden;
                    return true;
                  })
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 border rounded-2xl space-y-3 transition-all ${r.isHidden
                        ? "border-amber-200 bg-amber-50/20 opacity-90"
                        : "border-gray-100 bg-gray-50/30"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-dark text-sm">{r.name}</h4>
                            {r.isHidden ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                <EyeOff size={10} /> Hidden from Website & Services
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <Eye size={10} /> Visible on Website
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{r.email}</span>
                          {r.serviceName && (
                            <span className="inline-block text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                              {r.serviceName}
                            </span>
                          )}
                        </div>
                        <div className="flex text-[#F4B400] gap-0.5 items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={13} className="fill-[#F4B400]" />
                          ))}
                          <span className="text-[10px] font-black text-dark ml-1">{r.rating}/5</span>
                        </div>
                      </div>

                      <p className="text-xs text-dark font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-gray-100">
                        "{r.message}"
                      </p>

                      {/* Customer Attached Photos & Videos */}
                      {(r.images?.length || r.videos?.length) ? (
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                            Verified Customer Media Attachments
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {r.images?.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => openLightbox({ url: imgUrl, type: "image", title: `Review photo by ${r.name}` })}
                                className="cursor-pointer group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                              >
                                <img src={imgUrl} alt="Customer review photo" className="w-16 h-16 object-cover group-hover:scale-105 transition-transform" />
                              </button>
                            ))}
                            {r.videos?.map((vidUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => openLightbox({ url: vidUrl, type: "video", title: `Review video by ${r.name}` })}
                                className="cursor-pointer group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-black"
                              >
                                {!isLocalBlobUrl(vidUrl) ? (
                                  <video src={vidUrl} className="w-24 h-16 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                  <div className="w-28 h-16 bg-amber-50 border border-amber-200 p-1 flex flex-col justify-center items-center text-center text-amber-800 text-[8px] font-bold">
                                    <span>⚠️ Local Session Blob</span>
                                    <span className="text-[7px] text-amber-600 font-normal">Re-upload required</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-7 h-7 rounded-full bg-amber-500 text-dark flex items-center justify-center font-bold text-xs shadow-md">
                                    ▶
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="text-[9px] text-gray-400 font-bold pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                        <span>Submitted: {r.date}</span>

                        <div className="flex items-center gap-3">
                          {r.adminReply && (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">✓ Admin Replied</span>
                          )}

                          <button
                            onClick={() => handleToggleHideReview(r.id, Boolean(r.isHidden))}
                            disabled={togglingReviewId === r.id}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${r.isHidden
                              ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 shadow-sm"
                              : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                              }`}
                            title={r.isHidden ? "Click to make this review visible on website & service pages" : "Click to hide this review from website & service pages"}
                          >
                            {togglingReviewId === r.id ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : r.isHidden ? (
                              <>
                                <Eye size={13} />
                                <span>Unhide Review (Show on Website)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={13} />
                                <span>Hide Review from Website</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {reviews.filter((r) => {
                  if (reviewFilter === "visible") return !r.isHidden;
                  if (reviewFilter === "hidden") return r.isHidden;
                  return true;
                }).length === 0 && (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">No reviews match the selected filter ({reviewFilter}).</p>
                    </div>
                  )}
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

          {/* STAFF PANEL */}
          {activeTab === "staff" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-dark text-lg">Detailing Crew Directory</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Manage details, departments, salary, and status of service detailers.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setShowAddStaffModal(true);
                  }}
                  className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Add Crew Member
                </button>
              </div>

              {employeesLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : employees.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                  <UserCheck size={36} className="mx-auto text-gray-300" />
                  <p className="font-semibold text-sm">No Crew Registered</p>
                  <p className="text-xs">Click the button above to register your first crew member.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Crew Details</th>
                        <th className="pb-3 pr-4">Contact Info</th>
                        <th className="pb-3 pr-4">Department & Salary</th>
                        <th className="pb-3 pr-4 text-center">KYC & Availability</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                <img
                                  src={emp.photo || getCartoonAvatar(emp.name || emp.email)}
                                  onError={(e) => handleAvatarError(e, emp.name || emp.email)}
                                  alt={emp.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-dark text-sm">{emp.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.id}</div>
                                {emp.isLinkedToAuth === false ? (
                                  <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 py-0.5 px-1.5 rounded mt-0.5">⚠️ No Login Account</span>
                                ) : (
                                  <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 py-0.5 px-1.5 rounded mt-0.5">✓ Auth Linked</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="font-semibold text-gray-700">{emp.phone}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.email}</div>
                            <div className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate" title={emp.address}>{emp.address}</div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="font-bold text-dark">{emp.department}</div>
                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{emp.salary}</div>
                          </td>
                          <td className="py-4 pr-4 text-center space-y-1">
                            <div>
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full ${emp.KYCStatus === "Verified"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : emp.KYCStatus === "Rejected"
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}>
                                KYC: {emp.KYCStatus || "Pending"}
                              </span>
                            </div>
                            <div>
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full ${emp.availability === "online"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}>
                                {emp.availability === "online" ? "Active" : "Offline"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingStaff(emp);
                                setStaffName(emp.name || "");
                                setStaffEmail(emp.email || "");
                                setStaffPhone(emp.phone || "");
                                setStaffAddress(emp.address || "");
                                setStaffPhoto(emp.photo || "");
                                setStaffDept(emp.department || "Detailing Crew");
                                setStaffSalary(emp.salary || "₹18,000/month");
                                setStaffBank(emp.bankDetails || "");
                                setStaffKYC(emp.KYCStatus || "Verified");
                                setStaffAvail(emp.availability || "online");
                                setShowAddStaffModal(true);
                              }}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(emp.id)}
                              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* LOYALTY & REWARDS MANAGEMENT TAB */}
          {activeTab === "loyalty" && (
            <div className="space-y-6">
              {/* Card 1: Loyalty Program Settings */}
              <form onSubmit={handleSaveLoyaltyConfig} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F4B400] flex items-center justify-center border border-amber-200">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-dark text-lg">Loyalty & Rewards Program Rules</h3>
                      <p className="text-gray-400 text-xs mt-0.5">Configure earning rates, redemption values, and welcome bonus rewards.</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <input
                      type="checkbox"
                      checked={loyaltyConfig.enabled}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, enabled: e.target.checked })}
                      className="w-4 h-4 text-primary accent-[#F4B400] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-dark">{loyaltyConfig.enabled ? "Program Active ✅" : "Program Disabled ❌"}</span>
                  </label>
                </div>

                {loyaltySavedAlert && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Loyalty program settings saved successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Earn Rate (Points per ₹100 spent)</label>
                    <input
                      type="number"
                      min={1}
                      value={loyaltyConfig.pointsPer100Spent}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, pointsPer100Spent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-gray-400">e.g. 10 points for every ₹100 booking value.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Redemption Value (₹ INR per 1 Point)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={loyaltyConfig.pointRedemptionValue}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, pointRedemptionValue: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-gray-400">e.g. 1 point = ₹1 discount.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Min Points Required to Redeem</label>
                    <input
                      type="number"
                      min={0}
                      value={loyaltyConfig.minPointsToRedeem}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, minPointsToRedeem: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-gray-400">Min point threshold for checkout.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Max Booking Discount % Cap</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={loyaltyConfig.maxDiscountPercent}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, maxDiscountPercent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-gray-400">Max % of booking cost redeemable with points.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">New User Welcome Bonus Points</label>
                    <input
                      type="number"
                      min={0}
                      value={loyaltyConfig.welcomeBonusPoints}
                      onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, welcomeBonusPoints: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-gray-400">Granted automatically on registration.</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-[#0b327b] text-white font-bold py-3 px-8 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                  >
                    Save Loyalty Rules
                  </button>
                </div>
              </form>

              {/* Card 2: Manual Loyalty Points Distribution */}
              <form onSubmit={handleGrantLoyaltyPoints} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-dark text-lg">Distribute Loyalty Points to Client</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Manually award bonus points or adjust points balance for any registered client.</p>
                  </div>
                </div>

                {grantSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Loyalty points updated successfully and logged in user transaction history!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Select Client</label>
                    <select
                      required
                      value={targetLoyaltyUserId}
                      onChange={(e) => setTargetLoyaltyUserId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                    >
                      <option value="" disabled>Choose a registered client</option>
                      {users.map((u) => (
                        <option key={u.uid} value={u.uid}>
                          {u.name} ({u.email || u.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Points Amount</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pointsAmountInput}
                      onChange={(e) => setPointsAmountInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Action Type</label>
                    <select
                      value={pointsTypeInput}
                      onChange={(e) => setPointsTypeInput(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                    >
                      <option value="admin_bonus">+ Grant Bonus Points</option>
                      <option value="admin_adjustment">- Deduct / Adjust Points</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 lg:col-span-4">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Transaction Description / Reason</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP Customer Appreciation Bonus"
                      value={pointsDescInput}
                      onChange={(e) => setPointsDescInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-extrabold py-3 px-8 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all border-none"
                  >
                    Distribute Points
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* COUPONS MANAGEMENT TAB */}
          {activeTab === "coupons" && (
            <div className="space-y-6">

              {/* Analytics / Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Database Coupons</span>
                  <div className="text-2xl font-black text-dark leading-none">{couponsList.length}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Active Global Offers</span>
                  <div className="text-2xl font-black text-emerald-500 leading-none">
                    {couponsList.filter(c => c.status === "active" && (!c.assignedUserId || c.assignedUserId === "all")).length}
                  </div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">User Assigned Promos</span>
                  <div className="text-2xl font-black text-purple-600 leading-none">
                    {couponsList.filter(c => c.assignedUserId && c.assignedUserId !== "all").length}
                  </div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">System Engine</span>
                  <div className="text-2xl font-black text-primary leading-none">Realtime DB</div>
                </div>
              </div>

              {/* Main Coupon Manager Panel */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
                      <Tag size={20} className="text-[#F4B400]" />
                      Coupons & Promo Codes Manager
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Create, edit, or delete database promo coupons. Assign offers to all users or target specific clients.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetCouponForm();
                      setShowAddCouponModal(true);
                    }}
                    className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-5 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Plus size={14} />
                    Create New Coupon
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-extrabold text-dark text-xs">Apply Promo / Coupon Code Section Visibility</h4>
                    <p className="text-[10px] text-gray-500 font-medium">When checked, users will see the coupon application block at booking checkout.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      id="showCouponSectionToggle"
                      checked={showCouponSection}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        setShowCouponSection(val);
                        await updateCouponSettings({ showCouponSection: val });
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="showCouponSectionToggle" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                      Visible to Users
                    </label>
                  </div>
                </div>

                {couponSavedAlert && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Coupon saved to database successfully!</span>
                  </div>
                )}

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Code</th>
                        <th className="pb-3 pr-4">Discount Type & Value</th>
                        <th className="pb-3 pr-4">Description</th>
                        <th className="pb-3 pr-4">Audience Segment</th>
                        <th className="pb-3 pr-4 text-center">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                            No coupons created yet in database. Click "Create New Coupon" above.
                          </td>
                        </tr>
                      ) : (
                        couponsList.map((c) => (
                          <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pr-4 font-mono font-black text-dark text-sm">
                              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl">
                                🎟️ {c.code}
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-bold text-dark">
                              {c.discountType === "percentage" ? (
                                <span className="text-primary">{c.discountValue}% OFF</span>
                              ) : (
                                <span className="text-emerald-600">Flat ₹{c.discountValue} OFF</span>
                              )}
                              {c.minSpend && (
                                <div className="text-[10px] text-gray-400 font-normal">Min Spend: ₹{c.minSpend}</div>
                              )}
                            </td>
                            <td className="py-4 pr-4 text-gray-700 font-medium max-w-xs">{c.description}</td>
                            <td className="py-4 pr-4 font-semibold text-gray-600">
                              {c.assignedUserId === "all" || !c.assignedUserId ? (
                                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  🌐 All Users (Global)
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  👤 {c.assignedUserEmail || `Target Client (${c.assignedUserId.slice(0, 8)})`}
                                </span>
                              )}
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border ${c.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-gray-100 text-gray-400 border-gray-200"
                                  }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCoupon(c);
                                  setCouponFormCode(c.code);
                                  setCouponFormType(c.discountType);
                                  setCouponFormValue(c.discountValue);
                                  setCouponFormDesc(c.description);
                                  setCouponFormMinSpend(c.minSpend ? String(c.minSpend) : "");
                                  setCouponFormTargetUser(c.assignedUserId || "all");
                                  setCouponFormStatus(c.status);
                                  setShowAddCouponModal(true);
                                }}
                                className="text-primary hover:underline font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCouponItem(c.id)}
                                className="text-rose-500 hover:underline font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VEHICLES MANAGEMENT TAB */}
          {activeTab === "vehicles" && (
            <AdminVehicleManager />
          )}

        </div>

      </div>

      {showAddStaffModal && createPortal(
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">
                {editingStaff ? "Edit Crew Details" : "Add New Crew Member"}
              </h3>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setEditingStaff(null);
                  setStaffName("");
                  setStaffEmail("");
                  setStaffPhone("");
                  setStaffAddress("");
                  setStaffPhoto("");
                  setStaffDept("Detailing Crew");
                  setStaffSalary("₹18,000/month");
                  setStaffBank("");
                  setStaffKYC("Verified");
                  setStaffAvail("online");
                }}
                className="text-gray-400 hover:text-dark text-sm font-bold uppercase transition-colors font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingStaff}
                    placeholder="name@example.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Home/Base Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, City, Pin code"
                  value={staffAddress}
                  onChange={(e) => setStaffAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Picture URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={staffPhoto}
                  onChange={(e) => setStaffPhoto(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Detailing Crew"
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Monthly Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹18,000/month"
                    value={staffSalary}
                    onChange={(e) => setStaffSalary(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bank Details</label>
                <input
                  type="text"
                  placeholder="Bank name, A/C No., IFSC Code (optional)"
                  value={staffBank}
                  onChange={(e) => setStaffBank(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">KYC Verification Status</label>
                  <select
                    value={staffKYC}
                    onChange={(e: any) => setStaffKYC(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Availability Status</label>
                  <select
                    value={staffAvail}
                    onChange={(e: any) => setStaffAvail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark cursor-pointer"
                  >
                    <option value="online">Online / Active</option>
                    <option value="offline">Offline / Rest</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
              >
                {editingStaff ? "Update Crew Profile" : "Create Crew Profile"}
              </button>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {selectedBookingForAssign && createPortal(
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">Assign Detailing Crew</h3>
              <button
                onClick={() => {
                  setSelectedBookingForAssign(null);
                  setAssignCrewId("");
                  setAssignArrivalDate("");
                  setAssignArrivalTime("");
                }}
                className="text-gray-400 hover:text-dark text-sm font-bold uppercase transition-colors font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAssignCrew} className="space-y-4 text-left">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-1">
                <div className="font-bold text-dark">Booking ID: <span className="font-mono text-gray-500 font-normal">{selectedBookingForAssign.id}</span></div>
                <div className="font-bold text-dark">Customer: <span className="font-normal text-gray-600">{selectedBookingForAssign.name}</span></div>
                <div className="font-bold text-dark">Service: <span className="font-normal text-gray-600">{selectedBookingForAssign.service}</span></div>
                <div className="font-bold text-dark">Scheduled: <span className="font-normal text-gray-600">{selectedBookingForAssign.date} at {selectedBookingForAssign.time}</span></div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Detailing Crew Member</label>
                <select
                  required
                  value={assignCrewId}
                  onChange={(e) => setAssignCrewId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark cursor-pointer"
                >
                  <option value="" disabled>Choose a crew member</option>
                  {employees.filter((emp) => emp.isLinkedToAuth !== false).length > 0 && (
                    <optgroup label="── Active Crew (Linked Accounts)">
                      {employees
                        .filter((emp) => emp.isLinkedToAuth !== false)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department} — {emp.availability === "online" ? "Active" : "Offline"})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  {employees.filter((emp) => emp.isLinkedToAuth === false).length > 0 && (
                    <optgroup label="── ⚠️ No Login Account (Cannot receive notifications)">
                      {employees
                        .filter((emp) => emp.isLinkedToAuth === false)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id} disabled>
                            ⚠️ {emp.name} — No Auth Account
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
                {employees.filter((emp) => emp.isLinkedToAuth !== false).length === 0 && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">
                    ⚠️ No crew with login accounts found. Go to <strong>Users</strong> tab → promote a user to <strong>Staff</strong> role first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Arriving Date</label>
                  <input
                    type="date"
                    required
                    value={assignArrivalDate}
                    onChange={(e) => setAssignArrivalDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Arriving Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={assignArrivalTime}
                    onChange={(e) => setAssignArrivalTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
              >
                Assign & Schedule Arrival
              </button>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {viewingBookingDetails && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">Booking Detail Sheet</h3>
              <button
                onClick={() => setViewingBookingDetails(null)}
                className="text-gray-400 hover:text-dark text-sm font-bold uppercase transition-colors font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 text-left">
              {/* Header Status & Price */}
              <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Booking ID</div>
                  <div className="font-mono font-bold text-dark text-xs">{viewingBookingDetails.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Status</div>
                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${viewingBookingDetails.status === "Completed"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : viewingBookingDetails.status === "Pending"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : viewingBookingDetails.status === "Cancelled"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                    {viewingBookingDetails.status}
                  </span>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">1. Service & Vehicle</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Package Selected</span>
                    <span className="font-extrabold text-dark text-sm">{viewingBookingDetails.service}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Price / Fee</span>
                    <span className="font-black text-dark text-sm">{viewingBookingDetails.price}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block">Vehicle Specification</span>
                    <span className="font-mono text-gray-700 font-bold">{viewingBookingDetails.vehicle}</span>
                  </div>
                </div>
              </div>

              {/* Scheduled Date/Time */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">2. Scheduled Date & Time</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Scheduled Date</span>
                    <span className="font-semibold text-gray-700">{viewingBookingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Time Slot</span>
                    <span className="font-semibold text-gray-700">{viewingBookingDetails.time}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">3. Customer Profile & Address</h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block">Full Name</span>
                      <span className="font-extrabold text-dark">{viewingBookingDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Contact Number</span>
                      <span className="font-bold text-gray-700">{viewingBookingDetails.phone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Service Doorstep Address</span>
                    <span className="font-semibold text-dark leading-relaxed block bg-amber-50/50 border border-amber-100/50 p-2.5 rounded-xl mt-1">
                      {viewingBookingDetails.address || "No address details specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailing Crew Assignment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">4. Dispatch & Crew Assignment</h4>
                {(viewingBookingDetails.assignedEmployeeName || viewingBookingDetails.assignedEmployee || viewingBookingDetails.crewArrivingDate) ? (
                  <div className="bg-[#0f3b94]/5 border border-[#0f3b94]/10 rounded-2xl p-4 text-xs space-y-3 text-[#0f3b94]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="opacity-80 block font-semibold">Assigned Detailer</span>
                        <span className="font-black text-sm">{viewingBookingDetails.assignedEmployeeName || "Assigned Crew"}</span>
                      </div>
                      <div>
                        <span className="opacity-80 block font-semibold">Crew ID / Contact</span>
                        <span className="font-mono font-bold">{viewingBookingDetails.assignedEmployeePhone || viewingBookingDetails.assignedEmployee}</span>
                      </div>
                      {viewingBookingDetails.acceptedAt && (
                        <div>
                          <span className="opacity-80 block font-semibold">Booking Accept Time</span>
                          <span className="font-extrabold">{new Date(viewingBookingDetails.acceptedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {viewingBookingDetails.completedAt && (
                        <div>
                          <span className="opacity-80 block font-semibold text-emerald-700">Booking Complete Time</span>
                          <span className="font-extrabold text-emerald-700">{new Date(viewingBookingDetails.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {viewingBookingDetails.crewArrivingDate && (
                        <div className="col-span-2 pt-2 border-t border-[#0f3b94]/10 flex justify-between">
                          <div>
                            <span className="opacity-80 block font-semibold">Expected Arrival Date</span>
                            <span className="font-extrabold">{viewingBookingDetails.crewArrivingDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="opacity-80 block font-semibold">Arrival Time Slot</span>
                            <span className="font-extrabold">{viewingBookingDetails.crewArrivingTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Crew Assignment: Pending
                  </div>
                )}
              </div>

              {/* 5. Google Maps Location Info */}
              {(viewingBookingDetails.customerLatitude || viewingBookingDetails.crewLatitude) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1 flex justify-between items-center">
                    <span>5. Google Maps GPS Coordinates</span>
                    {viewingBookingDetails.crewLatitude && (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-extrabold">
                        Live Crew GPS Active
                      </span>
                    )}
                  </h4>
                  <GoogleMapEmbed
                    latitude={viewingBookingDetails.crewLatitude || viewingBookingDetails.customerLatitude || 26.4499}
                    longitude={viewingBookingDetails.crewLongitude || viewingBookingDetails.customerLongitude || 80.3319}
                    title="Admin Booking Map"
                    className="h-44 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                  />
                </div>
              )}
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

      {isAddingService && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-lg">
                {editingService ? "Edit Service Package" : "Add New Detailing Service"}
              </h3>
              <button
                onClick={closeServiceModal}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateService} className="space-y-4 text-left">
              {/* Service ID (custom key) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Service ID (e.g. ceramic-coating)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingService}
                  placeholder="e.g. ceramic-coating"
                  value={serviceFormId}
                  onChange={(e) => setServiceFormId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark disabled:opacity-60"
                />
              </div>

              {/* Service Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Service Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceramic Paint Protection"
                  value={serviceFormName}
                  onChange={(e) => setServiceFormName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              {/* Service Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Rate (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 2999"
                  value={serviceFormPrice || ""}
                  onChange={(e) => setServiceFormPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              {/* Showcase Image Upload */}
              <CloudinaryUploader
                label="Showcase Image"
                value={serviceFormImage}
                onChange={setServiceFormImage}
              />

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catalog Card Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write a brief description of what this service includes..."
                  value={serviceFormDesc}
                  onChange={(e) => setServiceFormDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
              >
                {editingService ? "Update Catalog Item" : "Publish Detailing Service"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* PRICING PACKAGE EDIT / CREATE MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">
                {editingPlan ? "Edit Pricing Package" : "Create New Pricing Package"}
              </h3>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setEditingPlan(null);
                  resetPlanForm();
                }}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Package, Gold Protection"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹999 or 999"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subscription Discount %</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={planDiscount}
                    onChange={(e) => setPlanDiscount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Short summary of what this package offers..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Icon Badge</label>
                  <select
                    value={planIcon}
                    onChange={(e) => setPlanIcon(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark cursor-pointer"
                  >
                    <option value="zap">Zap (⚡ Quick)</option>
                    <option value="star">Star (⭐ Popular)</option>
                    <option value="shield">Shield (🛡️ Premium)</option>
                    <option value="trophy">Trophy (🏆 Ultimate)</option>
                    <option value="sparkles">Sparkles (✨ Gloss)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={planCta}
                    onChange={(e) => setPlanCta(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Package Features (One per line)</label>
                <textarea
                  required
                  rows={5}
                  placeholder={`Eco exterior treatment\nWheel cleaning & shine\nDoor frame wipe down`}
                  value={planFeaturesText}
                  onChange={(e) => setPlanFeaturesText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark resize-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="planPopular"
                  checked={planPopular}
                  onChange={(e) => setPlanPopular(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="planPopular" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                  Highlight as "Most Popular" package
                </label>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                    resetPlanForm();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#0b327b] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all"
                >
                  {editingPlan ? "Save Package Changes" : "Create Package"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Before & After Modal with Cloudinary Uploader */}
      {showBaModal && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6 text-left"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-xl">
                {editingBaItem ? "Edit Before & After Showcase Card" : "Add Before & After Showcase Card"}
              </h3>
              <button
                onClick={() => setShowBaModal(false)}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveBeforeAfterItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Showcase Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exterior Care & Gloss Protection"
                  value={baFormTitle}
                  onChange={(e) => setBaFormTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Service Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exterior Care, Interior Care"
                  value={baFormCategory}
                  onChange={(e) => setBaFormCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe the detailing transformation..."
                  value={baFormDesc}
                  onChange={(e) => setBaFormDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-semibold text-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              {/* Image Uploaders */}
              <CloudinaryUploader
                label="Before Detailing Image"
                value={baFormBeforeImage}
                onChange={setBaFormBeforeImage}
              />

              <CloudinaryUploader
                label="After Detailing Image"
                value={baFormAfterImage}
                onChange={setBaFormAfterImage}
              />

              <button
                type="submit"
                disabled={isSavingBa}
                className="w-full bg-primary hover:bg-[#0b327b] disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isSavingBa ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Saving Showcase Card...</span>
                  </>
                ) : (
                  <span>{editingBaItem ? "Update Showcase Card" : "Save Showcase Card"}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ISSUE COUPON CODE MODAL */}
      {selectedUserForCoupon && createPortal(
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading font-extrabold text-dark text-base">Issue Coupon Code</h3>
                <p className="text-xs text-gray-400">Assign promo discount to <strong>{selectedUserForCoupon.name}</strong> ({selectedUserForCoupon.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForCoupon(null)}
                className="p-1 text-gray-400 hover:text-dark rounded-xl cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            {assignCouponMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Coupon assigned to client successfully!</span>
              </div>
            )}

            <form onSubmit={handleGrantCouponToClient} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Coupon Code to Assign</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLEAN15 or FESTIVE25"
                  value={assignCouponInput}
                  onChange={(e) => setAssignCouponInput(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCoupon(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0b327b] text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
                >
                  Issue Coupon
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {showAddCouponModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-dark text-base">
                {editingCoupon ? "Edit Database Coupon" : "Create New Database Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddCouponModal(false);
                  resetCouponForm();
                }}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Coupon Code */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Coupon Code (e.g. CLEAN15)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUPER2026"
                    value={couponFormCode}
                    onChange={(e) => setCouponFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Type</label>
                  <select
                    value={couponFormType}
                    onChange={(e) => setCouponFormType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (% OFF)</option>
                    <option value="flat">Flat Cash Discount (₹ OFF)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Discount Value ({couponFormType === "percentage" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponFormValue}
                    onChange={(e) => setCouponFormValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description / Offer Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15% OFF on doorstep car detailing"
                    value={couponFormDesc}
                    onChange={(e) => setCouponFormDesc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Target Client Segment</label>
                  <select
                    value={couponFormTargetUser}
                    onChange={(e) => setCouponFormTargetUser(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="all">All Users (Global Promotional Code)</option>
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        Single Client: {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Spend */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Minimum Spend Amount (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={couponFormMinSpend}
                    onChange={(e) => setCouponFormMinSpend(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Coupon Status</label>
                  <select
                    value={couponFormStatus}
                    onChange={(e) => setCouponFormStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="active">Active (Available for booking)</option>
                    <option value="inactive">Inactive (Disabled)</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCouponModal(false);
                    resetCouponForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0b327b] text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

    </div>
  );
}


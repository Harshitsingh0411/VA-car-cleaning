import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { GoogleMapEmbed } from "../components/location/LocationPickerMap";

import {
  getAuditLogs,
  getAllBookings,
  updateBookingStatus,
  getJobApplications,
  updateJobStatus as updateJobStatusInDb,
  getAllReviews,
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
  dbBeforeAfterItem
} from "../services/dbService";
import NotificationCenterTab from "../components/admin/NotificationCenterTab";
import CloudinaryUploader from "../components/common/CloudinaryUploader";
import { getCartoonAvatar, handleAvatarError } from "../utils/avatar";
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
  Phone
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
  crewArrivingDate?: string;
  crewArrivingTime?: string;
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
  images?: string[];
  videos?: string[];
  serviceName?: string;
  adminReply?: string;
}

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "appointments" | "users" | "jobs" | "services" | "pricing" | "reviews" | "logs" | "notifications" | "staff" | "loyalty">("stats");

  // Loyalty Management State
  const [loyaltyConfig, setLoyaltyConfig] = useState<dbLoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [loyaltySavedAlert, setLoyaltySavedAlert] = useState(false);
  const [targetLoyaltyUserId, setTargetLoyaltyUserId] = useState("");
  const [pointsAmountInput, setPointsAmountInput] = useState(100);
  const [pointsTypeInput, setPointsTypeInput] = useState<"admin_bonus" | "admin_adjustment">("admin_bonus");
  const [pointsDescInput, setPointsDescInput] = useState("Loyalty Bonus Grant");
  const [grantSuccessMsg, setGrantSuccessMsg] = useState(false);

  // Load state variables
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJobApp[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
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

  // Single unified management sub-tab for Services, Pricing, Before & After, About & Contact
  const [serviceSubTab, setServiceSubTab] = useState<"catalog" | "pricing" | "before_after" | "about" | "contact">("catalog");

  // Before & After Gallery State
  const [beforeAfterItems, setBeforeAfterItems] = useState<dbBeforeAfterItem[]>([]);
  const [showBaModal, setShowBaModal] = useState(false);
  const [editingBaItem, setEditingBaItem] = useState<dbBeforeAfterItem | null>(null);

  const [baFormId, setBaFormId] = useState("");
  const [baFormTitle, setBaFormTitle] = useState("");
  const [baFormCategory, setBaFormCategory] = useState("Exterior Wash");
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
    setBaFormCategory("Exterior Wash");
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
    setBaFormCategory(item.category || "Exterior Wash");
    setBaFormBeforeImage(item.beforeImage);
    setBaFormAfterImage(item.afterImage);
    setBaFormDesc(item.description || "");
    setShowBaModal(true);
  };

  const handleSaveBeforeAfterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baFormTitle || !baFormBeforeImage || !baFormAfterImage) {
      alert("Please fill in Title, Before Image, and After Image.");
      return;
    }

    const item: dbBeforeAfterItem = {
      id: baFormId || `ba-${Date.now()}`,
      title: baFormTitle,
      category: baFormCategory,
      beforeImage: baFormBeforeImage,
      afterImage: baFormAfterImage,
      description: baFormDesc,
      displayOrder: editingBaItem ? editingBaItem.displayOrder : beforeAfterItems.length + 1
    };

    await createOrUpdateBeforeAfterItem(item);
    setShowBaModal(false);
    fetchBeforeAfterGallery();
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
      if (isFirebaseConfigured) {
        try {
          const querySnapshot = await db.collection("users").get();
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
            photo: userData?.photoURL || profileData?.photoURL || getCartoonAvatar(userData?.email || simUserEmail || "detailer"),
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
        crewArrivingDate: b.crewArrivingDate || "",
        crewArrivingTime: b.crewArrivingTime || ""
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
        name: r.customerName || "Customer",
        email: `Customer: ${r.customerId}`,
        rating: r.stars,
        message: r.review,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        images: r.images,
        videos: r.videos,
        serviceName: r.serviceName,
        adminReply: r.adminReply
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("Error fetching reviews:", err);
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
    if (activeTab === "pricing") {
      fetchPricingPlans();
    }
    if (activeTab === "loyalty") {
      fetchLoyaltyConfig();
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

  const fetchServicesList = async () => {
    try {
      const data = await getAllServices();
      setServicesList(data);
    } catch (err) {
      console.error("Failed to load services list:", err);
    }
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

      alert("Service saved successfully!");
      setIsAddingService(false);
      setEditingService(null);

      // Reset form states
      setServiceFormId("");
      setServiceFormName("");
      setServiceFormPrice(0);
      setServiceFormImage("");
      setServiceFormDesc("");

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

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceFormId("");
    setServiceFormName("");
    setServiceFormPrice(0);
    setServiceFormImage("");
    setServiceFormDesc("");
    setIsAddingService(true);
  };

  const openEditServiceModal = (s: dbService) => {
    setEditingService(s);
    setServiceFormId(s.id);
    setServiceFormName(s.name);
    setServiceFormPrice(s.price);
    setServiceFormImage(s.image);
    setServiceFormDesc(s.description);
    setIsAddingService(true);
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
    <div className="pt-24 min-h-screen bg-[#070C16] pb-24 relative overflow-hidden flex">
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row gap-8">

        {/* LEFT Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <span className={`${profile?.role === "staff" ? "bg-[#34A853] text-white" : "bg-[#F4B400] text-dark"
              } text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded`}>
              {profile?.role === "staff" ? "Crew" : "Super Admin"}
            </span>
            <h2 className="text-xl font-heading font-extrabold text-dark tracking-tight">
              {profile?.role === "staff" ? "Crew Control Panel" : "VA Control Panel"}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {profile?.role === "staff" ? "Crew System View" : "Live System Manager"}
            </p>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "stats" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <TrendingUp size={16} />
              System Overview
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "appointments" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Calendar size={16} />
              Bookings & Slots ({pendingAppts})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "users" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Users size={16} />
              Client Directory
            </button>
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("team_accounts")}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "team_accounts" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <UserCheck size={16} />
                Team Accounts
              </button>
            )}
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("staff")}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "staff" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <UserCheck size={16} />
                Crew Directory
              </button>
            )}
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "jobs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Briefcase size={16} />
              Job Applications ({pendingJobs})
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "services" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Layers size={16} />
              Services, Pricing & Content
            </button>
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("loyalty")}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "loyalty" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                  }`}
              >
                <Gift size={16} />
                Loyalty & Rewards
              </button>
            )}
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "reviews" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
            >
              <Star size={16} />
              Customer Reviews
            </button>
            {profile?.role !== "staff" && (
              <>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "notifications" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                    }`}
                >
                  <Bell size={16} />
                  Notification Center
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${activeTab === "logs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
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
                          <button
                            onClick={() => setViewingBookingDetails(a)}
                            className="text-left cursor-pointer hover:text-primary transition-colors group block"
                          >
                            <div className="font-bold text-dark group-hover:text-primary">{a.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{a.phone}</div>
                            <div className="text-[10px] text-primary font-bold mt-1 group-hover:underline">
                              View details →
                            </div>
                          </button>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-gray-700">{a.service}</td>
                        <td className="py-4 pr-4 font-mono text-gray-500">{a.vehicle}</td>
                        <td className="py-4 pr-4 space-y-1.5">
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Scheduled</div>
                            <div className="font-semibold text-gray-700">{a.date}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{a.time}</div>
                          </div>
                          {a.crewArrivingDate ? (
                            <div className="pt-1.5 border-t border-gray-100">
                              <div className="text-[10px] text-[#0f3b94] font-black uppercase tracking-wider">Crew Arriving</div>
                              <div className="font-bold text-dark text-[11px]">{a.crewArrivingDate}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{a.crewArrivingTime}</div>
                              <div className="text-[10px] text-[#0f3b94] font-semibold mt-0.5">({a.assignedEmployeeName})</div>
                            </div>
                          ) : (
                            <div className="pt-1.5 border-t border-gray-100 text-gray-400 text-[10px] font-semibold">
                              Crew: Unassigned
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-right font-black text-dark">{a.price}</td>
                        <td className="py-4 pr-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${a.status === "Completed"
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
                        <td className="py-4 text-right space-y-1.5 shrink-0">
                          {a.status !== "Completed" && a.status !== "Cancelled" && (
                            <button
                              onClick={() => {
                                setSelectedBookingForAssign(a);
                                setAssignCrewId(a.assignedEmployee || "");
                                setAssignArrivalDate(a.crewArrivingDate || a.date);
                                setAssignArrivalTime(a.crewArrivingTime || "");
                              }}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer block w-full text-center"
                            >
                              {a.assignedEmployee ? "Reassign Crew" : "Assign Crew"}
                            </button>
                          )}

                          {a.status === "Pending" && (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "In Progress")}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Dispatch
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(a.id, "Cancelled")}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {a.status === "Assigned" && (
                            <button
                              onClick={() => updateAppointmentStatus(a.id, "In Progress")}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer block w-full text-center animate-pulse"
                            >
                              Dispatch Crew
                            </button>
                          )}

                          {a.status === "In Progress" && (
                            <button
                              onClick={() => updateAppointmentStatus(a.id, "Completed")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-1 px-2.5 rounded-lg font-bold text-[10px] cursor-pointer block w-full text-center"
                            >
                              Complete Detox
                            </button>
                          )}

                          {(a.status === "Completed" || a.status === "Cancelled") && (
                            <span className="text-[10px] text-gray-300 font-bold uppercase block text-center">Locked</span>
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
                    {users.filter(u => u.role !== "admin" && u.role !== "staff" && u.role !== "super_admin").map((u) => (
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
                      <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border uppercase tracking-wider ${j.status === "Approved"
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
                    onClick={() => setServiceSubTab("pricing")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${serviceSubTab === "pricing"
                        ? "bg-primary text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <DollarSign size={14} />
                    Pricing Packages ({pricingPlans.length})
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
                        onClick={() => setIsAddingService(true)}
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

                          {profile?.role !== "staff" && (
                            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                              <button
                                onClick={() => openEditServiceModal(s)}
                                className="bg-gray-100 hover:bg-gray-200 text-dark font-bold py-1.5 px-4 rounded-xl text-xs cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteService(s.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-1.5 px-4 rounded-xl text-xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PRICING PACKAGES */}
              {serviceSubTab === "pricing" && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-heading font-extrabold text-dark text-xl flex items-center gap-2">
                        <DollarSign size={22} className="text-primary" />
                        Pricing & Subscription Packages
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Manage all pricing tiers, packages, features, and subscription discounts shown on the /pricing page.
                      </p>
                    </div>
                  </div>

                  {pricingLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {pricingPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-6 bg-white border rounded-3xl shadow-sm relative flex flex-col justify-between space-y-4 ${plan.popular ? "border-primary ring-2 ring-primary/10" : "border-gray-100"
                            }`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-3 right-6 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                              Most Popular
                            </span>
                          )}

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-heading font-extrabold text-dark text-lg">{plan.name}</h4>
                              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="text-3xl font-black text-dark font-heading">{plan.price}</span>
                              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 py-0.5 px-2 rounded-full border border-emerald-100">
                                Subscription: {plan.subscriptionDiscountPercent ?? 15}% OFF
                              </span>
                            </div>

                            <div className="pt-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Package Features ({plan.features.length})</span>
                              <ul className="space-y-1 text-xs text-gray-600">
                                {plan.features.slice(0, 4).map((feat, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span className="truncate">{feat}</span>
                                  </li>
                                ))}
                                {plan.features.length > 4 && (
                                  <li className="text-[10px] text-gray-400 font-bold font-mono">
                                    +{plan.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {profile?.role !== "staff" && (
                            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                              <button
                                onClick={() => openEditPlanModal(plan)}
                                className="bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                              >
                                Edit Package
                              </button>
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                                <img src={ba.beforeImage} alt="Before" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">After VA Detailing</span>
                              <div className="h-32 rounded-2xl overflow-hidden border border-emerald-300 bg-gray-900">
                                <img src={ba.afterImage} alt="After" className="w-full h-full object-cover" />
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Story Showcase Image URL</label>
                      <input
                        type="url"
                        required
                        value={aboutInputs.storyImageUrl}
                        onChange={(e) => setAboutInputs({ ...aboutInputs, storyImageUrl: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-dark focus:outline-none focus:ring-2 focus:ring-primary"
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
              <h3 className="font-heading font-extrabold text-dark text-lg">Customer Reviews & Cloudinary Media Feedback</h3>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-dark text-sm">{r.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono block">{r.email}</span>
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
                            <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="relative group">
                              <img src={imgUrl} alt="Customer review photo" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition-transform" />
                            </a>
                          ))}
                          {r.videos?.map((vidUrl, i) => (
                            <video key={i} src={vidUrl} controls className="w-24 h-16 rounded-xl object-cover border border-gray-200 shadow-sm bg-black" />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="text-[9px] text-gray-400 font-bold pt-1 flex justify-between items-center">
                      <span>Submitted: {r.date}</span>
                      {r.adminReply && (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">✓ Admin Replied</span>
                      )}
                    </div>
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

        </div>

      </div>

      {showAddStaffModal && (
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
        </div>
      )}

      {selectedBookingForAssign && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6"
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
                className="text-gray-400 hover:text-dark text-sm font-bold uppercase transition-colors font-semibold"
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
        </div>
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
                {viewingBookingDetails.crewArrivingDate ? (
                  <div className="bg-[#0f3b94]/5 border border-[#0f3b94]/10 rounded-2xl p-4 text-xs space-y-2 text-[#0f3b94]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="opacity-80 block font-semibold">Assigned Detailer</span>
                        <span className="font-black text-sm">{viewingBookingDetails.assignedEmployeeName}</span>
                      </div>
                      <div>
                        <span className="opacity-80 block font-semibold">Crew ID</span>
                        <span className="font-mono font-bold">{viewingBookingDetails.assignedEmployee}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-[#0f3b94]/10 flex justify-between">
                        <div>
                          <span className="opacity-80 block font-semibold">Expected Arrival Date</span>
                          <span className="font-extrabold">{viewingBookingDetails.crewArrivingDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="opacity-80 block font-semibold">Arrival Time Slot</span>
                          <span className="font-extrabold">{viewingBookingDetails.crewArrivingTime}</span>
                        </div>
                      </div>
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
                onClick={() => setIsAddingService(false)}
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

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Showcase Image URL</label>
                <input
                  type="url"
                  placeholder="Paste Unsplash or host image URL"
                  value={serviceFormImage}
                  onChange={(e) => setServiceFormImage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-dark"
                />
              </div>

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
                  placeholder={`Eco foam exterior wash\nWheel cleaning & shine\nDoor frame wipe down`}
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
                  placeholder="e.g. Exterior Foam Wash & Gloss Polish"
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
                  placeholder="e.g. Exterior Wash, Interior Cleaning"
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

              {/* Cloudinary Image Uploaders */}
              <CloudinaryUploader
                label="Before Detailing Image (Cloudinary / File)"
                value={baFormBeforeImage}
                onChange={setBaFormBeforeImage}
                placeholder="https://res.cloudinary.com/..."
              />

              <CloudinaryUploader
                label="After Detailing Image (Cloudinary / File)"
                value={baFormAfterImage}
                onChange={setBaFormAfterImage}
                placeholder="https://res.cloudinary.com/..."
              />

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all mt-4"
              >
                {editingBaItem ? "Update Showcase Card" : "Save Showcase Card"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { 
  getAuditLogs, 
  getAllBookings, 
  updateBookingStatus, 
  getJobApplications, 
  updateJobStatus as updateJobStatusInDb, 
  getAllReviews, 
  getBeforeAfterSettings, 
  updateBeforeAfterSettings,
  createOrUpdateEmployee,
  deleteEmployeeProfile,
  getAllEmployees,
  updateEmployeeProfile,
  getAllServices,
  createOrUpdateService,
  deleteServiceProfile,
  dbService
} from "../services/dbService";
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
  Bell,
  Plus,
  UserCheck
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
}

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "appointments" | "users" | "jobs" | "services" | "reviews" | "logs" | "notifications" | "staff">("stats");

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

  // Service form bindings
  const [servicePriceInputs, setServicePriceInputs] = useState<Record<string, number>>({});
  const [serviceImageInputs, setServiceImageInputs] = useState<Record<string, string>>({});
  const [serviceDescInputs, setServiceDescInputs] = useState<Record<string, string>>({});
  const [showConfigAlert, setShowConfigAlert] = useState(false);

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
        address: b.notes || "",
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

  const fetchAdminEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
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
          photo: staffPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          phone: staffPhone,
          address: staffAddress,
          department: staffDept,
          salary: staffSalary,
          bankDetails: staffBank,
          KYCStatus: staffKYC,
          availability: staffAvail
        });
        
        if (!editingStaff.id.startsWith("emp-")) {
          await setDoc(doc(db, "users", editingStaff.id), {
            name: staffName,
            contactNumber: staffPhone,
            photoURL: staffPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
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
    } catch (err: any) {
      console.error("Error deleting staff:", err);
      alert("Failed to remove staff member: " + err.message);
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
    if (activeTab === "staff") {
      fetchAdminEmployees();
    }
    if (activeTab === "services") {
      fetchServicesList();
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

    // 5. Staff Directory Setup
    fetchAdminEmployees();

    // 6. Custom Services Setup
    fetchServicesList();

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
            {profile?.role !== "staff" && (
              <button
                onClick={() => setActiveTab("staff")}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                  activeTab === "staff" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
                }`}
              >
                <UserCheck size={16} />
                Staff Directory
              </button>
            )}
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
            <div className="space-y-6">
              {/* Dynamic Services Management Block */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <h3 className="font-heading font-extrabold text-dark text-lg">Services Pricing & Catalog</h3>
                    <p className="text-gray-400 text-xs mt-1">Add, update, or remove doorstep detailing services and package rates.</p>
                  </div>
                  {profile?.role !== "staff" && (
                    <button
                      onClick={openAddServiceModal}
                      className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      Add Service
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {servicesList.map((s) => (
                    <div key={s.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative bg-white">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-dark text-sm">{s.name}</h4>
                            {s.isCustom && (
                              <span className="text-[9px] font-bold text-primary bg-primary/10 py-0.5 px-2 rounded-full uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">{s.description}</p>
                          <span className="font-black text-dark text-xs block pt-1">₹{s.price}</span>
                        </div>
                      </div>

                      {profile?.role !== "staff" && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                          <button
                            onClick={() => openEditServiceModal(s)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-1.5 px-4 rounded-xl text-xs cursor-pointer"
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

              {/* BEFORE & AFTER PHOTO COMPARISON OVERRIDES */}
              <form onSubmit={saveServiceConfig} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-extrabold text-dark text-lg">Before & After Slider Config</h3>
                  {profile?.role !== "staff" && (
                    <button
                      type="submit"
                      className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer"
                    >
                      Save Slider Config
                    </button>
                  )}
                </div>

                {showConfigAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>Config Saved! Homepage comparison slider was updated.</span>
                  </motion.div>
                )}

                <div className="p-5 border border-gray-100 rounded-2xl space-y-4 bg-[#F8FAFC]/50 text-left">
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
            </div>
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

          {/* STAFF PANEL */}
          {activeTab === "staff" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-dark text-lg">Staff Crew Directory</h3>
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
                  Add Staff Member
                </button>
              </div>

              {employeesLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : employees.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                  <UserCheck size={36} className="mx-auto text-gray-300" />
                  <p className="font-semibold text-sm">No Staff Registered</p>
                  <p className="text-xs">Click the button above to register your first crew member.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Staff Details</th>
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
                                  src={emp.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                                  alt={emp.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-dark text-sm">{emp.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.id}</div>
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
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full ${
                                emp.KYCStatus === "Verified"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : emp.KYCStatus === "Rejected"
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}>
                                KYC: {emp.KYCStatus || "Pending"}
                              </span>
                            </div>
                            <div>
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full ${
                                emp.availability === "online"
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
                {editingStaff ? "Edit Staff Details" : "Add New Staff Crew"}
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
                {editingStaff ? "Update Staff Profile" : "Create Staff Profile"}
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
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department} - {emp.availability === "online" ? "Active" : "Offline"})
                    </option>
                  ))}
                </select>
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
                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${
                    viewingBookingDetails.status === "Completed"
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
    </div>
  );
}

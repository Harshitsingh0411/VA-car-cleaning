import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
  Check,
  X,
  RefreshCw,
  User,
  ExternalLink
} from "lucide-react";
import {
  getAvailableBookings,
  getBookingsByEmployee,
  crewAcceptBooking,
  crewRejectBooking,
  updateBookingStatus,
  dbBooking
} from "../../services/dbService";

export default function EmployeeDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"available" | "my_jobs">("available");
  
  const [availableBookings, setAvailableBookings] = useState<dbBooking[]>([]);
  const [myJobs, setMyJobs] = useState<dbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<dbBooking | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const available = await getAvailableBookings(user.uid);
      setAvailableBookings(available);
    } catch (err) {
      console.warn("Could not fetch available bookings:", err);
    }

    try {
      const assigned = await getBookingsByEmployee(user.uid);
      setMyJobs(assigned.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.warn("Could not fetch assigned bookings:", err);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadDashboardData();

    // Polling fallback
    const interval = setInterval(loadDashboardData, 4000);

    // Real-time event listeners
    const handleUpdate = () => loadDashboardData();
    window.addEventListener("sim_booking_created", handleUpdate);
    window.addEventListener("booking_accepted_by_crew", handleUpdate);
    window.addEventListener("crew_booking_assigned", handleUpdate);
    window.addEventListener("sim_notification_created", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sim_booking_created", handleUpdate);
      window.removeEventListener("booking_accepted_by_crew", handleUpdate);
      window.removeEventListener("crew_booking_assigned", handleUpdate);
      window.removeEventListener("sim_notification_created", handleUpdate);
    };
  }, [loadDashboardData]);

  const handleAccept = async (bookingId: string) => {
    if (!user) return;
    setActionLoadingId(bookingId);
    try {
      const crewName = profile?.name || user.displayName || "Crew Detailer";
      await crewAcceptBooking(bookingId, user.uid, crewName);
      alert("✅ Booking accepted! It is now assigned to you and removed from other crews.");
      await loadDashboardData();
      setActiveTab("my_jobs");
    } catch (err: any) {
      alert(err.message || "Failed to accept booking.");
      loadDashboardData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!user) return;
    if (!window.confirm("Pass on this booking request? It will be hidden from your feed but remains open for other crews.")) return;
    setActionLoadingId(bookingId);
    try {
      await crewRejectBooking(bookingId, user.uid);
      await loadDashboardData();
    } catch (err: any) {
      alert("Failed to pass booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: dbBooking["bookingStatus"]) => {
    setActionLoadingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadDashboardData();
    } catch (err: any) {
      alert("Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const generateWhatsAppUrl = (phone: string, customerName: string, serviceName: string, vehicle: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const crewName = profile?.name || user?.displayName || "Detailing Crew";
    const text = `Hello ${customerName}, this is ${crewName} from VA Car Detailing. I am assigned to your doorstep service for ${vehicle} (${serviceName}). I will be arriving shortly. Please confirm your address!`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  const activeMyJobs = myJobs.filter((j) => j.bookingStatus !== "Completed" && j.bookingStatus !== "Cancelled");
  const completedMyJobs = myJobs.filter((j) => j.bookingStatus === "Completed");

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-dark via-[#0b2861] to-primary rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">
              <ShieldCheck size={14} />
              Verified Detailing Crew Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight">
              Welcome back, {profile?.name || user?.displayName || "Crew Member"}
            </h1>
            <p className="text-xs text-gray-300">
              Claim available customer bookings in real-time. Accepted jobs belong exclusively to you.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button
              onClick={loadDashboardData}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-accent" : ""} />
            </button>
            <Link
              to="/account"
              className="bg-white text-dark hover:bg-gray-100 font-bold text-xs py-2 px-4 rounded-xl transition-all"
            >
              My Account Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Open Job Requests</span>
              <Zap size={18} className="text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-dark">{availableBookings.length}</div>
            <p className="text-[10px] text-amber-600 font-semibold">Available for all crew to claim</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">My Active Jobs</span>
              <Calendar size={18} className="text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-dark">{activeMyJobs.length}</div>
            <p className="text-[10px] text-emerald-600 font-semibold">Claimed exclusively by you</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Detoxes</span>
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-dark">{completedMyJobs.length}</div>
            <p className="text-[10px] text-gray-400 font-semibold">Total finished detailing services</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveTab("available")}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === "available" ? "text-primary border-b-2 border-primary font-black" : "text-gray-400 hover:text-dark"
            }`}
          >
            Open Job Requests ({availableBookings.length})
            {availableBookings.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse font-mono">
                NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("my_jobs")}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === "my_jobs" ? "text-primary border-b-2 border-primary font-black" : "text-gray-400 hover:text-dark"
            }`}
          >
            My Accepted & Assigned Jobs ({myJobs.length})
          </button>
        </div>

        {/* TAB 1: AVAILABLE BOOKINGS TO CLAIM */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400 mt-3 font-semibold">Checking available job requests...</p>
              </div>
            ) : availableBookings.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <Zap size={24} />
                </div>
                <h3 className="font-heading font-bold text-dark text-lg">No Open Job Requests Right Now</h3>
                <p className="text-gray-400 text-xs max-w-md mx-auto">
                  When a customer books a detailing service, a live notification will alert all crew members. Check back shortly or keep this page open.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          Pending Claim
                        </span>
                        <h3 className="font-heading font-extrabold text-dark text-lg mt-1">
                          {booking.serviceName}
                        </h3>
                        <p className="text-xs text-gray-500 font-bold">₹{booking.price}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-mono block">ID: #{booking.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-y border-gray-50 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} className="text-primary shrink-0" />
                        <span className="font-bold text-dark">{booking.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-primary shrink-0" />
                        <span>{booking.scheduledDate || "Date TBD"} ({booking.timeSlot || "Time slot TBD"})</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Car size={14} className="text-primary shrink-0" />
                        <span className="font-mono">{booking.vehicleDetails || "Standard Vehicle"}</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{booking.notes || booking.address || "Doorstep Location"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={actionLoadingId === booking.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check size={16} />
                        {actionLoadingId === booking.id ? "Accepting..." : "Accept & Claim Job"}
                      </button>

                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={actionLoadingId === booking.id}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                        title="Pass / Ignore"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ACCEPTED / ASSIGNED JOBS */}
        {activeTab === "my_jobs" && (
          <div className="space-y-4">
            {myJobs.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <Calendar size={24} />
                </div>
                <h3 className="font-heading font-bold text-dark text-lg">No Assigned Jobs Yet</h3>
                <p className="text-gray-400 text-xs max-w-md mx-auto">
                  Switch to the "Open Job Requests" tab above to accept customer bookings and add them to your active schedule.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded-full border ${
                          job.bookingStatus === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : job.bookingStatus === "In Progress"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {job.bookingStatus}
                        </span>
                        <h3 className="font-heading font-extrabold text-dark text-lg mt-1">
                          {job.serviceName}
                        </h3>
                        <p className="text-xs font-bold text-dark">₹{job.price}</p>
                      </div>
                      <button
                        onClick={() => setSelectedJobDetails(job)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        View Full Sheet
                      </button>
                    </div>

                    <div className="space-y-2 text-xs border-y border-gray-50 py-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} className="text-primary shrink-0" />
                        <span className="font-extrabold">{job.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} className="text-primary shrink-0" />
                        <span className="font-bold">{job.customerPhone || "No Phone Provided"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-primary shrink-0" />
                        <span>{job.scheduledDate} ({job.timeSlot})</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Car size={14} className="text-primary shrink-0" />
                        <span className="font-mono">{job.vehicleDetails}</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{job.notes || job.address || "Doorstep location"}</span>
                      </div>
                    </div>

                    {/* Quick Contact Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${job.customerPhone}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone size={14} />
                        Call Customer
                      </a>
                      <a
                        href={generateWhatsAppUrl(job.customerPhone, job.customerName, job.serviceName, job.vehicleDetails)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare size={14} />
                        WhatsApp
                      </a>
                    </div>

                    {/* Status Workflow Control */}
                    {job.bookingStatus !== "Completed" && job.bookingStatus !== "Cancelled" && (
                      <div className="pt-2 border-t border-gray-100">
                        {job.bookingStatus === "Accepted" || job.bookingStatus === "Assigned" ? (
                          <button
                            onClick={() => handleStatusUpdate(job.id, "In Progress")}
                            disabled={actionLoadingId === job.id}
                            className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                          >
                            Mark as In Progress (On Site)
                          </button>
                        ) : job.bookingStatus === "In Progress" ? (
                          <button
                            onClick={() => handleStatusUpdate(job.id, "Completed")}
                            disabled={actionLoadingId === job.id}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                          >
                            Mark Service Complete ✅
                          </button>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Job Detail Sheet */}
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto text-left">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-extrabold text-dark text-xl">Booking Detail Sheet</h3>
                <button
                  onClick={() => setSelectedJobDetails(null)}
                  className="text-gray-400 hover:text-dark text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Booking ID</div>
                  <div className="font-mono font-extrabold text-dark">{selectedJobDetails.id}</div>
                  <div className="text-emerald-600 font-bold mt-1">Status: {selectedJobDetails.bookingStatus}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Service & Vehicle</label>
                  <div className="font-extrabold text-dark text-sm">{selectedJobDetails.serviceName} - ₹{selectedJobDetails.price}</div>
                  <div className="text-gray-600 font-mono">{selectedJobDetails.vehicleDetails}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Schedule</label>
                  <div className="font-bold text-dark">{selectedJobDetails.scheduledDate} at {selectedJobDetails.timeSlot}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Customer Information</label>
                  <div className="font-extrabold text-dark">{selectedJobDetails.customerName}</div>
                  <div className="font-semibold text-gray-700">{selectedJobDetails.customerPhone}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Doorstep Address / Notes</label>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 font-semibold leading-relaxed">
                    {selectedJobDetails.notes || selectedJobDetails.address || "Doorstep location provided"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedJobDetails(null)}
                className="w-full bg-dark hover:bg-dark/80 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Close Sheet
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

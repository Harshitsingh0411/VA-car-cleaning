import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Star,
  ArrowLeft,
  ShieldCheck,
  Car,
  CheckCircle2,
  AlertCircle,
  Headphones,
  RefreshCw,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getBookingById, dbBooking, rescheduleBooking } from "../services/dbService";
import ReviewModal from "../components/modals/ReviewModal";
import VehicleMediaThumbnail from "../components/ui/VehicleMediaThumbnail";
import { CustomerLocationPicker } from "../components/location/LocationPickerMap";
import SEO from "../components/seo/SEO";
import { downloadInvoice } from "../utils/invoiceGenerator";
import { getBookingWhatsAppSupportUrl } from "../utils/whatsappUtils";

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [booking, setBooking] = useState<dbBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("Morning (8:00 AM - 12:00 PM)");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) {
        setError("Invalid Booking ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getBookingById(bookingId);
        if (data) {
          setBooking(data);
          setRescheduleDate(data.scheduledDate || new Date().toISOString().split("T")[0]);
          setRescheduleTimeSlot(data.timeSlot || "Morning (8:00 AM - 12:00 PM)");
        } else {
          // Fallback: check profile appointments
          if (profile?.appointments) {
            const found = profile.appointments.find((a) => a.id === bookingId);
            if (found) {
              setBooking({
                id: found.id,
                serviceName: found.service,
                vehicleDetails: found.vehicle,
                scheduledDate: found.date,
                timeSlot: found.time,
                bookingStatus: (found.status as any) || "Completed",
                price: parseFloat(found.price.replace(/[^0-9.]/g, "")) || 0,
                customerId: user?.uid || "user",
                customerName: user?.displayName || profile?.name || "Customer",
                customerPhone: profile?.contactNumber || ""
              } as dbBooking);
            } else {
              setError("Booking record not found.");
            }
          } else {
            setError("Booking record not found.");
          }
        }
      } catch (err: any) {
        console.error("Failed to load booking details:", err);
        setError("Error loading booking details.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId, profile, user]);

  const handleConfirmReschedule = async () => {
    if (!booking) return;
    setRescheduleSubmitting(true);
    try {
      await rescheduleBooking(booking.id, rescheduleDate, rescheduleTimeSlot);
      setBooking((prev) => prev ? { ...prev, scheduledDate: rescheduleDate, timeSlot: rescheduleTimeSlot } : null);
      setShowRescheduleModal(false);
      alert("Booking slot updated successfully!");
    } catch (err: any) {
      alert("Reschedule failed: " + (err.message || "Please try again."));
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("completed") || s.includes("done")) {
      return { label: "COMPLETED", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s.includes("progress")) {
      return { label: "IN PROGRESS", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (s.includes("assign") || s.includes("accept")) {
      return { label: "ASSIGNED", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (s.includes("cancel") || s.includes("reject")) {
      return { label: "CANCELLED", bg: "bg-rose-50 text-rose-600 border-rose-200" };
    }
    return { label: "PENDING", bg: "bg-amber-50 text-amber-800 border-amber-200" };
  };

  if (loading) {
    return (
      <div className="pt-28 min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold text-xs">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-28 min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-4">
          <AlertCircle size={40} className="text-rose-500 mx-auto" />
          <h2 className="text-2xl font-heading font-extrabold text-dark">Booking Not Found</h2>
          <p className="text-gray-500 text-xs">{error || "The requested booking details are unavailable."}</p>
          <Link to="/account" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow">
            ← Return to My Account
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(booking.bookingStatus);
  const isCompleted = (booking.bookingStatus || "").toLowerCase().includes("complete");
  const isPendingOrAssigned = (booking.bookingStatus || "").toLowerCase().includes("pending") || (booking.bookingStatus || "").toLowerCase().includes("assign");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16 px-4 md:px-6">
      <SEO
        title={`Booking #${booking.id} Details | VA Car & Bike Care`}
        description={`View detailed status, crew assignment, and slot schedule for booking #${booking.id}`}
      />

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/account")}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Back to My Account</span>
          </button>
          <span className="text-xs font-mono font-bold text-gray-400">ID: #{booking.id}</span>
        </div>

        {/* Header Status Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4 text-left">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <VehicleMediaThumbnail serviceName={booking.serviceName} vehicleDetails={booking.vehicleDetails} />
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block mb-1.5 ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
                <h1 className="text-xl md:text-2xl font-heading font-extrabold text-dark leading-tight">
                  {booking.serviceName}
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  {booking.vehicleDetails || "Registered Vehicle"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-2xl font-heading font-black text-dark">₹{booking.price}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                {booking.paymentStatus === "paid" ? "PAYMENT COMPLETED" : "PAYMENT AT DOORSTEP"}
              </span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2.5 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
              <Calendar size={18} className="text-primary shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Scheduled Date</span>
                <span className="font-extrabold text-dark">{booking.scheduledDate || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
              <Clock size={18} className="text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Time Slot</span>
                <span className="font-extrabold text-dark">{booking.timeSlot || "Standard Slot"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Order Progress Timeline */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4 text-left">
          <h3 className="font-heading font-extrabold text-dark text-base">Service Status Progress</h3>

          <div className="grid grid-cols-4 gap-2 text-center pt-2">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-sm">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-[10px] font-extrabold text-dark block leading-tight">Booking Placed</span>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-sm ${
                booking.assignedEmployee || booking.assignedEmployeeName ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {booking.assignedEmployee || booking.assignedEmployeeName ? <CheckCircle2 size={16} /> : "2"}
              </div>
              <span className="text-[10px] font-extrabold text-dark block leading-tight">Crew Assigned</span>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-sm ${
                booking.bookingStatus === "In Progress" || isCompleted ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {booking.bookingStatus === "In Progress" || isCompleted ? <CheckCircle2 size={16} /> : "3"}
              </div>
              <span className="text-[10px] font-extrabold text-dark block leading-tight">In Progress</span>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow-sm ${
                isCompleted ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : "4"}
              </div>
              <span className="text-[10px] font-extrabold text-dark block leading-tight">Completed</span>
            </div>
          </div>
        </div>

        {/* Assigned Crew & Technician Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4 text-left">
          <h3 className="font-heading font-extrabold text-dark text-base">Detailing Squad Assignment</h3>

          {booking.assignedEmployeeName || booking.assignedEmployee ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3.5">
                {booking.assignedEmployeePhoto ? (
                  <img src={booking.assignedEmployeePhoto} alt="Crew" className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    <User size={24} />
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lead Technician</span>
                  <span className="font-heading font-extrabold text-dark text-base block">{booking.assignedEmployeeName || "Mobile Detailing Squad"}</span>
                  <span className="text-[11px] text-emerald-600 font-bold">Technician Dispatched</span>
                </div>
              </div>

              {booking.assignedEmployeePhone && (
                <a
                  href={`tel:${booking.assignedEmployeePhone}`}
                  className="bg-primary hover:bg-[#0b327b] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                >
                  <Phone size={14} />
                  <span>Call Detailer</span>
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-center space-y-1">
              <p className="font-bold text-xs text-amber-900">Mobile Squad Assignment in Progress</p>
              <p className="text-[11px] text-amber-700">Our coordinator is assigning the nearest certified detailing technician to your slot.</p>
            </div>
          )}
        </div>

        {/* Address & Delivery Spot Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80 space-y-4 text-left">
          <h3 className="font-heading font-extrabold text-dark text-base">Doorstep Location</h3>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-dark text-xs block">{booking.customerName || "Customer"}</span>
                <p className="text-xs text-gray-600 font-medium leading-relaxed mt-0.5">
                  {booking.address || "Doorstep service location provided upon confirmation call."}
                </p>
              </div>
            </div>
          </div>

          {booking.customerLatitude && booking.customerLongitude && (
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-48">
              <CustomerLocationPicker
                selectedLat={booking.customerLatitude}
                selectedLng={booking.customerLongitude}
                onLocationSelected={() => {}}
                readOnly={true}
              />
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadInvoice(booking)}
            className="bg-primary hover:bg-[#0b327b] text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <FileText size={16} />
            <span>Download Invoice</span>
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 bg-[#F4B400] hover:bg-amber-400 text-dark font-heading font-extrabold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Star size={16} className="fill-dark text-dark" />
            <span>Rate & Review Service</span>
          </button>

          {isPendingOrAssigned && (
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-dark font-extrabold py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
            >
              <RefreshCw size={14} className="text-amber-600" />
              <span>Reschedule Slot</span>
            </button>
          )}

          <a
            href={getBookingWhatsAppSupportUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            <Headphones size={14} />
            <span>Support (WhatsApp)</span>
          </a>
        </div>

      </div>

      {/* Review Modal Trigger */}
      {showReviewModal && (
        <ReviewModal
          isOpen={true}
          booking={booking}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            alert("Thank you for submitting your verified review!");
          }}
        />
      )}

      {/* Reschedule Modal Trigger */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-left">
            <h3 className="font-heading font-extrabold text-dark text-lg flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Reschedule Booking Slot
            </h3>
            <p className="text-xs text-gray-500">
              Select a new date and time slot for {booking.serviceName}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">New Time Slot</label>
                <select
                  value={rescheduleTimeSlot}
                  onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rescheduleSubmitting}
                onClick={handleConfirmReschedule}
                className="flex-1 py-2.5 bg-primary hover:bg-[#0b327b] text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                {rescheduleSubmitting ? "Updating..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

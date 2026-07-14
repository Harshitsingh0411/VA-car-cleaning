import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Phone,
  DollarSign,
  Clipboard,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  LogOut,
  Sparkles,
  Map
} from "lucide-react";
import {
  getBookingsByEmployee,
  updateBookingStatus,
  getEmployeeProfile,
  updateEmployeeProfile,
  logAuditAction
} from "../services/dbService";

export default function EmployeeDashboard() {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"jobs" | "attendance" | "salary" | "profile">("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [empProfile, setEmpProfile] = useState<any>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState(false);

  useEffect(() => {
    if (user) {
      // 1. Fetch assigned jobs
      setLoadingJobs(true);
      getBookingsByEmployee(user.uid)
        .then((data) => {
          setJobs(data);
          setLoadingJobs(false);
        })
        .catch((err) => {
          console.error("Error loading assigned bookings:", err);
          setLoadingJobs(false);
        });

      // 2. Fetch employee profile details
      getEmployeeProfile(user.uid)
        .then((data) => {
          if (data) {
            setEmpProfile(data);
          } else {
            // Seed a default employee profile if not existing
            const initial = {
              id: user.uid,
              name: user.displayName || "VA Detailer Crew",
              phone: profile?.contactNumber || "+91 88888 88888",
              email: user.email || "",
              joiningDate: "2026-02-10",
              department: "Mobile Detailing Squad",
              KYCStatus: "Verified" as const,
              availability: "online" as const,
              rating: 4.8
            };
            updateEmployeeProfile(user.uid, initial).then(() => {
              setEmpProfile(initial);
            });
          }
        })
        .catch((err) => console.error("Error fetching employee profile:", err));
    }
  }, [user, profile]);

  const handleUpdateJobStatus = async (bookingId: string, status: "In Progress" | "Completed" | "Cancelled") => {
    try {
      await updateBookingStatus(bookingId, status);
      // Refresh local jobs list
      const updatedJobs = await getBookingsByEmployee(user.uid);
      setJobs(updatedJobs);
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  const handleMarkAttendance = async () => {
    setAttendanceMarked(true);
    await logAuditAction(`Employee ${user.displayName} marked attendance as Present`);
  };

  const handleRequestLeave = async () => {
    setLeaveRequested(true);
    await logAuditAction(`Employee ${user.displayName} submitted a leave request`);
  };

  // Stats calculation
  const completedCount = jobs.filter((j) => j.bookingStatus === "Completed").length;
  const pendingCount = jobs.filter((j) => j.bookingStatus === "Pending" || j.bookingStatus === "Assigned" || j.bookingStatus === "In Progress").length;

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden flex">
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* LEFT Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded">
              Detailing Crew
            </span>
            <h2 className="text-xl font-heading font-extrabold text-dark tracking-tight">{user?.displayName || "Crew Member"}</h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Squad Dispatch</p>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "jobs" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <Truck size={16} />
              Assigned Bookings ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "attendance" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <UserCheck size={16} />
              Attendance & Shifts
            </button>
            <button
              onClick={() => setActiveTab("salary")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "salary" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <DollarSign size={16} />
              Salary & Earnings
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === "profile" ? "bg-primary text-white shadow shadow-primary/20" : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              <User size={16} />
              KYC & Profile
            </button>
          </nav>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 border border-rose-100 text-rose-500 hover:bg-rose-50 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer justify-center"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* RIGHT Main Content panels */}
        <div className="flex-1 space-y-6">
          
          {/* JOBS PANEL */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Assignments</span>
                  <div className="text-2xl font-black text-dark leading-none">{jobs.length}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Pending slots</span>
                  <div className="text-2xl font-black text-amber-500 leading-none">{pendingCount}</div>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Completed Jobs</span>
                  <div className="text-2xl font-black text-emerald-500 leading-none">{completedCount}</div>
                </div>
              </div>

              {/* Jobs list */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-heading font-extrabold text-dark text-lg">My Doorstep Wash Assignments</h3>
                
                {loadingJobs ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-2xl">
                    <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-bold uppercase">No detailing jobs assigned today.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-4 shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[9px] font-black uppercase bg-primary/10 text-primary py-0.5 px-2.5 rounded-full block w-fit mb-1.5">
                              {job.serviceName}
                            </span>
                            <h4 className="font-heading font-extrabold text-dark text-base">{job.vehicleDetails}</h4>
                          </div>
                          <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border uppercase tracking-wider ${
                            job.bookingStatus === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : job.bookingStatus === "Cancelled"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {job.bookingStatus}
                          </span>
                        </div>

                        {/* Customer & Slot Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 bg-white border border-gray-100 rounded-xl p-3.5">
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">Customer Details</span>
                            <div className="flex items-center gap-1 text-dark">
                              <User size={13} className="text-gray-400" />
                              <span>{job.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 font-mono text-gray-500">
                              <Phone size={13} className="text-gray-400" />
                              <span>{job.customerPhone}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">Schedule Slot</span>
                            <div className="flex items-center gap-1 text-dark">
                              <Calendar size={13} className="text-[#F4B400]" />
                              <span>{job.scheduledDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock size={13} className="text-gray-400" />
                              <span>{job.timeSlot}</span>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-1 border-t border-gray-100 pt-2.5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">Service Location</span>
                            <div className="flex items-start gap-1 text-gray-500 leading-relaxed">
                              <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                              <span>{job.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-between items-center pt-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer bg-primary/5 py-1.5 px-3.5 rounded-xl border border-primary/10"
                          >
                            <Map size={13} />
                            Get Directions
                          </a>

                          {job.bookingStatus === "Assigned" && (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, "In Progress")}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Truck size={14} />
                              Dispatch Crew
                            </button>
                          )}
                          {job.bookingStatus === "In Progress" && (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, "Completed")}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle size={14} />
                              Complete Detox
                            </button>
                          )}
                          {job.bookingStatus === "Pending" && (
                            <span className="text-[10px] text-gray-400 italic">Awaiting Admin Confirmation</span>
                          )}
                          {(job.bookingStatus === "Completed" || job.bookingStatus === "Cancelled") && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                              <ShieldCheck size={14} className="text-emerald-500" />
                              Detox Finalized
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE PANEL */}
          {activeTab === "attendance" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Daily Attendance & Leaves</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check In */}
                <div className="p-6 border border-gray-100 bg-gray-50/20 rounded-2xl text-center space-y-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today's Check In</span>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <UserCheck size={28} />
                  </div>
                  <h4 className="text-dark font-heading font-bold text-base">Register Crew Attendance</h4>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto">Confirm that you are active and ready to accept mobile doorstep detailing bookings today.</p>
                  
                  {attendanceMarked ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle size={14} />
                      Attendance Registered: Present (Online)
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkAttendance}
                      className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                    >
                      Check In (Online)
                    </button>
                  )}
                </div>

                {/* Leave Requests */}
                <div className="p-6 border border-gray-100 bg-gray-50/20 rounded-2xl text-center space-y-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Leave Management</span>
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                    <XCircle size={28} />
                  </div>
                  <h4 className="text-dark font-heading font-bold text-base">Request Shift Leave</h4>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto">Request a formal leave. Requires 24-hour notice to avoid crew re-routing impacts.</p>
                  
                  {leaveRequested ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                      <AlertCircle size={14} />
                      Leave Request Submitted (Awaiting Approval)
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestLeave}
                      className="border border-rose-100 text-rose-500 hover:bg-rose-50 font-bold py-2.5 px-6 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Request Leave / Day Off
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SALARY PANEL */}
          {activeTab === "salary" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">Earnings & Salary Review</h3>
              
              <div className="p-6 border border-gray-100 bg-gray-50/20 rounded-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                  <div>
                    <h4 className="font-heading font-extrabold text-dark text-base">Detailing Specialist Payouts</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Pay Cycle: Monthly (1st - 30th)</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black py-1 px-3 rounded-full uppercase">
                    Paid via Bank Transfer
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-gray-600">
                  <div className="bg-white p-3.5 border border-gray-100 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Base Salary</span>
                    <span className="text-dark font-black text-base">₹22,500</span>
                  </div>
                  <div className="bg-white p-3.5 border border-gray-100 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Detailing Bonus</span>
                    <span className="text-emerald-500 font-black text-base">₹4,200</span>
                  </div>
                  <div className="bg-white p-3.5 border border-gray-100 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Deductions (Leaves)</span>
                    <span className="text-rose-500 font-black text-base">-₹600</span>
                  </div>
                  <div className="bg-white p-3.5 border border-gray-100 rounded-xl">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Net Earnings (July)</span>
                    <span className="text-primary font-black text-base">₹26,100</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-2.5 text-xs text-gray-500">
                  <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Your detailing rating this month is **4.8/5.0** (Top 10% Squad). You qualify for the **Premium Detailer Performance Bonus** on your next cycle!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE PANEL */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-dark text-lg">KYC Status & Crew profile</h3>
              
              <div className="p-5 border border-gray-100 bg-gray-50/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 shrink-0">
                    <img
                      src={user?.photoURL || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150"}
                      alt="Crew Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-dark text-base">{user?.displayName}</h4>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 bg-white border border-gray-100 rounded-xl p-4">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Crew Department</span>
                    <span className="text-dark">{empProfile?.department || "Mobile Detailing Squad"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Joining Date</span>
                    <span className="text-dark">{empProfile?.joiningDate || "2026-02-10"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">KYC Status</span>
                    <span className="text-emerald-500 font-extrabold uppercase flex items-center gap-1">
                      <ShieldCheck size={14} />
                      {empProfile?.KYCStatus || "Verified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Assigned Contact</span>
                    <span className="text-dark font-mono">{empProfile?.phone || profile?.contactNumber || "+91 88825 40255"}</span>
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

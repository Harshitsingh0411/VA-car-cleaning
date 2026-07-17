import { db, isFirebaseConfigured, auth } from "../lib/firebase";

// Helper validator functions
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ""));
};

export const validatePincode = (pincode: string): boolean => {
  return /^\d{5,6}$/.test(pincode.trim());
};

export const validateRegNumber = (reg: string): boolean => {
  return /^[A-Z0-9-]{4,15}$/i.test(reg.replace(/\s/g, ""));
};

// Types corresponding to collections
export interface BaseDoc {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  status?: string;
  isDeleted?: boolean;
}

export interface dbUser extends BaseDoc {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  gender?: string;
  dob?: string;
  occupation?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  address?: string;
  role: "admin" | "staff" | "customer";
  verified?: boolean;
  profileCompletion?: number;
  lastLogin?: string;
  loginHistory?: string[];
  deviceInfo?: string;
  membershipTier?: string;
}

export interface dbAddress extends BaseDoc {
  id: string;
  type: "home" | "office" | "other";
  houseNumber: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface dbVehicle extends BaseDoc {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: string;
  fuelType?: string;
  transmission?: string;
  registrationNumber: string;
  images?: string[];
  color?: string;
  vehicleType: "Hatchback" | "Sedan" | "SUV" | "Luxury" | "Van" | "Bike";
}

export interface dbBooking extends BaseDoc {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleDetails: string;
  serviceId: string;
  serviceName: string;
  assignedEmployee?: string;
  assignedEmployeeName?: string;
  crewArrivingDate?: string;
  crewArrivingTime?: string;
  bookingStatus: "Pending" | "Accepted" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  rejectedBy?: string[]; // UIDs of crew who rejected this booking
  scheduledDate: string;
  timeSlot: string;
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  price: number;
  discount?: number;
  couponCode?: string;
  notes?: string;
  address?: string;
  rating?: number;
  feedback?: string;
  invoiceRef?: string;
}

export interface dbService extends BaseDoc {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface dbEmployee extends BaseDoc {
  id: string;
  name: string;
  photo?: string;
  phone: string;
  email: string;
  address?: string;
  joiningDate?: string;
  department?: string;
  salary?: string;
  bankDetails?: string;
  KYCStatus?: "Pending" | "Verified" | "Rejected";
  availability?: "online" | "offline";
  rating?: number;
}

export interface dbJobApplication extends BaseDoc {
  id: string;
  name: string;
  phone: string;
  email: string;
  skill: string;
  exp: string;
  cover: string;
  resumeUrl?: string;
  education?: string;
  expectedSalary?: string;
  status: "Under Review" | "Interview Scheduled" | "Approved" | "Rejected";
  interviewNotes?: string;
}

export interface dbPayment extends BaseDoc {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: string;
  razorpayId?: string;
  invoiceUrl?: string;
  status: "Success" | "Failed" | "Refunded";
  refundStatus?: string;
  transactionDate: string;
}

export interface dbReview extends BaseDoc {
  id: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  stars: number;
  review: string;
  images?: string[];
  adminReply?: string;
}

export interface dbNotification extends BaseDoc {
  id: string;
  user: string;
  receiverRole?: string;
  sender?: string;
  title: string;
  subtitle?: string;
  description: string;
  read: boolean;
  pinned?: boolean;
  archived?: boolean;
  type: string; // matches Category: Booking, Payments, Promotions, etc.
  priority: "low" | "normal" | "high" | "critical";
  createdAt: string;
  sentTime?: string;
  deliveredTime?: string;
  readTime?: string;
  clickedTime?: string;
  status: "Pending" | "Sent" | "Delivered" | "Read" | "Failed";
  deepLink?: string;
  imageUrl?: string;
  actionButtons?: Array<{ label: string; action: string; url?: string }>;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
}

export interface dbCoupon extends BaseDoc {
  code: string;
  discount: number;
  validity: string;
  usageLimit: number;
  usersUsed?: string[];
}

export interface dbAuditLog {
  id?: string;
  userId: string;
  action: string;
  timestamp: string;
  device?: string;
  ip?: string;
  prevValue?: any;
  newValue?: any;
}

// Helper to log audits automatically (disabled to prevent database read/write cost)
export const logAuditAction = async (action: string, prevValue?: any, newValue?: any) => {
  console.log(`[Audit Log]: ${action}`, { prevValue, newValue });
};

// 1. Users CRUD
export const getUserProfile = async (uid: string): Promise<dbUser | null> => {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists() ? (snap.data() as dbUser) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<dbUser>): Promise<void> => {
  if (data.email && !validateEmail(data.email)) throw new Error("Invalid Email Format");
  if (data.phone && !validatePhone(data.phone)) throw new Error("Invalid Phone Format");
  
  const updated = {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || uid
  };
  
  const prev = await getUserProfile(uid);
  await db.collection("users").doc(uid).set(updated, { merge: true });
  await logAuditAction(`Update profile for user ${uid}`, prev, updated);
};

export const getAllUsers = async (): Promise<dbUser[]> => {
  const snap = await db.collection("users").get();
  const list: dbUser[] = [];
  snap.forEach((doc: any) => {
    list.push({ uid: doc.id, ...doc.data() } as dbUser);
  });
  return list;
};

// 2. Saved Addresses Subcollection
export const getAddresses = async (userId: string): Promise<dbAddress[]> => {
  const snap = await db.collection(`users/${userId}/addresses`).get();
  const list: dbAddress[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as dbAddress);
  });
  return list;
};

export const addAddress = async (userId: string, data: Omit<dbAddress, "id">): Promise<string> => {
  if (!validatePincode(data.zipCode)) throw new Error("Invalid Pincode Format");
  
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    updatedBy: userId,
    status: "active",
    isDeleted: false
  };

  const res = await db.collection(`users/${userId}/addresses`).add(docData);
  await logAuditAction(`Add address for user ${userId}`, null, docData);
  return res.id;
};

export const removeAddress = async (userId: string, addressId: string): Promise<void> => {
  await db.collection(`users/${userId}/addresses`).doc(addressId).delete();
  await logAuditAction(`Remove address ${addressId} for user ${userId}`);
};

// 3. Vehicles CRUD
export const getVehicles = async (customerId: string): Promise<dbVehicle[]> => {
  const snap = await db.collection("vehicles").where("customerId", "==", customerId).get();
  const list: dbVehicle[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbVehicle;
    if (data.customerId === customerId && !data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const addVehicle = async (data: Omit<dbVehicle, "id">): Promise<string> => {
  if (!validateRegNumber(data.registrationNumber)) throw new Error("Invalid registration plate format.");
  
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.customerId,
    updatedBy: data.customerId,
    status: "active",
    isDeleted: false
  };

  const res = await db.collection("vehicles").add(docData);
  await logAuditAction(`Add vehicle for user ${data.customerId}`, null, docData);
  return res.id;
};

export const removeVehicle = async (vehicleId: string): Promise<void> => {
  const ref = db.collection("vehicles").doc(vehicleId);
  const snap = await ref.get();
  if (snap.exists()) {
    const updated = { isDeleted: true, updatedAt: new Date().toISOString() };
    await ref.set(updated, { merge: true });
    await logAuditAction(`Soft deleted vehicle ${vehicleId}`);
  }
};

// 4. Bookings CRUD
export const createBooking = async (data: Omit<dbBooking, "id" | "bookingStatus" | "paymentStatus">): Promise<string> => {
  const docData = {
    ...data,
    bookingStatus: "Pending" as const,
    paymentStatus: "Unpaid" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.customerId,
    updatedBy: data.customerId,
    status: "active",
    isDeleted: false
  };

  const res = await db.collection("bookings").add(docData);
  await logAuditAction(`Create booking for customer ${data.customerId}`, null, docData);

  // --- Forcefully notify ALL Crew Members for accepting booking ---
  try {
    const crewUids: string[] = [];

    // 1. Check users collection
    try {
      const usersSnap = await db.collection("users").get();
      usersSnap.forEach((doc: any) => {
        const u = doc.data();
        if (u.role === "staff" || u.role === "crew") {
          crewUids.push(doc.id);
        }
      });
    } catch (e) {}

    // 2. Check employees collection
    try {
      const empSnap = await db.collection("employees").get();
      empSnap.forEach((doc: any) => {
        if (!crewUids.includes(doc.id)) {
          crewUids.push(doc.id);
        }
      });
    } catch (e) {}

    // 3. Check simulator registered users fallback
    if (typeof localStorage !== "undefined") {
      try {
        const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
        for (const u of simUsers) {
          const profileRaw = localStorage.getItem(`sim_db_users_${u.uid}`);
          const profileData = profileRaw ? JSON.parse(profileRaw) : null;
          if (profileData && (profileData.role === "staff" || profileData.role === "crew")) {
            if (!crewUids.includes(u.uid)) {
              crewUids.push(u.uid);
            }
          }
        }
      } catch (e) {}
    }

    for (const crewUid of crewUids) {
      await sendNotification(
        crewUid,
        `🚨 NEW BOOKING REQUEST AVAILABLE!`,
        `Customer ${data.customerName} booked ${data.serviceName} for ${data.scheduledDate} (${data.timeSlot}). Tap to accept this job!`,
        "Job Request",
        "critical",
        {
          deepLink: "/employee",
          receiverRole: "staff",
          pinned: true,
          sentTime: new Date().toISOString(),
          actionButtons: [{ label: "Claim Job", action: "accept_booking", url: "/employee" }]
        }
      );
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sim_booking_created", { detail: { bookingId: res.id } }));
      window.dispatchEvent(new CustomEvent("sim_notification_created", { detail: { type: "crew_broadcast" } }));
    }
  } catch (err) {
    console.error("Error sending crew notifications on booking creation:", err);
  }

  return res.id;
};

export const getBookingsByCustomer = async (customerId: string): Promise<dbBooking[]> => {
  const snap = await db.collection("bookings").where("customerId", "==", customerId).get();
  const list: dbBooking[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbBooking;
    if (data.customerId === customerId && !data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const getBookingsByEmployee = async (employeeId: string): Promise<dbBooking[]> => {
  const snap = await db.collection("bookings").where("assignedEmployee", "==", employeeId).get();
  const list: dbBooking[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbBooking;
    if (data.assignedEmployee === employeeId && !data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

/** All Pending bookings not yet assigned to anyone — visible to all crew */
export const getAvailableBookings = async (currentCrewUid: string): Promise<dbBooking[]> => {
  const snap = await db.collection("bookings").where("bookingStatus", "==", "Pending").get();
  const list: dbBooking[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbBooking;
    if (!data.isDeleted && !data.assignedEmployee) {
      // Skip bookings this crew already rejected
      const rejected: string[] = data.rejectedBy || [];
      if (!rejected.includes(currentCrewUid)) {
        list.push({ id: doc.id, ...data });
      }
    }
  });
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

/** Crew self-selects a booking: marks it Accepted + assigns themselves */
export const crewAcceptBooking = async (bookingId: string, crewUid: string, crewName: string): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const prevSnap = await ref.get();
  const prev = prevSnap.data() as dbBooking | undefined;

  if (!prev || prev.bookingStatus !== "Pending" || prev.assignedEmployee) {
    throw new Error("This booking is no longer available.");
  }

  const updated = {
    assignedEmployee: crewUid,
    assignedEmployeeName: crewName,
    bookingStatus: "Accepted" as const,
    updatedAt: new Date().toISOString(),
    updatedBy: crewUid
  };
  await ref.set(updated, { merge: true });
  await logAuditAction(`Crew ${crewName} self-accepted booking ${bookingId}`, prev, updated);

  // Notify admin
  const adminSnap = await db.collection("users").where("role", "in", ["admin", "super_admin"]).get();
  adminSnap.forEach(async (adminDoc: any) => {
    await sendNotification(
      adminDoc.id,
      `✅ Booking Accepted by Crew`,
      `${crewName} has accepted booking #${bookingId.slice(0, 8).toUpperCase()} for ${prev.serviceName} (${prev.customerName}).`,
      "Job Assignment",
      "high",
      { deepLink: "/admin", receiverRole: "admin", sentTime: new Date().toISOString() }
    );
  });

  // Notify customer
  if (prev.customerId) {
    await sendNotification(
      prev.customerId,
      `🚗 Crew Assigned to Your Booking!`,
      `${crewName} has accepted your booking for ${prev.serviceName}. They will arrive on ${prev.scheduledDate} at ${prev.timeSlot}.`,
      "Booking Update",
      "high",
      { deepLink: "/account", receiverRole: "customer", sentTime: new Date().toISOString() }
    );
  }

  // Dispatch real-time events
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("booking_accepted_by_crew", { detail: { bookingId, crewUid } }));
  }
};

/** Crew rejects a booking — it stays available for others but hidden for this crew */
export const crewRejectBooking = async (bookingId: string, crewUid: string): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const snap = await ref.get();
  const data = snap.data() as dbBooking | undefined;
  if (!data) return;
  const existing: string[] = data.rejectedBy || [];
  if (!existing.includes(crewUid)) {
    await ref.set({ rejectedBy: [...existing, crewUid], updatedAt: new Date().toISOString() }, { merge: true });
  }
};

export const getAllBookings = async (): Promise<dbBooking[]> => {
  const snap = await db.collection("bookings").get();
  const list: dbBooking[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbBooking;
    if (!data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const updateBookingStatus = async (bookingId: string, status: dbBooking["bookingStatus"]): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const prevSnap = await ref.get();
  const prev = prevSnap.data();
  const updated = {
    bookingStatus: status,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "system"
  };
  await ref.set(updated, { merge: true });
  await logAuditAction(`Update booking status ${bookingId} to ${status}`, prev, updated);
};

export const assignEmployee = async (
  bookingId: string,
  employeeId: string,
  employeeName: string,
  crewArrivingDate?: string,
  crewArrivingTime?: string
): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const prevSnap = await ref.get();
  const prev = prevSnap.data();

  // Build booking summary for notification
  const bookingData = prev as any;
  const serviceName = bookingData?.serviceName || "Service";
  const customerName = bookingData?.customerName || "Customer";
  const scheduledDate = bookingData?.scheduledDate || crewArrivingDate || "";
  const timeSlot = bookingData?.timeSlot || crewArrivingTime || "";
  const address = bookingData?.notes || bookingData?.address || "Check booking for address";

  const updated = {
    assignedEmployee: employeeId,
    assignedEmployeeName: employeeName,
    crewArrivingDate: crewArrivingDate || "",
    crewArrivingTime: crewArrivingTime || "",
    bookingStatus: "Assigned" as const,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "system"
  };
  await ref.set(updated, { merge: true });
  await logAuditAction(`Assigned booking ${bookingId} to ${employeeName}`, prev, updated);

  // --- Force notification to the crew member ---
  const arrivalInfo = crewArrivingDate
    ? ` Arrive by ${crewArrivingDate}${crewArrivingTime ? " at " + crewArrivingTime : ""}.`
    : "";

  await sendNotification(
    employeeId,
    `🚗 New Job Assigned: ${serviceName}`,
    `You have been assigned a new booking for ${customerName}. Service: ${serviceName} | Date: ${scheduledDate} ${timeSlot} | Address: ${address}.${arrivalInfo}`,
    "Job Assignment",
    "critical",
    {
      subtitle: `Booking ID: ${bookingId}`,
      deepLink: "/employee",
      receiverRole: "staff",
      sentTime: new Date().toISOString(),
      pinned: true
    }
  );

  // Dispatch real-time event so crew dashboard refreshes instantly if open
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("crew_booking_assigned", { detail: { employeeId, bookingId } })
    );
    window.dispatchEvent(
      new CustomEvent("sim_notification_created", { detail: { userId: employeeId } })
    );
  }
};

// 5. Payments CRUD
export const createPayment = async (data: Omit<dbPayment, "id">): Promise<string> => {
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.customerId,
    updatedBy: data.customerId,
    isDeleted: false
  };

  const res = await db.collection("payments").add(docData);
  
  // Auto-update corresponding booking paymentStatus to Paid if success
  if (data.status === "Success") {
    await db.collection("bookings").doc(data.bookingId).set({
      paymentStatus: "Paid",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  await logAuditAction(`Process payment for booking ${data.bookingId}`, null, docData);
  return res.id;
};

export const getPaymentsByCustomer = async (customerId: string): Promise<dbPayment[]> => {
  const snap = await db.collection("payments").get();
  const list: dbPayment[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbPayment;
    if (data.customerId === customerId) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const getAllPayments = async (): Promise<dbPayment[]> => {
  const snap = await db.collection("payments").get();
  const list: dbPayment[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...(doc.data() as dbPayment) });
  });
  return list;
};

// 6. Employees CRUD
export const getEmployeeProfile = async (empId: string): Promise<dbEmployee | null> => {
  const snap = await db.collection("employees").doc(empId).get();
  return snap.exists() ? (snap.data() as dbEmployee) : null;
};

export const getAllEmployees = async (): Promise<dbEmployee[]> => {
  const snap = await db.collection("employees").get();
  const list: dbEmployee[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbEmployee;
    if (!data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const updateEmployeeProfile = async (empId: string, data: Partial<dbEmployee>): Promise<void> => {
  const updated = {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || empId
  };
  await db.collection("employees").doc(empId).set(updated, { merge: true });
  await logAuditAction(`Update employee profile for ${empId}`, null, updated);
};

export const createOrUpdateEmployee = async (data: {
  name: string;
  email: string;
  photo?: string;
  phone: string;
  address: string;
  department?: string;
  salary?: string;
  bankDetails?: string;
  KYCStatus?: "Pending" | "Verified" | "Rejected";
  availability?: "online" | "offline";
}): Promise<void> => {
  let existingUid: string | null = null;
  const usersSnap = await db.collection("users").get();
  usersSnap.forEach((doc: any) => {
    const uData = doc.data();
    if (uData.email?.toLowerCase() === data.email.toLowerCase()) {
      existingUid = doc.id;
    }
  });

  const empId = existingUid || "emp-" + Math.random().toString(36).substring(2, 9);
  const empData: dbEmployee = {
    id: empId,
    name: data.name,
    email: data.email,
    photo: data.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    phone: data.phone,
    address: data.address,
    department: data.department || "Detailing Crew",
    salary: data.salary || "₹18,000/month",
    bankDetails: data.bankDetails || "N/A",
    KYCStatus: data.KYCStatus || "Verified",
    availability: data.availability || "online",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: auth.currentUser?.uid || "admin",
    updatedBy: auth.currentUser?.uid || "admin",
    status: "active",
    isDeleted: false
  };

  await db.collection("employees").doc(empId).set(empData);

  if (existingUid) {
    await db.collection("users").doc(existingUid).set({
      role: "staff",
      contactNumber: data.phone,
      photoURL: empData.photo
    }, { merge: true });
    await logAuditAction(`Created staff profile and promoted existing user ${existingUid} to staff role.`);
  } else {
    await logAuditAction(`Created placeholder staff profile for email ${data.email}. Will link on register.`);
  }
};

export const deleteEmployeeProfile = async (empId: string): Promise<void> => {
  await db.collection("employees").doc(empId).set({ isDeleted: true }, { merge: true });
  if (!empId.startsWith("emp-")) {
    await db.collection("users").doc(empId).set({ role: "customer" }, { merge: true });
  }
  await logAuditAction(`Deleted staff profile for ${empId}`);
};

// 7. Job Applications CRUD
export const submitJobApplication = async (data: Omit<dbJobApplication, "id" | "status">): Promise<string> => {
  const docData = {
    ...data,
    status: "Under Review" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "guest",
    updatedBy: "guest",
    isDeleted: false
  };

  const res = await db.collection("job_applications").add(docData);
  await logAuditAction(`New career application submitted`, null, { name: data.name, email: data.email });
  return res.id;
};

export const getJobApplications = async (): Promise<dbJobApplication[]> => {
  const snap = await db.collection("job_applications").get();
  const list: dbJobApplication[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as dbJobApplication);
  });
  return list;
};

export const updateJobStatus = async (appId: string, status: dbJobApplication["status"], notes?: string): Promise<void> => {
  const updated: any = {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "admin"
  };
  if (notes) updated.interviewNotes = notes;
  await db.collection("job_applications").doc(appId).set(updated, { merge: true });
  await logAuditAction(`Job application ${appId} status updated to ${status}`);
};

// 8. Reviews CRUD
export const submitReview = async (data: Omit<dbReview, "id">): Promise<string> => {
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.customerId,
    updatedBy: data.customerId,
    isDeleted: false
  };

  const res = await db.collection("reviews").add(docData);
  
  // Update booking with rating references
  await db.collection("bookings").doc(data.bookingId).set({
    rating: data.stars,
    feedback: data.review,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  await logAuditAction(`Customer submitted review for booking ${data.bookingId}`, null, docData);
  return res.id;
};

export const getAllReviews = async (): Promise<dbReview[]> => {
  const snap = await db.collection("reviews").get();
  const list: dbReview[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as dbReview);
  });
  return list;
};

export const replyToReview = async (reviewId: string, reply: string): Promise<void> => {
  await db.collection("reviews").doc(reviewId).set({
    adminReply: reply,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "admin"
  }, { merge: true });
  await logAuditAction(`Reply posted to review ${reviewId}`);
};

// 9. Notifications CRUD
export const getUserNotifications = async (userId: string): Promise<dbNotification[]> => {
  const snap = await db.collection("notifications").where("user", "==", userId).get();
  const list: dbNotification[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbNotification;
    if (!data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
};

export const sendNotification = async (
  userId: string,
  title: string,
  desc: string,
  type = "System",
  priority: dbNotification["priority"] = "low",
  extraData?: Partial<dbNotification>
): Promise<string> => {
  const docData = {
    user: userId,
    title,
    description: desc,
    read: false,
    pinned: false,
    archived: false,
    type,
    priority,
    status: "Sent" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    ...extraData
  };
  const res = await db.collection("notifications").add(docData);
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sim_notification_created", { detail: { userId } }));
  }

  return res.id;
};

export const markNotificationRead = async (notifId: string): Promise<void> => {
  await db.collection("notifications").doc(notifId).set({
    read: true,
    readTime: new Date().toISOString(),
    status: "Read" as const,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const pinNotification = async (notifId: string, pinned: boolean): Promise<void> => {
  await db.collection("notifications").doc(notifId).set({
    pinned,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const archiveNotification = async (notifId: string, archived: boolean): Promise<void> => {
  await db.collection("notifications").doc(notifId).set({
    archived,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const deleteNotification = async (notifId: string): Promise<void> => {
  await db.collection("notifications").doc(notifId).set({
    isDeleted: true,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const snap = await db.collection("notifications").get();
  snap.forEach(async (doc: any) => {
    const data = doc.data();
    if (data.user === userId && !data.read && !data.isDeleted) {
      await db.collection("notifications").doc(doc.id).set({
        read: true,
        readTime: new Date().toISOString(),
        status: "Read" as const,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  });
};

// 10. Coupons CRUD
export const getCoupons = async (): Promise<dbCoupon[]> => {
  const snap = await db.collection("coupons").get();
  const list: dbCoupon[] = [];
  snap.forEach((doc: any) => {
    list.push({ code: doc.id, ...doc.data() } as dbCoupon);
  });
  return list;
};

export const createCoupon = async (data: dbCoupon): Promise<void> => {
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: auth.currentUser?.uid || "admin",
    updatedBy: auth.currentUser?.uid || "admin",
    isDeleted: false
  };
  await db.collection("coupons").doc(data.code).set(docData);
  await logAuditAction(`Create coupon ${data.code}`);
};

export const validateCoupon = async (code: string, userId: string): Promise<dbCoupon | null> => {
  const ref = db.collection("coupons").doc(code.toUpperCase());
  const snap = await ref.get();
  if (!snap.exists()) return null;
  
  const coupon = snap.data() as dbCoupon;
  
  // Check validity date
  if (new Date(coupon.validity) < new Date()) return null;
  
  // Check total usage limits
  const usageCount = coupon.usersUsed?.length || 0;
  if (usageCount >= coupon.usageLimit) return null;
  
  // Check if current user already used it
  if (coupon.usersUsed?.includes(userId)) return null;

  return coupon;
};

// 11. Contact Messages
export const sendContactMessage = async (name: string, phone: string, email: string, subject: string, message: string): Promise<string> => {
  if (!validateEmail(email)) throw new Error("Invalid Email Address");
  
  const docData = {
    name,
    phone,
    email,
    subject,
    message,
    replyStatus: "Unreplied",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const res = await db.collection("contact_messages").add(docData);
  await logAuditAction(`Contact message submitted by ${name}`);
  return res.id;
};

export const getContactMessages = async (): Promise<any[]> => {
  const snap = await db.collection("contact_messages").get();
  const list: any[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() });
  });
  return list;
};

// 12. Audit Logs
export const getAuditLogs = async (): Promise<dbAuditLog[]> => {
  const snap = await db.collection("audit_logs").get();
  const list: dbAuditLog[] = [];
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() });
  });
  return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

// 13. Before & After Slider Settings
export interface dbBeforeAfterSettings {
  beforeImage: string;
  afterImage: string;
  useSeparateImages: boolean;
}

export const getBeforeAfterSettings = async (): Promise<dbBeforeAfterSettings> => {
  try {
    const doc = await db.collection("settings").doc("before_after").get();
    if (doc.exists()) {
      return doc.data() as dbBeforeAfterSettings;
    }
  } catch (err) {
    console.error("Error getting before_after settings:", err);
  }
  return {
    beforeImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
    afterImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
    useSeparateImages: false
  };
};

export const updateBeforeAfterSettings = async (settings: dbBeforeAfterSettings): Promise<void> => {
  await db.collection("settings").doc("before_after").set(settings);
  await logAuditAction("Update Before & After settings", null, settings);
};

// 14. Dynamic Custom Services
export const defaultServices: dbService[] = [
  {
    id: "exterior",
    name: "Exterior Wash",
    price: 299,
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=600",
    description: "Premium foam wash, wheel detailing, tyre dressing & exterior glass cleaning."
  },
  {
    id: "interior",
    name: "Interior Cleaning",
    price: 599,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600",
    description: "Full vacuuming, dashboard polish, seat stain cleaning & perfume spray."
  },
  {
    id: "foam",
    name: "Foam Wash",
    price: 499,
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=600",
    description: "Deep foam bath, underbody wash, vacuuming and dashboard dressing."
  },
  {
    id: "wax",
    name: "Wax Polish",
    price: 799,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
    description: "High-gloss liquid wax coat, paint protection & machine buffing."
  },
  {
    id: "dashboard",
    name: "Dashboard Cleaning",
    price: 199,
    image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=600",
    description: "Detailed scrubbing of console, vent dusting & UV protection coat."
  },
  {
    id: "tyre",
    name: "Tyre Dressing",
    price: 199,
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600",
    description: "Deep tyre cleaning, mud removal & high-shine protective silicone coating."
  },
  {
    id: "premium",
    name: "Premium Detailing",
    price: 1999,
    image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=600",
    description: "All-in-one interior detox, engine bay polish, leather nourishment & paint correction."
  }
];

export const getAllServices = async (): Promise<dbService[]> => {
  const servicesMap = new Map<string, dbService>();
  defaultServices.forEach(s => servicesMap.set(s.id, { ...s }));

  try {
    const snap = await db.collection("services").get();
    snap.forEach((doc: any) => {
      const data = doc.data() as Partial<dbService>;
      const sId = doc.id;
      if (data.isDeleted) {
        servicesMap.delete(sId);
      } else {
        const existing = servicesMap.get(sId);
        servicesMap.set(sId, {
          id: sId,
          name: data.name || existing?.name || "Unnamed Service",
          price: data.price !== undefined ? data.price : (existing?.price || 0),
          image: data.image || existing?.image || "",
          description: data.description || existing?.description || "",
          isCustom: data.isCustom ?? (existing ? false : true)
        });
      }
    });
  } catch (err) {
    console.warn("Could not fetch custom services from db, falling back to local storage overrides:", err);
  }

  // Fallback / merge local storage pricing/image/desc overrides
  try {
    const priceOverrides = JSON.parse(localStorage.getItem("admin_pricing_overrides") || "{}");
    const imageOverrides = JSON.parse(localStorage.getItem("admin_service_images") || "{}");
    const descOverrides = JSON.parse(localStorage.getItem("admin_service_descriptions") || "{}");
    const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
    const defaultDeleted = JSON.parse(localStorage.getItem("admin_default_deleted_services") || "[]");

    // Remove deleted default services
    defaultDeleted.forEach((id: string) => {
      servicesMap.delete(id);
    });

    // Apply overrides to default services
    servicesMap.forEach((s, sId) => {
      const priceKey = sId === "exterior" ? "exteriorWash"
                      : sId === "interior" ? "interiorCleaning"
                      : sId === "foam" ? "foamWash"
                      : sId === "wax" ? "waxPolish"
                      : sId === "dashboard" ? "dashboardCleaning"
                      : sId === "tyre" ? "tyreDressing"
                      : sId === "premium" ? "premiumDetailing" : sId;
      
      if (priceOverrides[priceKey] !== undefined) s.price = Number(priceOverrides[priceKey]);
      if (imageOverrides[sId] !== undefined) s.image = imageOverrides[sId];
      if (descOverrides[sId] !== undefined) s.description = descOverrides[sId];
    });

    // Load custom services from localStorage
    customServicesRaw.forEach((cs: any) => {
      if (cs.isDeleted) {
        servicesMap.delete(cs.id);
      } else {
        servicesMap.set(cs.id, cs);
      }
    });
  } catch (e) {
    console.error("Error reading service overrides from local storage:", e);
  }

  return Array.from(servicesMap.values());
};

export const createOrUpdateService = async (service: dbService): Promise<void> => {
  const docData = {
    name: service.name,
    price: service.price,
    image: service.image,
    description: service.description,
    isCustom: service.isCustom ?? true,
    isDeleted: false,
    updatedAt: new Date().toISOString()
  };

  try {
    await db.collection("services").doc(service.id).set(docData, { merge: true });
  } catch (err) {
    console.warn("Could not save service to Firestore, saving to simulator local storage:", err);
  }

  // Backup to Local Storage
  try {
    if (service.isCustom) {
      const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
      const filtered = customServicesRaw.filter((s: any) => s.id !== service.id);
      filtered.push(service);
      localStorage.setItem("admin_custom_services", JSON.stringify(filtered));
    } else {
      // It's a default service override
      const priceOverrides = JSON.parse(localStorage.getItem("admin_pricing_overrides") || "{}");
      const imageOverrides = JSON.parse(localStorage.getItem("admin_service_images") || "{}");
      const descOverrides = JSON.parse(localStorage.getItem("admin_service_descriptions") || "{}");

      const priceKey = service.id === "exterior" ? "exteriorWash"
                      : service.id === "interior" ? "interiorCleaning"
                      : service.id === "foam" ? "foamWash"
                      : service.id === "wax" ? "waxPolish"
                      : service.id === "dashboard" ? "dashboardCleaning"
                      : service.id === "tyre" ? "tyreDressing"
                      : service.id === "premium" ? "premiumDetailing" : service.id;

      priceOverrides[priceKey] = service.price;
      imageOverrides[service.id] = service.image;
      descOverrides[service.id] = service.description;

      localStorage.setItem("admin_pricing_overrides", JSON.stringify(priceOverrides));
      localStorage.setItem("admin_service_images", JSON.stringify(imageOverrides));
      localStorage.setItem("admin_service_descriptions", JSON.stringify(descOverrides));
    }
  } catch (e) {
    console.error("Local storage service backup failed:", e);
  }
};

export const deleteServiceProfile = async (id: string): Promise<void> => {
  try {
    await db.collection("services").doc(id).set({ isDeleted: true }, { merge: true });
  } catch (err) {
    console.warn("Could not delete service from Firestore, deleting from simulator local storage:", err);
  }

  try {
    const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
    const matched = customServicesRaw.find((s: any) => s.id === id);
    if (matched) {
      matched.isDeleted = true;
      localStorage.setItem("admin_custom_services", JSON.stringify(customServicesRaw));
    } else {
      // It was a default service, save delete flag in localStorage
      const defaultDeleted = JSON.parse(localStorage.getItem("admin_default_deleted_services") || "[]");
      if (!defaultDeleted.includes(id)) {
        defaultDeleted.push(id);
        localStorage.setItem("admin_default_deleted_services", JSON.stringify(defaultDeleted));
      }
    }
  } catch (e) {
    console.error("Local storage delete backup failed:", e);
  }
};

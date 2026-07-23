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
  assignedEmployeePhone?: string;
  assignedEmployeePhoto?: string;
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
  customerLatitude?: number;
  customerLongitude?: number;
  customerLocationUrl?: string;
  crewLatitude?: number;
  crewLongitude?: number;
  crewLocationUrl?: string;
  loyaltyPointsRedeemed?: number;
  loyaltyPointsDiscount?: number;
  loyaltyPointsEarned?: number;
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
  videos?: string[];
  serviceName?: string;
  serviceDate?: string;
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

export const logAuditAction = async (action: string, prevValue?: any, newValue?: any) => {
  try {
    const user = auth.currentUser;
    const actorName = user?.displayName || user?.email || "System/Unknown";
    const timestamp = new Date().toISOString();
    const uid = user?.uid || null;
    
    await db.collection("audit_logs").add({
      action,
      prevValue: prevValue || null,
      newValue: newValue || null,
      actorName,
      actorUid: uid,
      userId: uid,
      timestamp,
    });
    console.log(`[Audit Saved]: ${action} by ${actorName}`);
  } catch (error) {
    console.debug("Audit log notice:", action);
  }
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

  // Sync photo update to active bookings if user is staff/crew
  if (data.photo && prev?.photo !== data.photo) {
    if (prev?.role === "crew" || prev?.role === "staff") {
       try {
         const snap = await db.collection("bookings").where("assignedEmployeeId", "==", uid).get();
         snap.forEach((doc: any) => {
           const bData = doc.data();
           if (bData.bookingStatus !== "Completed" && bData.bookingStatus !== "Cancelled") {
             db.collection("bookings").doc(doc.id).set({ assignedEmployeePhoto: data.photo }, { merge: true });
           }
         });
       } catch (e) {
         console.warn("Could not sync photo to active bookings:", e);
       }
    }
  }
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

  // --- Forcefully notify ONLY Crew Members for accepting booking ---
  try {
    const crewUids: string[] = [];
    const adminUidsSet = new Set<string>();

    // 1. Gather all admin UIDs to explicitly exclude them
    try {
      const adminUsersSnap = await db.collection("users").where("role", "in", ["admin", "super_admin"]).get();
      adminUsersSnap.forEach((doc: any) => adminUidsSet.add(doc.id));
    } catch (e) { }

    // 2. Check users collection for crew/staff roles ONLY
    try {
      const usersSnap = await db.collection("users").get();
      usersSnap.forEach((doc: any) => {
        const u = doc.data();
        if ((u.role === "staff" || u.role === "crew") && u.role !== "admin" && u.role !== "super_admin") {
          if (!adminUidsSet.has(doc.id)) {
            crewUids.push(doc.id);
          }
        }
      });
    } catch (e) { }

    // 3. Check employees collection for crew/staff role ONLY
    try {
      const empSnap = await db.collection("employees").get();
      empSnap.forEach((doc: any) => {
        const emp = doc.data();
        const empRole = emp?.role || "crew";
        if (
          !crewUids.includes(doc.id) &&
          !adminUidsSet.has(doc.id) &&
          empRole !== "admin" &&
          empRole !== "super_admin" &&
          (empRole === "staff" || empRole === "crew" || empRole === "employee")
        ) {
          crewUids.push(doc.id);
        }
      });
    } catch (e) { }

    // 4. Check simulator registered users fallback
    if (typeof localStorage !== "undefined") {
      try {
        const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
        for (const u of simUsers) {
          const profileRaw = localStorage.getItem(`sim_db_users_${u.uid}`);
          const profileData = profileRaw ? JSON.parse(profileRaw) : null;
          if (
            profileData &&
            (profileData.role === "staff" || profileData.role === "crew") &&
            profileData.role !== "admin" &&
            profileData.role !== "super_admin"
          ) {
            if (!crewUids.includes(u.uid) && !adminUidsSet.has(u.uid)) {
              crewUids.push(u.uid);
            }
          }
        }
      } catch (e) { }
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

  let crewPhone = "";
  let crewPhoto = "";
  try {
    const crewUser = await getUserProfile(crewUid);
    if (crewUser?.phone || (crewUser as any)?.contactNumber) {
      crewPhone = crewUser.phone || (crewUser as any).contactNumber || "";
    }
    if (crewUser?.photo || (crewUser as any)?.photoURL) {
      crewPhoto = crewUser.photo || (crewUser as any).photoURL || "";
    }
  } catch (e) {}

  const updated: Partial<dbBooking> = {
    assignedEmployee: crewUid,
    assignedEmployeeName: crewName,
    assignedEmployeePhone: crewPhone,
    assignedEmployeePhoto: crewPhoto,
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

export const updateBookingCrewLocation = async (
  bookingId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const updated = {
    crewLatitude: latitude,
    crewLongitude: longitude,
    crewLocationUrl: locationUrl,
    crewLocationUpdatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "crew"
  };
  await ref.set(updated, { merge: true });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("crew_location_updated", { detail: { bookingId, latitude, longitude } })
    );
  }
};

export const updateBookingCustomerLocation = async (
  bookingId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const updated = {
    customerLatitude: latitude,
    customerLongitude: longitude,
    customerLocationUrl: locationUrl,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "customer"
  };
  await ref.set(updated, { merge: true });
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

  let crewPhone = "";
  try {
    const crewUser = await getUserProfile(employeeId);
    if (crewUser?.phone || crewUser?.contactNumber) {
      crewPhone = crewUser.phone || crewUser.contactNumber || "";
    }
  } catch (e) {}

  const updated = {
    assignedEmployee: employeeId,
    assignedEmployeeName: employeeName,
    assignedEmployeePhone: crewPhone,
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
    photo: data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || data.email || "crew")}`,
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
  const notifMap = new Map<string, dbNotification>();

  try {
    const snap = await db.collection("notifications")
      .where("user", "in", [userId, "all_users", "system"])
      .get();
    
    snap.forEach((doc: any) => {
      const data = doc.data() as dbNotification;
      const docId = doc.id;
      if (!data.isDeleted) {
        notifMap.set(docId, { id: docId, ...data });
      }
    });
  } catch (err) {
    // Silently fallback if permission denied
  }

  // Also include any local notifications sent to this user
  try {
    const localRaw = localStorage.getItem(`sim_user_notifications_${userId}`);
    if (localRaw) {
      const localList: dbNotification[] = JSON.parse(localRaw);
      localList.forEach((n) => {
        if (!n.isDeleted && !notifMap.has(n.id)) {
          notifMap.set(n.id, n);
        }
      });
    }
  } catch (e) {
    // fallback
  }

  return Array.from(notifMap.values());
};

export const sendNotification = async (
  userId: string,
  title: string,
  desc: string,
  type = "System",
  priority: dbNotification["priority"] = "low",
  extraData?: Partial<dbNotification>
): Promise<string> => {
  const safeUserId = userId || "system";
  const rawData: Record<string, any> = {
    user: safeUserId,
    userId: safeUserId,
    title: title || "Notification",
    description: desc || "",
    read: false,
    pinned: false,
    archived: false,
    type: type || "System",
    priority: priority || "low",
    status: "Sent" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    ...extraData
  };

  // Strip out any undefined properties so Firestore never receives invalid data
  const docData: Record<string, any> = {};
  Object.keys(rawData).forEach((k) => {
    if (rawData[k] !== undefined) {
      docData[k] = rawData[k];
    }
  });

  const res = await db.collection("notifications").add(docData);

  if (typeof window !== "undefined") {
    try {
      const { dispatchMultiDeviceNotification } = await import("./notificationService");
      dispatchMultiDeviceNotification(title, desc, extraData?.imageUrl, extraData?.deepLink, safeUserId);
    } catch (e) {
      // dynamic import fallback
    }
    window.dispatchEvent(new CustomEvent("sim_notification_created", { detail: { userId: safeUserId } }));
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
  const snap = await db.collection("notifications").where("user", "==", userId).get();
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

// 13b. About Us Page Settings
export interface dbAboutSettings {
  badge: string;
  title: string;
  subtitle: string;
  storyHeading: string;
  storyText1: string;
  storyText2: string;
  storyImageUrl: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  stat3Number: string;
  stat3Label: string;
  stat4Number: string;
  stat4Label: string;
}

export const DEFAULT_ABOUT_SETTINGS: dbAboutSettings = {
  badge: "Who We Are",
  title: "Crafting the Showroom Shine",
  subtitle: "VA Car Cleaning Service stands for professional care, absolute premium precision, and uncompromising quality delivered to your door.",
  storyHeading: "Redefining Mobile Detailing Across Districts",
  storyText1: "Founded with a mission to bring professional car detailing directly to vehicle owners' driveways, VA Car Cleaning Service replaces the inconvenience of waiting at traditional car wash stations.",
  storyText2: "Our trained technicians use 100% water-saving foam formulas, high-powered mobile vacuum systems, and non-scratch microfiber cloths to protect clear coats.",
  storyImageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200",
  stat1Number: "1000+",
  stat1Label: "Cars Cleaned",
  stat2Number: "100%",
  stat2Label: "Water Saved",
  stat3Number: "4.9★",
  stat3Label: "Customer Rating",
  stat4Number: "50+",
  stat4Label: "Mobile Detailers"
};

export const getAboutSettings = async (): Promise<dbAboutSettings> => {
  try {
    const doc = await db.collection("settings").doc("about_page").get();
    if (doc.exists()) {
      return { ...DEFAULT_ABOUT_SETTINGS, ...(doc.data() as dbAboutSettings) };
    }
  } catch (err) {
    console.error("Error fetching about_page settings:", err);
  }
  return DEFAULT_ABOUT_SETTINGS;
};

export const updateAboutSettings = async (settings: dbAboutSettings): Promise<void> => {
  await db.collection("settings").doc("about_page").set(settings);
  await logAuditAction("Update About Us page content settings", null, settings);
};

// 13c. Contact Us Page Settings
export interface dbContactSettings {
  badge: string;
  title: string;
  subtitle: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  cityTagline: string;
  whatsappNumber: string;
  whatsappMessage: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
}

export const DEFAULT_CONTACT_SETTINGS: dbContactSettings = {
  badge: "100% Home & Doorstep Service",
  title: "No Shop Footprint, We Come to Your Driveway",
  subtitle: "Save time and fuel. We bring the complete detailing wash setup directly to your doorstep. Proudly cleaning Cars and Bikes across active districts.",
  phone1: "+91 95699 49626",
  phone2: "+91 92501 64163",
  email: "vacarcleanservice3@gmail.com",
  address: "Everywhere in Kanpur nagar",
  cityTagline: "Coming to your City Soon",
  whatsappNumber: "919250164163",
  whatsappMessage: "Need a quick quote? Chat on WhatsApp!",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  twitter: "https://twitter.com"
};

export const getContactSettings = async (): Promise<dbContactSettings> => {
  try {
    const doc = await db.collection("settings").doc("contact_page").get();
    if (doc.exists()) {
      return { ...DEFAULT_CONTACT_SETTINGS, ...(doc.data() as dbContactSettings) };
    }
  } catch (err) {
    console.error("Error fetching contact_page settings:", err);
  }
  return DEFAULT_CONTACT_SETTINGS;
};

export const updateContactSettings = async (settings: dbContactSettings): Promise<void> => {
  await db.collection("settings").doc("contact_page").set(settings);
  await logAuditAction("Update Contact Us page content settings", null, settings);
};


// 14. Dynamic Custom Services
export const defaultServices: dbService[] = [
  {
    id: "subscription-small",
    name: "Subscription (Small Car)",
    price: 800,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600",
    description: "1 month plan for small car. Includes daily cloth wipe and 1 full wash per week."
  },
  {
    id: "subscription-big",
    name: "Subscription (Big Car)",
    price: 1500,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600",
    description: "1 month plan for big car. Includes daily cloth wipe and 1 full wash per week."
  },
  {
    id: "one-time-full",
    name: "One time (Full Wash)",
    price: 299,
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=600",
    description: "Enjoy a professional one-time exterior car wash using high-pressure foam and premium cleaning products. This service includes exterior body wash, tyre & wheel cleaning, dashboard dust cleaning, glass cleaning, and microfiber drying for a spotless finish."
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

/* ─────────────────────────────────────────────────────────────────────────────
   DYNAMIC PRICING PLANS & PACKAGES
   ───────────────────────────────────────────────────────────────────────────── */

export interface dbPricingPlan extends BaseDoc {
  id: string;
  name: string;
  description: string;
  price: string;
  subscriptionDiscountPercent?: number;
  icon?: string;
  features: string[];
  popular: boolean;
  cta: string;
}

export const DEFAULT_PRICING_PLANS: dbPricingPlan[] = [
  {
    id: "starter",
    name: "Starter Package",
    description: "Great for quick, regular cleanups to maintain standard cleanliness.",
    price: "₹499",
    subscriptionDiscountPercent: 15,
    icon: "zap",
    features: [
      "Eco foam exterior wash",
      "Wheel cleaning & shine",
      "Door frame wipe down",
      "Towel dried finish",
      "Standard dashboard dusting"
    ],
    popular: false,
    cta: "Book Starter"
  },
  {
    id: "standard",
    name: "Standard Package",
    description: "Highly requested for regular maintenance and light interior detailing.",
    price: "₹799",
    subscriptionDiscountPercent: 15,
    icon: "star",
    features: [
      "All Starter features",
      "Deep cabin vacuuming",
      "All footmats washed",
      "Dashboard polish & UV guard",
      "Interior glass clean & polish",
      "Odor neutralizing spray"
    ],
    popular: true,
    cta: "Book Standard"
  },
  {
    id: "premium",
    name: "Premium Detailing",
    description: "Our signature package to restore your vehicle to immaculate condition.",
    price: "₹1999",
    subscriptionDiscountPercent: 15,
    icon: "shield",
    features: [
      "All Standard features",
      "Engine bay cleaning",
      "Seat stain spot extraction",
      "AC vent steam sterilization",
      "Liquid polymer paint wax coat",
      "Premium tire dressing"
    ],
    popular: false,
    cta: "Book Premium"
  },
  {
    id: "gold",
    name: "Gold Ultimate",
    description: "Elite service including professional gloss enhancement and total protection.",
    price: "₹4999",
    subscriptionDiscountPercent: 15,
    icon: "trophy",
    features: [
      "All Premium features",
      "9H Nano-ceramic coating layer",
      "Leather condition treatment",
      "Windshield hydrophobe treatment",
      "Alloy wheel restoration polish",
      "2-Year protection guarantee"
    ],
    popular: false,
    cta: "Book Gold Ultimate"
  }
];

export const getAllPricingPlans = async (): Promise<dbPricingPlan[]> => {
  const plansMap = new Map<string, dbPricingPlan>();
  DEFAULT_PRICING_PLANS.forEach((p) => plansMap.set(p.id, { ...p }));

  try {
    const snap = await db.collection("pricing_plans").get();
    if (snap && snap.docs) {
      snap.docs.forEach((doc: any) => {
        const data = typeof doc.data === "function" ? doc.data() : doc;
        if (data && data.id) {
          if (data.isDeleted) {
            plansMap.delete(data.id);
          } else {
            const existing = plansMap.get(data.id) || {} as dbPricingPlan;
            plansMap.set(data.id, { ...existing, ...data });
          }
        }
      });
    }
  } catch (e) {
    console.warn("Firestore pricing plans fetch failed, fallback to local storage:", e);
  }

  // Backup/Override from local storage simulator
  try {
    const localPlansRaw = JSON.parse(localStorage.getItem("admin_pricing_plans") || "[]");
    localPlansRaw.forEach((lp: any) => {
      if (lp.isDeleted) {
        plansMap.delete(lp.id);
      } else {
        const existing = plansMap.get(lp.id) || {} as dbPricingPlan;
        plansMap.set(lp.id, { ...existing, ...lp });
      }
    });
  } catch (e) {
    console.error("Local storage pricing plans read failed:", e);
  }

  return Array.from(plansMap.values());
};

export const createOrUpdatePricingPlan = async (plan: dbPricingPlan): Promise<void> => {
  const docData = {
    ...plan,
    isDeleted: false,
    updatedAt: new Date().toISOString()
  };

  try {
    await db.collection("pricing_plans").doc(plan.id).set(docData, { merge: true });
  } catch (err) {
    console.warn("Could not save pricing plan to Firestore, saving locally:", err);
  }

  try {
    const localPlansRaw = JSON.parse(localStorage.getItem("admin_pricing_plans") || "[]");
    const filtered = localPlansRaw.filter((p: any) => p.id !== plan.id);
    filtered.push(docData);
    localStorage.setItem("admin_pricing_plans", JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage pricing plan save failed:", e);
  }
};

export const deletePricingPlan = async (id: string): Promise<void> => {
  try {
    await db.collection("pricing_plans").doc(id).set({ isDeleted: true }, { merge: true });
  } catch (err) {
    console.warn("Could not soft delete pricing plan in Firestore:", err);
  }

  try {
    const localPlansRaw = JSON.parse(localStorage.getItem("admin_pricing_plans") || "[]");
    const matched = localPlansRaw.find((p: any) => p.id === id);
    if (matched) {
      matched.isDeleted = true;
    } else {
      localPlansRaw.push({ id, isDeleted: true });
    }
    localStorage.setItem("admin_pricing_plans", JSON.stringify(localPlansRaw));
  } catch (e) {
    console.error("Local storage pricing plan delete failed:", e);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   LOYALTY PROGRAM & POINTS SYSTEM
   ───────────────────────────────────────────────────────────────────────────── */

export interface dbLoyaltySettings extends BaseDoc {
  enabled: boolean;
  pointsPer100Spent: number;
  pointRedemptionValue: number;
  minPointsToRedeem: number;
  maxDiscountPercent: number;
  welcomeBonusPoints: number;
}

export const DEFAULT_LOYALTY_SETTINGS: dbLoyaltySettings = {
  enabled: true,
  pointsPer100Spent: 10,
  pointRedemptionValue: 1,
  minPointsToRedeem: 50,
  maxDiscountPercent: 50,
  welcomeBonusPoints: 100
};

export interface dbLoyaltyTransaction {
  id: string;
  userId: string;
  type: "earned" | "redeemed" | "admin_bonus" | "admin_adjustment" | "welcome_bonus";
  points: number;
  bookingId?: string;
  description: string;
  createdAt: string;
}

export const getLoyaltySettings = async (): Promise<dbLoyaltySettings> => {
  try {
    const doc = await db.collection("settings").doc("loyalty").get();
    if (doc.exists && doc.data()) {
      return { ...DEFAULT_LOYALTY_SETTINGS, ...doc.data() } as dbLoyaltySettings;
    }
  } catch (err) {
    console.warn("Could not fetch loyalty settings from Firestore:", err);
  }

  try {
    const local = localStorage.getItem("admin_loyalty_settings");
    if (local) {
      return { ...DEFAULT_LOYALTY_SETTINGS, ...JSON.parse(local) };
    }
  } catch (e) {
    console.error("Failed to read local loyalty settings:", e);
  }

  return DEFAULT_LOYALTY_SETTINGS;
};

export const updateLoyaltySettings = async (settings: Partial<dbLoyaltySettings>): Promise<void> => {
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "admin"
  };

  try {
    await db.collection("settings").doc("loyalty").set(updated, { merge: true });
  } catch (err) {
    console.warn("Could not save loyalty settings to Firestore:", err);
  }

  try {
    const current = await getLoyaltySettings();
    localStorage.setItem("admin_loyalty_settings", JSON.stringify({ ...current, ...updated }));
  } catch (e) {
    console.error("Failed to save local loyalty settings:", e);
  }
};

export const getUserLoyaltyPoints = async (userId: string): Promise<number> => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      if (typeof data?.loyaltyPoints === "number") {
        return data.loyaltyPoints;
      }
    }
  } catch (err) {
    console.warn("Could not fetch user loyalty points from Firestore:", err);
  }

  try {
    const localPts = localStorage.getItem(`user_loyalty_points_${userId}`);
    if (localPts !== null) {
      return parseInt(localPts, 10) || 0;
    }
  } catch (e) {}

  return 0;
};

export const getUserLoyaltyHistory = async (userId: string): Promise<dbLoyaltyTransaction[]> => {
  const list: dbLoyaltyTransaction[] = [];
  try {
    const snap = await db.collection("loyalty_transactions")
      .where("userId", "==", userId)
      .get();

    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as dbLoyaltyTransaction);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err: any) {
    if (err?.code !== "permission-denied") {
      console.warn("Could not fetch user loyalty history from Firestore, using local data fallback:", err);
    }
  }

  try {
    const localList = JSON.parse(localStorage.getItem(`user_loyalty_history_${userId}`) || "[]");
    localList.forEach((item: any) => {
      if (!list.some(l => l.id === item.id)) {
        list.push(item);
      }
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (e) {}

  return list;
};

export const grantOrAdjustLoyaltyPoints = async (
  userId: string,
  points: number,
  type: dbLoyaltyTransaction["type"],
  description: string,
  bookingId?: string
): Promise<number> => {
  const currentPts = await getUserLoyaltyPoints(userId);
  const newBalance = Math.max(0, currentPts + points);

  try {
    await db.collection("users").doc(userId).set({
      loyaltyPoints: newBalance,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Failed to update user loyalty points in Firestore:", err);
  }

  try {
    localStorage.setItem(`user_loyalty_points_${userId}`, newBalance.toString());
  } catch (e) {}

  const tx: dbLoyaltyTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    type,
    points,
    bookingId,
    description,
    createdAt: new Date().toISOString()
  };

  try {
    await db.collection("loyalty_transactions").doc(tx.id).set(tx);
  } catch (err) {
    console.warn("Failed to save loyalty transaction in Firestore:", err);
  }

  try {
    const localHistory = JSON.parse(localStorage.getItem(`user_loyalty_history_${userId}`) || "[]");
    localHistory.unshift(tx);
    localStorage.setItem(`user_loyalty_history_${userId}`, JSON.stringify(localHistory));
  } catch (e) {}

  await logAuditAction(`Loyalty Points adjustment (${points > 0 ? '+' : ''}${points}) for user ${userId}`, null, { points, type, newBalance });

  return newBalance;
};

/* ─────────────────────────────────────────────────────────────────────────────
   BEFORE & AFTER SHOWCASE GALLERY (CLOUDINARY ENABLED)
   ───────────────────────────────────────────────────────────────────────────── */

export interface dbBeforeAfterItem extends BaseDoc {
  id: string;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  description?: string;
  displayOrder?: number;
}

export const DEFAULT_BEFORE_AFTER_ITEMS: dbBeforeAfterItem[] = [
  {
    id: "ba-1",
    title: "Exterior Foam Wash & Gloss Polish",
    category: "Exterior Wash",
    beforeImage: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800",
    description: "Deep mud extraction, foam bath, and ceramic shine polish.",
    displayOrder: 1
  },
  {
    id: "ba-2",
    title: "Interior Cabin Deep Clean & Sanitize",
    category: "Interior Cleaning",
    beforeImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    description: "Stain removal on upholstery, dashboard dressing, and odor elimination.",
    displayOrder: 2
  },
  {
    id: "ba-3",
    title: "Alloy Wheel & Tyre Dressing",
    category: "Wheel Detailing",
    beforeImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80&w=800",
    description: "Brake dust removal, rim de-ironization, and wet-look tyre glaze.",
    displayOrder: 3
  }
];

export const getBeforeAfterItems = async (): Promise<dbBeforeAfterItem[]> => {
  const map = new Map<string, dbBeforeAfterItem>();
  DEFAULT_BEFORE_AFTER_ITEMS.forEach((item) => map.set(item.id, item));

  try {
    const snap = await db.collection("before_after_gallery").get();
    if (!snap.empty) {
      snap.forEach((doc) => {
        const data = doc.data() as dbBeforeAfterItem;
        if (data.isDeleted) {
          map.delete(data.id);
        } else {
          map.set(data.id, { ...map.get(data.id), ...data });
        }
      });
    }
  } catch (err: any) {
    if (err?.code !== "permission-denied") {
      console.warn("Could not fetch Before & After items from Firestore, using default gallery fallback:", err);
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem("admin_before_after_gallery") || "[]");
    local.forEach((item: any) => {
      if (item.isDeleted) {
        map.delete(item.id);
      } else {
        map.set(item.id, { ...map.get(item.id), ...item });
      }
    });
  } catch (e) {}

  return Array.from(map.values()).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

export const createOrUpdateBeforeAfterItem = async (item: dbBeforeAfterItem): Promise<void> => {
  const docData = {
    ...item,
    isDeleted: false,
    updatedAt: new Date().toISOString()
  };

  try {
    await db.collection("before_after_gallery").doc(item.id).set(docData, { merge: true });
  } catch (err) {
    console.warn("Could not save Before & After item to Firestore:", err);
  }

  try {
    const local = JSON.parse(localStorage.getItem("admin_before_after_gallery") || "[]");
    const filtered = local.filter((i: any) => i.id !== item.id);
    filtered.push(docData);
    localStorage.setItem("admin_before_after_gallery", JSON.stringify(filtered));
  } catch (e) {}
};

export const deleteBeforeAfterItem = async (id: string): Promise<void> => {
  try {
    await db.collection("before_after_gallery").doc(id).set({ isDeleted: true }, { merge: true });
  } catch (err) {
    console.warn("Could not delete Before & After item in Firestore:", err);
  }

  try {
    const local = JSON.parse(localStorage.getItem("admin_before_after_gallery") || "[]");
    const matched = local.find((i: any) => i.id === id);
    if (matched) {
      matched.isDeleted = true;
    } else {
      local.push({ id, isDeleted: true });
    }
    localStorage.setItem("admin_before_after_gallery", JSON.stringify(local));
  } catch (e) {}
};

/* ─────────────────────────────────────────────────────────────────────────────
   REALTIME COMPANY STATS CALCULATOR (ORDER HISTORY & REAL-TIME SYNC)
   ───────────────────────────────────────────────────────────────────────────── */

export interface RealtimeCompanyStats {
  carsCleaned: string;
  topRating: string;
  satisfaction: string;
  teamMembers: string;
  totalBookingsCount: number;
  completedBookingsCount: number;
  averageRating: number;
  totalReviewsCount: number;
  activeCrewCount: number;
}

export const getRealtimeCompanyStats = async (): Promise<RealtimeCompanyStats> => {
  let completedCount = 500;
  let totalBookingsCount = 520;
  let reviewsCount = 48;
  let totalStars = 235;
  let satisfactionRate = 98;
  let activeCrewCount = 24;

  // 1. Fetch real-time completed bookings count from order history in Firestore
  try {
    const bookings = await getAllBookings();
    if (bookings && bookings.length > 0) {
      totalBookingsCount = bookings.length;
      completedCount = bookings.filter((b) => b.bookingStatus === "Completed").length || bookings.length;
    }
  } catch (e) {
    console.debug("Realtime stats bookings notice:", e);
  }

  // 2. Fetch real-time customer reviews and calculate average top rating & satisfaction
  try {
    const reviews = await getAllReviews();
    if (reviews && reviews.length > 0) {
      reviewsCount = reviews.length;
      totalStars = reviews.reduce((sum, r) => sum + (r.stars || 5), 0);
      const highRatingsCount = reviews.filter((r) => (r.stars || 5) >= 4).length;
      satisfactionRate = Math.round((highRatingsCount / reviewsCount) * 100);
    }
  } catch (e) {
    console.debug("Realtime stats reviews notice:", e);
  }

  // 3. Fetch active team members / detailers count from Firestore
  try {
    const employees = await getAllEmployees();
    if (employees && employees.length > 0) {
      activeCrewCount = employees.filter((emp) => !emp.isDeleted).length || activeCrewCount;
    }
  } catch (e) {
    console.debug("Realtime stats crew count notice:", e);
  }

  const computedRating = reviewsCount > 0 ? (totalStars / reviewsCount).toFixed(1) : "4.9";

  return {
    carsCleaned: `${completedCount}+`,
    topRating: computedRating,
    satisfaction: `${satisfactionRate}%`,
    teamMembers: `${activeCrewCount}+`,
    totalBookingsCount,
    completedBookingsCount: completedCount,
    averageRating: reviewsCount > 0 ? totalStars / reviewsCount : 4.9,
    totalReviewsCount: reviewsCount,
    activeCrewCount
  };
};

// 21. Active Subscription Helper
export interface ActiveSubscription extends dbBooking {
  expiryDate: string;
  daysRemaining: number;
}

export const getActiveSubscription = async (userId: string): Promise<ActiveSubscription | null> => {
  try {
    const bookings = await getBookingsByCustomer(userId);
    const subscriptions = bookings.filter(b => 
      b.serviceId.includes("subscription") && b.bookingStatus === "Completed"
    );
    
    if (subscriptions.length === 0) return null;
    
    // Sort by scheduledDate descending to get the latest
    subscriptions.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    const latest = subscriptions[0];
    
    const scheduledDateObj = new Date(latest.scheduledDate);
    // Active for 30 days from the scheduled date of the first/latest completed service
    const expiryDateObj = new Date(scheduledDateObj.getTime());
    expiryDateObj.setDate(expiryDateObj.getDate() + 30);
    
    const today = new Date();
    const msRemaining = expiryDateObj.getTime() - today.getTime();
    
    if (msRemaining > 0) {
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      return {
        ...latest,
        expiryDate: expiryDateObj.toISOString().split("T")[0],
        daysRemaining
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching active subscription:", error);
    return null;
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   BLOG MANAGEMENT (CMS)
   ───────────────────────────────────────────────────────────────────────────── */

export interface dbBlogPost extends BaseDoc {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  coverImage: string;
  tags: string[];
}

import { blogPosts as fallbackBlogPosts } from "../data/blogData";

export const getAllBlogPosts = async (): Promise<dbBlogPost[]> => {
  try {
    const snap = await db.collection("blogs").get();
    if (snap.empty) {
      return fallbackBlogPosts as dbBlogPost[];
    }
    const posts: dbBlogPost[] = [];
    snap.forEach((doc: any) => {
      posts.push({ id: doc.id, ...doc.data() } as dbBlogPost);
    });
    // Sort by date descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return fallbackBlogPosts as dbBlogPost[];
  }
};

export const createOrUpdateBlogPost = async (post: dbBlogPost): Promise<void> => {
  const { id, ...data } = post;
  await db.collection("blogs").doc(id).set({
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  await logAuditAction("Update Blog Post", null, { title: post.title });
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await db.collection("blogs").doc(id).delete();
  await logAuditAction("Delete Blog Post", null, { postId: id });
};

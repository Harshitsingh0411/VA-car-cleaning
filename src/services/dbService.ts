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
  acceptedAt?: string;
  completedAt?: string;
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
  vehicleImageUrl?: string;
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
  isHidden?: boolean;
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
  logAuditAction(`Create booking for customer ${data.customerId}`, null, docData).catch(() => { });

  // --- Background Crew Notification Dispatch (Non-blocking for fast user response) ---
  (async () => {
    try {
      const crewUids: string[] = [];
      const adminUidsSet = new Set<string>();

      try {
        const adminUsersSnap = await db.collection("users").where("role", "in", ["admin", "super_admin"]).get();
        adminUsersSnap.forEach((doc: any) => adminUidsSet.add(doc.id));
      } catch (e) { }

      try {
        const usersSnap = await db.collection("users").where("role", "in", ["staff", "crew"]).get();
        usersSnap.forEach((doc: any) => {
          if (!adminUidsSet.has(doc.id)) {
            crewUids.push(doc.id);
          }
        });
      } catch (e) { }

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

      await Promise.all(
        crewUids.map(crewUid =>
          sendNotification(
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
          )
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sim_booking_created", { detail: { bookingId: res.id } }));
        window.dispatchEvent(new CustomEvent("sim_notification_created", { detail: { type: "crew_broadcast" } }));
      }
    } catch (err) {
      console.debug("Crew notification notice on booking creation:", err);
    }
  })();

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
  } catch (e) { }

  const now = new Date().toISOString();
  const updated: Partial<dbBooking> = {
    assignedEmployee: crewUid,
    assignedEmployeeName: crewName,
    assignedEmployeePhone: crewPhone,
    assignedEmployeePhoto: crewPhoto,
    acceptedAt: now,
    bookingStatus: "Accepted" as const,
    updatedAt: now,
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

export const getBookingById = async (bookingId: string): Promise<dbBooking | null> => {
  try {
    const snap = await db.collection("bookings").doc(bookingId).get();
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as dbBooking;
    }
    return null;
  } catch (err) {
    console.error("Error fetching booking by ID:", err);
    return null;
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
  const now = new Date().toISOString();

  const updated: Record<string, any> = {
    bookingStatus: status,
    updatedAt: now,
    updatedBy: auth.currentUser?.uid || "system"
  };

  if (status === "Completed" && (!prev || !prev.completedAt)) {
    updated.completedAt = now;
  }
  if (status === "Accepted" && (!prev || !prev.acceptedAt)) {
    updated.acceptedAt = now;
  }

  await ref.set(updated, { merge: true });
  await logAuditAction(`Update booking status ${bookingId} to ${status}`, prev, updated);
};

export const rescheduleBooking = async (
  bookingId: string,
  newDate: string,
  newTimeSlot: string
): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists()) {
    throw new Error("Booking not found");
  }

  const prev = snap.data() as dbBooking;
  const now = new Date().toISOString();
  const updatedData = {
    scheduledDate: newDate,
    timeSlot: newTimeSlot,
    rescheduledAt: now,
    updatedAt: now,
    updatedBy: auth.currentUser?.uid || prev.customerId
  };

  await ref.set(updatedData, { merge: true });
  await logAuditAction(`Customer rescheduled booking ${bookingId} to ${newDate} (${newTimeSlot})`, prev, updatedData);

  // Notify assigned crew if any
  if (prev.assignedEmployee) {
    try {
      await sendNotification(
        prev.assignedEmployee,
        `📅 Booking Rescheduled by Customer`,
        `Booking #${bookingId.slice(0, 8).toUpperCase()} for ${prev.serviceName} has been rescheduled to ${newDate} (${newTimeSlot}).`,
        "Schedule Update",
        "medium",
        { deepLink: "/employee", receiverRole: "crew", sentTime: now }
      );
    } catch (e) { }
  }

  notifyGlobalDataChange("bookings");
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
  const now = new Date().toISOString();
  const updated = {
    assignedEmployee: employeeId,
    assignedEmployeeName: employeeName,
    crewArrivingDate: crewArrivingDate || "",
    crewArrivingTime: crewArrivingTime || "",
    acceptedAt: now,
    bookingStatus: "Assigned" as const,
    updatedAt: now,
    updatedBy: auth.currentUser?.uid || "system"
  };

  // Immediate database assignment save
  await ref.set(updated, { merge: true });

  // Background non-blocking tasks (profile lookup, notification, audit logging)
  (async () => {
    try {
      const prevSnap = await ref.get();
      const prev = prevSnap.data();
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
      } catch (e) { }

      if (crewPhone) {
        await ref.set({ assignedEmployeePhone: crewPhone }, { merge: true });
      }

      await logAuditAction(`Assigned booking ${bookingId} to ${employeeName}`, prev, { ...updated, assignedEmployeePhone: crewPhone });

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

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("crew_booking_assigned", { detail: { employeeId, bookingId } })
        );
        window.dispatchEvent(
          new CustomEvent("sim_notification_created", { detail: { userId: employeeId } })
        );
      }
    } catch (err) {
      console.debug("Background crew assignment tasks error:", err);
    }
  })();
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
  // Sanitize images & videos arrays to guarantee Firestore document property limit compliance
  const safeImages = (data.images || [])
    .filter((url) => Boolean(url && typeof url === "string"))
    .map((url) => {
      if (url.length > 400000 && url.startsWith("data:")) {
        return url.substring(0, 400000);
      }
      return url;
    });

  const safeVideos = (data.videos || [])
    .filter((url) => Boolean(url && typeof url === "string"))
    .map((url) => {
      if (url.length > 400000 && url.startsWith("data:")) {
        return url.substring(0, 400000);
      }
      return url;
    });

  const docData = {
    ...data,
    images: safeImages,
    videos: safeVideos,
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

export const getAllReviews = async (includeHidden: boolean = false): Promise<dbReview[]> => {
  const snap = await db.collection("reviews").get();
  const list: dbReview[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() || {};
    if (data.isDeleted) return;
    if (!includeHidden && data.isHidden) return;
    const images = (data.images || []).filter((url: string) => url && !url.startsWith("blob:"));
    const videos = (data.videos || []).filter((url: string) => url && !url.startsWith("blob:"));
    list.push({ id: doc.id, ...data, images, videos } as dbReview);
  });
  return list;
};

export const toggleHideReview = async (reviewId: string, isHidden: boolean): Promise<void> => {
  await db.collection("reviews").doc(reviewId).set({
    isHidden,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "admin"
  }, { merge: true });
  await logAuditAction(`Admin ${isHidden ? "hid" : "unhid"} review ${reviewId}`);
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
  if (!userId) return [];
  const notifMap = new Map<string, dbNotification>();

  // Determine target user's role to strictly isolate customer vs crew/admin notifications
  let userRole = "customer";
  try {
    const userDoc = await getUserProfile(userId);
    if (userDoc?.role) userRole = userDoc.role;
  } catch (e) { }

  try {
    const snap = await db.collection("notifications").get();

    snap.forEach((doc: any) => {
      const data = doc.data() as dbNotification;
      const docId = doc.id;
      if (!data.isDeleted) {
        const notifUserId = data.userId || data.user;
        const matchesUser = (
          notifUserId === userId ||
          data.user === "all_users" ||
          (data.user === "system" && !data.receiverRole)
        );

        if (matchesUser) {
          notifMap.set(docId, { id: docId, ...data });
        }
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

  const allFetched = Array.from(notifMap.values());

  // Role-based Security & Privacy Filter:
  // If user is a regular customer, strictly exclude crew job requests & internal admin alerts
  if (userRole === "customer") {
    return allFetched.filter((n) => {
      const nType = (n.type || "").toLowerCase();
      const nRole = (n.receiverRole || "").toLowerCase();
      const nTitle = (n.title || "").toLowerCase();

      // Exclude staff/crew/admin recipient targets
      if (nRole === "staff" || nRole === "crew" || nRole === "admin" || nRole === "super_admin") {
        return false;
      }
      // Exclude job request & internal job assignment categories
      if (nType.includes("job") || nType === "job request" || nType === "job assignment") {
        return false;
      }
      if (nTitle.includes("new booking request") || nTitle.includes("booking accepted by crew") || nTitle.includes("new job assigned")) {
        return false;
      }
      return true;
    });
  }

  // If user is crew/staff, exclude customer-private or admin-only notifications not meant for staff
  if (userRole === "staff" || userRole === "crew") {
    return allFetched.filter((n) => {
      const nRole = (n.receiverRole || "").toLowerCase();
      if (nRole === "customer" && n.userId && n.userId !== userId) return false;
      return true;
    });
  }

  return allFetched;
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
    beforeImage: "",
    afterImage: "",
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
  storyHeading: "Redefining Mobile Care Across Districts",
  storyText1: "Founded with a mission to bring professional car care directly to vehicle owners' driveways, VA Car Cleaning Service replaces the inconvenience of waiting at traditional service stations.",
  storyText2: "Our trained technicians use 100% water-saving formulas, high-powered mobile systems, and non-scratch microfiber cloths to protect clear coats.",
  storyImageUrl: "",
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

// 13b-2. Founders Page Settings & Leadership Data
export interface dbFounder {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  quote?: string;
  educationOrBackground?: string;
  badges?: string[];
  linkedin?: string;
  twitter?: string;
  email?: string;
  instagram?: string;
}

export interface dbFoundersSettings {
  badge: string;
  title: string;
  subtitle: string;
  originHeading: string;
  originStory1: string;
  originStory2: string;
  founders: dbFounder[];
}

export const DEFAULT_FOUNDERS_SETTINGS: dbFoundersSettings = {

  title: "Meet the Minds Behind VA Car & Bike Care",
  subtitle: "Driven by a shared passion for automotive perfection, eco-friendly detailing, and empowering local talent across Kanpur.",
  originHeading: "The Story of How We Started",
  originStory1: "VA Car & Bike Care was born out of a simple realization: vehicle owners in Kanpur had to waste hours waiting at dirty wash centers only to get scratched paint and sub-par results. Our founders envisioned a premium, tech-enabled doorstep detailing service that brings showroom shine directly to your doorstep.",
  originStory2: "Today, under visionary leadership, we have grown into Kanpur's leading eco-conscious mobile car care network — conserving thousands of liters of water while creating flexible, dignified earning opportunities for young detailers.",
  founders: [
    {
      id: "veeru",
      name: "Veeru",
      role: "Founder & CEO",
      image: "/founders/founder1.png",
      bio: "With a vision to redefine premium car care, Veeru leads the company's strategic direction and business growth. He oversees financial planning, operational management, and long-term development while fostering a culture of excellence, innovation, and customer-first service. His leadership ensures the company continues to deliver exceptional quality and build lasting customer trust.",
      educationOrBackground: "Founder & Chief Executive Officer",
      badges: ["Founder & CEO", "Strategic Growth", "Visionary Leader"],
      email: "veerugiri8953161077@gmail.com",
      instagram: "https://instagram.com"
    },
    {
      id: "akhilesh",
      name: "Akhilesh",
      role: "Co-Founder & Head of Field Operations",
      image: "/founders/founder2.jpeg",
      bio: "Akhilesh is the driving force behind day-to-day field operations, ensuring every service is executed with precision and professionalism. He manages service teams, optimizes workflows, and maintains strict quality standards, making sure every vehicle receives outstanding care and every customer experiences reliable, top-tier service.",
      educationOrBackground: "Co-Founder & Head of Field Operations",
      badges: ["Co-Founder", "Field Operations Head", "Quality Control"],
      email: "akhileshkumar60594@gmail.com",
      instagram: "https://instagram.com/prince_king_.143/"
    },
    {
      id: "sanket",
      name: "Sanket",
      role: "Co-Founder & Head of Operations",
      image: "/founders/founder3.png",
      bio: "Sanket oversees operational execution and team coordination, ensuring every project is completed efficiently and to the highest standards. His expertise in crew management, service quality, and process optimization helps deliver a seamless customer experience while maintaining consistency, reliability, and excellence across all operations.",
      educationOrBackground: "Co-Founder & Head of Operations",
      badges: ["Co-Founder", "Head of Operations", "Process Optimization"],
      email: "sanketsahu9569@gmail.com",
      instagram: "https://instagram.com/sanket__sahu27"
    }
  ]
};

export const getFoundersSettings = async (): Promise<dbFoundersSettings> => {
  try {
    const doc = await db.collection("settings").doc("founders_page").get();
    if (doc.exists()) {
      return { ...DEFAULT_FOUNDERS_SETTINGS, ...(doc.data() as dbFoundersSettings) };
    }
  } catch (err) {
    console.error("Error fetching founders_page settings:", err);
  }
  return DEFAULT_FOUNDERS_SETTINGS;
};

export const updateFoundersSettings = async (settings: dbFoundersSettings): Promise<void> => {
  await db.collection("settings").doc("founders_page").set(settings);
  await logAuditAction("Update Founders page content settings", null, settings);
};

// 13b-3. Software Developers Settings & Data
export interface dbDeveloper {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin: string;
  github?: string;
  instagram?: string;
  email?: string;
  skills: string[];
}

export interface dbDevelopersSettings {
  badge: string;
  title: string;
  subtitle: string;
  techStackHeading: string;
  developers: dbDeveloper[];
}

export const DEFAULT_DEVELOPERS_SETTINGS: dbDevelopersSettings = {
  title: "Software Developed By Harshit Singh & Divyanshu Kashyap",
  subtitle: "Designed and engineered with cutting-edge web performance, real-time booking engines, seamless UI/UX, and robust cloud infrastructure.",
  techStackHeading: "Built With Modern Tech Stack",
  developers: [
    {
      id: "divyanshu-kashyap",
      name: "Divyanshu Kashyap",
      role: "Lead Software Developer & Full Stack Developer",
      image: "/developers/divyanshu.png",
      bio: "Divyanshu engineered core platform features, custom UI workflows, real-time database integrations, and high-performance frontend interfaces for VA Car & Bike Care.co-developed the platform's state management, mobile responsive suite, user authentication dashboard, and automated scheduling systems.",
      linkedin: "https://www.linkedin.com/in/divyanshu-kashyap-a5ab99311/",
      github: "https://github.com/divyanshukashyap0",
      instagram: "https://www.instagram.com/divyanshukashyap817/",
      email: "divyanshu00884466@gmail.com",
      skills: ["React & Vite", "TypeScript", "Framer Motion", "REST APIs", "UI/UX Design", "Database Management"]
    },
    {
      id: "harshit-singh",
      name: "Harshit Singh",
      role: "Lead Software Engineer & Full-Stack Developer",
      image: "/developers/harshit.png",
      bio: "Harshit co-developed the platform's state management, mobile responsive suite, user authentication dashboard, and automated scheduling systems.",
      linkedin: "https://www.linkedin.com/in/harshit-singh-9028ba324/",
      github: "https://github.com/Harshitsingh0411",
      instagram: "https://www.instagram.com/harshitsingh8313/",
      email: "harshitsingh2431086@gmail.com",
      skills: ["React 19", "TypeScript", "Tailwind CSS", "Firebase", "Node.js", "System Architecture"]
    }
  ]
};

export const getDevelopersSettings = async (): Promise<dbDevelopersSettings> => {
  try {
    const doc = await db.collection("settings").doc("developers_page").get();
    if (doc.exists()) {
      return { ...DEFAULT_DEVELOPERS_SETTINGS, ...(doc.data() as dbDevelopersSettings) };
    }
  } catch (err) {
    console.error("Error fetching developers_page settings:", err);
  }
  return DEFAULT_DEVELOPERS_SETTINGS;
};

export const updateDevelopersSettings = async (settings: dbDevelopersSettings): Promise<void> => {
  await db.collection("settings").doc("developers_page").set(settings);
  await logAuditAction("Update Software Developers page content settings", null, settings);
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
export const defaultServices: dbService[] = [];

const LEGACY_SEED_IDS = [
  "bike-wash",
  "foam-car-wash",
  "interior-detailing",
  "full-car-spa",
  "exterior",
  "interior",
  "foam",
  "wax",
  "dashboard",
  "tyre",
  "premium"
];

const LEGACY_SEED_NAMES = [
  "bike & scooter care",
  "car care & shine",
  "deep interior care",
  "full car spa & paint protection"
];

const isLegacyService = (s: any): boolean => {
  if (!s) return true;
  const sId = (s.id || "").toLowerCase();
  const sName = (s.name || "").toLowerCase();
  return LEGACY_SEED_IDS.includes(sId) || LEGACY_SEED_NAMES.includes(sName);
};

let cachedServicesMap: dbService[] | null = null;

export const getAllServicesSync = (): dbService[] => {
  if (cachedServicesMap && cachedServicesMap.length > 0) {
    const cleaned = cachedServicesMap.filter(s => !isLegacyService(s));
    if (cleaned.length !== cachedServicesMap.length) {
      cachedServicesMap = cleaned;
    }
    return cachedServicesMap;
  }

  try {
    const cachedRaw = localStorage.getItem("sim_db_services_cache");
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.filter((s: any) => !isLegacyService(s));
        try { localStorage.setItem("sim_db_services_cache", JSON.stringify(cleaned)); } catch (e) { }
        cachedServicesMap = cleaned;
        return cachedServicesMap;
      }
    }
  } catch (e) { }

  const servicesMap = new Map<string, dbService>();

  try {
    const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
    const cleanedCustom = customServicesRaw.filter((s: any) => !isLegacyService(s));
    try { localStorage.setItem("admin_custom_services", JSON.stringify(cleanedCustom)); } catch (e) { }

    cleanedCustom.forEach((cs: any) => {
      if (!cs.isDeleted && !isLegacyService(cs)) {
        servicesMap.set(cs.id, cs);
      }
    });
  } catch (e) {
    console.error("Error reading service overrides from local storage:", e);
  }

  cachedServicesMap = Array.from(servicesMap.values()).filter(s => !isLegacyService(s));
  return cachedServicesMap;
};

export const getAllServices = async (): Promise<dbService[]> => {
  const syncData = getAllServicesSync();

  // Background revalidation against live database
  db.collection("services").get().then((snap) => {
    const servicesMap = new Map<string, dbService>();

    if (snap && snap.docs && snap.docs.length > 0) {
      snap.docs.forEach((doc: any) => {
        const data = (typeof doc.data === "function" ? doc.data() : doc) as Partial<dbService>;
        const sId = doc.id;
        if (sId && !isLegacyService({ id: sId, name: data?.name })) {
          if (data && data.isDeleted) {
            servicesMap.delete(sId);
          } else if (data && data.name) {
            servicesMap.set(sId, {
              id: sId,
              name: data.name || "Unnamed Service",
              price: data.price !== undefined ? Number(data.price) : 0,
              image: data.image || "",
              description: data.description || "",
              isCustom: true
            });
          }
        }
      });
    }

    try {
      const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
      const cleanedCustom = customServicesRaw.filter((s: any) => !isLegacyService(s));
      try { localStorage.setItem("admin_custom_services", JSON.stringify(cleanedCustom)); } catch (e) { }

      cleanedCustom.forEach((cs: any) => {
        if (cs.isDeleted || isLegacyService(cs)) {
          servicesMap.delete(cs.id);
        } else {
          const existing = servicesMap.get(cs.id) || cs;
          servicesMap.set(cs.id, { ...existing, ...cs });
        }
      });
    } catch { }

    const freshList = Array.from(servicesMap.values()).filter(s => !isLegacyService(s));
    if (JSON.stringify(freshList) !== JSON.stringify(cachedServicesMap)) {
      cachedServicesMap = freshList;
      try {
        localStorage.setItem("sim_db_services_cache", JSON.stringify(freshList));
      } catch (e) { }
      notifyGlobalDataChange("services");
    }
  }).catch((err) => {
    console.warn("Background services revalidation notice:", err);
  });

  return syncData;
};

export const createOrUpdateService = async (service: dbService): Promise<void> => {
  const docData = {
    name: service.name,
    price: service.price,
    image: service.image,
    description: service.description,
    isCustom: true,
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
    const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
    const filtered = customServicesRaw.filter((s: any) => s.id !== service.id);
    filtered.push({ ...service, isCustom: true });
    localStorage.setItem("admin_custom_services", JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage service backup failed:", e);
  }
  notifyGlobalDataChange("services");
};

export const deleteServiceProfile = async (id: string): Promise<void> => {
  try {
    await db.collection("services").doc(id).set({ isDeleted: true }, { merge: true });
  } catch (err) {
    console.warn("Could not delete service from Firestore, deleting from simulator local storage:", err);
  }

  try {
    const customServicesRaw = JSON.parse(localStorage.getItem("admin_custom_services") || "[]");
    const filtered = customServicesRaw.filter((s: any) => s.id !== id);
    localStorage.setItem("admin_custom_services", JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage delete backup failed:", e);
  }
  notifyGlobalDataChange("services");
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

export const DEFAULT_PRICING_PLANS: dbPricingPlan[] = [];

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
  } catch (e) { }

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
  } catch (e) { }

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
  } catch (e) { }

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
  } catch (e) { }

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
    title: "Exterior Bath & Gloss Protection",
    category: "Exterior Care",
    beforeImage: "",
    afterImage: "",
    description: "Deep mud extraction and ceramic shine polish.",
    displayOrder: 1
  },
  {
    id: "ba-2",
    title: "Interior Cabin Deep Clean & Sanitize",
    category: "Interior Care",
    beforeImage: "",
    afterImage: "",
    description: "Stain removal on upholstery, dashboard dressing, and odor elimination.",
    displayOrder: 2
  },
  {
    id: "ba-3",
    title: "Alloy Wheel & Tyre Care",
    category: "Wheel Care",
    beforeImage: "",
    afterImage: "",
    description: "Brake dust removal, rim de-ironization, and wet-look glaze.",
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
  } catch (e) { }

  return Array.from(map.values()).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

const ensureCompactImage = async (urlStr?: string): Promise<string> => {
  return urlStr || "";
};

export const createOrUpdateBeforeAfterItem = async (item: dbBeforeAfterItem): Promise<void> => {
  const safeBefore = await ensureCompactImage(item.beforeImage);
  const safeAfter = await ensureCompactImage(item.afterImage);

  const docData = {
    ...item,
    beforeImage: safeBefore,
    afterImage: safeAfter,
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
  } catch (e) { }
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
  } catch (e) { }
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
  } catch {
    // Silent fallback to default metrics
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
  } catch {
    // Silent fallback to default metrics
  }

  // 3. Fetch active team members / detailers count from Firestore
  try {
    const employees = await getAllEmployees();
    if (employees && employees.length > 0) {
      activeCrewCount = employees.filter((emp) => !emp.isDeleted).length || activeCrewCount;
    }
  } catch {
    // Silent fallback to default metrics
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
    console.debug("Serving static blog posts fallback notice:", err);
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
  notifyGlobalDataChange("blogs");
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await db.collection("blogs").doc(id).delete();
  await logAuditAction("Delete Blog Post", null, { postId: id });
  notifyGlobalDataChange("blogs");
};

/* ─────────────────────────────────────────────────────────────────────────────
   19. DATABASE-DRIVEN COUPONS SYSTEM
   Stores and manages promo codes in Firestore database with full admin access
   ───────────────────────────────────────────────────────────────────────────── */

export interface dbCoupon extends BaseDoc {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  description: string;
  minSpend?: number;
  assignedUserId?: string; // "all" or specific user UID
  assignedUserEmail?: string;
  usedCount?: number;
  maxUses?: number;
  expiryDate?: string;
  status: "active" | "inactive";
}


export const getAllCoupons = async (): Promise<dbCoupon[]> => {
  const list: dbCoupon[] = [];
  try {
    if (isFirebaseConfigured) {
      const snap = await db.collection("coupons").get();
      snap.forEach((doc: any) => {
        list.push({ id: doc.id, ...doc.data() } as dbCoupon);
      });
      return list;
    }
  } catch (e) {
    console.warn("Error getting coupons from Firestore, checking local storage:", e);
  }

  // Local storage fallback
  const raw = localStorage.getItem("sim_db_coupons");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch { }
  }
  return [];
};

export const createOrUpdateCoupon = async (couponData: Partial<dbCoupon> & { code: string }): Promise<string> => {
  const id = couponData.id || "coupon-" + Math.random().toString(36).substring(2, 9);
  const docData: dbCoupon = {
    id,
    code: couponData.code.toUpperCase().trim(),
    discountType: couponData.discountType || "percentage",
    discountValue: Number(couponData.discountValue) || 10,
    description: couponData.description || `${couponData.code} Promo Code`,
    minSpend: couponData.minSpend,
    assignedUserId: couponData.assignedUserId || "all",
    assignedUserEmail: couponData.assignedUserEmail,
    status: couponData.status || "active",
    createdAt: couponData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    await db.collection("coupons").doc(id).set(docData, { merge: true });
  }

  const existing = await getAllCoupons();
  const updated = [docData, ...existing.filter(c => c.id !== id)];
  localStorage.setItem("sim_db_coupons", JSON.stringify(updated));

  await logAuditAction(`Create/Update coupon ${docData.code}`, null, docData);
  notifyGlobalDataChange("coupons");
  return id;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  if (isFirebaseConfigured) {
    await db.collection("coupons").doc(id).delete();
  }
  const existing = await getAllCoupons();
  const updated = existing.filter(c => c.id !== id);
  localStorage.setItem("sim_db_coupons", JSON.stringify(updated));

  await logAuditAction(`Deleted coupon ${id}`);
  notifyGlobalDataChange("coupons");
};

export const assignCouponToUser = async (couponCode: string, targetUserId: string, targetUserEmail?: string): Promise<string> => {
  const all = await getAllCoupons();
  const found = all.find(c => c.code.toUpperCase() === couponCode.toUpperCase());

  if (found) {
    const newCouponId = `coupon-${targetUserId.slice(0, 5)}-${Date.now()}`;
    const userCoupon: dbCoupon = {
      ...found,
      id: newCouponId,
      assignedUserId: targetUserId,
      assignedUserEmail: targetUserEmail || found.assignedUserEmail,
      updatedAt: new Date().toISOString()
    };
    await createOrUpdateCoupon(userCoupon);
    return newCouponId;
  } else {
    const newCoupon: dbCoupon = {
      id: `coupon-${targetUserId.slice(0, 5)}-${Date.now()}`,
      code: couponCode.toUpperCase().trim(),
      discountType: "percentage",
      discountValue: 15,
      description: `Exclusive user offer: ${couponCode.toUpperCase()}`,
      assignedUserId: targetUserId,
      assignedUserEmail: targetUserEmail,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await createOrUpdateCoupon(newCoupon);
    return newCoupon.id;
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL REALTIME EVENT BROADCASTER
   Synchronizes all Admin updates across all open tabs, windows & user/crew sessions
   ───────────────────────────────────────────────────────────────────────────── */

export const notifyGlobalDataChange = (topic: string = "all") => {
  try {
    const payload = JSON.stringify({ topic, timestamp: Date.now() });
    localStorage.setItem("va_global_sync_timestamp", payload);
    window.dispatchEvent(new CustomEvent("va_data_change", { detail: { topic, timestamp: Date.now() } }));
  } catch (e) {
    console.warn("Could not broadcast global data change event:", e);
  }
};

export const subscribeToDataChanges = (callback: (topic?: string) => void): (() => void) => {
  const handleCustomEvent = (e: any) => {
    callback(e.detail?.topic);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === "va_global_sync_timestamp" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed.topic);
      } catch {
        callback("all");
      }
    }
  };

  window.addEventListener("va_data_change", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("va_data_change", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
};

export interface dbCouponSettings {
  showCouponSection: boolean;
}

export const DEFAULT_COUPON_SETTINGS: dbCouponSettings = {
  showCouponSection: true,
};

export const getCouponSettings = async (): Promise<dbCouponSettings> => {
  try {
    if (isFirebaseConfigured) {
      const doc = await db.collection("settings").doc("coupons").get();
      if (doc.exists) {
        return { ...DEFAULT_COUPON_SETTINGS, ...doc.data() } as dbCouponSettings;
      }
    }
  } catch (err) {
    console.warn("Could not fetch coupon settings from Firestore:", err);
  }
  const local = localStorage.getItem("admin_coupon_settings");
  if (local) {
    try {
      return { ...DEFAULT_COUPON_SETTINGS, ...JSON.parse(local) };
    } catch (e) {
      console.error("Failed to read local coupon settings:", e);
    }
  }
  return DEFAULT_COUPON_SETTINGS;
};

export const updateCouponSettings = async (settings: Partial<dbCouponSettings>): Promise<void> => {
  const updated = { ...settings };
  try {
    if (isFirebaseConfigured) {
      await db.collection("settings").doc("coupons").set(updated, { merge: true });
    }
  } catch (err) {
    console.warn("Could not save coupon settings to Firestore:", err);
  }
  try {
    const current = await getCouponSettings();
    localStorage.setItem("admin_coupon_settings", JSON.stringify({ ...current, ...updated }));
  } catch (e) {
    console.error("Failed to save local coupon settings:", e);
  }
  notifyGlobalDataChange("coupons");
};

/**
 * Fetches all registered customer profiles from Firestore or returns default demo list.
 */
export const getAllCustomers = async (): Promise<any[]> => {
  try {
    if (isFirebaseConfigured) {
      const snap = await db.collection("users").where("role", "==", "customer").get();
      if (!snap.empty) {
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    }
  } catch (err) {
    console.warn("Error fetching customers from Firestore, using simulator fallback:", err);
  }

  return [

  ];
};

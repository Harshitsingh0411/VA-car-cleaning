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
  bookingStatus: "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  scheduledDate: string;
  timeSlot: string;
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  price: number;
  discount?: number;
  couponCode?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  invoiceRef?: string;
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
  const snap = await db.collection("vehicles").get();
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
  return res.id;
};

export const getBookingsByCustomer = async (customerId: string): Promise<dbBooking[]> => {
  const snap = await db.collection("bookings").get();
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
  const snap = await db.collection("bookings").get();
  const list: dbBooking[] = [];
  snap.forEach((doc: any) => {
    const data = doc.data() as dbBooking;
    if (data.assignedEmployee === employeeId && !data.isDeleted) {
      list.push({ id: doc.id, ...data });
    }
  });
  return list;
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

export const assignEmployee = async (bookingId: string, employeeId: string, employeeName: string): Promise<void> => {
  const ref = db.collection("bookings").doc(bookingId);
  const prevSnap = await ref.get();
  const prev = prevSnap.data();
  const updated = {
    assignedEmployee: employeeId,
    assignedEmployeeName: employeeName,
    bookingStatus: "Assigned" as const,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.uid || "system"
  };
  await ref.set(updated, { merge: true });
  await logAuditAction(`Assigned booking ${bookingId} to ${employeeName}`, prev, updated);
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
    list.push({ id: doc.id, ...doc.data() } as dbEmployee);
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

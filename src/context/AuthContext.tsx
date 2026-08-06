import React, { createContext, useContext, useState, useEffect } from "react";
import { updateProfile, getRedirectResult } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  loginWithGoogleOAuth,
  logoutUser
} from "../services/authService";
import {
  updateUserProfile,
  getUserProfile,
  logAuditAction
} from "../services/dbService";

export interface Vehicle {
  id: string;
  name: string;
  number: string;
  image?: string;
  type?: string;
  year?: string;
  fuelType?: string;
  mileage?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface Appointment {
  id: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  price: string;
}

export interface UserProfile {
  contactNumber: string;
  addresses: any[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  role?: "admin" | "customer" | "staff";
  gender?: string;
  dob?: string;
  occupation?: string;
  city?: string;
  state?: string;
  country?: string;
  preferredLanguage?: string;
  notificationPreference?: "Email" | "SMS" | "Both" | "None";
  themePreference?: "Light" | "Dark";
  profileCompletion?: number;
  loyaltyPoints?: number;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  profile: UserProfile | null;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateContactNumber: (phone: string) => Promise<void>;
  addAddress: (address: any) => Promise<void>;
  removeAddress: (idx: number) => Promise<void>;
  addVehicle: (name: string, num: string, details?: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  addAppointment: (service: string, vehicle: string, date: string, time: string, price: string) => Promise<void>;
  updateProfileDetails: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sync profile data from DB (Firebase or Simulator)
  const fetchUserProfile = async (uid: string, displayName?: string, email?: string) => {
    try {
      const data: any = await getUserProfile(uid);
      if (data) {
        const updates: any = {};
        if (displayName && (data.name !== displayName || data.name === "Valued Customer")) updates.name = displayName;
        if (email && !data.email) updates.email = email;
        if (Object.keys(updates).length > 0) {
          await db.collection("users").doc(uid).set(updates, { merge: true });
          data.name = updates.name || data.name;
          data.email = updates.email || data.email;
        }
        setProfile(data as unknown as UserProfile);
      } else {
        // Initialize empty profile
        // Check if there is a pre-created employee profile with the same email
        let staffProfile: any = null;
        let staffDocId: string | null = null;
        const targetEmail = email || auth.currentUser?.email || "";

        try {
          const empSnap = await db.collection("employees").get();
          empSnap.forEach((doc: any) => {
            const eData = doc.data();
            if (eData.email?.toLowerCase() === targetEmail.toLowerCase() && !eData.isDeleted) {
              staffProfile = eData;
              staffDocId = doc.id;
            }
          });
        } catch (eErr) {
          console.error("Error searching for existing staff profile:", eErr);
        }

        const initial: any = {
          name: displayName || staffProfile?.name || auth.currentUser?.displayName || "Valued Customer",
          email: targetEmail,
          contactNumber: staffProfile?.phone || "",
          addresses: staffProfile?.address ? [staffProfile.address] : [],
          vehicles: [],
          appointments: [],
          role: staffProfile ? "staff" : "customer"
        };
        await db.collection("users").doc(uid).set(initial);
        setProfile(initial);

        if (staffProfile && staffDocId) {
          const updatedStaff = {
            ...staffProfile,
            id: uid,
            updatedAt: new Date().toISOString(),
            updatedBy: uid
          };
          await db.collection("employees").doc(uid).set(updatedStaff);
          if (staffDocId !== uid) {
            await db.collection("employees").doc(staffDocId).delete();
          }
          await logAuditAction(`Linked new registration ${uid} to pre-created staff profile.`);
        }
      }
    } catch (err) {
      console.error("Critical error fetching user profile:", err);
    }
  };

  // Monitor auth changes
  useEffect(() => {
    if (isFirebaseConfigured && auth && typeof auth.onAuthStateChanged === "function") {
      try {
        getRedirectResult(auth)
          .then(async (credential) => {
            if (credential?.user) {
              try {
                const sessionDetails = {
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  platform: navigator.platform,
                  language: navigator.language
                };
                await logAuditAction(`User ${credential.user.uid} signed in from ${sessionDetails.platform} (Redirect)`, null, sessionDetails);
              } catch (err) {
                console.error("Failed to log auth session after redirect:", err);
              }
            }
          })
          .catch((err) => {
            if (err?.code !== 'auth/popup-closed-by-user' && !err?.message?.includes('INTERNAL ASSERTION FAILED')) {
              console.warn("Auth redirect state:", err);
            }
          });
      } catch (err) {
        // Safe catch for internal promise initialization edge cases
      }
    }

    if (!isFirebaseConfigured && !localStorage.getItem("sim_registered_users")) {
      const seededSimUsers = [

      ];
      localStorage.setItem("sim_registered_users", JSON.stringify(seededSimUsers));

      const defaultProfiles = {

      };

      Object.entries(defaultProfiles).forEach(([uid, p]) => {
        localStorage.setItem(`sim_db_users_${uid}`, JSON.stringify(p));
      });
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.uid, currentUser.displayName, currentUser.email).then(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = async (e: string, p: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginWithEmailAndPassword(e, p);
      setUser(loggedUser);
      await fetchUserProfile(loggedUser.uid);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (e: string, p: string, name: string) => {
    setLoading(true);
    try {
      const newUser = await registerWithEmailAndPassword(e, p, name);
      if (isFirebaseConfigured) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      setUser({ ...newUser, displayName: name });
      await fetchUserProfile(newUser.uid, name, e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    const authPromise = loginWithGoogleOAuth();
    setLoading(true);
    return authPromise
      .then(async (googleUser) => {
        if (googleUser) {
          setUser(googleUser);
          await fetchUserProfile(googleUser.uid, googleUser.displayName, googleUser.email);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper updates
  const updateProfileDetails = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, data);

    // Update Firebase Auth profile if photo or name changed
    if (data.photo || data.name) {
      const authUpdates: any = {};
      if (data.name) authUpdates.displayName = data.name;
      if (data.photo) authUpdates.photoURL = data.photo;

      try {
        if ((auth as any).updateCurrentUserProfile) {
          await (auth as any).updateCurrentUserProfile(authUpdates);
        } else if (auth.currentUser) {
          const { updateProfile } = await import("firebase/auth");
          await updateProfile(auth.currentUser, authUpdates);
        }
        setUser(auth.currentUser);
      } catch (e) {
        console.error("Failed to sync Firebase Auth profile", e);
      }
    }

    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateContactNumber = async (phone: string) => {
    await updateProfileDetails({ contactNumber: phone });
  };

  const addAddress = async (address: any) => {
    if (!profile) return;
    const addresses = [...(profile.addresses || []), address];
    await updateProfileDetails({ addresses });
  };

  const removeAddress = async (idx: number) => {
    if (!profile) return;
    const addresses = (profile.addresses || []).filter((_, i) => i !== idx);
    await updateProfileDetails({ addresses });
  };

  const addVehicle = async (name: string, num: string, details?: Partial<Vehicle>) => {
    if (!profile) return;
    const newV: Vehicle = { 
      id: "veh-" + Math.random().toString(36).substring(2, 9), 
      name, 
      number: num,
      ...details
    };
    const vehicles = [...(profile.vehicles || []), newV];
    await updateProfileDetails({ vehicles });
  };

  const removeVehicle = async (id: string) => {
    if (!profile) return;
    const vehicles = (profile.vehicles || []).filter((v) => v.id !== id);
    await updateProfileDetails({ vehicles });
  };

  const addAppointment = async (service: string, vehicle: string, date: string, time: string, price: string) => {
    if (!profile) return;
    const newApp: Appointment = {
      id: "appt-" + Math.random().toString(36).substring(2, 9),
      service,
      vehicle,
      date,
      time,
      status: "Pending",
      price
    };
    const appointments = [newApp, ...(profile.appointments || [])];
    await updateProfileDetails({ appointments });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateContactNumber,
        addAddress,
        removeAddress,
        addVehicle,
        removeVehicle,
        addAppointment,
        updateProfileDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  profile: null,
  loginWithEmail: async () => { },
  registerWithEmail: async () => { },
  loginWithGoogle: async () => { },
  logout: async () => { },
  updateContactNumber: async () => { },
  addAddress: async () => { },
  removeAddress: async () => { },
  addVehicle: async (name: string, num: string, details?: Partial<Vehicle>) => { },
  removeVehicle: async () => { },
  addAppointment: async () => { },
  updateProfileDetails: async () => { }
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
}

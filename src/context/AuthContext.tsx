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
  addresses: string[];
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
  addAddress: (address: string) => Promise<void>;
  removeAddress: (idx: number) => Promise<void>;
  addVehicle: (name: string, num: string) => Promise<void>;
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
        if (!data.name || !data.email) {
          const updates: any = {};
          if (!data.name) updates.name = displayName || auth.currentUser?.displayName || "Valued Customer";
          if (!data.email) updates.email = email || auth.currentUser?.email || "";
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
    if (isFirebaseConfigured) {
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
          console.error("Error handling redirect sign-in result:", err);
        });
    }

    if (!isFirebaseConfigured && !localStorage.getItem("sim_registered_users")) {
      const seededSimUsers = [
        {
          uid: "usr-1",
          email: "rahul@gmail.com",
          password: "password123",
          displayName: "Rahul Sharma",
          photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
        },
        {
          uid: "usr-2",
          email: "arjun.m@yahoo.com",
          password: "password123",
          displayName: "Arjun Mehta",
          photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
        },
        {
          uid: "usr-3",
          email: "pooja.malhotra@outlook.com",
          password: "password123",
          displayName: "Pooja Malhotra",
          photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja"
        }
      ];
      localStorage.setItem("sim_registered_users", JSON.stringify(seededSimUsers));
      
      const defaultProfiles = {
        "usr-1": {
          contactNumber: "+91 98765 43210",
          addresses: ["Flat 402, Sunshine Heights, Dwarka, New Delhi"],
          vehicles: [{ id: "veh-1", name: "Hyundai Creta", number: "DL-3C-AS-1234" }],
          appointments: [],
          role: "customer"
        },
        "usr-2": {
          contactNumber: "+91 88825 40255",
          addresses: ["Sector 15, Golf Course Road, Gurugram"],
          vehicles: [{ id: "veh-2", name: "Royal Enfield Bullet", number: "HR-26-DJ-9876" }],
          appointments: [],
          role: "staff"
        },
        "usr-3": {
          contactNumber: "+91 95699 49626",
          addresses: ["C-45, Vasant Kunj, New Delhi"],
          vehicles: [{ id: "veh-3", name: "Kia Seltos", number: "DL-9C-XY-0001" }],
          appointments: [],
          role: "admin"
        }
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
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateContactNumber = async (phone: string) => {
    await updateProfileDetails({ contactNumber: phone });
  };

  const addAddress = async (address: string) => {
    if (!profile) return;
    const addresses = [...(profile.addresses || []), address];
    await updateProfileDetails({ addresses });
  };

  const removeAddress = async (idx: number) => {
    if (!profile) return;
    const addresses = (profile.addresses || []).filter((_, i) => i !== idx);
    await updateProfileDetails({ addresses });
  };

  const addVehicle = async (name: string, num: string) => {
    if (!profile) return;
    const newV: Vehicle = { id: "veh-" + Math.random().toString(36).substring(2, 9), name, number: num };
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { logAuditAction } from "./dbService";

// Helper to log user login history and device specs
const logLoginSession = async (user: any) => {
  try {
    const sessionDetails = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };
    await logAuditAction(`User ${user.uid} signed in from ${sessionDetails.platform}`, null, sessionDetails);
  } catch (err) {
    console.error("Failed to log auth session:", err);
  }
};

// 1. Email Login
export const loginWithEmailAndPassword = async (email: string, pass: string): Promise<any> => {
  if (isFirebaseConfigured) {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    await logLoginSession(credential.user);
    return credential.user;
  } else {
    // Simulator Login
    const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
    const found = simUsers.find((u: any) => u.email === email && u.password === pass);
    if (!found) throw new Error("Invalid simulated email or password!");
    
    const loggedUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName,
      photoURL: found.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    };
    localStorage.setItem("sim_auth_user", JSON.stringify(loggedUser));
    auth.currentUser = loggedUser;
    await logLoginSession(loggedUser);
    return loggedUser;
  }
};

// 2. Email Signup
export const registerWithEmailAndPassword = async (email: string, pass: string, name: string): Promise<any> => {
  if (isFirebaseConfigured) {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    await logAuditAction(`Registered new user account: ${credential.user.uid}`, null, { email, name });
    return credential.user;
  } else {
    // Simulator Signup
    const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
    if (simUsers.find((u: any) => u.email === email)) {
      throw new Error("Email already exists in simulator database!");
    }
    const newUser = {
      uid: "sim-uid-" + Math.random().toString(36).substring(2, 9),
      email: email,
      password: pass,
      displayName: name,
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    };
    simUsers.push(newUser);
    localStorage.setItem("sim_registered_users", JSON.stringify(simUsers));
    localStorage.setItem("sim_auth_user", JSON.stringify(newUser));
    auth.currentUser = newUser;
    await logAuditAction(`Registered new simulated user: ${newUser.uid}`, null, { email, name });
    return newUser;
  }
};

// 3. Google OAuth Login
export const loginWithGoogleOAuth = async (): Promise<any> => {
  if (isFirebaseConfigured) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      throw error;
    }
  } else {
    // Simulator Google Login
    const googleUser = {
      uid: "google-mock-user-777",
      email: "doorstep.detailer@gmail.com",
      displayName: "Google Detailing Fan",
      photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    };
    localStorage.setItem("sim_auth_user", JSON.stringify(googleUser));
    auth.currentUser = googleUser;
    return logLoginSession(googleUser).then(() => googleUser);
  }
};

// 4. Phone OTP Verification Simulator
export const sendPhoneOTP = async (phone: string): Promise<string> => {
  // Return a mock confirmation code / transaction ID
  await logAuditAction(`Requested SMS OTP verification code for number ${phone}`);
  return "otp-tx-" + Math.random().toString(36).substring(2, 9);
};

export const verifyPhoneOTP = async (txId: string, otpCode: string, phone: string): Promise<any> => {
  if (otpCode !== "123456") throw new Error("Incorrect SMS verification code!");
  
  // Create or sign in user based on phone
  const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
  let found = simUsers.find((u: any) => u.phone === phone);
  
  if (!found) {
    // Register new user by phone
    found = {
      uid: "sim-phone-uid-" + Math.random().toString(36).substring(2, 9),
      email: `${phone.replace(/\+/g, "")}@phone.vacleaning.com`,
      phone: phone,
      displayName: "Phone Customer " + phone.substring(phone.length - 4),
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    };
    simUsers.push(found);
    localStorage.setItem("sim_registered_users", JSON.stringify(simUsers));
  }

  localStorage.setItem("sim_auth_user", JSON.stringify(found));
  auth.currentUser = found;
  await logLoginSession(found);
  return found;
};

// 5. Secure Logout
export const logoutUser = async (): Promise<void> => {
  const currentUid = auth.currentUser?.uid;
  if (isFirebaseConfigured) {
    await signOut(auth);
  } else {
    localStorage.removeItem("sim_auth_user");
    auth.currentUser = null;
  }
  if (currentUid) {
    await logAuditAction(`User ${currentUid} signed out successfully.`);
  }
};

// 6. Reset Password Email
export const requestPasswordReset = async (email: string): Promise<void> => {
  if (isFirebaseConfigured) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // Simulator password reset alert
    console.log(`[SIMULATOR] Sent password reset email link to ${email}`);
  }
  await logAuditAction(`Requested password reset email link for ${email}`);
};

// 7. Secure Reauthentication
export const reauthenticateUser = async (pass: string): Promise<void> => {
  if (isFirebaseConfigured && auth.currentUser) {
    const credential = EmailAuthProvider.credential(auth.currentUser.email || "", pass);
    await reauthenticateWithCredential(auth.currentUser, credential);
  } else {
    // Simulator validation
    const simUsers = JSON.parse(localStorage.getItem("sim_registered_users") || "[]");
    const found = simUsers.find((u: any) => u.uid === auth.currentUser?.uid && u.password === pass);
    if (!found) throw new Error("Incorrect verification password.");
  }
  await logAuditAction(`User ${auth.currentUser?.uid} reauthenticated successfully.`);
};

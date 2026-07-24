import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentReference,
  CollectionReference,
  Firestore,
  QueryConstraint,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhnH7CMSCoBu-wK6_QxjnC38jd3Qkgk2k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "va-cleaning-services.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "va-cleaning-services",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "va-cleaning-services.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1022047528427",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1022047528427:web:1f84752c9af3e7ece225ae",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SRXY9CS84T"
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

/* ─────────────────────────────────────────────────────────────────────────────
   V8-COMPAT BRIDGE
   Wraps Firebase v9 modular Firestore into the v8 chained API that dbService.ts
   uses:  db.collection("x").doc("y").get() / set() / update() / delete() / add()
   ───────────────────────────────────────────────────────────────────────────── */

function buildDocRef(firestoreDb: Firestore, docPath: string) {
  // docPath like "users/uid" or "bookings/bid/subColl/subId"
  const parts = docPath.split("/");
  let ref: any = firestoreDb;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // even index → collection segment
      ref = collection(ref, parts[i]);
    } else {
      // odd index → doc segment
      ref = doc(ref, parts[i]);
    }
  }
  return ref as DocumentReference;
}

function buildCollRef(firestoreDb: Firestore, collPath: string) {
  const parts = collPath.split("/");
  let ref: any = firestoreDb;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      ref = collection(ref, parts[i]);
    } else {
      ref = doc(ref, parts[i]);
    }
  }
  return ref as CollectionReference;
}

function wrapSnapshot(snap: any) {
  return {
    exists: () => snap.exists(),
    data: () => snap.data() ?? null,
    id: snap.id,
  };
}

function wrapQuerySnapshot(snap: any) {
  const docs = snap.docs.map((d: any) => ({
    id: d.id,
    data: () => d.data(),
    exists: () => d.exists(),
  }));
  return {
    docs,
    forEach: (cb: (doc: any) => void) => docs.forEach(cb),
    empty: snap.empty,
    size: snap.size,
  };
}

function sanitizeFirestoreData(data: any): any {
  if (data === null || data === undefined) return null;
  if (typeof data !== "object") return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData).filter((item) => item !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeFirestoreData(value);
    }
  }
  return clean;
}

function makeDocCompat(firestoreDb: Firestore, fullPath: string) {
  const docRef = buildDocRef(firestoreDb, fullPath);
  return {
    id: docRef.id,
    get: async () => wrapSnapshot(await getDoc(docRef)),
    set: async (data: any, options?: { merge?: boolean }) => {
      const cleanData = sanitizeFirestoreData(data);
      if (options?.merge) {
        await setDoc(docRef, cleanData, { merge: true });
      } else {
        await setDoc(docRef, cleanData);
      }
    },
    update: async (data: any) => {
      const cleanData = sanitizeFirestoreData(data);
      try {
        await updateDoc(docRef, cleanData);
      } catch {
        // doc might not exist yet — fall back to set with merge
        await setDoc(docRef, cleanData, { merge: true });
      }
    },
    delete: async () => deleteDoc(docRef),
    collection: (subCollName: string) =>
      makeCollectionCompat(firestoreDb, `${fullPath}/${subCollName}`),
  };
}

function makeCollectionCompat(firestoreDb: Firestore, collPath: string) {
  const collRef = buildCollRef(firestoreDb, collPath);
  return {
    doc: (docId?: string) => {
      if (docId) {
        return makeDocCompat(firestoreDb, `${collPath}/${docId}`);
      }
      // auto-id doc ref
      const autoRef = doc(collRef);
      return makeDocCompat(firestoreDb, `${collPath}/${autoRef.id}`);
    },
    add: async (data: any) => {
      const cleanData = sanitizeFirestoreData(data);
      const ref = await addDoc(collRef, cleanData);
      return { id: ref.id };
    },
    get: async () => wrapQuerySnapshot(await getDocs(collRef)),
    where: (...args: Parameters<typeof where>) => makeQueryCompat(firestoreDb, collRef, [where(...args)]),
    orderBy: (...args: Parameters<typeof orderBy>) => makeQueryCompat(firestoreDb, collRef, [orderBy(...args)]),
    limit: (n: number) => makeQueryCompat(firestoreDb, collRef, [limit(n)]),
  };
}

function makeQueryCompat(
  firestoreDb: Firestore,
  collRef: CollectionReference,
  constraints: QueryConstraint[]
) {
  return {
    get: async () => wrapQuerySnapshot(await getDocs(query(collRef, ...constraints))),
    where: (...args: Parameters<typeof where>) =>
      makeQueryCompat(firestoreDb, collRef, [...constraints, where(...args)]),
    orderBy: (...args: Parameters<typeof orderBy>) =>
      makeQueryCompat(firestoreDb, collRef, [...constraints, orderBy(...args)]),
    limit: (n: number) =>
      makeQueryCompat(firestoreDb, collRef, [...constraints, limit(n)]),
  };
}

function createCompatDb(firestoreDb: Firestore) {
  return {
    collection: (collPath: string) => makeCollectionCompat(firestoreDb, collPath),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   INITIALIZATION
   ───────────────────────────────────────────────────────────────────────────── */

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    let firestoreDb: Firestore;
    try {
      firestoreDb = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      firestoreDb = getFirestore(app);
    }
    // Expose v8-compat wrapper — all of dbService.ts works without changes
    db = createCompatDb(firestoreDb);
    googleProvider = new GoogleAuthProvider();
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.warn("⚠️ Firebase init failed, fallback to simulator:", error);
    setupSimulator();
  }
} else {
  console.log("ℹ️ No Firebase keys found. Initializing local storage simulator...");
  setupSimulator();
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOCAL STORAGE SIMULATOR (unchanged from before)
   ───────────────────────────────────────────────────────────────────────────── */
function setupSimulator() {
  googleProvider = { providerId: "google.com" };

  const getDocsList = (namespace: string) => {
    const prefix = `sim_db_${namespace.replace(/\//g, "_")}_`;
    const list: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const id = key.substring(prefix.length);
        const val = localStorage.getItem(key);
        if (val) list.push({ id, ...JSON.parse(val) });
      }
    }
    return list;
  };

  const buildCollection = (collPath: string): any => ({
    doc: (docId: string) => {
      const fullDocPath = `${collPath}/${docId}`;
      const storeKey = `sim_db_${fullDocPath.replace(/\//g, "_")}`;
      return {
        id: docId,
        get: async () => {
          const raw = localStorage.getItem(storeKey);
          return { exists: () => !!raw, data: () => (raw ? JSON.parse(raw) : null), id: docId };
        },
        set: async (data: any, options?: any) => {
          const currentRaw = localStorage.getItem(storeKey);
          const merged = options?.merge && currentRaw ? { ...JSON.parse(currentRaw), ...data } : data;
          localStorage.setItem(storeKey, JSON.stringify(merged));
        },
        update: async (data: any) => {
          const currentRaw = localStorage.getItem(storeKey);
          const merged = { ...(currentRaw ? JSON.parse(currentRaw) : {}), ...data };
          localStorage.setItem(storeKey, JSON.stringify(merged));
        },
        delete: async () => localStorage.removeItem(storeKey),
        collection: (subName: string) => buildCollection(`${fullDocPath}/${subName}`),
      };
    },
    add: async (data: any) => {
      const autoId = "sim-" + Math.random().toString(36).substring(2, 9);
      const storeKey = `sim_db_${collPath.replace(/\//g, "_")}_${autoId}`;
      localStorage.setItem(storeKey, JSON.stringify(data));
      return { id: autoId };
    },
    get: async () => {
      const list = getDocsList(collPath);
      const docs = list.map((doc) => ({
        id: doc.id,
        data: () => { const { id, ...rest } = doc; return rest; },
        exists: () => true,
      }));
      return { docs, forEach: (cb: any) => docs.forEach(cb), empty: docs.length === 0, size: docs.length };
    },
    where: () => buildCollection(collPath),
    orderBy: () => buildCollection(collPath),
    limit: () => buildCollection(collPath),
  });

  db = { collection: (name: string) => buildCollection(name) };

  let authListener: any = null;
  auth = {
    type: "simulator",
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      authListener = callback;
      const stored = localStorage.getItem("sim_auth_user");
      auth.currentUser = stored ? JSON.parse(stored) : null;
      callback(auth.currentUser);
      return () => { authListener = null; };
    },
    updateCurrentUserProfile: async (profile: { displayName?: string; photoURL?: string }) => {
      if (auth.currentUser) {
        auth.currentUser = { ...auth.currentUser, ...profile };
        localStorage.setItem("sim_auth_user", JSON.stringify(auth.currentUser));
        if (authListener) authListener(auth.currentUser);
      }
    },
  };
}

export { auth, db, googleProvider, isFirebaseConfigured };
export default app;

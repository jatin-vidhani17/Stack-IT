// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase Config (StackIt)
const firebaseConfig = {
  apiKey: "AIzaSyDfRY_7NWDaHwJKiJRWDbV4pn4CDaiLAvs",
  authDomain: "stack-it-88d1b.firebaseapp.com",
  projectId: "stack-it-88d1b",
  storageBucket: "stack-it-88d1b.firebasestorage.app",
  messagingSenderId: "403894846432",
  appId: "1:403894846432:web:f241b34ad0a400eba7a185",
  measurementId: "G-3H2JN7NBSV"
};

// 🔥 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔐 Auth & 🔥 Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// 📈 Conditionally load Analytics
let analytics;
const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } catch (err) {
      console.warn("Firebase Analytics init error:", err);
    }
  }
};
initAnalytics();

// 🌐 Create Firebase Context
const FirebaseContext = createContext(null);

// ✅ Custom Hook to use Firebase Context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

// ✅ Firebase Provider Component
export const FirebaseProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthInitialized(true);
      setUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    auth,
    db,
    analytics,
    userId,
    authInitialized,
    setUserId
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// 🔁 Direct exports for usage outside context
export { auth, db, analytics };

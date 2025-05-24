"use client";

import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/config";

const AuthContext = createContext({ user: null, loading: true });

async function fetchUserFromSession() {
  try {
    const res = await fetch("/api/sessionUser"); // new API route you'll create
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/sessionUser");
        if (!res.ok) {
          if (!mounted) return;
          setUser(null);
        } else {
          const sessionUser = await res.json();
          if (!mounted) return;
          setUser(sessionUser);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);

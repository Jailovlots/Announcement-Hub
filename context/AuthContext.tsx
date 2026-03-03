import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type UserRole = "admin" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CURRENT_USER_KEY = "@zdspgc_current_user"; // Optional: keep for really fast startup if offline

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt fast local load
    AsyncStorage.getItem(CURRENT_USER_KEY).then((json) => {
      if (json && !user) {
        setUser(JSON.parse(json));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, "id">;
            const fullUser: User = { id: firebaseUser.uid, ...userData };
            setUser(fullUser);
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fullUser));
          } else {
            console.warn("User document not found in Firestore.");
            setUser(null);
            await AsyncStorage.removeItem(CURRENT_USER_KEY);
          }
        } else {
          setUser(null);
          await AsyncStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch (e) {
        console.error("Auth state change error:", e);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle fetching Firestore user data
  };

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const newUser: Omit<User, "id"> = {
      name,
      email: email.toLowerCase(),
      role: "student", // default role
      createdAt: new Date().toISOString(),
    };

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", uid), newUser);
    // onAuthStateChanged will pick this up
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

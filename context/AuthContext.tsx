import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

export type UserRole = "admin" | "student";

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  updateProfile: (data: { username?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CURRENT_USER_KEY = "@zdspgc_current_user";

// Use debugger host for mobile, localhost for web
const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
const API_BASE = Platform.OS === "web" || !debuggerHost
  ? "http://localhost:5001"
  : `http://${debuggerHost}:5001`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verify session with server
        const res = await fetch(`${API_BASE}/api/user`, {
          credentials: 'include'
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        } else {
          setUser(null);
          await AsyncStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Login failed");
    }

    const userData = await res.json();
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "student" }),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Registration failed");
    }

    const userData = await res.json();
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  };

  const updateProfile = async (data: { username?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await fetch(`${API_BASE}/api/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      try {
        const parsed = JSON.parse(errorText);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          throw new Error(parsed[0].message);
        }
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorText || "Profile update failed");
    }

    const userData = await res.json();
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  };

  const logout = async () => {
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      credentials: 'include'
    });
    setUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, updateProfile, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

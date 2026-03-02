import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const USERS_KEY = "@zdspgc_users";
const CURRENT_USER_KEY = "@zdspgc_current_user";

const DEFAULT_ADMIN: User & { password: string } = {
  id: "admin-001",
  name: "Administrator",
  email: "admin@zdspgc.edu",
  role: "admin",
  createdAt: new Date().toISOString(),
  password: "admin123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      const existing = await AsyncStorage.getItem(USERS_KEY);
      if (!existing) {
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
      }
      const currentUserJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserJson) {
        setUser(JSON.parse(currentUserJson));
      }
    } catch (e) {
      console.error("Storage init error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: Array<User & { password: string }> = JSON.parse(usersJson || "[]");
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Invalid email or password.");
    const { password: _, ...userWithoutPassword } = found;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  };

  const register = async (name: string, email: string, password: string) => {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: Array<User & { password: string }> = JSON.parse(usersJson || "[]");
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("An account with this email already exists.");
    const newUser: User & { password: string } = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: "student",
      createdAt: new Date().toISOString(),
      password,
    };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...userWithoutPassword } = newUser;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
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

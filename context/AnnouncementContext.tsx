import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";

export type Category = "Academic" | "Events" | "Emergency" | "General";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl?: string | null;
  createdAt: string;
  createdBy: string;
}

interface AnnouncementContextValue {
  announcements: Announcement[];
  isLoading: boolean;
  addAnnouncement: (data: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
  updateAnnouncement: (id: string, data: Partial<Omit<Announcement, "id">>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

import { API_BASE } from "@/constants/Api";

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/announcements`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error("Error fetching announcements:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (data: Omit<Announcement, "id" | "createdAt">) => {
    const res = await fetch(`${API_BASE}/api/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to add announcement");
    }

    await fetchAnnouncements();
  };

  const updateAnnouncement = async (id: string, data: Partial<Omit<Announcement, "id">>) => {
    const res = await fetch(`${API_BASE}/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update announcement");
    }

    await fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/announcements/${id}`, {
      method: "DELETE",
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete announcement");
    }

    await fetchAnnouncements();
  };

  const refresh = async () => {
    await fetchAnnouncements();
  };

  const value = useMemo(
    () => ({ announcements, isLoading, addAnnouncement, updateAnnouncement, deleteAnnouncement, refresh }),
    [announcements, isLoading]
  );

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncements must be used within AnnouncementProvider");
  return ctx;
}

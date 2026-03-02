import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Category = "Academic" | "Events" | "Emergency" | "General";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl?: string;
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

const ANNOUNCEMENTS_KEY = "@zdspgc_announcements";

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "seed-001",
    title: "End of Term Examination Schedule",
    description: "Dear students, the end of term examinations will commence on March 15th, 2026. All students are required to be present at school by 7:30 AM. Please bring your student ID and all required stationery. A detailed timetable will be distributed to class prefects by Friday.",
    category: "Academic",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: "Administrator",
  },
  {
    id: "seed-002",
    title: "Annual Inter-House Sports Day",
    description: "The Annual Inter-House Sports Competition is scheduled for Saturday, March 20th, 2026 at the school sports complex. All students are encouraged to participate and cheer their respective houses. Events include 100m sprint, relay races, long jump, and shot put. Refreshments will be provided.",
    category: "Events",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "Administrator",
  },
  {
    id: "seed-003",
    title: "School Fees Deadline Reminder",
    description: "This is a reminder that all outstanding school fees for the current term must be paid by March 10th, 2026. Students with unpaid fees will not be allowed to sit for the end of term examinations. Please contact the bursar's office for any payment queries.",
    category: "General",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdBy: "Administrator",
  },
  {
    id: "seed-004",
    title: "URGENT: School Closure Notice",
    description: "Due to unforeseen maintenance works on the school premises, ZDSPGC will be closed on Monday, March 3rd, 2026. Classes will resume on Tuesday, March 4th. Parents and guardians are advised to make alternative arrangements for students on that day. We apologize for the inconvenience.",
    category: "Emergency",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: "Administrator",
  },
];

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const json = await AsyncStorage.getItem(ANNOUNCEMENTS_KEY);
      if (json) {
        setAnnouncements(JSON.parse(json));
      } else {
        await AsyncStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(SEED_ANNOUNCEMENTS));
        setAnnouncements(SEED_ANNOUNCEMENTS);
      }
    } catch (e) {
      console.error("Load announcements error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (data: Announcement[]) => {
    await AsyncStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data));
    setAnnouncements(data);
  };

  const addAnnouncement = async (data: Omit<Announcement, "id" | "createdAt">) => {
    const newItem: Announcement = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...announcements];
    await save(updated);
  };

  const updateAnnouncement = async (id: string, data: Partial<Omit<Announcement, "id">>) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, ...data } : a));
    await save(updated);
  };

  const deleteAnnouncement = async (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    await save(updated);
  };

  const refresh = async () => {
    setIsLoading(true);
    await load();
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

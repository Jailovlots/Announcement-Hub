import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "../lib/firebase";

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
    // Check and seed if collection is empty
    const seedDatabase = async () => {
      try {
        const q = query(collection(db, "announcements"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          console.log("Seeding announcements...");
          for (const item of SEED_ANNOUNCEMENTS) {
            await setDoc(doc(db, "announcements", item.id), item);
          }
        }
      } catch (e) {
        console.error("Error seeding:", e);
      }
    };
    seedDatabase().then(() => {
      subscribeToAnnouncements();
    });
  }, []);

  const subscribeToAnnouncements = () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Announcement[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  const addAnnouncement = async (data: Omit<Announcement, "id" | "createdAt">) => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newItem: Announcement = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "announcements", newId), newItem);
  };

  const updateAnnouncement = async (id: string, data: Partial<Omit<Announcement, "id">>) => {
    const docRef = doc(db, "announcements", id);
    // Remove undefined values
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    await updateDoc(docRef, cleanData);
  };

  const deleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));
  };

  const refresh = async () => {
    // Realtime listeners don't truly "refresh", but we can restate loading sequence
    // The feed handles live updates automatically.
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

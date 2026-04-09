import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertAnnouncementSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/announcements", async (_req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  // Simplified route as requested by user
  app.get("/announcements", async (_req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.post("/api/announcements", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const parsed = insertAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const announcement = await storage.createAnnouncement(parsed.data);
    res.status(201).json(announcement);
  });

  app.patch("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const announcement = await storage.updateAnnouncement(req.params.id, req.body);
    res.json(announcement);
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    await storage.deleteAnnouncement(req.params.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}

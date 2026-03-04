import "dotenv/config";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "../server/storage";
import { insertUserSchema } from "../shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
    const username = "admin";
    const password = "adminpassword123";

    try {
        const existing = await storage.getUserByUsername(username);
        if (existing) {
            console.log("Admin user already exists.");
            return;
        }

        const hashedPassword = await hashPassword(password);
        await storage.createUser({
            username,
            password: hashedPassword,
            role: "admin",
        } as any);

        console.log("Admin user created successfully!");
        console.log("Username: " + username);
        console.log("Password: " + password);
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        process.exit();
    }
}

seedAdmin();

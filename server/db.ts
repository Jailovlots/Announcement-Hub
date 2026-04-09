import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

let pool: Pool | null = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
    console.warn(
        "WARNING: DATABASE_URL is not set. Database features will be unavailable. Please set this in your environment variables.",
    );
} else {
    try {
        // Diagnostic: Log the host we are trying to connect to (masking password)
        try {
            const url = new URL(process.env.DATABASE_URL);
            console.log(`[DB] Attempting connection to host: ${url.hostname}`);
            if (url.hostname === "base") {
                console.error("[DB] CRITICAL: The hostname is still set to 'base'. Please check your Render environment variables!");
            }
        } catch (e) {
            console.log("[DB] Attempting connection using provided DATABASE_URL string.");
        }

        pool = new Pool({ 
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : false
        });
        
        db = drizzle(pool, { schema });
        
        // Test connection immediately
        pool.query('SELECT 1').then(() => {
            console.log("✅ Database connection verified successfully.");
        }).catch((err) => {
            console.error("❌ Database connection test FAILED:", err.message);
        });

    } catch (error: any) {
        console.error("FAILED to initialize database:", error.message);
    }
}

export { pool, db };

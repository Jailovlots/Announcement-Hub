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
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
        db = drizzle(pool, { schema });
        console.log("Database connection initialized successfully.");
    } catch (error: any) {
        console.error("FAILED to initialize database connection:", error.message);
    }
}

export { pool, db };

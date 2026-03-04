import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  try {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env')));
    dbUrl = envConfig.DATABASE_URL;
  } catch {
    console.warn("Could not load from .env file");
  }
}

if (!dbUrl) {
  console.warn("DATABASE_URL not set, using placeholder for typecheck/lint");
  dbUrl = "postgresql://postgres:postgres@localhost:5432/placeholder";
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

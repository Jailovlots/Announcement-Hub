const { Pool } = require('pg');
require('dotenv').config();

async function debugDB() {
    console.log("Starting DB debug...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        console.log("Connecting to pool...");
        const client = await pool.connect();
        console.log("Connected!");
        
        console.log("Checking tables...");
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", tables.rows.map(r => r.table_name));

        const usersCount = await client.query("SELECT count(*) FROM users");
        console.log("Users count:", usersCount.rows[0].count);

        if (parseInt(usersCount.rows[0].count) > 0) {
            const users = await client.query("SELECT id, username, role FROM users");
            console.log("Users:", users.rows);
        }

        client.release();
    } catch (error) {
        console.error("DB debug error:", error);
    } finally {
        await pool.end();
        console.log("Finished DB debug.");
    }
}

debugDB();

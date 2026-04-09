const { Pool } = require('pg');
require('dotenv').config();

async function checkUsers() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query('SELECT username, role, password FROM users');
        console.log("Users in database:");
        res.rows.forEach(row => {
            console.log(`Username: ${row.username}, Role: ${row.role}, Password Hash: ${row.password.substring(0, 20)}...`);
        });
    } catch (error) {
        console.error("Error checking users:", error);
    } finally {
        await pool.end();
    }
}

checkUsers();

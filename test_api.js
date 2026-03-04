const { Pool } = require('pg');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
require('dotenv').config();

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
}

async function resetAndTest() {
    let pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const hashedPassword = await hashPassword("adminpassword123");

    // reset password
    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
    await pool.end();

    // test APIs
    const loginRes = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "adminpassword123" })
    });
    const setCookie = loginRes.headers.get('set-cookie');
    console.log("Login Status:", loginRes.status);

    if (loginRes.status !== 200) return;

    const createRes = await fetch("http://localhost:5001/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cookie": setCookie },
        body: JSON.stringify({
            title: "Test Announcement",
            description: "Test description",
            category: "General",
            createdBy: "admin"
        })
    });
    const created = await createRes.json();
    console.log("Created ID:", created.id);

    if (!created.id) return;

    const editRes = await fetch(`http://localhost:5001/api/announcements/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Cookie": setCookie },
        body: JSON.stringify({ title: "Updated Title" })
    });
    console.log("Edit Status:", editRes.status);

    const delRes = await fetch(`http://localhost:5001/api/announcements/${created.id}`, {
        method: "DELETE",
        headers: { "Cookie": setCookie }
    });
    console.log("Delete Status:", delRes.status);
}

resetAndTest().catch(console.error);

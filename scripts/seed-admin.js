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

async function seedAdmin() {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in environment.");
        process.exit(1);
    }

    const tryConnect = async (url) => {
        const p = new Pool({ connectionString: url });
        try {
            await p.query('SELECT 1');
            return p;
        } catch (e) {
            await p.end();
            throw e;
        }
    };

    let pool;
    try {
        pool = await tryConnect(connectionString);
    } catch (e) {
        console.log("Failed with primary DATABASE_URL, trying without password...");
        try {
            const urlWithoutPassword = connectionString.replace(':postgres@', '@');
            pool = await tryConnect(urlWithoutPassword);
        } catch (e2) {
            console.error("All connection attempts failed.");
            process.exit(1);
        }
    }

    const username = "admin";
    const password = "adminpassword123";

    try {
        const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (res.rows.length > 0) {
            console.log("Admin user already exists.");
            return;
        }

        const hashedPassword = await hashPassword(password);
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            [username, hashedPassword, 'admin']
        );

        console.log("Admin user created successfully!");
        console.log("Username: " + username);
        console.log("Password: " + password);
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await pool.end();
        process.exit();
    }
}

seedAdmin();

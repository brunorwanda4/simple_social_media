// src/config/db.ts

import mysql, { Pool } from 'mysql2/promise';
import 'dotenv/config'; // Ensure dotenv is loaded here or in the entry file

// --- Database Pool Setup ---

/**
 * Creates and exports the database connection pool.
 */
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '', // Handle undefined password
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Optional: Add a connection test function
export const testDatabaseConnection = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
        return true;
    } catch (err) {
        console.error('!!! Database Connection Failed !!!', err);
        return false;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export default pool; // Export the pool for use in routes/services


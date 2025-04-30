// src/server.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config'; // Load environment variables first

import authRoutes from './routes/auth'; // Import authentication routes
import errorHandler from './middleware/error'; // Import error handling middleware
import { testDatabaseConnection } from './config/db'; // Import the database connection test

const app = express();
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT as string, 10) : 5001;

// --- Get JWT Secret ---
// Moved the check here as JWT_SECRET is used in utils/jwt.ts,
// but it's good practice to ensure it's loaded early.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1); // Exit the process if the secret is not set
}


// --- Middleware ---
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Routes ---
// Mount the authentication routes under the '/api' path
app.use('/api', authRoutes);

// --- Error Handling Middleware ---
// This should be the last middleware added
app.use(errorHandler);


// --- Server Start ---
app.listen(PORT, async () => {
    // Test database connection on server start
    await testDatabaseConnection();
    console.log(`Backend server running on http://localhost:${PORT}`);
});


// server.ts
import 'dotenv/config'; // Load environment variables from .env file using the newer import style
import express, { Request, Response, NextFunction, RequestHandler } from 'express'; // Import RequestHandler
import mysql, { Pool, RowDataPacket, OkPacket } from 'mysql2/promise'; // Using the promise wrapper for async/await with specific types
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT as string, 10) : 5001; // Ensure PORT is a number

// Define an interface for the expected structure of a user row from the database
// We use Optional properties (?) where the data might not always be selected (like password_hash)
// or is not intended to be returned to the client.
interface UserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash?: string; // Make optional as we don't typically select this
    created_at: Date;
}

// Define an interface for the signup request body
interface SignupRequestBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

// Define an interface for the shape of users we send back (excluding sensitive info)
interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
}


// --- Database Connection Pool ---
// Using a pool is more efficient than creating connections for each request
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string, 10) : 3306, // Ensure port is a number
    waitForConnections: true,
    connectionLimit: 10, // Adjust as needed
    queueLimit: 0
});

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

// --- API Routes ---

// POST /api/signup - Handle user registration
// Explicitly type the handler as RequestHandler to help TypeScript overload resolution
app.post('/api/signup', (async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // --- Basic Server-Side Validation ---
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Add more validation if needed (e.g., password strength, email format)

    try {
        // --- Check if email already exists ---
        // Specify UserRow[] as the expected type for the results
        const [existingUsers] = await pool.query<UserRow[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Email address is already registered.' }); // 409 Conflict
        }

        // --- Hash the password ---
        const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;
        if (isNaN(saltRounds)) {
             console.warn('BCRYPT_SALT_ROUNDS is not a valid number, using default 10.');
             // Fallback to default if parsing fails
             const passwordHash = await bcrypt.hash(password, 10);
        }
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // --- Insert new user into the database ---
        const insertQuery = 'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)';
        // Specify OkPacket as the expected type for the result of an INSERT
        const [result] = await pool.query<OkPacket>(insertQuery, [firstName, lastName, email, passwordHash]);

        console.log(`User created with ID: ${result.insertId}`);

        // --- Respond with success ---
        // Avoid sending back sensitive info like the hash
        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            userId: result.insertId // Optionally return the new user ID
        });

    } catch (error) {
        console.error('Signup Error:', error);
        // Generic error for the client, log specific error on the server
        res.status(500).json({ success: false, message: 'An error occurred during registration. Please try again.' });
    }
}) as RequestHandler); // Cast the async function to RequestHandler

// GET /api/users - Endpoint to display saved users (for demonstration)
// In a real app, this should be protected (e.g., require admin login)
// Explicitly type the handler as RequestHandler
app.get('/api/users', (async (req: Request, res: Response) => {
    try {
        // Select relevant fields, excluding the password hash
        // Specify UserRow[] as the expected type for the results
        const [users] = await pool.query<UserRow[]>('SELECT id, first_name, last_name, email, created_at FROM users ORDER BY created_at DESC');

        // Map to PublicUser[] to ensure password_hash is not included
        const publicUsers: PublicUser[] = users.map(user => ({
             id: user.id,
             first_name: user.first_name,
             last_name: user.last_name,
             email: user.email,
             created_at: user.created_at,
        }));

        res.status(200).json({ success: true, users: publicUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
}) as RequestHandler); // Cast the async function to RequestHandler


// --- Basic Error Handling Middleware ---
// Needs all four parameters and specific types to be recognized as error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, async () => {
    // Test DB connection on startup
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
        // connection.release(); // Release the connection back to the pool immediately after getting it
    } catch (err) {
        console.error('!!! Database Connection Failed !!!', err);
        // Optionally exit the process if DB connection is critical
        // process.exit(1);
    } finally {
        if (connection) {
            connection.release(); // Ensure connection is released even if test fails after getting it
        }
    }
    console.log(`Backend server running on http://localhost:${PORT}`);
});
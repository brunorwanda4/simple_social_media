// src/routes/auth.ts

import { Router, Request, Response, RequestHandler } from 'express';
import pool from '../config/db'; // Import the database pool
import { hashPassword, comparePassword } from '../utils/password'; // Import password utilities
import { generateToken } from '../utils/jwt'; // Import JWT utility
import { UserRow, SignupRequestBody, LoginRequestBody, PublicUser } from '../types'; // Import types
import { OkPacket } from 'mysql2/promise'; // Import OkPacket for insert results

const router = Router();

// Signup Route
router.post('/signup', (async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    try {
        const [existingUsers] = await pool.query<UserRow[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Email address is already registered.' });
        }

        const passwordHash = await hashPassword(password); // Use the utility function

        const insertQuery = 'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query<OkPacket>(insertQuery, [firstName, lastName, email, passwordHash]);

        console.log(`User created with ID: ${result.insertId}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during registration. Please try again.' });
    }
}) as RequestHandler);


// Login Route
router.post('/login', (async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const [users] = await pool.query<UserRow[]>('SELECT id, first_name, last_name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1', [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = users[0];
        const passwordMatch = await comparePassword(password, user.password_hash as string); // Use the utility function

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // --- Login Successful - Generate JWT ---
        console.log(`User logged in: ${user.email}`);

        const tokenPayload = {
            id: user.id,
            email: user.email,
        };

        const token = generateToken(tokenPayload); // Use the utility function

        const publicUser: PublicUser = { // Use the PublicUser interface
             id: user.id,
             first_name: user.first_name,
             last_name: user.last_name,
             email: user.email,
             created_at: user.created_at
        };

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token: token,
            user: publicUser
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login. Please try again.' });
    }
}) as RequestHandler);

// Get Users Route (Example of another route, could be in a separate users.ts)
router.get('/users', (async (req: Request, res: Response) => {
    try {
        const [users] = await pool.query<UserRow[]>('SELECT id, first_name, last_name, email, created_at FROM users ORDER BY created_at DESC');

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
}) as RequestHandler);


export default router; // Export the router


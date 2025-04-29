import 'dotenv/config';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import mysql, { Pool, RowDataPacket, OkPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT as string, 10) : 5001;
interface UserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash?: string;
    created_at: Date;
}

interface SignupRequestBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
}

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/signup', (async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // --- Basic Server-Side Validation ---
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }


    try {
        const [existingUsers] = await pool.query<UserRow[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Email address is already registered.' }); // 409 Conflict
        }

        const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;
        if (isNaN(saltRounds)) {
            console.warn('BCRYPT_SALT_ROUNDS is not a valid number, using default 10.');
            const passwordHash = await bcrypt.hash(password, 10);
        }
        const passwordHash = await bcrypt.hash(password, saltRounds);

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

app.get('/api/users', (async (req: Request, res: Response) => {
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('!!! Database Connection Failed !!!', err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
    console.log(`Backend server running on http://localhost:${PORT}`);
});
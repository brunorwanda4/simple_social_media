// src/utils/jwt.ts

import jwt, { SignOptions } from 'jsonwebtoken';
import 'dotenv/config'; // Ensure dotenv is loaded

// --- Get JWT Secret ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1); // Exit the process if the secret is not set
}

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param payload The data to include in the token payload (e.g., user ID, email).
 * @param options Options for signing the token (e.g., expiration time).
 * @returns The generated JWT string.
 */
export const generateToken = (payload: object, options?: SignOptions): string => {
    // Explicitly type tokenOptions using SignOptions if options are provided, otherwise use default
    const tokenOptions: SignOptions = options || { expiresIn: '24h' };
    return jwt.sign(payload, JWT_SECRET, tokenOptions);
};

// Optional: Add a function to verify a token
// export const verifyToken = (token: string): any => {
//     try {
//         return jwt.verify(token, JWT_SECRET);
//     } catch (error) {
//         return null; // Or throw an error
//     }
// };


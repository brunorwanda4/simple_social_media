// src/utils/password.ts

import bcrypt from 'bcryptjs';
import 'dotenv/config'; // Ensure dotenv is loaded

const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

/**
 * Hashes a plain text password.
 * @param password The plain text password to hash.
 * @returns The hashed password string.
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hash The hashed password.
 * @returns True if the password matches the hash, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};


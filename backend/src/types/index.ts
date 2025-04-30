// src/types/index.ts

import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { Request } from 'express';

// --- Type Interfaces ---

/**
 * Represents a row in the 'users' database table.
 */
export interface UserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash?: string; // password_hash is optional when fetching public data
    created_at: Date;
}

/**
 * Represents the expected request body for the signup endpoint.
 */
export interface SignupRequestBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/**
 * Represents the expected request body for the login endpoint.
 */
export interface LoginRequestBody {
    email?: string;
    password?: string;
}

/**
 * Represents the public user data returned by the API (without sensitive info like password hash).
 */
export interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
}

// You can add more interfaces here as your project grows
// For example, interfaces for other database tables or request/response bodies.


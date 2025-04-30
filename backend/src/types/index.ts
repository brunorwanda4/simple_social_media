import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { Request } from 'express';

export interface UserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash?: string; 
    created_at: Date;
}

export interface SignupRequestBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export interface LoginRequestBody {
    email?: string;
    password?: string;
}


export interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
}

export interface CategoryRow extends RowDataPacket {
    id: number;
    name: string;
    created_at: Date;
}

export interface CreateCategoryRequestBody {
    name?: string;
}

export interface UpdateCategoryRequestBody {
    name?: string;
}


// --- Product Interfaces ---

/**
 * Represents a row in the 'products' database table.
 */
export interface ProductRow extends RowDataPacket {
    id: number;
    name: string;
    category_id: number | null; // category_id can be null if ON DELETE SET NULL
    created_at: Date;
}

/**
 * Represents a product with its category name included (for READ operations).
 */
export interface ProductWithCategory extends ProductRow {
    category_name: string | null; // Add category_name for joins
}


/**
 * Represents the expected request body for creating a product.
 */
export interface CreateProductRequestBody {
    name?: string;
    categoryId?: number | null; // Allow null for no category
}

/**
 * Represents the expected request body for updating a product.
 */
export interface UpdateProductRequestBody {
    name?: string;
    categoryId?: number | null; // Allow null for no category
}

// Add more interfaces here as your project grows


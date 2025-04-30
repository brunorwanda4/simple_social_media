// src/controllers/productController.ts

import { Request, Response } from 'express';
import pool from '../config/db'; // Import the database pool
import { ProductRow, ProductWithCategory, CreateProductRequestBody, UpdateProductRequestBody, CategoryRow } from '../types'; // Import types
import { OkPacket, RowDataPacket } from 'mysql2/promise';

/**
 * Get all products, optionally with category name.
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        // Join with categories table to get category name
        const query = `
            SELECT
                p.id,
                p.name,
                p.category_id,
                p.created_at,
                c.name AS category_name
            FROM
                products p
            LEFT JOIN
                categories c ON p.category_id = c.id
            ORDER BY
                p.created_at DESC
        `;
        const [products] = await pool.query<ProductWithCategory[]>(query);

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
    }
};

/**
 * Get a single product by ID, with category name.
 */
export const getProductById = async (req: Request, res: Response) => {
    const productId = req.params.id;

    try {
        const query = `
            SELECT
                p.id,
                p.name,
                p.category_id,
                p.created_at,
                c.name AS category_name
            FROM
                products p
            LEFT JOIN
                categories c ON p.category_id = c.id
            WHERE
                p.id = ?
            LIMIT 1
        `;
        const [products] = await pool.query<ProductWithCategory[]>(query, [productId]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.status(200).json({ success: true, product: products[0] });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve product.' });
    }
};

/**
 * Create a new product.
 */
export const createProduct = async (req: Request<{}, {}, CreateProductRequestBody>, res: Response) => {
    const { name, categoryId } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    // Optional: Validate if categoryId exists if provided and not null
    if (categoryId !== undefined && categoryId !== null) {
        try {
            const [categories] = await pool.query<CategoryRow[]>('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
            if (categories.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid category ID provided.' });
            }
        } catch (error) {
             console.error('Error validating category ID:', error);
             return res.status(500).json({ success: false, message: 'An error occurred while validating the category.' });
        }
    }


    try {
        const insertQuery = 'INSERT INTO products (name, category_id) VALUES (?, ?)';
        const [result] = await pool.query<OkPacket>(insertQuery, [name, categoryId]);

        console.log(`Product created with ID: ${result.insertId}`);

        // Fetch the newly created product with category name to return it
         const [newProduct] = await pool.query<ProductWithCategory[]>(`
            SELECT
                p.id,
                p.name,
                p.category_id,
                p.created_at,
                c.name AS category_name
            FROM
                products p
            LEFT JOIN
                categories c ON p.category_id = c.id
            WHERE
                p.id = ?
            LIMIT 1
        `, [result.insertId]);


        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            product: newProduct[0] // Return the created product object
        });

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the product.' });
    }
};

/**
 * Update an existing product by ID.
 */
export const updateProduct = async (req: Request<{id: string}, {}, UpdateProductRequestBody>, res: Response) => {
    const productId = req.params.id;
    const { name, categoryId } = req.body;

    if (!name && categoryId === undefined) {
        return res.status(400).json({ success: false, message: 'At least product name or category ID must be provided for update.' });
    }

    // Optional: Validate if categoryId exists if provided and not null
     if (categoryId !== undefined && categoryId !== null) {
        try {
            const [categories] = await pool.query<CategoryRow[]>('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
            if (categories.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid category ID provided.' });
            }
        } catch (error) {
             console.error('Error validating category ID:', error);
             return res.status(500).json({ success: false, message: 'An error occurred while validating the category.' });
        }
    }


    try {
        // Build the update query dynamically based on provided fields
        const updates: string[] = [];
        const values: (string | number | null)[] = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (categoryId !== undefined) { // Allow updating to null
             updates.push('category_id = ?');
             values.push(categoryId);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
        }

        const updateQuery = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
        values.push(productId); // Add product ID to the end of values

        const [result] = await pool.query<OkPacket>(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or no changes made.' });
        }

        console.log(`Product updated with ID: ${productId}`);

        // Fetch the updated product with category name to return it
         const [updatedProduct] = await pool.query<ProductWithCategory[]>(`
            SELECT
                p.id,
                p.name,
                p.category_id,
                p.created_at,
                c.name AS category_name
            FROM
                products p
            LEFT JOIN
                categories c ON p.category_id = c.id
            WHERE
                p.id = ?
            LIMIT 1
        `, [productId]);


        res.status(200).json({
            success: true,
            message: 'Product updated successfully!',
            product: updatedProduct[0] // Return the updated product object
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the product.' });
    }
};

/**
 * Delete a product by ID.
 */
export const deleteProduct = async (req: Request<{id: string}>, res: Response) => {
    const productId = req.params.id;

    try {
        const deleteQuery = 'DELETE FROM products WHERE id = ?';
        const [result] = await pool.query<OkPacket>(deleteQuery, [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        console.log(`Product deleted with ID: ${productId}`);
        res.status(200).json({ success: true, message: 'Product deleted successfully!' });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the product.' });
    }
};


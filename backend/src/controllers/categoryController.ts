import { Request, Response } from 'express';
import pool from '../config/db'; // Import the database pool
import { CategoryRow, CreateCategoryRequestBody, UpdateCategoryRequestBody } from '../types'; // Import types
import { OkPacket, RowDataPacket } from 'mysql2/promise';

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const [categories] = await pool.query<CategoryRow[]>('SELECT id, name, created_at FROM categories ORDER BY name ASC');
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    const categoryId = req.params.id;

    try {
        const [categories] = await pool.query<CategoryRow[]>('SELECT id, name, created_at FROM categories WHERE id = ? LIMIT 1', [categoryId]);

        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, category: categories[0] });
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve category.' });
    }
};


export const createCategory = async (req: Request<{}, {}, CreateCategoryRequestBody>, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    try {
        const [existingCategories] = await pool.query<CategoryRow[]>('SELECT id FROM categories WHERE name = ?', [name]);
        if (existingCategories.length > 0) {
            return res.status(409).json({ success: false, message: 'Category name already exists.' });
        }

        const insertQuery = 'INSERT INTO categories (name) VALUES (?)';
        const [result] = await pool.query<OkPacket>(insertQuery, [name]);

        console.log(`Category created with ID: ${result.insertId}`);

        const [newCategory] = await pool.query<CategoryRow[]>('SELECT id, name, created_at FROM categories WHERE id = ? LIMIT 1', [result.insertId]);


        res.status(201).json({
            success: true,
            message: 'Category created successfully!',
            category: newCategory[0] 
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the category.' });
    }
};

export const updateCategory = async (req: Request<{id: string}, {}, UpdateCategoryRequestBody>, res: Response) => {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required for update.' });
    }

    try {
        const [existingCategories] = await pool.query<CategoryRow[]>('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
        if (existingCategories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        const [duplicateName] = await pool.query<CategoryRow[]>('SELECT id FROM categories WHERE name = ? AND id != ?', [name, categoryId]);
        if (duplicateName.length > 0) {
             return res.status(409).json({ success: false, message: 'Category name already exists.' });
        }


        const updateQuery = 'UPDATE categories SET name = ? WHERE id = ?';
        const [result] = await pool.query<OkPacket>(updateQuery, [name, categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found or no changes made.' });
        }

        console.log(`Category updated with ID: ${categoryId}`);

        // Fetch the updated category to return it
        const [updatedCategory] = await pool.query<CategoryRow[]>('SELECT id, name, created_at FROM categories WHERE id = ? LIMIT 1', [categoryId]);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully!',
            category: updatedCategory[0] // Return the updated category object
        });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the category.' });
    }
};

export const deleteCategory = async (req: Request<{id: string}>, res: Response) => {
    const categoryId = req.params.id;

    try {
        const deleteQuery = 'DELETE FROM categories WHERE id = ?';
        const [result] = await pool.query<OkPacket>(deleteQuery, [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        console.log(`Category deleted with ID: ${categoryId}`);
        res.status(200).json({ success: true, message: 'Category deleted successfully!' });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the category.' });
    }
};


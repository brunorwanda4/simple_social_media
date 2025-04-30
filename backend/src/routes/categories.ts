// src/routes/categories.ts

import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController'; // Import controller functions

const router = Router();

router.get('/', getAllCategories); 
router.get('/:id', getCategoryById); // GET /api/categories/:id
router.post('/', createCategory); // POST /api/categories
router.put('/:id', updateCategory); // PUT /api/categories/:id
router.delete('/:id', deleteCategory); // DELETE /api/categories/:id

export default router; // Export the router


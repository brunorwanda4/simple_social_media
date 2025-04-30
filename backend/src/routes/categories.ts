// src/routes/categories.ts

import { Router, RequestHandler } from 'express'; // Import RequestHandler
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController'; // Import controller functions
import { ParamsDictionary } from 'express-serve-static-core'; // Import ParamsDictionary if needed for other routes, but not strictly for these specific casts

const router = Router();

// Define routes and map them to controller functions
// Use RequestHandler generic to specify parameter types for routes with params
router.get('/', getAllCategories as RequestHandler); // GET /api/categories (no params)
router.get('/:id', getCategoryById as RequestHandler<{ id: string }>); // GET /api/categories/:id
router.post('/', createCategory as RequestHandler); // POST /api/categories (no params in URL)
router.put('/:id', updateCategory as RequestHandler<{ id: string }>); // PUT /api/categories/:id
router.delete('/:id', deleteCategory as RequestHandler<{ id: string }>); // DELETE /api/categories/:id

export default router; // Export the router


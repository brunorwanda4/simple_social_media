import { Router, RequestHandler } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts as RequestHandler); 
router.get('/:id', getProductById as RequestHandler<{ id: string }>); 
router.post('/', createProduct as RequestHandler); 
router.put('/:id', updateProduct as RequestHandler<{ id: string }>); 
router.delete('/:id', deleteProduct as RequestHandler<{ id: string }>); 

export default router; 


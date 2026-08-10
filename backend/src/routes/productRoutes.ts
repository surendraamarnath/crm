import { Router } from 'express';
import { body } from 'express-validator';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addStockMovement, getStockMovements } from '../controllers/productController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

const productRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('unit_price').isNumeric().withMessage('Unit price must be a number'),
];

const movementRules = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('movement_type').isIn(['IN', 'OUT']).withMessage('Type must be IN or OUT'),
];

router.get('/',           authenticate, authorize('Admin', 'Warehouse', 'Sales'), getProducts);
router.get('/movements',  authenticate, authorize('Admin', 'Warehouse'), getStockMovements);
router.get('/:id',        authenticate, authorize('Admin', 'Warehouse', 'Sales'), getProductById);
router.post('/',          authenticate, authorize('Admin', 'Warehouse'), productRules, validate, createProduct);
router.put('/:id',        authenticate, authorize('Admin', 'Warehouse'), productRules, validate, updateProduct);
router.delete('/:id',     authenticate, authorize('Admin'), deleteProduct);
router.post('/:id/stock', authenticate, authorize('Admin', 'Warehouse'), movementRules, validate, addStockMovement);

export default router;

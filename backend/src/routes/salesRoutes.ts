import { Router } from 'express';
import { body } from 'express-validator';
import { getSales, createSale } from '../controllers/salesController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();
const saleRules = [
  body('customer_id').isInt(),
  body('product_id').isInt(),
  body('quantity').isInt({ min: 1 }),
];

router.get('/', authenticate, authorize('Admin', 'Sales', 'Accounts'), getSales);
router.post('/', authenticate, authorize('Admin', 'Sales'), saleRules, validate, createSale);

export default router;

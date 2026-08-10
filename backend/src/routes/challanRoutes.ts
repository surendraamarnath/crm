import { Router } from 'express';
import { body } from 'express-validator';
import { getChallans, getChallanById, createChallan, updateChallanStatus } from '../controllers/challanController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/',     authenticate, authorize('Admin', 'Sales', 'Accounts'), getChallans);
router.get('/:id',  authenticate, authorize('Admin', 'Sales', 'Accounts'), getChallanById);

router.post('/',
  authenticate, authorize('Admin', 'Sales'),
  [
    body('customer_id').isInt().withMessage('Customer is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one product is required'),
    body('items.*.product_id').isInt().withMessage('Invalid product'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('status').isIn(['Draft', 'Confirmed']).withMessage('Invalid status'),
  ],
  validate,
  createChallan
);

router.patch('/:id/status',
  authenticate, authorize('Admin', 'Sales'),
  [body('status').isIn(['Draft', 'Confirmed', 'Cancelled']).withMessage('Invalid status')],
  validate,
  updateChallanStatus
);

export default router;

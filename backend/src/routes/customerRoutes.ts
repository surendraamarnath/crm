import { Router } from 'express';
import { body } from 'express-validator';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, addFollowup } from '../controllers/customerController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

const customerRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').notEmpty().withMessage('Mobile is required'),
  body('customer_type').isIn(['Retail', 'Wholesale', 'Distributor']),
  body('status').isIn(['Lead', 'Active', 'Inactive']),
  body('email').optional({ checkFalsy: true }).isEmail(),
];

router.get('/',     authenticate, authorize('Admin', 'Sales'), getCustomers);
router.get('/:id',  authenticate, authorize('Admin', 'Sales'), getCustomerById);
router.post('/',    authenticate, authorize('Admin', 'Sales'), customerRules, validate, createCustomer);
router.put('/:id',  authenticate, authorize('Admin', 'Sales'), customerRules, validate, updateCustomer);
router.delete('/:id', authenticate, authorize('Admin'), deleteCustomer);
router.post('/:id/followups', authenticate, authorize('Admin', 'Sales'), body('note').notEmpty(), validate, addFollowup);

export default router;

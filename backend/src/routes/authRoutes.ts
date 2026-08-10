import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup, getUsers, createUser, deleteUser } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Admin', 'Sales', 'Warehouse', 'Accounts']).withMessage('Invalid role'),
  ],
  validate,
  signup
);

// Admin-only user management
router.get('/users', authenticate, authorize('Admin'), getUsers);
router.post('/users',
  authenticate,
  authorize('Admin'),
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role').isIn(['Admin', 'Sales', 'Warehouse', 'Accounts'])],
  validate,
  createUser
);
router.delete('/users/:id', authenticate, authorize('Admin'), deleteUser);

export default router;

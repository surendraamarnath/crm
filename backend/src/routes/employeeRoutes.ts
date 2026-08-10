import { Router } from 'express';
import { body } from 'express-validator';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();
const employeeRules = [body('name').notEmpty(), body('email').isEmail(), body('salary').isNumeric()];

router.get('/', authenticate, authorize('Admin', 'Accounts'), getEmployees);
router.post('/', authenticate, authorize('Admin'), employeeRules, validate, createEmployee);
router.put('/:id', authenticate, authorize('Admin'), employeeRules, validate, updateEmployee);
router.delete('/:id', authenticate, authorize('Admin'), deleteEmployee);

export default router;

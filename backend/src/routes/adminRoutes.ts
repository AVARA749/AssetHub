import { Router } from 'express';
import {
    adminLogin,
    adminRegister,
    getAdminStatus,
    getDashboardStats,
    getAdminProperties,
    getAdminPayments,
    seedAdmin,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../utils/validators';

const router = Router();

// Public (seed, login & register)
router.get('/status', getAdminStatus);
router.post('/seed', seedAdmin);
router.post('/login', validate(loginSchema), adminLogin);
router.post('/register', validate(registerSchema), adminRegister);

// Protected admin routes
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/properties', authenticate, requireAdmin, getAdminProperties);
router.get('/payments', authenticate, requireAdmin, getAdminPayments);

export default router;

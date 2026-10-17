import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { validate } from '../middleware/validateMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { RegisterUserSchema, LoginUserSchema } from '../schemas/validationSchemas';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(RegisterUserSchema), register);

// POST /api/auth/login
router.post('/login', validate(LoginUserSchema), login);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

export default router;

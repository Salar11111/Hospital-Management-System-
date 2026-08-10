import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', auth, me);

export default router;
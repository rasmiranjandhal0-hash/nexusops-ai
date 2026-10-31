import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginCustomer,
  registerCustomer,
  getCurrentCustomer,
  forgotPassword,
} from '../controllers/authController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limiter on authentication endpoints (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per IP
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, loginCustomer);
router.post('/register', authLimiter, registerCustomer);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/me', optionalAuth, getCurrentCustomer);

export default router;

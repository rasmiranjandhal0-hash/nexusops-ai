import express from 'express';
import {
  loginCustomer,
  registerCustomer,
  getCurrentCustomer,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginCustomer);
router.post('/register', registerCustomer);
router.get('/me', getCurrentCustomer);

export default router;


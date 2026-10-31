import jwt from 'jsonwebtoken';
import storageService from '../services/storageService.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const customer = storageService.findCustomer(normalizedEmail);

    if (!customer) {
      // Auto-register demo account or first-time customer if demo password provided
      if (normalizedEmail.includes('demo') || password === 'DemoPass123!') {
        const newCustomer = storageService.registerCustomer(
          normalizedEmail,
          normalizedEmail.split('@')[0],
          password
        );
        const token = jwt.sign(
          {
            id: newCustomer.id,
            email: newCustomer.email,
            role: newCustomer.role,
            name: newCustomer.name,
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.status(200).json({
          success: true,
          token,
          customer: {
            id: newCustomer.id,
            email: newCustomer.email,
            name: newCustomer.name,
            role: newCustomer.role,
          },
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials: user account not found.',
      });
    }

    // Verify password with bcrypt
    const isMatch = storageService.verifyPassword(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials: incorrect password provided.',
      });
    }

    // Sign cryptographic JWT
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        role: customer.role || 'user',
        name: customer.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    storageService.logAudit(customer.id, 'USER_LOGIN_SUCCESS', customer.id, {
      role: customer.role,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: customer.role || 'user',
        organization: customer.organization,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerCustomer(req, res, next) {
  try {
    const { email, name, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters in length.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = storageService.findCustomer(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this email address already exists.',
      });
    }

    const customer = storageService.registerCustomer(
      normalizedEmail,
      name || normalizedEmail.split('@')[0],
      password,
      'user'
    );

    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        role: customer.role,
        name: customer.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: customer.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentCustomer(req, res, next) {
  try {
    // If authenticated via middleware, prefer req.user
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const customer = storageService.findCustomer(customerId);

    if (!customer) {
      return res.status(200).json({
        customer: {
          id: customerId,
          email: customerId,
          name: customerId.split('@')[0],
          role: 'visitor',
        },
      });
    }

    return res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: customer.role || 'user',
        organization: customer.organization,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  // Audit log recovery trigger
  storageService.logAudit(email, 'PASSWORD_RESET_REQUESTED', email, {});
  return res.status(200).json({
    success: true,
    message: 'If the provided email corresponds to an active account, password recovery instructions have been dispatched.',
  });
}

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusops_enterprise_security_jwt_secret_key_2026';

/**
 * Validates incoming Bearer JWT and injects authenticated user into req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required: missing or malformed Bearer token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // Also harmonize customerId header if absent
    if (!req.headers['x-customer-id'] && decoded.email) {
      req.headers['x-customer-id'] = decoded.email.toLowerCase();
    }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session expired: please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(403).json({
      error: 'Invalid authentication token: signature verification failed.',
      code: 'TOKEN_INVALID',
    });
  }
}

/**
 * Optional authentication middleware for public endpoints with personalized options
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if (!req.headers['x-customer-id'] && decoded.email) {
        req.headers['x-customer-id'] = decoded.email.toLowerCase();
      }
    } catch {
      // Ignored for optional auth
    }
  }
  return next();
}

/**
 * Enforces Role-Based Access Control (RBAC)
 */
export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role !== allowedRole && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Access denied: this operation requires ${allowedRole} privileges.`,
      });
    }
    return next();
  };
}

export const requireAdmin = requireRole('admin');
export { JWT_SECRET };

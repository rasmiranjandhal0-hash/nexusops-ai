import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/store.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexusops_enterprise_secret_super_secure_key_2026_change_in_production';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed authorization token',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Bearer token is empty',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: `Unauthorized: Token verification failed (${jwtErr.message})`,
      });
    }

    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account not found or has been revoked',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Authentication internal error: ${err.message}`,
    });
  }
}

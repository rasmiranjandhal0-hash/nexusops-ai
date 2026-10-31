import express from 'express';
import db from '../db/store.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/dashboard/summary
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await db.getDashboardSummary(req.user.id);
    return res.json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

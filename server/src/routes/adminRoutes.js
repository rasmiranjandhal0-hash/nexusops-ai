import express from 'express';
import storageService from '../services/storageService.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: Authenticate and require admin privileges for all routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = storageService.getAllUsers();
  return res.status(200).json({
    success: true,
    users,
    total: users.length,
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => {
  const logs = storageService.getAuditLogs(null, true);
  return res.status(200).json({
    success: true,
    logs,
    total: logs.length,
  });
});

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const users = storageService.getAllUsers();
  const allScans = storageService.memoryStore.scans || [];
  const allVerifications = storageService.memoryStore.verifications || [];
  const allDatasets = storageService.memoryStore.datasets || [];

  return res.status(200).json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalScans: allScans.length,
      totalVerifications: allVerifications.length,
      totalDatasets: allDatasets.length,
      criticalDetections: allScans.filter((s) => s.risk === 'Critical').length + allVerifications.filter((v) => v.riskLevel === 'CRITICAL').length,
      systemStatus: 'OPERATIONAL_DEFENSE_ACTIVE',
    },
  });
});

export default router;

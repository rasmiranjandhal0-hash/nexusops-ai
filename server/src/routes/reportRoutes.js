import express from 'express';
import storageService from '../services/storageService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Notifications ---
router.get('/notifications', optionalAuth, (req, res) => {
  const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
  const notifications = storageService.getNotifications(customerId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
});

router.post('/notifications/:id/read', optionalAuth, (req, res) => {
  const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
  const { id } = req.params;
  const updated = storageService.markNotificationRead(customerId, id);
  return res.status(200).json({ success: true, notification: updated });
});

// --- Report Export (CSV / JSON summary) ---
router.post('/reports/export', optionalAuth, (req, res) => {
  const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
  const { format = 'csv', type = 'all' } = req.body;

  const scans = storageService.getCustomerHistory(customerId);
  const verifications = storageService.getVerifications(customerId);
  const datasets = storageService.getCustomerDatasets(customerId);

  if (format === 'csv') {
    let csv = 'ID,Type,Target/Title,Risk Level,Score,Timestamp,Status\n';
    scans.forEach((s) => {
      csv += `"${s.id}","Privacy Scan","${(s.title || '').replace(/"/g, '""')}","${s.risk}","${s.score}","${s.timestamp}","${s.status}"\n`;
    });
    verifications.forEach((v) => {
      csv += `"${v.id}","${v.type} Verification","${(v.target || '').replace(/"/g, '""')}","${v.riskLevel}","${v.riskScore}","${v.timestamp}","Verified"\n`;
    });
    datasets.forEach((d) => {
      csv += `"${d.id}","Dataset Upload","${(d.filename || '').replace(/"/g, '""')}","${d.riskLevel}","${d.dataQualityScore}","${d.createdAt}","${d.isPublished ? 'Published' : 'Private'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=nexusops_audit_report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  }

  // Structured JSON export
  return res.status(200).json({
    success: true,
    reportId: `RPT-${Date.now()}`,
    customerId,
    exportedAt: new Date().toISOString(),
    summary: {
      totalScans: scans.length,
      totalVerifications: verifications.length,
      totalDatasets: datasets.length,
    },
    scans,
    verifications,
    datasets,
  });
});

export default router;

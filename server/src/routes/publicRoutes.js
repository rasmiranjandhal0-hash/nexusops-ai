import express from 'express';
import storageService from '../services/storageService.js';

const router = express.Router();

/**
 * Public Verification Endpoint - Accessible without credentials
 * Only exposes sanitized metadata (type, target preview, riskLevel, timestamp)
 */
router.get('/verify/:id', (req, res) => {
  const { id } = req.params;
  const verification = storageService.getVerificationById(id);

  if (verification) {
    return res.status(200).json({
      success: true,
      verification: {
        id: verification.id,
        type: verification.type,
        targetPreview: verification.target
          ? verification.target.slice(0, 4) + '***' + verification.target.slice(-3)
          : 'Redacted',
        riskLevel: verification.riskLevel,
        riskScore: verification.riskScore,
        confidenceScore: verification.confidenceScore,
        detectedIndicators: verification.detectedIndicators,
        evidenceSource: verification.evidenceSource,
        timestamp: verification.timestamp,
        status: 'AUTHENTICATED_RECORD',
        disclaimer: 'This public verification certificate affirms an automated threat assessment conducted on the timestamp indicated.',
      },
    });
  }

  // Check if it's a scan ID
  const allScans = Object.values(storageService.memoryStore.scans);
  const scan = allScans.find((s) => s.id === id);
  if (scan) {
    return res.status(200).json({
      success: true,
      verification: {
        id: scan.id,
        type: 'PRIVACY_SCAN',
        targetPreview: scan.title,
        riskLevel: scan.risk,
        riskScore: scan.score,
        detectedCount: scan.detectedCount,
        categories: scan.categories,
        timestamp: scan.timestamp,
        status: scan.status,
        disclaimer: 'Zero-persistence privacy audit certificate.',
      },
    });
  }

  return res.status(404).json({
    success: false,
    error: 'Verification record not found or certificate has expired.',
  });
});

/**
 * Public Published Datasets
 */
router.get('/datasets', (req, res) => {
  const published = storageService.getPublishedDatasets();
  const sanitized = published.map((d) => ({
    id: d.id,
    filename: d.filename,
    rowCount: d.rowCount,
    columnCount: d.columnCount,
    columns: d.columns,
    dataQualityScore: d.dataQualityScore,
    riskLevel: d.riskLevel,
    publishedAt: d.publishedAt,
  }));

  return res.status(200).json({
    success: true,
    datasets: sanitized,
    total: sanitized.length,
  });
});

export default router;

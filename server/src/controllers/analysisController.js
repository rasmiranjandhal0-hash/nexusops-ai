import { analyzePrivacyText } from '../services/privacyAnalysisService.js';
import storageService from '../services/storageService.js';

function deriveScanTitle(trimmedText, analysis, customTitle) {
  if (customTitle && customTitle.trim()) {
    return customTitle.trim();
  }

  // Derive contextual title based on detected categories
  if (analysis.findings && analysis.findings.length > 0) {
    const primary = analysis.findings[0].category;
    if (primary.includes('Aadhaar')) return 'Indian Identity & National ID Inspection';
    if (primary.includes('Payment') || primary.includes('Card')) return 'PCI-DSS Financial Data Inspection';
    if (primary.includes('Phishing') || primary.includes('Urgent')) return 'Social Engineering & Threat Inspection';
    if (primary.includes('Secret') || primary.includes('Credential')) return 'Cloud Secrets & Token Exposure Audit';
    return `${primary} Assessment`;
  }

  // Fallback to first sanitized words
  const words = trimmedText.split(/\s+/).slice(0, 5).join(' ');
  return words ? `Document Scan: ${words.slice(0, 36)}...` : 'Routine Privacy Inspection';
}

export async function analyzeTextController(req, res, next) {
  try {
    const { text, title, customerId: bodyCustomerId } = req.body;

    // Strict validation without logging sensitive text
    if (text === undefined || text === null || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid payload: "text" field must be a valid string.',
      });
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({
        error: 'Invalid payload: "text" cannot be empty.',
      });
    }

    if (trimmed.length > 50000) {
      return res.status(413).json({
        error: 'Payload too large: maximum allowable text size is 50,000 characters.',
      });
    }

    // Resolve Customer ID
    const customerId = (
      req.headers['x-customer-id'] ||
      bodyCustomerId ||
      'demo@privacyguard.ai'
    ).trim().toLowerCase();

    // Execute zero-persistence privacy inspection
    const analysis = analyzePrivacyText(trimmed);

    // Format risk classification
    let riskLabel = 'Low';
    let statusLabel = 'Clean';
    if (analysis.riskLevel === 'CRITICAL') {
      riskLabel = 'Critical';
      statusLabel = 'Quarantined';
    } else if (analysis.riskLevel === 'HIGH') {
      riskLabel = 'High';
      statusLabel = 'Flagged';
    } else if (analysis.riskLevel === 'MEDIUM') {
      riskLabel = 'Moderate';
      statusLabel = 'Reviewed';
    }

    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(now);

    const scanRecord = {
      id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId,
      title: deriveScanTitle(trimmed, analysis, title),
      dateFormatted,
      timestamp: now.toISOString(),
      risk: riskLabel,
      score: analysis.riskScore,
      detectedCount: analysis.findings.length,
      categories: analysis.findings.map((f) => f.category),
      status: statusLabel,
      explanation: analysis.explanation,
      recommendedActions: analysis.recommendedActions,
      findings: analysis.findings,
      disclaimer: analysis.disclaimer,
    };

    // Store in customer's personal audit trail (zero raw text storage)
    storageService.saveScan(customerId, scanRecord);

    return res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      scanRecord,
      ...analysis,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCustomerHistoryController(req, res, next) {
  try {
    const customerId = (
      req.headers['x-customer-id'] ||
      req.query.customerId ||
      'demo@privacyguard.ai'
    ).trim().toLowerCase();

    const history = storageService.getCustomerHistory(customerId);

    return res.status(200).json({
      success: true,
      customerId,
      history,
      total: history.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCustomerStatsController(req, res, next) {
  try {
    const customerId = (
      req.headers['x-customer-id'] ||
      req.query.customerId ||
      'demo@privacyguard.ai'
    ).trim().toLowerCase();

    const stats = storageService.getCustomerStats(customerId);

    return res.status(200).json({
      success: true,
      customerId,
      stats,
    });
  } catch (error) {
    return next(error);
  }
}

export async function clearCustomerHistoryController(req, res, next) {
  try {
    const customerId = (
      req.headers['x-customer-id'] ||
      req.body.customerId ||
      'demo@privacyguard.ai'
    ).trim().toLowerCase();

    const result = storageService.clearCustomerHistory(customerId);

    return res.status(200).json({
      success: true,
      customerId,
      message: 'Personal scan history cleared successfully.',
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCustomerScanController(req, res, next) {
  try {
    const customerId = (
      req.headers['x-customer-id'] ||
      req.query.customerId ||
      'demo@privacyguard.ai'
    ).trim().toLowerCase();

    const scanId = req.params.id;
    const result = storageService.deleteScan(customerId, scanId);

    return res.status(200).json({
      success: true,
      customerId,
      scanId,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

import { verifyUrlSecurity } from '../services/urlVerificationService.js';
import { verifyEmailSecurity } from '../services/emailVerificationService.js';
import { verifyPhoneSecurity } from '../services/phoneVerificationService.js';
import { processDatasetFile } from '../services/fileProcessingService.js';
import storageService from '../services/storageService.js';

export async function verifyUrlController(req, res, next) {
  try {
    const { url } = req.body;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL string is required.' });
    }

    const result = await verifyUrlSecurity(url.trim());
    storageService.saveVerification(customerId, result);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyEmailController(req, res, next) {
  try {
    const { email } = req.body;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email string is required.' });
    }

    const result = await verifyEmailSecurity(email.trim());
    storageService.saveVerification(customerId, result);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyPhoneController(req, res, next) {
  try {
    const { phone } = req.body;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Valid phone string is required.' });
    }

    const result = verifyPhoneSecurity(phone.trim());
    storageService.saveVerification(customerId, result);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function uploadDatasetController(req, res, next) {
  try {
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const file = req.file;
    const { textContent, filename: bodyFilename } = req.body;

    if (!file && (!textContent || textContent.trim().length === 0)) {
      return res.status(400).json({
        error: 'Please upload a file (.csv, .json, .txt) or submit raw textContent.',
      });
    }

    const filename = file ? file.originalname : bodyFilename || 'dataset_upload.csv';
    const mimeType = file ? file.mimetype : 'text/csv';
    const buffer = file ? file.buffer : null;

    const result = processDatasetFile({
      filename,
      mimeType,
      buffer,
      textContent,
    });

    // Persist dataset metadata
    const dataset = storageService.saveDataset(customerId, {
      ...result.datasetMetadata,
      columnStats: result.columnStats,
      validationErrorsCount: result.validationErrors.length,
    });

    // Persist records
    storageService.saveDatasetRecords(dataset.id, result.processedRecords);

    return res.status(201).json({
      success: true,
      dataset,
      validationReport: {
        totalRows: result.datasetMetadata.rowCount,
        validRows: result.datasetMetadata.validRowCount,
        flaggedRows: result.datasetMetadata.invalidRowCount,
        dataQualityScore: result.datasetMetadata.dataQualityScore,
        riskLevel: result.datasetMetadata.riskLevel,
        errors: result.validationErrors.slice(0, 100),
      },
      previewRecords: result.processedRecords.slice(0, 20),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCustomerVerificationsController(req, res, next) {
  try {
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const { type } = req.query;
    const verifications = storageService.getVerifications(customerId, type);

    return res.status(200).json({
      success: true,
      customerId,
      verifications,
      total: verifications.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDatasetsController(req, res, next) {
  try {
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const datasets = storageService.getCustomerDatasets(customerId);

    return res.status(200).json({
      success: true,
      customerId,
      datasets,
      total: datasets.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDatasetDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';
    const dataset = storageService.getDatasetById(id);

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }

    // Tenant check: must be owner or dataset must be published
    if (dataset.customerId !== customerId && !dataset.isPublished) {
      return res.status(403).json({ error: 'Access denied: private dataset.' });
    }

    const records = storageService.getDatasetRecords(id);

    return res.status(200).json({
      success: true,
      dataset,
      records: records.slice(0, 100),
      totalRecords: records.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function togglePublishDatasetController(req, res, next) {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';

    const updated = storageService.toggleDatasetPublication(customerId, id, isPublished);
    if (!updated) {
      return res.status(404).json({ error: 'Dataset not found or unauthorized.' });
    }

    return res.status(200).json({
      success: true,
      dataset: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDatasetController(req, res, next) {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.headers['x-customer-id'] || 'demo@privacyguard.ai';

    storageService.deleteDataset(customerId, id);
    return res.status(200).json({
      success: true,
      message: 'Dataset and associated records purged.',
    });
  } catch (error) {
    return next(error);
  }
}

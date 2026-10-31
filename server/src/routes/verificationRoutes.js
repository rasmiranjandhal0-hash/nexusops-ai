import express from 'express';
import multer from 'multer';
import {
  verifyUrlController,
  verifyEmailController,
  verifyPhoneController,
  uploadDatasetController,
  getCustomerVerificationsController,
  getDatasetsController,
  getDatasetDetailsController,
  togglePublishDatasetController,
  deleteDatasetController,
} from '../controllers/verificationController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Verification Endpoints
router.post('/url', optionalAuth, verifyUrlController);
router.post('/email', optionalAuth, verifyEmailController);
router.post('/phone', optionalAuth, verifyPhoneController);
router.post('/file', optionalAuth, upload.single('file'), uploadDatasetController);
router.get('/history', optionalAuth, getCustomerVerificationsController);

// Dataset Endpoints
router.get('/datasets', optionalAuth, getDatasetsController);
router.get('/datasets/:id', optionalAuth, getDatasetDetailsController);
router.post('/datasets/:id/publish', optionalAuth, togglePublishDatasetController);
router.delete('/datasets/:id', optionalAuth, deleteDatasetController);

export default router;

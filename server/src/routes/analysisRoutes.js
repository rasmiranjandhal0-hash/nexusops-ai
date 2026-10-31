import express from 'express';
import {
  analyzeTextController,
  getCustomerHistoryController,
  getCustomerStatsController,
  clearCustomerHistoryController,
  deleteCustomerScanController,
} from '../controllers/analysisController.js';

const router = express.Router();

// Analysis
router.post('/analyze', analyzeTextController);

// Customer-wise history ledger
router.get('/history', getCustomerHistoryController);
router.delete('/history/:id', deleteCustomerScanController);
router.post('/history/clear', clearCustomerHistoryController);

// Customer-wise stats
router.get('/stats', getCustomerStatsController);

export default router;

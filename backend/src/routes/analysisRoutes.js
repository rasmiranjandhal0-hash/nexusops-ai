import express from 'express';
import { analyzeTextController } from '../controllers/analysisController.js';

const router = express.Router();

// POST /api/analyze
router.post('/analyze', analyzeTextController);

export default router;


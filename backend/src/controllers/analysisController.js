import { analyzePrivacyText } from '../services/privacyAnalysisService.js';

export async function analyzeTextController(req, res, next) {
  try {
    const { text } = req.body;

    // Strict validation without logging the text
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

    // Execute zero-persistence privacy inspection
    const analysis = analyzePrivacyText(trimmed);

    // Return sanitized assessment - NEVER include original input text
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...analysis,
    });
  } catch (error) {
    return next(error);
  }
}

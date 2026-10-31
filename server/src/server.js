import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysisRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for hackathon local dev
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'PRIVACYGUARD AI - Privacy & Sensitive Data Analysis API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: ['POST /api/analyze', 'GET /api/health'],
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'PRIVACYGUARD AI Backend',
    zeroPersistence: true,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api', analysisRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[PRIVACYGUARD AI] Backend server running securely on port ${PORT}`);
});

export default app;


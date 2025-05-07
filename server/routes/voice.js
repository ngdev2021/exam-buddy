import express from 'express';
import transcribeRouter from './voice/transcribe.js';
import generateRouter from './voice/generate.js';
import logRouter from './voice/log.js';

const router = express.Router();

// Basic health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'voice-api' });
});

// Mount sub-routers
router.use('/transcribe', transcribeRouter);
router.use('/generate', generateRouter);
router.use('/log', logRouter);

export default router;

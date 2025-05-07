import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import llamaOmniService from '../../services/llamaOmniService.js';

const router = express.Router();

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * POST /api/voice/generate
 * Generate speech from text using LLaMA-Omni2
 */
router.post('/', (req, res, next) => {
  // Check for development mode and mock auth header
  const isMockAuth = req.headers['x-mock-auth'] === 'true' || 
                    (isDevelopment && (req.query.mockAuth === 'true' || req.body.mockAuth === true));
  
  if (isMockAuth) {
    // Skip authentication for mock auth
    console.log('[MOCK AUTH] Bypassing authentication for voice generation');
    req.user = { userId: 'mock-user-id' };
    next();
  } else {
    // Use regular authentication
    authenticateToken(req, res, next);
  }
}, async (req, res) => {
  try {
    const { text, voiceStyle } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Check cache first
    const cachedResponse = await llamaOmniService.checkVoiceCache(text, voiceStyle);
    if (cachedResponse) {
      return res.json({ audioUrl: cachedResponse.url });
    }
    
    // Generate speech
    const { fileName, url } = await llamaOmniService.generateSpeech(text, {
      voiceStyle: voiceStyle || 'default'
    });
    
    // Cache the response for future use
    await llamaOmniService.cacheVoiceResponse(text, voiceStyle, fileName);
    
    res.json({ audioUrl: url });
  } catch (error) {
    console.error('Error in generate speech endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

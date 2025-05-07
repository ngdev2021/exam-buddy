import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import VoiceInteraction from '../../models/VoiceInteraction.js';

const router = express.Router();

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * POST /api/voice/log
 * Log a voice interaction for analytics and improvement
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      interactionType,
      userInput,
      systemResponse,
      culturalVocabularyMode,
      culturalVocabularyType,
      isCorrect,
      processingTime,
      metadata
    } = req.body;
    
    if (!interactionType) {
      return res.status(400).json({ error: 'Interaction type is required' });
    }
    
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    // Create a new voice interaction log
    const interaction = await VoiceInteraction.create({
      userId,
      interactionType,
      userInput,
      systemResponse,
      culturalVocabularyMode: culturalVocabularyMode || false,
      culturalVocabularyType: culturalVocabularyType || 'standard',
      isCorrect,
      processingTime,
      metadata: metadata || {}
    });
    
    res.status(201).json({
      success: true,
      interactionId: interaction.id
    });
  } catch (error) {
    console.error('Error logging voice interaction:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/voice/log/stats
 * Get statistics about voice interactions for the current user
 */
router.get('/stats', (req, res, next) => {
  // Check for development mode and mock auth header
  const isMockAuth = req.headers['x-mock-auth'] === 'true' || 
                    (isDevelopment && req.query.mockAuth === 'true');
  
  if (isMockAuth) {
    // Skip authentication for mock auth
    console.log('[MOCK AUTH] Bypassing authentication for voice stats');
    req.user = { userId: 'mock-user-id' };
    next();
  } else {
    // Use regular authentication
    authenticateToken(req, res, next);
  }
}, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    // Get all interactions for this user
    const interactions = await VoiceInteraction.findAll({
      where: { userId },
      attributes: [
        'interactionType', 
        'isCorrect', 
        'culturalVocabularyMode',
        'culturalVocabularyType',
        'createdAt'
      ]
    });
    
    // Calculate statistics
    const stats = {
      totalInteractions: interactions.length,
      byType: {},
      byCulturalMode: {
        standard: 0,
        aave: 0,
        southern: 0,
        latino: 0,
        caribbean: 0
      },
      correctRate: 0,
      recentActivity: []
    };
    
    // Process interactions
    let correctCount = 0;
    let totalWithCorrectness = 0;
    
    interactions.forEach(interaction => {
      // Count by type
      const type = interaction.interactionType;
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
      
      // Count by cultural mode
      if (interaction.culturalVocabularyMode && interaction.culturalVocabularyType) {
        stats.byCulturalMode[interaction.culturalVocabularyType]++;
      } else {
        stats.byCulturalMode.standard++;
      }
      
      // Calculate correct rate
      if (interaction.isCorrect !== null) {
        totalWithCorrectness++;
        if (interaction.isCorrect) {
          correctCount++;
        }
      }
      
      // Add to recent activity (last 10)
      if (stats.recentActivity.length < 10) {
        stats.recentActivity.push({
          type: interaction.interactionType,
          correct: interaction.isCorrect,
          date: interaction.createdAt
        });
      }
    });
    
    // Calculate overall correct rate
    if (totalWithCorrectness > 0) {
      stats.correctRate = Math.round((correctCount / totalWithCorrectness) * 100);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting voice interaction stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

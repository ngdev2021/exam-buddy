import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import audioProcessingService from '../../services/audioProcessingService.js';

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

/**
 * POST /api/voice/transcribe
 * Transcribe audio to text using Whisper API
 */
router.post('/', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;
    const fileName = `${Date.now()}_${req.file.originalname}`;
    
    // Optional parameters
    const options = {
      language: req.body.language || 'en',
      prompt: req.body.prompt || ''
    };

    // Transcribe the audio
    const transcription = await audioProcessingService.transcribeAudio(
      audioBuffer,
      fileName,
      options
    );

    res.json({ transcription });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/transcribe/chunks
 * Process chunked audio for streaming transcription
 */
router.post('/chunks', authenticateToken, upload.array('chunks', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No audio chunks provided' });
    }

    // Extract audio buffers from files
    const chunks = req.files.map(file => file.buffer);
    
    // Optional parameters
    const options = {
      language: req.body.language || 'en',
      prompt: req.body.prompt || ''
    };

    // Process the audio chunks
    const transcription = await audioProcessingService.processAudioChunks(chunks, options);

    res.json({ transcription });
  } catch (error) {
    console.error('Error in transcribe chunks endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

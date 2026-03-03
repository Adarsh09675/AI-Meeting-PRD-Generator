import { Request, Response, Router } from 'express';
import Transcript from '../models/Transcript';
import multer from 'multer';
import { transcribeAudio } from '../services/transcriptionService';
import fs from 'fs/promises';

const upload = multer({ dest: 'uploads/' });

export const uploadTranscript = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No transcript text provided' });

    const doc = await Transcript.create({ originalText: text });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save transcript' });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  let tempPath = '';
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided' });

    console.log(`[Video] Received file: ${req.file.originalname}`);
    const originalExtension = req.file.originalname.split('.').pop();
    tempPath = `${req.file.path}.${originalExtension}`;

    // Rename file to include extension (Groq/Whisper often requires this)
    await fs.rename(req.file.path, tempPath);

    // Call the real transcription service
    const transcribedText = await transcribeAudio(tempPath);

    const doc = await Transcript.create({
      originalText: transcribedText,
      metadata: { source: 'video', filename: req.file.originalname }
    });

    res.status(201).json(doc);
  } catch (err: any) {
    console.error('Video processing failed:', err);
    res.status(500).json({ error: 'Failed to process video', details: err.message });
  } finally {
    // Clean up temporary files
    if (tempPath) {
      try {
        await fs.access(tempPath);
        await fs.unlink(tempPath);
      } catch { }
    }
    if (req.file && req.file.path) {
      try {
        await fs.access(req.file.path);
        await fs.unlink(req.file.path);
      } catch { }
    }
  }
};

const router = Router();
router.post('/', uploadTranscript);
router.post('/video', upload.single('video'), uploadVideo);

export default router;

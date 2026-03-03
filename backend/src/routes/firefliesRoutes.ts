import { Router } from 'express';
import { getMeetings, importMeeting, getTranscription } from '../controllers/firefliesController';

const router = Router();

router.get('/meetings', getMeetings);
router.post('/import', importMeeting);
router.get('/transcription/:id', getTranscription);

export default router;

import { Request, Response } from 'express';
import { fetchRecentTranscripts, fetchTranscriptDetails } from '../services/firefliesService';
import Transcript from '../models/Transcript';

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const meetings = await fetchRecentTranscripts();
        res.json(meetings);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch meetings from Fireflies', details: err.message });
    }
};

export const importMeeting = async (req: Request, res: Response) => {
    try {
        const { firefliesId } = req.body;
        if (!firefliesId) return res.status(400).json({ error: 'Missing firefliesId' });

        console.log(`[Fireflies] Importing meeting: ${firefliesId}`);
        const text = await fetchTranscriptDetails(firefliesId);

        if (!text) {
            return res.status(404).json({ error: 'Transcript content not found in Fireflies' });
        }

        const doc = await Transcript.create({
            originalText: text,
            metadata: { source: 'fireflies', firefliesId }
        });

        console.log(`[Fireflies] Successfully imported as transcriptId: ${doc._id}`);
        res.status(201).json(doc);
    } catch (err: any) {
        console.error('[Fireflies] Import failed:', err.message);
        res.status(500).json({ error: 'Failed to import meeting', details: err.message });
    }
};

export const getTranscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const text = await fetchTranscriptDetails(id);
        if (!text) return res.status(404).json({ error: 'Transcript not found' });
        res.json({ text });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch transcription', details: err.message });
    }
};

import { Request, Response } from 'express';
import PRD from '../models/PRD';
import Transcript from '../models/Transcript';
import Chunk from '../models/Chunk';
import { chunkText } from '../services/chunkService';
import { createEmbeddings } from '../services/embedService';
import { upsertVectors } from '../services/pineconeService';
import { generatePRD } from '../services/prdService';

export const createPRD = async (req: Request, res: Response) => {

  try {
    const { transcriptId } = req.body;
    console.log(`[PRD] Creating PRD for transcriptId: ${transcriptId}`);

    if (!transcriptId)
      return res.status(400).json({ error: 'Missing transcriptId' });

    const transcript = await Transcript.findById(transcriptId);

    if (!transcript) {
      console.warn(`[PRD] Transcript not found: ${transcriptId}`);
      return res.status(404).json({ error: 'Transcript not found' });
    }

    // -------------------------
    // OPTIONAL: Store in Pinecone for search (keep this)
    // -------------------------

    console.log('[PRD] Chunking text...');
    const chunks = chunkText(transcript.originalText);

    console.log(`[PRD] Created ${chunks.length} chunks.`);

    const chunkDocs = await Promise.all(
      chunks.map((text) =>
        Chunk.create({
          transcript: transcript._id,
          text
        })
      )
    );

    console.log('[PRD] Creating embeddings...');
    const vectors = await createEmbeddings(chunks);

    console.log(`[PRD] Created ${vectors.length} vectors.`);

    console.log('[PRD] Upserting to Pinecone...');

    const ids = chunkDocs.map((c) => c._id.toString());

    await upsertVectors(
      ids,
      vectors,
      chunks.map((t) => ({
        text: t,
        transcriptId: transcript._id.toString()
      }))
    );

    // -------------------------
    // CORRECT PRD GENERATION
    // -------------------------

    console.log('[PRD] Generating PRD text via LLM...');

    const prdText = await generatePRD(transcript.originalText);

    if (!prdText) {
      throw new Error("PRD generation failed");
    }

    const prd = await PRD.create({
      transcript: transcript._id,
      content: prdText
    });

    console.log('[PRD] PRD created successfully.');

    res.status(201).json(prd);

  } catch (err: any) {

    console.error('[PRD] General Error:', err.message || err);

    res.status(500).json({
      error: 'Failed to create PRD',
      details: err.message
    });

  }
};

export const getPRD = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await PRD.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
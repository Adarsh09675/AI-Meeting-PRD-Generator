import OpenAI from 'openai';
import fs from 'fs';

const groqApiKey = process.env.GROQ_API_KEY;

const openai = new OpenAI({
    apiKey: groqApiKey,
    baseURL: "https://api.groq.com/openai/v1",
});

export const transcribeAudio = async (filePath: string): Promise<string> => {
    if (!groqApiKey) {
        throw new Error('GROQ_API_KEY is not defined in environment variables');
    }

    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            response_format: "text",
        });

        return transcription as unknown as string;
    } catch (error: any) {
        const errorDetail = error.response?.data?.error?.message || error.message;
        console.error('Transcription error Details:', error.response?.data || error.message);
        throw new Error(`Transcription failed: ${errorDetail}`);
    }
};

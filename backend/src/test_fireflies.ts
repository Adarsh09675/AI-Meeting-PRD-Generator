import dotenv from 'dotenv';
import path from 'path';

// Absolute path to .env
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

import { fetchRecentTranscripts } from './services/firefliesService';

async function testFireflies() {
    console.log('--- FIREFLIES TEST START ---');
    const keyPrefix = process.env.FIREFLIES_API_KEY ? process.env.FIREFLIES_API_KEY.substring(0, 5) : 'MISSING';
    console.log('FIREFLIES_API_KEY (starts with):', keyPrefix);

    try {
        console.log('Requesting transcripts from Fireflies.ai...');
        const meetings = await fetchRecentTranscripts(3);
        console.log('SUCCESS!');
        console.log('Found', meetings.length, 'recent meetings.');

        meetings.forEach((m: any, i: number) => {
            console.log(`${i + 1}. [${m.id}] ${m.title} (${new Date(m.date).toLocaleDateString()})`);
        });

    } catch (err: any) {
        console.error('FAILED!');
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    } finally {
        console.log('--- FIREFLIES TEST END ---');
    }
}

testFireflies().catch(err => {
    console.error('FATAL UNHANDLED ERROR:', err);
    process.exit(1);
});

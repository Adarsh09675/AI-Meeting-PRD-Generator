import dotenv from 'dotenv';
import path from 'path';
// Explicitly load .env from the root of the backend folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;

console.log('--- Pinecone Debug ---');
console.log('Current CWD:', process.cwd());
console.log('Environment variables loaded:', {
  PINECONE_API_KEY: apiKey ? 'SET' : 'MISSING',
  PINECONE_INDEX: process.env.PINECONE_INDEX || 'MISSING'
});

if (!apiKey) {
  console.warn('Pinecone API key not set; pineconeClient may be uninitialized or fail');
  console.warn('Please ensure PINECONE_API_KEY is in your .env file');
}

const client = new Pinecone({
  apiKey: apiKey || '',
});

export default client;
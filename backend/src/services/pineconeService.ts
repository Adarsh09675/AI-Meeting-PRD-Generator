import pineconeClient from '../utils/pineconeClient';

const indexName = process.env.PINECONE_INDEX || 'transcripts';

function isPineconeReady() {
  return !!process.env.PINECONE_API_KEY;
}


export const upsertVectors = async (ids: string[], vectors: number[][], metadatas?: object[]) => {
  if (!isPineconeReady()) {
    console.warn('Pinecone not configured, skipping upsert');
    return;
  }
  const index = pineconeClient.index(indexName);
  await index.upsert({
    records: ids.map((id, i) => ({ id, values: vectors[i], metadata: metadatas?.[i] as any }))
  });



};

export const queryVectors = async (vector: number[], topK = 5) => {
  if (!isPineconeReady()) {
    console.warn('Pinecone not configured, returning empty matches');
    return [];
  }
  const index = pineconeClient.index(indexName);
  const result = await index.query({
    topK,
    vector,
    includeMetadata: true,
  });
  return result.matches;
};

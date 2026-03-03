import client from '../utils/ollamaClient';

export const createEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const model = process.env.OLLAMA_EMBED_MODEL || 'mxbai-embed-large';
    const resp = await client.post('/v1/embeddings', {
      input: texts,
      model: model
    });

    return resp.data.data.map((item: any) => item.embedding);
  } catch (err) {
    console.error('Embedding request failed', err);
    // return dummy vectors on failure - dimension 768
    return texts.map(() => Array(768).fill(0));
  }
};


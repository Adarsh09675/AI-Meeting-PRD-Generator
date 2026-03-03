import axios from 'axios';

const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
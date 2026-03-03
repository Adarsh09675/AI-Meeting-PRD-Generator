import axios from 'axios';

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';
const firefliesClient = axios.create({
    baseURL: FIREFLIES_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add an interceptor to inject the API key dynamically
firefliesClient.interceptors.request.use((config) => {
    const apiKey = process.env.FIREFLIES_API_KEY;
    if (apiKey) {
        config.headers.Authorization = `Bearer ${apiKey}`;
    }
    return config;
});

export default firefliesClient;

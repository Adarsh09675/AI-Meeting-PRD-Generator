# PRD Generator

This repository contains a full‑stack TypeScript application for generating
product requirements documents (PRDs) from meeting transcripts.

## Architecture

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **DB**: MongoDB (local or Atlas)
- **Vector DB**: Pinecone
- **Embedding & LLM**: Ollama API
- **Transcript (optional)**: Fireflies or manual text upload

## Setup

### Backend

1. Navigate to `backend` directory:
   ```sh
   cd backend
   ```
2. Copy `.env.example` to `.env` and fill in the values.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start dev server:
   ```sh
   npm run dev
   ```

The server runs on `http://localhost:4000` by default.

### Frontend

1. Navigate to `frontend` directory:
   ```sh
   cd frontend
   ```
2. Copy `.env.example` to `.env` and adjust `VITE_API_BASE` if necessary.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start dev server:
   ```sh
   npm run dev
   ```

The UI will be available at `http://localhost:5173`.

## Usage

1. Paste transcript text on the home page and upload.
2. Click "Generate PRD" to kick off the backend workflow.
3. The generated PRD will display once complete.

## Implementation Notes

- **Backend workflows** are located in `controllers` and `services`.
- **Chunking**: simple sentence-based split; can be enhanced later.
- **Embeddings**: uses Ollama embedding endpoint via `services/embedService.ts`.
- **Vector store**: upserts and queries handled in `services/pineconeService.ts`.
- **PRD generation**: context chunks passed to Ollama LLM.
- **Frontend**: minimal components under `src/components` and `src/pages`.

## Deployment

- Frontend can be deployed to Vercel using the `frontend` folder.
- Backend can be deployed to any Node host or as Vercel serverless functions.
- Store environment variables securely in your hosting provider.

## Next Steps

- Add authentication and multi-user handling (JWT/OAuth).
- Implement transcript ingestion from Fireflies API or file upload.
- Improve error handling and logging.
- Write automated tests.
- Set up CI/CD pipelines (GitHub Actions).
- Dockerize for local development (optional).

---

Feel free to expand on these instructions as the project evolves.

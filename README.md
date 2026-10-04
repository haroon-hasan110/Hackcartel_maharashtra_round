## Run Locally

**Prerequisites:** Node.js and [Ollama](https://ollama.com/download)


1. Install dependencies:
   `npm install`
2. Download a local model: `ollama pull qwen3:8b`
3. Start Ollama with `ollama serve` if it is not already running
4. Optionally configure `OLLAMA_BASE_URL` and `VITE_OLLAMA_MODEL` in `.env.local`. For local Ollama, use `http://127.0.0.1:11434` and `qwen3:8b`; no API key is required.
5. Configure Morphic in the ignored `.env.local` file:
   `MORPHIC_API_KEY`, `MORPHIC_ORG_ID`, `MORPHIC_PROJECT_ID`, and `MORPHIC_WORKFLOW_ID`.
6. In Morphic Studio, create a workflow that accepts a script as text and declares its generated video as an output. Create a Partner API key with `workflows:read`, `runs:write`, and `runs:read` scopes. Morphic API file inputs must be publicly fetchable HTTPS URLs.
7. Run the app:
   `npm run dev`

Transcript analysis, hook generation, captions, and platform-copy generation run through the local Ollama model. Add a transcript or script to the project form for Qwen analysis. The video file itself is not transcribed or analyzed yet; without supplied text, analysis will ask for a transcript.

## Run the API Locally

**Prerequisites:** Python 3.11+

1. Install the API dependencies: `python -m pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Ensure Ollama is running (`ollama serve` if needed) and download the configured model: `ollama pull qwen3:8b`.
4. Run `backend/schema.sql` in the Supabase SQL editor.
5. Start the API: `python -m uvicorn backend.main:app --reload --port 8000`
6. Open `http://localhost:8000/docs` to inspect the API.

The LinkedIn adaptation endpoint is `POST /repurpose/linkedin`. The Supabase service role key must remain server-side and must not be used in the frontend.

The **Script to Video** workspace starts the configured Morphic workflow and polls its run until it returns its declared assets. Morphic credentials are read only by the local Express server and are never exposed to the browser. `npm run preview` and `npm start` serve the production build through that same API server.

## Run Locally

**Prerequisites:** Node.js and [Ollama](https://ollama.com/download)


1. Install dependencies:
   `npm install`
2. Download a local model: `ollama pull qwen3:8b`
3. Start Ollama with `ollama serve` if it is not already running
4. Optionally configure `OLLAMA_BASE_URL` and `VITE_OLLAMA_MODEL` in `.env.local`. For local Ollama, use `http://127.0.0.1:11434` and `qwen3:8b`; no API key is required.
5. Run the app:
   `npm run dev`

Transcript analysis, hook generation, captions, and platform-copy generation run through the local Ollama model. Add a transcript or script to the project form for Qwen analysis. The video file itself is not transcribed or analyzed yet; without supplied text, analysis will ask for a transcript.

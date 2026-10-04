# CreatorAI

### One recording. An entire content pipeline.

Built by **Hackcartel** for **Bit N Build '26**: a creator-content operations workspace for turning long-form recordings and their transcripts into reviewed, reusable content.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/AI-Ollama-black?logo=ollama&logoColor=white)](https://ollama.com/)

## 🎯 The Problem

Creators have to move between tools to find useful moments in a long recording, shape them into short-form content, and prepare platform-specific copy. That repetitive operations work slows down publishing and makes it harder to reuse the value already present in each recording. CreatorAI brings that workflow into one review-first workspace.

## What It Does

- Create a project from a local video and provide a transcript or script for analysis.
- Use a local Ollama model to identify topics and transcript-supported clip opportunities; review the suggestions in Content Map.
- Refine a clip in Creator Studio with trim, crop, aspect-ratio, hook, and caption controls.
- Generate platform copy, optionally run a configured Morphic script-to-video workflow, and use the YouTube integration when credentials are configured.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Motion |
| Backend | Express for the Morphic proxy and app server; FastAPI for LinkedIn and YouTube endpoints |
| AI | Ollama (`qwen3:8b` by default) for transcript analysis and copy; Morphic Partner API for configured script-to-video workflows |
| Database | Supabase Postgres and Auth; browser `localStorage` for local editor state and demo fallback data |

## Key Features Implemented

- **Transcript-based content analysis:** With a transcript or script, Ollama returns topics, summaries, and clip candidates. Timestamps in plain text are estimates based on text order and the recording duration; this is not automatic speech recognition or frame-level video analysis.
- **Reviewable clip editing:** Creator Studio supports source preview, trim boundaries, crop position, aspect ratio, hook/caption editing, playback controls, and local edit-state persistence.
- **Ollama-powered copy:** Hook, caption, and platform-adaptation generation run against the supplied clip text using the configured local model.
- **Morphic workflow execution:** Script to Video can load a configured Morphic workflow, submit inputs, poll run status, and display returned assets. It requires valid Partner API credentials and workflow configuration.
- **YouTube API integration:** The backend includes latest-video, trending-style search, recommendations, engagement, and OAuth upload endpoints. The dashboard and Studio use these endpoints when valid Google credentials are configured. The trending-style view is based on YouTube search ordered by view count, not an official trending feed.
- **Upload to All:** After Script to Video finishes, Repurpose can send the generated video URL to YouTube and X with one action. YouTube requires the configured OAuth upload credentials; X video upload additionally requires OAuth 1.0a `X_CONSUMER_KEY`, `X_CONSUMER_SECRET`, `X_ACCESS_TOKEN`, and `X_ACCESS_TOKEN_SECRET`.
- **Supabase integration:** When configured, the app can read/write project and asset records and use Supabase Auth. Editor changes save locally first and may sync to Supabase. A separate FastAPI LinkedIn endpoint generates a post with Ollama and inserts it into `platform_adaptations`.

**LinkedIn integration status:** The Repurpose screen currently generates its LinkedIn variation through the browser-side Ollama adaptation flow. It does not call the separate `POST /repurpose/linkedin` endpoint, so that screen's generated or edited post is not saved by the backend endpoint.

## Architecture

```text
[Upload: local video + optional transcript/script]
                    |
                    v
[Analysis: Ollama reads supplied text]
                    |
                    v
[Content Map: review suggested clip moments]
                    |
                    v
[Studio: refine timing, crop, hook, and captions]
                    |
                    v
[Repurpose: generate platform copy with Ollama]
                    |
                    v
[Export: queue/download an edit-recipe JSON]
```

The source video is previewed locally; it is not uploaded to durable storage or transcribed by this pipeline. Export currently produces an edit recipe, not a rendered MP4. Script to Video is a separate optional path through Morphic and can return generated assets when configured.

## Setup & Installation

### 1. Install dependencies

Requires Node.js, Python 3.11 or newer, and [Ollama](https://ollama.com/download).

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt -r backend/requirements.txt
```

The two Python requirements files cover the app/backend and the YouTube integration dependencies.

### 2. Start Ollama

Keep Ollama running in the background. If your installation does not start its service automatically, start it in a separate terminal and leave that terminal open:

```powershell
ollama serve
```

Then download the default model:

```powershell
ollama pull qwen3:8b
```

### 3. Configure local environment

Create local `.env.local` and `.env` files with your own values; do not commit credentials. `.env.local` is read by the frontend/Express app:

```dotenv
OLLAMA_BASE_URL=http://127.0.0.1:11434
VITE_OLLAMA_MODEL=qwen3:8b

# Optional Supabase frontend/Auth configuration
VITE_SUPABASE_URL=<your Supabase project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon key>

# Optional Morphic configuration for Script to Video
MORPHIC_API_KEY=<your Morphic Partner API key>
MORPHIC_ORG_ID=<your Morphic organization ID>
MORPHIC_PROJECT_ID=<your Morphic canvas project ID>
MORPHIC_WORKFLOW_ID=<your Morphic workflow ID>
```

The root `.env` file is read by FastAPI and the YouTube service:

```dotenv
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<your server-side service-role key>

# Optional YouTube API/OAuth configuration
YOUTUBE_API_KEY=<your YouTube Data API key>
YOUTUBE_CLIENT_ID=<your Google OAuth client ID>
YOUTUBE_CLIENT_SECRET=<your Google OAuth client secret>
YOUTUBE_REDIRECT_URI=http://localhost:8000/oauth/callback
```

The Supabase service-role key and Morphic/Google secrets must remain server-side. Optional integrations need their corresponding credentials:

- **Morphic:** Create a workflow with script-text input and declared video output. Use a Partner API key with `workflows:read`, `runs:write`, and `runs:read` scopes. URL-based file inputs must be publicly fetchable HTTPS URLs.
- **YouTube:** Enable YouTube Data API v3 in Google Cloud. Configure OAuth credentials and the redirect URI as described in [backend/README.md](backend/README.md).

### 4. Set up Supabase (optional)

In the Supabase SQL editor, apply `supabase/schema.sql` for projects/assets. Apply `backend/schema.sql` to create or migrate the LinkedIn `platform_adaptations` table. Review the included access policies before using real user data.

### 5. Start the app and API

Start the Express/Vite app:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Supabase, Morphic, and YouTube features remain unavailable until their respective credentials are configured; the app can show seeded demo projects when Supabase is not configured.

In a second terminal, start FastAPI on port `8010` to match the Vite `/youtube` proxy. Port `8000` is used by the YouTube OAuth callback flow.

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8010
```

API docs: [http://localhost:8010/docs](http://localhost:8010/docs).

### 6. Run checks

```powershell
npm run lint
npm run build
npm run test:backend
```

## 👥 Team Hackcartel

- **Haroon Hasan** — Lead
- **Yash Jadhav**
- **Parv Satra**
- **Hasti Karaniya**

## What's Next

- Connect the Repurpose screen's LinkedIn actions to the persistent FastAPI endpoint and support loading/updating saved adaptations.
- Add speech-to-text and video-aware analysis rather than requiring a supplied transcript or script.
- Implement durable source-video storage, actual clip rendering, and MP4 export; current clip-generation status and export rendering are not a media-processing pipeline.
- Add live integration coverage for Ollama, Supabase, Morphic, and YouTube, and tighten Supabase access policies before production use.

## License

No `LICENSE` file is currently included. Unless a license is added to the repository, no open-source reuse or redistribution terms are granted.

---

**CreatorAI** · Built for **Bit N Build '26** by **Hackcartel**

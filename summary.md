# CreatorAI Project Summary

## Product
CreatorAI is a creator-content workspace intended to turn one long-form recording into reusable clips and platform-ready copy. Its guiding idea is: **one recording, an entire content pipeline**, while the creator remains in control of final edits.

## What Is Built

### Frontend
- React 19, TypeScript, and Vite single-page application.
- Cinematic landing page with looping background video, hero messaging, responsive calls to action, and a drag-to-start interaction.
- Google OAuth sign-in action wired through Supabase Auth when frontend Supabase configuration is available.
- Shared workspace shell with sidebar navigation, project selector, theme selector, notifications, and export modal.
- Screens for dashboard, projects, source upload, processing, Content Map, Creator Studio, repurposing, assets, and settings.
- Workspace uses a shared charcoal-and-lime visual theme, responsive layouts, and reusable theme tokens.
- Upload UI accepts video selection/drop and an optional transcript or script. Creator Studio supports clip selection, timing edits, hook/caption edits, aspect-ratio selection, reset, and export actions.

### Data and Integrations
- Supabase JavaScript client is configured from frontend environment variables.
- The frontend API service can read and write project records and read assets from Supabase, with mock data fallback.
- `supabase/schema.sql` defines the `projects` and `assets` tables and their current Row Level Security policies.
- Google sign-in uses Supabase OAuth when configured.

### FastAPI LinkedIn Endpoint
- A separate Python 3.11+ FastAPI backend is defined in `backend/main.py`.
- `POST /repurpose/linkedin` accepts `clip_id`, `hook`, `caption`, and `transcript_excerpt`.
- The endpoint asks the configured local Ollama model for JSON containing a one-line LinkedIn editorial hook and a structured, professional post body without hashtags.
- It validates the Ollama response, inserts the adaptation into Supabase `platform_adaptations`, and returns the inserted row. Request validation errors return 422; generation or persistence failures return 500.
- `backend/schema.sql` defines/migrates the adaptation table. `requirements.txt` contains the Python dependencies.

## Current Limitations
- Frontend analysis uses Ollama with a supplied transcript or script; video transcription is not implemented.
- Clip generation, hook/caption regeneration, platform variations in the Repurpose screen, and export are still simulated/mock flows.
- The FastAPI LinkedIn endpoint exists separately and is not yet called by the Repurpose screen.
- Video selection currently provides a local preview/object URL; durable source-video upload and processing are not implemented end-to-end.
- Real endpoint behavior requires a running Ollama instance, the configured local model, valid server-side Supabase environment variables, and applying `backend/schema.sql` in Supabase. The endpoint has been exercised with mocked external services; a credential-backed integration run remains pending.
- Review Supabase table access policies before production. The current project/assets schema includes public read/insert/update policies and is suitable only for a controlled demo unless tightened.

## Run Locally

### Frontend
```powershell
npm install
npm run dev
```

Vite starts on port 3000 by default and may select another available port.

### FastAPI Backend
Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`. Keep the service-role key server-side. Start Ollama with the model configured by `OLLAMA_MODEL`, apply `backend/schema.sql` in the Supabase SQL editor, then run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

API docs are available at `http://localhost:8000/docs`.

## Suggested Next Steps
1. Connect the Repurpose screen's LinkedIn action to `POST /repurpose/linkedin` and display the saved response.
2. Replace mock project analysis with a real, validated AI analysis workflow that returns transcript-grounded, timestamped opportunities.
3. Implement durable video upload/storage and real clip-generation/export status handling.
4. Tighten Supabase authentication and Row Level Security policies before using real user data.

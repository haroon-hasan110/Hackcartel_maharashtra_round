# LinkedIn Feature Audit and Handoff

**Audit snapshot:** 2026-10-04

## Summary

LinkedIn repurposing exists in two separate paths. The backend endpoint generates a LinkedIn post with local Ollama and inserts it into Supabase. The Repurpose screen generates LinkedIn copy directly from the browser through the general platform-adaptation flow. The screen does **not** call the backend endpoint, so screen-generated copy is not saved to `platform_adaptations`.

| Area | Status | Current behavior |
| --- | --- | --- |
| LinkedIn card in Repurpose | Partial | Displays a draft, supports local regeneration, body editing, and copy-to-clipboard. |
| Ollama generation | Implemented | Available in both the frontend generic adaptation flow and the backend LinkedIn-specific flow. |
| Supabase persistence | Implemented in backend only | `POST /repurpose/linkedin` inserts one adaptation row and returns it. |
| Repurpose screen to backend | Not connected | No frontend code calls `/repurpose/linkedin`. |
| Live Ollama/Supabase integration | Not verified | Backend tests mock Ollama and Supabase. |

## Current Data Flows

**Repurpose screen:** `Repurpose.tsx` calls `api.generatePlatformAdaptation()` for LinkedIn. That method uses `generateLocalJson()` from `src/services/ollama.ts`, through the Vite `/ollama` proxy. The resulting `PlatformAdaptation` is kept in component state. The visible LinkedIn card edits its body and copies hook/body text, but does not persist those edits.

**Backend:** `POST /repurpose/linkedin` validates a request, calls local Ollama at `/api/chat`, validates the returned JSON as `LinkedInPost`, then inserts `clip_id`, `platform`, `hook`, and `body` into Supabase `platform_adaptations`. The route returns HTTP 201 with the inserted row. The model and base URL are read from `OLLAMA_MODEL` and `OLLAMA_BASE_URL`; defaults are `qwen3:8b` and `http://127.0.0.1:11434`.

Relevant files:

- `src/components/repurpose/Repurpose.tsx`
- `src/services/api.ts`
- `src/services/ollama.ts`
- `src/types/project.ts`
- `backend/main.py`
- `backend/schema.sql`
- `backend/tests/test_main.py`

## Implemented Backend Contract

Request body:

```json
{
  "clip_id": "clip-123",
  "hook": "Source hook",
  "caption": "Source caption",
  "transcript_excerpt": "Transcript excerpt"
}
```

`clip_id` must be a non-empty string. The other fields are strings but currently permit empty values. The Ollama prompt asks for a grounded professional LinkedIn post without hashtags and a JSON object containing exactly `hook` and `postBody`. Both output fields must be non-empty; extra fields are rejected.

The Supabase insert writes to `platform_adaptations` with `platform = "linkedin"`. The SQL in `backend/schema.sql` creates or migrates the table. It does not currently enable RLS or define policies for this table; review access controls before production.

Errors from generation or persistence are logged server-side and returned as a generic HTTP 500. Invalid request models return FastAPI's HTTP 422.

## Tests and Verification

`backend/tests/test_main.py` covers request validation, parsing a mocked Ollama JSON response, successful route behavior with mocked generation/save, and a generation failure. At the audit snapshot, the suite passed: **4 passed**. These tests do not contact a live Ollama server or Supabase project.

Run tests from the repository root:

```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -q
```

## Run the Backend Endpoint

The backend uses dependencies split across the root and backend requirements files. Install both in the same environment:

```powershell
python -m pip install -r requirements.txt -r backend/requirements.txt
```

Start Ollama and fetch the model if needed:

```powershell
ollama serve
ollama pull qwen3:8b
```

Set these values in a server-side `.env` file; do not put the Supabase service-role key in frontend variables:

```dotenv
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<your server-side service-role key>
```

Apply `backend/schema.sql` in the Supabase SQL editor, then start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Send a request from PowerShell:

```powershell
$payload = @{
  clip_id = 'clip-123'
  hook = 'Source hook'
  caption = 'Source caption'
  transcript_excerpt = 'Transcript excerpt'
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri 'http://127.0.0.1:8000/repurpose/linkedin' `
  -ContentType 'application/json' `
  -Body $payload
```

The endpoint does not transcribe uploaded video. A caller must supply the clip's transcript excerpt and caption. The YouTube Vite proxy is configured for port `8010`; it is separate from this direct LinkedIn endpoint and is not a LinkedIn proxy.

## Recommended Next Steps

1. Add a frontend API method that posts the selected clip's ID, hook, caption, and transcript excerpt to `/repurpose/linkedin`.
2. Route the LinkedIn regenerate action through that method, map the backend `postBody` response to the screen's `PlatformAdaptation.body`, and show backend/Ollama errors accurately. Decide whether Generate All should use the backend for LinkedIn as well.
3. Decide how user edits should persist. The current endpoint is insert-only; it has no read, update, or deduplication behavior.
4. Add integration coverage for Supabase failures and a configured Ollama instance, while keeping deterministic mocked unit tests.
5. Review Supabase RLS and secret handling before sharing or deploying.

## Security Handoff

At this audit snapshot, the **local working copy** of root `.env.example` contains credential-like values and literal merge-conflict markers. This document intentionally does not reproduce them. Do not distribute or commit that working copy as an example; replace real values with placeholders, resolve the markers, and rotate any credentials that are real. Keep all service-role credentials server-side.

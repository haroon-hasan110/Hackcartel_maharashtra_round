# YouTube API feature for this project

This backend adds the following YouTube features:

- Latest channel video retrieval
- Trending-style content lookup
- Video engagement aggregation
- Automated video upload using OAuth

## 1. Setup

1. Copy `.env.example` to `.env` in the project root or inside `backend/` if you prefer.
2. Add your YouTube Data API key.
3. Add your Google OAuth client ID and client secret.
4. Create OAuth credentials in Google Cloud Console and enable the YouTube Data API v3.
5. Ensure the OAuth app is configured with the redirect URI:
   `http://localhost:8000/oauth/callback`

## 2. Run the service

From the project root:

```bash
.venv\Scripts\python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## 3. Example requests

### Health

```bash
curl http://localhost:8000/health
```

### Latest videos

```bash
curl "http://localhost:8000/youtube/latest-videos?channel_id=YOUR_CHANNEL_ID&max_results=10"
```

### Trending-style feed

```bash
curl "http://localhost:8000/youtube/trending?region=IN&max_results=10"
```

### Engagement for a set of videos

```bash
curl "http://localhost:8000/youtube/engagement?video_ids=VIDEO_ID_1,VIDEO_ID_2"
```

### Upload video

```bash
curl -X POST http://localhost:8000/youtube/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "C:/path/to/video.mp4",
    "title": "My uploaded video",
    "description": "Uploaded through the YouTube integration.",
    "privacy_status": "private",
    "tags": ["youtube", "automation", "demo"]
  }'
```

## 4. Security note

- Keep the OAuth client secret only in a backend environment.
- Do not commit real tokens or secrets to GitHub.
- The token is stored locally in `backend/.youtube_token.json` after the first successful OAuth login.

## 5. Notes

The trending endpoint uses YouTube search with region and view-count ordering to approximate a trending dashboard. The official YouTube trending list is not exposed directly through the public v3 API in the same way.

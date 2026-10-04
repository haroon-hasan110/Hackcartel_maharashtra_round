from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

PLACEHOLDER_VALUES = {
    "your_youtube_data_api_key_here",
    "your_google_oauth_client_id_here",
    "your_google_oauth_client_secret_here",
    "MY_GEMINI_API_KEY",
    "MY_APP_URL",
    "your_channel_id_here",
}


def is_configured(value: Optional[str]) -> bool:
    if value is None:
        return False
    text = value.strip()
    return bool(text) and text.lower() not in {item.lower() for item in PLACEHOLDER_VALUES}


YOUTUBE_SCOPE = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
]

TOKEN_PATH = BASE_DIR / "backend" / ".youtube_token.json"
CLIENT_SECRETS_PATH = BASE_DIR / "backend" / "client_secret.json"


def get_api_key() -> str:
    api_key = (os.getenv("YOUTUBE_API_KEY") or "").strip()
    if not is_configured(api_key):
        raise ValueError(
            "YOUTUBE_API_KEY is missing or still set to the default placeholder. Add your real YouTube Data API key in the .env file."
        )
    return api_key


def youtube_credentials_ready() -> bool:
    return is_configured(os.getenv("YOUTUBE_CLIENT_ID") or "") and is_configured(os.getenv("YOUTUBE_CLIENT_SECRET") or "")


def get_client_config() -> dict[str, Any]:
    client_id = (os.getenv("YOUTUBE_CLIENT_ID") or "").strip()
    client_secret = (os.getenv("YOUTUBE_CLIENT_SECRET") or "").strip()
    redirect_uri = (os.getenv("YOUTUBE_REDIRECT_URI") or "http://localhost:8080/oauth/callback").strip()

    if not is_configured(client_id) or not is_configured(client_secret):
        raise ValueError(
            "YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET is missing or still set to a placeholder. Add the real OAuth credentials before testing uploads."
        )

    return {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": [redirect_uri],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        }
    }


def build_read_service():
    api_key = (os.getenv("YOUTUBE_API_KEY") or "").strip()
    if is_configured(api_key):
        return build("youtube", "v3", developerKey=api_key)
    return build("youtube", "v3", credentials=get_oauth_credentials())


def get_oauth_credentials() -> Credentials:
    token_path = str(TOKEN_PATH)
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(token_path, YOUTUBE_SCOPE)
        if creds and creds.valid:
            return creds
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(token_path, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())
            return creds

    if CLIENT_SECRETS_PATH.exists():
        flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS_PATH), YOUTUBE_SCOPE)
    else:
        flow = InstalledAppFlow.from_client_config(get_client_config(), YOUTUBE_SCOPE)

    creds = flow.run_local_server(port=8000, open_browser=False)
    with open(token_path, "w", encoding="utf-8") as token_file:
        token_file.write(creds.to_json())
    return creds


def build_upload_service():
    creds = get_oauth_credentials()
    return build("youtube", "v3", credentials=creds)


def fetch_latest_channel_videos(channel_id: str, max_results: int = 10) -> list[dict[str, Any]]:
    youtube = build_read_service()
    response = (
        youtube.search()
        .list(
            part="snippet",
            channelId=channel_id,
            type="video",
            order="date",
            maxResults=max_results,
        )
        .execute()
    )
    return response.get("items", [])


def fetch_trending_videos(region_code: str = "IN", max_results: int = 10) -> list[dict[str, Any]]:
    youtube = build_read_service()
    response = (
        youtube.search()
        .list(
            part="snippet",
            regionCode=region_code,
            type="video",
            order="viewCount",
            maxResults=max_results,
        )
        .execute()
    )
    return response.get("items", [])


def fetch_recommended_videos(
    query: str,
    region_code: str = "IN",
    max_results: int = 10,
) -> list[dict[str, Any]]:
    youtube = build_read_service()
    response = (
        youtube.search()
        .list(
            part="snippet",
            q=query,
            regionCode=region_code,
            type="video",
            order="relevance",
            maxResults=max_results,
        )
        .execute()
    )
    return response.get("items", [])


def get_video_engagement(video_ids: list[str]) -> list[dict[str, Any]]:
    if not video_ids:
        return []

    youtube = build_read_service()
    response = youtube.videos().list(part="snippet,statistics", id=",".join(video_ids)).execute()
    items = response.get("items", [])

    data: list[dict[str, Any]] = []
    for item in items:
        stats = item.get("statistics", {})
        views = int(stats.get("viewCount", 0) or 0)
        likes = int(stats.get("likeCount", 0) or 0)
        comments = int(stats.get("commentCount", 0) or 0)
        engagement = round(((likes + comments) / views) * 100, 2) if views else 0.0
        data.append(
            {
                "video_id": item.get("id"),
                "title": item.get("snippet", {}).get("title"),
                "views": views,
                "likes": likes,
                "comments": comments,
                "engagement_rate_percent": engagement,
            }
        )
    return data


def upload_video(
    file_path: str,
    title: str,
    description: str,
    privacy_status: str = "private",
    tags: Optional[list[str]] = None,
) -> dict[str, Any]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Video file not found: {file_path}")

    with open(file_path, "rb") as video_file:
        return upload_video_file(
            video_file,
            title=title,
            description=description,
            privacy_status=privacy_status,
            tags=tags,
        )


def upload_video_file(
    file_obj: Any,
    title: str,
    description: str,
    privacy_status: str = "private",
    tags: Optional[list[str]] = None,
) -> dict[str, Any]:
    youtube = build_upload_service()
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": "22",
        },
        "status": {"privacyStatus": privacy_status},
    }

    media = MediaIoBaseUpload(
        file_obj,
        mimetype="video/mp4",
        chunksize=8 * 1024 * 1024,
        resumable=True,
    )
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = request.execute()
    return response

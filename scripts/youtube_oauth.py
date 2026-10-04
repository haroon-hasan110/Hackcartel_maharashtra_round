import os
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow


# ============================================================
# PATHS / ENV
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

CLIENT_ID = os.getenv("YOUTUBE_CLIENT_ID")
CLIENT_SECRET = os.getenv("YOUTUBE_CLIENT_SECRET")

REDIRECT_URI = os.getenv(
    "YOUTUBE_REDIRECT_URI",
    "http://localhost:8080/oauth/callback"
)

TOKEN_PATH = BASE_DIR / "backend" / ".youtube_token.json"

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]


# ============================================================
# VALIDATE ENV
# ============================================================

if not CLIENT_ID or not CLIENT_SECRET:
    raise SystemExit(
        "Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in the .env file."
    )


# ============================================================
# GOOGLE OAUTH CONFIG
# ============================================================

config = {
    "installed": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uris": [REDIRECT_URI],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url":
            "https://www.googleapis.com/oauth2/v1/certs",
    }
}

flow = InstalledAppFlow.from_client_config(
    config,
    SCOPES,
    redirect_uri=REDIRECT_URI,
)


# ============================================================
# HANDLER
# ============================================================

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)

        print(f"CALLBACK_RECEIVED: {parsed.path}")

        query = parse_qs(parsed.query)

        code = query.get("code", [None])[0]

        if code is None:
            self.send_response(400)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()

            self.wfile.write(
                b"Missing authorization code."
            )

            print("ERROR: Missing authorization code.")

            return

        print("AUTHORIZATION_CODE_RECEIVED")

        try:
            flow.fetch_token(code=code)

            creds = flow.credentials

            TOKEN_PATH.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            TOKEN_PATH.write_text(
                creds.to_json(),
                encoding="utf-8"
            )

            print("TOKEN_FILE_CREATED")
            print(f"TOKEN_PATH={TOKEN_PATH}")

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "text/html; charset=utf-8"
            )

            self.end_headers()

            self.wfile.write(
                b"""
                <html>
                    <head>
                        <title>YouTube Authorization</title>
                    </head>
                    <body>
                        <h1>YouTube authorization complete!</h1>
                        <p>You can close this tab.</p>
                    </body>
                </html>
                """
            )

            # Stop server AFTER response.
            # Run shutdown from another thread to avoid deadlock.
            import threading

            threading.Thread(
                target=self.server.shutdown,
                daemon=True
            ).start()

        except Exception as exc:

            print(f"TOKEN_ERROR={exc}")

            self.send_response(500)

            self.send_header(
                "Content-Type",
                "text/plain"
            )

            self.end_headers()

            self.wfile.write(
                b"YouTube authorization failed. Check the terminal."
            )

    def log_message(self, format, *args):
        pass


# ============================================================
# CREATE CALLBACK SERVER FIRST
# ============================================================

server = HTTPServer(
    ("127.0.0.1", 8080),
    Handler
)

print()
print("=" * 60)
print("YOUTUBE OAUTH")
print("=" * 60)
print(f"REDIRECT_URI={REDIRECT_URI}")
print("CALLBACK_SERVER=http://127.0.0.1:8080")
print("LISTENING_ON_8080")
print("=" * 60)


# ============================================================
# CREATE AUTH URL
# ============================================================

auth_url, _ = flow.authorization_url(
    access_type="offline",
    include_granted_scopes="true",
    prompt="consent",
)

print()
print("Opening Google OAuth...")
print()
print(f"AUTH_URL={auth_url}")
print()


# ============================================================
# IMPORTANT:
# SERVER IS ALREADY RUNNING BEFORE BROWSER OPENS
# ============================================================

webbrowser.open(auth_url)


# ============================================================
# WAIT FOR CALLBACK
# ============================================================

server.serve_forever()

print()
print("OAuth process finished.")

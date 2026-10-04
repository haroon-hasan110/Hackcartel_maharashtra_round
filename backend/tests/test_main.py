import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.main import RepurposeRequest, app, generate_x_post

client = TestClient(app)


def test_repurpose_x_validation_error():
    response = client.post("/repurpose/x", json={"clip_id": "", "hook": "h", "caption": "c", "transcript_excerpt": "t"})
    assert response.status_code == 422


@patch("backend.main.urlopen")
def test_generate_x_post_parses_ollama_json(mock_urlopen):
    payload = {
        "message": {
            "content": json.dumps(
                {
                    "hook": "One sharp thesis.",
                    "postBody": "Paragraph one.\n\n- Bullet",
                }
            )
        }
    }
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps(payload).encode("utf-8")
    mock_response.__enter__.return_value = mock_response
    mock_response.__exit__.return_value = False
    mock_urlopen.return_value = mock_response

    post = generate_x_post(
        RepurposeRequest(
            clip_id="clip-1",
            hook="hook",
            caption="caption",
            transcript_excerpt="excerpt",
        )
    )
    assert post.hook == "One sharp thesis."
    assert "Bullet" in post.postBody


@patch("backend.main.save_adaptation")
@patch("backend.main.generate_x_post")
def test_repurpose_x_success(mock_generate, mock_save):
    from backend.main import XPost

    mock_generate.return_value = XPost(hook="Hook line", postBody="Body text")
    mock_save.return_value = {"id": "adapt-1", "platform": "x", "hook": "Hook line", "body": "Body text"}

    response = client.post(
        "/repurpose/x",
        json={
            "clip_id": "clip-1",
            "hook": "source hook",
            "caption": "source caption",
            "transcript_excerpt": "source excerpt",
        },
    )

    assert response.status_code == 201
    assert response.json()["id"] == "adapt-1"
    mock_save.assert_called_once()


@patch("backend.main.generate_x_post", side_effect=RuntimeError("Ollama offline"))
def test_repurpose_x_failure_returns_500(_mock_generate):
    response = client.post(
        "/repurpose/x",
        json={
            "clip_id": "clip-1",
            "hook": "source hook",
            "caption": "source caption",
            "transcript_excerpt": "source excerpt",
        },
    )
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to generate and save X adaptation"


def test_x_publish_requires_server_credentials(monkeypatch):
    monkeypatch.delenv("X_ACCESS_TOKEN", raising=False)

    response = client.post(
        "/repurpose/x/publish",
        json={"clip_id": "clip-1", "hook": "Hook line", "postBody": "Body text"},
    )

    assert response.status_code == 503
    assert "X_ACCESS_TOKEN" in response.json()["detail"]


@patch("backend.main.urlopen")
def test_x_publish_sends_post_to_x(mock_urlopen, monkeypatch):
    monkeypatch.setenv("X_ACCESS_TOKEN", "token")
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps({"data": {"id": "tweet-456"}}).encode("utf-8")
    mock_response.__enter__.return_value = mock_response
    mock_response.__exit__.return_value = False
    mock_urlopen.return_value = mock_response

    response = client.post(
        "/repurpose/x/publish",
        json={"clip_id": "clip-1", "hook": "Hook line", "postBody": "Body text"},
    )

    assert response.status_code == 200
    assert response.json() == {"status": "published", "id": "tweet-456"}
    request = mock_urlopen.call_args.args[0]
    assert request.full_url == "https://api.x.com/2/tweets"
    assert request.get_header("Authorization") == "Bearer token"

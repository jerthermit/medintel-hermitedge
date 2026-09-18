import os
import sys

from fastapi.testclient import TestClient

test_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(test_dir, os.pardir))
sys.path.insert(0, project_root)

from app.core.dependencies import check_hermit_gate
from app.main import app
import app.api.llm as llm_api


async def bypass_hermit_gate():
    return None


app.dependency_overrides[check_hermit_gate] = bypass_hermit_gate
client = TestClient(app)


def _article():
    return {
        "id": "1",
        "title": "Example clinical study",
        "abstract": "Study abstract with relevant clinical findings.",
        "url": "https://example.com/study",
        "journal": "Example Journal",
        "authors": ["Doe J"],
        "pubDate": "2026",
    }


def test_synthesize_streams_model_output(monkeypatch):
    def fake_stream(query, articles):
        assert query == "clinical evidence"
        assert len(articles) == 1
        yield "**SEARCH RATIONALE**\n"
        yield "Evidence synthesis."

    monkeypatch.setattr(llm_api, "stream_summarize_results", fake_stream)

    response = client.post(
        "/api/llm/synthesize",
        json={
            "query": "clinical evidence",
            "articles": [_article()],
        },
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert response.text == "**SEARCH RATIONALE**\nEvidence synthesis."


def test_synthesize_rejects_invalid_request():
    response = client.post(
        "/api/llm/synthesize",
        json={
            "query": "bad",
            "articles": [],
        },
    )

    assert response.status_code == 422

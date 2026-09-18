import os
import sys

from fastapi.testclient import TestClient

test_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(test_dir, os.pardir))
sys.path.insert(0, project_root)

from app.core.dependencies import check_hermit_gate
from app.main import app
import app.api.pubmed as pubmed_api


async def bypass_hermit_gate():
    return None


app.dependency_overrides[check_hermit_gate] = bypass_hermit_gate
client = TestClient(app)


def test_search_pubmed_success(monkeypatch):
    captured = {}

    def fake_search_articles(query, limit):
        captured["query"] = query
        captured["limit"] = limit
        return [
            {
                "id": "111",
                "title": "Test Study",
                "abstract": "Test abstract.",
                "url": "https://example.com/111/",
                "journal": "Test Journal",
                "authors": [],
                "pubDate": "2026",
            }
        ]

    monkeypatch.setattr(pubmed_api, "search_articles", fake_search_articles)

    response = client.post(
        "/api/pubmed/search",
        json={
            "query": "diabetes",
            "limit": 1,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["query"] == "diabetes"
    assert data["results"][0]["id"] == "111"
    assert data["results"][0]["abstract"] == "Test abstract."

    assert captured["query"] == "diabetes"
    assert captured["limit"] == 1


def test_search_pubmed_rejects_invalid_request():
    response = client.post(
        "/api/pubmed/search",
        json={
            "query": "x",
            "limit": 0,
        },
    )

    assert response.status_code == 422


def test_search_pubmed_hides_upstream_error(monkeypatch):
    def fake_search_articles(query, limit):
        raise RuntimeError("private upstream failure details")

    monkeypatch.setattr(pubmed_api, "search_articles", fake_search_articles)

    response = client.post(
        "/api/pubmed/search",
        json={
            "query": "diabetes",
            "limit": 1,
        },
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "The PubMed search could not be completed."
    assert "private upstream failure details" not in response.text

<p align="center">
  <img src="frontend/public/app-logo.png" alt="MedIntel" width="72" />
</p>

<h1 align="center">MedIntel</h1>

<p align="center"><strong>Evidence-grounded medical research synthesis from PubMed.</strong></p>
<p align="center">Search · Evidence review · Clinical findings · AI synthesis</p>

MedIntel is an AI-assisted biomedical research tool that retrieves live PubMed literature and turns selected evidence into structured research synthesis.

Built for fast review of clinical and biomedical literature.

## What it does

- Searches PubMed through NCBI E-Utilities.
- Returns article titles, abstracts, journals, authors, dates, and PubMed links.
- Presents evidence in a focused research interface instead of a raw search feed.
- Detects useful evidence and entity labels in article content with deterministic frontend rules.
- Sends selected research evidence to a server-side Together AI model.
- Streams synthesis directly into the interface as it is generated.
- Separates individual evidence appraisal from cross-study clinical findings.
- Surfaces conflicting evidence instead of forcing artificial consensus.
- Limits article count, abstract size, and model output to bound inference cost.
- Supports Redis-backed request throttling and demo spending limits for public deployments.

## Research flow

```text
Research query → PubMed → Review evidence → AI synthesis → Clinical findings
```

## How it stays grounded

- PubMed provides the source literature.
- The synthesis model receives the retrieved article evidence rather than answering from an unconstrained prompt.
- Individual abstracts are bounded before model submission.
- Synthesis requests accept a limited number of articles.
- The model is instructed to preserve measurable findings such as p-values, confidence intervals, outcomes, and reported effect sizes when present.
- Conflicting evidence must be identified explicitly.
- Provider failures return an unavailable state instead of fabricated research content.

## Architecture

```text
Researcher / browser
        ↓
   React + Vite
        ↓
      FastAPI ─────→ Together AI
        │
        ├──────────→ PubMed / NCBI
        │
        └──────────→ Upstash Redis
```

**Stack:** React, TypeScript, Vite, Material UI, FastAPI, Pydantic, Biopython, Together AI, NCBI E-Utilities, and Upstash Redis.

## Run locally

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

Configure the Together AI key and any optional PubMed or Upstash credentials in `backend/.env`.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Verification

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests

cd ../frontend
npm run build
```

## Deployment

- Deploy `frontend/` as the Vite web application.
- Deploy `backend/` as the FastAPI service.
- Set the deployed frontend origin in `ALLOWED_ORIGINS`.
- Store `TOGETHER_API_KEY` and other credentials only in backend deployment environment variables.
- Configure Upstash Redis when public rate limiting and spending controls are required.
- Set `LLM_MODEL_ID=Qwen/Qwen3.8-Flash` for the current Together AI deployment.

## Project context

MedIntel is a portfolio implementation demonstrating evidence retrieval, bounded AI synthesis, streamed inference, and backend controls around an external model provider.

Built by [Emman at Hermit Edge](https://hermitedge.com).

## Copyright

Copyright © 2026 Emman Ermitaño. All rights reserved.
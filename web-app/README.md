# Web Report App

X-ray report generation web application with AI-powered interpretation.

## Features

- Simple authentication (hardcoded test credentials)
- X-ray findings input with AI interpretation
- Guardrails to prevent misuse
- OpenAI-compatible LLM integration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- LLM Service running (Use Case 1)

### 1. Start LLM Service First

```bash
cd ../llm-service
docker-compose up -d
```

### 2. Start Web App

```bash
cd web-app
docker-compose up -d
```

### 3. Access the App

Open browser: `http://localhost`

**Test credentials:** `demo` / `prodia2024`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Login with credentials |
| POST | `/api/logout` | Logout current user |
| GET | `/api/me` | Check authentication status |
| POST | `/api/report` | Generate X-ray report |

## API Examples

### Login

```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "prodia2024"}' \
  -c cookies.txt
```

### Generate Report

```bash
curl -X POST http://localhost/api/report \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "findings": "Bilateral infiltrates in the lower lobes. Cardiomegaly present. Blunted costophrenic angles suggesting pleural effusion."
  }'
```

### Check Authentication

```bash
curl http://localhost/api/me -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost/api/logout -b cookies.txt
```

## Guardrails

The following keywords are blocked to prevent misuse:

- recipe, cook
- code, python
- joke, story
- weather, hello

If blocked keywords are detected, the API returns:
```json
{
  "detail": "This service is for X-ray interpretation only"
}
```

## Architecture

```
Browser → Nginx (port 80) → Backend (port 8001) → LLM Service (port 8080)
```

## File Structure

```
web-app/
├── backend/
│   ├── main.py           # FastAPI backend
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html        # Login page
│   ├── app.html          # Report page
│   ├── app.js            # Report logic
│   └── style.css         # Styles
├── nginx/
│   └── default.conf      # Nginx config
├── docker-compose.yml
└── README.md
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to LLM | Ensure llm-service is running |
| 401 Unauthorized | Login first or check session cookie |
| 400 Bad Request | Check for blocked keywords |
| 502 Bad Gateway | LLM service unavailable |

## Network

This service connects to `poc-net` Docker network and communicates with `llm-service` at `http://llm-service:8080`.

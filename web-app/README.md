# Web Chat Application

Simple web interface for interacting with a local LLM.

## Prerequisites

- Docker and Docker Compose
- LLM Service running (see `../llm-service/`)

## Quick Start

### 1. Create Docker Network (if not exists)

```bash
docker network create poc-net
```

### 2. Start LLM Service First

```bash
cd ../llm-service
docker-compose up -d
```

### 3. Start Web App

```bash
cd ../web-app
docker-compose up -d
```

### 4. Access the Application

Open http://localhost in your browser.

**Test Credentials:**
- Username: `demo`
- Password: `demo2024`

## Architecture

```
Browser -> Nginx (:80) -> Backend (:8001) -> LLM Service (:8080)
              |
         Static Files
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Authenticate user |
| POST | `/api/logout` | End session |
| GET | `/api/me` | Check auth status |
| POST | `/api/chat` | Send message to LLM |

## Testing with curl

```bash
# Login
curl -c cookies.txt -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo2024"}'

# Send message
curl -b cookies.txt -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# Logout
curl -b cookies.txt -X POST http://localhost/api/logout
```

## File Structure

```
web-app/
├── backend/
│   ├── main.py           # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html        # Login page
│   ├── app.html          # Chat page
│   ├── app.js            # App logic
│   └── style.css         # Styles
├── nginx/
│   └── default.conf      # Nginx routing
├── docker-compose.yml
└── README.md
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check credentials: demo / demo2024 |
| Chat fails | Ensure LLM service is running |
| 502 Bad Gateway | Backend not started or crashed |
| Timeout | LLM inference takes time, wait longer |

## Development

To modify the frontend, edit files in `frontend/` - changes are reflected immediately (volume mounted).

To modify the backend, rebuild:
```bash
docker-compose up -d --build backend
```

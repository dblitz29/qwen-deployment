# Prodia AI/ML Technical POC

Proof of concept for AI/ML use cases in a containerized environment.

## Use Cases

### 1. LLM Inference Service ✅

OpenAI-compatible API for local LLM inference.

**Status:** Ready

**Quick Start:**
```bash
cd llm-service
docker-compose up -d
curl http://localhost:8080/v1/models
```

**Documentation:** [docs/llm-service-setup.md](docs/llm-service-setup.md)

### 2. Web Report App 🚧

Web application with authentication and report generation.

**Status:** In Progress

### 3. JupyterLab GPU Experimentation 🚧

Interactive notebook environment for ML experiments.

**Status:** Pending

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Port 80)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Web App      │  │ LLM Service  │  │ JupyterLab   │  │
│  │ (Port 8001)  │  │ (Port 8080)  │  │ (Port 8888)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| LLM Service | 8080 | ✅ Ready | OpenAI-compatible LLM API |
| Web App | 80 | 🚧 In Progress | Auth + Report generation |
| JupyterLab | 8888 | 🚧 Pending | GPU notebook environment |

## Quick Start

### Start All Services

```bash
# Start LLM Service
cd llm-service
docker-compose up -d

# Start Web App (when ready)
cd ../web-app
docker-compose up -d
```

### Verify Services

```bash
# LLM Service
curl http://localhost:8080/v1/models

# Web App (when ready)
curl http://localhost:80
```

## Project Structure

```
prodia-poc/
├── llm-service/          # LLM Inference Service
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── entrypoint.sh
│   ├── .env.example
│   └── models/           # GGUF model files
├── web-app/              # Web Application
│   ├── backend/
│   ├── frontend/
│   └── docker-compose.yml
├── jupyter-lab/          # JupyterLab Environment
│   └── docker-compose.yml
└── docs/                 # Documentation
    ├── llm-service-setup.md
    ├── deployment.md
    └── troubleshooting.md
```

## Requirements

- Docker 20.10+
- Docker Compose 2.0+
- (Optional) NVIDIA GPU with drivers
- (Optional) NVIDIA Container Toolkit

## License

Private - Prodia POC

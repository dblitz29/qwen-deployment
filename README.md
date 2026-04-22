# AI/ML Technical POC

Single-server proof of concept demonstrating three AI/ML use cases in a containerized environment.

## Use Cases

| Use Case | Description | Directory |
|----------|-------------|-----------|
| A | Local LLM Inference Service | `llm-service/` |
| B | Web Report Application | `web-app/` |
| C | JupyterLab GPU Environment | `jupyter-lab/` |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ubuntu 22.04 GPU Server                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Web App    │    │ LLM Service │    │ JupyterLab  │     │
│  │   :80       │───▶│   :8080     │    │   :8888     │     │
│  │  (nginx)    │    │(llama-server│    │  (PyTorch)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                    Docker Network (poc-net)                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   NVIDIA GPU                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Ubuntu 22.04 LTS
- Docker & Docker Compose
- NVIDIA GPU with drivers
- NVIDIA Container Toolkit

### 1. Clone and Setup

```bash
git clone <repository>
cd ai-ml-poc
```

### 2. Create Docker Network

```bash
docker network create poc-net
```

### 3. Download LLM Model

```bash
mkdir -p llm-service/models
# Download a GGUF model (e.g., Qwen2.5-7B-Instruct-Q4_K_M.gguf)
# Place in llm-service/models/model.gguf
```

### 4. Start All Services

```bash
# Start LLM service first
cd llm-service && docker-compose up -d && cd ..

# Start web app
cd web-app && docker-compose up -d && cd ..

# Start JupyterLab
cd jupyter-lab && docker-compose up -d && cd ..
```

### 5. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost | demo / demo2024 |
| LLM API | http://localhost:8080 | - |
| JupyterLab | http://localhost:8888 | - |

## Project Structure

```
ai-ml-poc/
├── llm-service/           # Use Case A: LLM Inference
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── models/            # Place GGUF models here
│   └── README.md
│
├── web-app/               # Use Case B: Web Application
│   ├── backend/
│   │   ├── main.py        # FastAPI backend
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── index.html     # Login page
│   │   ├── app.html       # Report page
│   │   └── style.css
│   ├── nginx/
│   │   └── default.conf
│   ├── docker-compose.yml
│   └── README.md
│
├── jupyter-lab/           # Use Case C: GPU Experimentation
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── notebooks/         # Sample notebooks
│   ├── data/              # Datasets
│   ├── outputs/           # Model outputs
│   └── README.md
│
├── docs/                  # Documentation
│   ├── deployment.md
│   ├── gpu-setup.md
│   └── troubleshooting.md
│
└── README.md              # This file
```

## Documentation

- [Deployment Guide](docs/deployment.md) - Full deployment instructions
- [GPU Setup](docs/gpu-setup.md) - NVIDIA driver and container toolkit setup
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Technology Stack

| Component | Technology |
|-----------|------------|
| LLM Inference | llama.cpp (llama-server) |
| Web Backend | Python, FastAPI |
| Web Frontend | HTML, CSS, JavaScript |
| Reverse Proxy | Nginx |
| Containerization | Docker, Docker Compose |
| GPU Support | NVIDIA Container Toolkit |
| Target OS | Ubuntu 22.04 LTS |

## Constraints

This is a POC with intentional limitations:

- Single server deployment only
- Hardcoded test credentials
- No persistent user sessions
- No production security hardening
- No high availability

## License

Internal use only - AI/ML Technical POC

# AI/ML Technical POC Report

## Slide 1: Title

# AI/ML Technical POC
### Proof of Concept Report
**Date:** April 2026

---

## Slide 2: Executive Summary

### Objective
Demonstrate 3 AI/ML use cases in a containerized GPU environment

### Results
- All 3 use cases successfully deployed
- LLM inference running on GPU
- Web application with authentication working
- JupyterLab ready for ML experimentation

### Tech Stack
- **Infrastructure:** AWS EC2, Ubuntu 22.04, NVIDIA GPU
- **Containerization:** Docker, Docker Compose
- **LLM:** Qwen 2.5 14B Instruct (Q4_K_M quantization)
- **Backend:** FastAPI, Python 3.11
- **Frontend:** HTML/CSS/JavaScript
- **Reverse Proxy:** Nginx

---

## Slide 3: Use Case Overview

| Use Case | Description | Port |
|----------|-------------|------|
| 1. LLM Inference Service | Self-hosted LLM with OpenAI-compatible API | 8080 |
| 2. Web Application | X-Ray Report Generator + AI Chat | 80 |
| 3. JupyterLab | GPU-enabled notebook environment | 8888 |

---

## Slide 4: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS EC2                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Nginx (Port 80)                   │    │
│  │         Reverse Proxy & Static Files                 │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│  ┌─────────────────────┼───────────────────────────────┐    │
│  │                     │       poc-net (Docker Bridge) │    │
│  │  ┌──────────────────┴──────────────────┐           │    │
│  │  │                                     │           │    │
│  │  ▼                                     ▼           │    │
│  │ ┌─────────────────┐          ┌─────────────────┐   │    │
│  │ │  Web Backend    │          │  LLM Service    │   │    │
│  │ │  (FastAPI)      │─────────▶│  (llama.cpp)    │   │    │
│  │ │  Port: 8001     │          │  Port: 8080     │   │    │
│  │ └─────────────────┘          └────────┬────────┘   │    │
│  │                                       │            │    │
│  │                              ┌────────┴────────┐   │    │
│  │                              │  NVIDIA GPU     │   │    │
│  │                              │  (CUDA)         │   │    │
│  │                              └─────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  JupyterLab (Port 8888)                             │    │
│  │  - PyTorch with CUDA                                │    │
│  │  - Transformers, Datasets                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Slide 5: Use Case 1 - LLM Inference Service

### Model Details
- **Model:** Qwen 2.5 14B Instruct
- **Quantization:** Q4_K_M (4-bit)
- **File Size:** 8.4 GB
- **Source:** HuggingFace

### API Endpoints (OpenAI-Compatible)
```
GET  /v1/models              # List available models
POST /v1/chat/completions   # Chat completion
POST /v1/completions        # Text completion
```

### Example Request
```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Performance
- **Load Time:** ~30 seconds (model to GPU memory)
- **Inference:** ~2-5 seconds per request (depends on tokens)
- **GPU Memory:** ~10 GB VRAM

---

## Slide 6: Use Case 2 - Web Application

### Features
1. **Authentication**
   - Simple session-based login
   - Test credentials for POC

2. **X-Ray Report Generator**
   - Input: X-ray findings text
   - Output: Professional radiology report
   - Guardrails: Block non-medical queries

3. **AI Chat**
   - General purpose chatbot
   - Bubble chat UI
   - Real-time response

### Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Auth:** Session cookie (HTTP-only)

### Screenshot Placeholders
- [ ] Login page
- [ ] Dashboard with feature cards
- [ ] X-Ray Report form
- [ ] Chat interface

---

## Slide 7: Use Case 3 - JupyterLab

### Environment
- **Base Image:** pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
- **GPU Support:** NVIDIA Container Toolkit

### Pre-installed Libraries
| Library | Purpose |
|---------|---------|
| PyTorch | Deep learning framework |
| Transformers | HuggingFace models |
| Datasets | HuggingFace datasets |
| scikit-learn | ML algorithms |
| pandas, numpy | Data manipulation |
| matplotlib, seaborn | Visualization |

### Access
- URL: `http://<EC2-IP>:8888`
- No token for POC (configure for production)

---

## Slide 8: Deployment Architecture

### EC2 Instance Specs
- **OS:** Ubuntu 22.04 LTS
- **Instance Type:** GPU instance (g5.xlarge or similar)
- **Storage:** 100+ GB SSD (for models)

### Docker Services
```yaml
services:
  llm-service:
    image: llama.cpp server-cuda
    ports: ["8080:8080"]
    volumes: ["/models:/models"]
    deploy: [GPU resources]

  web-nginx:
    image: nginx:alpine
    ports: ["80:80"]

  web-backend:
    build: FastAPI app
    environment: [LLM_SERVICE_URL]

  jupyter:
    build: PyTorch + JupyterLab
    ports: ["8888:8888"]
    deploy: [GPU resources]
```

### Network
- Single bridge network: `poc-net`
- All services communicate internally

---

## Slide 9: Test Results

### LLM Service
| Metric | Value |
|--------|-------|
| Model Load Time | ~30 seconds |
| Avg Response Time | 2-5 seconds |
| GPU Memory Usage | ~10 GB |
| Max Concurrent Requests | Limited by GPU memory |

### Web Application
| Test | Result |
|------|--------|
| Login | ✅ Pass |
| X-Ray Report Generation | ✅ Pass |
| Chat | ✅ Pass |
| Guardrails | ✅ Pass |

### Concurrent User Testing
- Tool: Locust / Apache Bench
- Tested: X concurrent users
- Avg Response Time: X seconds
- Error Rate: X%

### GPU Utilization
```
nvidia-smi output placeholder
```

---

## Slide 10: Challenges & Solutions

### Challenge 1: Large Model Files
- **Problem:** HuggingFace splits large models into multiple files
- **Solution:** Use `llama-gguf-split --merge` to combine files

### Challenge 2: Docker Network
- **Problem:** Services can't communicate across docker-compose projects
- **Solution:** Use external network with consistent naming

### Challenge 3: GPU Memory
- **Problem:** 14B model requires significant VRAM
- **Solution:** Q4_K_M quantization reduces memory to ~10GB

### Challenge 4: Model Download
- **Problem:** 8.4GB model takes time to download
- **Solution:** Download once, mount as volume

---

## Slide 11: Recommendations & Next Steps

### Production Hardening
- [ ] Add proper authentication (JWT, OAuth)
- [ ] Enable HTTPS with SSL certificates
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Configure CORS properly

### Performance Optimization
- [ ] Implement response caching
- [ ] Add request queuing
- [ ] Consider model quantization options (Q3, Q5)
- [ ] Enable batch processing

### Infrastructure
- [ ] Set up CI/CD pipeline
- [ ] Add health checks and auto-restart
- [ ] Configure backup for models and data
- [ ] Document disaster recovery

### Security
- [ ] Remove hardcoded credentials
- [ ] Add input validation and sanitization
- [ ] Implement API key management
- [ ] Network isolation and firewall rules

---

## Slide 12: Q&A

### Questions?

### Contact
- [Your Name]
- [Email]
- [GitHub Repository]

---

## Appendix: Quick Start Commands

### Start All Services
```bash
# LLM Service
cd llm-service
MODEL_PATH=/models/qwen2.5-14b-instruct-q4_k_m.gguf docker-compose up -d

# Web App
cd web-app
docker-compose up -d

# JupyterLab
cd jupyter-lab
docker-compose up -d
```

### Stop All Services
```bash
cd llm-service && docker-compose down
cd web-app && docker-compose down
cd jupyter-lab && docker-compose down
```

### Check Logs
```bash
docker logs -f llm-service
docker logs -f web-backend
docker logs -f jupyter-lab
```

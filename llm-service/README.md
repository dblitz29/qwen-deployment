# LLM Inference Service

OpenAI-compatible API for local LLM inference using llama.cpp server.

## Features

- OpenAI-compatible REST API
- Automatic merge of split GGUF files
- GPU acceleration with CUDA
- Multi-model support

## Prerequisites

- Docker and Docker Compose
- NVIDIA GPU with drivers (for GPU acceleration)
- NVIDIA Container Toolkit (for GPU in Docker)
- GGUF model file(s)

## Quick Start

### 1. Download a Model

Download a GGUF model from HuggingFace and place it in the `models/` directory:

```bash
mkdir -p models
# Example: Download Qwen2.5-7B-Instruct (split files)
huggingface-cli download Qwen/Qwen2.5-7B-Instruct-GGUF --local-dir models
```

**Note:** If the model is split into multiple files (e.g., `*-00001-of-00002.gguf`), the service will automatically merge them on startup.

### 2. Start the Service

```bash
# CPU only (no GPU)
docker-compose up -d

# With GPU (uncomment GPU section in docker-compose.yml first)
docker-compose up -d
```

### 3. Test the API

```bash
# List models
curl http://localhost:8080/v1/models

# Chat completion
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/models` | List available models |
| POST | `/v1/chat/completions` | Chat completion (OpenAI format) |
| GET | `/health` | Health check |

## GPU Setup (Ubuntu 22.04)

### Install NVIDIA Drivers

```bash
sudo apt update
sudo apt install -y nvidia-driver-535
sudo reboot
```

### Install NVIDIA Container Toolkit

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

### Verify GPU Access

```bash
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

### Enable GPU in docker-compose.yml

Uncomment the `deploy` section in `docker-compose.yml`.

## Split GGUF Files

Some models on HuggingFace are split into multiple files due to upload size limits. The service automatically detects and merges these files:

```
qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf  ->  qwen2.5-7b-instruct-q4_k_m.gguf
qwen2.5-7b-instruct-q4_k_m-00002-of-00002.gguf  ->  (merged)
```

The merge happens on every container startup, so you can safely re-download split files and restart.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check `docker logs llm-service` |
| No GGUF files found | Verify model files in `models/` directory |
| Merge fails | Check file permissions on `models/` |
| GPU not detected | Run `nvidia-smi` to check drivers |
| Out of memory | Use smaller quantized model (Q2_K, Q3_K_M) |
| Slow inference | Enable GPU acceleration |

## Network Integration

This service runs on the `poc-net` Docker network. Other services (web-app) can reach it at `http://llm-service:8080`.

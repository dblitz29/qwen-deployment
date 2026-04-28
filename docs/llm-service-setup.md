# LLM Inference Service - Setup Guide

## Overview

This guide covers setting up the LLM Inference Service with Qwen2.5 models.

## Prerequisites

- Docker and Docker Compose
- (Optional) NVIDIA GPU with drivers for GPU acceleration
- (For large models) llama.cpp installed for merging split files

## Quick Start

### 1. Start with Default Model

```bash
cd llm-service
docker-compose up -d
```

### 2. Verify Service

```bash
curl http://localhost:8080/v1/models
```

## Model Selection Guide

| Model | Size | RAM Required | Use Case |
|-------|------|--------------|----------|
| Qwen2.5-1.5B | ~3GB | 4GB | Fast responses, testing |
| Qwen2.5-7B | ~8GB | 10GB | General purpose |
| Qwen2.5-14B | ~8.4GB | 12GB | High quality responses |
| Qwen2.5-32B | ~20GB | 24GB | Best quality, complex tasks |

## Installing Models

### Option 1: Small Models (No Merge Required)

Models under 10GB are typically single files:

```bash
cd llm-service

# Download Qwen2.5-1.5B
hf download Qwen/Qwen2.5-1.5B-Instruct-GGUF \
  --include "qwen2.5-1.5b-instruct-q5_k_m.gguf" \
  --local-dir models

# Update .env
echo 'MODEL_PATH=/models/qwen2.5-1.5b-instruct-q5_k_m.gguf' > .env

# Restart service
docker-compose restart llm-service
```

### Option 2: Large Models (Merge Required)

Models 10GB+ are split into multiple files and require merging:

#### Step 1: Install llama.cpp

```bash
cd /home/ubuntu
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
apt update && apt install -y cmake build-essential
cmake -B build
cmake --build build --config Release -j 8
```

#### Step 2: Download Model

```bash
cd /home/ubuntu/qwen-deployment/llm-service

# Download Qwen2.5-14B (Q4_K_M quantization)
hf download Qwen/Qwen2.5-14B-Instruct-GGUF \
  --include "qwen2.5-14b-instruct-q4_k_m*.gguf" \
  --local-dir models
```

#### Step 3: Merge Split Files

```bash
cd models
/home/ubuntu/llama.cpp/build/bin/llama-gguf-split --merge \
  qwen2.5-14b-instruct-q4_k_m-00001-of-00003.gguf \
  qwen2.5-14b-instruct-q4_k_m.gguf
```

#### Step 4: Configure and Start

```bash
cd ..
echo 'MODEL_PATH=/models/qwen2.5-14b-instruct-q4_k_m.gguf' > .env
docker-compose restart llm-service
```

## Quantization Guide

| Quantization | Size | Quality | Speed |
|--------------|------|---------|-------|
| Q2_K | Smallest | Lowest | Fastest |
| Q3_K_M | Small | Low | Fast |
| Q4_K_M | Medium | Good | Medium |
| Q5_K_M | Large | Better | Slower |
| Q8_0 | Largest | Best | Slowest |

**Recommendation:** Q4_K_M offers the best balance of size, quality, and speed.

## GPU Acceleration

### Prerequisites

1. NVIDIA GPU with drivers installed
2. NVIDIA Container Toolkit installed

### Enable GPU

Edit `docker-compose.yml` and uncomment:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### Verify GPU

```bash
docker exec llm-service nvidia-smi
```

## API Usage Examples

### Chat Completion

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

### Stream Response

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [
      {"role": "user", "content": "Write a short poem about AI."}
    ],
    "stream": true
  }'
```

## Troubleshooting

### Model Loading Errors

**Error:** `invalid split file name`

**Solution:** The model file was not properly merged. Use `llama-gguf-split` to merge split files.

### Out of Memory

**Error:** Model fails to load or crashes

**Solutions:**
1. Use smaller quantization (Q2_K, Q3_K_M)
2. Reduce context size: add `--ctx-size 2048` to command
3. Add more RAM/swap

### Slow Inference

**Solutions:**
1. Enable GPU acceleration
2. Use smaller model
3. Reduce `max_tokens` in requests

## File Structure

```
llm-service/
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
├── .env
├── .env.example
├── README.md
└── models/
    └── qwen2.5-14b-instruct-q4_k_m.gguf
```

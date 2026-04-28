# LLM Inference Service

OpenAI-compatible API for local LLM inference using llama.cpp server.

## Quick Start

### 1. Start the Service

```bash
cd llm-service
docker-compose up -d
```

### 2. Test the API

```bash
# List models
curl http://localhost:8080/v1/models

# Chat completion
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

## Configuration

### Environment Variables

Edit `.env` file:

```bash
MODEL_PATH=/models/qwen2.5-14b-instruct-q4_k_m.gguf
```

### Switching Models

1. Download new model to `models/` directory
2. Update `.env` with new model path
3. Restart: `docker-compose restart llm-service`

## Model Management

### Available Models

| Model | Size | Quantization | Notes |
|-------|------|--------------|-------|
| Qwen2.5-1.5B | ~3GB | Q5_K_M | Fast, lightweight |
| Qwen2.5-7B | ~8GB | Q4_K_M | Good balance |
| Qwen2.5-14B | ~8.4GB | Q4_K_M | High quality |
| Qwen2.5-32B | ~20GB | Q4_K_M | Best quality |

### Downloading Models

**Small models (no split files):**
```bash
# Qwen2.5-1.5B (single file, no merge needed)
hf download Qwen/Qwen2.5-1.5B-Instruct-GGUF \
  --include "qwen2.5-1.5b-instruct-q5_k_m.gguf" \
  --local-dir models
```

**Large models (split files, requires merge):**
```bash
# Qwen2.5-14B (split files)
hf download Qwen/Qwen2.5-14B-Instruct-GGUF \
  --include "qwen2.5-14b-instruct-q4_k_m*.gguf" \
  --local-dir models

# Merge split files (requires llama.cpp)
/home/ubuntu/llama.cpp/build/bin/llama-gguf-split --merge \
  models/qwen2.5-14b-instruct-q4_k_m-00001-of-00003.gguf \
  models/qwen2.5-14b-instruct-q4_k_m.gguf
```

### Merging Split GGUF Files

Large models (>10GB) on HuggingFace are split into multiple files. You must merge them before use.

**Prerequisites:**
```bash
# Install llama.cpp
cd /home/ubuntu
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
apt update && apt install -y cmake build-essential
cmake -B build
cmake --build build --config Release -j 8
```

**Merge command:**
```bash
/home/ubuntu/llama.cpp/build/bin/llama-gguf-split --merge \
  <first-split-file> \
  <output-file>
```

Example:
```bash
/home/ubuntu/llama.cpp/build/bin/llama-gguf-split --merge \
  models/qwen2.5-14b-instruct-q4_k_m-00001-of-00003.gguf \
  models/qwen2.5-14b-instruct-q4_k_m.gguf
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/models` | List available models |
| POST | `/v1/chat/completions` | Chat completion (OpenAI format) |
| GET | `/health` | Health check |

## GPU Support

Uncomment the `deploy` section in `docker-compose.yml` to enable GPU:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check `docker logs llm-service` |
| Model file not found | Verify `MODEL_PATH` in `.env` |
| Invalid split file | Merge with `llama-gguf-split` |
| Out of memory | Use smaller quantization (Q2_K, Q3_K_M) |
| Slow inference | Enable GPU acceleration |

## Network

This service runs on the `poc-net` Docker network. Other services can reach it at `http://llm-service:8080`.

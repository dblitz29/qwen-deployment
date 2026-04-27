# LLM Inference Service

OpenAI-compatible API for local LLM inference using llama.cpp server.

## Features

- OpenAI-compatible REST API
- Automatic merge of split GGUF files
- GPU acceleration with CUDA
- Multi-model support

## Quick Start

### 1. Download a Model

Download a GGUF model from HuggingFace and place it in the `models/` directory:

```bash
mkdir -p models/qwen2.5-7b-instruct
# Example: Download Qwen2.5-7B-Instruct (split files)
huggingface-cli download Qwen/Qwen2.5-7B-Instruct-GGUF --local-dir models/qwen2.5-7b-instruct
```

**Note:** If the model is split into multiple files (e.g., `*-00001-of-00002.gguf`), the service will automatically merge them on startup.

### 2. Configure Model Path

Edit `.env` to set your model:

```bash
MODEL_PATH=/models/qwen2.5-7b-instruct/model.gguf
```

### 3. Start the Service

```bash
# CPU only (no GPU)
docker-compose up -d

# With GPU (uncomment GPU section in docker-compose.yml first)
docker-compose up -d
```

### 4. Test the API

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

## Switching Models

To switch to a different model:

1. Download the new model to a new subdirectory:
```bash
mkdir -p models/qwen2.5-32b-instruct
huggingface-cli download Qwen/Qwen2.5-32B-Instruct-GGUF --local-dir models/qwen2.5-32b-instruct
```

2. Update `.env`:
```bash
MODEL_PATH=/models/qwen2.5-32b-instruct/model.gguf
```

3. Restart the service:
```bash
docker-compose restart llm-service
```

## Split GGUF Files

Some models on HuggingFace are split into multiple files due to upload size limits. The service automatically detects and merges these files:

```
models/qwen2.5-7b-instruct/
├── qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf  -> merged to model.gguf
├── qwen2.5-7b-instruct-q4_k_m-00002-of-00002.gguf  -> merged to model.gguf
└── model.gguf (after merge)
```

The merge happens on every container startup, so you can safely re-download split files and restart.

## Available Models

| Model | Size | Quantization | Notes |
|-------|------|--------------|-------|
| Qwen2.5-1.5B | ~1.5B | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 | Fast, low memory |
| Qwen2.5-7B | ~7B | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 | Good balance |
| Qwen2.5-32B | ~32B | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 | High quality |
| Qwen3-7B | ~7B | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 | Latest version |

## GPU Setup

See [GPU Setup Guide](../docs/gpu-setup.md)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check `docker logs llm-service` |
| No GGUF files found | Verify model files in `models/` directory |
| Model file not found | Check `MODEL_PATH` in `.env` |
| Merge fails | Check file permissions on `models/` |
| Out of memory | Use smaller quantized model (Q2_K, Q3_K_M) |
| Slow inference | Enable GPU acceleration |

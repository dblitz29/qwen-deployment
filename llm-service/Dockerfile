# LLM Inference Service - Uses llama.cpp server directly
# No custom code needed - llama-server provides OpenAI-compatible API

FROM ghcr.io/ggml-org/llama.cpp:server-cuda

# Model will be mounted at runtime via volume
VOLUME /models

EXPOSE 8080

# Default command - model path can be overridden via environment
# --ctx-size: context window size
# --host: bind to all interfaces for Docker networking
CMD ["--model", "/models/model.gguf", \
     "--host", "0.0.0.0", \
     "--port", "8080", \
     "--ctx-size", "4096"]

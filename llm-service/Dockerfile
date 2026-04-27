# LLM Inference Service - Uses llama.cpp server
FROM ghcr.io/ggml-org/llama.cpp:server-cuda

# Install Python for merge script
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

# Create entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Model directory
VOLUME /models

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["--host", "0.0.0.0", "--port", "8080", "--ctx-size", "4096"]

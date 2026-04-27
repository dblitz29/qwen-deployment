#!/bin/bash

# Entrypoint script for LLM service
# Starts llama-server with the specified model

set -e

echo "=== LLM Service Entrypoint ==="

# Validate MODEL_PATH exists
if [ -z "$MODEL_PATH" ]; then
    echo "ERROR: MODEL_PATH environment variable not set"
    exit 1
fi

if [ ! -f "$MODEL_PATH" ]; then
    echo "ERROR: Model file not found at $MODEL_PATH"
    echo "Available files in /models:"
    find /models -name "*.gguf" -type f 2>/dev/null | head -20
    exit 1
fi

echo "Using model: $MODEL_PATH"

# Start llama-server with all arguments
echo "Starting llama-server..."
exec /app/llama-server --model "$MODEL_PATH" "$@"

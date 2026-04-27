#!/bin/bash

# Entrypoint script for LLM service
# Merges split GGUF files if needed, then starts llama-server

set -e

echo "=== LLM Service Entrypoint ==="

# Check if models directory exists
if [ ! -d "/models" ]; then
    echo "ERROR: /models directory not found"
    exit 1
fi

echo "Checking for split GGUF files..."

# Get list of all .gguf files
GGUF_FILES=$(find /models -name "*.gguf" -type f 2>/dev/null || true)

if [ -z "$GGUF_FILES" ]; then
    echo "ERROR: No GGUF files found in /models"
    exit 1
fi

# Check if any file has the split pattern (use -- to separate options from args)
if echo "$GGUF_FILES" | grep -q -- "-00001-of-"; then
    echo "Found split GGUF files. Merging..."
    
    # Find unique prefixes and merge ALL of them
    for FILE in $GGUF_FILES; do
        if echo "$FILE" | grep -q -- "-00001-of-"; then
            # Extract prefix: qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf -> qwen2.5-7b-instruct-q4_k_m
            PREFIX=$(echo "$FILE" | sed 's/-00001-of-.*\.gguf$//')
            OUTPUT="${PREFIX}.gguf"
            
            echo "Merging: ${PREFIX}-*.gguf -> ${OUTPUT}"
            
            # Use Python to merge binary files
            python3 << EOF
import os
import glob

# Find all parts of this split
parts = sorted(glob.glob("${PREFIX}-*.gguf"))
if not parts:
    print(f"No parts found for prefix: ${PREFIX}")
    exit(1)

print(f"Found {len(parts)} parts to merge")

# Merge files in order
with open("${OUTPUT}", 'wb') as outfile:
    for part in parts:
        print(f"  Adding: {part}")
        with open(part, 'rb') as infile:
            outfile.write(infile.read())

print(f"Merged to: ${OUTPUT}")
EOF
        fi
    done
    
    echo "Merge complete!"
else
    echo "No split files found. Using existing GGUF files."
fi

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
exec /app/llama.cpp/build/bin/llama-server --model "$MODEL_PATH" "$@"

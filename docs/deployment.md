# Deployment Guide

Complete deployment instructions for the AI/ML Technical POC.

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 8 cores | 16+ cores |
| RAM | 32 GB | 64+ GB |
| GPU | NVIDIA with 24GB VRAM | NVIDIA with 48GB+ VRAM |
| Storage | 100 GB SSD | 500 GB NVMe |

### Software Requirements

- Ubuntu 22.04 LTS
- Docker 24.0+
- Docker Compose 2.0+
- NVIDIA Driver 535+
- NVIDIA Container Toolkit

## Step 1: System Preparation

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
```

### Install Docker Compose

```bash
# Docker Compose is included with Docker Desktop
# For server, install plugin:
sudo apt install docker-compose-plugin

# Verify
docker compose version
```

## Step 2: GPU Setup

See [GPU Setup Guide](gpu-setup.md) for detailed instructions.

Quick version:

```bash
# Install NVIDIA drivers
sudo apt install -y nvidia-driver-535
sudo reboot

# Verify
nvidia-smi

# Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Verify GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

## Step 3: Deploy Services

### Create Docker Network

```bash
docker network create poc-net
```

### Deploy LLM Service (Use Case A)

```bash
cd llm-service

# Download model (example: Qwen2.5-7B)
mkdir -p models
# Download GGUF model from HuggingFace and place in models/

# Enable GPU in docker-compose.yml (uncomment deploy section)

# Start service
docker-compose up -d

# Verify
curl http://localhost:8080/v1/models
```

### Deploy Web App (Use Case B)

```bash
cd ../web-app

# Start service
docker-compose up -d

# Verify
curl http://localhost/api/me
# Should return 401 (not authenticated)
```

### Deploy JupyterLab (Use Case C)

```bash
cd ../jupyter-lab

# Enable GPU in docker-compose.yml (uncomment deploy section)

# Start service
docker-compose up -d

# Verify
curl http://localhost:8888
```

## Step 4: Verify Deployment

### Check All Containers

```bash
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE              STATUS    PORTS
xxxx           llm-service        Up        0.0.0.0:8080->8080/tcp
xxxx           web-nginx          Up        0.0.0.0:80->80/tcp
xxxx           web-backend        Up        8001/tcp
xxxx           jupyter-lab        Up        0.0.0.0:8888->8888/tcp
```

### Test LLM Service

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"local","messages":[{"role":"user","content":"Hello"}]}'
```

### Test Web App

1. Open http://localhost in browser
2. Login with: demo / demo2024
3. Enter X-ray findings and generate report

### Test JupyterLab

1. Open http://localhost:8888 in browser
2. Run `01-gpu-verification.ipynb`
3. Verify GPU is detected

## Step 5: Configure Firewall (Optional)

If exposing services externally:

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow JupyterLab (if needed)
sudo ufw allow 8888/tcp

# Enable firewall
sudo ufw enable
```

## Stopping Services

```bash
# Stop all
cd llm-service && docker-compose down && cd ..
cd web-app && docker-compose down && cd ..
cd jupyter-lab && docker-compose down && cd ..

# Or stop individually
docker-compose -f llm-service/docker-compose.yml down
```

## Updating Services

```bash
# Pull latest changes
git pull

# Rebuild and restart
cd <service-directory>
docker-compose up -d --build
```

## Logs

```bash
# View logs
docker logs llm-service
docker logs web-backend
docker logs web-nginx
docker logs jupyter-lab

# Follow logs
docker logs -f llm-service
```

## Resource Monitoring

```bash
# Container stats
docker stats

# GPU usage
nvidia-smi -l 1

# Watch GPU usage
watch -n 1 nvidia-smi
```

# Troubleshooting Guide

Common issues and solutions for the AI/ML Technical POC.

## General Docker Issues

### Containers Not Starting

```bash
# Check container status
docker ps -a

# View logs
docker logs <container-name>

# Check for port conflicts
sudo netstat -tlnp | grep <port>
```

### Network Issues

```bash
# Verify network exists
docker network ls | grep poc-net

# Create if missing
docker network create poc-net

# Inspect network
docker network inspect poc-net
```

### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
# Or run: newgrp docker
```

---

## LLM Service Issues

### Model Not Found

**Error:** `failed to load model`

**Solution:**
```bash
# Check model file exists
ls -la llm-service/models/

# Verify model path in docker-compose.yml
# Should match: /models/model.gguf
```

### Out of Memory

**Error:** `CUDA out of memory` or container crashes

**Solutions:**
1. Use smaller quantized model (Q4_K_M instead of Q8)
2. Reduce context size in docker-compose.yml:
   ```yaml
   command: >
     --model /models/model.gguf
     --ctx-size 2048  # Reduce from 4096
   ```
3. Check GPU memory: `nvidia-smi`

### Slow Inference

**Possible causes:**
- Running on CPU instead of GPU
- Model too large for VRAM

**Solutions:**
1. Enable GPU in docker-compose.yml
2. Verify GPU is being used: `nvidia-smi` during inference
3. Use smaller model

### Connection Refused

**Error:** `curl: (7) Failed to connect to localhost port 8080`

**Solutions:**
```bash
# Check if container is running
docker ps | grep llm-service

# Check logs
docker logs llm-service

# Restart service
docker-compose -f llm-service/docker-compose.yml restart
```

---

## Web App Issues

### Login Fails

**Error:** "Invalid credentials"

**Solution:**
- Use correct credentials: `demo` / `demo2024`
- Check backend logs: `docker logs web-backend`

### Report Generation Fails

**Error:** "Report generation service unavailable"

**Causes:**
- LLM service not running
- Network connectivity issue

**Solutions:**
```bash
# Check LLM service
curl http://localhost:8080/v1/models

# Check backend can reach LLM service
docker exec web-backend curl http://llm-service:8080/v1/models

# Verify both on same network
docker network inspect poc-net
```

### 502 Bad Gateway

**Error:** Nginx returns 502

**Causes:**
- Backend not running
- Backend crashed

**Solutions:**
```bash
# Check backend status
docker ps | grep web-backend

# View backend logs
docker logs web-backend

# Restart backend
docker-compose -f web-app/docker-compose.yml restart backend
```

### Timeout Errors

**Error:** "Report generation timed out"

**Cause:** LLM inference taking too long

**Solutions:**
1. Wait longer (first request loads model)
2. Use smaller model
3. Increase timeout in nginx config (default: 130s)

---

## JupyterLab Issues

### Cannot Access JupyterLab

**Error:** Browser shows connection refused

**Solutions:**
```bash
# Check container is running
docker ps | grep jupyter

# Check logs
docker logs jupyter-lab

# Verify port mapping
docker port jupyter-lab
```

### GPU Not Detected in Notebook

**Error:** `torch.cuda.is_available()` returns False

**Solutions:**
1. Enable GPU in docker-compose.yml (uncomment deploy section)
2. Verify NVIDIA Container Toolkit:
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
   ```
3. Restart container after enabling GPU

### Kernel Dies

**Cause:** Usually out of memory

**Solutions:**
1. Check GPU memory: `nvidia-smi`
2. Reduce batch size in notebook
3. Clear GPU memory:
   ```python
   import torch
   torch.cuda.empty_cache()
   ```
4. Restart kernel

### Cannot Save Notebooks

**Error:** Permission denied when saving

**Solution:**
```bash
# Fix permissions on host
sudo chown -R $USER:$USER jupyter-lab/notebooks/
```

---

## GPU Issues

### nvidia-smi Not Found

```bash
# Check driver installation
dpkg -l | grep nvidia-driver

# Reinstall driver
sudo apt install --reinstall nvidia-driver-535
sudo reboot
```

### GPU Not Visible in Container

```bash
# Verify NVIDIA Container Toolkit
nvidia-ctk --version

# Reconfigure Docker runtime
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

### CUDA Version Mismatch

**Error:** `CUDA driver version is insufficient`

**Solution:**
- Update NVIDIA driver to match CUDA version required by your application
- Or use Docker image with compatible CUDA version

---

## Quick Diagnostic Commands

```bash
# System info
uname -a
cat /etc/os-release

# Docker info
docker version
docker info

# GPU info
nvidia-smi
nvidia-smi -L

# Network info
docker network ls
docker network inspect poc-net

# Container status
docker ps -a
docker stats

# Logs (last 100 lines)
docker logs --tail 100 llm-service
docker logs --tail 100 web-backend
docker logs --tail 100 jupyter-lab
```

## Getting Help

If issues persist:

1. Collect diagnostic info using commands above
2. Check container logs for specific errors
3. Verify all prerequisites are installed
4. Try restarting Docker: `sudo systemctl restart docker`
5. Try rebuilding containers: `docker-compose up -d --build`

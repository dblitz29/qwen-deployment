# JupyterLab GPU Environment

GPU-enabled JupyterLab for ML experimentation.

## Prerequisites

- Docker and Docker Compose
- NVIDIA GPU with drivers (for GPU acceleration)
- NVIDIA Container Toolkit (for GPU in Docker)

## Quick Start

### 1. Create Docker Network (if not exists)

```bash
docker network create poc-net
```

### 2. Start JupyterLab

```bash
docker-compose up -d
```

### 3. Access JupyterLab

Open http://localhost:8888 in your browser.

No password required for POC (configure authentication for production).

## Access Options

### Option 1: Direct Access (Development)
```
http://<server-ip>:8888
```

### Option 2: SSH Tunnel (Secure Remote Access)
```bash
# On your local machine
ssh -L 8888:localhost:8888 user@server-ip

# Then open in browser
http://localhost:8888
```

### Option 3: Nginx Reverse Proxy
Add to your nginx config:
```nginx
location /jupyter/ {
    proxy_pass http://jupyter-lab:8888/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

### Option 4: VPN (Recommended for Production)
- Connect to corporate VPN
- Access via internal IP

## GPU Setup (Ubuntu 22.04)

### 1. Install NVIDIA Drivers

```bash
sudo apt update
sudo apt install -y nvidia-driver-535
sudo reboot
```

Verify:
```bash
nvidia-smi
```

### 2. Install NVIDIA Container Toolkit

```bash
# Add repository
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Install
sudo apt update
sudo apt install -y nvidia-container-toolkit

# Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

### 3. Enable GPU in docker-compose.yml

Uncomment the `deploy` section in `docker-compose.yml`.

### 4. Verify GPU in Container

```bash
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

## Sample Notebooks

| Notebook | Description |
|----------|-------------|
| `01-gpu-verification.ipynb` | Verify GPU setup and installed libraries |
| `02-pytorch-gpu-example.ipynb` | PyTorch training example with GPU benchmark |

## Directory Structure

```
jupyter-lab/
├── notebooks/          # Your Jupyter notebooks (mounted)
├── data/               # Datasets (mounted)
├── outputs/            # Model outputs (mounted)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Smoke Test Checklist

- [ ] JupyterLab loads at http://localhost:8888
- [ ] Can create new Python notebook
- [ ] `import torch` works
- [ ] `torch.cuda.is_available()` returns True (with GPU)
- [ ] GPU verification notebook runs without errors
- [ ] Can save notebooks to /notebooks
- [ ] Can read files from /data

## Installed Libraries

- **PyTorch** with CUDA support
- **NumPy**, **Pandas** for data manipulation
- **Scikit-learn** for ML algorithms
- **Matplotlib**, **Seaborn** for visualization
- **Transformers**, **Accelerate** for LLM experiments
- **Datasets** for HuggingFace datasets

## Troubleshooting

| Issue | Solution |
|-------|----------|
| JupyterLab not loading | Check `docker logs jupyter-lab` |
| GPU not detected | Verify drivers: `nvidia-smi` |
| CUDA error in container | Install nvidia-container-toolkit |
| Permission denied on volumes | Check folder ownership |
| Out of GPU memory | Restart kernel, reduce batch size |
| Kernel dies | Usually OOM - check GPU memory |

## Adding More Libraries

Edit `Dockerfile` and rebuild:
```bash
docker-compose up -d --build
```

Or install temporarily in a notebook:
```python
!pip install some-package
```

## Production Considerations

For production deployment:
1. Enable JupyterLab authentication (token or password)
2. Use HTTPS via reverse proxy
3. Set resource limits in docker-compose
4. Configure proper user permissions
5. Set up regular backups of notebooks

# GPU Setup Guide

Complete guide for setting up NVIDIA GPU support on Ubuntu 22.04.

## Prerequisites

- Ubuntu 22.04 LTS
- NVIDIA GPU (tested with RTX 3090, A100, H100)
- Root/sudo access

## Step 1: Check GPU Hardware

```bash
# List PCI devices
lspci | grep -i nvidia

# Example output:
# 01:00.0 VGA compatible controller: NVIDIA Corporation GA102 [GeForce RTX 3090]
```

## Step 2: Install NVIDIA Drivers

### Option A: Using apt (Recommended)

```bash
# Update package list
sudo apt update

# Install driver (535 is stable as of 2024)
sudo apt install -y nvidia-driver-535

# Reboot
sudo reboot
```

### Option B: Using NVIDIA .run installer

```bash
# Download from NVIDIA website
wget https://us.download.nvidia.com/XFree86/Linux-x86_64/535.154.05/NVIDIA-Linux-x86_64-535.154.05.run

# Install dependencies
sudo apt install -y build-essential

# Run installer
sudo sh NVIDIA-Linux-x86_64-535.154.05.run

# Reboot
sudo reboot
```

### Verify Driver Installation

```bash
nvidia-smi
```

Expected output:
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.154.05   Driver Version: 535.154.05   CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0 Off |                  N/A |
|  0%   35C    P8    15W / 350W |      1MiB / 24576MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

## Step 3: Install NVIDIA Container Toolkit

This enables GPU access inside Docker containers.

### Add Repository

```bash
# Add GPG key
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

# Add repository
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

### Install Toolkit

```bash
sudo apt update
sudo apt install -y nvidia-container-toolkit
```

### Configure Docker Runtime

```bash
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

### Verify GPU in Docker

```bash
docker run --rm --gpus all nvidia/cuda:12.1-base-ubuntu22.04 nvidia-smi
```

You should see the same `nvidia-smi` output inside the container.

## Step 4: Enable GPU in Docker Compose

Edit your `docker-compose.yml` files and uncomment the GPU sections:

```yaml
services:
  your-service:
    # ... other config ...
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all  # or specific number: 1
              capabilities: [gpu]
```

## Common GPU Configurations

### Single GPU

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### All GPUs

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

### Specific GPU by ID

```yaml
environment:
  - NVIDIA_VISIBLE_DEVICES=0  # First GPU only
```

## CUDA Compatibility

| Driver Version | CUDA Version |
|----------------|--------------|
| 535.x | 12.2 |
| 525.x | 12.0 |
| 515.x | 11.7 |
| 470.x | 11.4 |

## Troubleshooting

### Driver Not Loading

```bash
# Check if nouveau is blacklisted
cat /etc/modprobe.d/blacklist-nouveau.conf

# Should contain:
# blacklist nouveau
# options nouveau modeset=0

# If not, create it:
sudo bash -c "echo 'blacklist nouveau' >> /etc/modprobe.d/blacklist-nouveau.conf"
sudo bash -c "echo 'options nouveau modeset=0' >> /etc/modprobe.d/blacklist-nouveau.conf"
sudo update-initramfs -u
sudo reboot
```

### nvidia-smi: command not found

```bash
# Check if driver is installed
dpkg -l | grep nvidia-driver

# Reinstall if needed
sudo apt install --reinstall nvidia-driver-535
```

### Docker: could not select device driver

```bash
# Reinstall container toolkit
sudo apt install --reinstall nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

### CUDA out of memory

```bash
# Check GPU memory usage
nvidia-smi

# Kill processes using GPU
sudo fuser -v /dev/nvidia*

# Or restart Docker
sudo systemctl restart docker
```

## Monitoring GPU

### Real-time Monitoring

```bash
# Update every second
watch -n 1 nvidia-smi

# Or use nvidia-smi built-in
nvidia-smi -l 1
```

### GPU Process List

```bash
nvidia-smi pmon -i 0
```

### Temperature Monitoring

```bash
nvidia-smi --query-gpu=temperature.gpu --format=csv -l 1
```

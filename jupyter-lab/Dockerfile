# JupyterLab GPU Environment
# Based on PyTorch with CUDA support

FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

# Install JupyterLab and ML libraries
RUN pip install --no-cache-dir \
    jupyterlab==4.0.9 \
    numpy==1.26.2 \
    pandas==2.1.4 \
    scikit-learn==1.3.2 \
    matplotlib==3.8.2 \
    seaborn==0.13.0 \
    transformers==4.36.2 \
    accelerate==0.25.0 \
    datasets==2.16.1 \
    ipywidgets==8.1.1

# Create working directories
RUN mkdir -p /notebooks /data /outputs

WORKDIR /notebooks

EXPOSE 8888

# Start JupyterLab without token for POC simplicity
# In production, configure proper authentication
CMD ["jupyter", "lab", \
     "--ip=0.0.0.0", \
     "--port=8888", \
     "--no-browser", \
     "--allow-root", \
     "--NotebookApp.token=''", \
     "--NotebookApp.password=''"]

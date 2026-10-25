
# ==========================================
# AeroGrid Backend Dockerfile
# ==========================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app/ /app/app/

# Document the default container port
EXPOSE 8000

# Health check: use Render's PORT or default to 8000 locally
# Health check: use Render's PORT or default to 8000 locally
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["sh", "-c", "curl -f http://localhost:${PORT:-8000}/health || exit 1"]
# Run Uvicorn on Render's assigned port, defaulting to 8000 locally
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

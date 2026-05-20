# This Dockerfile is optimized for Hugging Face Spaces (Backend Only)
FROM python:3.10-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy the entire backend directory
COPY backend/ ./

# Set environment variables for Hugging Face
ENV HOST="0.0.0.0"
ENV PORT=7860

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

# Run the Flask app with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]

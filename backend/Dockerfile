FROM registry1-docker-io.repo.cci.nokia.net/python:3.13-alpine

WORKDIR /app

# Install system dependencies including SSL certificates
RUN apk add --no-cache gcc musl-dev linux-headers ca-certificates

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies with SSL certificate handling
RUN pip install --no-cache-dir --upgrade pip setuptools wheel certifi && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the app
CMD ["python3", "app.py"]

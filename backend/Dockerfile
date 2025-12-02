FROM registry1-docker-io.repo.cci.nokia.net/python:3.11-alpine3.20

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache gcc musl-dev linux-headers

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the app
CMD ["python3", "app.py"]

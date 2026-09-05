#!/bin/bash
set -e

echo "Starting deployment for Udaya Cycles..."

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Build docker image
echo "Building Docker image..."
docker compose build

# Start services
echo "Starting services..."
docker compose up -d

# Check health
echo "Waiting for service to start..."
sleep 10
curl -f http://localhost:3000/api/health || echo "Health check failed!"

echo "Deployment complete!"

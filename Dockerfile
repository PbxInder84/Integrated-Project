# Use Node.js as base image
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN npm run install:all

# Copy source code
COPY . .

# Build React frontend
RUN npm run build:frontend

# Use Python image for ML service
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy from previous stage
COPY --from=build /app /app

# Install Python dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/ml-service
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose ports
EXPOSE 5000 5001

# Create start script
WORKDIR /app
RUN echo "#!/bin/sh\ncd /app/backend && node server.js & cd /app/ml-service && python app.py" > start.sh
RUN chmod +x start.sh

# Start services
CMD ["./start.sh"] 
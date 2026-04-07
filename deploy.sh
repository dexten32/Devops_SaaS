#!/bin/bash

# --- 0. Arguments ---
PROJECT_NAME=$1
PROJECT_PORT=$2
PROJECT_PATH=$3
ENV_VARS=$4

if [ -z "$PROJECT_NAME" ] || [ -z "$PROJECT_PORT" ] || [ -z "$PROJECT_PATH" ]; then
    echo "Error: Missing arguments. Usage: ./deploy.sh <name> <port> <path>"
    exit 1
fi

# --- 1. Navigate to Project ---
echo "Moving to project directory: $PROJECT_PATH"
cd "$PROJECT_PATH" || { echo "Directory not found"; exit 1; }
echo "Current directory: $(pwd)"

# --- 2. Smart Dockerfile Check ---
# If there is NO Dockerfile, we create a dummy one so the script doesn't crash.
if [ ! -f "Dockerfile" ]; then
    echo "No Dockerfile found. Creating a dummy Nginx setup..."
    echo "<h1>Deploy $PROJECT_NAME</h1><p>PORT: $PROJECT_PORT</p>" > index.html
    cat <<EOF > Dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
EOF
fi

# --- 3. Build and Run ---
TAG="${PROJECT_NAME,,}:v$(date +%s)" # ,, makes it lowercase (Docker requirement)
CONTAINER_NAME="container_$PROJECT_NAME"

echo "Building Image $TAG..."
docker build -t "$TAG" .

echo "Cleaning up old containers..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Running $PROJECT_NAME on port $PROJECT_PORT..."
docker run -d --name "$CONTAINER_NAME" -p "$PROJECT_PORT":80 ${ENV_VARS} "$TAG"

# --- 4. Health Check ---
echo "Performing health check on port $PROJECT_PORT..."
sleep 2
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:"$PROJECT_PORT")

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "Success! The site is live at http://localhost:$PROJECT_PORT"
else
    echo "Deployment failed with status: $STATUS_CODE"
    exit 1
fi
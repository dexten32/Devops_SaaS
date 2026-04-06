#!/bin/bash

# --- Environment Checks ---
echo "Checking environment..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Error: Docker is not running. Start the docker daemon first."
    exit 1
fi

# --- Setup Workspace ---

WORKSPACE="workspace"
rm -rf "$WORKSPACE"
mkdir "$WORKSPACE"
cd "$WORKSPACE" || exit

#Create dummy HTML Project
echo "<h1>Deploy Successfull!</h1><p>Build time: $(date)</p>" > index.html

#Generate Dynamic Docker file
echo "--- Generating Dockerfile ---"
cat <<EOF > Dockerfile
from nginx:alpine
copy index.html /usr/share/nginx/html/index.html
EXPOSE 80
EOF


# --- Build and Run ---

TAG="myapp:v$(date +%s)"
CONTAINER_NAME="my_web_app"

echo "Building Image $TAG..."
docker build -t "$TAG" .

echo "Removing old container if exists..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Running container on port 8080..."
docker run -d --name "$CONTAINER_NAME" -p 8080:80 "$TAG"

#--- Health Check ---
echo "Performing health check..."
sleep 2
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "Success! The site is live at http://localhost:8080"
else
    echo "Deployment failed with status: $STATUS_CODE"
    exit 1
fi

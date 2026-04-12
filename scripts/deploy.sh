#!/usr/bin/env bash
set -euo pipefail

# Dashlink - Deploy / Update Script

PROJECT_DIR="${PROJECT_DIR:-/opt/dashlink}"
cd "$PROJECT_DIR"

echo "==> Pulling latest changes..."
git pull origin main

echo "==> Pulling latest images..."
docker compose pull

echo "==> Backing up current config..."
mkdir -p ./backups
docker compose cp backend:/data/config.yml ./backups/config-$(date +%Y%m%d-%H%M%S).yml 2>/dev/null || true

echo "==> Starting updated services..."
docker compose up -d --remove-orphans

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Checking health..."
sleep 5
if curl -sf http://localhost/health > /dev/null; then
  echo "==> Deploy successful! Health check passed."
else
  echo "==> WARNING: Health check failed. Check logs:"
  echo "    docker compose logs --tail 50"
fi

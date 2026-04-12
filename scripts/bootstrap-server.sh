#!/usr/bin/env bash
set -euo pipefail

# Dashlink - Server Bootstrap Script
# Run on a fresh VPS to set up everything needed for deployment.

echo "==> Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo "==> Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  sudo systemctl enable docker
  echo "Docker installed. You may need to log out/in for group changes."
fi

echo "==> Installing Docker Compose plugin..."
sudo apt-get install -y docker-compose-plugin

echo "==> Creating project directory..."
sudo mkdir -p /opt/dashlink
sudo chown "$USER:$USER" /opt/dashlink

echo "==> Cloning repository..."
if [ ! -d /opt/dashlink/.git ]; then
  git clone https://github.com/Vatsonio/dashlink.git /opt/dashlink
fi

cd /opt/dashlink

echo "==> Creating .env from example..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Edit /opt/dashlink/.env with your domain and settings."
fi

echo "==> Starting services..."
docker compose up -d --build

echo ""
echo "==> Bootstrap complete!"
echo "    Dashboard: http://$(hostname -I | awk '{print $1}')"
echo "    Edit config: /opt/dashlink/.env"
echo "    Logs: docker compose -f /opt/dashlink/docker-compose.yml logs -f"

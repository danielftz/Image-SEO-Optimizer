#!/bin/bash
# Deployment script for Image SEO Optimizer on VPS
# Run after git pull: ./deploy.sh
# Assumes: Run as user with sudo access to systemctl reload nginx and restart image-seo-api
# Initial setup required: See deployment docs for Nginx config, systemd service, /var/www dir
# Uses rsync for incremental sync of all static files (HTML, CSS, JS)

set -e  # Exit on any error

PROJECT_DIR="$(pwd)"
STATIC_DIR="/var/www/image-seo-optimizer"

echo "Starting deployment from $PROJECT_DIR..."

# Step 1: Build client TypeScript (compiles in place to src/client/codeBehind/index.js)
echo "Building client TypeScript..."
bun run build  # Assumes "build": "tsc" in package.json; outputs JS in codeBehind dir

# Step 2: Incremental copy static files to /var/www/image-seo-optimizer with clean structure using rsync
echo "Syncing static files to $STATIC_DIR..."
mkdir -p "$STATIC_DIR/css" "$STATIC_DIR/js"

# Sync HTML to root (rsync for consistency, even if single file)
rsync -av src/client/index.html "$STATIC_DIR/"

# Sync CSS
rsync -av src/client/css/ "$STATIC_DIR/css/"

# Sync compiled JS from codeBehind to js/
rsync -av src/client/codeBehind/*.js "$STATIC_DIR/js/"

echo "Static files synced."

# Step 3: Reload Nginx (graceful, no restart needed for static changes)
echo "Reloading Nginx..."
if ! sudo nginx -t; then
  echo "Nginx config test failed!"
  exit 1
fi
sudo systemctl reload nginx
echo "Nginx reloaded."

# Step 4: Restart Bun API service (systemd handles NODE_ENV=production, PORT=3000)
echo "Restarting Bun API service..."
sudo systemctl restart image-seo-api
if [ $? -ne 0 ]; then
  echo "Failed to restart image-seo-api service!"
  exit 1
fi

echo "Deployment complete! Check status: sudo systemctl status image-seo-api"
echo "Logs: journalctl -u image-seo-api -f"
echo "Test API: curl http://localhost:6969/api/getNewSession"
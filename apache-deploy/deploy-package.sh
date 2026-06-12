#!/bin/bash
# deploy-package.sh
# Run this after `npm run build` to create a ready-to-upload deployment package

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/deploy-package"

echo "📦 Creating deployment package..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 1. Copy standalone server (includes node_modules it needs)
echo "→ Copying standalone server..."
cp -r "$PROJECT_DIR/.next/standalone/." "$OUTPUT_DIR/"

# 2. Copy static assets (not included in standalone by default)
echo "→ Copying static assets..."
mkdir -p "$OUTPUT_DIR/.next/static"
cp -r "$PROJECT_DIR/.next/static/." "$OUTPUT_DIR/.next/static/"

# 3. Copy public folder
echo "→ Copying public folder..."
mkdir -p "$OUTPUT_DIR/public"
cp -r "$PROJECT_DIR/public/." "$OUTPUT_DIR/public/"

# 4. Copy env file (edit on server as needed)
if [ -f "$PROJECT_DIR/.env.local" ]; then
  echo "→ Copying .env.local..."
  cp "$PROJECT_DIR/.env.local" "$OUTPUT_DIR/.env.local"
fi

echo ""
echo "✅ Done! Deployment package created at: $OUTPUT_DIR"
echo ""
echo "Upload to server:"
echo "  scp -r deploy-package/ user@your-server:/var/www/pingme/"
echo ""
echo "Then on the server:"
echo "  cd /var/www/pingme"
echo "  npm install -g pm2"
echo "  pm2 start server.js --name pingme"
echo "  pm2 save && pm2 startup"

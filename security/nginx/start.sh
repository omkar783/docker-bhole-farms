#!/bin/sh
# ============================================
# Nginx startup — bootstrap SSL if Let's Encrypt
# certs aren't available yet
# ============================================

# Check if Let's Encrypt certs exist
LETSENCRYPT_DIR="/etc/letsencrypt/live/bholefarms.com"

if [ ! -f "$LETSENCRYPT_DIR/fullchain.pem" ]; then
    echo "==> Let's Encrypt certs not found. Using self-signed bootstrap certs."
    echo "    Run certbot later to obtain real certificates."
    echo "    docker compose exec certbot certbot certonly --webroot ..."
    
    # Create the expected directory structure with self-signed certs
    mkdir -p "$LETSENCRYPT_DIR"
    ln -sf /etc/nginx/ssl/bootstrap.crt "$LETSENCRYPT_DIR/fullchain.pem"
    ln -sf /etc/nginx/ssl/bootstrap.key "$LETSENCRYPT_DIR/privkey.pem"
else
    echo "==> Let's Encrypt certificates found at $LETSENCRYPT_DIR"
fi

exit 0

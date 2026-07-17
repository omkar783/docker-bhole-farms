#!/bin/sh
# ============================================
# Bhole Farms — SSL Certificate Bootstrap
# Run once to obtain initial Let's Encrypt certs
# ============================================
set -e

DOMAIN="${1:-bholefarms.com}"
EMAIL="${2:-admin@bholefarms.com}"

echo "==> Obtaining SSL certificate for $DOMAIN ..."

# Ensure Nginx is serving the certbot challenge directory
mkdir -p /var/www/certbot

# Obtain certificate (standalone mode — Nginx must NOT be running on port 80)
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --domains "$DOMAIN" \
  --domains "www.$DOMAIN" \
  --preferred-challenges http \
  --http-01-port 80

echo "==> Certificate obtained successfully!"
echo "    Location: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "Now start the full stack with:"
echo "  docker compose up -d"

# Print renewal instructions
echo ""
echo "==> Auto-renewal is handled by the certbot sidecar container."
echo "    Certs renew automatically every 12 hours."

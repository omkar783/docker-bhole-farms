# ============================================
# Bhole Farms — Nginx with Security Hardening
# ============================================

FROM nginx:1.27-alpine

# Install certbot for Let's Encrypt SSL + openssl for self-signed fallback
RUN apk add --no-cache certbot certbot-nginx openssl

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our configs
COPY nginx.conf /etc/nginx/conf.d/bhole.conf
COPY hardening.conf /etc/nginx/hardening.conf
COPY start.sh /docker-entrypoint.d/99-start.sh

# Create directories
RUN mkdir -p /var/www/certbot /var/log/nginx

# Generate self-signed SSL cert as bootstrap (replaced by certbot later)
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/bootstrap.key \
    -out /etc/nginx/ssl/bootstrap.crt \
    -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Bhole Farms/CN=bholefarms.com"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD nc -z localhost 80 || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

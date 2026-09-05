# UDAYA CYCLES — Deployment Guide

## Self-Hosted Docker + Nginx Deployment

### Target Architecture

```
Internet → Domain (udayacycles.com)
         → Nginx (SSL termination, reverse proxy)
         → Docker: Next.js App (port 3000)
         → External: MongoDB Atlas, Cloudinary, Razorpay
```

---

## Prerequisites

- Linux VPS (Ubuntu 22.04+ recommended)
- Docker Engine + Docker Compose installed
- Nginx installed
- Certbot (Let's Encrypt) installed
- Domain pointed to VPS IP
- GitHub repository (or direct file transfer)

---

## Project Structure for Deployment

```
/opt/udaya-cycles/
├── docker-compose.yml
├── Dockerfile
├── .env.production         # ← NOT in git; created on server
├── nginx/
│   └── udaya.conf
└── scripts/
    ├── deploy.sh
    └── health-check.sh
```

---

## Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  udaya-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: udaya-web
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - udaya-net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

networks:
  udaya-net:
    driver: bridge
```

---

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/udayacycles.com

upstream udaya_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name udayacycles.com www.udayacycles.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name udayacycles.com www.udayacycles.com;

    # SSL (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/udayacycles.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/udayacycles.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com; connect-src 'self' https://api.razorpay.com; frame-src https://api.razorpay.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Static files (Next.js _next/static)
    location /_next/static {
        proxy_pass http://udaya_app;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Main app proxy
    location / {
        proxy_pass http://udaya_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Webhook endpoints (no buffering)
    location /api/webhooks {
        proxy_pass http://udaya_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

---

## Deployment Steps

### Initial Setup (Server)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Install Docker Compose
sudo apt install docker-compose-plugin

# 3. Install Nginx
sudo apt install nginx

# 4. Install Certbot
sudo apt install certbot python3-certbot-nginx

# 5. Create app directory
sudo mkdir -p /opt/udaya-cycles
sudo chown $USER:$USER /opt/udaya-cycles
```

### SSL Certificate

```bash
# Get SSL certificate (before setting up nginx proxy)
sudo certbot --nginx -d udayacycles.com -d www.udayacycles.com

# Auto-renewal (already set up by certbot, verify):
sudo certbot renew --dry-run
```

### First Deployment

```bash
# 1. Clone repository
cd /opt/udaya-cycles
git clone https://github.com/yourusername/udaya-cycles.git .

# 2. Create .env.production (copy from .env.example and fill values)
cp .env.example .env.production
nano .env.production

# 3. Build and start
docker compose up -d --build

# 4. Seed initial super admin
docker exec udaya-web node scripts/seed-admin.js

# 5. Enable nginx site
sudo ln -s /etc/nginx/sites-available/udayacycles.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Update Deployment

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Pulling latest changes..."
git pull origin main

echo "Building Docker image..."
docker compose build

echo "Restarting application..."
docker compose up -d

echo "Health check..."
sleep 10
wget -qO- http://localhost:3000/api/health && echo "✅ Application is healthy" || echo "❌ Health check failed"
```

---

## Health Check Endpoint

The `/api/health` endpoint returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 12345
}
```

Returns `200 OK` when healthy, `503` when degraded.

---

## next.config.js (Production Settings)

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',       // Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};
```

---

## Backup Strategy

### MongoDB Atlas

- Enable automated backups in Atlas cluster settings
- Set backup frequency: daily
- Retention: 7 days minimum

### Application Files

```bash
# Cron: daily backup of env and nginx configs
0 2 * * * tar -czf /backups/udaya-config-$(date +%Y%m%d).tar.gz /opt/udaya-cycles/.env.production /etc/nginx/sites-available/udayacycles.com
```

---

## Monitoring

- Atlas built-in monitoring for MongoDB
- Docker: `docker stats udaya-web` for container metrics
- Nginx: `/var/log/nginx/access.log` and `error.log`
- Application: `/api/health` endpoint for uptime monitoring (e.g., UptimeRobot)

# ============================================
# Bhole Farms — Dockerfile (Multi-Stage Build)
# Next.js 16 + Prisma + PostgreSQL
# ============================================

# Stage 1: Base — shared dependencies
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Stage 2: Dependencies — install ALL deps (dev needed for build)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Stage 3: Build — full install + Prisma generate + Next build
FROM base AS builder
WORKDIR /app

ENV NODE_ENV=production

# Build-time args (required for modules that init at import time)
ARG RESEND_API_KEY
ARG ADMIN_EMAIL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXTAUTH_URL
ARG AUTH_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV ADMIN_EMAIL=$ADMIN_EMAIL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV AUTH_URL=$AUTH_URL

# Copy cached deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (outputs to src/generated/prisma/)
RUN npx prisma generate

# Build Next.js with standalone output
RUN npm run build

# Stage 4: Runner — minimal production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets (Next.js standalone excludes these)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets (images, uploads, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema for migrations/seeding
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy generated Prisma client (needed at runtime for query engine)
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# Copy Prisma config (v7 requires this for datasource URL — read from env)
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Create writable upload directory
RUN mkdir -p /app/public/uploads/temp && chown -R nextjs:nodejs /app/public/uploads

# Install Prisma CLI in runner for runtime migrations (minimal, no dev deps)
RUN npm install prisma --save-dev --ignore-scripts

# Create startup script that creates tables then starts the app
# Uses `db push` instead of `migrate deploy` — no migration files needed
RUN printf '#!/bin/sh\nset -e\nnpx prisma db push --schema=./prisma/schema.prisma\nexec node server.js\n' > /app/start.sh && chmod +x /app/start.sh

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["/app/start.sh"]

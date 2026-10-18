# ----------------------------------------------------
# SaveBite Backend - Production Enterprise Dockerfile
# Multi-stage, Non-root User, glibc optimized
# ----------------------------------------------------

# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /app

# OpenSSL necesar pentru Prisma Engine
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

# Stage 2: Production Dependencies
FROM node:20-slim AS dependencies
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

# Stage 3: Minimal Secure Production Runner
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl dumb-init && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

USER node

COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=dependencies /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package.json ./

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/main.js"]

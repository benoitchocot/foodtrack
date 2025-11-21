# Backend Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Install tsx for running TypeScript files (better than ts-node)
RUN npm install -g tsx

# Copy Prisma schema, migrations, seed file and generate client
# Copy prisma directory (includes schema, migrations, and seed)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads/images

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script (applies migrations automatically)
ENTRYPOINT ["/app/docker-entrypoint.sh"]

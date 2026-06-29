# Stage 1 — Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — Backend runtime
FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

RUN apk del python3 make g++

COPY backend/ ./

# Copy built frontend into backend's public/ folder
COPY --from=frontend-builder /app/dist ./public

# Persistent storage for SQLite
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "server.js"]

# ============================================================
#  Dockerfile — Cineverse Frontend (React + Vite)
#  Day 10: Docker & Containerization
# ============================================================
#
#  MULTI-STAGE BUILD PATTERN:
#  ┌─────────────────────────────────────────────────────────┐
#  │  Stage 1 (builder): Node.js installs deps + builds      │
#  │                     static files (npm run build)        │
#  │  Stage 2 (runtime): Nginx serves the static build/      │
#  │                     folder on port 80                   │
#  └─────────────────────────────────────────────────────────┘
#
#  Academic Insight:
#  React/Vite builds produce static HTML/CSS/JS files in dist/.
#  We serve these with Nginx — a high-performance web server.
#  This is the standard production pattern for React apps.
#
#  Flow: Dockerfile → Image → Container → React App on port 80
# ============================================================

# ── Stage 1: Build Stage (Node.js) ──────────────────────────
# FROM: Node 18 LTS (matches curriculum example)
# Node 20 required — Vite 8 (used in this project) needs Node.js 20+
# Node 18 causes "CustomEvent is not defined" error with Vite 8
FROM node:20-alpine AS builder

# WORKDIR: All commands run from /app
WORKDIR /app

# COPY package.json first (layer caching)
# npm install only re-runs if package.json or package-lock.json changes
COPY package.json package-lock.json* ./

# RUN npm install: Install all dependencies
# --frozen-lockfile ensures reproducible installs
RUN npm install

# COPY: Rest of source code
COPY . .

# RUN npm run build: Vite compiles React app to dist/ folder
# Output: /app/dist/ (static HTML, CSS, JS, assets)
RUN npm run build


# ── Stage 2: Runtime Stage (Nginx) ──────────────────────────
# FROM: Nginx alpine — extremely lightweight web server (~23MB)
FROM nginx:alpine

# COPY: Copy the compiled static files from builder stage
# → to Nginx's default web root
COPY --from=builder /app/dist /usr/share/nginx/html

# COPY: Custom Nginx config for React Router (SPA support)
# Ensures all routes (/dashboard, /catalog, /booking) resolve to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE: Nginx listens on port 80
EXPOSE 80

# CMD: Start Nginx in foreground mode (daemon off = stays running in Docker)
CMD ["nginx", "-g", "daemon off;"]

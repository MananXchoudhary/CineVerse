# 🎬 Cineverse — Docker & Containerization Guide
## Day 10: Docker & Containerization

---

## 📦 Project Architecture

```
Docker Compose
      │
      ├── frontend (React + Nginx)     → http://localhost:3000
      ├── booking-service (Spring Boot) → http://localhost:8080
      ├── postgres (PostgreSQL 15)      → localhost:5432
      ├── redis (Redis 7)               → localhost:6379
      ├── rabbitmq (RabbitMQ 3)         → localhost:5672 | UI: 15672
      └── mongodb (MongoDB 7)           → localhost:27017
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Docker version ≥ 20.x

### 1. Clone and Setup
```bash
# Copy environment file
cp .env.example .env
# (Edit .env if you want custom credentials)
```

### 2. Run the Entire System
```bash
# Start all services (builds images on first run)
docker-compose up

# Run in background (detached mode)
docker-compose up -d

# Force rebuild images
docker-compose up --build
```

### 3. Access the Application
| Service | URL |
|---------|-----|
| 🌐 Frontend (React) | http://localhost:3000 |
| 🔧 Booking API | http://localhost:8080/booking |
| 🐰 RabbitMQ UI | http://localhost:15672 (cineverse / cineverse_mq_pass) |
| 🗄️ PostgreSQL | localhost:5432 |
| 🔴 Redis | localhost:6379 |
| 🍃 MongoDB | localhost:27017 |

---

## 🐳 Individual Docker Commands

### Build Images
```bash
# Build booking-service image
docker build -t booking-service ./cineverse-backend

# Build frontend image
docker build -t cineverse-frontend "./DOMAIN CAMP"
```

### Run Individual Containers
```bash
# Run booking-service
docker run -p 8080:8080 booking-service

# Run frontend
docker run -p 3000:80 cineverse-frontend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f booking-service
docker-compose logs -f postgres
```

---

## 🛑 Stop & Cleanup

```bash
# Stop all containers (data preserved)
docker-compose down

# Stop and remove volumes (fresh database)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

---

## 📁 File Structure

```
sem 6- FSD/
├── docker-compose.yml          ← Main orchestration file
├── .env                        ← Environment variables (DO NOT COMMIT)
├── .env.example                ← Template (safe to commit)
├── docker/
│   └── postgres/
│       └── init.sql            ← DB initialization script
│
├── cineverse-backend/          ← Spring Boot Booking Service
│   ├── Dockerfile              ← Multi-stage Java build
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/
│
└── DOMAIN CAMP/                ← React Frontend
    ├── Dockerfile              ← Multi-stage Node → Nginx build
    ├── .dockerignore
    ├── nginx.conf              ← SPA routing + API proxy
    └── src/
```

---

## 🎓 Academic Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| VM vs Docker | Lightweight containers vs full OS VMs |
| Image vs Container | Dockerfile → Image → Running Container |
| Multi-stage build | Builder stage + runtime stage (smaller image) |
| Docker networking | Services talk via service names (not localhost) |
| Environment variables | `.env` → `docker-compose.yml` → container |
| Named volumes | Postgres/Redis/Mongo data survives restarts |
| Health checks | Postgres/RabbitMQ healthcheck before Spring Boot starts |
| Port mapping | `-p HOST:CONTAINER` in ports section |
| depends_on | Service startup ordering |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | `docker-compose down` or change port in `.env` |
| Spring Boot can't connect to DB | Wait for postgres healthcheck to pass |
| Container keeps restarting | `docker-compose logs booking-service` to see errors |
| Out of memory | Increase Docker Desktop memory in Settings |
| Old cached image | `docker-compose up --build` to force rebuild |

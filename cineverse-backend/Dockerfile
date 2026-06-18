# ============================================================
#  Dockerfile — Cineverse Booking Service (Spring Boot)
#  Day 10: Docker & Containerization
# ============================================================
#
#  MULTI-STAGE BUILD PATTERN:
#  ┌─────────────────────────────────────────────────────────┐
#  │  Stage 1 (builder): Uses Maven + JDK to compile and     │
#  │                     package the JAR                     │
#  │  Stage 2 (runtime): Uses slim JRE to run the JAR        │
#  │                     (smaller final image ~200MB vs 600MB)│
#  └─────────────────────────────────────────────────────────┘
#
#  Flow: Dockerfile → Image → Container → Running Spring Boot App
#
#  Academic Insight:
#  Multi-stage builds keep the final image clean and small.
#  Only the compiled JAR is copied to the runtime stage —
#  Maven, JDK source files are NOT included in production image.
# ============================================================

# ── Stage 1: Build Stage ────────────────────────────────────
# FROM: Base image — Maven 3.9 with JDK 17 (slim variant)
FROM maven:3.9-eclipse-temurin-17 AS builder

# WORKDIR: All subsequent commands run from /app inside the container
WORKDIR /app

# COPY pom.xml first (Docker layer caching optimization)
# If only source code changes, Maven dependencies are NOT re-downloaded
COPY pom.xml .

# Download all Maven dependencies (cached layer unless pom.xml changes)
RUN mvn dependency:go-offline -B

# COPY rest of source code
COPY src ./src

# Build the JAR (skip tests — tests run in CI/CD pipeline separately)
# Output: target/booking-service.jar (matches <finalName> in pom.xml)
RUN mvn clean package -DskipTests


# FROM: eclipse-temurin:17-jre-alpine — official replacement for deprecated openjdk images
# openjdk images were deprecated in 2022; eclipse-temurin is the maintained successor
FROM eclipse-temurin:17-jre-alpine

# WORKDIR: Working directory inside the runtime container
WORKDIR /app

# COPY: Copy ONLY the JAR from the builder stage (not source code!)
# This is the key benefit of multi-stage builds
COPY --from=builder /app/target/booking-service.jar app.jar

# EXPOSE: Document that the app listens on port 8080
# (Does NOT actually publish the port — docker run -p or docker-compose does that)
EXPOSE 8080

# ENTRYPOINT: Command to run when the container starts
# Academic Insight: ENTRYPOINT is preferred over CMD for Java apps
# because it cannot be overridden accidentally
ENTRYPOINT ["java", "-jar", "app.jar"]

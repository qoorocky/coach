# syntax=docker/dockerfile:1.7

# --- Build stage: full JDK + maven wrapper, no need to keep around at runtime.
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /workspace

# Resolve dependencies first so subsequent code-only changes hit the cache.
COPY mvnw pom.xml ./
COPY .mvn ./.mvn
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -ntp -q dependency:go-offline

# Now copy sources and produce the boot jar.
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -ntp -q -DskipTests package \
    && cp target/cms-api-*.jar target/app.jar

# --- Runtime stage: JRE only, drop-privilege user, healthcheck wired to /actuator.
FROM eclipse-temurin:17-jre-jammy AS runtime
RUN useradd --system --create-home --uid 10001 coach
WORKDIR /app
COPY --from=builder /workspace/target/app.jar /app/app.jar

# Java + Spring boot expect 8080 by default; expose so docker/CI/PaaS can see it.
ENV JAVA_OPTS="" \
    SERVER_PORT=8080
EXPOSE 8080

USER coach
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]

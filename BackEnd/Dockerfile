# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Tạo user non-root
RUN useradd -m -u 1001 appuser

# Copy file jar từ stage build
COPY --from=builder /app/target/*.jar app.jar

# Tạo thư mục uploads và set quyền cho appuser
RUN mkdir -p /app/uploads \
    && chown -R appuser:appuser /app/uploads

# Expose port
EXPOSE 8080

# Chạy app bằng user non-root
USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"] 
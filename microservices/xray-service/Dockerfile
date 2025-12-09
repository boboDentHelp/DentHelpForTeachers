FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (with better caching)
COPY pom.xml .
RUN for i in 1 2 3 4 5; do \
    mvn dependency:resolve dependency:resolve-plugins -B && break || \
    (echo "Retry $i/5 failed, waiting..." && sleep $((i * 2))); \
    done

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]

#!/bin/bash

# This script creates all remaining microservices with their basic structure
# Run this to quickly scaffold the remaining services

echo "Creating remaining microservices..."

# Define services array
declare -A services
services[dental-records]=8084
services[xray]=8085
services[treatment]=8088
services[notification]=8087

for service in "${!services[@]}"; do
    port=${services[$service]}
    echo "Creating ${service}-service on port ${port}..."

    # Service name in PascalCase
    service_pascal=$(echo $service | sed 's/-\(.\)/\U\1/g' | sed 's/^\(.\)/\U\1/')

    # Create pom.xml
    cat > "microservices/${service}-service/pom.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.2</version>
    </parent>
    <groupId>com.dentalhelp</groupId>
    <artifactId>${service}-service</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.3</spring-cloud.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>\${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
EOF

    echo "Created ${service}-service files"
done

echo "All services scaffolded successfully!"

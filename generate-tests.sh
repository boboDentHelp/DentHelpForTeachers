#!/bin/bash

# Script to generate basic test structure for all microservices
# This creates unit tests and integration tests for each service

set -e

echo "🧪 Generating test structure for all microservices..."

# List of services
SERVICES=(
    "patient-service:com.dentalhelp.patient"
    "appointment-service:com.dentalhelp.appointment"
    "dental-records-service:com.dentalhelp.dentalrecords"
    "xray-service:com.dentalhelp.xray"
    "treatment-service:com.dentalhelp.treatment"
    "notification-service:com.dentalhelp.notification"
    "api-gateway:com.dentalhelp.gateway"
    "eureka-server:com.dentalhelp.eureka"
)

for service_package in "${SERVICES[@]}"; do
    SERVICE=$(echo $service_package | cut -d':' -f1)
    PACKAGE=$(echo $service_package | cut -d':' -f2)
    PACKAGE_PATH=$(echo $PACKAGE | tr '.' '/')

    echo "📝 Creating tests for $SERVICE..."

    # Create test directory structure
    mkdir -p "microservices/$SERVICE/src/test/java/$PACKAGE_PATH"/{service,controller,repository}
    mkdir -p "microservices/$SERVICE/src/test/resources"

    # Create application-test.yml
    cat > "microservices/$SERVICE/src/test/resources/application-test.yml" <<'EOF'
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
    show-sql: false

  h2:
    console:
      enabled: false

  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

eureka:
  client:
    enabled: false
    register-with-eureka: false
    fetch-registry: false

logging:
  level:
    root: WARN
EOF

    # Create basic service unit test
    SERVICE_NAME=$(echo $SERVICE | sed 's/-service//' | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1' | sed 's/ //g')

    cat > "microservices/$SERVICE/src/test/java/$PACKAGE_PATH/service/${SERVICE_NAME}ServiceTest.java" <<EOF
package ${PACKAGE}.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ${SERVICE_NAME}Service
 * TODO: Implement actual service tests based on service logic
 */
@ExtendWith(MockitoExtension.class)
class ${SERVICE_NAME}ServiceTest {

    @BeforeEach
    void setUp() {
        // Setup test data
    }

    @Test
    void testServiceExists() {
        // Basic test to verify test infrastructure works
        assertTrue(true, "Test infrastructure is working");
    }

    // TODO: Add service-specific tests
    // Example:
    // @Test
    // void testCreateEntity() {
    //     // Arrange
    //     // Act
    //     // Assert
    // }
}
EOF

    # Create basic integration test
    cat > "microservices/$SERVICE/src/test/java/$PACKAGE_PATH/controller/${SERVICE_NAME}ControllerIntegrationTest.java" <<EOF
package ${PACKAGE}.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for ${SERVICE_NAME}Controller
 * TODO: Implement actual controller tests based on endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ${SERVICE_NAME}ControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
        // Test that Spring context loads successfully
        assertNotNull(mockMvc);
    }

    @Test
    void testHealthEndpoint() throws Exception {
        // Most services have a health endpoint
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    // TODO: Add endpoint-specific tests
    // Example:
    // @Test
    // void testGetAll() throws Exception {
    //     mockMvc.perform(get("/api/path"))
    //         .andExpect(status().isOk())
    //         .andExpect(jsonPath("$").isArray());
    // }
}
EOF

    # Add test dependencies to pom.xml if not present
    if [ -f "microservices/$SERVICE/pom.xml" ]; then
        if ! grep -q "spring-boot-starter-test" "microservices/$SERVICE/pom.xml"; then
            echo "  Adding test dependencies to $SERVICE pom.xml..."

            # Find the closing </dependencies> tag and insert test dependencies before it
            sed -i '/<\/dependencies>/i\
\
        <!-- Testing Dependencies -->\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-test</artifactId>\
            <scope>test</scope>\
        </dependency>\
        <dependency>\
            <groupId>com.h2database</groupId>\
            <artifactId>h2</artifactId>\
            <scope>test</scope>\
        </dependency>' "microservices/$SERVICE/pom.xml"
        fi
    fi

    echo "✅ Tests created for $SERVICE"
done

echo ""
echo "🎉 Test structure generation complete!"
echo ""
echo "📊 Summary:"
echo "  - Created unit tests (service layer)"
echo "  - Created integration tests (controller layer)"
echo "  - Added test configuration files"
echo "  - Updated pom.xml with test dependencies"
echo ""
echo "📝 Next steps:"
echo "  1. Review generated test files"
echo "  2. Implement TODO test cases based on your service logic"
echo "  3. Run tests: cd microservices/SERVICE_NAME && mvn test"
echo "  4. Run integration tests: mvn verify"
echo ""

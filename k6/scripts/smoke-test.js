import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test - minimal load to verify system works
export const options = {
  vus: 1, // 1 user
  duration: '30s', // 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.01'],     // Less than 1% of requests should fail
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

export default function () {
  // Test health endpoints
  const services = [
    'eureka-server:8761',
    'api-gateway:8080',
    'auth-service:8081',
    'patient-service:8082',
    'appointment-service:8083',
    'notification-service:8087',
  ];

  for (const service of services) {
    const url = `http://${service}/actuator/health`;
    const response = http.get(url);

    check(response, {
      [`${service} is UP`]: (r) => r.status === 200,
    });
  }

  sleep(1);
}

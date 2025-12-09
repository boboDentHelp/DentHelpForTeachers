import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Stress test: Gradually increase load beyond normal capacity
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 200 },  // Ramp up to 200 users (stress level)
    { duration: '5m', target: 300 },  // Ramp up to 300 users (breaking point)
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% should be below 1s under stress
    'http_req_failed': ['rate<0.1'],     // Allow 10% error rate under stress
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/actuator/health`],
    ['GET', `${BASE_URL}/api/appointments`],
    ['GET', `${BASE_URL}/api/patients`],
  ]);

  responses.forEach((response) => {
    check(response, {
      'status is 200 or 401': (r) => [200, 401].includes(r.status),
    }) ? null : errorRate.add(1);
  });

  sleep(1);
}

export function handleSummary(data) {
  console.log('📊 Stress Test Results:');
  console.log('========================');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`p(95) Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);

  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

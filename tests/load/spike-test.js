import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Spike test: Sudden increase in load
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal load
    { duration: '10s', target: 500 },  // Sudden spike!
    { duration: '2m', target: 500 },   // Sustained spike
    { duration: '1m', target: 50 },    // Return to normal
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // Allow 2s during spike
    'http_req_failed': ['rate<0.15'],    // Allow 15% error during spike
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';

export default function () {
  // Simulate rapid requests during spike
  const endpoints = [
    `${BASE_URL}/actuator/health`,
    `${BASE_URL}/api/appointments`,
    `${BASE_URL}/api/patients`,
    `${BASE_URL}/api/treatments`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(endpoint);

  check(response, {
    'status is 200 or 401 or 404': (r) => [200, 401, 404].includes(r.status),
  }) ? null : errorRate.add(1);

  sleep(0.5); // Shorter sleep for higher request rate during spike
}

export function handleSummary(data) {
  console.log('📊 Spike Test Results:');
  console.log('======================');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms`);
  console.log(`p(95) Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`p(99) Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);

  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

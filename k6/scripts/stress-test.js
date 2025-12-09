import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestDuration = new Trend('request_duration');

// Stress test - push system to limits
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 400 },  // Ramp up to 400 users (stress)
    { duration: '3m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s under stress
    http_req_failed: ['rate<0.3'],      // Less than 30% of requests should fail under stress
    errors: ['rate<0.3'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

function randomEmail() {
  return `stress${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

function randomPhone() {
  return `+40${Math.floor(Math.random() * 1000000000)}`;
}

export default function () {
  const scenarios = [
    testRegistration,
    testLogin,
    testHealthCheck,
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();

  sleep(Math.random() * 3); // Random sleep between 0-3 seconds
}

function testRegistration() {
  const payload = JSON.stringify({
    email: randomEmail(),
    password: 'Stress123!@#',
    firstName: 'Stress',
    lastName: 'Test',
    phoneNumber: randomPhone(),
    dateOfBirth: '1990-01-01'
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'StressRegistration' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  requestDuration.add(new Date() - startTime);

  const success = check(response, {
    'registration successful': (r) => r.status === 200 || r.status === 201,
  });

  errorRate.add(!success);
}

function testLogin() {
  const payload = JSON.stringify({
    email: `test@example.com`,
    password: 'Test123!@#',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'StressLogin' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  requestDuration.add(new Date() - startTime);

  const success = check(response, {
    'login attempted': (r) => r.status > 0,
  });

  errorRate.add(!success);
}

function testHealthCheck() {
  const response = http.get(`${BASE_URL}/actuator/health`);

  const success = check(response, {
    'health check ok': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

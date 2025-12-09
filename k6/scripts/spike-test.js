import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const registrationDuration = new Trend('registration_duration');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');
const spikeMaxDuration = new Trend('spike_max_duration');

// Spike test configuration
// Tests sudden burst of traffic: 10 → 500 users in 10 seconds
export const options = {
  stages: [
    { duration: '30s', target: 10 },    // Baseline - normal traffic
    { duration: '10s', target: 500 },   // SPIKE! Sudden burst (50x increase)
    { duration: '1m', target: 500 },    // Sustain spike to observe auto-scaling
    { duration: '10s', target: 10 },    // Sudden drop back to normal
    { duration: '1m', target: 10 },     // Recovery observation period
    { duration: '30s', target: 0 },     // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // Relaxed threshold during spike (5s)
    http_req_failed: ['rate<0.10'],     // Allow up to 10% errors during spike
    errors: ['rate<0.10'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

// Helper function to generate random email
function randomEmail() {
  return `spike${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

// Helper function to generate random phone
function randomPhone() {
  return `+40${Math.floor(Math.random() * 1000000000)}`;
}

export default function () {
  const email = randomEmail();
  const password = 'SpikeTest123!@#';

  // Test 1: User Registration
  testRegistration(email, password);
  sleep(1);

  // Test 2: User Login
  const token = testLogin(email, password);
  sleep(1);

  if (token) {
    // Test 3: Get User Profile
    testGetProfile(token);
    sleep(1);
  }
}

function testRegistration(email, password) {
  const payload = JSON.stringify({
    email: email,
    password: password,
    firstName: 'Spike',
    lastName: 'Test',
    phoneNumber: randomPhone(),
    dateOfBirth: '1990-01-01'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'SpikeRegistration' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  const duration = new Date() - startTime;

  registrationDuration.add(duration);
  spikeMaxDuration.add(duration);

  const success = check(response, {
    'registration status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'registration response has body': (r) => r.body.length > 0,
  });

  errorRate.add(!success);
}

function testLogin(email, password) {
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'SpikeLogin' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  const duration = new Date() - startTime;

  loginDuration.add(duration);
  spikeMaxDuration.add(duration);

  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined && body.token !== null;
      } catch (e) {
        return false;
      }
    },
  });

  if (success) {
    successfulLogins.add(1);
    try {
      const body = JSON.parse(response.body);
      return body.token;
    } catch (e) {
      console.error('Failed to parse login response:', e);
      failedLogins.add(1);
      return null;
    }
  } else {
    failedLogins.add(1);
    errorRate.add(true);
    return null;
  }
}

function testGetProfile(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'SpikeGetProfile' },
  };

  const startTime = new Date();
  const response = http.get(`${BASE_URL}/api/auth/profile`, params);
  const duration = new Date() - startTime;

  spikeMaxDuration.add(duration);

  const success = check(response, {
    'get profile status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}█ SPIKE TEST SUMMARY\n`;
  summary += `${indent}═══════════════════════════════════════\n\n`;

  summary += `${indent}Scenario: 10 → 500 users in 10 seconds\n`;
  summary += `${indent}Purpose: Test auto-scaling response to sudden traffic burst\n\n`;

  const metrics = data.metrics;

  if (metrics.http_req_duration) {
    summary += `${indent}Response Times:\n`;
    summary += `${indent}  avg=${metrics.http_req_duration.values.avg.toFixed(0)}ms  `;
    summary += `p(95)=${metrics.http_req_duration.values['p(95)'].toFixed(0)}ms  `;
    summary += `max=${metrics.http_req_duration.values.max.toFixed(0)}ms\n`;
  }

  if (metrics.spike_max_duration) {
    summary += `${indent}  Spike Impact: max=${metrics.spike_max_duration.values.max.toFixed(0)}ms\n\n`;
  }

  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Error Rate: ${failRate}%\n`;
  }

  if (metrics.successful_logins && metrics.failed_logins) {
    const total = metrics.successful_logins.values.count + metrics.failed_logins.values.count;
    const successRate = ((metrics.successful_logins.values.count / total) * 100).toFixed(2);
    summary += `${indent}Login Success Rate: ${successRate}%\n`;
  }

  summary += `${indent}\n`;
  summary += `${indent}Key Observations:\n`;
  summary += `${indent}  - Watch HPA metrics during spike (kubectl get hpa -w)\n`;
  summary += `${indent}  - Expect initial error rate spike before auto-scaling kicks in\n`;
  summary += `${indent}  - Auto-scaling typically takes 60-90s to stabilize\n`;
  summary += `${indent}═══════════════════════════════════════\n`;

  return summary;
}

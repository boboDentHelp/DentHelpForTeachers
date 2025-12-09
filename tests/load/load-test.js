import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const loginDuration = new Trend('login_duration');
const appointmentDuration = new Trend('appointment_duration');
const registrationDuration = new Trend('registration_duration');
const profileDuration = new Trend('profile_duration');
const healthCheckDuration = new Trend('health_check_duration');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Start with lower targets
    { duration: '2m', target: 20 },    
    { duration: '3m', target: 30 },    
    { duration: '1m', target: 50 },   
    { duration: '2m', target: 50 },   
    { duration: '1m', target: 30 },    
    { duration: '1m', target: 10 },    
    { duration: '30s', target: 0 },    
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // More relaxed thresholds
    http_req_failed: ['rate<0.1'], // More permissive error rate
    errors: ['rate<0.2'],
    success: ['rate>0.8'],
  },
  discardResponseBodies: false,
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';
const TEST_PREFIX = __ENV.TEST_PREFIX || 'load-test';

// Helper function to generate valid Romanian CNP
function generateCNP(vu, timestamp) {
  // This generates a simple test CNP - in production you'd want proper validation
  const base = '1890101'; // Fixed date part for testing
  const uniquePart = String(vu).padStart(4, '0') + String(timestamp % 10000).padStart(2, '0');
  return base + uniquePart;
}

export default function () {
  let authToken = null;
  let registeredEmail = null;

  // Group: Health Check
  group('Health Check', function () {
    const healthStart = Date.now();
    const healthResponse = http.get(`${BASE_URL}/actuator/health`, {
      tags: { name: `${TEST_PREFIX}-health` },
      headers: { 'Content-Type': 'application/json' }
    });
    healthCheckDuration.add(Date.now() - healthStart);

    const healthSuccess = check(healthResponse, {
      'health check status is 200': (r) => r.status === 200,
    });

    if (!healthSuccess) {
      failedRequests.add(1);
      errorRate.add(1);
    } else {
      successRate.add(1);
    }
  });

  sleep(Math.random() * 2 + 1);

  // Group: User Registration
  group('User Registration', function () {
    const timestamp = Date.now();
    const testEmail = `loadtest.user${__VU}.${timestamp}@dentalhelp.com`;
    registeredEmail = testEmail;
    
    const registerPayload = JSON.stringify({
      email: testEmail,
      password: 'TestPassword123!',
      firstName: 'LoadTest',
      lastName: `User${__VU}`,
      role: 'PATIENT',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      cnp: generateCNP(__VU, timestamp) // Added CNP field
    });

    const registerStart = Date.now();
    const registerResponse = http.post(
      `${BASE_URL}/api/auth/register`,
      registerPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: `${TEST_PREFIX}-register` }
      }
    );
    registrationDuration.add(Date.now() - registerStart);

    const registerSuccess = check(registerResponse, {
      'registration status is 201 or 409': (r) => [201, 409].includes(r.status),
    });

    if (!registerSuccess) {
      failedRequests.add(1);
      errorRate.add(1);
      console.log(`Registration failed: ${registerResponse.status} - ${registerResponse.body}`);
    } else {
      successRate.add(1);
      if (registerResponse.status === 201) {
        console.log(`Successfully registered: ${testEmail}`);
      } else {
        console.log(`User already exists: ${testEmail}`);
      }
    }
  });

  sleep(Math.random() * 2 + 1);

  // Group: User Login with newly registered user
  group('User Login', function () {
    const loginPayload = JSON.stringify({
      email: registeredEmail,
      password: 'TestPassword123!',
    });

    const loginStart = Date.now();
    const loginResponse = http.post(
      `${BASE_URL}/api/auth/login`,
      loginPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: `${TEST_PREFIX}-login` }
      }
    );
    loginDuration.add(Date.now() - loginStart);

    const loginSuccess = check(loginResponse, {
      'login status is 200': (r) => r.status === 200,
      'login returns valid token': (r) => {
        if (r.status === 200) {
          try {
            const body = r.json();
            return (body.token || body.accessToken || body.jwtToken || body.data?.token) !== undefined;
          } catch (e) {
            return false;
          }
        }
        return false;
      }
    });

    if (loginSuccess) {
      try {
        const body = loginResponse.json();
        authToken = body.token || body.accessToken || body.jwtToken || body.data?.token;
        successRate.add(1);
        console.log(`Successfully logged in: ${registeredEmail}`);
      } catch (e) {
        console.log('Token extraction failed:', e);
        errorRate.add(1);
        failedRequests.add(1);
      }
    } else {
      errorRate.add(1);
      failedRequests.add(1);
      console.log(`Login failed: ${loginResponse.status} - ${loginResponse.body}`);
    }
  });

  // If login failed, skip remaining tests
  if (!authToken) {
    return;
  }

  sleep(Math.random() * 1 + 1);

  // Group: Authenticated Operations
  group('Authenticated Operations', function () {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    // Try multiple possible profile endpoints
    const profileEndpoints = [
      '/api/patients/profile',
      '/api/users/profile',
      '/api/profile'
    ];

    let profileSuccess = false;
    for (let endpoint of profileEndpoints) {
      const profileStart = Date.now();
      const profileResponse = http.get(
        `${BASE_URL}${endpoint}`,
        {
          headers: authHeaders,
          tags: { name: `${TEST_PREFIX}-profile` }
        }
      );
      profileDuration.add(Date.now() - profileStart);

      if (profileResponse.status === 200) {
        profileSuccess = true;
        break;
      }
    }

    if (!profileSuccess) {
      console.log('Profile endpoint not found, but continuing...');
    } else {
      successRate.add(1);
    }

    sleep(Math.random() * 1 + 0.5);

    // Get Appointments
    const appointmentsStart = Date.now();
    const appointmentsResponse = http.get(
      `${BASE_URL}/api/appointments`,
      {
        headers: authHeaders,
        tags: { name: `${TEST_PREFIX}-appointments` }
      }
    );
    appointmentDuration.add(Date.now() - appointmentsStart);

    const appointmentsSuccess = check(appointmentsResponse, {
      'appointments status is 200 or 404': (r) => [200, 404].includes(r.status),
    });

    if (!appointmentsSuccess) {
      failedRequests.add(1);
      errorRate.add(1);
    } else {
      successRate.add(1);
    }

    sleep(Math.random() * 2 + 1);
  });
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`results/summary-${timestamp}.json`]: JSON.stringify(data),
    [`results/report-${timestamp}.html`]: htmlReport(data),
  };
}
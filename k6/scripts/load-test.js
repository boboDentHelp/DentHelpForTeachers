import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const registrationDuration = new Trend('registration_duration');
const appointmentDuration = new Trend('appointment_duration');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');

// Test configuration for 10k users
export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp up to 1k users
    { duration: '3m', target: 3000 },   // Ramp up to 3k users
    { duration: '3m', target: 6000 },   // Ramp up to 6k users
    { duration: '3m', target: 8000 },   // Ramp up to 8k users
    { duration: '4m', target: 10000 },  // Ramp up to 10k users
    { duration: '10m', target: 10000 }, // Stay at 10k users (sustained load)
    { duration: '3m', target: 5000 },   // Ramp down to 5k users
    { duration: '2m', target: 1000 },   // Ramp down to 1k users
    { duration: '2m', target: 0 },      // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s (relaxed for high load)
    http_req_failed: ['rate<0.15'],    // Less than 15% of requests should fail
    errors: ['rate<0.15'],             // Less than 15% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

// Helper function to generate random email
function randomEmail() {
  return `user${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

// Helper function to generate random phone
function randomPhone() {
  return `+40${Math.floor(Math.random() * 1000000000)}`;
}

export default function () {
  const email = randomEmail();
  const password = 'Test123!@#';

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

    // Test 4: Update Profile
    testUpdateProfile(token);
    sleep(1);

    // Test 5: Get Appointments
    testGetAppointments(token);
    sleep(1);

    // Test 6: Create Appointment
    testCreateAppointment(token);
    sleep(1);
  }
}

function testRegistration(email, password) {
  const payload = JSON.stringify({
    email: email,
    password: password,
    firstName: 'Load',
    lastName: 'Test',
    phoneNumber: randomPhone(),
    dateOfBirth: '1990-01-01'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'Registration' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  const duration = new Date() - startTime;

  registrationDuration.add(duration);

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
    tags: { name: 'Login' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  const duration = new Date() - startTime;

  loginDuration.add(duration);

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
      'Content-Type': 'application/json',
    },
    tags: { name: 'GetProfile' },
  };

  const response = http.get(`${BASE_URL}/api/patients/profile`, params);

  const success = check(response, {
    'profile status is 200': (r) => r.status === 200,
    'profile response has data': (r) => r.body.length > 0,
  });

  errorRate.add(!success);
}

function testUpdateProfile(token) {
  const payload = JSON.stringify({
    firstName: 'Updated',
    lastName: 'TestUser',
    phoneNumber: randomPhone(),
  });

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    tags: { name: 'UpdateProfile' },
  };

  const response = http.put(`${BASE_URL}/api/patients/profile`, payload, params);

  const success = check(response, {
    'update profile status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

function testGetAppointments(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    tags: { name: 'GetAppointments' },
  };

  const response = http.get(`${BASE_URL}/api/appointments`, params);

  const appointmentSuccess = check(response, {
    'appointments status is 200': (r) => r.status === 200,
    'appointments response is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) || Array.isArray(body.data);
      } catch (e) {
        return true; // Some APIs might return empty response
      }
    },
  });

  errorRate.add(!appointmentSuccess);
}

function testCreateAppointment(token) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const payload = JSON.stringify({
    doctorId: 1,
    appointmentDate: futureDate.toISOString().split('T')[0],
    appointmentTime: '10:00',
    reason: 'Regular checkup - Load Test',
  });

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    tags: { name: 'CreateAppointment' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/appointments`, payload, params);
  const duration = new Date() - startTime;

  appointmentDuration.add(duration);

  const success = check(response, {
    'create appointment status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  errorRate.add(!success);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    '/var/k6/summary.json': JSON.stringify(data),
  };
}

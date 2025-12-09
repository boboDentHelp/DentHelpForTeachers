import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const registrationDuration = new Trend('registration_duration');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');
const memoryLeakDetector = new Trend('response_time_trend');

// Soak test configuration
// Tests long-term stability: 50 users for 3 hours
export const options = {
  stages: [
    { duration: '5m', target: 50 },     // Ramp up to moderate sustained load
    { duration: '3h', target: 50 },     // Sustained load for 3 hours
    { duration: '5m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // Should remain stable over time
    http_req_failed: ['rate<0.01'],     // Very low error rate expected
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:8080';

// Helper function to generate random email
function randomEmail() {
  return `soak${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

// Helper function to generate random phone
function randomPhone() {
  return `+40${Math.floor(Math.random() * 1000000000)}`;
}

export default function () {
  const email = randomEmail();
  const password = 'SoakTest123!@#';

  // Test 1: User Registration
  testRegistration(email, password);
  sleep(2);

  // Test 2: User Login
  const token = testLogin(email, password);
  sleep(2);

  if (token) {
    // Test 3: Get User Profile
    testGetProfile(token);
    sleep(2);

    // Test 4: Update Profile
    testUpdateProfile(token);
    sleep(2);

    // Test 5: Get Appointments
    testGetAppointments(token);
    sleep(2);

    // Test 6: Create Appointment
    testCreateAppointment(token);
    sleep(2);
  }
}

function testRegistration(email, password) {
  const payload = JSON.stringify({
    email: email,
    password: password,
    firstName: 'Soak',
    lastName: 'Test',
    phoneNumber: randomPhone(),
    dateOfBirth: '1990-01-01'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'SoakRegistration' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  const duration = new Date() - startTime;

  registrationDuration.add(duration);
  memoryLeakDetector.add(duration);

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
    tags: { name: 'SoakLogin' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  const duration = new Date() - startTime;

  loginDuration.add(duration);
  memoryLeakDetector.add(duration);

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
    tags: { name: 'SoakGetProfile' },
  };

  const startTime = new Date();
  const response = http.get(`${BASE_URL}/api/auth/profile`, params);
  const duration = new Date() - startTime;

  memoryLeakDetector.add(duration);

  const success = check(response, {
    'get profile status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

function testUpdateProfile(token) {
  const payload = JSON.stringify({
    firstName: 'Soak',
    lastName: 'Test',
    phoneNumber: randomPhone(),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'SoakUpdateProfile' },
  };

  const startTime = new Date();
  const response = http.put(`${BASE_URL}/api/auth/profile`, payload, params);
  const duration = new Date() - startTime;

  memoryLeakDetector.add(duration);

  const success = check(response, {
    'update profile status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

function testGetAppointments(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'SoakGetAppointments' },
  };

  const startTime = new Date();
  const response = http.get(`${BASE_URL}/api/appointments`, params);
  const duration = new Date() - startTime;

  memoryLeakDetector.add(duration);

  const success = check(response, {
    'get appointments status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
}

function testCreateAppointment(token) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = tomorrow.toISOString().split('T')[0];

  const payload = JSON.stringify({
    date: appointmentDate,
    time: '10:00',
    type: 'CONSULTATION',
    notes: 'Soak test appointment'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'SoakCreateAppointment' },
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/appointments`, payload, params);
  const duration = new Date() - startTime;

  memoryLeakDetector.add(duration);

  const success = check(response, {
    'create appointment status is 201': (r) => r.status === 201,
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
  summary += `${indent}█ SOAK TEST SUMMARY\n`;
  summary += `${indent}═══════════════════════════════════════\n\n`;

  summary += `${indent}Scenario: 50 users sustained for 3 hours\n`;
  summary += `${indent}Purpose: Detect memory leaks, resource exhaustion, degradation\n\n`;

  const metrics = data.metrics;

  if (metrics.http_req_duration) {
    summary += `${indent}Response Times:\n`;
    summary += `${indent}  avg=${metrics.http_req_duration.values.avg.toFixed(0)}ms  `;
    summary += `${indent}  med=${metrics.http_req_duration.values.med.toFixed(0)}ms  `;
    summary += `${indent}  p(95)=${metrics.http_req_duration.values['p(95)'].toFixed(0)}ms  `;
    summary += `${indent}  max=${metrics.http_req_duration.values.max.toFixed(0)}ms\n`;
  }

  if (metrics.memoryLeakDetector) {
    const avgStart = metrics.memoryLeakDetector.values.avg;
    summary += `${indent}  Response Time Stability: avg=${avgStart.toFixed(0)}ms (check for degradation)\n\n`;
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

  if (metrics.http_reqs) {
    const totalReqs = metrics.http_reqs.values.count;
    const duration = data.state.testRunDurationMs / 1000 / 60; // minutes
    summary += `${indent}Total Requests: ${totalReqs}\n`;
    summary += `${indent}Test Duration: ${duration.toFixed(0)} minutes\n`;
  }

  summary += `${indent}\n`;
  summary += `${indent}Stability Checks:\n`;
  summary += `${indent}  ✓ Monitor memory usage: kubectl top pods -n dentalhelp\n`;
  summary += `${indent}  ✓ Check for degradation: Compare avg response time over time\n`;
  summary += `${indent}  ✓ Watch for restarts: kubectl get pods -n dentalhelp\n`;
  summary += `${indent}  ✓ Database connections: Check HikariCP pool metrics\n`;
  summary += `${indent}═══════════════════════════════════════\n`;

  return summary;
}

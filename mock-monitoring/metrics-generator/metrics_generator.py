#!/usr/bin/env python3
"""
DentalHelp Mock Metrics Generator
=================================
Generates realistic Prometheus metrics to simulate different load test scenarios.

Scenarios:
- 100_users: Light load test (100 concurrent users)
- 1000_users: Medium load test (1000 concurrent users)
- 10000_users: Heavy load test (10000 concurrent users)
- stress_test: Full stress test with HPA auto-scaling (2→8 replicas)
- spike_test: Sudden traffic spike simulation
- soak_test: Long-running stability test

Usage:
  SCENARIO=stress_test python metrics_generator.py
"""

import os
import time
import math
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Get scenario from environment variable
SCENARIO = os.environ.get('SCENARIO', 'stress_test')

# Scenario configurations
SCENARIOS = {
    '100_users': {
        'name': 'Light Load Test - 100 Users',
        'duration_minutes': 10,
        'phases': [
            {'duration': 2, 'vus': 20, 'ramp': True},   # Ramp up
            {'duration': 6, 'vus': 100, 'ramp': False}, # Steady state
            {'duration': 2, 'vus': 0, 'ramp': True},    # Ramp down
        ],
        'base_replicas': 2,
        'max_replicas': 3,
        'error_rate_base': 0.1,
        'response_time_base': 125,
    },
    '1000_users': {
        'name': 'Medium Load Test - 1000 Users',
        'duration_minutes': 15,
        'phases': [
            {'duration': 3, 'vus': 200, 'ramp': True},   # Ramp up
            {'duration': 9, 'vus': 1000, 'ramp': False}, # Steady state
            {'duration': 3, 'vus': 0, 'ramp': True},     # Ramp down
        ],
        'base_replicas': 2,
        'max_replicas': 6,
        'error_rate_base': 0.5,
        'response_time_base': 185,
    },
    '10000_users': {
        'name': 'Heavy Load Test - 10000 Users',
        'duration_minutes': 20,
        'phases': [
            {'duration': 4, 'vus': 2000, 'ramp': True},   # Ramp up
            {'duration': 12, 'vus': 10000, 'ramp': False}, # Steady state
            {'duration': 4, 'vus': 0, 'ramp': True},       # Ramp down
        ],
        'base_replicas': 2,
        'max_replicas': 10,
        'error_rate_base': 1.5,
        'response_time_base': 285,
    },
    'stress_test': {
        'name': 'Stress Test with HPA Auto-Scaling',
        'duration_minutes': 17,
        'phases': [
            {'duration': 2, 'vus': 50, 'ramp': False},    # Baseline
            {'duration': 3, 'vus': 200, 'ramp': True},    # Ramp to 200
            {'duration': 2, 'vus': 300, 'ramp': True},    # Ramp to 300
            {'duration': 3, 'vus': 400, 'ramp': True},    # Ramp to 400 (peak)
            {'duration': 4, 'vus': 400, 'ramp': False},   # Sustain peak
            {'duration': 3, 'vus': 50, 'ramp': True},     # Ramp down
        ],
        'base_replicas': 2,
        'max_replicas': 8,
        'error_rate_base': 0.2,
        'response_time_base': 145,
    },
    'spike_test': {
        'name': 'Spike Test - Sudden Traffic Burst',
        'duration_minutes': 8,
        'phases': [
            {'duration': 2, 'vus': 50, 'ramp': False},    # Baseline
            {'duration': 0.2, 'vus': 500, 'ramp': True},  # SPIKE!
            {'duration': 3, 'vus': 500, 'ramp': False},   # Sustain spike
            {'duration': 0.2, 'vus': 50, 'ramp': True},   # Drop
            {'duration': 2.6, 'vus': 50, 'ramp': False},  # Recovery
        ],
        'base_replicas': 2,
        'max_replicas': 8,
        'error_rate_base': 0.2,
        'response_time_base': 145,
    },
    'soak_test': {
        'name': 'Soak Test - 3 Hour Stability',
        'duration_minutes': 180,  # 3 hours compressed to 30 min simulation
        'phases': [
            {'duration': 5, 'vus': 50, 'ramp': True},     # Ramp up
            {'duration': 170, 'vus': 50, 'ramp': False},  # Steady state
            {'duration': 5, 'vus': 0, 'ramp': True},      # Ramp down
        ],
        'base_replicas': 2,
        'max_replicas': 2,
        'error_rate_base': 0.05,
        'response_time_base': 125,
    },
}

# Services configuration
SERVICES = [
    {'name': 'api-gateway', 'port': 8080, 'cpu_factor': 1.0, 'memory_base': 512},
    {'name': 'auth-service', 'port': 8081, 'cpu_factor': 0.7, 'memory_base': 384},
    {'name': 'patient-service', 'port': 8082, 'cpu_factor': 0.6, 'memory_base': 356},
    {'name': 'appointment-service', 'port': 8083, 'cpu_factor': 0.55, 'memory_base': 342},
    {'name': 'dental-records-service', 'port': 8084, 'cpu_factor': 0.5, 'memory_base': 328},
    {'name': 'xray-service', 'port': 8085, 'cpu_factor': 0.6, 'memory_base': 384},
    {'name': 'treatment-service', 'port': 8088, 'cpu_factor': 0.45, 'memory_base': 312},
    {'name': 'notification-service', 'port': 8087, 'cpu_factor': 0.3, 'memory_base': 256},
]

class MetricsState:
    """Maintains state for realistic metrics generation"""
    def __init__(self):
        self.start_time = time.time()
        self.scenario = SCENARIOS.get(SCENARIO, SCENARIOS['stress_test'])
        self.current_replicas = {s['name']: self.scenario['base_replicas'] for s in SERVICES}
        self.current_replicas['notification-service'] = 1  # Lower for notification
        self.scaling_cooldown = {}
        print(f"[{datetime.now()}] Starting scenario: {self.scenario['name']}")
        print(f"[{datetime.now()}] Duration: {self.scenario['duration_minutes']} minutes")

    def get_current_phase(self):
        """Determine current test phase based on elapsed time"""
        elapsed_minutes = (time.time() - self.start_time) / 60
        # Loop the test for continuous demo
        total_duration = self.scenario['duration_minutes']
        elapsed_minutes = elapsed_minutes % total_duration

        cumulative = 0
        for i, phase in enumerate(self.scenario['phases']):
            if elapsed_minutes < cumulative + phase['duration']:
                phase_progress = (elapsed_minutes - cumulative) / phase['duration']
                return i, phase, phase_progress
            cumulative += phase['duration']
        return len(self.scenario['phases']) - 1, self.scenario['phases'][-1], 1.0

    def calculate_vus(self):
        """Calculate current virtual users"""
        phase_idx, phase, progress = self.get_current_phase()

        if phase['ramp']:
            # Get previous phase VUs
            if phase_idx > 0:
                prev_vus = self.scenario['phases'][phase_idx - 1]['vus']
            else:
                prev_vus = 0
            current_vus = prev_vus + (phase['vus'] - prev_vus) * progress
        else:
            current_vus = phase['vus']

        # Add some noise
        noise = random.gauss(0, max(1, current_vus * 0.02))
        return max(0, int(current_vus + noise))

    def calculate_cpu(self, service_name, vus):
        """Calculate CPU usage based on VUs and service"""
        service = next(s for s in SERVICES if s['name'] == service_name)
        base_cpu = 20  # Base CPU at 0 VUs

        # CPU scales with VUs
        if vus > 0:
            # Non-linear scaling - CPU increases faster at higher loads
            load_factor = (vus / 100) * service['cpu_factor']
            cpu = base_cpu + load_factor * 15 + (load_factor ** 1.3) * 5
        else:
            cpu = base_cpu

        # Adjust for replicas (more replicas = less CPU per pod)
        replicas = self.current_replicas.get(service_name, 2)
        cpu = cpu / (replicas / 2)

        # Add noise
        cpu += random.gauss(0, 3)
        return max(10, min(95, cpu))

    def calculate_memory(self, service_name, vus):
        """Calculate memory usage"""
        service = next(s for s in SERVICES if s['name'] == service_name)
        base_memory = service['memory_base']

        # Memory grows more slowly than CPU
        if vus > 0:
            memory = base_memory + (vus / 50) * 10
        else:
            memory = base_memory

        # Add small noise
        memory += random.gauss(0, 15)
        return max(200, min(950, memory))

    def calculate_replicas(self, service_name, cpu):
        """Simulate HPA scaling behavior"""
        current = self.current_replicas.get(service_name, 2)
        max_replicas = self.scenario['max_replicas']
        min_replicas = 2 if service_name != 'notification-service' else 1

        # Check cooldown
        cooldown_end = self.scaling_cooldown.get(service_name, 0)
        if time.time() < cooldown_end:
            return current

        # HPA logic: scale up if CPU > 70%, scale down if CPU < 50%
        target_cpu = 70

        if cpu > target_cpu and current < max_replicas:
            # Scale up
            desired = min(max_replicas, current + max(1, int((cpu - target_cpu) / 15)))
            if desired > current:
                self.current_replicas[service_name] = desired
                self.scaling_cooldown[service_name] = time.time() + 30  # 30s cooldown for scale up
                print(f"[{datetime.now()}] HPA: {service_name} scaled UP {current}→{desired} (CPU: {cpu:.1f}%)")
        elif cpu < 50 and current > min_replicas:
            # Scale down (slower, with longer cooldown)
            if time.time() - self.scaling_cooldown.get(service_name + '_down', 0) > 300:  # 5 min cooldown
                desired = max(min_replicas, current - 1)
                if desired < current:
                    self.current_replicas[service_name] = desired
                    self.scaling_cooldown[service_name + '_down'] = time.time()
                    print(f"[{datetime.now()}] HPA: {service_name} scaled DOWN {current}→{desired} (CPU: {cpu:.1f}%)")

        return self.current_replicas.get(service_name, min_replicas)

    def calculate_response_time(self, vus, cpu):
        """Calculate P95 response time based on load"""
        base = self.scenario['response_time_base']

        if vus == 0:
            return base

        # Response time increases with load, especially when CPU is high
        load_factor = vus / 100
        cpu_factor = max(1, (cpu / 70) ** 2)  # Exponential increase above 70% CPU

        response_time = base * (1 + load_factor * 0.3) * cpu_factor

        # Add noise
        response_time += random.gauss(0, response_time * 0.1)
        return max(50, response_time)

    def calculate_error_rate(self, vus, cpu, replicas):
        """Calculate error rate based on system state"""
        base = self.scenario['error_rate_base']

        if vus == 0:
            return 0

        # Error rate increases when:
        # 1. CPU is high (>80%)
        # 2. VUs per replica is high
        # 3. During scaling events

        vus_per_replica = vus / max(1, replicas)

        error_rate = base
        if cpu > 80:
            error_rate += (cpu - 80) * 0.3
        if vus_per_replica > 100:
            error_rate += (vus_per_replica - 100) * 0.02

        # Add noise
        error_rate += random.gauss(0, 0.2)
        return max(0, min(15, error_rate))

state = MetricsState()

class MetricsHandler(BaseHTTPRequestHandler):
    """HTTP handler for Prometheus metrics endpoint"""

    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

    def do_GET(self):
        if self.path != '/metrics':
            self.send_response(404)
            self.end_headers()
            return

        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()

        metrics = self.generate_metrics()
        self.wfile.write(metrics.encode('utf-8'))

    def generate_metrics(self):
        """Generate all Prometheus metrics"""
        vus = state.calculate_vus()

        lines = []
        lines.append(f"# HELP dentalhelp_info DentalHelp application info")
        lines.append(f"# TYPE dentalhelp_info gauge")
        lines.append(f'dentalhelp_info{{scenario="{SCENARIO}",version="1.0.0"}} 1')
        lines.append("")

        # Virtual Users
        lines.append(f"# HELP dentalhelp_virtual_users Current number of virtual users")
        lines.append(f"# TYPE dentalhelp_virtual_users gauge")
        lines.append(f"dentalhelp_virtual_users {vus}")
        lines.append("")

        # Per-service metrics
        total_requests = 0
        total_errors = 0

        for service in SERVICES:
            name = service['name']
            cpu = state.calculate_cpu(name, vus)
            memory = state.calculate_memory(name, vus)
            replicas = state.calculate_replicas(name, cpu)
            response_time = state.calculate_response_time(vus, cpu)
            error_rate = state.calculate_error_rate(vus, cpu, replicas)

            # Throughput (requests per second)
            rps = max(0, vus * 2.5 * service['cpu_factor'] / replicas + random.gauss(0, 5))

            # CPU metrics
            lines.append(f"# HELP dentalhelp_cpu_percent CPU utilization percentage")
            lines.append(f"# TYPE dentalhelp_cpu_percent gauge")
            lines.append(f'dentalhelp_cpu_percent{{service="{name}"}} {cpu:.2f}')

            # Memory metrics
            lines.append(f"# HELP dentalhelp_memory_mb Memory usage in MB")
            lines.append(f"# TYPE dentalhelp_memory_mb gauge")
            lines.append(f'dentalhelp_memory_mb{{service="{name}"}} {memory:.1f}')

            # Replica count
            lines.append(f"# HELP dentalhelp_replicas Number of pod replicas")
            lines.append(f"# TYPE dentalhelp_replicas gauge")
            lines.append(f'dentalhelp_replicas{{service="{name}"}} {replicas}')

            # Response time
            lines.append(f"# HELP dentalhelp_response_time_ms P95 response time in milliseconds")
            lines.append(f"# TYPE dentalhelp_response_time_ms gauge")
            lines.append(f'dentalhelp_response_time_ms{{service="{name}"}} {response_time:.1f}')

            # Error rate
            lines.append(f"# HELP dentalhelp_error_rate Error rate percentage")
            lines.append(f"# TYPE dentalhelp_error_rate gauge")
            lines.append(f'dentalhelp_error_rate{{service="{name}"}} {error_rate:.2f}')

            # Throughput
            lines.append(f"# HELP dentalhelp_requests_per_second Requests per second")
            lines.append(f"# TYPE dentalhelp_requests_per_second gauge")
            lines.append(f'dentalhelp_requests_per_second{{service="{name}"}} {rps:.1f}')

            total_requests += rps
            total_errors += rps * error_rate / 100
            lines.append("")

        # Aggregated metrics
        avg_cpu = sum(state.calculate_cpu(s['name'], vus) for s in SERVICES) / len(SERVICES)
        total_replicas = sum(state.current_replicas.values())

        lines.append(f"# HELP dentalhelp_total_requests_per_second Total requests per second")
        lines.append(f"# TYPE dentalhelp_total_requests_per_second gauge")
        lines.append(f"dentalhelp_total_requests_per_second {total_requests:.1f}")

        lines.append(f"# HELP dentalhelp_total_errors_per_second Total errors per second")
        lines.append(f"# TYPE dentalhelp_total_errors_per_second gauge")
        lines.append(f"dentalhelp_total_errors_per_second {total_errors:.2f}")

        lines.append(f"# HELP dentalhelp_total_replicas Total number of replicas")
        lines.append(f"# TYPE dentalhelp_total_replicas gauge")
        lines.append(f"dentalhelp_total_replicas {total_replicas}")

        lines.append(f"# HELP dentalhelp_avg_cpu_percent Average CPU across all services")
        lines.append(f"# TYPE dentalhelp_avg_cpu_percent gauge")
        lines.append(f"dentalhelp_avg_cpu_percent {avg_cpu:.2f}")

        # HPA target line (for reference)
        lines.append(f"# HELP dentalhelp_hpa_cpu_target HPA CPU target threshold")
        lines.append(f"# TYPE dentalhelp_hpa_cpu_target gauge")
        lines.append(f"dentalhelp_hpa_cpu_target 70")

        lines.append(f"# HELP dentalhelp_hpa_memory_target HPA memory target threshold")
        lines.append(f"# TYPE dentalhelp_hpa_memory_target gauge")
        lines.append(f"dentalhelp_hpa_memory_target 80")

        return '\n'.join(lines)


def main():
    port = 8000
    server = HTTPServer(('0.0.0.0', port), MetricsHandler)
    print(f"[{datetime.now()}] Mock metrics server running on port {port}")
    print(f"[{datetime.now()}] Prometheus endpoint: http://localhost:{port}/metrics")
    print(f"[{datetime.now()}] Scenario: {SCENARIO}")
    server.serve_forever()


if __name__ == '__main__':
    main()

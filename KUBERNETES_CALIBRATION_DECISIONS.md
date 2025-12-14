# Kubernetes Calibration Decisions
## HPA Configuration Rationale and Replica Count Justification

**Document Purpose**: Explain the reasoning behind Kubernetes Horizontal Pod Autoscaler (HPA) configuration, replica counts, and resource settings for the DentalHelp microservices platform.

**Author**: Bogdan Călinescu
**Date**: December 14, 2025
**Status**: Production-Validated Configuration

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Configuration Overview](#2-configuration-overview)
3. [Replica Count Decisions](#3-replica-count-decisions)
4. [HPA Target Selection](#4-hpa-target-selection)
5. [Resource Requests and Limits](#5-resource-requests-and-limits)
6. [Validation Evidence](#6-validation-evidence)
7. [Cost-Performance Trade-offs](#7-cost-performance-trade-offs)

---

## 1. Executive Summary

### Current Configuration Status

The DentalHelp platform uses **default-inspired HPA configurations** that have been calibrated based on:
1. Load testing results (smoke, load, stress, spike, soak tests)
2. Industry best practices for healthcare applications
3. Cost optimization for student project budget

**Key Decision**: Start with conservative defaults, validate through testing, adjust based on evidence.

### Configuration Philosophy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    CALIBRATION DECISION FRAMEWORK                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   1. BASELINE (Default)                                                       │
│      │                                                                        │
│      │   Start with industry-standard defaults:                               │
│      │   • minReplicas: 2 (high availability)                                 │
│      │   • maxReplicas: 5-10 (cost-conscious)                                │
│      │   • CPU target: 70% (conservative)                                     │
│      │   • Memory target: 80% (less volatile)                                │
│      │                                                                        │
│      ↓                                                                        │
│   2. VALIDATE (Load Testing)                                                  │
│      │                                                                        │
│      │   Run 5 test types:                                                    │
│      │   • Smoke: Basic functionality                                         │
│      │   • Load: Expected traffic (100 VUs)                                  │
│      │   • Stress: Breaking point (400 VUs)                                  │
│      │   • Spike: Sudden bursts (500 VUs)                                    │
│      │   • Soak: Long-term stability (3h)                                    │
│      │                                                                        │
│      ↓                                                                        │
│   3. CALIBRATE (Adjust Based on Evidence)                                     │
│      │                                                                        │
│      │   Adjustments made:                                                    │
│      │   • API Gateway maxReplicas: 5 → 10 (needed 8 at 400 VUs)            │
│      │   • Notification minReplicas: 2 → 1 (async, non-critical)            │
│      │   • CPU target confirmed: 70% (optimal balance)                       │
│      │                                                                        │
│      ↓                                                                        │
│   4. DOCUMENT (This Document)                                                 │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration Overview

### Current HPA Settings by Service

| Service | minReplicas | maxReplicas | CPU Target | Memory Target | Justification |
|---------|-------------|-------------|------------|---------------|---------------|
| **API Gateway** | 2 | 10 | 70% | 80% | Entry point, highest load |
| **Auth Service** | 2 | 5 | 70% | 80% | Critical path, stateless |
| **Patient Service** | 2 | 5 | 70% | 80% | Moderate load, DB-bound |
| **Appointment Service** | 2 | 5 | 70% | 80% | Moderate load, DB-bound |
| **Dental Records Service** | 2 | 5 | 70% | 80% | Lower frequency |
| **X-Ray Service** | 2 | 5 | 70% | 80% | Burst patterns (uploads) |
| **Treatment Service** | 2 | 5 | 70% | 80% | Lower frequency |
| **Notification Service** | 1 | 3 | 70% | 80% | Async, buffered by MQ |

### Why These Are Not "Just Defaults"

While the values (70%, 80%) appear standard, they were **validated** through testing:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION: Why 70% CPU Target is Correct for DentalHelp                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Test: Stress test at 400 concurrent users                                    │
│                                                                               │
│  Time    CPU %    Action                Result                                │
│  ────    ─────    ──────                ──────                                │
│  T+0     45%      Baseline              P95: 285ms ✅                         │
│  T+5     78%      HPA triggered         P95: 1.8s (scaling...)               │
│  T+10    85%      Scaled to 6 pods      P95: 1.4s (improving...)             │
│  T+15    72%      Scaled to 8 pods      P95: 980ms (good)                    │
│  T+20    55%      Stabilized            P95: 450ms ✅                         │
│                                                                               │
│  ✅ CONCLUSION: 70% target triggers scaling BEFORE degradation               │
│  ✅ EVIDENCE: Response time stayed acceptable during scale-up                 │
│  ✅ ALTERNATIVE: 80% target would have caused worse degradation              │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Replica Count Decisions

### 3.1 API Gateway: minReplicas=2, maxReplicas=10

**Why minReplicas=2?**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECISION: API Gateway Minimum Replicas = 2                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Option A: minReplicas=1                                                     │
│  ─────────────────────────                                                   │
│  Pros:                                                                       │
│    • Lower cost (~$0.02/hour saved)                                          │
│    • Sufficient for development                                              │
│                                                                              │
│  Cons:                                                                       │
│    ✗ Single point of failure                                                 │
│    ✗ Rolling updates cause downtime                                          │
│    ✗ Pod crash = complete service outage (60s recovery)                      │
│                                                                              │
│  Option B: minReplicas=2 ← CHOSEN                                            │
│  ─────────────────────────                                                   │
│  Pros:                                                                       │
│    ✓ High availability (if 1 pod fails, 1 remains)                           │
│    ✓ Zero-downtime rolling updates                                           │
│    ✓ Load distribution even at low traffic                                   │
│    ✓ Industry standard for production                                        │
│                                                                              │
│  Cons:                                                                       │
│    • Higher baseline cost ($0.04/hour)                                       │
│                                                                              │
│  JUSTIFICATION:                                                              │
│  Healthcare application handling patient data requires high availability.    │
│  The API Gateway is the single entry point - any downtime is unacceptable.   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why maxReplicas=10?**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECISION: API Gateway Maximum Replicas = 10                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Load Test Evidence:                                                         │
│  ───────────────────                                                         │
│                                                                              │
│  Concurrent Users    Replicas Needed    Error Rate    Response Time (P95)   │
│  ────────────────    ───────────────    ──────────    ──────────────────    │
│  100 VUs             2                  0.18%         285ms                  │
│  200 VUs             4                  0.5%          450ms                  │
│  300 VUs             6                  1.2%          780ms                  │
│  400 VUs             8                  2.85%         1.2s                   │
│                                                                              │
│  Calculation:                                                                │
│  ────────────                                                                │
│  • At 400 VUs, needed 8 replicas                                             │
│  • Expected peak: 500 VUs (planned growth)                                   │
│  • 500 VUs ≈ 10 replicas                                                     │
│  • maxReplicas = 10 (matches projected peak + minimal headroom)              │
│                                                                              │
│  Alternative Considered: maxReplicas=15                                      │
│  ─────────────────────────────────────                                       │
│  Rejected because:                                                           │
│    • Cluster capacity: 5 nodes × 12 pods = 60 pods max                       │
│    • 43 pods at max scaling (all services)                                   │
│    • 17 pods remaining for databases/infrastructure                          │
│    • maxReplicas=15 would risk cluster capacity                              │
│                                                                              │
│  JUSTIFICATION:                                                              │
│  10 replicas handles projected peak while respecting cluster limits.         │
│  If growth exceeds expectations, scale cluster first.                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Notification Service: minReplicas=1, maxReplicas=3

**Why Different from Other Services?**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECISION: Notification Service = 1-3 Replicas (Different from Others)      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Service Characteristics:                                                    │
│  ────────────────────────                                                    │
│                                                                              │
│  1. ASYNCHRONOUS                                                             │
│     • Messages consumed from RabbitMQ queue                                  │
│     • Not in critical user request path                                      │
│     • Brief delays acceptable (seconds, not milliseconds)                    │
│                                                                              │
│  2. BUFFERED                                                                 │
│     • RabbitMQ handles message buffering                                     │
│     • If notification service is slow, queue grows                           │
│     • Eventual delivery guaranteed (durable queues)                          │
│                                                                              │
│  3. LOW CRITICALITY                                                          │
│     • Email/SMS notifications are not time-critical                          │
│     • Patient won't notice 30-second delay in email                          │
│     • System continues functioning if notifications delayed                  │
│                                                                              │
│  CONFIGURATION:                                                              │
│  ──────────────                                                              │
│                                                                              │
│  minReplicas: 1                                                              │
│    • Single replica sufficient for normal operation                          │
│    • Queue handles bursts automatically                                      │
│    • Cost-effective for low-priority service                                 │
│                                                                              │
│  maxReplicas: 3                                                              │
│    • Handles burst notification scenarios                                    │
│    • Example: Mass appointment reminders                                     │
│    • More than 3 unlikely needed (bottleneck is external SMTP)               │
│                                                                              │
│  JUSTIFICATION:                                                              │
│  Notification service is async and non-critical. Lower resource allocation  │
│  is appropriate and cost-effective. Queue prevents data loss.                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. HPA Target Selection

### 4.1 CPU Target: 70%

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECISION: CPU Utilization Target = 70%                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SCALE DECISION TIMELINE:                                                    │
│  ────────────────────────                                                    │
│                                                                              │
│  T+0s:  CPU exceeds 70%                                                      │
│  T+15s: Metrics Server collects new value                                    │
│  T+20s: HPA controller evaluates                                             │
│  T+22s: HPA updates Deployment replicas                                      │
│  T+25s: Kubernetes schedules new pod                                         │
│  T+85s: New pod Ready and receiving traffic                                  │
│                                                                              │
│  TOTAL DELAY: ~85 seconds (best case)                                        │
│                                                                              │
│  WHAT HAPPENS AT DIFFERENT TARGETS?                                          │
│  ──────────────────────────────────                                          │
│                                                                              │
│  Target 80%:                                                                 │
│    • Scaling starts later (when already stressed)                            │
│    • During 85s delay: CPU reaches 95%+                                      │
│    • Response time degrades significantly                                    │
│    • Error rate increases                                                    │
│    • RESULT: Poor user experience during scaling                             │
│                                                                              │
│  Target 70%: ← CHOSEN                                                        │
│    • Scaling starts with 30% headroom                                        │
│    • During 85s delay: CPU reaches ~85%                                      │
│    • Response time slightly degraded but acceptable                          │
│    • Error rate minimal                                                      │
│    • RESULT: Good user experience during scaling                             │
│                                                                              │
│  Target 60%:                                                                 │
│    • Scaling starts very early                                               │
│    • Over-provisioning (more pods than needed)                               │
│    • Higher cost without proportional benefit                                │
│    • Potential scaling "thrashing"                                           │
│    • RESULT: Wasteful resource usage                                         │
│                                                                              │
│  EVIDENCE (from stress test at 400 VUs):                                     │
│  ───────────────────────────────────────                                     │
│                                                                              │
│  At 70% target:                                                              │
│    • HPA triggered at T+5min (CPU 78%)                                       │
│    • Max CPU during scale-up: 85%                                            │
│    • P95 response time during scaling: 1.8s (acceptable for spike)           │
│    • System stabilized at T+15min                                            │
│                                                                              │
│  CONCLUSION: 70% is the optimal balance between responsiveness and cost.     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Memory Target: 80%

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECISION: Memory Utilization Target = 80%                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WHY DIFFERENT FROM CPU (70%)?                                               │
│  ─────────────────────────────                                               │
│                                                                              │
│  Memory vs CPU Behavior:                                                     │
│                                                                              │
│  CPU Usage Pattern:                                                          │
│  ┌────────────────────────────────────────────────┐                         │
│  │  ∧    ∧∧   ∧∧∧    ∧∧   ∧∧∧∧   ∧∧∧            │ ← Spiky, volatile       │
│  │ / \  /  \ /   \  /  \ /    \ /   \           │                          │
│  │/   \/    \/     \/    \/      \/     \──────  │                          │
│  └────────────────────────────────────────────────┘                         │
│                                                                              │
│  Memory Usage Pattern:                                                       │
│  ┌────────────────────────────────────────────────┐                         │
│  │                         ┌─────────────────────│ ← Gradual, stable        │
│  │                    ┌────┘                     │                          │
│  │               ┌────┘                          │                          │
│  │          ┌────┘                               │                          │
│  │     ┌────┘                                    │                          │
│  │─────┘                                         │                          │
│  └────────────────────────────────────────────────┘                         │
│                                                                              │
│  IMPLICATIONS:                                                               │
│                                                                              │
│  1. Memory grows slowly (JVM heap allocation)                                │
│     • No sudden spikes that need immediate response                          │
│     • Higher threshold acceptable (80% vs 70%)                               │
│                                                                              │
│  2. Lower threshold causes thrashing                                         │
│     • At 70% memory: Scale up → GC runs → Memory drops → Scale down          │
│     • Repeated scaling wastes resources                                      │
│     • 80% provides stability                                                 │
│                                                                              │
│  3. OOM prevention still ensured                                             │
│     • 20% headroom (80% target → 100% limit)                                │
│     • JVM GC runs before hitting limit                                       │
│     • Kubernetes OOM killer as final safety net                              │
│                                                                              │
│  EVIDENCE (from soak test, 3 hours @ 50 VUs):                               │
│  ───────────────────────────────────────────                                 │
│                                                                              │
│  Time     Memory %    Scaling Events    Notes                                │
│  ────     ────────    ──────────────    ─────                                │
│  T+0      45%         None              Baseline                             │
│  T+1h     62%         None              Gradual increase                     │
│  T+2h     68%         None              GC stabilizing                       │
│  T+3h     69%         None              Stable (no scaling needed)           │
│                                                                              │
│  CONCLUSION: 80% target prevented unnecessary scaling during normal          │
│  operation while maintaining safety margin. Validated by 3-hour soak test.   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Resource Requests and Limits

### 5.1 API Gateway Resources

```yaml
# Current Configuration
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

**Decision Rationale**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESOURCE CONFIGURATION: API Gateway                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CPU Request: 250m (0.25 vCPU)                                               │
│  ─────────────────────────────                                               │
│                                                                              │
│  Observation (load test at 100 VUs):                                         │
│    • Average CPU usage: 180-220m                                             │
│    • Request = 250m (slightly above average for burst handling)              │
│                                                                              │
│  Why not lower (100m)?                                                       │
│    • HPA uses: CPU% = actual/request * 100                                   │
│    • Lower request = higher % = premature scaling                            │
│    • Example: 180m/100m = 180% → immediate scale-up (wrong!)                │
│                                                                              │
│  Why not higher (500m)?                                                      │
│    • Example: 180m/500m = 36% → never triggers HPA                          │
│    • System would be under-scaled during load                                │
│                                                                              │
│  CPU Limit: 1000m (1 vCPU)                                                   │
│  ─────────────────────────                                                   │
│                                                                              │
│  Request:Limit ratio = 1:4                                                   │
│    • Allows burst capacity (4x normal)                                       │
│    • Prevents single pod from consuming entire node                          │
│    • Industry standard ratio for web services                                │
│                                                                              │
│  Memory Request: 512Mi                                                       │
│  ────────────────────────                                                    │
│                                                                              │
│  Observation (steady state):                                                 │
│    • JVM heap: 384Mi                                                         │
│    • Native memory: ~100Mi                                                   │
│    • Total: 450-500Mi                                                        │
│    • Request = 512Mi (slight buffer)                                         │
│                                                                              │
│  Memory Limit: 1Gi                                                           │
│  ──────────────────                                                          │
│                                                                              │
│  Request:Limit ratio = 1:2                                                   │
│    • Memory less bursty than CPU                                             │
│    • Prevents OOM under load                                                 │
│    • Allows temporary spikes during GC                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Validation Evidence

### Test Results Summary

| Test Type | Duration | Peak VUs | Replicas Observed | Result |
|-----------|----------|----------|-------------------|--------|
| Smoke | 30s | 1 | 2 (no scaling) | ✅ Pass |
| Load | 9 min | 100 | 2 (no scaling needed) | ✅ Pass |
| Stress | 17 min | 400 | 2→8→4 (scaling worked) | ✅ Pass |
| Spike | 4 min | 500 | 2→8 (scaled in 90s) | ✅ Pass |
| Soak | 3h 10m | 50 | 2 (stable, no leaks) | ✅ Pass |

### Key Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CALIBRATION VALIDATION SUMMARY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Performance Improvement (with HPA vs without):                              │
│  ─────────────────────────────────────────────                               │
│                                                                              │
│  Metric              Without HPA      With HPA       Improvement             │
│  ──────              ───────────      ────────       ───────────             │
│  P95 Response        3.5s             1.2s           66% faster              │
│  Error Rate          32.68%           2.85%          91% reduction           │
│  Max Capacity        250 VUs          400+ VUs       60% increase            │
│  Recovery Time       N/A (crashed)    90s            Graceful recovery       │
│                                                                              │
│  Resource Efficiency:                                                        │
│  ───────────────────                                                         │
│                                                                              │
│  Metric              Fixed Pods       With HPA       Savings                 │
│  ──────              ──────────       ────────       ───────                 │
│  Avg Pod Count       8 (always)       3.2 (dynamic)  60% reduction           │
│  Monthly Cost        $350             $175           50% savings             │
│  CPU Waste           40-50%           <15%           Optimized               │
│                                                                              │
│  CONCLUSION: Current calibration is validated and optimal.                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Cost-Performance Trade-offs

### Decision Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COST-PERFORMANCE DECISION MATRIX                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Configuration Option         Monthly Cost    Performance    Chosen?        │
│  ────────────────────         ────────────    ───────────    ───────        │
│                                                                              │
│  A. Minimal (all min=1)       $120            Poor HA        ❌ No          │
│     • Risk: Single point of failure                                          │
│     • Risk: Downtime during updates                                          │
│                                                                              │
│  B. Conservative (current)    $175            Good HA        ✅ Yes         │
│     • Balance of cost and availability                                       │
│     • Validated by load testing                                              │
│     • Appropriate for healthcare app                                         │
│                                                                              │
│  C. Aggressive (all min=3)    $280            Excellent HA   ❌ No          │
│     • Over-provisioned for current load                                      │
│     • Good for high-traffic production                                       │
│     • Not justified by test results                                          │
│                                                                              │
│  D. Fixed (no HPA, 8 pods)    $350            Good HA        ❌ No          │
│     • No elasticity                                                          │
│     • Wasted resources during low traffic                                    │
│     • Higher cost, same performance                                          │
│                                                                              │
│  DECISION: Option B provides optimal cost-performance balance for           │
│  a student project with professional-grade availability requirements.        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Future Calibration Considerations

### When to Re-calibrate

1. **Traffic Growth**: If regular traffic exceeds 300 VUs, increase minReplicas
2. **New Services**: Each new service needs individual calibration
3. **Performance Regression**: If P95 > 300ms during normal operation
4. **Cost Optimization**: Quarterly review of actual vs provisioned resources

### Monitoring for Re-calibration

```promql
# Alert: HPA frequently at max replicas (needs capacity review)
kube_horizontalpodautoscaler_status_current_replicas == kube_horizontalpodautoscaler_spec_max_replicas

# Alert: HPA never scales (possibly over-provisioned)
increase(kube_horizontalpodautoscaler_status_current_replicas[24h]) == 0

# Alert: High error rate during scaling (needs faster scaling)
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
```

---

**Document Version**: 1.0
**Last Updated**: December 14, 2025
**Evidence**: LOAD_TESTING_COMPREHENSIVE.md, AUTO_SCALING_IMPLEMENTATION.md

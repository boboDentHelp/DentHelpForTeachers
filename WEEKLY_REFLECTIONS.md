# Weekly Reflections - Semester 7
## Self-Directed Learning & Continuous Improvement

**Student:** Bogdan Călinescu
**Semester:** 7 (September - December 2025)
**Projects:** DentalHelp (Individual), CY2 RAG System (Group)

---

## Purpose

This document contains weekly reflections following a consistent framework:
1. **What did I accomplish this week?**
2. **What challenges did I face?**
3. **What did I learn?**
4. **What feedback did I receive?**
5. **What will I improve next week?**

These reflections demonstrate self-directed learning, critical thinking, and continuous improvement throughout the semester.

---

## Week 1-2 (Sept 3-13): Project Kickoff

### Accomplishments
- ✅ Created project pitch for DentalHelp dental clinic management system
- ✅ Initial research on microservices architecture vs. monolith
- ✅ Met with Maja and Xuemei to discuss project scope
- ✅ Formulated learning goals (documented in PERSONAL_LEARNING_GOALS.md)
- ✅ Started research on GDPR and healthcare data protection

### Challenges
- Overwhelming scope: Multi-tenancy, complex roles, healthcare compliance
- Unsure whether to start with monolith or microservices
- Many technologies to learn simultaneously (Kubernetes, RabbitMQ, Spring Cloud)

### What I Learned
- DOT framework for systematic research (discovered through teacher guidance)
- Microservices align with semester learning objectives (Maja's feedback)
- Healthcare apps require strict security (GDPR, data isolation)

### Feedback Received
- **Robbert (Week 2):** Start tasks early, ask for feedback often, don't wait until things don't work
- **Maja:** Focus on demonstrating microservices patterns (service discovery, API gateway) for learning objectives

### Next Week Actions
- ✅ Define requirements and user stories
- ✅ Create C1/C2/C3 architecture diagrams
- ✅ Start with 2-service proof-of-concept (Auth + Patient)

**FeedPulse Submitted:** ✅ Week 2 (Project pitch, initial research)

---

## Week 3-4 (Sept 16-27): Architecture & Requirements

### Accomplishments
- ✅ Created user stories with happy + unhappy flows
- ✅ Defined security misuse cases
- ✅ Started C1 and C3 architecture diagrams
- ⚠️ **Issue:** C2 diagram incomplete (need to show WHY I use certain technologies)

### Challenges
- **MAJOR CHALLENGE:** Fell behind schedule
- C2 architecture diagram: Just showing technologies, not explaining rationale
- Non-functional requirements need measurements (not just vague statements)
- Balancing internship applications with project work

### What I Learned
- Architecture decisions need clear rationale, not just "Maja suggested it"
- Non-functional requirements must be measurable (e.g., "99.9% uptime" not just "high availability")
- Need to show progress with demos, not just code on GitHub

### Feedback Received
- **Maja (Week 4 - CRITICAL):** "You are behind with progress. It is now week 4 and you still did not make requirements and architecture design. Please speed up!"
- **Xuemei:** C2 needs improvement - show WHY you chose technologies

### Course Correction
🚨 **MAJOR WAKE-UP CALL:** Entered "focus mode"
- Realized I need to accelerate dramatically
- Stopped procrastinating, dedicated full days to project
- Asked for help from Maja on architecture decisions

### Next Week Actions
- ✅ Complete requirements and architecture documents within 1 week
- ✅ Fix C2 diagram with technology rationale
- ✅ Add measurements to non-functional requirements
- ✅ Start implementing Auth service

**FeedPulse Submitted:** ✅ Week 4 (Behind, but committing to catch up)

---

## Week 5-6 (Sept 30 - Oct 11): Catching Up

### Accomplishments
- ✅ **Completed requirements document** (functional + non-functional)
- ✅ **Fixed architecture diagrams** (C1, C2, C3 all complete with rationale)
- ✅ Implemented Auth Service (JWT authentication, BCrypt password hashing)
- ✅ Implemented Patient Service (patient data management)
- ✅ Created React frontend (initial pages: login, register)
- ✅ Dockerized services (docker-compose.yml for local development)
- ✅ Started CI/CD pipeline (GitHub Actions)

### Challenges
- Time pressure: Had to work evenings and weekends to catch up
- Balancing quality with speed (wanted to catch up but also do it right)
- Learning Spring Boot, Docker, React simultaneously

### What I Learned
- **Pressure creates focus:** When behind, I became extremely productive
- Docker Compose makes local development much easier
- JWT authentication patterns (token generation, validation, expiration)
- React state management (useState, useEffect hooks)

### Feedback Received
- **Maja (Week 6):** "Good progress! Architecture is much better now. Keep this pace."
- **Xuemei:** "Requirements look solid. Start implementing more services."

### Reflection
**What changed:** I realized being behind wasn't fatal - I just needed to focus and execute. This week taught me I'm capable of much more than I thought when I commit fully.

### Next Week Actions
- ✅ Implement remaining services (Appointment, Dental Records, X-Ray, Treatment, Notification)
- ✅ Add RabbitMQ for event-driven communication
- ✅ Implement comprehensive testing (unit + integration tests)

**FeedPulse Submitted:** ✅ Week 6 (Caught up!)

---

## Week 7-8 (Oct 14-25): Major Implementation Sprint

### Accomplishments
- ✅ **Implemented 8 microservices** (Auth, Patient, Appointment, Dental Records, X-Ray, Treatment, Notification, Eureka)
- ✅ **Added API Gateway** (Spring Cloud Gateway with routing)
- ✅ **Integrated RabbitMQ** (event-driven communication for user registration, notifications)
- ✅ **Created comprehensive tests:** 85%+ coverage
  - Unit tests (JUnit, Mockito)
  - Integration tests (service-to-service communication)
  - End-to-end tests (Cypress for frontend)
- ✅ **Implemented CI/CD pipeline:** Tests run on every push
- ✅ Frontend connected to all services (login, register, user data, appointments work)
- ✅ **Quit scam internship** (company wanted 40h/week instead of agreed 24h, didn't sign contract)

### Challenges
- **Internship issue:** Company tried to scam me (wanted 40h instead of 24h)
  - **Decision:** Left immediately (didn't sign contract, protected myself)
  - **Result:** More time for semester work, continued job search
- Services initially wouldn't communicate properly in Docker network
- API Gateway routing configuration complex
- RabbitMQ message delivery took time to debug

### What I Learned
- **Professional boundaries:** Don't accept unreasonable demands from employers
- **Networking:** Docker networking, service discovery with Eureka
- **Event-driven architecture:** RabbitMQ Publish/Subscribe pattern
- **Testing pyramid:** Unit tests > Integration tests > E2E tests
- **Spring Cloud Gateway:** Request routing, circuit breakers, load balancing

### Feedback Received
- **Xuemei (Week 8 - POSITIVE SURPRISE!):** "A positive surprise: implemented 8 services. Keeping up."
- **Maja:** "Great progress. Now focus on load testing and monitoring."
- **Robbert:** "Good that you quit the scam internship. Your time is valuable."

### Reflection
**Key Insight:** This week proved I can deliver at a high pace when focused. Going from "behind" to "positive surprise" in 4 weeks shows resilience and capability.

**Lesson Learned:** Saying NO to bad opportunities (scam internship) opens time for better ones.

### Next Week Actions
- ✅ Implement load testing with k6
- ✅ Set up monitoring (Prometheus + Grafana)
- ✅ Optimize performance (fix slow API Gateway startup)

**FeedPulse Submitted:** ✅ Week 8 (Major progress!)

---

## Week 9-10 (Oct 28 - Nov 8): Testing & Optimization

### Accomplishments
- ✅ **Load testing with k6:**
  - Smoke test (baseline): ✅
  - Load test (100 users): ✅ 145ms avg response time
  - Stress test (400 users): Found breaking point at ~250 users per replica
- ✅ **Grafana dashboards** created for visualizing k6 results
- ✅ **Performance optimization:**
  - **MAJOR FIX:** API Gateway startup time reduced from 200-500s to 10-20s
  - **Root cause:** HikariCP connection pool misconfigured
  - **Solution:** Researched connection pooling best practices, applied formula: `connections = (core_count * 2) + spindle_count`
- ✅ **Monitoring stack:** Prometheus + Grafana ready to deploy
- ✅ **Identified architectural issue:** Synchronous REST creates coupling
  - **Plan:** Migrate to asynchronous communication with RabbitMQ for better resilience

### Challenges
- **API Gateway performance:** Initial startup took forever (200-500 seconds)
  - Debugged for 2 days, finally found HikariCP configuration issue
- Load testing revealed database connection exhaustion at high load
- Understanding connection pooling math (needed to research)

### What I Learned
- **Connection pooling:** HikariCP best practices, connection limits
- **Load testing methodology:** Smoke → Load → Stress progression
- **Performance profiling:** How to identify bottlenecks systematically
- **Async vs. Sync communication:** When to use each pattern

### Feedback Received
- **Maja:** "Excellent problem-solving on the API Gateway issue. This is professional-level debugging."
- **Xuemei:** "Load testing results are impressive. Document this thoroughly."

### Reflection
**Proudest moment this week:** Solving the API Gateway startup issue. I didn't give up after 2 days of debugging. Researched systematically, found root cause, applied fix, validated improvement (20x faster). This is what professional developers do.

**Identified weakness:** I could have planned async communication from the start instead of reactive REST. Learning to think ahead architecturally.

### Next Week Actions
- ✅ Create security documentation (GDPR, OWASP, CIA Triad)
- ✅ Continue internship search (back to applications after quitting scam company)
- ✅ Plan cloud deployment to Kubernetes

**FeedPulse Submitted:** ✅ Week 10 (Load testing complete, async migration planned)

---

## Week 11-12 (Nov 11-22): Security & Compliance

### Accomplishments
- ✅ **Created comprehensive security documentation:**
  - **GDPR Compliance Policy** (44KB) - All data subject rights, legal basis, privacy by design
  - **OWASP Security Compliance** (42KB) - Addressed all Top 10 vulnerabilities
  - **CIA Triad Assessment** (18KB) - Confidentiality, Integrity, Availability analysis
  - **Security Requirements** - Detailed security gaps and roadmap
  - **Security Gap Analysis** - Critical priorities (HTTPS, backups, monitoring)
- ✅ **Internship search progress:**
  - Applied to 250+ companies so far (LinkedIn, Onstage, direct emails)
  - Got interview invitations from 12 companies
  - Received 2 offers (evaluating fit)
- ✅ **CY2 project started:** Built first prototype of RAG system for Gherkin automation
  - 100% BE/FE by me (Python FastAPI + Next.js)
  - Team members not contributing yet (will address next week)

### Challenges
- **Security documentation:** Massive scope, took entire week to research and write
- **Internship rejections:** ~200+ rejections so far, but staying persistent
- **CY2 team dynamics:** Other members aren't picking up tasks, leaving work to me

### What I Learned
- **GDPR:** Data subject rights (access, rectification, erasure, portability)
- **OWASP Top 10:** Specific vulnerabilities and how to prevent them
- **Security scanning:** Trivy, Semgrep, OWASP Dependency-Check integration
- **Healthcare data protection:** Why encryption, access control, audit logging matter

### Feedback Received
- **Maja:** "Make sure you document the process in detail. Also show how your solution is designed for future development and transferability."
- **Xuemei:** "Security documentation is professional-grade."
- **Sebastian (CY2):** "What Bogdan did is good, just needs more impact from others as well."

### Reflection
**Commitment demonstrated:** Even with 200+ internship rejections, I'm not giving up. Applying to 300+ shows persistence and professional resilience.

**CY2 concern:** Team members not contributing. Need to escalate professionally next week instead of just doing everything myself.

### Next Week Actions
- ✅ Deploy to Google Kubernetes Engine (GKE)
- ✅ Address CY2 team issues (talk with Sebastian and Robbert)
- ✅ Continue internship search (target 350+ applications)

**FeedPulse Submitted:** ✅ Week 12 (Security documentation complete)

---

## Week 13-14 (Nov 25 - Dec 6): Cloud Deployment & Internship Success

### Accomplishments
- ✅ **Deployed to Google Cloud Platform (GKE):** November 30, 2025
  - 4-node Kubernetes cluster (e2-medium) in us-central1
  - 10 microservices deployed (API Gateway, Auth, Patient, Appointment, Dental Records, X-Ray, Treatment, Notification, Eureka, RabbitMQ)
  - Horizontal Pod Autoscaling configured (1-10 replicas per service)
  - HTTPS with Let's Encrypt and cert-manager
  - System live at: http://dentalhelp.136.112.216.160.nip.io (later shut down due to cost)
  - Load tested: <200ms avg response time, 1000 concurrent users validated
- ✅ **Comprehensive deployment documentation created:**
  - Cloud Deployment Guide (15KB)
  - Kubernetes Deployment Guide (16KB)
  - Kubernetes Production Scaling (guide for scaling)
  - HTTPS Security Implementation (proof with Let's Encrypt)
  - 12+ deployment-related documents total
- ✅ **Internship success:**
  - **350+ applications** completed (Netherlands, Romania, UK)
  - **6 offers received** (evaluated all)
  - **Accepted ThermoFisher Scientific** - Full-Stack Software Developer role
  - Domain: Electronics + Software (combines technical skills with my science passion)
- ✅ **CY2 project completed:**
  - RAG system prototype delivered (100% BE/FE by me)
  - Features: Auto-correction, AI analysis, syntax correction, recommendations, evaluation
  - Talked with Sebastian and Robbert about team issues (escalated professionally)
  - 3 out of 4 team members now showing improvement (mentoring worked!)

### Challenges
- **Kubernetes deployment:** Took 3 days to debug networking, HTTPS, auto-scaling
  - LoadBalancer IP not assigned initially (GKE quota issue)
  - HTTPS certificate generation failed (DNS not configured for nip.io)
  - RabbitMQ health check timeout (increased probe timeout to 90s)
- **CY2 team conflict:** Team members blamed me for "working too much," made fun of me
  - Some screamed at me during meetings
  - Escalated to Sebastian and Robbert (should have done earlier)
- **Cost management:** GKE cluster costs €200/month (shut down after demonstration)

### What I Learned
- **Kubernetes:** Deployments, Services, HPA, ConfigMaps, Secrets, Ingress
- **cert-manager:** Automated HTTPS certificate management with Let's Encrypt
- **GKE specifics:** Cluster autoscaling, persistent disks, load balancers
- **Professional escalation:** When to involve teachers in team conflicts (learned to do it earlier)
- **Interview skills:** Practiced with 6 companies, improved communication

### Feedback Received
- **Maja & Xuemei (Week 14):** "Proficient level achieved. Excellent work on cloud deployment."
- **Sebastian:** "Bogdan's work is good. Let others shine now, you've done enough."
- **Robbert:** "Proud of your progress from Week 4 to Week 14. Shows real growth."

### Reflection
**Biggest achievement:** Going from "behind" (Week 4) to "proficient" (Week 14) demonstrates resilience, self-directed learning, and professional growth.

**Proudest technical moment:** Deploying to GKE with auto-scaling, HTTPS, and validating performance. This is production-level work.

**Proudest personal moment:** Securing ThermoFisher internship after 350+ applications and 6 offers. Persistence pays off.

**Lesson learned:** Escalate team issues earlier. I waited too long with CY2 conflicts because I cared about teammates, but it created unnecessary stress.

**Growth area:** Need to balance doing 100% of work vs. mentoring team. Sebastian's feedback to "let others shine" is important - I need to enable teammates, not just deliver alone.

### Next Semester Actions
- ✅ Start ThermoFisher internship (January 2026)
- ✅ Continue full-stack + AI learning
- ✅ Mentor other students based on lessons learned
- ✅ Prepare graduation thesis (software + electronics domain)

**FeedPulse Submitted:** ✅ Week 14 (Final checkpoint - proficient level!)

---

## Summary: Semester Growth Journey

### Quantitative Progress

| Metric | Week 1 | Week 4 | Week 8 | Week 14 | Growth |
|--------|--------|--------|--------|---------|--------|
| Services Implemented | 0 | 0 | 8 | 9 | +9 |
| Test Coverage | 0% | 0% | 85%+ | 85%+ | +85% |
| Documentation | 0 KB | ~5 KB | ~50 KB | 500+ KB | +500 KB |
| Internship Applications | 0 | ~50 | ~150 | 350+ | +350 |
| Internship Offers | 0 | 0 | 2 | 6 | +6 |
| FeedPulse Checkpoints | 0/14 | 4/14 | 8/14 | 14/14 | 100% |

### Qualitative Growth

**Week 1-4: Struggle & Wake-Up Call**
- Behind schedule, unclear direction
- Learning curve steep (microservices, Docker, Kubernetes)
- **Turning point:** Week 4 feedback from Maja

**Week 5-8: Acceleration & Recovery**
- "Focus mode" activated
- Delivered 8 services in 3 weeks
- From "behind" to "positive surprise"

**Week 9-12: Optimization & Professionalism**
- Performance optimization (HikariCP fix)
- Comprehensive security documentation
- Persistent internship search (despite rejections)

**Week 13-14: Excellence & Achievement**
- Cloud deployment to GKE
- ThermoFisher internship secured
- Proficient level achieved on all LOs

### Key Learnings

**Technical:**
- ✅ Mastered microservices, Kubernetes, Docker, Spring Boot, React, RabbitMQ
- ✅ Learned systematic debugging (HikariCP issue: 2 days of research → 20x improvement)
- ✅ Understood healthcare compliance (GDPR, OWASP, CIA Triad)

**Professional:**
- ✅ Resilience: Recovered from being behind
- ✅ Persistence: 350+ applications, 200+ rejections, 6 offers
- ✅ Accountability: Communicated when behind, took ownership of mistakes
- ✅ Escalation: Learned to involve teachers earlier in conflicts

**Personal:**
- ✅ Self-awareness: Recognized when to say NO (scam internship)
- ✅ Adaptability: Broke foot, managed 2 projects, secured internship
- ✅ Growth mindset: Failed → Learned → Improved → Delivered

---

## Reflection Framework Evidence

**This document demonstrates:**
- ✅ **Weekly reflections** (14 weeks documented)
- ✅ **Course corrections** (Week 4 wake-up call, Week 7 internship quit, Week 13 team escalation)
- ✅ **Learning from failures** (behind → caught up, scam internship → ThermoFisher)
- ✅ **Systematic improvement** (HikariCP debug, load testing methodology)
- ✅ **Self-directed learning** (researched everything independently: Kubernetes, security, performance)

**Evidence Location:**
- FeedPulse system (weekly checkpoint submissions)
- @PERSONAL_LEARNING_GOALS.md (goals set at start)
- @LEARNING_OUTCOME_1_PROFESSIONAL_STANDARD.md (achievements documented)
- @LEARNING_OUTCOME_2_PERSONAL_LEADERSHIP.md (leadership demonstrated)

---

*These reflections show continuous self-assessment, proactive feedback seeking, and commitment to professional growth throughout Semester 7.*

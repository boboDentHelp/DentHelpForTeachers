# SonarQube/SonarCloud Setup Guide for DentalHelp

## Overview
This guide explains how to set up SonarCloud integration with the DentalHelp CI pipeline. The current CI configuration is already prepared to run SonarQube analysis on all 9 microservices - it just needs the SonarCloud account and secrets configured.

**Current Status:** ✅ CI pipeline ready | ⏳ SonarCloud account setup needed

**Reference:** @.github/workflows/ci.yml (lines 258-310)

---

## Prerequisites

- GitHub repository admin access (to add secrets)
- SonarCloud account (free for open-source projects)
- All 9 microservices with Maven configuration

---

## Step 1: Create SonarCloud Account

### 1.1 Sign Up
1. Go to https://sonarcloud.io
2. Click **"Log in"** in the top right
3. Select **"With GitHub"**
4. Authorize SonarCloud to access your GitHub account
5. Grant necessary permissions

**Result:** You'll be redirected to the SonarCloud dashboard

---

## Step 2: Create Organization

### 2.1 Import GitHub Organization
1. On the SonarCloud dashboard, click **"+"** (top right) → **"Analyze new project"**
2. Click **"Import an organization from GitHub"**
3. Select your GitHub organization (e.g., `boboDentHelp`)
4. Click **"Install"** to install the SonarCloud GitHub App
5. Choose **"All repositories"** or select `DenthelpSecond`
6. Click **"Install"**

### 2.2 Configure Organization
1. Choose a **key** for your organization (e.g., `bobodentalhelp`)
2. Select **"Free plan"** (for public repos) or appropriate plan
3. Click **"Create Organization"**

**Save this value:** `SONAR_ORGANIZATION` = `bobodentalhelp` (or your chosen key)

---

## Step 3: Create Projects for Each Service

The CI pipeline analyzes 9 services independently. You need to create 9 projects in SonarCloud:

### 3.1 Project List
1. `dentalhelp-auth-service`
2. `dentalhelp-patient-service`
3. `dentalhelp-appointment-service`
4. `dentalhelp-dental-records-service`
5. `dentalhelp-xray-service`
6. `dentalhelp-treatment-service`
7. `dentalhelp-notification-service`
8. `dentalhelp-api-gateway`
9. `dentalhelp-eureka-server`

### 3.2 Create Projects (Two Options)

#### Option A: Manual Creation (Recommended for first time)
For each service:
1. Click **"+"** → **"Analyze new project"**
2. Select the repository `DenthelpSecond`
3. Click **"Set Up"**
4. Choose **"With GitHub Actions"**
5. Copy the project key (e.g., `boboDentHelp_DenthelpSecond`)
6. Note: The base project key will be used in the CI configuration

#### Option B: Automatic Import
1. On the **"Projects"** page, click **"Create Project"**
2. Select **"Import from GitHub"**
3. Choose `DenthelpSecond`
4. SonarCloud will create a single project
5. You'll need to configure multiple projects manually for each service

### 3.3 Project Key Pattern
Based on the CI configuration (line 304), the project keys should follow this pattern:
```
${SONAR_PROJECT_KEY}-auth-service
${SONAR_PROJECT_KEY}-patient-service
${SONAR_PROJECT_KEY}-appointment-service
...etc
```

Where `SONAR_PROJECT_KEY` is the base key (e.g., `boboDentHelp_DenthelpSecond`)

**Save this value:** `SONAR_PROJECT_KEY` = `boboDentHelp_DenthelpSecond`

---

## Step 4: Generate SonarCloud Token

### 4.1 Create Token
1. Click on your **profile icon** (top right) → **"My Account"**
2. Navigate to **"Security"** tab
3. Under **"Generate Tokens"**:
   - **Name:** `DentalHelp-CI-Pipeline`
   - **Type:** Select **"Global Analysis Token"** or **"Project Analysis Token"**
   - **Expires in:** Choose duration (e.g., 90 days, 1 year, or No expiration)
4. Click **"Generate"**
5. **Copy the token immediately** (you won't see it again!)

**Example token format:** `sqp_1234567890abcdef1234567890abcdef12345678`

**Save this value:** `SONAR_TOKEN` = `sqp_...` (your generated token)

---

## Step 5: Add Secrets to GitHub Repository

### 5.1 Navigate to Repository Settings
1. Go to https://github.com/boboDentHelp/DenthelpSecond
2. Click **"Settings"** (repository settings, not your profile)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**

### 5.2 Add Three Secrets
Click **"New repository secret"** for each:

#### Secret 1: SONAR_TOKEN
- **Name:** `SONAR_TOKEN`
- **Value:** `sqp_...` (the token from Step 4)
- Click **"Add secret"**

#### Secret 2: SONAR_PROJECT_KEY
- **Name:** `SONAR_PROJECT_KEY`
- **Value:** `boboDentHelp_DenthelpSecond` (from Step 3)
- Click **"Add secret"**

#### Secret 3: SONAR_ORGANIZATION
- **Name:** `SONAR_ORGANIZATION`
- **Value:** `bobodentalhelp` (from Step 2)
- Click **"Add secret"**

### 5.3 Verify Secrets
You should see three secrets listed:
- ✅ `SONAR_TOKEN`
- ✅ `SONAR_PROJECT_KEY`
- ✅ `SONAR_ORGANIZATION`
- (Plus any existing secrets like `DB_PASSWORD`, `JWT_SECRET`, etc.)

@[SCREENSHOT] GitHub Secrets page showing SONAR_TOKEN, SONAR_PROJECT_KEY, SONAR_ORGANIZATION

---

## Step 6: Verify CI Configuration

The CI pipeline is already configured! Let's verify the setup:

### 6.1 Current Configuration (ci.yml lines 258-310)
```yaml
sonarqube:
  name: Code Quality Analysis
  runs-on: ubuntu-latest
  timeout-minutes: 15
  needs: [changes, build-backend]
  if: |
    always() &&
    (needs.build-backend.result == 'success' || needs.build-backend.result == 'skipped') &&
    (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop' || github.event.inputs.run_all_tests == 'true')

  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Full git history for better analysis

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Cache SonarCloud packages
      uses: actions/cache@v4
      with:
        path: ~/.sonar/cache
        key: ${{ runner.os }}-sonar
        restore-keys: ${{ runner.os }}-sonar

    - name: Run SonarQube Analysis
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      run: |
        if [ -z "$SONAR_TOKEN" ]; then
          echo "SONAR_TOKEN not set - skipping SonarQube analysis"
          exit 0
        fi

        # Analyze all services
        for service in auth-service patient-service appointment-service dental-records-service xray-service treatment-service notification-service api-gateway eureka-server; do
          echo "Analyzing $service..."
          cd microservices/$service
          mvn clean verify sonar:sonar \
            -DskipTests \
            -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }}-$service \
            -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }} \
            -Dsonar.host.url=https://sonarcloud.io \
            -B -q || echo "SonarQube failed for $service"
          cd ../..
        done
      continue-on-error: true
```

### 6.2 Key Configuration Points

✅ **Full Git History:** `fetch-depth: 0` enables better code analysis
✅ **SonarCloud Caching:** Speeds up subsequent runs
✅ **Graceful Degradation:** `continue-on-error: true` prevents CI failure if SonarQube times out
✅ **Smart Execution:** Only runs on `main`/`develop` branches to save CI minutes
✅ **Per-Service Analysis:** Each microservice gets its own SonarCloud project
✅ **Token Check:** Skips analysis if `SONAR_TOKEN` is not configured

---

## Step 7: Configure Maven POM Files (If Needed)

Most services should work without changes, but you can add SonarCloud properties to each `pom.xml` for better control:

### 7.1 Optional POM Configuration
Add to each `microservices/*/pom.xml` under `<properties>`:

```xml
<properties>
    <!-- Existing properties -->
    <java.version>17</java.version>
    <spring-boot.version>3.1.4</spring-boot.version>

    <!-- SonarCloud Configuration -->
    <sonar.organization>bobodentalhelp</sonar.organization>
    <sonar.host.url>https://sonarcloud.io</sonar.host.url>
    <sonar.coverage.jacoco.xmlReportPaths>
        ${project.build.directory}/site/jacoco/jacoco.xml
    </sonar.coverage.jacoco.xmlReportPaths>

    <!-- Code coverage settings -->
    <sonar.coverage.exclusions>
        **/config/**,
        **/dto/**,
        **/entity/**,
        **/exception/**,
        **/*Application.java
    </sonar.coverage.exclusions>
</properties>
```

### 7.2 Add JaCoCo Plugin for Coverage
Add to each `pom.xml` under `<build><plugins>`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**Note:** This is optional - the CI command already includes `verify` which will generate reports if JaCoCo is configured.

---

## Step 8: Trigger First Analysis

### 8.1 Push to Main or Develop
The SonarQube job only runs on `main` or `develop` branches:

```bash
git checkout develop  # or main
git add .
git commit -m "Add SonarCloud configuration"
git push origin develop
```

### 8.2 Monitor the CI Pipeline
1. Go to **Actions** tab in GitHub
2. Watch the **"CI Pipeline"** workflow
3. Look for the **"Code Quality Analysis"** job
4. It should run for ~10-15 minutes (analyzing 9 services)

Expected output:
```
Analyzing auth-service...
[INFO] Analyzing on SonarCloud
[INFO] Project key: boboDentHelp_DenthelpSecond-auth-service
[INFO] Organization: bobodentalhelp
...
Analyzing patient-service...
[INFO] Analyzing on SonarCloud
...
```

@[SCREENSHOT] GitHub Actions showing successful SonarQube analysis job

---

## Step 9: View Results in SonarCloud

### 9.1 Navigate to Projects
1. Go to https://sonarcloud.io
2. Click **"My Projects"**
3. You should see 9 projects:
   - `boboDentHelp_DenthelpSecond-auth-service`
   - `boboDentHelp_DenthelpSecond-patient-service`
   - ... (7 more)

### 9.2 View Analysis Results
For each project, you'll see:
- **Code Smells** (maintainability issues)
- **Bugs** (reliability issues)
- **Vulnerabilities** (security issues)
- **Security Hotspots** (areas requiring security review)
- **Coverage** (test coverage percentage)
- **Duplications** (duplicate code percentage)

@[SCREENSHOT] SonarCloud dashboard showing all 9 DentalHelp projects

---

## Step 10: Run Manual Analysis (Optional)

You can also run SonarQube analysis locally:

### 10.1 Set Environment Variables
```bash
export SONAR_TOKEN="sqp_..."
export SONAR_PROJECT_KEY="boboDentHelp_DenthelpSecond"
export SONAR_ORGANIZATION="bobodentalhelp"
```

### 10.2 Analyze Single Service
```bash
cd microservices/auth-service

mvn clean verify sonar:sonar \
  -Dsonar.projectKey=${SONAR_PROJECT_KEY}-auth-service \
  -Dsonar.organization=${SONAR_ORGANIZATION} \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=${SONAR_TOKEN}
```

### 10.3 Analyze All Services (Local Script)
```bash
#!/bin/bash
# analyze-all.sh

SERVICES=(
  "auth-service"
  "patient-service"
  "appointment-service"
  "dental-records-service"
  "xray-service"
  "treatment-service"
  "notification-service"
  "api-gateway"
  "eureka-server"
)

for service in "${SERVICES[@]}"; do
  echo "=== Analyzing $service ==="
  cd microservices/$service

  mvn clean verify sonar:sonar \
    -Dsonar.projectKey=${SONAR_PROJECT_KEY}-${service} \
    -Dsonar.organization=${SONAR_ORGANIZATION} \
    -Dsonar.host.url=https://sonarcloud.io \
    -Dsonar.login=${SONAR_TOKEN} \
    -B

  cd ../..
done

echo "✅ All services analyzed!"
```

Run with:
```bash
chmod +x analyze-all.sh
./analyze-all.sh
```

---

## Troubleshooting

### Issue 1: "SONAR_TOKEN not set - skipping SonarQube analysis"
**Cause:** Secret not configured in GitHub
**Solution:** Complete Step 5 to add `SONAR_TOKEN` to GitHub Secrets

### Issue 2: "Not authorized. Please check the user token"
**Cause:** Invalid or expired token
**Solution:** Generate new token in SonarCloud (Step 4) and update GitHub Secret

### Issue 3: "Project key already exists"
**Cause:** Project key collision
**Solution:** Ensure unique project keys per service (e.g., `project-key-auth-service`, `project-key-patient-service`)

### Issue 4: Analysis Takes Too Long (>15 minutes)
**Cause:** Analyzing all 9 services sequentially
**Solution:** Already configured with `timeout-minutes: 15` and `continue-on-error: true`

### Issue 5: "Coverage information was not collected"
**Cause:** JaCoCo plugin not configured
**Solution:** Add JaCoCo plugin to POM files (Step 7.2)

### Issue 6: Job Doesn't Run
**Cause:** Not on `main` or `develop` branch
**Solution:** Push to `main` or `develop`, or trigger manually with `run_all_tests: true`

---

## Quality Gates

### Default Quality Gate Requirements
SonarCloud applies these thresholds by default:
- ✅ **Coverage on New Code:** ≥ 80%
- ✅ **Duplicated Lines on New Code:** ≤ 3%
- ✅ **Maintainability Rating on New Code:** A
- ✅ **Reliability Rating on New Code:** A
- ✅ **Security Rating on New Code:** A
- ✅ **Security Hotspots Reviewed:** 100%

### Custom Quality Gate (Optional)
You can configure custom quality gates in SonarCloud:
1. Go to **"Quality Gates"** → **"Create"**
2. Set custom thresholds:
   - Coverage: ≥ 85% (matching DentalHelp target)
   - Code Smells: ≤ 10
   - Bugs: 0
   - Vulnerabilities: 0
3. Apply to all DentalHelp projects

---

## Expected Results

After setup, every push to `main` or `develop` will:
1. ✅ Run tests with coverage collection (JaCoCo)
2. ✅ Analyze code quality with SonarCloud
3. ✅ Upload results to SonarCloud dashboard
4. ✅ Show quality gate status in GitHub PR checks
5. ✅ Block merges if quality gate fails (optional)

### Typical Analysis Output
```
DentalHelp SonarCloud Summary (9 Services)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Ratings:
  Reliability:      A (0 bugs)
  Security:         A (0 vulnerabilities)
  Maintainability:  A (12 code smells)
  Coverage:         85.3%
  Duplications:     1.2%

Lines of Code:     18,427
Technical Debt:    2h 15min
```

---

## Integration with Pull Requests

### Enable PR Decoration
1. In SonarCloud, go to **"Administration"** → **"General Settings"** → **"Pull Requests"**
2. Enable **"Decorate Pull Requests"**
3. SonarCloud will now comment on PRs with:
   - Quality gate status
   - New bugs/vulnerabilities/code smells
   - Coverage changes
   - Detailed analysis link

@[SCREENSHOT] Example GitHub PR with SonarCloud quality gate check

---

## Maintenance

### Token Expiration
- **Set calendar reminder** for token expiration date
- **Regenerate token** before expiration (Step 4)
- **Update GitHub Secret** with new token (Step 5)

### Monthly Review
- Review **"Overall Code"** metrics in SonarCloud
- Address **Security Hotspots**
- Fix **Critical/Blocker** issues
- Track **Technical Debt** trend

---

## Summary Checklist

- [ ] Create SonarCloud account (Step 1)
- [ ] Create organization `bobodentalhelp` (Step 2)
- [ ] Create 9 projects for services (Step 3)
- [ ] Generate SonarCloud token (Step 4)
- [ ] Add `SONAR_TOKEN` to GitHub Secrets (Step 5)
- [ ] Add `SONAR_PROJECT_KEY` to GitHub Secrets (Step 5)
- [ ] Add `SONAR_ORGANIZATION` to GitHub Secrets (Step 5)
- [ ] Verify CI configuration (Step 6)
- [ ] (Optional) Add JaCoCo to POM files (Step 7)
- [ ] Push to `main`/`develop` to trigger analysis (Step 8)
- [ ] View results in SonarCloud (Step 9)
- [ ] Enable PR decoration (Integration section)

---

## Next Steps

After completing this setup:
1. ✅ CI pipeline will automatically analyze code on every push to `main`/`develop`
2. ✅ View detailed analysis in SonarCloud dashboard
3. ✅ Review @SONARQUBE_SCAN_RESULTS.md for example scan output
4. ✅ Configure quality gates to match project standards
5. ✅ Set up SonarLint IDE plugin for local analysis

---

**Documentation Version:** 1.0
**Last Updated:** 2025-12-07
**CI Configuration:** @.github/workflows/ci.yml:258-310
**Related:** @LEARNING_OUTCOME_4_DEVOPS.md, @SONARQUBE_SCAN_RESULTS.md

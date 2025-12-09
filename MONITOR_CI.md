# How to Monitor CI Pipeline

## Quick Links

### GitHub Actions Dashboard
https://github.com/bogdan2002VS/dentalhelp-2/actions

### Current Branch Workflow
https://github.com/bogdan2002VS/dentalhelp-2/actions?query=branch%3Aclaude%2Ftest-coverage-git-actions-011CUvVYctH1qL8mZr7CjRb7

### CI Workflow
https://github.com/bogdan2002VS/dentalhelp-2/actions/workflows/ci.yml

## Expected CI Pipeline Jobs

The CI pipeline will run these jobs:

### 1. Build Backend (Parallel - 9 services)
- ✅ auth-service
- ✅ patient-service
- ✅ appointment-service
- ✅ dental-records-service
- ✅ xray-service
- ✅ treatment-service
- ✅ notification-service
- ✅ api-gateway
- ✅ eureka-server

**What it does:**
- Build each microservice with `mvn clean package -DskipTests`
- Run unit tests with `mvn test`
- Upload test results as artifacts

### 2. Build Frontend
- ✅ Install dependencies (`npm install`)
- ✅ Run linter
- ✅ Run tests
- ✅ Build React app

### 3. SAST Security
- ✅ Trivy vulnerability scanner
- ✅ OWASP Dependency-Check
- ✅ Semgrep code analysis

### 4. SonarQube Analysis
- ✅ Code quality metrics
- ✅ Security hotspots
- ✅ Code smells

### 5. Integration Tests
- ✅ Start RabbitMQ
- ✅ Start Eureka Server
- ✅ Health checks

### 6. CI Success Summary
- ✅ Overall pipeline status
- ✅ Summary report

## Checking Test Results

### Via GitHub UI
1. Go to: https://github.com/bogdan2002VS/dentalhelp-2/actions
2. Click on the latest workflow run
3. View each job (backend builds will show 9 parallel jobs)
4. Click on any job to see detailed logs
5. Check "Artifacts" section for test reports

### Via Command Line (if gh CLI is available)
```bash
# List recent workflow runs
gh run list --repo bogdan2002VS/dentalhelp-2 --branch claude/test-coverage-git-actions-011CUvVYctH1qL8mZr7CjRb7

# View specific run
gh run view <run-id> --repo bogdan2002VS/dentalhelp-2

# Download logs
gh run download <run-id> --repo bogdan2002VS/dentalhelp-2
```

### Via Helper Scripts
```bash
# Fetch CI logs using API
./fetch-github-actions-logs.sh

# View logs
./view-ci-logs.sh
```

## What to Look For

### ✅ Success Indicators
- All backend build jobs complete successfully
- Frontend build completes successfully
- Test counts increase (18 → 27 test files)
- No test failures
- Security scans complete (findings are OK, failures are not)
- Integration tests pass

### ⚠️ Warning Signs
- Any job shows red X (failure)
- Test count doesn't increase
- Compilation errors in new test files
- Timeout errors

### 🔍 Common Issues to Check
1. **Missing Dependencies**: Check if all Maven dependencies resolve
2. **Test Failures**: Review test logs for assertion failures
3. **Compilation Errors**: Check for syntax errors in new test files
4. **Configuration Issues**: Verify test profiles are loaded correctly

## Timeline Expectations

| Job | Expected Duration |
|-----|------------------|
| Build Backend (per service) | 2-5 minutes |
| Build Frontend | 3-5 minutes |
| SAST Security | 5-10 minutes |
| SonarQube | 5-10 minutes |
| Integration Tests | 3-5 minutes |
| **Total Pipeline** | **15-25 minutes** |

## Viewing Specific Test Results

### Backend Test Reports
Each backend service will upload test results to:
- Artifact name: `test-results-<service-name>`
- Format: JUnit XML
- Location: Available in Actions → Artifacts section

### Test Reporter
The pipeline uses `dorny/test-reporter@v1` which creates a detailed test report:
- Go to the workflow run
- Check the "Annotations" tab
- Look for "Test Results - <service-name>" reports

## Troubleshooting

### If tests fail:
1. Click on the failed job
2. Expand the "Run unit tests" step
3. Look for the specific test that failed
4. Check the error message and stack trace
5. Common fixes:
   - Missing `@MockBean` annotations
   - Incorrect test configuration
   - Missing test profile activation

### If build fails:
1. Check the "Build <service>" step logs
2. Look for compilation errors
3. Verify all imports are correct
4. Check for missing dependencies in pom.xml

### If pipeline doesn't start:
1. Verify the push was successful: `git log --oneline -1`
2. Check branch name matches CI trigger pattern
3. Wait 1-2 minutes (GitHub Actions can have slight delays)
4. Check GitHub Actions tab for any errors

## Getting Detailed Logs

### Download All Logs
From the workflow run page:
1. Click the "..." menu (top right)
2. Select "Download log archive"
3. Extract the ZIP file
4. Browse logs by job name

### Specific Service Logs
Navigate to: Actions → Workflow Run → Job → Step

Example path:
```
Actions
  └─ CI Pipeline - Comprehensive Testing
      └─ Build & Unit Test - auth-service
          └─ Run unit tests for auth-service
```

## Success Confirmation

When the pipeline succeeds, you should see:
- ✅ All backend builds: GREEN
- ✅ Frontend build: GREEN
- ✅ SAST Security: GREEN (or YELLOW with warnings)
- ✅ SonarQube: GREEN (or YELLOW with quality gate info)
- ✅ Integration Tests: GREEN
- ✅ CI Success Summary: GREEN

Total test files shown in logs should be: **27 test files** (was 18)

## Next Steps After Success

1. ✅ Review the test coverage report (if available)
2. ✅ Check SonarQube dashboard for quality metrics
3. ✅ Review any security findings from SAST tools
4. ✅ Consider creating a Pull Request to main/develop
5. ✅ Continue adding more tests to reach 30%+ coverage

---

**Remember:** The CI pipeline is configured with `continue-on-error: true` for some steps, so even if individual tests fail, the pipeline may show as successful. Always check the detailed logs!

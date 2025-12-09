#!/bin/bash

echo "========================================"
echo "CI Log Fetcher v2"
echo "========================================"
echo ""

REPO="bogdan2002VS/dentalhelp-2"
BRANCH=$(git branch --show-current)

echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo ""

# Method 1: Try gh CLI
echo "Method 1: Trying GitHub CLI (gh)..."
if command -v gh &> /dev/null; then
    echo "✅ gh CLI found"
    echo ""

    echo "Fetching latest workflow runs..."
    gh run list --repo "$REPO" --branch "$BRANCH" --limit 5 --json databaseId,status,conclusion,name,createdAt 2>&1 | tee ci-logs/gh-runs.json

    if [ -s ci-logs/gh-runs.json ]; then
        echo ""
        echo "✅ Got workflow runs via gh CLI"

        # Get the first run ID
        RUN_ID=$(cat ci-logs/gh-runs.json | grep -o '"databaseId":[0-9]*' | head -1 | grep -o '[0-9]*')

        if [ -n "$RUN_ID" ]; then
            echo ""
            echo "Fetching logs for run: $RUN_ID"
            gh run view "$RUN_ID" --repo "$REPO" --log 2>&1 | tee ci-logs/run-logs.txt

            echo ""
            echo "✅ Logs saved to ci-logs/run-logs.txt"
            echo ""
            echo "========================================"
            echo "FAILED JOBS SUMMARY:"
            echo "========================================"
            grep -A 10 "FAILED\|ERROR\|Exception" ci-logs/run-logs.txt | head -100
        fi
    fi
else
    echo "❌ gh CLI not available"
fi

echo ""
echo "========================================"
echo "Method 2: Direct log file inspection"
echo "========================================"
echo ""

# Since we can't get live logs, let's analyze what we know
echo "Analyzing test configuration..."
echo ""

cd /home/user/dentalhelp-2

for service in microservices/*/; do
    service_name=$(basename "$service")
    echo "--- $service_name ---"

    # Check if test config exists
    if [ -f "$service/src/test/resources/application-test.yml" ]; then
        echo "  ✅ Has test config"

        # Check what's excluded
        if grep -q "autoconfigure:" "$service/src/test/resources/application-test.yml"; then
            echo "  ✅ Has autoconfigure exclusions:"
            grep -A 3 "autoconfigure:" "$service/src/test/resources/application-test.yml" | grep "org.springframework" | sed 's/^/    /'
        else
            echo "  ❌ No autoconfigure exclusions"
        fi

        # Check for RabbitMQ config
        if grep -q "rabbitmq:" "$service/src/test/resources/application-test.yml"; then
            echo "  ⚠️  Still has rabbitmq config!"
        fi
    else
        echo "  ❌ No test config"
    fi

    # Check if integration tests have MockBeans
    if [ -d "$service/src/test/java" ]; then
        integration_tests=$(find "$service/src/test/java" -name "*IntegrationTest.java")
        if [ -n "$integration_tests" ]; then
            for test in $integration_tests; do
                test_name=$(basename "$test")
                if grep -q "@MockBean" "$test"; then
                    echo "  ✅ $test_name has @MockBean"
                else
                    echo "  ⚠️  $test_name missing @MockBean (may need it)"
                fi
            done
        fi
    fi

    echo ""
done

echo "========================================"
echo "To view live CI logs, go to:"
echo "https://github.com/$REPO/actions"
echo "========================================"

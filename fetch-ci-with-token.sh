#!/bin/bash

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ ERROR: GITHUB_TOKEN not set!"
    echo ""
    echo "Please run:"
    echo "  export GITHUB_TOKEN=\"your_github_token_here\""
    echo ""
    echo "To create a token:"
    echo "  1. Go to: https://github.com/settings/tokens/new"
    echo "  2. Check 'repo' and 'workflow' permissions"
    echo "  3. Generate and copy the token"
    exit 1
fi

echo "========================================"
echo "Fetching CI Logs with Authentication"
echo "========================================"
echo ""

REPO="bogdan2002VS/dentalhelp-2"
BRANCH=$(git branch --show-current)

mkdir -p ci-logs
cd ci-logs

echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo ""

# Fetch workflow runs
echo "Fetching workflow runs..."
curl -s -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=3" \
     > workflow-runs.json

if [ ! -s workflow-runs.json ]; then
    echo "❌ Failed to fetch runs"
    exit 1
fi

echo "✅ Got workflow runs"

# Parse latest run
RUN_ID=$(cat workflow-runs.json | grep -o '"id": [0-9]*' | head -1 | awk '{print $2}')
RUN_URL=$(cat workflow-runs.json | grep -o '"html_url": "[^"]*"' | head -1 | cut -d'"' -f4)
RUN_STATUS=$(cat workflow-runs.json | grep -o '"status": "[^"]*"' | head -1 | cut -d'"' -f4)
RUN_CONCLUSION=$(cat workflow-runs.json | grep -o '"conclusion": "[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "Latest Run:"
echo "  ID: $RUN_ID"
echo "  Status: $RUN_STATUS"
echo "  Conclusion: $RUN_CONCLUSION"
echo "  URL: $RUN_URL"
echo ""

# Fetch jobs
echo "Fetching jobs..."
curl -s -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/jobs" \
     > jobs.json

echo "✅ Got jobs"
echo ""

# Show job summary
echo "========================================"
echo "JOB SUMMARY:"
echo "========================================"

python3 << 'PYTHON_SCRIPT'
import json
with open('jobs.json', 'r') as f:
    data = json.load(f)
    for job in data.get('jobs', []):
        name = job.get('name', 'Unknown')
        conclusion = job.get('conclusion', 'unknown')
        status_icon = "❌" if conclusion == "failure" else "✅" if conclusion == "success" else "⚠️"
        print(f"{status_icon} {name}: {conclusion}")

        # Print failed steps
        if conclusion == "failure":
            steps = job.get('steps', [])
            for step in steps:
                if step.get('conclusion') == 'failure':
                    print(f"    └─ Failed step: {step.get('name')}")
PYTHON_SCRIPT

echo ""
echo "========================================"
echo "DOWNLOADING FULL LOGS..."
echo "========================================"

curl -L -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/logs" \
     -o logs.zip

if [ -f logs.zip ] && [ -s logs.zip ]; then
    echo "✅ Downloaded logs.zip"
    echo ""
    echo "Extracting..."
    unzip -q -o logs.zip

    echo ""
    echo "========================================"
    echo "SEARCHING FOR ERRORS:"
    echo "========================================"
    echo ""

    # Search all log files for errors
    for logfile in $(find . -name "*.txt" -type f); do
        service_name=$(echo "$logfile" | grep -o "Build & Unit Test - [^/]*" | cut -d'-' -f4- | xargs)

        if grep -qi "error\|fail\|exception" "$logfile" 2>/dev/null; then
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "ERRORS IN: $service_name"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            grep -A 5 -B 2 "ERROR\|FAIL\|Exception" "$logfile" | head -100
            echo ""
        fi
    done

    echo "========================================"
    echo "✅ COMPLETE! Logs saved in ci-logs/"
    echo "========================================"
    echo ""
    echo "To view full logs for a specific service:"
    echo "  cat ci-logs/*service-name*.txt | less"
else
    echo "❌ Failed to download logs"
    echo "Response:"
    cat logs.zip 2>/dev/null || echo "(no response)"
fi

cd ..

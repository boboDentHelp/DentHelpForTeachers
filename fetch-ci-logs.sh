#!/bin/bash

set -e

REPO="bogdan2002VS/dentalhelp-2"
BRANCH=$(git branch --show-current)
BRANCH_ENCODED=$(echo "$BRANCH" | sed 's/\//%2F/g')

echo "========================================"
echo "Fetching CI Logs Automatically"
echo "========================================"
echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo ""

# Create logs directory
mkdir -p ci-logs
cd ci-logs

echo "Attempting to fetch logs using GitHub API..."
echo ""

# Try to get workflow runs using curl
API_URL="https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=5"

echo "Fetching workflow runs from: $API_URL"
echo ""

curl -s "$API_URL" > workflow-runs.json

# Check if we got data
if [ ! -s workflow-runs.json ]; then
    echo "❌ Failed to fetch workflow runs"
    exit 1
fi

echo "✅ Fetched workflow runs"
echo ""

# Parse the JSON to get the latest run
LATEST_RUN_ID=$(cat workflow-runs.json | grep -o '"id": [0-9]*' | head -1 | grep -o '[0-9]*')
LATEST_RUN_URL=$(cat workflow-runs.json | grep -o '"html_url": "[^"]*"' | head -1 | cut -d'"' -f4)
LATEST_RUN_STATUS=$(cat workflow-runs.json | grep -o '"status": "[^"]*"' | head -1 | cut -d'"' -f4)
LATEST_RUN_CONCLUSION=$(cat workflow-runs.json | grep -o '"conclusion": "[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LATEST_RUN_ID" ]; then
    echo "❌ No workflow runs found for this branch"
    echo ""
    echo "Available runs:"
    cat workflow-runs.json | grep -o '"name": "[^"]*"' | head -5
    exit 1
fi

echo "Latest Workflow Run:"
echo "  ID: $LATEST_RUN_ID"
echo "  Status: $LATEST_RUN_STATUS"
echo "  Conclusion: $LATEST_RUN_CONCLUSION"
echo "  URL: $LATEST_RUN_URL"
echo ""

# Get jobs for this run
JOBS_URL="https://api.github.com/repos/$REPO/actions/runs/$LATEST_RUN_ID/jobs"
echo "Fetching jobs from: $JOBS_URL"
curl -s "$JOBS_URL" > jobs.json

echo "✅ Fetched jobs"
echo ""

# Parse jobs
TOTAL_JOBS=$(cat jobs.json | grep -o '"total_count": [0-9]*' | grep -o '[0-9]*')
echo "Total jobs: $TOTAL_JOBS"
echo ""

# Extract job information
echo "========================================"
echo "Job Summary:"
echo "========================================"

cat jobs.json | grep -A 5 '"name":' | while read line; do
    if [[ $line == *'"name":'* ]]; then
        JOB_NAME=$(echo "$line" | cut -d'"' -f4)
        echo "Job: $JOB_NAME"
    elif [[ $line == *'"conclusion":'* ]]; then
        CONCLUSION=$(echo "$line" | cut -d'"' -f4)
        if [ "$CONCLUSION" == "failure" ]; then
            echo "  Status: ❌ FAILED"
        elif [ "$CONCLUSION" == "success" ]; then
            echo "  Status: ✅ SUCCESS"
        else
            echo "  Status: ⚠️  $CONCLUSION"
        fi
        echo ""
    fi
done

# Try to get logs for failed jobs
echo "========================================"
echo "Attempting to fetch detailed logs..."
echo "========================================"

# Get logs URL
LOGS_URL="https://api.github.com/repos/$REPO/actions/runs/$LATEST_RUN_ID/logs"
echo "Logs URL: $LOGS_URL"
echo ""
echo "Note: GitHub API requires authentication to download full logs."
echo "Attempting anonymous download (may be limited)..."
echo ""

curl -sL "$LOGS_URL" -o logs.zip 2>&1 | head -20

if [ -f logs.zip ] && [ -s logs.zip ]; then
    echo "✅ Downloaded logs archive"
    echo ""
    echo "Extracting logs..."
    unzip -q logs.zip 2>/dev/null || echo "⚠️  Could not extract (may need authentication)"

    if [ -d "." ]; then
        echo ""
        echo "========================================"
        echo "Available Log Files:"
        echo "========================================"
        find . -name "*.txt" | head -20
        echo ""

        echo "========================================"
        echo "Showing FAILED test logs:"
        echo "========================================"

        for logfile in $(find . -name "*.txt" | grep -i "test\|build" | head -10); do
            echo ""
            echo "--- $logfile ---"
            tail -100 "$logfile" 2>/dev/null | grep -A 5 -B 5 "FAIL\|ERROR\|Exception" | head -50 || echo "No errors found in this log"
        done
    fi
else
    echo "❌ Could not download logs (likely needs GitHub authentication)"
    echo ""
    echo "To get full logs, you need to:"
    echo "1. Create a GitHub Personal Access Token"
    echo "2. Set it as environment variable: export GITHUB_TOKEN=your_token"
    echo "3. Run this script again"
    echo ""
    echo "OR view logs directly at:"
    echo "$LATEST_RUN_URL"
fi

cd ..

echo ""
echo "========================================"
echo "Summary saved to: ci-logs/"
echo "========================================"

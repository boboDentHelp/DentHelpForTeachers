#!/bin/bash

# Fetch GitHub Actions logs using API
REPO="bogdan2002VS/dentalhelp-2"
BRANCH="claude/test-coverage-git-actions-011CUvVYctH1qL8mZr7CjRb7"

echo "Fetching GitHub Actions runs for $REPO on branch $BRANCH..."

mkdir -p ci-logs

# Get latest workflow runs
echo "Fetching workflow runs..."
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=5" \
  > ci-logs/workflow-runs.json

echo "✅ Workflow runs saved to ci-logs/workflow-runs.json"

# Parse and display runs
echo ""
echo "=========================================="
echo "Recent Workflow Runs:"
echo "=========================================="
cat ci-logs/workflow-runs.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
runs = data.get('workflow_runs', [])
for run in runs[:5]:
    print(f\"ID: {run['id']}\")
    print(f\"  Status: {run['status']}\")
    print(f\"  Conclusion: {run.get('conclusion', 'N/A')}\")
    print(f\"  Name: {run['name']}\")
    print(f\"  Created: {run['created_at']}\")
    print(f\"  URL: {run['html_url']}\")
    print()
" 2>/dev/null || echo "Install python3 to parse JSON"

# Get the latest run ID
RUN_ID=$(cat ci-logs/workflow-runs.json | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$RUN_ID" ]; then
    echo "=========================================="
    echo "Fetching jobs for run ID: $RUN_ID"
    echo "=========================================="

    curl -s -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/jobs" \
      > ci-logs/jobs-$RUN_ID.json

    echo "✅ Jobs saved to ci-logs/jobs-$RUN_ID.json"

    # Display job summaries
    echo ""
    echo "Job Statuses:"
    cat ci-logs/jobs-$RUN_ID.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
for job in jobs:
    status = job['conclusion'] or job['status']
    symbol = '✅' if status == 'success' else '❌' if status == 'failure' else '⏳'
    print(f\"{symbol} {job['name']}: {status}\")
" 2>/dev/null || echo "Install python3 to parse JSON"

    # Try to download logs (this may require authentication)
    echo ""
    echo "Attempting to download logs..."
    curl -s -L -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/logs" \
      -o ci-logs/logs-$RUN_ID.zip 2>&1 | head -20

    if [ -f ci-logs/logs-$RUN_ID.zip ] && [ -s ci-logs/logs-$RUN_ID.zip ]; then
        echo "✅ Logs downloaded to ci-logs/logs-$RUN_ID.zip"

        # Extract logs
        cd ci-logs
        unzip -q logs-$RUN_ID.zip -d logs-$RUN_ID 2>/dev/null
        if [ -d logs-$RUN_ID ]; then
            echo "✅ Logs extracted to ci-logs/logs-$RUN_ID/"
            echo ""
            echo "Log files:"
            ls -lh logs-$RUN_ID/ | head -20
        fi
        cd ..
    else
        echo "⚠️  Could not download logs (may require authentication)"
        echo "Visit: https://github.com/$REPO/actions/runs/$RUN_ID"
    fi
fi

echo ""
echo "=========================================="
echo "Summary saved to ci-logs/"
echo "=========================================="

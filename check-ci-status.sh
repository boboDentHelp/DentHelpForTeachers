#!/bin/bash

echo "========================================="
echo "GitHub Actions CI Status Checker"
echo "========================================="
echo ""

REPO="bogdan2002VS/dentalhelp-2"
BRANCH="claude/test-coverage-git-actions-011CUvVYctH1qL8mZr7CjRb7"

echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo ""

echo "========================================="
echo "Method 1: Check via GitHub API (without auth)"
echo "========================================="
echo ""

# Try to get workflow runs
echo "Fetching workflow runs..."
response=$(curl -s "https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=5")

if echo "$response" | grep -q '"message"'; then
  echo "❌ API access failed (may require authentication or repo is private)"
  echo "Response: $(echo $response | python3 -c 'import sys, json; print(json.load(sys.stdin).get("message", "Unknown error"))' 2>/dev/null || echo 'Cannot parse response')"
else
  echo "✅ API access successful!"
  echo "$response" | python3 -m json.tool 2>/dev/null | head -50
fi

echo ""
echo "========================================="
echo "Method 2: Check git push status"
echo "========================================="
echo ""

# Check if push was successful
echo "Last 3 commits:"
git log --oneline -3

echo ""
echo "Remote branch status:"
git branch -r | grep "$BRANCH"

if [ $? -eq 0 ]; then
  echo "✅ Branch exists on remote"
else
  echo "❌ Branch not found on remote"
fi

echo ""
echo "========================================="
echo "Method 3: Check commit timestamps"
echo "========================================="
echo ""

echo "Latest commit on this branch:"
git log -1 --format="%H%n%an <%ae>%n%aD%n%s"

echo ""
echo "Time since last commit:"
commit_time=$(git log -1 --format="%at")
current_time=$(date +%s)
time_diff=$((current_time - commit_time))
minutes=$((time_diff / 60))

echo "$minutes minutes ago"

if [ "$minutes" -lt 30 ]; then
  echo "✅ Recent commit - CI should be running or completed soon"
else
  echo "⚠️  Commit is older than 30 minutes - CI should have completed"
fi

echo ""
echo "========================================="
echo "Recommended Actions:"
echo "========================================="
echo ""
echo "1. Visit GitHub Actions directly:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "2. Filter by this branch:"
echo "   https://github.com/$REPO/actions?query=branch%3A$BRANCH"
echo ""
echo "3. Check CI workflow specifically:"
echo "   https://github.com/$REPO/actions/workflows/ci.yml"
echo ""
echo "4. If you have gh CLI installed, run:"
echo "   gh run list --repo $REPO --branch $BRANCH --limit 5"
echo ""
echo "5. View latest run details:"
echo "   gh run view --repo $REPO"
echo ""

echo "========================================="
echo "Testing Local Builds"
echo "========================================="
echo ""
echo "To test locally (simulates CI), run:"
echo ""
echo "# Test a single service:"
echo "cd microservices/auth-service"
echo "mvn clean test"
echo ""
echo "# Test all services:"
echo "for service in microservices/*/; do"
echo "  echo \"Testing \$(basename \$service)...\""
echo "  cd \$service && mvn clean test && cd ../.."
echo "done"
echo ""

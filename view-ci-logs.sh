#!/bin/bash

echo "========================================"
echo "GitHub Actions CI Log Viewer Helper"
echo "========================================"
echo ""

REPO="bogdan2002VS/dentalhelp-2"
BRANCH=$(git branch --show-current)

echo "Repository: $REPO"
echo "Current Branch: $BRANCH"
echo ""

echo "To view CI logs, you need to:"
echo ""
echo "1. Go to: https://github.com/$REPO/actions"
echo "2. Click on the latest workflow run for branch: $BRANCH"
echo "3. Click on each failing job to see errors"
echo ""
echo "OR use GitHub CLI (if available):"
echo ""
echo "  gh run list --branch $BRANCH --limit 5"
echo "  gh run view <run-id> --log"
echo ""
echo "========================================"
echo "Checking for recent commits..."
echo "========================================"
echo ""
git log --oneline -5
echo ""
echo "========================================"
echo "Latest commit that should trigger CI:"
echo "========================================"
git log -1 --pretty=format:"Commit: %h%nAuthor: %an%nDate: %ad%nMessage: %s%n"
echo ""
echo ""
echo "Direct link to actions:"
echo "https://github.com/$REPO/actions/workflows/ci.yml"

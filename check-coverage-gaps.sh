#!/bin/bash

echo "========================================="
echo "Detailed Coverage Gap Analysis"
echo "========================================="
echo ""

for service_dir in microservices/*/; do
  service_name=$(basename "$service_dir")

  echo "=== $service_name ==="

  # Count main and test files
  main_count=$(find "$service_dir/src/main/java" -name "*.java" 2>/dev/null | grep -v "Application.java" | wc -l)
  test_count=$(find "$service_dir/src/test/java" -name "*.java" 2>/dev/null | wc -l)

  if [ "$main_count" -gt 0 ]; then
    coverage=$((test_count * 100 / main_count))
    echo "Main classes: $main_count"
    echo "Test classes: $test_count"
    echo "Coverage: $coverage%"

    # Show what's tested
    echo ""
    echo "Test files:"
    find "$service_dir/src/test/java" -name "*.java" 2>/dev/null | while read test_file; do
      basename "$test_file" | sed 's/^/  ✓ /'
    done

    # Show main classes
    echo ""
    echo "Main classes (untested highlighted with ⚠):"
    find "$service_dir/src/main/java" -name "*.java" 2>/dev/null | grep -v "Application.java" | while read main_file; do
      class_name=$(basename "$main_file")
      base_name="${class_name%.java}"

      # Check if there's a test for this class
      if find "$service_dir/src/test/java" -name "*${base_name}*Test.java" 2>/dev/null | grep -q .; then
        echo "  ✓ $class_name"
      else
        echo "  ⚠ $class_name (NO TEST)"
      fi
    done
  else
    echo "No main classes (service-only or config)"
    echo "Test classes: $test_count"
  fi

  echo ""
  echo "---"
  echo ""
done

echo "========================================="
echo "Summary of Missing Tests"
echo "========================================="
echo ""

for service_dir in microservices/*/; do
  service_name=$(basename "$service_dir")

  missing=0
  main_count=$(find "$service_dir/src/main/java" -name "*.java" 2>/dev/null | grep -v "Application.java" | wc -l)

  if [ "$main_count" -gt 0 ]; then
    find "$service_dir/src/main/java" -name "*.java" 2>/dev/null | grep -v "Application.java" | while read main_file; do
      class_name=$(basename "$main_file")
      base_name="${class_name%.java}"

      if ! find "$service_dir/src/test/java" -name "*${base_name}*Test.java" 2>/dev/null | grep -q .; then
        if [ "$missing" -eq 0 ]; then
          echo "$service_name - Missing tests for:"
        fi
        echo "  - $class_name"
        missing=$((missing + 1))
      fi
    done
  fi
done

#!/bin/bash

echo "========================================="
echo "Test Coverage Analysis"
echo "========================================="
echo ""

for service_dir in microservices/*/; do
  service_name=$(basename "$service_dir")

  echo "=== $service_name ==="

  # Count main classes (excluding Application.java and config files)
  main_count=$(find "$service_dir/src/main/java" -name "*.java" 2>/dev/null | grep -v "Application.java" | wc -l)

  # Count test classes
  test_count=$(find "$service_dir/src/test/java" -name "*.java" 2>/dev/null | wc -l)

  echo "Main classes: $main_count"
  echo "Test classes: $test_count"

  # Calculate coverage percentage
  if [ "$main_count" -gt 0 ]; then
    coverage=$((test_count * 100 / main_count))
    echo "Coverage ratio: $coverage%"
  fi

  echo "Test files:"
  find "$service_dir/src/test/java" -name "*.java" 2>/dev/null | while read test_file; do
    basename "$test_file" | sed 's/^/  - /'
  done

  echo ""
done

echo "========================================="
echo "Summary"
echo "========================================="
total_main=$(find microservices/*/src/main/java -name "*.java" 2>/dev/null | grep -v "Application.java" | wc -l)
total_tests=$(find microservices/*/src/test/java -name "*.java" 2>/dev/null | wc -l)

echo "Total main classes: $total_main"
echo "Total test classes: $total_tests"

if [ "$total_main" -gt 0 ]; then
  overall_coverage=$((total_tests * 100 / total_main))
  echo "Overall test coverage ratio: $overall_coverage%"
fi

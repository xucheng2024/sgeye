#!/bin/bash
# Check geocoding progress

cd "$(dirname "$0")/.."

echo "============================================================"
echo "Geocoding Progress Check"
echo "============================================================"

# Check if script is running
if pgrep -f "geocode-raw-resale.js" > /dev/null; then
  echo "✅ Geocoding script is running"
else
  echo "⚠️  Geocoding script is not running"
fi

# Check log file
if [ -f geocode.log ]; then
  echo ""
  echo "Recent log output:"
  tail -10 geocode.log
  echo ""
  echo "Total lines in log: $(wc -l < geocode.log)"
else
  echo "⚠️  No log file found"
fi

echo ""
echo "To check full progress, run:"
echo "  tail -f geocode.log"
echo ""
echo "To stop the script, run:"
echo "  pkill -f geocode-raw-resale.js"

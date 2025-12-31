#!/bin/bash
# Monitor geocoding script and notify when complete

cd "$(dirname "$0")/.."

echo "============================================================"
echo "Geocoding Monitor"
echo "============================================================"
echo "Monitoring geocoding progress..."
echo "Press Ctrl+C to stop monitoring"
echo ""

# Check if script is running
check_script() {
  if pgrep -f "geocode-raw-resale.js" > /dev/null; then
    return 0  # Running
  else
    return 1  # Not running
  fi
}

# Get remaining count from log
get_remaining() {
  if [ -f geocode.log ]; then
    tail -50 geocode.log | grep -oP "remaining \K[0-9,]+" | head -1
  fi
}

# Get processed count
get_processed() {
  if [ -f geocode.log ]; then
    tail -50 geocode.log | grep -oP "Processed \K[0-9,]+" | head -1
  fi
}

# Send notification (macOS)
notify() {
  local message="$1"
  osascript -e "display notification \"$message\" with title \"Geocoding Complete\" sound name \"Glass\"" 2>/dev/null || \
  echo "🔔 $message"
}

LAST_REMAINING=""
ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))
  
  if ! check_script; then
    # Script is not running
    if [ -f geocode.log ]; then
      # Check if it completed successfully
      if tail -20 geocode.log | grep -q "complete\|Complete\|finished\|Finished"; then
        REMAINING=$(get_remaining)
        PROCESSED=$(get_processed)
        echo ""
        echo "============================================================"
        echo "✅ Geocoding Script Completed!"
        echo "============================================================"
        echo "Processed: $PROCESSED records"
        echo "Remaining: $REMAINING records"
        echo ""
        notify "Geocoding script has completed! Processed: $PROCESSED records"
        break
      else
        # Script stopped but might have crashed
        echo ""
        echo "⚠️  Script is not running. Check geocode.log for details."
        tail -10 geocode.log
        break
      fi
    else
      echo "⚠️  Script is not running and no log file found."
      break
    fi
  else
    # Script is running
    REMAINING=$(get_remaining)
    PROCESSED=$(get_processed)
    
    if [ "$REMAINING" != "$LAST_REMAINING" ] && [ -n "$REMAINING" ]; then
      echo "[$(date +%H:%M:%S)] Script running... Remaining: $REMAINING | Processed: $PROCESSED"
      LAST_REMAINING="$REMAINING"
    fi
    
    # Show progress every 30 iterations (about every 30 seconds)
    if [ $((ITERATION % 30)) -eq 0 ]; then
      if [ -n "$REMAINING" ]; then
        echo "[$(date +%H:%M:%S)] Progress: Remaining: $REMAINING | Processed: $PROCESSED"
      else
        echo "[$(date +%H:%M:%S)] Script is running... (checking log)"
      fi
    fi
  fi
  
  sleep 1
done

echo ""
echo "Monitor stopped."


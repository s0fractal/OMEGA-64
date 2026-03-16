#!/bin/bash
# OMEGA-64 Git Delta Logger
# Captures the last commit's summary and diff into a timestamped file.

LOG_DIR="./logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/delta_$TIMESTAMP.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Generate report
echo "=== OMEGA-64 COMMIT DELTA [$TIMESTAMP] ===" > "$LOG_FILE"
echo "Commit: $(git rev-parse HEAD)" >> "$LOG_FILE"
echo "Author: $(git log -1 --format='%an <%ae>')" >> "$LOG_FILE"
echo "Date:   $(git log -1 --format='%ad')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "--- Summary ---" >> "$LOG_FILE"
git log -1 --stat >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "--- Full Diff ---" >> "$LOG_FILE"
git show --pretty=format: --unified=3 HEAD >> "$LOG_FILE"

# Maintain a 'latest' symlink for convenience
ln -sf "delta_$TIMESTAMP.log" "$LOG_DIR/latest_delta.log"

echo "Git delta captured: $LOG_FILE"
echo "Latest symlink updated: $LOG_DIR/latest_delta.log"

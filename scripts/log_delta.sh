#!/bin/bash
# OMEGA-64 Git Delta Logger
# Captures the last commit's summary and diff into a gitignored directory.

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/git_delta.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Generate report
echo "=== OMEGA-64 COMMIT DELTA [$(date)] ===" > "$LOG_FILE"
echo "Commit: $(git rev-parse HEAD)" >> "$LOG_FILE"
echo "Author: $(git log -1 --format='%an <%ae>')" >> "$LOG_FILE"
echo "Date:   $(git log -1 --format='%ad')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "--- Summary ---" >> "$LOG_FILE"
git log -1 --stat >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "--- Full Diff ---" >> "$LOG_FILE"
git show --pretty=format: --unified=3 HEAD >> "$LOG_FILE"

echo "Git delta captured: $LOG_FILE"

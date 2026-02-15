#!/usr/bin/env bash
set -euo pipefail

# ui_health.sh
# Run O stream signal watcher + UI server.

INTERVAL=${INTERVAL:-3000}
STREAM=${STREAM:-OMEGA_O_STREAM.jsonl}
PORT=${PORT:-8000}

log() { printf "[%s] %s\n" "$(date +%H:%M:%S)" "$*"; }

log "Starting O_STREAM signal watcher (interval=${INTERVAL}ms, stream=${STREAM})"
deno task o:health-signal:watch -- --interval "${INTERVAL}" --input "${STREAM}" &
WATCH_PID=$!

log "Starting UI server on port ${PORT}"
PORT=${PORT} deno run -A serve_ui.ts &
SERVER_PID=$!

cleanup() {
  log "Stopping UI server and watcher"
  kill "${SERVER_PID}" "${WATCH_PID}" 2>/dev/null || true
}

trap cleanup EXIT

wait "${SERVER_PID}" "${WATCH_PID}"

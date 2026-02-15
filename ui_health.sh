#!/usr/bin/env bash
set -euo pipefail

# ui_health.sh
# Run O stream signal watcher + UI server.

MODE=${MODE:-o}
INTERVAL=${INTERVAL:-3000}
STREAM=${STREAM:-OMEGA_O_STREAM.jsonl}
INPUT=${INPUT:-input.json}
DRAIN=${DRAIN:-0}
PORT=${PORT:-8000}

log() { printf "[%s] %s\n" "$(date +%H:%M:%S)" "$*"; }

if [[ "${MODE}" == "io" ]]; then
  log "Starting IO_FLOW signal watcher (interval=${INTERVAL}ms, input=${INPUT}, drain=${DRAIN})"
  if [[ "${DRAIN}" == "1" ]]; then
    deno task io:health-signal:watch -- --interval "${INTERVAL}" --input "${INPUT}" --drain &
  else
    deno task io:health-signal:watch -- --interval "${INTERVAL}" --input "${INPUT}" &
  fi
  WATCH_PID=$!
else
  log "Starting O_STREAM signal watcher (interval=${INTERVAL}ms, stream=${STREAM})"
  deno task o:health-signal:watch -- --interval "${INTERVAL}" --input "${STREAM}" &
  WATCH_PID=$!
fi

log "Starting UI server on port ${PORT}"
PORT=${PORT} deno run -A serve_ui.ts &
SERVER_PID=$!

cleanup() {
  log "Stopping UI server and watcher"
  kill "${SERVER_PID}" "${WATCH_PID}" 2>/dev/null || true
}

trap cleanup EXIT

wait "${SERVER_PID}" "${WATCH_PID}"

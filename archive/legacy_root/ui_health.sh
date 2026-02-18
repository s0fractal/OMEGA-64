#!/usr/bin/env bash
set -euo pipefail

# ui_health.sh
# Run health signal watcher + UI server.

MODE=${MODE:-o}
INTERVAL=${INTERVAL:-3000}
STREAM=${STREAM:-OMEGA_O_STREAM.jsonl}
INPUT=${INPUT:-input.json}
DRAIN=${DRAIN:-0}
HEALTH_JSON=${HEALTH_JSON:-0}
HEALTH_OUTPUT=${HEALTH_OUTPUT:-UI/health.json}
HEALTH_IO_OUTPUT=${HEALTH_IO_OUTPUT:-UI/health_io.json}
SAFE_WINDOW=${SAFE_WINDOW:-1}
PORT=${PORT:-8000}
MOUNT_SCAN=${MOUNT_SCAN:-1}
MOUNT_INPUT=${MOUNT_INPUT:-i.L99.core.MOUNT_LIST.md}
MOUNT_OUTPUT=${MOUNT_OUTPUT:-UI/OMEGA_MOUNTS.json}

log() { printf "[%s] %s\n" "$(date +%H:%M:%S)" "$*"; }
sleep_interval() {
  local seconds=$((INTERVAL / 1000))
  if [[ "${seconds}" -lt 1 ]]; then
    seconds=1
  fi
  sleep "${seconds}"
}

start_o() {
  log "Starting O_STREAM signal watcher (interval=${INTERVAL}ms, stream=${STREAM})"
  deno task o:health-signal:watch -- --interval "${INTERVAL}" --input "${STREAM}" &
  WATCH_PID=$!
}

start_io() {
  log "Starting IO_FLOW signal watcher (interval=${INTERVAL}ms, input=${INPUT}, drain=${DRAIN})"
  if [[ "${DRAIN}" == "1" ]]; then
    deno task io:health-signal:watch -- --interval "${INTERVAL}" --input "${INPUT}" --drain &
  else
    deno task io:health-signal:watch -- --interval "${INTERVAL}" --input "${INPUT}" &
  fi
  WATCH_PID=$!
}

if [[ "${MODE}" == "io" ]]; then
  start_io
else
  start_o
fi

if [[ "${HEALTH_JSON}" == "1" ]]; then
  if [[ "${MODE}" == "io" ]]; then
    log "Starting IO_FLOW health writer (interval=${INTERVAL}ms, input=${INPUT})"
    (
      while true; do
        if [[ "${DRAIN}" == "1" ]]; then
          if [[ "${SAFE_WINDOW}" == "1" ]]; then
            deno task io:health:write -- --input "${INPUT}" --drain --output "${HEALTH_IO_OUTPUT}" --pretty --safe-window || true
          else
            deno task io:health:write -- --input "${INPUT}" --drain --output "${HEALTH_IO_OUTPUT}" --pretty || true
          fi
        else
          if [[ "${SAFE_WINDOW}" == "1" ]]; then
            deno task io:health:write -- --input "${INPUT}" --output "${HEALTH_IO_OUTPUT}" --pretty --safe-window || true
          else
            deno task io:health:write -- --input "${INPUT}" --output "${HEALTH_IO_OUTPUT}" --pretty || true
          fi
        fi
        if [[ "${MOUNT_SCAN}" == "1" ]]; then
          deno task mount:scan -- --input "${MOUNT_INPUT}" --output "${MOUNT_OUTPUT}" || true
        fi
        sleep_interval
      done
    ) &
  else
    log "Starting O_STREAM health writer (interval=${INTERVAL}ms, stream=${STREAM})"
    (
      while true; do
        if [[ "${SAFE_WINDOW}" == "1" ]]; then
          deno task o:health:write -- --input "${STREAM}" --output "${HEALTH_OUTPUT}" --pretty --safe-window || true
        else
          deno task o:health:write -- --input "${STREAM}" --output "${HEALTH_OUTPUT}" --pretty || true
        fi
        if [[ "${MOUNT_SCAN}" == "1" ]]; then
          deno task mount:scan -- --input "${MOUNT_INPUT}" --output "${MOUNT_OUTPUT}" || true
        fi
        sleep_interval
      done
    ) &
  fi
  HEALTH_PID=$!
fi

log "Starting UI server on port ${PORT}"
PORT=${PORT} deno run -A serve_ui.ts &
SERVER_PID=$!

cleanup() {
  log "Stopping UI server and watcher"
  if [[ -n "${HEALTH_PID:-}" ]]; then
    kill "${HEALTH_PID}" 2>/dev/null || true
  fi
  kill "${SERVER_PID}" "${WATCH_PID}" 2>/dev/null || true
}

trap cleanup EXIT

wait "${SERVER_PID}" "${WATCH_PID}"

# i.L99.core.UI_HEALTH_RUN.md

# OMEGA-64 | UI_HEALTH_RUN (Process)

Purpose:

- Launch UI server + O stream health signal watcher.

Notes:

- Noncanonical operator tool.
- Usage: ./ui_health.sh
- ENV: MODE=o|io, STREAM=OMEGA_O_STREAM.jsonl, INPUT=input.json, DRAIN=0|1,
  INTERVAL=3000, PORT=8000
- ENV: HEALTH_JSON=0|1, HEALTH_OUTPUT=UI/health.json,
  HEALTH_IO_OUTPUT=UI/health_io.json
- ENV: SAFE_WINDOW=0|1 (include MUTATE safe window diagnostics in health.json)
- ENV: MOUNT_SCAN=0|1, MOUNT_INPUT=i.L99.core.MOUNT_LIST.md,
  MOUNT_OUTPUT=UI/OMEGA_MOUNTS.json

# i.L99.core.UI_HEALTH_RUN.md
# OMEGA-64 | UI_HEALTH_RUN (Process)

Purpose:
- Launch UI server + O stream health signal watcher.

Notes:
- Noncanonical operator tool.
- Usage: ./ui_health.sh
- ENV: MODE=o|io, STREAM=OMEGA_O_STREAM.jsonl, INPUT=input.json, DRAIN=0|1, INTERVAL=3000, PORT=8000
- ENV: HEALTH_JSON=0|1, HEALTH_OUTPUT=UI/health.json, HEALTH_IO_OUTPUT=UI/health_io.json

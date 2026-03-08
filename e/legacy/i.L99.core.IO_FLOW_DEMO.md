# i.L99.core.IO_FLOW_DEMO.md

# OMEGA-64 | IO_FLOW Demo (SAFE_WINDOW + UI)

Purpose:

- Minimal operator flow to visualize SAFE_WINDOW and IO collapse.

Steps:

1. Prepare an input JSON (state + config + stream path).
2. Append proposals to O_STREAM.
3. Run IO_FLOW health writer with SAFE_WINDOW enabled.
4. Launch UI to observe SAFE_WINDOW.

Suggested commands:

- Append a proposal: deno task o:append -- --input OMEGA_O_STREAM.jsonl
  --proposal <proposal.json>
- Run IO_FLOW health write: deno task io:health:write -- --input <input.json>
  --output UI/health_io.json --pretty --safe-window
- Start UI (reads health.json or health_io.json): SAFE_WINDOW=1 HEALTH_JSON=1
  MODE=io INPUT=<input.json> ./ui_health.sh

Notes:

- This is a demo ritual; no canon mutation is required.
- SAFE_WINDOW is sourced from MUTATE.checkSovereignty.

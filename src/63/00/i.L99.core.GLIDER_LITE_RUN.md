# i.L99.core.GLIDER_LITE_RUN.md

# OMEGA-64 | GLIDER_LITE_RUN (Process)

Purpose:

- Minimal CLI process for GLIDER_LITE.
- Reads input JSON, runs one tick, emits output JSON.

Notes:

- This is an operator tool (noncanonical).
- Canon changes still flow through GATE + LEDGER.
- Usage: deno run -A i.L99.core.GLIDER_LITE_RUN.ts --input <input.json> --output
  <output.json>
- Optional: persist the minimal next state with --state-output <state.json>

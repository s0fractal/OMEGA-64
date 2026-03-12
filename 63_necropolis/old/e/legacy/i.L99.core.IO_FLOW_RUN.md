# i.L99.core.IO_FLOW_RUN.md

# OMEGA-64 | IO_FLOW_RUN (Process)

Purpose:

- Minimal CLI process for IO_FLOW.
- Reads input JSON, runs one collapse tick, emits output JSON.

Notes:

- Noncanonical operator tool.
- Canon changes still flow through GATE + LEDGER.
- Usage: deno run -A i.L99.core.IO_FLOW_RUN.ts --input <input.json> --output
  <output.json>
- Optional: provide stream_path to read O_STREAM from disk.
- Optional: enable drain after collapse with --drain.
- Optional: persist the minimal next state with --state-output <state.json>

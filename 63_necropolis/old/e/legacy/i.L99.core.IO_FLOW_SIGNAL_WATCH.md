# i.L99.core.IO_FLOW_SIGNAL_WATCH.md

# OMEGA-64 | IO_FLOW_SIGNAL_WATCH (Loop)

Purpose:

- Periodically refresh IO flow health signal from input.json.

Notes:

- Noncanonical loop for local UI.
- Usage: deno run -A i.L99.core.IO_FLOW_SIGNAL_WATCH.ts --input <input.json>
  --interval 3000 [--drain]

# i.L99.core.GLIDER_LITE_BREATHE.md

# OMEGA-64 | Glider Lite | Breathe Loop

Purpose:

- Provide a minimal heartbeat that validates the gate and writes ledger events.
- Emit SIGNAL pulses without mutating canon (dry-run by default).

Defaults:

- State file: GLIDER_BREATHE_STATE.json
- Interval: 5000ms
- Proposal: L32 +1 pulse (LOCAL)
- dry_run: true (unless --mutate)

Usage:

- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --once
- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --interval 5000
- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --state <state.json>
- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --config <gate.json>
- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --proposals <proposals.json>
- deno run -A i.L99.core.GLIDER_LITE_BREATHE.ts --mutate (enables dry_run=false)

Notes:

- The state file advances tick even in dry_run, but preserves state_i16 + hash.
- SIGNAL emits a pulse on every tick.

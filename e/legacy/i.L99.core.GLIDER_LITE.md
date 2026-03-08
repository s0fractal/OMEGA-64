# i.L99.core.GLIDER_LITE.md

# OMEGA-64 | GLIDER_LITE (Physical Entry)

Purpose:

- Minimal physical executor that routes proposals through the gate.

Contract:

- Input: GateRunnerTickInput (state, proposals, config, context).
- Output: GateRunnerTickOutput (nextState + bridge info).

Notes:

- This is the minimal anchor; loops/daemons can wrap it.
- Ledger emission happens inside GATE.
- Determinism is delegated to GATE + REPLAY_AUDIT.

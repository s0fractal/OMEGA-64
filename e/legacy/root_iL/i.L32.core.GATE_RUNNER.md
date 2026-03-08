# i.L32.core.GATE_RUNNER

Status: Draft\
Layer: L32\
Purpose: Minimal runtime entrypoint that routes all mutations through
`GATE_PIPELINE`.

## API

Source: `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER.ts`

Method:

1. `GATE_RUNNER.step(input)`

CLI wrapper:

1. `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER_CLI.ts`
2. `deno run -A i.L32.core.GATE_RUNNER_CLI.ts --input <input.json> [--output <output.json>] [--ledger <ledger.jsonl>] [--pretty]`
3. `deno run -A i.L32.core.GATE_RUNNER_CLI.ts --packet --input <input.json> [--output <output.json>] [--pretty]`
4. `deno run -A i.L32.core.GATE_RUNNER_CLI.ts --verify-packet --input <packet.json> [--output <output.json>] [--pretty]`

Examples:

1. Invariant-context input:
   `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER_CLI.example.invariant.json`
2. Replay-context input:
   `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER_CLI.example.replay.json`
3. Invariant packet input (emit):
   `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER_CLI.example.packet.json`
4. Invariant packet output (sealed):
   `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER_CLI.example.packet.sealed.json`

Modes:

1. `REPLAY_CONTEXT` (auto context from replay audit)
2. `INVARIANT_CONTEXT` (explicit invariant snapshot)
3. `INVARIANT_CONTEXT` can accept `invariantPacket` (hash-verified minimal
   envelope)

Replay audit options (CLI):

1. `verifyTopologicalSignatures` (default: true in report generators)
2. `verifyLedgerChain` (ledger hash chain)
3. `invariantOnly` (index-chain only, skips full tick replay)

## Contract

1. Runner never applies deltas directly.
2. Runner always delegates to `GATE_PIPELINE`.
3. Bridge mode result (`GREEN|AMBER|RED`) is returned with `nextState`.
4. CLI output includes `invariant_packet` when available (from replay audit,
   input packet, or derived from invariant report).

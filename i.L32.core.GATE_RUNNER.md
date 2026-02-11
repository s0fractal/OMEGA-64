# i.L32.core.GATE_RUNNER

Status: Draft  
Layer: L32  
Purpose: Minimal runtime entrypoint that routes all mutations through `GATE_PIPELINE`.

## API

Source:
`/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER.ts`

Method:
1. `GATE_RUNNER.step(input)`

Modes:
1. `REPLAY_CONTEXT` (auto context from replay audit)
2. `INVARIANT_CONTEXT` (explicit invariant snapshot)

## Contract

1. Runner never applies deltas directly.
2. Runner always delegates to `GATE_PIPELINE`.
3. Bridge mode result (`GREEN|AMBER|RED`) is returned with `nextState`.

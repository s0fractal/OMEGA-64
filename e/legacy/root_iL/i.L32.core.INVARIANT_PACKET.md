# i.L32.core.INVARIANT_PACKET

Status: Final Layer: L32 Purpose: Minimal invariant envelope for bridge mode in
lightweight nodes.

## 1. Intent

Exchange only the invariant nucleus (index-chain health) without replaying the
full tick chain.

## 2. Format

Source: `/Users/s0fractal/OMEGA/i.L32.core.INVARIANT_PACKET.ts`

Fields:

- `version`
- `tick_anchor`
- `canon_index_chain_checked`
- `canon_index_chain_ok`
- `gate_admission_index_chain_checked`
- `gate_admission_index_chain_ok`
- `ledger_chain_checked` (optional)
- `ledger_chain_ok` (optional)
- `witness` (optional)
- `packet_hash`

## 3. Hashing

`packet_hash` is SHA-256 over the canonical payload (all fields except
`packet_hash`).

## 4. Bridge Semantics

Packets map to `ReplayInvariantReport` and are consumed by
`CANON_CAUSAL_BRIDGE.resolveMode` via `GATE_RUNNER_CLI`.

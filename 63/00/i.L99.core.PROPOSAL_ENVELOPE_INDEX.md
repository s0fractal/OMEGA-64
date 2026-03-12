# i.L99.core.PROPOSAL_ENVELOPE_INDEX

Status: Draft Layer: L99 Intent: Append-only replay index for proposal envelope
hashes.

## 1. Purpose

This index gives fast recent duplicate detection for:

1. `GateConfig.anti_replay_window_ticks`,
2. `REPLAY_ENVELOPE_DUPLICATE` admission rejection,
3. `proposal_envelope_hash` lineage anchoring.

It decouples anti-replay lookup from full ledger scans.

## 2. Runtime

Source:

1. `/Users/s0fractal/OMEGA/i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts`

Default storage:

1. `./OMEGA_PROPOSAL_ENVELOPE_INDEX.jsonl`
2. runtime gate path is derived per ledger:
   `<LEDGER.STORAGE_PATH>.proposal_envelope_index.jsonl`

Chain version:

1. `proposal-envelope-index/v1`

## 3. Record Shape

Each line contains:

1. `chain_version`,
2. `prev_record_hash`,
3. `record_hash`,
4. `envelope_hash`,
5. `proposal_id`,
6. `tick`,
7. `event_id`,
8. `state_before_hash`,
9. `state_after_hash`,
10. `ts_unix_ms`,
11. `witness` (optional).

`record_hash` is SHA-256 over canonical record fields excluding `record_hash`.

## 4. Integrity Rules

1. `prev_record_hash` must link to previous `record_hash`.
2. `tick` must be monotonic non-decreasing.
3. `ts_unix_ms` must be monotonic non-decreasing.
4. `envelope_hash` must be 64-char lowercase hex.

## 5. Gate Coupling

On each non-dry mutation tick:

1. gate appends accepted envelope hashes from
   `LedgerEvent.accepted_proposal_envelopes`,
2. gate queries recent hashes by tick window from index cache,
3. duplicate envelopes are rejected before merge.

# i.L99.core.LEDGER_EVENT_SCHEMA

Status: Draft Layer: L99 Purpose: Append-only transition format for glider-lite
runtime.

## 1. Event Record

```json
{
  "event_id": "evt_000001",
  "tick": 128,
  "ts_unix_ms": 1739200000000,
  "state_before_hash": "hex32",
  "state_after_hash": "hex32",
  "accepted_delta": [
    { "level": 5, "value": -120 },
    { "level": 13, "value": 340 }
  ],
  "proposal_digest": "hex32",
  "accepted_proposals": ["p1", "p2"],
  "rejected_proposals": [
    { "proposal_id": "p9", "reason": "COST_OVER_BUDGET" }
  ],
  "cost_total": 8421,
  "budget_used": 460,
  "signature_artifact_hash": "hex32",
  "signature_tick": 129,
  "signature_causal_refs": ["hex32", "hex32"],
  "projection_2d_hash": "hex32",
  "thread_1d_hash": "hex32",
  "projection_version": "topo-signature/v1",
  "policy_version": "crystallization/v1",
  "policy_hash": "hex32",
  "chain_version": "ledger-hash/v1",
  "prev_event_hash": "hex32_or_null",
  "event_hash": "hex32",
  "gate_config_version": "v1",
  "witness": "optional_hex32"
}
```

## 1.1 Policy Transition Event

```json
{
  "event_type": "POLICY_TRANSITION_EVENT",
  "tick": 129,
  "from_policy_version": "crystallization/v1",
  "from_policy_hash": "hex32",
  "to_policy_version": "crystallization/v2",
  "to_policy_hash": "hex32",
  "reason": "threshold retune",
  "witness": "optional_hex32"
}
```

## 1.2 Canonization Event (Extended)

```json
{
  "event_type": "CANONIZATION_EVENT",
  "artifact_hash": "hex32",
  "state_hash": "hex32",
  "proposal_digest": "hex32",
  "checkpoint_tick": 128,
  "window": 512,
  "hard_gates": "PASS",
  "soft_gates_passed": 6,
  "policy_version": "crystallization/v1",
  "policy_hash": "hex32",
  "crystallization_report_version": "crystallization-report/v1",
  "crystallization_report_hash": "hex32",
  "crystallization_report_uri": "./OMEGA_CANON_REPORTS/hex32.json",
  "gate_admission_report_version": "gate-admission-report/v1",
  "gate_admission_report_hash": "hex32",
  "gate_admission_report_uri": "./OMEGA_GATE_ADMISSION_REPORTS/hex32.json",
  "witness": "optional_hex32"
}
```

## 1.3 Bridge Mode Event

```json
{
  "event_type": "BRIDGE_MODE_EVENT",
  "tick": 128,
  "state_hash": "hex32",
  "mode": "GREEN",
  "index_chain_checked": true,
  "index_chain_ok": true,
  "index_chain_checked_records": 4,
  "index_chain_failures": [],
  "gate_admission_index_chain_checked": true,
  "gate_admission_index_chain_ok": true,
  "gate_admission_index_chain_checked_records": 2,
  "gate_admission_index_chain_failures": [],
  "invariant_packet_hash": "hex32",
  "canon_bound_proposals": ["p1"],
  "blocked_canon_proposals": [],
  "reason": "INDEX_CHAIN_GREEN",
  "witness": "optional_hex32"
}
```

## 2. Canonical Serialization

1. UTF-8 JSON.
2. Keys sorted lexicographically before hashing.
3. No float NaN/Infinity values.
4. Integers must be decimal-form JSON numbers.

## 3. Derived Metrics

Per event:

- `abs_delta_sum = sum(abs(value))`
- `net_bias = sum(value)`
- `energy_density = cost_total / max(1, abs_delta_sum)`

Across window:

- drift slope by level,
- rejection ratio per agent,
- budget pressure index.
- projection drift via `projection_2d_hash` / `thread_1d_hash`.

## 4. Storage Rules

1. Append-only file or append-only table.
2. No in-place mutation of prior events.
3. Optional periodic checkpoints: `checkpoint_tick`, `checkpoint_state_hash`.
4. Each appended line carries chain anchors: `chain_version`, `prev_event_hash`,
   `event_hash`.

## 5. Replay Rule

Starting from genesis snapshot:

- apply `accepted_delta` in `tick` order,
- recompute hash each step,
- verify equals `state_after_hash`.

Mismatch means ledger corruption or non-deterministic gate.

Optional strict mode:

- replay can fail-fast on ledger hash-chain corruption
  (`verifyLedgerChain=true`).

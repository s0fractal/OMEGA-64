# i.L99.core.LEDGER_EVENT_SCHEMA

Status: Draft
Layer: L99
Purpose: Append-only transition format for glider-lite runtime.

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
  "gate_config_version": "v1",
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

## 4. Storage Rules

1. Append-only file or append-only table.
2. No in-place mutation of prior events.
3. Optional periodic checkpoints:
`checkpoint_tick`, `checkpoint_state_hash`.

## 5. Replay Rule

Starting from genesis snapshot:
- apply `accepted_delta` in `tick` order,
- recompute hash each step,
- verify equals `state_after_hash`.

Mismatch means ledger corruption or non-deterministic gate.


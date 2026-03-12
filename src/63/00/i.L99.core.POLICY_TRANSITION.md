# i.L99.core.POLICY_TRANSITION

Status: Draft\
Layer: L99\
Intent: Explicit migration protocol for policy version/hash changes.

## 1. Rule

Policy anchor drift is forbidden unless an explicit transition event exists.

Required event: `POLICY_TRANSITION_EVENT`

Required fields:

1. `tick`
2. `from_policy_version` / `from_policy_hash` (optional at genesis edge)
3. `to_policy_version` / `to_policy_hash`
4. `reason`

## 2. Runtime

Source: `i.L99.core.POLICY_TRANSITION.ts`

Entry: `POLICY_TRANSITION.emit(...)`

Behavior:

1. Reads latest known policy anchor before `tick`.
2. Fills `from_policy_*` fields.
3. Appends transition event to ledger.

## 3. Replay Constraint

Replay must fail if:

1. `policy_version`/`policy_hash` changes between consecutive mutation events,
2. and no matching transition exists at that tick.

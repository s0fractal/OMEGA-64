# i.L99.core.RED_LINES_POLICY

Status: Post-Implementation Policy Layer Intent: Apply after current
implementation cycle is complete. Scope: Runtime safety invariants for OMEGA
glider-lite execution.

## 1. Absolute Red Lines

1. No bypass: No state mutation may occur outside `L32 gate`.

2. Append-only memory: Ledger is append-only. No historical event rewrite.

3. Deterministic replay: Identical genesis + identical ledger must reproduce
   identical final `state_hash`.

4. Causal consistency: Proposal with `base_state_hash != current_state_hash` is
   not applied.

5. Hard budget cap: Over-budget proposals are rejected or deterministically
   scaled by gate rules.

6. No overflow semantics: Only saturating arithmetic for `i16` state mutation.
   No wrap-around.

7. Canon isolation: Agents cannot directly mutate canon invariants.

8. Dry-run purity: `dry_run=true` must have zero side effects.

9. No silent failure: Every reject, clip, and scale action is logged with
   explicit reason.

## 2. Violation Protocol

If any red line is violated:

1. Halt current tick.
2. Quarantine current proposal batch.
3. Append `VIOLATION_EVENT` to ledger with details.
4. Recover from last valid checkpoint.
5. Require manual resume signal.

## 3. Minimal VIOLATION_EVENT Schema

```json
{
  "event_type": "VIOLATION_EVENT",
  "tick": 0,
  "rule_id": "NO_BYPASS",
  "severity": "CRITICAL",
  "state_hash": "hex32",
  "details": "text",
  "action_taken": "HALT_AND_QUARANTINE"
}
```

## 4. Adoption Rule

This policy is activated only after current implementation milestone is
completed, to avoid context disruption during active development.

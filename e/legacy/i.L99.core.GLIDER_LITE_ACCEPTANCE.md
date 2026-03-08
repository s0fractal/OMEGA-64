# i.L99.core.GLIDER_LITE_ACCEPTANCE

Status: Draft Layer: L99 Purpose: Acceptance matrix for implementation handoff.

## 1. Test Matrix

T1 Deterministic Replay

- Given same genesis + same ordered ledger.
- Expect identical final `state_hash`.

T2 Saturation Safety

- Inject proposals with values beyond int16 range.
- Expect clamped merge and no overflow.

T3 Budget Enforcement

- Submit proposals that exceed global delta budget.
- Expect scaled or rejected deltas according to gate config.

T4 Agent Isolation

- Attempt direct state write from agent path.
- Expect rejection (only gate mutates state).

T5 Tick Integrity

- Submit proposals for wrong tick.
- Expect `TICK_MISMATCH` rejection.

T6 Empty/Noise Robustness

- Submit empty and random sparse deltas.
- Expect stable behavior without uncontrolled divergence.

T7 Cost Accounting

- For each accepted event, verify: `cost_total > 0` when `accepted_delta`
  non-empty.

T8 Observability

- Every tick emits ledger event with before/after hash and decision payload.

## 2. Exit Criteria

Implementation is acceptable when:

1. T1..T8 all pass.
2. 10k-tick noise simulation does not diverge beyond configured envelope.
3. Replay audit can be run by independent node and matches.

## 3. Recommended Rollout

1. Dry-run mode in production topology.
2. Limited mutation with low budgets.
3. Progressive budget increase by stability score.
4. Enable multi-agent merge only after replay audits are green.

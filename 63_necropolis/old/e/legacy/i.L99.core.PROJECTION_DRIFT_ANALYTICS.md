# i.L99.core.PROJECTION_DRIFT_ANALYTICS

Status: Draft\
Layer: L99\
Intent: Quantify projection drift by radial level over replay time.

## 1. Scope

This module computes deterministic drift from replayed states:

1. per-tick projection drift timeline,
2. per-level mean/p95 drift,
3. hot-level ranking.

## 2. Entry

Source: `i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts`

API: `PROJECTION_DRIFT_ANALYTICS.analyze(genesis, options)`

## 3. Preconditions

Default behavior requires replay audit green:

1. state hash replay must match,
2. projection signature checks must pass (unless explicitly disabled).

If replay is not green, report returns:

1. `ok = false`,
2. failure `REPLAY_AUDIT_NOT_GREEN`,
3. no timeline.

## 4. Output Model

`timeline[tick]` includes:

1. `l1_total`,
2. `l1_mean`,
3. `dominant_level`,
4. `dominant_value`,
5. `level_abs_drift[64]`.

Aggregates:

1. `driftByLevelMean[64]`,
2. `driftByLevelP95[64]`,
3. `driftSlopeByLevelMean[64]`,
4. `driftSlopeByLevelP95[64]`,
5. `topHotLevels`.

## 5. Canon Use

Recommended use in pre-canon diagnostics:

1. reject spikes beyond policy thresholds,
2. identify unstable radial levels,
3. track whether drift converges before crystallization.

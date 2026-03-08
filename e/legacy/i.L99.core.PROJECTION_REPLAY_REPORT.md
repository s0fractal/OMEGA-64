# i.L99.core.PROJECTION_REPLAY_REPORT

Status: Draft\
Layer: L99\
Intent: Provide per-tick projection verification report for crystallization
diagnostics.

## 1. Purpose

Replay hash-green (`state_after_hash`) is necessary but not sufficient for
projection integrity.

This report adds per-tick projection visibility:

1. `PASS`: projection hashes match deterministic reconstruction.
2. `FAIL`: projection hashes mismatch or signature fields are inconsistent.
3. `SKIP`: no projection fields on the event (or verification disabled).

## 2. Runtime API

Source: `i.L99.core.PROJECTION_REPLAY_REPORT.ts`

Entry: `PROJECTION_REPLAY_REPORT.generate(genesis, options)`

Options:

1. `startTick?: number`
2. `endTick?: number`
3. `verifyTopologicalSignatures?: boolean` (default: `true`)

## 3. Output

```json
{
  "ok": true,
  "startTick": 0,
  "endTick": 0,
  "totalTicks": 0,
  "passCount": 0,
  "failCount": 0,
  "skipCount": 0,
  "ticks": [
    { "tick": 0, "status": "PASS", "reason": "PROJECTION_MATCH" }
  ],
  "failures": []
}
```

## 4. Canon Use

Recommended crystallization precondition:

1. `replayGreen == true`
2. `projectionReport.failCount == 0`

If `failCount > 0`, artifact remains in drift and cannot be canonized.

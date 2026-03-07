# Longrun Canary Audit

- generatedAt: 2026-03-07T17:48:07.846Z
- durationSec: 300
- elapsedMs: 301485
- bootReady: true
- bootMs: 1665
- sampleCount: 58
- successCount: 58
- failureCount: 0
- successRate: 1
- tickStart: 9
- tickEnd: 10818
- tickAdvance: 10809
- p95TelemetryLatencyMs: 494.381
- p05AvgEnergy: 284.988
- p95SpatialOverflowRatio: 0
- safeModeRatio: 1
- federationRejectRatio: 0
- guardianSignalPromotionCurrentMode: shadow-reduce
- guardianSignalPromotionReadyLatest: false
- guardianSignalPromotionReadyRatio: 0
- guardianSignalPromotionRecommendedMode: shadow-reduce
- guardianSignalFallbackRatioP95: 0
- guardianSignalPromotionVerdict: hold
- guardianSignalPromotionBlockers: promotion_latest_not_ready(warming)|promotion_ready_ratio_0.000_lt_0.500|promotion_mode_shadow-reduce_not_hybrid_reduce
- guardianSignalPromotionAction: hold
- guardianSignalPromotionTargetMode: shadow-reduce
- guardianSignalPromotionActionReasons: promotion_latest_not_ready(warming)|promotion_ready_ratio_0.000_lt_0.500|promotion_mode_shadow-reduce_not_hybrid_reduce

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | processExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= 6 | 58 | 6 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 494.381 | 700 |
| PASS | minTickDelta >= minTickDeltaPerSample | 114 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 284.988 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0 | 0.05 |
| PASS | safeModeRatio <= maxSafeModeRatio | 1 | n/a(no-daemon-actions) |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.95 |

# Longrun Canary Audit

- generatedAt: 2026-03-07T19:57:45.793Z
- durationSec: 30
- elapsedMs: 31170
- bootReady: true
- bootMs: 1645
- sampleCount: 6
- successCount: 6
- failureCount: 0
- successRate: 1
- tickStart: 7
- tickEnd: 966
- tickAdvance: 959
- p95TelemetryLatencyMs: 341.818
- p05AvgEnergy: 76.668
- p95SpatialOverflowRatio: 0
- safeModeRatio: 1
- federationRejectRatio: 0
- guardianSignalPromotionVerdict: promote
- architectPlasmidPromotionVerdict: promote
- replicationPromotionVerdict: promote

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | processExitedUnexpectedly == false | false | false |
| PASS | successRate | 1 | 0.9 |
| PASS | p95TelemetryLatencyMs | 341.8 | 700 |
| PASS | p95SpatialOverflowRatio | 0 | 0.05 |
| PASS | safeModeRatio | 1 | 0.95 |
| PASS | guardianSignalPromotionVerdict == promote | promote | promote |
| PASS | architectPlasmidPromotionVerdict == promote | promote | promote |
| PASS | replicationPromotionVerdict == promote | promote | promote |

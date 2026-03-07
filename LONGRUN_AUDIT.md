# Longrun Canary Audit

- generatedAt: 2026-03-07T20:25:10.853Z
- durationSec: 300
- elapsedMs: 5126
- bootReady: true
- bootMs: 173
- sampleCount: 1
- successCount: 1
- failureCount: 0
- successRate: 1
- tickStart: 271
- tickEnd: 271
- tickAdvance: 0
- p95TelemetryLatencyMs: 122.635
- p05AvgEnergy: 272.742
- p95SpatialOverflowRatio: 0
- safeModeRatio: 1
- federationRejectRatio: 0
- guardianSignalPromotionVerdict: hold
- architectPlasmidPromotionVerdict: hold
- replicationPromotionVerdict: hold

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| FAIL | processExitedUnexpectedly == false | true | false |
| PASS | successRate | 1 | 0.9 |
| PASS | p95TelemetryLatencyMs | 122.6 | 700 |
| PASS | p95SpatialOverflowRatio | 0 | 0.05 |
| PASS | safeModeRatio | 1 | 0.95 |
| FAIL | guardianSignalPromotionVerdict == promote | hold | promote |
| FAIL | architectPlasmidPromotionVerdict == promote | hold | promote |
| FAIL | replicationPromotionVerdict == promote | hold | promote |

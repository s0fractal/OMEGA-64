# Longrun Canary Audit

- generatedAt: 2026-03-05T13:21:13.599Z
- durationSec: 45
- elapsedMs: 46914
- bootReady: true
- bootMs: 1950
- sampleCount: 9
- successCount: 9
- failureCount: 0
- successRate: 1
- tickStart: 9
- tickEnd: 1568
- tickAdvance: 1559
- p95TelemetryLatencyMs: 314.708
- p05AvgEnergy: 108.163
- p95SpatialOverflowRatio: 0
- safeModeRatio: 1
- federationRejectRatio: 0

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | processExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= 6 | 9 | 6 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 314.708 | 700 |
| PASS | minTickDelta >= minTickDeltaPerSample | 179 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 108.163 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0 | 0.05 |
| PASS | safeModeRatio <= maxSafeModeRatio | 1 | n/a(no-daemon-actions) |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.95 |

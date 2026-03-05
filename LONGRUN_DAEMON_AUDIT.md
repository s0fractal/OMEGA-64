# Longrun Daemon Audit

- generatedAt: 2026-03-05T13:50:25.888Z
- durationSec: 60
- elapsedMs: 63873
- bootReady: true
- bootMs: 10345
- spawnDaemon: true
- sampleCount: 13
- successCount: 13
- failureCount: 0
- successRate: 1
- tickStart: 59
- tickEnd: 1992
- tickAdvance: 1933
- p95TelemetryLatencyMs: 2847.691
- p05AvgEnergy: 307.632
- p95SpatialOverflowRatio: 0
- safeModeRatio: 1
- federationRejectRatio: 0
- perturbAttempts: 9
- perturbFailureRatio: 0.667
- daemonAdmissionEvents: 17
- daemonRejectRatio: 1
- effectEvalCoverage: 0

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | coreExitedUnexpectedly == false | false | false |
| PASS | daemonExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= minSamples | 13 | 8 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 2847.691 | 4000 |
| PASS | minTickDelta >= minTickDeltaPerSample | 121 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 307.632 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0 | 0.08 |
| PASS | safeModeRatio <= maxSafeModeRatio | n/a(no-daemon-accept) | n/a |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.98 |
| PASS | perturbAttempts >= minPerturbAttempts | 9 | 3 |
| PASS | perturbFailureRatio <= maxPerturbFailureRatio | n/a(no-daemon-accept) | n/a |
| PASS | daemonRejectRatio <= maxDaemonRejectRatio | n/a(no-daemon-accept) | n/a |
| PASS | daemonAcceptCount > 0 (optional) | 0 | optional |
| PASS | effectEvalCoverage >= minEffectEvalCoverage | n/a(no-daemon-accept) | n/a |
| PASS | daemonAuditEventsSeen > 0 | 27 | 0 |

## Daemon Events
| event_type | count |
|---|---:|
| DAEMON_PRESSURE_RING | 10 |
| DAEMON_REJECT | 17 |

## Perturbation Tail
| seq | kind | ok | status | reason | degraded | severity | score |
|---:|---|---|---:|---|---|---|---:|
| 0 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 1 | drop_pheromone | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |
| 2 | inject_plasmid | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |
| 3 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 4 | drop_pheromone | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |
| 5 | inject_plasmid | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |
| 6 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 7 | drop_pheromone | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |
| 8 | inject_plasmid | fail | 429 | SAFE_MODE_POPULATION_1_LT_16 | no | NONE | 0 |

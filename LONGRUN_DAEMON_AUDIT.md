# Longrun Daemon Audit

- generatedAt: 2026-03-05T14:08:42.515Z
- durationSec: 60
- elapsedMs: 61818
- bootReady: true
- bootMs: 1688
- spawnDaemon: true
- sampleCount: 15
- successCount: 15
- failureCount: 0
- successRate: 1
- tickStart: 5
- tickEnd: 2298
- tickAdvance: 2293
- p95TelemetryLatencyMs: 125.137
- p05AvgEnergy: 417.473
- p95SpatialOverflowRatio: 0.546791
- safeModeRatio: 0
- federationRejectRatio: 0
- perturbAttempts: 9
- perturbFailureRatio: 0
- daemonAdmissionEvents: 59
- daemonRejectRatio: 0.288
- effectEvalCoverage: 1

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | coreExitedUnexpectedly == false | false | false |
| PASS | daemonExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= minSamples | 15 | 8 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 125.137 | 4000 |
| PASS | minTickDelta >= minTickDeltaPerSample | 159 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 417.473 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0.546791 | 0.75 |
| PASS | safeModeRatio <= maxSafeModeRatio | 0 | 0.98 |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.98 |
| PASS | perturbAttempts >= minPerturbAttempts | 9 | 3 |
| PASS | perturbFailureRatio <= maxPerturbFailureRatio | 0 | 0.5 |
| PASS | daemonRejectRatio <= maxDaemonRejectRatio | 0.288 | 0.9 |
| PASS | daemonAcceptCount > 0 (optional) | 24 | optional |
| PASS | effectEvalCoverage >= minEffectEvalCoverage | 1 | 0.2 |
| PASS | daemonAuditEventsSeen > 0 | 125 | 0 |

## Daemon Events
| event_type | count |
|---|---:|
| DAEMON_ACCEPT | 24 |
| DAEMON_DEGRADED | 18 |
| DAEMON_EFFECT_EVAL | 24 |
| DAEMON_PRESSURE_RING | 42 |
| DAEMON_REJECT | 17 |

## Perturbation Tail
| seq | kind | ok | status | reason | degraded | severity | score |
|---:|---|---|---:|---|---|---|---:|
| 0 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 1 | drop_pheromone | ok | 202 | QUEUED | yes | MID | 2 |
| 2 | inject_plasmid | ok | 202 | QUEUED | yes | MID | 3 |
| 3 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 4 | drop_pheromone | ok | 202 | QUEUED | yes | MID | 2 |
| 5 | inject_plasmid | ok | 202 | QUEUED | yes | MID | 3 |
| 6 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 7 | drop_pheromone | ok | 202 | QUEUED | yes | MID | 2 |
| 8 | inject_plasmid | ok | 202 | QUEUED | yes | MID | 3 |

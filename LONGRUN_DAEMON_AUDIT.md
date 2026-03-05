# Longrun Daemon Audit

- generatedAt: 2026-03-05T14:02:58.450Z
- durationSec: 60
- elapsedMs: 61827
- bootReady: true
- bootMs: 1942
- spawnDaemon: true
- sampleCount: 15
- successCount: 15
- failureCount: 0
- successRate: 1
- tickStart: 9
- tickEnd: 2325
- tickAdvance: 2316
- p95TelemetryLatencyMs: 128.574
- p05AvgEnergy: 569.094
- p95SpatialOverflowRatio: 0.606076
- safeModeRatio: 0
- federationRejectRatio: 0
- perturbAttempts: 9
- perturbFailureRatio: 0
- daemonAdmissionEvents: 47
- daemonRejectRatio: 0.362
- effectEvalCoverage: 1

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | coreExitedUnexpectedly == false | false | false |
| PASS | daemonExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= minSamples | 15 | 8 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 128.574 | 4000 |
| PASS | minTickDelta >= minTickDeltaPerSample | 161 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 569.094 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0.606076 | 0.75 |
| PASS | safeModeRatio <= maxSafeModeRatio | 0 | 0.98 |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.98 |
| PASS | perturbAttempts >= minPerturbAttempts | 9 | 3 |
| PASS | perturbFailureRatio <= maxPerturbFailureRatio | 0 | 0.5 |
| PASS | daemonRejectRatio <= maxDaemonRejectRatio | 0.362 | 0.9 |
| PASS | daemonAcceptCount > 0 (optional) | 18 | optional |
| PASS | effectEvalCoverage >= minEffectEvalCoverage | 1 | 0.2 |
| PASS | daemonAuditEventsSeen > 0 | 99 | 0 |

## Daemon Events
| event_type | count |
|---|---:|
| DAEMON_ACCEPT | 18 |
| DAEMON_DEGRADED | 12 |
| DAEMON_EFFECT_EVAL | 18 |
| DAEMON_PRESSURE_RING | 34 |
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

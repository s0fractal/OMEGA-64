# Longrun Daemon Audit

- generatedAt: 2026-03-05T22:38:02.299Z
- durationSec: 360
- elapsedMs: 366331
- bootReady: true
- bootMs: 1662
- spawnDaemon: true
- sampleCount: 36
- successCount: 36
- failureCount: 0
- successRate: 1
- tickStart: 7
- tickEnd: 13435
- tickAdvance: 13428
- p95TelemetryLatencyMs: 283.423
- p05AvgEnergy: 308.037
- p95SpatialOverflowRatio: 0.457065
- safeModeRatio: 0
- federationRejectRatio: 0
- perturbAttempts: 3
- perturbFailureRatio: 0
- daemonAdmissionEvents: 1175
- daemonRejectRatio: 0.037
- effectEvalCoverage: 1

| status | check | observed | limit |
|---|---|---:|---:|
| PASS | bootReady | true | true |
| PASS | coreExitedUnexpectedly == false | false | false |
| PASS | daemonExitedUnexpectedly == false | false | false |
| PASS | sampleCount >= minSamples | 36 | 8 |
| PASS | successRate >= minSuccessRate | 1 | 0.9 |
| PASS | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures | 0 | 4 |
| PASS | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs | 283.423 | 4000 |
| PASS | minTickDelta >= minTickDeltaPerSample | 344 | 1 |
| PASS | p05AvgEnergy >= minAvgEnergyP05 | 308.037 | 1 |
| PASS | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95 | 0.457065 | 0.75 |
| PASS | safeModeRatio <= maxSafeModeRatio | 0 | 0.98 |
| PASS | federationRejectRatio <= maxFederationRejectRatio | 0 | 0.98 |
| PASS | perturbAttempts >= minPerturbAttempts | 3 | 3 |
| PASS | perturbFailureRatio <= maxPerturbFailureRatio | 0 | 0.5 |
| PASS | daemonRejectRatio <= maxDaemonRejectRatio | 0.037 | 0.9 |
| PASS | daemonAcceptCount > 0 (optional) | 569 | optional |
| PASS | effectEvalCoverage >= minEffectEvalCoverage | 1 | 0.2 |
| PASS | daemonAuditEventsSeen > 0 | 3171 | 0 |

## Daemon Events
| event_type | count |
|---|---:|
| DAEMON_ACCEPT | 569 |
| DAEMON_DEGRADED | 563 |
| DAEMON_EFFECT_EVAL | 569 |
| DAEMON_PRESSURE_RING | 1427 |
| DAEMON_REJECT | 43 |

## Perturbation Tail
| seq | kind | ok | status | reason | degraded | severity | score |
|---:|---|---|---:|---|---|---|---:|
| 0 | pressure_ring | ok | 200 | OK | no | NONE | 0 |
| 1 | drop_pheromone | ok | 202 | QUEUED | yes | MID | 2 |
| 2 | inject_plasmid | ok | 202 | QUEUED | yes | HIGH | 4 |

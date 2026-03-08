# Longrun Daemon Audit

- generatedAt: 2026-03-06T01:17:45.501Z
- durationSec: 180
- elapsedMs: 183137
- bootReady: true
- bootMs: 2114
- spawnDaemon: true
- sampleCount: 18
- successCount: 18
- failureCount: 0
- successRate: 1
- tickStart: 8
- tickEnd: 6661
- tickAdvance: 6653
- p95TelemetryLatencyMs: 233.847
- p05AvgEnergy: 331.021
- p95SpatialOverflowRatio: 0.501949
- safeModeRatio: 0
- federationRejectRatio: 0
- perturbAttempts: 3
- perturbFailureRatio: 0
- daemonAdmissionEvents: 1191
- daemonRejectRatio: 0.036
- effectEvalCoverage: 1

| status | check                                                              | observed |    limit |
| ------ | ------------------------------------------------------------------ | -------: | -------: |
| PASS   | bootReady                                                          |     true |     true |
| PASS   | coreExitedUnexpectedly == false                                    |    false |    false |
| PASS   | daemonExitedUnexpectedly == false                                  |    false |    false |
| PASS   | sampleCount >= minSamples                                          |       18 |        8 |
| PASS   | successRate >= minSuccessRate                                      |        1 |      0.9 |
| PASS   | maxConsecutiveTelemetryFailures <= maxConsecutiveTelemetryFailures |        0 |        4 |
| PASS   | p95TelemetryLatencyMs <= maxP95TelemetryLatencyMs                  |  233.847 |     4000 |
| PASS   | minTickDelta >= minTickDeltaPerSample                              |      350 |        1 |
| PASS   | p05AvgEnergy >= minAvgEnergyP05                                    |  331.021 |        1 |
| PASS   | p95SpatialOverflowRatio <= maxSpatialOverflowRatioP95              | 0.501949 |     0.75 |
| PASS   | safeModeRatio <= maxSafeModeRatio                                  |        0 |     0.98 |
| PASS   | federationRejectRatio <= maxFederationRejectRatio                  |        0 |     0.98 |
| PASS   | perturbAttempts >= minPerturbAttempts                              |        3 |        3 |
| PASS   | perturbFailureRatio <= maxPerturbFailureRatio                      |        0 |      0.5 |
| PASS   | daemonRejectRatio <= maxDaemonRejectRatio                          |    0.036 |      0.9 |
| PASS   | daemonAcceptCount > 0 (optional)                                   |      577 | optional |
| PASS   | effectEvalCoverage >= minEffectEvalCoverage                        |        1 |      0.2 |
| PASS   | daemonAuditEventsSeen > 0                                          |     3431 |        0 |

## Daemon Events

| event_type           | count |
| -------------------- | ----: |
| DAEMON_ACCEPT        |   577 |
| DAEMON_DEGRADED      |   571 |
| DAEMON_EFFECT_EVAL   |   577 |
| DAEMON_HOMEOSTASIS   |     2 |
| DAEMON_PRESSURE_RING |  1661 |
| DAEMON_REJECT        |    43 |

## Perturbation Tail

| seq | kind           | ok | status | reason | degraded | severity | score |
| --: | -------------- | -- | -----: | ------ | -------- | -------- | ----: |
|   0 | pressure_ring  | ok |    200 | OK     | no       | NONE     |     0 |
|   1 | drop_pheromone | ok |    202 | QUEUED | yes      | MID      |     2 |
|   2 | inject_plasmid | ok |    202 | QUEUED | yes      | HIGH     |     4 |

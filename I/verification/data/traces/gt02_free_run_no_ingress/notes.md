# gt02_free_run_no_ingress

- scenario: free run without external intervention
- setup: cold boot, no inject, no daemon policy updates
- duration: 2048 ticks
- daemonEnabled: false
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:56321
- port: 56321
- seed: 424242

## Environment

- OMEGA_PULSE_WORKERS=1
- OMEGA_STRICT_DETERMINISM=1
- OMEGA_AUTO_SNAPSHOT_ENABLE=0
- OMEGA_COLDSTART_ENABLE=1
- OMEGA_COLDSTART_COUNT=64
- OMEGA_COLDSTART_REPLICATOR_RATIO=0.5
- OMEGA_COLDSTART_SEED=424242
- OMEGA_COLDSTART_ENERGY=240
- OMEGA_COLDSTART_RESONANCE=220

## Actions

- none

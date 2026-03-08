# gt01_coldstart_seeded_swarm

- scenario: coldstart / seeded swarm
- setup: cold boot, deterministic seed swarm, daemon off
- duration: 256 ticks
- daemonEnabled: false
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:59757
- port: 59757
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

# gt05_homeostasis_correction

- scenario: external homeostasis correction
- setup: warmup 256 ticks, then one fixed /api/homeostasis update
- duration: 768 ticks total
- daemonEnabled: false
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:56360
- port: 56360
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

- tick=256 kind=HOMEOSTASIS_UPDATE
  responseDigest=97b4528315c05e7f1bb9ffdd270a30ffe8bb76e2eff12e5d0b6eb778d764ef5c

# gt04_plasmid_inject

- scenario: durable symbolic ingress
- setup: warmup 128 ticks, then one fixed INJECT_PLASMID payload
- duration: 512 ticks total
- daemonEnabled: false
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:56351
- port: 56351
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

- tick=129 kind=INJECT_PLASMID responseDigest=f0b6f469dc311dd275e6a54185402bae3a25d8c610334013ec5a4d86e97a499a
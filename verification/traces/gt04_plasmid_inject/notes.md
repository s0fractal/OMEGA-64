# gt04_plasmid_inject

- scenario: durable symbolic ingress
- setup: warmup 128 ticks, then one fixed INJECT_PLASMID payload
- duration: 512 ticks total
- daemonEnabled: false
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:59765
- port: 59765
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

- tick=129 kind=INJECT_PLASMID
  responseDigest=52c776d6a98a7999fb2f6baa1316e37dca77bd046edf84d12400a47b1ca35139

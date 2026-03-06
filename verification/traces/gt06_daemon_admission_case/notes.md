# gt06_daemon_admission_case

- scenario: daemon admission / rejection
- setup: one accepted ingress case and one degraded/rejected case with daemon governance on
- duration: event-bounded
- daemonEnabled: true
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:56372
- port: 56372
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

- tick=128 kind=DROP_PHEROMONE_ACCEPT responseDigest=ee45bb285e72ba3d04a7d34550781a26c9f5693f7dd8265d707686a6bca2fab4
- tick=192 kind=INJECT_PLASMID_DEGRADED responseDigest=6fa126b7c01f359bd42a6e787c80820493e36eeb0ffcf44e7ebbea351764ef7b
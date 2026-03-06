# gt07_daemon_policy_block

- scenario: daemon policy block
- setup: warmup 128 ticks, then one fixed INJECT_PLASMID payload with a blocked opcode
- duration: 256 ticks total
- daemonEnabled: true
- runtime_mode: legacy-runtime/api-observer-harness
- base_url: http://127.0.0.1:56891
- port: 56891
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

- tick=129 kind=INJECT_PLASMID_BLOCKED responseDigest=caf24b26650a33cecdd051a60150527b8c23cb63640a1d3a32e02cd3f619928e
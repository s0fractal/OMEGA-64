# gt16_runtime_build_materialization

- scenario: runtime structure build materialization
- setup: worker-backed deterministic subprocess capture of a single architect
  executing OP_BUILD SOURCE through PULSE.tick
- duration: 1 pulse tick / subprocess capture
- daemonEnabled: false
- runtime_mode: worker-runtime-structure-build-capture
- workers: 1
- strict: true
- hash: a01baa0b17b106dcd8959c3003c0415b039f5f44f15120f6bc5c8a20f86374da

## Runtime build capture

- target_resolved_type=4
- target_resolved_charge=255
- owner_intent_after_tick=0
- value_intent_after_tick=0
- neighbor_resolved_type=1
- neighbor_resolved_charge=235

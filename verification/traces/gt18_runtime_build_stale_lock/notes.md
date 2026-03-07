# gt18_runtime_build_stale_lock

- scenario: runtime structure build stale-lock fallback
- setup: worker-backed deterministic subprocess capture of a single architect attempting OP_BUILD SOURCE into a cell carrying a stale locked SOURCE intent through PULSE.tick
- duration: 1 pulse tick / subprocess capture
- daemonEnabled: false
- runtime_mode: worker-runtime-structure-build-stale-lock-capture
- workers: 1
- strict: true
- hash: 4f0464a743d1960d246e952e48929d625f04d5dcf2d10c1df2907e8b4b6c7156

## Runtime build stale-lock capture

- target_resolved_type=4
- target_resolved_charge=255
- target_resolved_state=55
- stale_lock_owner_token=3
- stale_locked_state=55
- attempted_owner_atom_idx=2
- attempted_build_state=99
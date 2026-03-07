# gt17_runtime_build_competition

- scenario: runtime structure build competition
- setup: worker-backed deterministic subprocess capture of two architects publishing competing OP_BUILD SOURCE intents into the same cell through PULSE.tick
- duration: 1 pulse tick / subprocess capture
- daemonEnabled: false
- runtime_mode: worker-runtime-structure-build-competition-capture
- workers: 1
- strict: true
- hash: 02ff0109cee9073a2cbfc75e4f6e81be8cb0ad960aabe1b306b3f483e22aa4ad

## Runtime build competition capture

- target_resolved_type=4
- target_resolved_charge=255
- target_resolved_state=91
- lower_owner_atom_idx=2
- lower_owner_state=17
- higher_owner_atom_idx=3
- higher_owner_state=91
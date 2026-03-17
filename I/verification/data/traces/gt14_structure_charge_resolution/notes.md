# gt14_structure_charge_resolution

- scenario: standalone structure charge resolution
- setup: standalone deterministic subprocess capture of OP_PLUG publishing a
  charge intent and tick_structure_grid resolving it into a concrete charged
  structure cell
- duration: 1 execute phase + 1 structure tick / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-structure-charge-capture
- workers: 1
- strict: true
- hash: 5169f3bb10720912217ba528781cda8902c8e992dca299829d98114bdd8fa484

## Structure charge capture

- charge_intent_before_tick=180
- resolved_cell_type=1
- resolved_cell_charge=170
- charge_intent_after_tick=0

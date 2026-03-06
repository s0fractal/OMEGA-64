# gt13_structure_lock_progress

- scenario: standalone structure stale-lock progress
- setup: standalone deterministic subprocess capture of OP_SENSE visibility through a stale structure lock plus tick_structure_grid intent clearing
- duration: 2 execute phases + 1 structure tick / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-structure-lock-capture
- workers: 1
- strict: true
- hash: c4e1db4abc263e82780df33a55558a82622fe4fb99f4be582452d761b6193927

## Structure lock capture

- visible_sense_reg=1
- typed_miss_sense_reg=0
- resolved_cell_type=2
- resolved_cell_charge=255
- owner_intent_after_tick=0
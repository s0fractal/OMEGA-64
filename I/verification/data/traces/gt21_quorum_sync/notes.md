# gt21_quorum_sync

- scenario: sovereignty protocol collective sync and aggressive share
- setup: standalone deterministic capture of OP_COLLECTIVE (quorum sync) and
  OP_SHARE (hormone-modulated aggression bonus)
- runtime_mode: standalone-quorum-sync-capture
- hash: e38039b401a6bb0e1727046914b4a09c3d9f7e483eb87de1fad3c99ed7e31bf8

## Quorum PC Sync

- source_pc=4
- peer1_pc=4
- peer2_pc=4
- insider_sync=true
- outsider_pc=13 (should be 13)

## Aggressive Share

- hormone_aggression=1200
- target_energy=600 (should be 600 with bonus)

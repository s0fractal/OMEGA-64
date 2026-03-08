# gt08_structure_intent_visibility

- scenario: same-tick structure intent visibility
- setup: standalone deterministic capture of contended BUILD intents and
  same-tick OP_SENSE visibility under 1-worker vs 4-worker execution
- duration: 1 tick / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-structure-intent-capture
- seed: 404
- ticks: 1
- atom_count: 20

## Subprocess captures

- strict=true workers=1
  hash=f453e1c624c222787f039e07fc85360e60abb82f271d74e88e19e9d22da72a93
- strict=true workers=4
  hash=f453e1c624c222787f039e07fc85360e60abb82f271d74e88e19e9d22da72a93
- hash_match=true
- sense_visibility_1w=true
- sense_visibility_4w=true

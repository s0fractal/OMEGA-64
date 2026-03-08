# gt12_collective_synchrony

- scenario: standalone collective synchrony semantics
- setup: standalone deterministic capture of OP_COLLECTIVE mode 5 bonded
  phase-lock and mode 6 local quorum PC sync through direct WASM execution
- duration: 2 standalone execute phases / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-collective-synchrony-capture
- workers: 1
- strict: true
- hash: df3e8266f4fede871e87c849b4f025a2bfd279681441211d5bc5f3a5c0794963

## Collective synchrony capture

- phase_peer_1_pc=4
- phase_peer_2_pc=4
- quorum_peer_1_pc=4
- quorum_peer_2_pc=4
- quorum_outsider_pc=13

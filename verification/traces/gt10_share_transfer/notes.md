# gt10_share_transfer

- scenario: standalone bonded share transfer semantics
- setup: standalone deterministic capture of OP_SHARE successful bonded transfer
  and empty-bond no-op through direct WASM execution
- duration: 2 execute_atom calls / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-share-transfer-capture
- workers: 1
- strict: true
- hash: b145f3d37f4b7b20a9087fd3fb4f1abc7de7bac24f1598a7e87f80a9617e8d3b

## Share transfer capture

- successful_sender_energy=499.999
- successful_receiver_energy=600
- failed_sender_energy=999.999
- failed_receiver_energy=100

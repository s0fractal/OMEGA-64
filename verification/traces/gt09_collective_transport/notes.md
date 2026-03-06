# gt09_collective_transport

- scenario: standalone collective hive and pheromone semantics
- setup: standalone deterministic capture of OP_COLLECTIVE mode 0/1 hive store-load and mode 2 pheromone emit through direct WASM execution
- duration: 3 execute_atom calls / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-collective-transport-capture
- workers: 1
- strict: true
- hash: 1beaa58c7bcee05eaa5d1ff783477d0fe67c7dbcdc060a4c692223544c00e1d6

## Collective capture

- hive_value=88
- loaded_reg0=88
- pheromone_word=0xc805
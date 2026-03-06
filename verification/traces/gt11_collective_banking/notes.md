# gt11_collective_banking

- scenario: standalone collective banking semantics
- setup: standalone deterministic capture of OP_COLLECTIVE mode 3 deposit and mode 4 capped withdraw through direct WASM execution
- duration: 2 execute_atom calls / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-collective-banking-capture
- workers: 1
- strict: true
- hash: 78668b6c2aa1306acaa63cbc93831cebd4e6fcb9d36c02e0b38652326a3b7fa9

## Collective banking capture

- initial_hive_balance=250
- final_hive_balance=230
- depositor_energy=4999.919
- withdrawer_energy=5000.099
- withdraw_reg0=100
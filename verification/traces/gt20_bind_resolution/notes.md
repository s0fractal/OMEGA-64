# Golden Trace: gt20_bind_resolution

Verification of `OP_BIND` (0x82) autonomous bond request resolution.

## Scenario
Two atoms are seeded at (100, 100) and (105, 105). Atom 1 executes `OP_BIND`.

## Expected Behavior
WASM kernel should identify Atom 2 as the nearest neighbor within range (25.0) and write a pending bond request (initiator=2, target=3, status=1) into the `BOND_REQUESTS_OFFSET` buffer.

## Results
- Initiator ID: 2 (Atom Index 1 + 1)
- Target ID: 3 (Atom Index 2 + 1)
- Request Status: 1 (PENDING)
- Snapshot Digest: 1f0f0a6d5c8b6128c295cb49f3e9d1c050b94273a16be9f180f7f6b2297abefc

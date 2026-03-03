# Test Planes

## Active Plane (WASM Runtime)

This is the authoritative test surface for current architecture.

- Location: root-level `test_*.ts` files
- Entry point: `deno task verify:coherence:deep`
- CI mirrors:
  - `deno task ci:verify:matrix`
  - `deno task ci:soak:worker4`

If a change affects runtime determinism, worker resilience, or WASM coherence,
it must be validated on this plane.

## Legacy Plane (`tests/`)

`./tests` contains historical and partially decoupled suites from older eras.

- Not part of active WASM CI gate
- Can reference symbols/modules not exported in the current `@omega` surface
- Useful for archaeology and optional migration, but non-blocking for runtime
  evolution

Treat failures there as migration backlog unless explicitly promoted to Active
Plane.

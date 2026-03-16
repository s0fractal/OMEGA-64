---
id: trace_atom
type: pure_fn
dataType: null
returns: void
level: 0
args:
  idx: i32
  opcode: i32
  gx: i32
  gy: i32
  targetIdx: i32
deps:
  - TYPES
vars: []
---
```rust
// Externally defined in the host or FFI boundary for Sigma
```

```typescript




// TS Mock No-op
```

```assemblyscript
// AssemblyScript imports are usually declared at the top level
// The transpiler handles the `@external` decorator if needed, or we just leave it 
// empty here and ensure it's exported via `pulse_orchestrator`'s host-link.
// For now, in OMEGA-64, trace_atom is already globally declared in `pulse_orchestrator.ts`.
// But to make it topological, we declare it as an external import.
```

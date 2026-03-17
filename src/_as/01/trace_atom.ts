// SSoT: file:///Users/s0fractal/OMEGA/I/core/trace_atom.md

@inline
export function trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32): void {
// AssemblyScript imports are usually declared at the top level
// The transpiler handles the `@external` decorator if needed, or we just leave it 
// empty here and ensure it's exported via `pulse_orchestrator`'s host-link.
// For now, in OMEGA-64, trace_atom is already globally declared in `pulse_orchestrator.ts`.
// But to make it topological, we declare it as an external import.
}

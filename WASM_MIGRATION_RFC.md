# OMEGA-64: WebAssembly (Wasm) Migration RFC 🦀🕸️🌀

## 1. Executive Summary

Currently, OMEGA-64's `LAMBDA_VM.ts` executes in the V8 JS engine using
TypeScript. While Deno is fast, executing complex 16-register bytecode for
>50,000 atoms per pulse (`PULSE_WORKER.ts`) creates a significant CPU
bottleneck.

This RFC proposes migrating the core `LAMBDA_VM` and potentially physics
calculations to a **WebAssembly (Wasm) module written in Rust**. This will
provide near-native execution speeds (estimated 10x-50x improvement), zero-cost
abstractions for byte manipulation, and explicit memory control, allowing the
Matrix to scale beyond 100,000 atoms without dropping the pulse rate.

## 2. Shared Memory Architecture (Zero-Copy)

To avoid the overhead of copying data between JS and Wasm, we will utilize
`WebAssembly.Memory` backed by `SharedArrayBuffer` (which we already use heavily
in `STATE_MATRIX.ts`).

### The Layout

The existing SoA (Structure of Arrays) layout in `STATE_MATRIX.buffer` aligns
perfectly with Wasm linear memory.

- Deno will allocate the `SharedArrayBuffer` (e.g., 50MB).
- Deno will pass this buffer to the Wasm module during instantiation:
  ```javascript
  const wasmMemory = new WebAssembly.Memory({
    initial: 1000,
    maximum: 2000,
    shared: true,
  });
  // Map our STATE_MATRIX over the wasmMemory.buffer
  ```
- Rust will access pointers to the various arrays (energies, resonances, codes)
  directly using raw pointers or `js-sys` TypedArrays.

## 3. The Rust implementation (`lambda_vm.rs`)

### Data Structures

```rust
#[repr(C)]
pub struct VmState {
    pub x: i16,
    pub y: i16,
    pub energy: f32, // Or fixed-point i32 mapped from Deno
    pub resonance: f32,
    pub semantic_bonuses: u8,
    // ... other contextual data
}

#[repr(C)]
pub struct VmResult {
    pub energy_delta: f32,
    pub resonance_delta: f32,
    pub message_out: u8,
    pub intent_count: u8,
    // Intents stored in a fixed array to avoid heap allocation across FFI
    pub intents: [Intent; 4], 
}
```

### Execution Loop

The `execute` function will be exported to JS:

```rust
#[no_mangle]
pub extern "C" fn execute_atom(
    atom_index: usize,
    pc: u32,
    state_ptr: *mut VmState,
    result_ptr: *mut VmResult
) {
    // 1. Read atom's memory and registers directly from shared buffer
    // 2. Decode instruction
    // 3. Match opcode & apply semantic bonuses
    // 4. Write back to result_ptr
}
```

## 4. Migration Strategy (Phased Approach)

### Phase 1: Wasm Worker (Opt-in)

- Write the Rust VM handling only basic opcodes (`MOVE`, `ADD`, `LOAD`,
  `STORE`).
- Compile to Wasm using `wasm-pack`.
- Update `PULSE_WORKER.ts` to instantiate the Wasm module.
- Add a fallback mechanism: If an atom encounters an advanced/unsupported opcode
  (like `ENCODE` or `DECODE`), it bails out of Wasm and `PULSE_WORKER.ts`
  finishes the execution using the legacy TypeScript `LAMBDA_VM`.

### Phase 2: Complete ISA Port

- Port all architectural stigmergy, semantic processing, and memetic replication
  to Rust.
- Wasm handles 100% of atom execution.

### Phase 3: Spatial Hash & Physics Port

- Move `PHYSICS_ENGINE` collision detection and nutrient diffusion into Wasm,
  heavily utilizing SIMD instructions (if enabled) for grid convolutions.

## 5. Security & Isolation

By compiling the logic to Wasm, we enforce a strict sandbox. Atoms will
literally be incapable of executing arbitrary system calls (no filesystem
access, no network access), cementing the core axiom of the Matrix: "The VM is
the Universe."

## 6. Expected Outcomes

- **Throughput**: Execution of a 16-instruction block drops from ~100ns to ~2ns.
- **Capacity**: Maximum atom count increases from 50k to 500k+.
- **Predictability**: Wasm provides strictly deterministic floating-point and
  integer math, removing any V8 engine JIT unpredictability across different OS
  architectures.

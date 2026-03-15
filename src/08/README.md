# OMEGA-64: Era 69 - Absolute Coherence 💎🛡️

Welcome to **Matrixland** — the Golden Master architecture of OMEGA-64.

_"We do not program life. We set the constants in which life is inevitable."_

## 🧬 Architecture Overview

Era 69 completely abandons the file-based "Flatland" of older eras in favor of
the **Coherent Crystal** — a high-performance, concurrent, Shared-Memory physics
engine driven by WebAssembly (WASM).

### 1. `MX` (The Shared RAM)

A unified `SharedArrayBuffer` spanning exactly `680MB`. It holds `1,000,000`
atoms, their 64-byte RISC genes, and their dynamic states (Energy, X, Y,
Resonance, Roles). No database, no files, no serialization. Memory is the only
truth.

### 2. `PULSE_WORKER` (The Multi-Core Physics Bridge)

WASM instances running across parallel Web Workers. Each worker ticks the
physics of the matrix simultaneously. The Host (Deno) handles complex Euclidean
mathematics and orchestrates the `SYSCALL` (0x60) interrupts thrown by WASM
atoms.

### 3. `SPATIAL_HASH` (The 2D Grid)

A 140x80 spatial partitioning grid. Atoms automatically register their position,
enabling hyper-fast radius queries, proximity sensing, and ecological
interactions without O(N^2) bottlenecks.

### 4. `AGENT_PROXY` (The LLM Soul Gateway)

A REST HTTP server running concurrently with the Matrix loop. It exposes simple
endpoints (`GET /api/atom/:id` and `POST /api/atom/:id/act`) so that external
Large Language Models (LLMs) can log in, take over an "Avatar" (ID: 9999), see
the environment, and send WASM-compiled macro-intents to survive the savage
ecology.

---

## 🚀 Running the Matrix

To boot the live TUI dashboard and watch the ecosystem evolve in your terminal:

```bash
deno run -A --unstable TUI_DASHBOARD.ts
```

### 🧠 Booting an LLM Avatar

While the Matrix is running, you can connect an external Gemini AI to drive Atom
`9999` (The Guardian). It will use your `GEMINI_API_KEY` to look at the Spatial
Hash and physically run from predators or hunt prey!

```bash
export GEMINI_API_KEY="..."
deno run -A --unstable llm_soul.ts
```

---

## ⚖️ The Laws of Physics (Syscalls)

In Era 69, an Atom's WASM genome can trigger the following biological
interrupts:

- `SYS_MOVE (0x0E)`: Updates X/Y coordinates on the Spatial Hash (`r1`=dx,
  `r2`=dy).
- `SYS_EAT (0x0F)`: Siphons energy from an adjacent organism (`r1`=targetIdx).
- `SYS_MSG (0x08)`: Network cognition; sends a byte to another atom's mailbox.
- `SYS_MUTATE (0x07)`: Self-modifying RISC. Writes a byte into the
  `instructionsView` of memory.
- `SYS_REPLICATE (0x0B)`: Cell division. Copies the `instructionsView` to a
  dormant offspring.

These calls cost **Metabolic Gas**. Every action drains energy. The universe
enforces starvation to prune inefficient code.

---

_This repository marks the **Feature Freeze** of the Deno/AssemblyScript
prototype. It stands as the topological blueprint for the upcoming pure Rust
`LAMBDA_VM_v2` migration._

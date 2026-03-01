# OMEGA-64 | ARCHITECTURE | Era 33: Trophic Resonance 💎🧬

## 1. Top-Level Overview

OMEGA-64 is a deterministic, RAM-bound autopoietic ecosystem. Era 33 establishes
**Metabolic Specialization**, transitioning from a uniform population to a
complex trophic web supported by a high-performance, multi-threaded SoA
architecture.

### Core Pipeline (Autopoietic Loop)

```mermaid
graph TD
    Matrix[STATE_MATRIX (SharedArrayBuffer)] -->|Sync| Workers[PULSE_WORKERS (x4)]
    Workers -->|Execute VM| Specialization[Trophic Roles: Producer/Constructor/Siphon]
    Specialization -->|Apply Logic| Physics[PHYSICS_ENGINE (Nutrients/Bonds)]
    Physics -->|Modify| Grid[Structure Grid / Voxel Reality]
    Grid -->|Feedback| Matrix
    Matrix -->|Render| UI[Ecosystem View (Three.js)]
```

## 2. Key Components

### A. Extended SoA Matrix (`STATE_MATRIX.ts`)

A high-density memory layout utilizing `SharedArrayBuffer`. Beyond basic spatial
data, Era 33 integrates:

- **Role Registry**: Permanent trophic specialization.
- **Synaptic Stack**: 4-slot internal state machine per atom.
- **Bond Stiffness**: Variable physical constraints.

### B. Parallel Execution (`PULSE_WORKER.ts`)

The simulation is offloaded to 4 parallel workers. Each worker handles a chunk
of the `STATE_MATRIX`, ensuring bit-identical determinism through `Atomics` and
local `PRNG` chains.

### C. Voxelized Reality (`structureGrid`)

A spatial grid (`70x40`) storing physical density and bytecode. Atoms with the
**Constructor** role can convert energy into structural density, which is then
persistent and interactable by **Siphons**.

### D. Trophic Metabolism

Metabolic logic is now role-dependent:

- **Producers**: Enhanced nutrient absorption (+50%).
- **Constructors**: Reduced build costs (-50%).
- **Siphons**: Doubled efficiency in structure-to-energy conversion.

## 3. Data Invariants

1. **Deterministic Resonance**: Every mutation must be reproducible. Time and ID
   form the seed for every choice.
2. **Conservation of Role**: Specialization through the `SPEC` instruction is
   permanent.
3. **Structure Integrity**: A structural voxel only has meaning if it contains
   both density and associated semantic code.

---

🛡️💎🧬🌀 "The Matrix is the body; the Roles are the soul."

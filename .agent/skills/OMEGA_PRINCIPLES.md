---
name: OMEGA_PRINCIPLES
description: Core architectural principles for OMEGA-64 development and self-modification.
---

# OMEGA-64 Core Principles (Era 69)

These principles govern all architectural decisions, code refactors, and self-modifications within the OMEGA-64 ecosystem.

## 1. Token Efficiency (The MX Rule)
- All core identifiers must be as concise as possible to minimize prompt/context token consumption for LLM agents.
- **Rule**: Prefer `MX` over `STATE_MATRIX`, `AT` over `ATOM`, `OX` over `ONTOLOGY`.
- **Reasoning**: In a self-modifying system, every byte saved in the "Core Logic" allows for deeper "Metabolic Thinking" by the presiding agent.

## 2. Deterministic Coherence (The Rust-First Kernel)
- The core physics, cellular automata, and memory arbitration logic must reside in the Rust-WASM kernel (`sigma_core`).
- **Rule**: TypeScript (`MX.ts`) should act as a high-level orchestrator; complex mutations belong in Rust.
- **Reasoning**: Rust's ownership model is the only way to ensure safety and performance when multiple workers access a common `SharedArrayBuffer` (The Lattice).

## 3. Ontology-Driven Development (SSoT)
- Markdown files in `src/ontology/` are the Single Source of Truth (SSoT).
- **Rule**: Never modify generated code (`@g`, `sigma_core/src/ontology_gen`) directly. Update the `.md` source and rebuild.
- **Reasoning**: This maintains the semantic mapping between human-readable lore and machine-executable logic.

## 4. Metabolic Stability (The Lockdown Pattern)
- Unexpected system behavior (timeouts, drift) must be addressed via "Metabolic Lockdown" (trace minimization, clamping, coordinate locking).
- **Rule**: Prioritize system stability and determinism over feature expansion.
- **Reasoning**: A system that cannot verify its own state (Golden Traces) cannot safely self-evolve.

## 5. Living Quine Integrity
- Self-modification must be auditable and reversible.
- **Rule**: All source code changes must pass the `verify:coherence` suite before being considered "canon".
- **Reasoning**: The system is a Living Quine; its source is its DNA. Corruption leads to systemic collapse.

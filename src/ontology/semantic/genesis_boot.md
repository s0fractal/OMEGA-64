---
id: GENESIS_BOOT
type: module
description: "Migrated from src/07/05/GENESIS_BOOT.ts"
tags: ["core", "host"]
deps: []
min_level: 6
---

### TypeScript

```typescript
/**
 * GENESIS_BOOT.ts
 * Axiomatic bytecode definitions for OMEGA-64 Stage 20.
 * These are the "First Programs" that define the core roles in native GlyphIR64.
 */

export const GLYPH = {
  // Core
  S: 0,
  K: 1,
  I: 2,
  Y: 3,
  // Control
  SET: 8,
  GET: 9,
  PUT: 10,
  ADD: 11,
  SUB: 12,
  JNZ: 13,
  JMP: 14,
  JZ: 15,
  // Transport
  REPLICATE: 16,
  SIGNAL: 17,
  SHARE: 18,
  BIND: 19,
  SPORE_DRIVE: 20,
  ENTANGLE: 21,
  // Structural
  PLUG: 24,
  TENSEGRITY: 25,
  BUILD: 26,
  SENSE: 27,
  // Catalytic
  COLLECTIVE: 32,
  ROLE: 33,
  RESOLVE: 34,
};

export type RolePreamble = {
  roleId: number;
  bytecode: number[];
};

/**
 * The Genesis Programs:
 * These bypass legacy WASM interpretation when running in "Native Mode".
 */
export const GENESIS_PROGRAMS: Record<string, number[]> = {
  /**
   * GUARDIAN (Role 2):
   * Focuses on PHEROMONE emission (Positive Amplitude).
   */
  "guardian_base": [
    GLYPH.SET,
    0,
    100, // R0 = 100
    GLYPH.SET,
    1,
    1, // R1 = 1 (Pheromone index)
    GLYPH.SIGNAL, // Emit Pheromone with R0 (+100) intensity
    GLYPH.I, // No-op return
  ],

  /**
   * PARASITE (Role 4):
   * Disrupts signals (Negative Amplitude).
   */
  "parasite_base": [
    GLYPH.SET,
    0,
    0, // R0 = 0
    GLYPH.SET,
    1,
    100, // R1 = 100
    GLYPH.SUB,
    0,
    1, // R0 = R0 - R1 (-100)
    GLYPH.SET,
    2,
    1, // R2 = 1 (Pheromone index)
    GLYPH.SIGNAL, // Emit Pheromone with R0 (-100) intensity
    GLYPH.I,
  ],

  /**
   * ARCHITECT (Role 3):
   * Focuses on PLASMID emission and structural intent.
   */
  "architect_base": [
    GLYPH.SET,
    0,
    100, // R0 = 100 (Charge / Amplitude)
    GLYPH.SET,
    1,
    0, // R1 = 0 (Plasmid index)
    GLYPH.PLUG,
    0,
    0, // Apply structural charge intent
    GLYPH.SIGNAL, // Emit Plasmid signal
    GLYPH.I,
  ],

  /**
   * REPLICATOR (Default / Shared):
   * Basic reproduction logic.
   */
  "replicator_base": [
    GLYPH.SET,
    0,
    50, // R0 = 50 (Low signal)
    GLYPH.SET,
    1,
    2, // R1 = 2 (Replication scent)
    GLYPH.SIGNAL,
    GLYPH.REPLICATE,
    GLYPH.I,
  ],

  /**
   * COMPLEX_STABILITY:
   * A program demonstrating control flow via JNZ.
   */
  "stability_loop": [
    GLYPH.SET,
    0,
    10, // R0 = 10 (Counter)
    // Label 0x03
    GLYPH.SIGNAL, // Pulse
    GLYPH.SUB,
    0,
    1, // R0--
    GLYPH.JNZ,
    0,
    3, // If R0 != 0, jump back to signaling
    GLYPH.I,
  ],
};
```

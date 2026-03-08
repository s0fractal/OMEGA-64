/**
 * GENESIS_BOOT.ts
 * Axiomatic bytecode definitions for OMEGA-64 Stage 20.
 * These are the "First Programs" that define the core roles in native GlyphIR64.
 */

export const GLYPH = {
  // Core
  S: 0, K: 1, I: 2, Y: 3,
  // Control
  SET: 8, GET: 9, PUT: 10, ADD: 11, SUB: 12, JNZ: 13, JMP: 14, JZ: 15,
  // Transport
  REPLICATE: 16, SIGNAL: 17, SHARE: 18, BIND: 19, SPORE_DRIVE: 20, ENTANGLE: 21,
  // Structural
  PLUG: 24, TENSEGRITY: 25, BUILD: 26, SENSE: 27,
  // Catalytic
  COLLECTIVE: 32, ROLE: 33, RESOLVE: 34,
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
   * GUARDIAN (Role 1):
   * Focuses on PHEROMONE emission and stability.
   */
  "guardian_base": [
    GLYPH.SIGNAL, // Emit pheromone (Legacy OP_SIGNAL)
    GLYPH.I       // No-op return
  ],

  /**
   * ARCHITECT (Role 2):
   * Focuses on PLASMID emission and structural intent.
   */
  "architect_base": [
    GLYPH.COLLECTIVE, 7, 100, 200, // Mode 7 (PLASMID_EMIT), intensity=100, type=200
    GLYPH.I
  ],

  /**
   * REPLICATOR (Default / Shared):
   * Basic reproduction logic.
   */
  "replicator_base": [
    GLYPH.REPLICATE,
    GLYPH.I
  ],

  /**
   * COMPLEX_STABILITY:
   * A program demonstrating control flow via JNZ.
   */
  "stability_loop": [
    GLYPH.SET, 0, 10,   // R0 = 10 (Counter)
    // Label 0x03
    GLYPH.SIGNAL,       // Pulse
    GLYPH.SUB, 0, 1,    // R0--
    GLYPH.JNZ, 0, 3,    // If R0 != 0, jump back to signaling
    GLYPH.I
  ]
};

import { GRID_W, GRID_H , GRID_CELLS} from "../_/mod.ts";
// OMEGA-64 | MATRIX_ENGINE.ts | Era 68: Phase 13 — Crystalline Intelligence
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import {
  MEMORY_GRID_OFFSET
} from "/Users/s0fractal/OMEGA/src/_/mod.ts";

const TOTAL_CELLS = GRID_CELLS;

// Crystal type constants for logic gates
export const CRYSTAL_STANDARD = 1; // Default conducting crystal
export const CRYSTAL_THRESHOLD = 6; // Acts as a threshold gate (Inhibitory)
export const CRYSTAL_MEME = 10; // Memetic Node — stores regent genomic intent

export const MATRIX_ENGINE = {
  // Core tick is now handled by WASM tick_matrix() via PULSE_WORKER.
  // This JS fallback remains for non-WASM environments.
  tick: () => {
    const structure = STATE_MATRIX.structureGrid;
    const signal = STATE_MATRIX.signalGrid;
    const nextSignal = new Int32Array(TOTAL_CELLS);

    for (let cy = 0; cy < GRID_H; cy++) {
      for (let cx = 0; cx < GRID_W; cx++) {
        const i = cy * GRID_W + cx;
        const type = Atomics.load(structure, i);
        if (type === 0) continue;

        let currentRes = Atomics.load(signal, i);

        const neighbors = [
          (cy > 0) ? (cy - 1) * GRID_W + cx : -1,
          (cy < GRID_H - 1) ? (cy + 1) * GRID_W + cx : -1,
          (cx > 0) ? cy * GRID_W + (cx - 1) : -1,
          (cx < GRID_W - 1) ? cy * GRID_W + (cx + 1) : -1,
        ];

        for (const ni of neighbors) {
          if (ni === -1) continue;
          if (Atomics.load(structure, ni) > 0) {
            const neighborRes = Atomics.load(signal, ni);
            if (neighborRes > currentRes) {
              currentRes += Math.floor((neighborRes - currentRes) * 0.4);
            }
          }
        }

        if (type >= CRYSTAL_THRESHOLD) {
          if (currentRes < 200) currentRes = 0;
        }

        currentRes = Math.max(0, currentRes - 5);
        nextSignal[i] = currentRes;
      }
    }

    for (let i = 0; i < TOTAL_CELLS; i++) {
      Atomics.store(signal, i, nextSignal[i]);
    }
  },

  // Inject resonance signal at a world position
  inject: (x: number, y: number, amount: number) => {
    const cx = Math.floor(x / 10);
    const cy = Math.floor(y / 10);
    if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
      Atomics.add(STATE_MATRIX.signalGrid, cy * GRID_W + cx, amount);
    }
  },

  // Read signal at a world position
  read: (x: number, y: number): number => {
    const cx = Math.floor(x / 10);
    const cy = Math.floor(y / 10);
    if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
      return Atomics.load(STATE_MATRIX.signalGrid, cy * GRID_W + cx);
    }
    return 0;
  },

  // Set crystal type at world position
  setStructure: (x: number, y: number, type: number) => {
    const cx = Math.floor(x / 10);
    const cy = Math.floor(y / 10);
    if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
      Atomics.store(STATE_MATRIX.structureGrid, cy * GRID_W + cx, type);
    }
  },

  // === Phase 13: Memetic Nodes ===
  // Write an 8-byte regent genome "Meme" into the memoryGrid at world position.
  // Nearby atoms during mutation gain a bias toward this genome.
  establishMeme: (x: number, y: number, genomeBytes: BigInt64Array) => {
    const cx = Math.floor(x / 10);
    const cy = Math.floor(y / 10);
    if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
      const memeIdx = cy * GRID_W + cx;
      // Write genome into memoryGrid (8 bytes = 1 i64 slot)
      const memView = new BigInt64Array(
        STATE_MATRIX.buffer,
        MEMORY_GRID_OFFSET + memeIdx * 8,
        1,
      );
      memView[0] = genomeBytes[0];
      // Mark cell as Memetic Node
      Atomics.store(STATE_MATRIX.structureGrid, memeIdx, CRYSTAL_MEME);
      Atomics.store(STATE_MATRIX.signalGrid, memeIdx, 1000); // High initial resonance
    }
  },

  // Read the meme genome closest to a world position
  readMeme: (x: number, y: number): bigint => {
    const cx = Math.floor(x / 10);
    const cy = Math.floor(y / 10);
    if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
      const memeIdx = cy * GRID_W + cx;
      const memView = new BigInt64Array(
        STATE_MATRIX.buffer,
        MEMORY_GRID_OFFSET + memeIdx * 8,
        1,
      );
      return memView[0];
    }
    return 0n;
  },

  // Get total matrix resonance (global planetary signal strength)
  getTotalResonance: (): number => {
    let total = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      total += Atomics.load(STATE_MATRIX.signalGrid, i);
    }
    return total;
  },

  // Count active crystal cells
  getCrystalCount: (): number => {
    let count = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (Atomics.load(STATE_MATRIX.structureGrid, i) > 0) count++;
    }
    return count;
  },
};

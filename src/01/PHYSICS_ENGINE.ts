import { GRID_W, GRID_H , GRID_CELLS} from "../_/mod.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PRNG } from "../00/PRNG.ts";
import {
  ATTENTION_FIELD_OFFSET,
  SPATIAL_CELL_SIZE,
  WORLD_MAX_X,
  WORLD_MAX_Y
} from "/Users/s0fractal/OMEGA/src/_/mod.ts";


const envBuffer = new SharedArrayBuffer(GRID_CELLS * 4); // Int32
const NUTRIENTS = new Int32Array(envBuffer);

const ATTENTION_PHEROMONES = STATE_MATRIX.attentionField;

export const PHYSICS_ENGINE = {
  envBuffer,
  NUTRIENTS,
  attentionBuffer: STATE_MATRIX.buffer,
  attentionOffset: ATTENTION_FIELD_OFFSET,
  ATTENTION_PHEROMONES,
  // Spatial Memory
  pheromones: {
    "WORKER": new Float32Array(GRID_CELLS),
    "GUARDIAN": new Float32Array(GRID_CELLS),
    "NUCLEUS": new Float32Array(GRID_CELLS),
    "PARASITE": new Float32Array(GRID_CELLS),
  },

  getGridIdx: (x: number, y: number) => {
    const gx = Math.floor(Math.max(0, Math.min(WORLD_MAX_X, x)) / SPATIAL_CELL_SIZE);
    const gy = Math.floor(Math.max(0, Math.min(WORLD_MAX_Y, y)) / SPATIAL_CELL_SIZE);
    return gy * GRID_W + gx;
  },

  seedNutrients: (seed: number) => {
    const prng = new PRNG(seed);
    let current = prng;
    // Uniform or scattered distribution of initial energy
    for (let i = 0; i < NUTRIENTS.length; i++) {
      const { value, next } = current.next();
      Atomics.store(NUTRIENTS, i, Math.floor(value * 500) + 100);
      current = next;
    }
  },

  decayPheromones: (pheroGrid?: Int32Array) => {
    for (const caste in PHYSICS_ENGINE.pheromones) {
      const p = PHYSICS_ENGINE
        .pheromones[caste as keyof typeof PHYSICS_ENGINE.pheromones];
      for (let i = 0; i < p.length; i++) {
        p[i] *= 0.95;
      }
    }

    // --- ERA 50: Persistent Pheromone Decay ---
    if (pheroGrid) {
      for (let i = 0; i < GRID_CELLS; i++) {
        const cell = Atomics.load(pheroGrid, i);
        if (cell === 0) continue;
        const intensity = (cell >> 8) & 0xFFFFFF;
        const type = cell & 0xFF;
        if (intensity > 10) {
          Atomics.store(pheroGrid, i, ((intensity - 5) << 8) | type);
        } else {
          Atomics.store(pheroGrid, i, 0);
        }
      }
    }

    for (let i = 0; i < ATTENTION_PHEROMONES.length; i++) {
      ATTENTION_PHEROMONES[i] *= 0.90; // Attention decays relatively fast
    }
  },

  diffuseViralSemantics: (viralGrid: Uint8Array, pulseId: number) => {
    const prng = new PRNG(pulseId);
    let current = prng;

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const idx = (y * GRID_W + x) * 9;
        const intensity = Atomics.load(viralGrid, idx + 8);
        if (intensity === 0) continue;

        // 1. DECAY
        Atomics.store(viralGrid, idx + 8, Math.max(0, intensity - 2));

        // 2. DIFFUSE (Deterministic chance to spread logic to neighbors)
        const { value: v1, next: n1 } = current.next();
        current = n1;

        if (intensity > 150 && v1 < 0.1) {
          const { value: v2, next: n2 } = current.next();
          const { value: v3, next: n3 } = current.next();
          current = n3;

          const nx = x + (v2 > 0.5 ? 1 : -1);
          const ny = y + (v3 > 0.5 ? 1 : -1);
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            const nIdx = (ny * GRID_W + nx) * 9;
            const nIntensity = Atomics.load(viralGrid, nIdx + 8);
            if (nIntensity < intensity / 2) {
              // Copy logic and part of intensity
              for (let b = 0; b < 8; b++) {
                Atomics.store(
                  viralGrid,
                  nIdx + b,
                  Atomics.load(viralGrid, idx + b),
                );
              }
              Atomics.store(viralGrid, nIdx + 8, Math.floor(intensity / 2));
            }
          }
        }
      }
    }
  },

  // Calculate velocity from Logic (Genome)
  getGenomeVelocity: (logic: string) => {
    let velX = 0;
    let velY = 0;
    for (let i = 0; i < 4; i++) {
      const charX = parseInt(logic[i], 16);
      velX += (charX > 7 ? charX - 7 : charX - 8) * 3;
      const charY = parseInt(logic[i + 4], 16);
      velY += (charY > 7 ? charY - 7 : charY - 8) * 3;
    }
    return { velX, velY };
  },
};

import { GRID_W, GRID_H , GRID_CELLS} from "../00/OFFSETS.ts";
import { STATE_MATRIX } from "@00";
import { PRNG } from "@00";
import { SPATIAL_HASH } from "@01/SPATIAL_HASH.ts";
import * as OFFSETS from "@00";


const envBuffer = new SharedArrayBuffer(GRID_CELLS * 4); // Int32
const NUTRIENTS = new Int32Array(envBuffer);

const ATTENTION_PHEROMONES = STATE_MATRIX.attentionField;

export const PHYSICS_ENGINE = {
  envBuffer,
  NUTRIENTS,
  attentionBuffer: STATE_MATRIX.buffer,
  attentionOffset: OFFSETS.ATTENTION_FIELD_OFFSET,
  ATTENTION_PHEROMONES,
  // Spatial Memory
  pheromones: {
    "WORKER": new Float32Array(GRID_CELLS),
    "GUARDIAN": new Float32Array(GRID_CELLS),
    "NUCLEUS": new Float32Array(GRID_CELLS),
    "PARASITE": new Float32Array(GRID_CELLS),
  },

  getGridIdx: (x: number, y: number) => {
    const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
    const gy = Math.floor(Math.max(0, Math.min(799, y)) / 10);
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

  // Chemotaxis: Move towards energy/caste gradients
  calculateTrophism: (
    x: number,
    y: number,
    role: number,
    targetIdx: number,
    structureGrid?: Int32Array,
  ) => {
    let trophX = 0;
    let trophY = 0;
    const detectionRadius = 250;

    // --- ERA 69: SPATIAL HASH QUERY ---
    const nearbyIndices = SPATIAL_HASH.queryRadius(x, y, detectionRadius);

    for (const idx of nearbyIndices) {
      if (idx === targetIdx) continue;

      const oX = STATE_MATRIX.getX(idx);
      const oY = STATE_MATRIX.getY(idx);
      const oEnergy = STATE_MATRIX.getEnergy(idx);
      const oRes = STATE_MATRIX.getResonance(idx);
      const oRole = STATE_MATRIX.getRole(idx);

      const dx = oX - x;
      const dy = oY - y;
      const d = Math.hypot(dx, dy) || 1;

      let multiplier = 1.0;
      // GUARDIANS are attracted to high resonance (enemies/targets)
      if (role === STATE_MATRIX.ROLE_GUARDIAN && oRes > 50) multiplier = 3.0;
      // PRODUCERS are attracted to energy
      if (role === STATE_MATRIX.ROLE_PRODUCER && oEnergy < 50) multiplier = 2.0;

      const force = (oEnergy / 100) *
        ((detectionRadius - d) / detectionRadius) * (2.0 * multiplier);
      trophX += (dx / d) * force;
      trophY += (dy / d) * force;
    }

    // Architects seek low density structure areas to build
    if (role === STATE_MATRIX.ROLE_ARCHITECT && structureGrid) {
      for (const [ox, oy] of [[0, -20], [0, 20], [-20, 0], [20, 0]]) {
        const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
        const cell = Atomics.load(structureGrid, sIdx);
        const density = (cell >> 8) & 0xFF;
        // Strong attraction to low density
        const force = (255 - density) / 50;
        trophX += (ox / 20) * force;
        trophY += (oy / 20) * force;
      }
    }

    // Pheromone Gradient Descent
    const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
    // Producers (Workers) seek Nucleus; Guardians seek Parasites/Targets
    const targetScent = (role === STATE_MATRIX.ROLE_GUARDIAN)
      ? "PARASITE"
      : (role === STATE_MATRIX.ROLE_PRODUCER ? "NUCLEUS" : null);
    if (targetScent) {
      for (const [ox, oy] of checkPoints) {
        const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
        const intensity = PHYSICS_ENGINE
          .pheromones[targetScent as keyof typeof PHYSICS_ENGINE.pheromones][
            sIdx
          ] || 0;
        trophX += (ox / 20) * intensity * 2.0;
        trophY += (oy / 20) * intensity * 2.0;
      }
    }

    return { trophX, trophY };
  },

  // Apply Hooke's Law (Elastic) or Rigid Constraints (Era 28)
  applyBondSprings: (
    idx: number,
    x: number,
    y: number,
    bondIndices: Uint32Array,
    xs: Int16Array,
    ys: Int16Array,
    stiffs: Float32Array,
    dists: Uint8Array,
    damping: number = 0,
  ) => {
    let fx = 0;
    let fy = 0;

    for (let b = 0; b < 4; b++) {
      const bIdx = bondIndices[b];
      if (bIdx === 0) continue;

      let targetDist = dists[idx * 4 + b];
      if (targetDist === 0) targetDist = 50; // Default

      const stiffness = stiffs[idx * 4 + b];
      const pX = xs[bIdx];
      const pY = ys[bIdx];
      const dx = pX - x;
      const dy = pY - y;
      const dist = Math.hypot(dx, dy) || 1;

      if (stiffness > 0.8) {
        // ERA 28: Rigid Locking
        // Much stronger force with minimal dampening to hold distance
        const force = (dist - targetDist) * 1.5;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      } else {
        // Legacy: Elastic/Swarm bonding
        const elasticRange = 10;
        if (dist > targetDist + elasticRange) {
          const force = (dist - (targetDist + elasticRange)) * 0.1;
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        } else if (dist < targetDist - elasticRange) {
          const force = ((targetDist - elasticRange) - dist) * 0.2;
          fx -= (dx / dist) * force;
          fy -= (dy / dist) * force;
        }
      }
    }

    // Apply Damping (Crystallization)
    // If damping is high (e.g. 255), force is negated.
    if (damping > 0) {
      const dampingFactor = Math.max(0, 1 - (damping / 255));
      fx *= dampingFactor;
      fy *= dampingFactor;
    }

    return { fx, fy };
  },

  /**
   * ERA 34: Structural Decay & Memory Leaking
   * Decays structureGrid density and leaks memoryGrid into viralGrid.
   */
  decayStructures: (
    structureGrid: Int32Array,
    memoryGrid: Uint8Array,
    viralGrid: Uint8Array,
  ) => {
        
    for (let i = 0; i < GRID_CELLS; i++) {
      const cell = Atomics.load(structureGrid, i);
      let density = (cell >> 8) & 0xFF;
      const type = cell & 0xFF;

      if (density > 0) {
        density = Math.max(0, density - 1);
        Atomics.store(structureGrid, i, (density << 8) | type);

        if (density > 0 && density < 50) {
          const gridIdx = i * 9;
          for (let b = 0; b < 8; b++) {
            const logicByte = memoryGrid[i * 8 + b];
            if (logicByte !== 0) {
              Atomics.store(viralGrid, gridIdx + b, logicByte);
            }
          }
          Atomics.store(viralGrid, gridIdx + 8, Math.min(255, 50 - density));
        }

        if (density === 0) {
          for (let b = 0; b < 8; b++) memoryGrid[i * 8 + b] = 0;
        }
      }
    }
  },

  applyTrophicFlow: () => {
    const detectionRadius = 15;
    for (let i = 0; i < 1000; i++) {
      const id = STATE_MATRIX.getId(i);
      if (id === 0n) continue;

      const role = STATE_MATRIX.getRole(i);
      const x = STATE_MATRIX.getX(i);
      const y = STATE_MATRIX.getY(i);

      const nearby = SPATIAL_HASH.queryRadius(x, y, detectionRadius);
      for (const otherIdx of nearby) {
        if (otherIdx === i) continue;

        const otherRole = STATE_MATRIX.getRole(otherIdx);

        if (
          role === STATE_MATRIX.ROLE_PRODUCER &&
          otherRole === STATE_MATRIX.ROLE_NEUTRAL
        ) {
          const flow = 0.2;
          const energy = STATE_MATRIX.getEnergy(i);
          if (energy > 100) {
            STATE_MATRIX.setEnergy(i, energy - flow);
            STATE_MATRIX.setEnergy(
              otherIdx,
              STATE_MATRIX.getEnergy(otherIdx) + flow,
            );
          }
        }

        if (
          role === STATE_MATRIX.ROLE_GUARDIAN &&
          otherRole === STATE_MATRIX.ROLE_PARASITE
        ) {
          const burn = 1.0;
          const oEnergy = STATE_MATRIX.getEnergy(otherIdx);
          if (oEnergy > 0) {
            STATE_MATRIX.setEnergy(otherIdx, Math.max(0, oEnergy - burn));
            STATE_MATRIX.setResonance(
              i,
              Math.min(1000, STATE_MATRIX.getResonance(i) + 5),
            );
          }
        }
      }
    }
  },
};

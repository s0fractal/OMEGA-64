import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PRNG } from "./PRNG.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

const GRID_W = 70;
const GRID_H = 40;

const envBuffer = new SharedArrayBuffer(GRID_W * GRID_H * 4); // Int32
const NUTRIENTS = new Int32Array(envBuffer);

const attentionBuffer = new SharedArrayBuffer(GRID_W * GRID_H * 4); // Float32
const ATTENTION_PHEROMONES = new Float32Array(attentionBuffer);

export const PHYSICS_ENGINE = {
    envBuffer,
    NUTRIENTS,
    attentionBuffer,
    ATTENTION_PHEROMONES,
    // Spatial Memory
    pheromones: {
        "WORKER": new Float32Array(GRID_W * GRID_H),
        "GUARDIAN": new Float32Array(GRID_W * GRID_H),
        "NUCLEUS": new Float32Array(GRID_W * GRID_H),
        "PARASITE": new Float32Array(GRID_W * GRID_H)
    },

    getGridIdx: (x: number, y: number) => {
        const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 20);
        const gy = Math.floor(Math.max(0, Math.min(799, y)) / 20);
        return gy * GRID_W + gx;
    },

    seedNutrients: () => {
        // Uniform or scattered distribution of initial energy
        for (let i = 0; i < NUTRIENTS.length; i++) {
            Atomics.store(NUTRIENTS, i, Math.floor(Math.random() * 500) + 100);
        }
    },

    decayPheromones: () => {
        for (const caste in PHYSICS_ENGINE.pheromones) {
            const p = PHYSICS_ENGINE.pheromones[caste as keyof typeof PHYSICS_ENGINE.pheromones];
            for (let i = 0; i < p.length; i++) {
                p[i] *= 0.95;
            }
        }
        
        for (let i = 0; i < ATTENTION_PHEROMONES.length; i++) {
            ATTENTION_PHEROMONES[i] *= 0.90; // Attention decays relatively fast
        }
    },

    diffuseViralSemantics: (viralGrid: Uint8Array) => {
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const idx = (y * GRID_W + x) * 9;
                const intensity = Atomics.load(viralGrid, idx + 8);
                if (intensity === 0) continue;

                // 1. DECAY
                Atomics.store(viralGrid, idx + 8, Math.max(0, intensity - 2));

                // 2. DIFFUSE (Random chance to spread logic to neighbors)
                if (intensity > 150 && Math.random() < 0.1) {
                    const nx = x + (Math.random() > 0.5 ? 1 : -1);
                    const ny = y + (Math.random() > 0.5 ? 1 : -1);
                    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                        const nIdx = (ny * GRID_W + nx) * 9;
                        const nIntensity = Atomics.load(viralGrid, nIdx + 8);
                        if (nIntensity < intensity / 2) {
                            // Copy logic and part of intensity
                            for (let b = 0; b < 8; b++) {
                                Atomics.store(viralGrid, nIdx + b, Atomics.load(viralGrid, idx + b));
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
        caste: string, 
        targetIdx: number
    ) => {
        let trophX = 0;
        let trophY = 0;
        const detectionRadius = 250;

        // --- ERA 8: SPATIAL HASH QUERY ---
        const nearbyIndices = SPATIAL_HASH.queryRadius(x, y, detectionRadius);

        for (const idx of nearbyIndices) {
            if (idx === targetIdx) continue;
            
            const oX = STATE_MATRIX.getX(idx);
            const oY = STATE_MATRIX.getY(idx);
            const oEnergy = STATE_MATRIX.getEnergy(idx);
            const oRes = STATE_MATRIX.getResonance(idx);
            
            const dx = oX - x;
            const dy = oY - y;
            const d = Math.hypot(dx, dy) || 1;
            
            let multiplier = 1.0;
            if (caste === "GUARDIAN" && oRes > 50) multiplier = 3.0;
            if (caste === "WORKER" && oEnergy < 50) multiplier = 2.0;

            const force = (oEnergy / 100) * ((detectionRadius - d) / detectionRadius) * (2.0 * multiplier);
            trophX += (dx / d) * force;
            trophY += (dy / d) * force;
        }

        // Pheromone Gradient Descent
        const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
        const targetScent = (caste === "GUARDIAN") ? "PARASITE" : (caste === "WORKER" ? "NUCLEUS" : null);
        if (targetScent) {
            for (const [ox, oy] of checkPoints) {
                const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
                const intensity = PHYSICS_ENGINE.pheromones[targetScent as keyof typeof PHYSICS_ENGINE.pheromones][sIdx] || 0;
                trophX += (ox / 20) * intensity * 2.0;
                trophY += (oy / 20) * intensity * 2.0;
            }
        }

        return { trophX, trophY };
    },

    // Apply Hooke's Law for molecular bonds
    applyBondSprings: (x: number, y: number, bondIndices: Uint32Array) => {
        let fx = 0;
        let fy = 0;
        for (const bIdx of bondIndices) {
            if (STATE_MATRIX.getId(bIdx) === 0n) continue;
            const pX = STATE_MATRIX.getX(bIdx);
            const pY = STATE_MATRIX.getY(bIdx);
            const dx = pX - x;
            const dy = pY - y;
            const dist = Math.hypot(dx, dy) || 1;
            
            if (dist > 60) {
                const force = (dist - 60) * 0.1;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            } else if (dist < 40) {
                const force = (40 - dist) * 0.2;
                fx -= (dx / dist) * force;
                fy -= (dy / dist) * force;
            }
        }
        return { fx, fy };
    }
};

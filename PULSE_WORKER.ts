// OMEGA-64 | PULSE_WORKER.ts | The Parallel Mind
// Process a range of atoms using SharedArrayBuffer and LAMBDA_VM.

/// <reference lib="deno.worker" />

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";

const GOD_ATOM_INDEX = 0;
const MAX_ATOMS = 100000;

self.onmessage = async (e) => {
    const { buffer, startIdx, endIdx, mods, tick } = e.data;
    
    // SoA Views
    const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
    const xs = new Int16Array(buffer, MAX_ATOMS * 8, MAX_ATOMS);
    const ys = new Int16Array(buffer, MAX_ATOMS * 8 + MAX_ATOMS * 2, MAX_ATOMS);
    const energies = new Float32Array(buffer, MAX_ATOMS * 12, MAX_ATOMS);
    const resonances = new Float32Array(buffer, MAX_ATOMS * 12 + MAX_ATOMS * 4, MAX_ATOMS);
    const bonds = new Uint32Array(buffer, MAX_ATOMS * 12 + MAX_ATOMS * 8, MAX_ATOMS * 4);
    const logic = new Uint8Array(buffer, MAX_ATOMS * 20 + MAX_ATOMS * 4, MAX_ATOMS * 8);

    for (let i = startIdx; i < endIdx; i++) {
        if (ids[i] === 0n) continue;

        let x = xs[i], y = ys[i], energy = energies[i], resonance = resonances[i];
        const logicBytes = logic.subarray(i * 8, i * 8 + 8);
        const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');

        // Core metabolism
        energy -= 0.05 * mods.decay;
        
        // Physics
        const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
        x += velX * mods.speed;
        y += velY * mods.speed;

        // God-Atom immortality
        if (i === GOD_ATOM_INDEX) {
            energy = 1000;
            resonance = 500;
        } else {
            // Count active bonds (Byte 0 comparison)
            let bondCount = 0;
            for (let b = 0; b < 4; b++) if (bonds[i * 4 + b] !== 0) bondCount++;

            const vmResult = LAMBDA_VM.execute(logicBytes, { energy, resonance, bonds: bondCount });
            energy += vmResult.energyDelta;
            resonance += vmResult.resonanceDelta;
            
            // Handle simple intents directly in worker for speed
            for (const intent of vmResult.intent) {
                if (intent.level === 4) { // MOVEMENT_BOOST
                    x += intent.value.dx;
                    y += intent.value.dy;
                }
            }
        }

        // Boundaries
        x = Math.max(50, Math.min(1350, x));
        y = Math.max(50, Math.min(750, y));

        // Use Atomics for shared consistency (though we assume exclusive ranges)
        Atomics.store(xs, i, x);
        Atomics.store(ys, i, y);
        // Float32 doesn't support Atomics.store, but since we have exclusive ranges, we raw write
        energies[i] = energy;
        resonances[i] = resonance;
        
        // Death check
        if (energy <= 0 && i !== GOD_ATOM_INDEX) {
            ids[i] = 0n;
        }
    }

    self.postMessage({ done: true });
};

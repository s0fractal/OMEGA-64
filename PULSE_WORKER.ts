// OMEGA-64 | PULSE_WORKER.ts | The Living Mind (Era 17)
// Process a range of atoms using SharedArrayBuffer, Fixed-Point Atomics, and VM Context.

/// <reference lib="deno.worker" />

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";
import { PRNG } from "./PRNG.ts";


const MAX_ATOMS = 100000;
const SCALE = 1000;
const DIVINITY_THRESHOLD = 800;

self.onmessage = (e) => {
    const { buffer, envBuffer, attentionBuffer, marketBuffer, evolutionRequestsBuffer, viralGridBuffer, immuneBuffer, messageBufferA, messageBufferB, bondStiffnessBuffer, startIdx, endIdx, mods, pulseId } = e.data;
    
    // SoA Views (Era 18: Emergent Avatar & Prediction Market)
    const nutrients = new Int32Array(envBuffer);
    const attention = new Float32Array(attentionBuffer);
    const market = new Float32Array(marketBuffer); // ERA 18: Prediction Market
    const evolutionRequests = new Uint8Array(evolutionRequestsBuffer); // ERA 18: Evolution Requests
    const viralGrid = new Uint8Array(viralGridBuffer); // ERA 24: Viral Grid
    const quarantineFlags = new Uint8Array(immuneBuffer); // ERA 26: Quarantine Flags
    const msgsA = new Uint8Array(messageBufferA); // ERA 27: Messaging
    const msgsB = new Uint8Array(messageBufferB); // ERA 27: Messaging
    const bondStiffs = new Float32Array(bondStiffnessBuffer); // ERA 28: Structural Morphogenesis

    // Buffer swap for determinism is handled by PULSE.ts by choosing which is read/write

    // worker receives write/read pointers explicitly or pulseId can be used
    const isAEven = pulseId % 2 === 0;
    const readBuffer = isAEven ? msgsB : msgsA; // Read from previous pulse's write
    const writeBuffer = isAEven ? msgsA : msgsB; // Write for next pulse

    const marketPool = new Int32Array(marketBuffer, 4, 1);

    const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
    const xs = new Int16Array(buffer, (MAX_ATOMS * 8), MAX_ATOMS);
    const ys = new Int16Array(buffer, (MAX_ATOMS * 8) + (MAX_ATOMS * 2), MAX_ATOMS);
    const energies = new Int32Array(buffer, (MAX_ATOMS * 12), MAX_ATOMS);
    const resonances = new Int32Array(buffer, (MAX_ATOMS * 12) + (MAX_ATOMS * 4), MAX_ATOMS);
    const logic = new Uint8Array(buffer, (MAX_ATOMS * 24), MAX_ATOMS * 8); 
    const bonds = new Uint32Array(buffer, (MAX_ATOMS * 32), MAX_ATOMS * 4);
    const instructions = new Uint32Array(buffer, (MAX_ATOMS * 32) + (MAX_ATOMS * 16), MAX_ATOMS * 16);
    const contexts = new Uint8Array(buffer, (MAX_ATOMS * 48) + (MAX_ATOMS * 64), MAX_ATOMS * 32);


    for (let i = startIdx; i < endIdx; i++) {
        const currentId = Atomics.load(ids, i);
        if (currentId === 0n) continue;

        let x = Atomics.load(xs, i);
        let y = Atomics.load(ys, i);
        const energyFactor = Atomics.load(energies, i);
        const resonanceFactor = Atomics.load(resonances, i);
        
        let energy = energyFactor / SCALE;
        let resonance = resonanceFactor / SCALE;

        const logicBytes = logic.subarray(i * 8, i * 8 + 8);
        const codeBlock = instructions.subarray(i * 16, i * 16 + 16);
        const context = contexts.subarray(i * 32, i * 32 + 32);

        const isDivine = resonance > DIVINITY_THRESHOLD;
        energy -= isDivine ? 0 : 0.05 * mods.decay;

        // Physics & DNA Logic
        const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
        
        let dx = velX * mods.speed;
        let dy = velY * mods.speed;

        // --- ERA 18: ATTENTION TROPISM (Emergent Avatar) ---
        // Atom reads its first DNA byte to determine its relationship with "Attention"
        const attentionAffinity = (logicBytes[0] - 128) / 128; // -1.0 to 1.0 (Love to Hate)

        const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 20);
        const gy = Math.floor(Math.max(0, Math.min(799, y)) / 20);
        
        // Gradient Descent/Ascent on Attention Pheromone Field
        if (attentionAffinity !== 0) {
            let tropX = 0; let tropY = 0;
            const checkpoints = [[0, -1], [0, 1], [-1, 0], [1, 0]];
            for (const [oX, oY] of checkpoints) {
                const nx = Math.max(0, Math.min(69, gx + oX));
                const ny = Math.max(0, Math.min(39, gy + oY));
                const intensity = attention[ny * 70 + nx] || 0;
                tropX += oX * intensity;
                tropY += oY * intensity;
            }
            // Normalize and scale by affinity
            const mag = Math.hypot(tropX, tropY) || 1;
            dy += (tropY / mag) * attentionAffinity * 2.0;
        }

        const bondView = bonds.subarray(i * 4, i * 4 + 4);

        // --- ERA 28: Bond Constraints ---
        const { fx, fy } = PHYSICS_ENGINE.applyBondSprings(i, x, y, bondView);
        dx += fx;
        dy += fy;

        x += Math.round(dx);
        y += Math.round(dy);

        // VM EXECUTION (L6: Contextual ISA)
        const qLevel = Atomics.load(quarantineFlags, i);
        const incomingSignal = Atomics.load(readBuffer, i);
        const vmResult = LAMBDA_VM.execute(logicBytes, codeBlock, context, { x, y, nutrients, marketPool, energy, resonance, bonds: bondView, quarantineLevel: qLevel, incomingMessage: incomingSignal });
        
        energy += vmResult.energyDelta;
        resonance += vmResult.resonanceDelta;

        if (vmResult.modifiedCode) {
            Atomics.store(instructions, i * 16 + vmResult.modifiedCode.slot, vmResult.modifiedCode.value);
        }

        if (vmResult.modifiedStiffness) {
            bondStiffs[i * 4 + vmResult.modifiedStiffness.slot] = vmResult.modifiedStiffness.value;
        }

        // ERA 27: Message Routing + ERA 29: Hebbian Potentiation
        for (const msg of vmResult.outgoingMessages) {
            if (msg.targetIdx > 0 && msg.targetIdx < MAX_ATOMS) {
                // Determine if we should use writeBuffer[msg.targetIdx] directly
                // Using atomic store to the SHARED write buffer
                Atomics.store(writeBuffer, msg.targetIdx, msg.message & 0xFF);

                // ERA 29: Hebbian Potentiation - "Fire together, wire together"
                if (msg.sourceBondSlot !== undefined) {
                    const currentStiff = bondStiffs[i * 4 + msg.sourceBondSlot];
                    bondStiffs[i * 4 + msg.sourceBondSlot] = Math.min(1.0, currentStiff + 0.05);
                }
            }
        }

        // ERA 28: Structural Morphogenesis - Energy Balancing (Multicellular metabolism)
        // ERA 29: Conductive Metabolism (Scaling by stiffness)
        for (let b = 0; b < 4; b++) {
            const stiffness = bondStiffs[i * 4 + b];
            const targetIdx = bondView[b];

            // ERA 29: Synaptic Atrophy (Slow decay)
            if (stiffness > 0) {
                bondStiffs[i * 4 + b] = Math.max(0, stiffness - 0.001);
            }

            if (stiffness > 0.1 && targetIdx > 0 && targetIdx < MAX_ATOMS) {
                const targetEnergy = Atomics.load(energies, targetIdx) / SCALE;
                // Average the energy (Scaled by stiffness = Conductivity)
                const diff = (targetEnergy - energy) * (stiffness * 0.5); 
                energy += diff;
                Atomics.store(energies, targetIdx, Math.round((targetEnergy - diff) * SCALE));
            }
        }
            
        for (const intent of vmResult.intent) {

            if (intent.level === 4) { x += Math.round(intent.value.dx); y += Math.round(intent.value.dy); }
            if (intent.level === 5 && intent.value === "EVOLUTION_REQUEST") {
                Atomics.store(evolutionRequests, i, 1);
            }
        }

        // ERA 24: Horizontal Gene Transfer (Viral Semantics)
        if (gx >= 0 && gx < 70 && gy >= 0 && gy < 40) {
            const gridIdx = (gy * 70 + gx) * 9;
            
            // 1. BROADCAST: Resonant atoms leak logic into grid
            if (resonance > 150 && (pulseId + i) % 10 === 0) {
                const currentIntensity = Atomics.load(viralGrid, gridIdx + 8);
                // Only overwrite if we are reasonably resonant
                if (resonance / 5 > currentIntensity) {
                    for (let b = 0; b < 8; b++) {
                        Atomics.store(viralGrid, gridIdx + b, Atomics.load(logic, i * 8 + b));
                    }
                    Atomics.store(viralGrid, gridIdx + 8, Math.min(255, Math.floor(resonance / 4)));
                } else {
                    // Reinforce existing logic if it matches
                    if (Atomics.load(viralGrid, gridIdx) === Atomics.load(logic, i * 8)) {
                        Atomics.add(viralGrid, gridIdx + 8, 5);
                    }
                }
            }

            // 2. INFECT: Atoms absorb logic from grid
            if (resonance < 400 && (pulseId + i) % 50 === 0) {
                const intensity = Atomics.load(viralGrid, gridIdx + 8);
                if (intensity > 50) {
                    const headByte = Atomics.load(viralGrid, gridIdx);
                    if (headByte !== 0 && headByte !== Atomics.load(logic, i * 8)) {
                        // Infection chance proportional to intensity
                        const atomPrng = new PRNG(PRNG.seedFrom(pulseId, currentId.toString()));
                        const { value: v1, next: n1 } = atomPrng.next();
                        const { value: v2 } = n1.next();

                        if (v1 * 255 < intensity) {
                            const randByte = Math.floor(v2 * 8);
                            const sourceByte = Atomics.load(viralGrid, gridIdx + randByte);
                            Atomics.store(logic, i * 8 + randByte, sourceByte);
                            energy -= 5; 
                        }
                    }
                }
            }

        }

        // Boundaries
        x = Math.max(50, Math.min(1350, x));
        y = Math.max(50, Math.min(750, y));

        if (Atomics.load(ids, i) !== currentId) continue; 

        Atomics.store(xs, i, x);
        Atomics.store(ys, i, y);
        Atomics.store(energies, i, Math.round(energy * SCALE));
        Atomics.store(resonances, i, Math.round(resonance * SCALE));
        
        if (energy <= 0 && !isDivine) {
            // NECROSIS: Decompose and return to environment
            const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 20);
            const gy = Math.floor(Math.max(0, Math.min(799, y)) / 20);
            const gridIdx = gy * 70 + gx;
            
            const decomposition = Math.floor(resonance * 10) + 50; 
            Atomics.add(nutrients, gridIdx, decomposition);

            Atomics.store(ids, i, 0n);
        }
    }

    self.postMessage({ done: true, pulseId });
};

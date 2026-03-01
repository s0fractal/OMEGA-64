// OMEGA-64 | PULSE_WORKER.ts | The Living Mind (Era 17)
// Process a range of atoms using SharedArrayBuffer, Fixed-Point Atomics, and VM Context.

/// <reference lib="deno.worker" />

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";
import { PRNG } from "./PRNG.ts";

const MAX_ATOMS = 100000;
const SCALE = 1000;
const DIVINITY_THRESHOLD = 800;

// ERA 40: Wasm Fast Path Initialization
let wasmExports: any = null;
try {
    const wasmCode = await Deno.readFile(new URL("./omega_wasm_asc/build/lambda_vm.wasm", import.meta.url));
    const wasmModule = await WebAssembly.instantiate(wasmCode, {
        env: {
            memory: new WebAssembly.Memory({ initial: 1 }),
            abort: () => console.error("Wasm aborted.")
        }
    });
    wasmExports = wasmModule.instance.exports;
    console.log("   [WORKER] Wasm LambdaVM kernel ready. ⚡🕸️");
} catch (e) {
    console.error("   [WORKER] Wasm LambdaVM failed to load. Falling back to TS.", e);
}

self.onmessage = (e) => {
    const { buffer, envBuffer, attentionBuffer, marketBuffer, evolutionRequestsBuffer, spawnRequestsBuffer, viralGridBuffer, immuneBuffer, messageBufferA, messageBufferB, senderSignatureBufferA, senderSignatureBufferB, bondStiffnessBuffer, synapticStackBuffer, structureGridBuffer, memoryGridBuffer, roleRegistryBuffer, semanticBonusesBuffer, trustedSignatures, startIdx, endIdx, mods, pulseId } = e.data;
    
    // SoA Views (Era 18: Emergent Avatar & Prediction Market)
    const nutrients = new Int32Array(envBuffer);
    const attention = new Float32Array(attentionBuffer);
    const market = new Float32Array(marketBuffer); // ERA 18: Prediction Market
    const evolutionRequests = new Uint8Array(evolutionRequestsBuffer); // ERA 18: Evolution Requests
    const spawnRequests = new Uint8Array(spawnRequestsBuffer); // ERA 41: Mitosis Requests
    const viralGrid = new Uint8Array(viralGridBuffer); // ERA 24: Viral Grid
    const quarantineFlags = new Uint8Array(immuneBuffer); // ERA 26: Quarantine Flags
    const msgsA = new Uint8Array(messageBufferA); // ERA 27: Messaging
    const msgsB = new Uint8Array(messageBufferB); // ERA 27: Messaging
    const bondStiffs = new Float32Array(bondStiffnessBuffer); // ERA 28: Structural Morphogenesis
    const synapticStack = new Int32Array(synapticStackBuffer); // ERA 30: Distributed Cognition
    const structureGrid = new Int32Array(structureGridBuffer); // ERA 31: Architectural Stigmergy
    const memoryGrid = new Uint8Array(memoryGridBuffer); // ERA 32: Coded Memetics
    const roles = new Uint8Array(roleRegistryBuffer); // ERA 33: Metabolic Specialization
    const semanticBonuses = new Uint8Array(semanticBonusesBuffer); // ERA 36: Cognitive Scaffolding
    const senderSignaturesA = new Uint8Array(senderSignatureBufferA); // ERA 38: Sender Signatures
    const senderSignaturesB = new Uint8Array(senderSignatureBufferB); // ERA 38: Sender Signatures

    const trustedSet = new Set<string>(trustedSignatures || []);

    // Buffer swap for determinism is handled by PULSE.ts by choosing which is read/write

    // worker receives write/read pointers explicitly or pulseId can be used
    const isAEven = pulseId % 2 === 0;
    const readBuffer = isAEven ? msgsB : msgsA; // Read from previous pulse's write
    const writeBuffer = isAEven ? msgsA : msgsB; // Write for next pulse
    const readSignatures = isAEven ? senderSignaturesB : senderSignaturesA;
    const writeSignatures = isAEven ? senderSignaturesA : senderSignaturesB;

    const marketPool = new Int32Array(marketBuffer, 4, 1);

    const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
    const xs = new Int16Array(buffer, (MAX_ATOMS * 8), MAX_ATOMS);
    const ys = new Int16Array(buffer, (MAX_ATOMS * 8) + (MAX_ATOMS * 2), MAX_ATOMS);
    const energies = new Int32Array(buffer, (MAX_ATOMS * 12), MAX_ATOMS);
    const resonances = new Int32Array(buffer, (MAX_ATOMS * 12) + (MAX_ATOMS * 4), MAX_ATOMS);
    const logic = new Uint8Array(buffer, (MAX_ATOMS * 24), MAX_ATOMS * 8); 
    const bonds = new Uint32Array(buffer, (MAX_ATOMS * 32), MAX_ATOMS * 4);
    const instructions = new Uint32Array(buffer, (MAX_ATOMS * 32) + (MAX_ATOMS * 16), MAX_ATOMS * 16);
    
    const CONTEXT_OFFSET = (MAX_ATOMS * 48) + (MAX_ATOMS * 64);
    const contexts = new Uint8Array(buffer, CONTEXT_OFFSET, MAX_ATOMS * 32);


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
        
        // --- ERA 35: Stigmergic Shelter ---
        // Atoms near structures (density > 50) receive a survival bonus
        const gx_init = Math.floor(Math.max(0, Math.min(1399, x)) / 20);
        const gy_init = Math.floor(Math.max(0, Math.min(799, y)) / 20);
        const currentStructureCell = Atomics.load(structureGrid, gy_init * 70 + gx_init);
        const currentDensity = (currentStructureCell >> 8) & 0xFF;
        const shelterBonus = currentDensity > 50 ? 0.8 : 1.0;

        energy -= isDivine ? 0 : (0.05 * mods.decay * shelterBonus);

        // Physics & DNA Logic
        const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
        
        let dx = velX * mods.speed;
        let dy = velY * mods.speed;

        // --- ERA 31: Structure Collisions ---
        const nextX = x + dx * 10;
        const nextY = y + dy * 10;
        const ngx = Math.floor(Math.max(0, Math.min(1399, nextX)) / 20);
        const ngy = Math.floor(Math.max(0, Math.min(799, nextY)) / 20);
        const structureCell = Atomics.load(structureGrid, ngy * 70 + ngx);
        const density = (structureCell >> 8) & 0xFF;
        if (density > 150) {
            // Collision! Stop movement.
            dx = 0; dy = 0;
        }

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
        const quarantineLevel = Atomics.load(quarantineFlags, i);
        const incomingMessage = Atomics.load(readBuffer, i);
        
        // ERA 38: Diplomatic Check
        let isDiplomatic = false;
        if (incomingMessage > 0) {
            let sig = "";
            for (let b = 0; b < 8; b++) {
                sig += Atomics.load(readSignatures, i * 8 + b).toString(16).padStart(2, '0');
            }
            if (trustedSet.has(sig.toUpperCase())) isDiplomatic = true;
        }

        // Prepare State Object for VM
        const currentRole = Atomics.load(roles, i);
        const currentBonuses = Atomics.load(semanticBonuses, i);
        
        const vmState = { x, y, nutrients, marketPool, energy, resonance, bonds: bondView, synapticStack: synapticStack.subarray(i * 4, i * 4 + 4), role: currentRole, semanticBonuses: currentBonuses, quarantineLevel, incomingMessage, isDiplomatic };
        
        // ERA 40: Execute with Wasm Fast Path
        const vmResult = LAMBDA_VM.execute(logicBytes, codeBlock, context, vmState, false, wasmExports);
        
        energy += vmResult.energyDelta;
        resonance += vmResult.resonanceDelta;

        if (vmResult.modifiedCode) {
            Atomics.store(instructions, i * 16 + vmResult.modifiedCode.slot, vmResult.modifiedCode.value);
        }

        if (vmResult.modifiedStiffness) {
            bondStiffs[i * 4 + vmResult.modifiedStiffness.slot] = vmResult.modifiedStiffness.value;
        }

        // ERA 30: Synaptic Stack (PUSH_COLL)
        if (vmResult.modifiedSynaptic) {
            Atomics.store(synapticStack, i * 4 + vmResult.modifiedSynaptic.slot, vmResult.modifiedSynaptic.value);
        }

        // ERA 30: Holographic Sync (SYNC_AVG)
        if (vmResult.syncRequest) {
            const regIdx = vmResult.syncRequest.reg;
            let sum = context[2 + regIdx];
            let count = 1;
            for (let b = 0; b < 4; b++) {
                const targetIdx = bondView[b];
                const stiffness = bondStiffs[i * 4 + b];
                if (stiffness > 0.5 && targetIdx > 0 && targetIdx < MAX_ATOMS) {
                    // Peek into neighbor's register (context[2+regIdx])
                    const neighborCtx = new Uint8Array(buffer, CONTEXT_OFFSET + (targetIdx * 32), 32);
                    sum += neighborCtx[2 + regIdx];
                    count++;
                }
            }
            context[2 + regIdx] = Math.floor(sum / count);
        }

        // ERA 31: Architectural Stigmergy (BUILD / EXCAVATE)
        const gxAt = Math.floor(Math.max(0, Math.min(1399, x)) / 20);
        const gyAt = Math.floor(Math.max(0, Math.min(799, y)) / 20);
        const cellIdxAt = gyAt * 70 + gxAt;

        if (vmResult.modifiedStructure) {
            // Pack: [Density (8 bits) | Type (8 bits)]
            const val = (vmResult.modifiedStructure.density << 8) | (vmResult.modifiedStructure.type & 0xFF);
            Atomics.store(structureGrid, cellIdxAt, val);

            // ERA 32: Structural cleanup - if density becomes 0, clear memory too
            if (vmResult.modifiedStructure.density === 0) {
                memoryGrid[cellIdxAt * 8] = 0;
            }
        }

        // ERA 32: Coded Memetics (ENCODE / DECODE)
        if (vmResult.memeticRequest) {
            const structureCell = Atomics.load(structureGrid, cellIdxAt);
            const density = (structureCell >> 8) & 0xFF;

            if (vmResult.memeticRequest === "ENCODE" && density > 50) {
                // Write DNA to specific grid cell memory
                for (let b = 0; b < 8; b++) {
                    memoryGrid[cellIdxAt * 8 + b] = logicBytes[b];
                }
            } else if (vmResult.memeticRequest === "DECODE") {
                // Learn DNA from grid cell memory
                if (memoryGrid[cellIdxAt * 8] !== 0) {
                    for (let b = 0; b < 8; b++) {
                        logicBytes[b] = memoryGrid[cellIdxAt * 8 + b];
                    }
                }
            }
        }

        // ERA 33: Metabolic Specialization (Trophic Roles)
        if (vmResult.modifiedRole !== undefined) {
            Atomics.store(roles, i, vmResult.modifiedRole);
        }

        const role = Atomics.load(roles, i);

        // ERA 27: Message Routing + ERA 29: Hebbian Potentiation
        for (const msg of vmResult.outgoingMessages) {
            if (msg.targetIdx > 0 && msg.targetIdx < MAX_ATOMS) {
                // Determine if we should use writeBuffer[msg.targetIdx] directly
                // Using atomic store to the SHARED write buffer
                Atomics.store(writeBuffer, msg.targetIdx, msg.message & 0xFF);
                
                // ERA 38: Store Sender Signature for Diplomatic Signaling
                for (let b = 0; b < 8; b++) {
                    Atomics.store(writeSignatures, msg.targetIdx * 8 + b, logicBytes[b]);
                }

                // ERA 29: Hebbian Potentiation - "Fire together, wire together"
                if (msg.sourceBondSlot !== undefined) {
                    const currentStiff = bondStiffs[i * 4 + msg.sourceBondSlot];
                    bondStiffs[i * 4 + msg.sourceBondSlot] = Math.min(1.0, currentStiff + 0.05);
                }
            }
        }

        // --- ENERGY / RESONANCE APPLY (Metabolic Efficiency) ---
        let ed = vmResult.energyDelta;
        let rd = vmResult.resonanceDelta;

        // Apply Role Penalties (Generalist is normalized)
        const roleNum = Number(role);
        if (roleNum > 0) {
            // If performing non-role tasks, penalty applied
            const isStructuralAction = vmResult.modifiedStructure || vmResult.modifiedStiffness;
            const isMemeticAction = vmResult.memeticRequest;

            if (roleNum === 1) { // PRODUCER: Penalty for build/learn
                if (isStructuralAction || isMemeticAction) ed *= 1.4; // 40% more expensive
            }
            if (roleNum === 2) { // CONSTRUCTOR: Penalty for learning/feeding
                if (isMemeticAction || ed > 0) ed *= 1.4; 
            }
            if (roleNum === 3) { // SIPHON: Penalty for production/knowledge
                 if (ed > 0 || isMemeticAction) rd *= 1.4;
            }
        }

        energy += ed;
        resonance += rd;


        // ERA 28: Structural Morphogenesis - Energy Balancing (Multicellular metabolism)
        // ERA 29: Conductive Metabolism (Scaling by stiffness)
        // ERA 30: Resonance Harvesting (Nucleosynthesis)
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

                // ERA 30: Resonance Harvesting
                // If I have higher resonance, I "Harvest" from neighbors
                const targetRes = Atomics.load(resonances, targetIdx) / SCALE;
                if (resonance > targetRes + 1.0) {
                    const harvest = (targetRes * 0.05) * stiffness;
                    resonance += harvest;
                    Atomics.sub(resonances, targetIdx, Math.round(harvest * SCALE));
                }
            }
        }
            
        for (const intent of vmResult.intent) {

            if (intent.level === 4) { x += Math.round(intent.value.dx); y += Math.round(intent.value.dy); }
            if (intent.level === 5 && intent.value === "EVOLUTION_REQUEST") {
                Atomics.store(evolutionRequests, i, 1);
            }
            if (intent.level === 10 && intent.value === "spawn") {
                Atomics.store(spawnRequests, i, 1);
            }
        }

        // --- ENERGETIC COUPLING WITH ENVIRONMENT ---
        // Nutrients (Energy Source)
        const nutrient = Atomics.load(nutrients, cellIdxAt);
        if (nutrient > 0 && energy < 100) {
            let harvest = Math.min(nutrient, 2);
            // ERA 33: Producer Bonus
            if (roleNum === 1) harvest *= 1.5;

            energy += harvest;
            Atomics.sub(nutrients, cellIdxAt, Math.round(harvest));
        }

        // ERA 33: Siphon Bonus (Feeding from Structure)
        if (roleNum === 3) {
            const structureCell = Atomics.load(structureGrid, cellIdxAt);
            const density = (structureCell >> 8) & 0xFF;
            if (density > 50) {
                energy += 0.5;
                // Siphoning damages the structure!
                const newDensity = Math.max(0, density - 1);
                const newVal = (newDensity << 8) | (structureCell & 0xFF);
                Atomics.store(structureGrid, cellIdxAt, newVal);
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

// OMEGA-64 | PULSE_WORKER.ts | The Living Mind (Era 14: THE TURING MIND)
// Process a range of atoms using SharedArrayBuffer, Fixed-Point Atomics, and VM Context.

/// <reference lib="deno.worker" />

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";
import { PRNG } from "./PRNG.ts";

const MAX_ATOMS = 100000;
const SCALE = 1000;
const DIVINITY_THRESHOLD = 800;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom: (idx: number) => void;

self.onmessage = async (e) => {
    if (e.data.type === "INIT") {
        try {
            const wasmRes = await fetch(new URL("./build/release.wasm", import.meta.url));
            const instantiated = await WebAssembly.instantiateStreaming(wasmRes, {
                env: { 
                    memory: e.data.wasmMemory,
                    abort: (msg: any, file: any, line: any, col: any) => {
                        console.error(`WASM ABORT: ${msg} at ${file}:${line}:${col}`);
                    }
                }
            });
            wasmInstance = instantiated.instance;
            execute_atom = wasmInstance.exports.execute_atom as any;
            self.postMessage({ type: "READY" });
        } catch (err) {
            console.error("WASM LOAD ERROR", err);
        }
        return;
    }

    const { buffer, envBuffer, attentionBuffer, marketBuffer, evolutionRequestsBuffer, spawnRequestsBuffer, meiosisRequestsBuffer, bondRequestsBuffer, mergeRequestsBuffer, spatialGridBuffer, viralGridBuffer, pheroGridBuffer, hiveMemoryBuffer, birthTickBuffer, quorumBuffer, immuneBuffer, messageBufferA, messageBufferB, senderSignatureBufferA, senderSignatureBufferB, bondStiffnessBuffer, synapticStackBuffer, structureGridBuffer, memoryGridBuffer, roleRegistryBuffer, semanticBonusesBuffer, trustedSignatures, startIdx, endIdx, mods, pulseId, intentOffset } = e.data;
    
    // SoA Views
    const nutrients = new Int32Array(envBuffer);
    const attention = new Float32Array(attentionBuffer);
    const evolutionRequests = new Uint8Array(evolutionRequestsBuffer);
    const spawnRequests = new Int32Array(spawnRequestsBuffer);
    const meiosisRequests = new Int32Array(meiosisRequestsBuffer);
    const bondRequests = new Int32Array(bondRequestsBuffer);
    const mergeRequests = new Int32Array(mergeRequestsBuffer);
    const spatialGrid = new Int32Array(spatialGridBuffer);
    
    const CELL_CAPACITY = 31;

    const viralGrid = new Uint8Array(viralGridBuffer);
    const pheroGrid = new Int32Array(pheroGridBuffer);
    const hiveMemory = hiveMemoryBuffer ? new Uint8Array(hiveMemoryBuffer) : undefined;
    const birthTicks = birthTickBuffer ? new Int32Array(birthTickBuffer) : null;
    const quorumData = quorumBuffer ? new Int32Array(quorumBuffer) : undefined;
    const quarantineFlags = new Uint8Array(immuneBuffer);
    const msgsA = new Uint8Array(messageBufferA);
    const msgsB = new Uint8Array(messageBufferB);
    const bondStiffs = new Float32Array(bondStiffnessBuffer);
    const synapticStack = new Int32Array(synapticStackBuffer);
    const structureGrid = new Int32Array(structureGridBuffer);
    const memoryGrid = new Uint8Array(memoryGridBuffer);
    const roles = new Uint8Array(roleRegistryBuffer);
    const semanticBonuses = new Uint8Array(semanticBonusesBuffer);
    const senderSignaturesA = new Uint8Array(senderSignatureBufferA);
    const senderSignaturesB = new Uint8Array(senderSignatureBufferB);
    const intents = new Uint32Array(buffer, intentOffset, MAX_ATOMS); // 4 bytes == 1 Uint32

    const trustedSet = new Set<string>(trustedSignatures || []);

    const isAEven = pulseId % 2 === 0;
    const readBuffer = isAEven ? msgsB : msgsA;
    const writeBuffer = isAEven ? msgsA : msgsB;
    const readSignatures = isAEven ? senderSignaturesB : senderSignaturesA;
    const writeSignatures = isAEven ? senderSignaturesA : senderSignaturesB;

    const marketPool = new Int32Array(marketBuffer, 4, 1);

    const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
    const xs = new Int16Array(buffer, (MAX_ATOMS * 8), MAX_ATOMS);
    const ys = new Int16Array(buffer, (MAX_ATOMS * 8) + (MAX_ATOMS * 2), MAX_ATOMS);
    const energies = new Int32Array(buffer, (MAX_ATOMS * 12), MAX_ATOMS);
    const resonances = new Int32Array(buffer, (MAX_ATOMS * 12) + (MAX_ATOMS * 4), MAX_ATOMS);
    const phases = new Int32Array(buffer, (MAX_ATOMS * 20), MAX_ATOMS);
    const logic = new Uint8Array(buffer, (MAX_ATOMS * 24), MAX_ATOMS * 8); 
    const bonds = new Uint32Array(buffer, (MAX_ATOMS * 32), MAX_ATOMS * 4);
    const instructions = new Uint32Array(buffer, (MAX_ATOMS * 48), MAX_ATOMS * 16);
    
    const CONTEXT_OFFSET = (MAX_ATOMS * 112);
    const contexts = new Uint8Array(buffer, CONTEXT_OFFSET, MAX_ATOMS * 32);

    try {
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
            
            // ERA 46: Metabolic Decay + Stigmergic Shelter
            const gxAt = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
            const gyAt = Math.floor(Math.max(0, Math.min(799, y)) / 10);
            const cellIdxAt = gyAt * 140 + gxAt;
            
            const structureCell = Atomics.load(structureGrid, cellIdxAt);
            const density = (structureCell >> 8) & 0xFF;
            
            let decay = 0.01; // Base metabolic cost
            if (density > 100) decay *= 0.8; // 20% protection near ruins
            if (!isDivine) energy -= (decay * mods.decay);

            // Physics Logic
            const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
            
            let dx = velX * mods.speed;
            let dy = velY * mods.speed;

            // Collision Check
            const nextX = x + dx * 10;
            const nextY = y + dy * 10;
            const ngx = Math.floor(Math.max(0, Math.min(1399, nextX)) / 10);
            const ngy = Math.floor(Math.max(0, Math.min(799, nextY)) / 10);
            const targetStructureCell = Atomics.load(structureGrid, ngy * 140 + ngx);
            if (((targetStructureCell >> 8) & 0xFF) > 150) {
                dx = 0; dy = 0;
            }

            // Attention Tropism
            const attentionAffinity = (logicBytes[0] - 128) / 128;
            if (attentionAffinity !== 0) {
                const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, y)) / 10);
                let tropX = 0; let tropY = 0;
                const checkpoints = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                for (const [oX, oY] of checkpoints) {
                    const nx = Math.max(0, Math.min(139, gx + oX));
                    const ny = Math.max(0, Math.min(79, gy + oY));
                    const intensity = attention[ny * 140 + nx] || 0;
                    tropX += oX * intensity;
                    tropY += oY * intensity;
                }
                const mag = Math.hypot(tropX, tropY) || 1;
                dy += (tropY / mag) * attentionAffinity * 2.0;
            }

            const bondView = bonds.subarray(i * 4, i * 4 + 4);
            const { fx, fy } = PHYSICS_ENGINE.applyBondSprings(i, x, y, bondView, xs, ys, bondStiffs);
            dx += fx; dy += fy;

            x += Math.round(dx);
            y += Math.round(dy);

            // --- ERA 50: Collective Resonance ---
            if (density > 5) {
                const localPhaseAvg = Atomics.load(spatialGrid, cellIdxAt * 32 + 31) / SCALE; // Sync calculated in build
                const myPhase = resonanceFactor / SCALE; // Phase is resonance factor in some contexts? 
                // Wait, phase is its own field:
                const myPhaseVal = Atomics.load(phases, i) / SCALE;
                if (Math.abs(myPhaseVal - localPhaseAvg) < 0.1) {
                    resonance += 1.0;
                    energy += 1.0; // Collective meta-gain
                }
            }

            // WASM EXECUTION (Zero-Allocation FFI)
            if (execute_atom) {
                execute_atom(i);
                
                // --- ERA 65: SYNC STATE ---
                // Reload local JS variables because flat memory was mutated by WASM
                energy = Atomics.load(energies, i) / SCALE;
                resonance = Atomics.load(resonances, i) / SCALE;
            }

            const intent = Atomics.load(intents, i);
            if (intent !== 0) {
                Atomics.store(intents, i, 0);
                const opcode = intent & 0xFF;

                if (opcode === 0x08) { // MITOSIS
                    Atomics.store(spawnRequests, i * 3 + 0, 1);
                    Atomics.store(spawnRequests, i * 3 + 1, Math.round(x));
                    Atomics.store(spawnRequests, i * 3 + 2, Math.round(y));
                }
            }

            // Metabolic Sharing
            for (let b = 0; b < 4; b++) {
                const stiffness = bondStiffs[i * 4 + b];
                const targetIdx = bondView[b];
                if (stiffness > 0) bondStiffs[i * 4 + b] = Math.max(0, stiffness - 0.001);
                if (stiffness > 0.1 && targetIdx > 0 && targetIdx < MAX_ATOMS) {
                    const targetE = Atomics.load(energies, targetIdx) / SCALE;
                    const diffE = (targetE - energy) * (stiffness * 0.5);
                    energy += diffE;
                    Atomics.store(energies, targetIdx, Math.round((targetE - diffE) * SCALE));
                    const targetR = Atomics.load(resonances, targetIdx) / SCALE;
                    if (resonance > targetR + 1.0) {
                        const harvest = (targetR * 0.05) * stiffness;
                        resonance += harvest;
                        Atomics.sub(resonances, targetIdx, Math.round(harvest * SCALE));
                    }
                }
            }

            // Environmental Feeding
            const nutrient = Atomics.load(nutrients, cellIdxAt);
            const roleNum = Number(Atomics.load(roles, i));
            if (nutrient > 0 && energy < 100) {
                let harvest = Math.min(nutrient, 2);
                if (roleNum === 1) harvest *= 1.5;
                energy += harvest;
                Atomics.sub(nutrients, cellIdxAt, Math.round(harvest));
            }

            if (roleNum === 3) {
                const sCell = Atomics.load(structureGrid, cellIdxAt);
                const dens = (sCell >> 8) & 0xFF;
                if (dens > 50) {
                    energy += 0.5;
                    Atomics.store(structureGrid, cellIdxAt, (((dens - 1) << 8) | (sCell & 0xFF)));
                }
            }

            // Viral Signaling
            const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
            const gy = Math.floor(Math.max(0, Math.min(799, y)) / 10);
            if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                const vIdx = (gy * 140 + gx) * 9;
                if (resonance > 150 && (pulseId + i) % 10 === 0) {
                    const intensity = Atomics.load(viralGrid, vIdx + 8);
                    if (resonance / 5 > intensity) {
                        for (let b = 0; b < 8; b++) Atomics.store(viralGrid, vIdx + b, logicBytes[b]);
                        Atomics.store(viralGrid, vIdx + 8, Math.min(255, Math.floor(resonance / 4)));
                    }
                }
                const viralIntensity = Atomics.load(viralGrid, vIdx + 8);
                const quarantineLevel = Atomics.load(quarantineFlags, i);
                const isFlagged = quarantineLevel >= 1;

                if (!isFlagged && (pulseId + i) % 50 === 0 && viralIntensity > 50) {
                    // Resonance-based resistance: higher resonance = harder to infect
                    const resistance = (resonance / 2); // 400 resonance -> 200 resistance
                    const atomPrng = new PRNG(PRNG.seedFrom(pulseId, currentId.toString()));
                    const { value: v1, next: n1 } = atomPrng.next();
                    
                    if (v1 * 255 < (viralIntensity - resistance)) {
                        const { value: v2 } = n1.next();
                        const bIdx = Math.floor(v2 * 8);
                        Atomics.store(logic, i * 8 + bIdx, Atomics.load(viralGrid, vIdx + bIdx));
                        energy -= 5;
                    }
                }
            }

            x = Math.max(50, Math.min(1350, x));
            y = Math.max(50, Math.min(750, y));

            if (Atomics.load(ids, i) !== currentId) continue; 

            Atomics.store(xs, i, x);
            Atomics.store(ys, i, y);
            Atomics.store(energies, i, Math.round(energy * SCALE));
            Atomics.store(resonances, i, Math.round(resonance * SCALE));
            
            if (energy <= 0 && !isDivine) {
                const nIdx = Math.floor(y / 10) * 140 + Math.floor(x / 10);
                Atomics.add(nutrients, nIdx, Math.floor(resonance * 10) + 50);
                Atomics.store(ids, i, 0n);
            }
        }
    } catch (err) {
        console.error("   [WORKER CRASH] Error in PULSE_WORKER:", err);
    }

    self.postMessage({ done: true, pulseId });
};

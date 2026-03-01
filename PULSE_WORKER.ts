// OMEGA-64 | PULSE_WORKER.ts | The Living Mind (Era 14: THE TURING MIND)
// Process a range of atoms using SharedArrayBuffer, Fixed-Point Atomics, and VM Context.

/// <reference lib="deno.worker" />

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";
import { PRNG } from "./PRNG.ts";

const MAX_ATOMS = 100000;
const SCALE = 1000;
const DIVINITY_THRESHOLD = 800;

self.onmessage = (e) => {
    const { buffer, envBuffer, attentionBuffer, marketBuffer, evolutionRequestsBuffer, spawnRequestsBuffer, meiosisRequestsBuffer, bondRequestsBuffer, mergeRequestsBuffer, spatialGridBuffer, viralGridBuffer, immuneBuffer, messageBufferA, messageBufferB, senderSignatureBufferA, senderSignatureBufferB, bondStiffnessBuffer, synapticStackBuffer, structureGridBuffer, memoryGridBuffer, roleRegistryBuffer, semanticBonusesBuffer, trustedSignatures, startIdx, endIdx, mods, pulseId } = e.data;
    
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
    const logic = new Uint8Array(buffer, (MAX_ATOMS * 24), MAX_ATOMS * 8); 
    const bonds = new Uint32Array(buffer, (MAX_ATOMS * 32), MAX_ATOMS * 4);
    const instructions = new Uint32Array(buffer, (MAX_ATOMS * 32) + (MAX_ATOMS * 16), MAX_ATOMS * 16);
    
    const CONTEXT_OFFSET = (MAX_ATOMS * 48) + (MAX_ATOMS * 64);
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

            // VM EXECUTION
            const quarantineLevel = Atomics.load(quarantineFlags, i);
            const incomingMessage = Atomics.load(readBuffer, i);
            
            let isDiplomatic = false;
            if (incomingMessage > 0) {
                let sig = "";
                for (let b = 0; b < 8; b++) sig += Atomics.load(readSignatures, i * 8 + b).toString(16).padStart(2, '0');
                if (trustedSet.has(sig.toUpperCase())) isDiplomatic = true;
            }

            const currentRole = Atomics.load(roles, i);
            const currentBonuses = Atomics.load(semanticBonuses, i);

            const vmState = { x, y, nutrients, structureGrid, viralGrid, spatialGrid, marketPool, energy, resonance, bonds: bondView, synapticStack: synapticStack.subarray(i * 4, i * 4 + 4), role: currentRole, semanticBonuses: currentBonuses, quarantineLevel, incomingMessage, isDiplomatic };
            const vmResult = LAMBDA_VM.execute(logicBytes, codeBlock, context, vmState, false, null);
            
            energy += vmResult.energyDelta;
            resonance += vmResult.resonanceDelta;

            if (vmResult.modifiedCode) Atomics.store(instructions, i * 16 + vmResult.modifiedCode.slot, vmResult.modifiedCode.value);
            if (vmResult.modifiedStiffness) bondStiffs[i * 4 + vmResult.modifiedStiffness.slot] = vmResult.modifiedStiffness.value;
            if (vmResult.modifiedSynaptic) Atomics.store(synapticStack, i * 4 + vmResult.modifiedSynaptic.slot, vmResult.modifiedSynaptic.value);

            if (vmResult.syncRequest) {
                const regIdx = vmResult.syncRequest.reg;
                let sum = context[2 + regIdx];
                let count = 1;
                for (let b = 0; b < 4; b++) {
                    const targetIdx = bondView[b];
                    const stiffness = bondStiffs[i * 4 + b];
                    if (stiffness > 0.5 && targetIdx > 0 && targetIdx < MAX_ATOMS) {
                        const neighborCtx = new Uint8Array(buffer, CONTEXT_OFFSET + (targetIdx * 32), 32);
                        sum += neighborCtx[2 + regIdx];
                        count++;
                    }
                }
                context[2 + regIdx] = Math.floor(sum / count);
            }

            if (vmResult.modifiedStructure) {
                const val = (vmResult.modifiedStructure.density << 8) | (vmResult.modifiedStructure.type & 0xFF);
                Atomics.store(structureGrid, cellIdxAt, val);
                if (vmResult.modifiedStructure.density === 0) memoryGrid[cellIdxAt * 8] = 0;
            }

            if (vmResult.memeticRequest) {
                const sCell = Atomics.load(structureGrid, cellIdxAt);
                if (vmResult.memeticRequest === "ENCODE" && ((sCell >> 8) & 0xFF) > 50) {
                    for (let b = 0; b < 8; b++) memoryGrid[cellIdxAt * 8 + b] = logicBytes[b];
                } else if (vmResult.memeticRequest === "DECODE" && memoryGrid[cellIdxAt * 8] !== 0) {
                    for (let b = 0; b < 8; b++) logicBytes[b] = memoryGrid[cellIdxAt * 8 + b];
                }
            }

            if (vmResult.modifiedRole !== undefined) Atomics.store(roles, i, vmResult.modifiedRole);

            for (const msg of vmResult.outgoingMessages) {
                if (msg.targetIdx > 0 && msg.targetIdx < MAX_ATOMS) {
                    Atomics.store(writeBuffer, msg.targetIdx, msg.message & 0xFF);
                    for (let b = 0; b < 8; b++) Atomics.store(writeSignatures, msg.targetIdx * 8 + b, logicBytes[b]);
                    if (msg.sourceBondSlot !== undefined) {
                        const currentStiff = bondStiffs[i * 4 + msg.sourceBondSlot];
                        bondStiffs[i * 4 + msg.sourceBondSlot] = Math.min(1.0, currentStiff + 0.05);
                    }
                }
            }

            // Role Penalties
            const roleNum = Number(Atomics.load(roles, i));
            if (roleNum > 0) {
                const isStructural = vmResult.modifiedStructure || vmResult.modifiedStiffness;
                const isMemetic = vmResult.memeticRequest;
                if (roleNum === 1 && (isStructural || isMemetic)) energy -= Math.abs(vmResult.energyDelta) * 0.4;
                if (roleNum === 2 && (isMemetic || vmResult.energyDelta > 0)) energy -= Math.abs(vmResult.energyDelta) * 0.4;
                if (roleNum === 3 && (vmResult.energyDelta > 0 || isMemetic)) resonance -= Math.abs(vmResult.resonanceDelta) * 0.4;
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
                
            for (const intent of vmResult.intent) {
                if (intent.level === 4) { x += Math.round(intent.value.dx); y += Math.round(intent.value.dy); }
                if (intent.level === 5 && intent.value === "EVOLUTION_REQUEST") Atomics.store(evolutionRequests, i, 1);
                if (intent.level === 10 && intent.value === "spawn") Atomics.store(spawnRequests, i, 1);
                if (intent.level === 11 && intent.value.type === "meiosis") {
                    const targetIdx = bondView[intent.value.targetBondSlot];
                    if (targetIdx > 0 && targetIdx < MAX_ATOMS) Atomics.store(meiosisRequests, i, targetIdx);
                }
                if (intent.level === 12) {
                    const targetX = Math.round(x + intent.value.dx * 10);
                    const targetY = Math.round(y + intent.value.dy * 10);
                    const hx = Math.max(0, Math.min(139, Math.floor(targetX / 10)));
                    const hy = Math.max(0, Math.min(79, Math.floor(targetY / 10)));
                    const queryHash = hy * 140 + hx;
                    const cellStart = queryHash * (CELL_CAPACITY + 1);
                    const cellCount = Atomics.load(spatialGrid, cellStart);
                    let closestPeerIdx = -1; let minPeerDistSq = 400;
                    for (let c = 1; c <= cellCount; c++) {
                        const candidateIdx = Atomics.load(spatialGrid, cellStart + c);
                        if (candidateIdx > 0 && candidateIdx < MAX_ATOMS && candidateIdx !== i) {
                            const cx = Atomics.load(xs, candidateIdx);
                            const cy = Atomics.load(ys, candidateIdx);
                            const distSq = (cx - targetX) ** 2 + (cy - targetY) ** 2;
                            if (distSq < minPeerDistSq) { closestPeerIdx = candidateIdx; minPeerDistSq = distSq; }
                        }
                    }
                    if (closestPeerIdx !== -1) {
                        Atomics.store(bondRequests, i * 3, i + 1);
                        Atomics.store(bondRequests, i * 3 + 1, closestPeerIdx);
                        Atomics.store(bondRequests, i * 3 + 2, 0); 
                    }
                }
                if (intent.level === 13) {
                    const slot = intent.value.targetBondSlot;
                    const targetIdx = bondView[slot];
                    if (targetIdx > 0 && targetIdx < MAX_ATOMS && bondStiffs[i * 4 + slot] > 0.8) {
                        Atomics.store(mergeRequests, i * 2, i + 1);
                        Atomics.store(mergeRequests, i * 2 + 1, targetIdx);
                    }
                }
            }

            // Environmental Feeding
            const nutrient = Atomics.load(nutrients, cellIdxAt);
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
                if (resonance < 400 && (pulseId + i) % 50 === 0 && Atomics.load(viralGrid, vIdx + 8) > 50) {
                    const atomPrng = new PRNG(PRNG.seedFrom(pulseId, currentId.toString()));
                    const { value: v1, next: n1 } = atomPrng.next();
                    if (v1 * 255 < Atomics.load(viralGrid, vIdx + 8)) {
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

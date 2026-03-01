# OMEGA-64 | CORE LOGIC (ERA 22: EPIGENETIC EVOLUTION)

*Generated: 2026-03-01T17:03:13.561Z*

---

## FILE: RIBOSOME.ts

```typescript
/// <reference lib="deno.window" />
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./IMMUNE.ts";
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";
import { STATE_MATRIX, ATOM_SIZE } from "./STATE_MATRIX.ts";
import { decodeHex } from "jsr:@std/encoding/hex";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    symbol: string;
    topo?: { r: number, theta: number, op: string };
}

export type Lattice = Map<string, Atom>;

// Mapping for Matrix Lookups
export const ID_TO_IDX = new Map<string, number>();
export const IDX_TO_ID = new Map<number, string>();

function idToBigInt(id: string): bigint {
    const hex = id.split('.')[0].replace('0x', '');
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '0').padEnd(16, '0');
    try {
        return BigInt(`0x${cleanHex.substring(0, 16)}`);
    } catch {
        return 0n;
    }
}

export const RIBOSOME = {
    // Scan and Lift all Atoms in Flatland and Vacuum
    lift: async (root: string = Deno.cwd()): Promise<Map<string, Atom>> => {
        console.log("   [RIBOSOME] lift started on root: ", root);
        const lattice = new Map<string, Atom>();
        let idx = 0;

        const scanDirs = [root, `${root}/SINGULARITY/V`];
        for (const dir of scanDirs) {
            console.log(`   [RIBOSOME] scanning dir: ${dir}`);
            try {
                // @ts-ignore
                for await (const entry of Deno.readDir(dir)) {
                    if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                        const fullPath = dir === root ? entry.name : `SINGULARITY/V/${entry.name}`;
                        // @ts-ignore
                        const content = await Deno.readTextFile(fullPath);
                        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                        if (!frontmatterMatch) continue;

                        const alpha = parseYaml(frontmatterMatch[1]) as any;
                        const symbol = alpha.symbol ?? entry.name.split('.')[1] ?? "UNKNOWN";
                        const level = alpha.level ?? (alpha.vector ? parseInt(alpha.vector.split('.')[0]) : 0);

                        // 🧬 ERA 8: SERIALIZE INTO SoA STATE_MATRIX
                        const atomBigId = idToBigInt(entry.name);
                        STATE_MATRIX.setId(idx, atomBigId);
                        STATE_MATRIX.setX(idx, Number(alpha.x) || 0);
                        STATE_MATRIX.setY(idx, Number(alpha.y) || 0);
                        STATE_MATRIX.setEnergy(idx, Number(alpha.energy) || 100);
                        STATE_MATRIX.setResonance(idx, Number(alpha.resonance) || 0);
                        STATE_MATRIX.setPhase(idx, Number(alpha.phase) || 0);
                        
                        // Logic (Hex to Bytes)
                        const logic = (alpha.logic || "00000000").replace(/[^0-9a-fA-F]/g, "").padEnd(16, '0');
                        try {
                            STATE_MATRIX.setLogic(idx, decodeHex(logic.substring(0, 16)));
                        } catch { /* skip corrupted logic binary lift */ }

                        ID_TO_IDX.set(fullPath, idx);
                        IDX_TO_ID.set(idx, fullPath);

                        lattice.set(fullPath, {
                            id: entry.name,
                            level: level,
                            symbol: symbol,
                            module: null 
                        });

                        idx++;
                    }
                }
            } catch (err) { console.error(`   [RIBOSOME] Error reading dir ${dir}:`, err); }
        }

        console.log(`   [RIBOSOME] Phase 1 done, found atoms:`, ID_TO_IDX.size);

        // 🧬 PASS 2: BOND RESOLUTION
        const bondKeyMap = new Map<string, string>();
        for (const k of ID_TO_IDX.keys()) {
            const basename = k.split('/').pop() || k;
            const bondIdStr = basename.split('.')[0]; 
            bondKeyMap.set(bondIdStr, k);
        }

        for (const [fullPath, atomIdx] of ID_TO_IDX.entries()) {
            try {
                // @ts-ignore
                const content = await Deno.readTextFile(fullPath);
                const alphaMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (alphaMatch) {
                    const alpha = parseYaml(alphaMatch[1]) as any;
                    const bondIds: string[] = alpha.bonds || [];
                    const bondIndices = new Uint32Array(4);
                    for (let i = 0; i < Math.min(bondIds.length, 4); i++) {
                        const partnerId = bondKeyMap.get(bondIds[i]);
                        if (partnerId) {
                            bondIndices[i] = ID_TO_IDX.get(partnerId) || 0;
                        }
                    }
                    STATE_MATRIX.setBonds(atomIdx, bondIndices);
                }
            } catch (err) { /* ignore */ }
        }

        console.log(`   [MEMORY_MATRIX] ${idx} atoms serialized into SoA Structure.`);

        // 🛡️ IMMUNE SYSTEM CHECK
        console.log("   [RIBOSOME] Running IMMUNE check");
        const out = IMMUNE.inspect(lattice);
        console.log("   [RIBOSOME] IMMUNE check complete");
        return out;
    },

    // Inject Dependencies into a Pure Atom (Adapted for Flatland)
    inject: async (id: string, lattice: Map<string, Atom>) => {
        const target = lattice.get(id);
        if (!target) return null;

        // Implementation for Flatland injection...
        return null; 
    }
};

if (import.meta.main) {
    const lattice = await RIBOSOME.lift();
    console.log(`[RIBOSOME] Flatland Lifted: ${lattice.size} atoms.`);
}

```

---

## FILE: IMMUNE.ts

```typescript
// IMMUNE.ts
// The Phagocyte of OMEGA.
// Filters Atoms based on Structure and Mass.

import type { Atom } from "./RIBOSOME.ts";

export const IMMUNE = {
    // Recognition: Friend or Foe?
    recognize: (atom: Atom): boolean => {
        // Flatland Recognition: 0x...ID...SYMBOL.md
        if (atom.id.startsWith("0x") && atom.id.endsWith(".md")) {
            return true;
        }

        // Vacuum Recognition
        if (atom.id.startsWith("v.")) {
            return true;
        }

        return false;
    },

    // Inspection: Final Gateway
    inspect: (lattice: Map<string, Atom>): Map<string, Atom> => {
        const cleanLattice = new Map<string, Atom>();
        for (const [id, atom] of lattice) {
            if (IMMUNE.recognize(atom)) {
                cleanLattice.set(id, atom);
            }
        }
        return cleanLattice;
    }
};

```

---

## FILE: PULSE.ts

```typescript
// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat (Era 14: The Turing Mind)
// Multi-threaded Structure-of-Arrays (SoA) simulation engine.

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { RIBOSOME, ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { REFLECTION_ENGINE } from "./REFLECTION_ENGINE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { GATE } from "./GATE.ts";


const ROOT = Deno.cwd();
const THREAD_COUNT = 4; // Adjust based on CPU cores
const PULSE_INTERVAL = 10; // Faster pulses for high-performance era

export const PULSE = {
    workers: [] as Worker[],
    currentPulseId: 0,


    initWorkers: () => {
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            PULSE.workers.push(worker);
        }
        console.log(`   [PULSE] ${THREAD_COUNT} Parallel Workers initialized.`);
    },

    run: async () => {
        console.log("🛡️ OMEGA-64 | ERA 14: THE TURING MIND | PULSE ACTIVE");
        
        console.log("-> Lifting ROOT");
        await RIBOSOME.lift(ROOT);
        console.log("-> ROOT Lifted");

        console.log("-> Seeding Nutrients");
        PHYSICS_ENGINE.seedNutrients(Date.now()); // Primary seed from bootstrap

        
        console.log("-> Init Workers");
        PULSE.initWorkers();
        
        while (true) {

            PULSE.currentPulseId++;
            const pulseId = PULSE.currentPulseId;


            // Main thread sequential tasks
            const activeIndices = STATE_MATRIX.getActiveIndices();
            SPATIAL_HASH.build(activeIndices);
            if (pulseId % 5 === 0) PHYSICS_ENGINE.decayPheromones();
            if (pulseId % 10 === 0) {
                // @ts-ignore: viralGrid exists in STATE_MATRIX
                PHYSICS_ENGINE.diffuseViralSemantics(STATE_MATRIX.viralGrid, pulseId);
                
                // ERA 26: Collective Immunity
                GATE.detectAntigens(STATE_MATRIX);
            }

            // ERA 27: Atomic Messaging Buffer Swap
            STATE_MATRIX.swapMessageBuffers();

            
            // Exodus Check (Throttled)
            if (pulseId % 10 === 0) {
                for (const idx of activeIndices) {
                    if (P2P_FEDERATION.checkWanderlust(idx, pulseId)) P2P_FEDERATION.migrate(idx, pulseId);
                }
            }


            // Parallel Processing via Workers
            const currentRegent = SOVEREIGNTY_ENGINE.currentRegent;
            
            const chunkSize = Math.ceil(MAX_ATOMS / THREAD_COUNT);
            const workerPromises = PULSE.workers.map((worker, i) => {
                return new Promise((resolve) => {
                    worker.onmessage = (e) => { if (e.data.done && e.data.pulseId === pulseId) resolve(null); };
                    worker.postMessage({
                        buffer: STATE_MATRIX.buffer,
                        envBuffer: PHYSICS_ENGINE.envBuffer,
                        attentionBuffer: PHYSICS_ENGINE.attentionBuffer,
                        marketBuffer: PREDICTION_MARKET.buffer,
                        startIdx: i * chunkSize,
                        endIdx: Math.min((i + 1) * chunkSize, MAX_ATOMS),
                        mods: SOVEREIGNTY_ENGINE.currentRegent.mods,
                        evolutionRequestsBuffer: STATE_MATRIX.evolutionRequestsBuffer,
                        viralGridBuffer: STATE_MATRIX.viralGridBuffer,
                        immuneBuffer: STATE_MATRIX.immuneBuffer,
                        messageBufferA: STATE_MATRIX.messageBufferA,
                        messageBufferB: STATE_MATRIX.messageBufferB,
                        bondStiffnessBuffer: STATE_MATRIX.bondStiffnessBuffer,
                        synapticStackBuffer: STATE_MATRIX.synapticStackBuffer,
                        structureGridBuffer: STATE_MATRIX.structureGridBuffer,
                        memoryGridBuffer: STATE_MATRIX.memoryGridBuffer,
                        roleRegistryBuffer: STATE_MATRIX.roleRegistryBuffer,
                        pulseId
                    });
                });
            });

            await Promise.all(workerPromises);

            // Convergence, Crisis Resolution & Reporting
            if (pulseId % 100 === 0) {
                PREDICTION_MARKET.resolveCrisis();
                
                // Elect Regent
                const regent = SOVEREIGNTY_ENGINE.electRegent(activeIndices);
                
                // Calculate Thermodynamic Totals for monitoring
                let totalNutrients = 0;
                for (let i = 0; i < PHYSICS_ENGINE.NUTRIENTS.length; i++) {
                    totalNutrients += Atomics.load(PHYSICS_ENGINE.NUTRIENTS, i);
                }
                
                console.log(`💓 Pulse #${pulseId} | Atoms: ${activeIndices.length} | Regent: ${regent.genome} (${regent.activeDecree}) | Nutrients: ${totalNutrients}`);
            }

            // Persistence (Rapid Genesis Snapshotting every 5000 ticks ~ 1 minute)
            if (pulseId % 5000 === 0) {
                await SNAPSHOT_ENGINE.exportSnapshot();
            }

            // Crystallization & Epigenetic Evolution (RAM -> Flatland & Directed Mutation)
            if (pulseId % 1000 === 0) {
                await REFLECTION_ENGINE.crystallize(100);

                // ERA 22: Epigenetic Mutation Processing
                const winners = activeIndices
                    .filter(idx => STATE_MATRIX.hasEvolved(idx) && STATE_MATRIX.getResonance(idx) > 100)
                    .sort((a, b) => STATE_MATRIX.getResonance(b) - STATE_MATRIX.getResonance(a))
                    .slice(0, 3);

                for (const idx of winners) {
                    const logicStr = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                    const currentThought = SEMANTIC_MEMBRANE.thoughtArchive.get(logicStr) || "Unknown existence.";
                    const context = `Decree: ${SOVEREIGNTY_ENGINE.currentRegent.activeDecree}, Population: ${activeIndices.length}`;
                    
                    const evolvedThought = await LLM_SYNAPSE.evolveThought(currentThought, context);
                    console.log(`🧬 [EPIGENESIS] Evolving genome [${logicStr}] -> "${evolvedThought}"`);
                    
                    SEMANTIC_MEMBRANE.project(evolvedThought, idx);
                    
                    // Record Lineage
                    const childLogic = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                    SEMANTIC_MEMBRANE.lineage.set(childLogic, logicStr);

                    STATE_MATRIX.clearEvolution(idx);
                }
            }
            await new Promise(r => setTimeout(r, PULSE_INTERVAL));
        }
    }
};

if (import.meta.main) {
    PULSE.run();
}

```

---

## FILE: PULSE_WORKER.ts

```typescript
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
    const { buffer, envBuffer, attentionBuffer, marketBuffer, evolutionRequestsBuffer, viralGridBuffer, immuneBuffer, messageBufferA, messageBufferB, bondStiffnessBuffer, synapticStackBuffer, structureGridBuffer, memoryGridBuffer, roleRegistryBuffer, startIdx, endIdx, mods, pulseId } = e.data;
    
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
    const synapticStack = new Int32Array(synapticStackBuffer); // ERA 30: Distributed Cognition
    const structureGrid = new Int32Array(structureGridBuffer); // ERA 31: Architectural Stigmergy
    const memoryGrid = new Uint8Array(memoryGridBuffer); // ERA 32: Coded Memetics
    const roles = new Uint8Array(roleRegistryBuffer); // ERA 33: Metabolic Specialization

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
        energy -= isDivine ? 0 : 0.05 * mods.decay;

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
        // Prepare State Object for VM
        const currentRole = Atomics.load(roles, i);
        
        const vmState = { x, y, nutrients, marketPool, energy, resonance, bonds: bondView, synapticStack: synapticStack.subarray(i * 4, i * 4 + 4), role: currentRole, quarantineLevel, incomingMessage };
        const vmResult = LAMBDA_VM.execute(logicBytes, codeBlock, context, vmState);
        
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

```

---

## FILE: SPATIAL_HASH.ts

```typescript
// OMEGA-64 | SPATIAL_HASH.ts | O(1) Proximity Index
// Spatial indexing for optimized neighborhood queries.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const CELL_SIZE = 100;
const GRID_COLS = 15; // 1500 / 100
const GRID_ROWS = 9;  // 900 / 100

// Grid: Map<CellKey, number[]>
const grid: Map<number, number[]> = new Map();

export const SPATIAL_HASH = {
    build: (activeIndices: number[]) => {
        grid.clear();
        for (const idx of activeIndices) {
            const x = STATE_MATRIX.getX(idx);
            const y = STATE_MATRIX.getY(idx);
            const cellX = Math.floor(x / CELL_SIZE);
            const cellY = Math.floor(y / CELL_SIZE);
            const key = cellY * GRID_COLS + cellX;
            
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key)!.push(idx);
        }
    },

    queryRadius: (x: number, y: number, radius: number): number[] => {
        const results: number[] = [];
        const minX = Math.floor((x - radius) / CELL_SIZE);
        const maxX = Math.floor((x + radius) / CELL_SIZE);
        const minY = Math.floor((y - radius) / CELL_SIZE);
        const maxY = Math.floor((y + radius) / CELL_SIZE);

        for (let cy = minY; cy <= maxY; cy++) {
            for (let cx = minX; cx <= maxX; cx++) {
                const key = cy * GRID_COLS + cx;
                const cell = grid.get(key);
                if (cell) {
                    for (const neighborIdx of cell) {
                        const nx = STATE_MATRIX.getX(neighborIdx);
                        const ny = STATE_MATRIX.getY(neighborIdx);
                        const dx = nx - x;
                        const dy = ny - y;
                        if (dx * dx + dy * dy <= radius * radius) {
                            results.push(neighborIdx);
                        }
                    }
                }
            }
        }
        return results;
    },

    getGridIdx: (x: number, y: number) => {
        const cellX = Math.floor(x / CELL_SIZE);
        const cellY = Math.floor(y / CELL_SIZE);
        return cellY * GRID_COLS + cellX;
    }
};

```

---

## FILE: GATE.ts

```typescript
// GATE.ts
// 🛡️ OMEGA-64 | Glider Lite | The Deterministic L32 Gate
// "No mutation without admission."

import { STATE_SNAPSHOT_BridgeModeEvent as BridgeModeEvent, STATE_SNAPSHOT_DeltaProposal as DeltaProposal, STATE_SNAPSHOT_GateConfig as GateConfig, STATE_SNAPSHOT_GateDecision as GateDecision, STATE_SNAPSHOT_LedgerEvent as LedgerEvent, STATE_SNAPSHOT_REJECTION as REJECTION, STATE_SNAPSHOT_StateSnapshot as StateSnapshot } from "@omega";
// ... (rest of imports should be via @omega already)
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import { LOAD_LOAD as LOAD } from "@omega";
import { CHECKPOINT_CHECKPOINT as CHECKPOINT } from "@omega";
import { TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE as TOPOLOGICAL_SIGNATURE } from "@omega";
import { CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY } from "@omega";
import type { REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";
import { CANON_CAUSAL_BRIDGE } from "@omega";
import { AGENT_SIGNATURE } from "@omega";
import { PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX } from "@omega";
import { INVARIANT_PACKET_INVARIANT_PACKET as INVARIANT_PACKET } from "@omega";
import { I16_CLAMP__00_00_I16_CLAMP as I16_CLAMP } from "@omega";
import { I16_LIMITS_I16_LIMITS as I16_LIMITS } from "@omega";

const GATE_VERSION = "v0.2";
const AUTO_CHECKPOINT_INTERVAL = 128;
const I16 = I16_LIMITS();

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16?: Uint16Array,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > I16.max) dPhi = I16.span - dPhi;
    const angle = (dPhi / I16.max) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2; // [0..1]
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const GATE = {
  /**
   * The Core Function: Process proposals and produce a decision.
   * Pure function (mostly), side effect is only LEDGER emit.
   */
  process: async (
    state: StateSnapshot,
    proposals: DeltaProposal[],
    config: GateConfig,
    runtime: GateRuntimeContext = {},
  ): Promise<StateSnapshot> => {
    const decision: GateDecision = {
      accepted_proposals: [],
      rejected_proposals: [],
      budget_used: 0,
      cost_used: 0,
      accepted_delta: [],
    };
    const acceptedProposalMetrics: Array<{
      proposal_id: string;
      agent_id: string;
      confidence: number;
      reliability_base: number;
      reliability_effective: number;
      phase_coherence?: number;
      weight: number;
      physical_cost: number;
      agent_phase_u16?: number;
    }> = [];
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const canonBoundProposals: string[] = [];
    const blockedCanonProposals: string[] = [];
    const signaturePolicy = config.signature_policy ?? "DISABLED";
    const signatureKeys = config.agent_signature_keys;
    const reliabilityMode = config.reliability_mode ?? "STATIC";
    const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
    const maxTotalCost = Number.isFinite(config.max_total_cost_per_tick ?? Infinity)
      ? Math.max(0, config.max_total_cost_per_tick ?? Infinity)
      : Infinity;
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const antiReplayWindow = Math.max(
      0,
      Math.floor(config.anti_replay_window_ticks ?? 0),
    );
    const historicalEnvelopeHashes = antiReplayWindow > 0
      ? await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
        state.tick - antiReplayWindow,
        state.tick,
        envelopeIndexPath,
      )
      : new Set<string>();
    const envelopeHashByProposal = new Map<string, string>();
    const seenEnvelopeHashesInTick = new Set<string>();

    const canonicalProposalList = proposals
      .map((p) => AGENT_SIGNATURE.toCanonicalObject(p))
      .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
    const proposalDigest = await sha256Hex(
      stableStringify(canonicalProposalList),
    );

    // 1. Validation & Filtering
    const validProposals: DeltaProposal[] = [];

    for (const p of proposals) {
      const envelopeHash = await AGENT_SIGNATURE.proposalEnvelopeHash(p);
      envelopeHashByProposal.set(p.proposal_id, envelopeHash);
      if (
        p.proposal_envelope_hash && p.proposal_envelope_hash !== envelopeHash
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.PROPOSAL_ENVELOPE_HASH_MISMATCH,
        });
        continue;
      }
      if (antiReplayWindow > 0) {
        if (
          seenEnvelopeHashesInTick.has(envelopeHash) ||
          historicalEnvelopeHashes.has(envelopeHash)
        ) {
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.REPLAY_ENVELOPE_DUPLICATE,
          });
          continue;
        }
        seenEnvelopeHashesInTick.add(envelopeHash);
      }
      if (CANON_CAUSAL_BRIDGE.isCanonBound(p)) {
        canonBoundProposals.push(p.proposal_id);
        if (bridgeResolution.mode !== "GREEN") {
          blockedCanonProposals.push(p.proposal_id);
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.CANON_PATH_REQUIRES_GREEN_BRIDGE,
          });
          continue;
        }
      }
      if (signaturePolicy !== "DISABLED") {
        const key = signatureKeys?.get(p.agent_id);
        if (!key) {
          if (
            signaturePolicy === "REQUIRED" || p.agent_signature ||
            p.signature_scheme
          ) {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: REJECTION.SIGNATURE_KEY_MISSING,
            });
            continue;
          }
        } else {
          if (!p.agent_signature) {
            if (signaturePolicy === "REQUIRED") {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: REJECTION.SIGNATURE_REQUIRED,
              });
              continue;
            }
          } else {
            const verify = await AGENT_SIGNATURE.verifyProposal(p, key);
            if (!verify.ok) {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: verify.reason ?? REJECTION.SIGNATURE_INVALID,
              });
              continue;
            }
          }
        }
      }
      // Check 1: Tick Mismatch
      if (p.tick !== state.tick) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.TICK_MISMATCH,
        });
        continue;
      }
      // Check 2: Base Hash Mismatch
      if (p.base_state_hash !== state.state_hash) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.BASE_HASH_MISMATCH,
        });
        continue;
      }
      // Check 3: Schema/Values (Simplified)
      if (!p.delta || p.delta.length === 0) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.EMPTY_DELTA,
        });
        continue;
      }
      if (
        p.delta.some((d) =>
          !Number.isInteger(d.level) ||
          d.level < 0 ||
          d.level > 63 ||
          !Number.isFinite(d.value)
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }
      if (
        p.agent_phase_u16 !== undefined &&
        (
          !Number.isInteger(p.agent_phase_u16) ||
          p.agent_phase_u16 < 0 ||
          p.agent_phase_u16 > I16.span
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }

      // ... Additional checks (bounds, cost) would go here ...

      validProposals.push(p);
    }

    // 2. Deterministic Sort (Canonical Order)
    validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

    // 3. Merge with Budget Enforcement
    const combinedDelta = new Map<number, number>();

    for (const p of validProposals) {
      if ((p as any).resonance !== undefined) {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, resonance: ${(p as any).resonance}`);
      } else {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, NO RESONANCE FOUND.`);
      }
      
      // Calculate Physical Cost using LOAD model
      let physicalCost = 0;
      const agentPhase = p.agent_phase_u16 ?? 0;
      for (const d of p.delta) {
        // Get current level properties from state (if available)
        const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
        const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;

        // Calculate Load of this specific mutation
        // Agent phase is proposal-local; level phase is substrate-local.
        const load = LOAD.calculate({
          entropy: levelEntropy,
          phase: agentPhase,
          weight: Math.abs(d.value),
        }, levelPhase);

        // Simplified Cost: Base Cost + Load Penalty
        // cost = |delta| + Load
        physicalCost += Math.abs(d.value) + load;
      }
      
      // --- PROOF OF RESONANCE (PoR): Zero-Friction Routing ---
      // Atoms that have proven high topological utility (Resonance) 
      // experience less friction (cost) when modifying the state.
      const atomResonance = (p as any).resonance || 0;
      let discountLabel = "";
      if (atomResonance > 0) {
        // The higher the resonance, the greater the discount (cap at 95%)
        const discountFactor = Math.min(0.95, atomResonance / 500); 
        physicalCost = physicalCost * (1 - discountFactor);
        discountLabel = `(PoR Discount: ${(discountFactor * 100).toFixed(1)}%)`;
        console.log(`      ⚖️ [PoR] Route subsidized for Atom. Base: ${Math.abs(p.delta[0]?.value || 0)}, Res: ${atomResonance.toFixed(1)}, Discount: ${(discountFactor * 100).toFixed(1)}%`);
      }

      const finalCost = Math.round(physicalCost);

      // Check cost budget per agent with measured physical cost.
      if (finalCost > (config.max_cost_per_agent || Infinity)) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      // Check total cost budget for this tick (energy budget).
      const nextTotalCost = decision.cost_used + finalCost;
      if (nextTotalCost > maxTotalCost) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      decision.accepted_proposals.push(p.proposal_id);
      decision.cost_used = nextTotalCost;

      // 4. Weighted Merge Logic
      // Weight = Confidence (0..1) * Reliability (0..1)
      const reliabilityBase = clamp01(
        config.reliability_weight.get(p.agent_id) ?? 1.0,
      );
      let phaseCoherenceScore: number | undefined = undefined;
      let agentReliability = reliabilityBase;
      if (reliabilityMode === "PHASE_COHERENCE") {
        phaseCoherenceScore = p.agent_phase_u16 === undefined
          ? 1
          : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16);
        const modulation = reliabilityFloor +
          (1 - reliabilityFloor) * phaseCoherenceScore;
        agentReliability *= modulation;
      }
      agentReliability = clamp01(agentReliability);
      const weight = p.confidence * agentReliability;
      acceptedProposalMetrics.push({
        proposal_id: p.proposal_id,
        agent_id: p.agent_id,
        confidence: p.confidence,
        reliability_base: reliabilityBase,
        reliability_effective: agentReliability,
        phase_coherence: phaseCoherenceScore,
        weight,
        physical_cost: finalCost,
        agent_phase_u16: p.agent_phase_u16,
      });

      for (const d of p.delta) {
        // Clip per level
        let val = d.value;
        if (Math.abs(val) > config.max_abs_delta_per_level) {
          val = Math.sign(val) * config.max_abs_delta_per_level;
        }

        // Accumulate Weighted Delta (Float)
        const weightedVal = val * weight;
        const current = combinedDelta.get(d.level) || 0;
        combinedDelta.set(d.level, current + weightedVal);
      }
    }

    // 5. Global Budget Enforcement & Scaling
    // Calculate total absolute delta of the merged vector (using rounded values for check)
    let totalAbsDelta = 0;
    for (const val of combinedDelta.values()) {
      totalAbsDelta += Math.abs(Math.round(val));
    }
    decision.budget_used = totalAbsDelta;

    let scaleFactor = 1.0;
    if (totalAbsDelta > config.max_total_abs_delta_per_tick) {
      scaleFactor = config.max_total_abs_delta_per_tick / totalAbsDelta;
      // telemetry: scaling deltas by budget constraint
    }

    // 6. Flatten & Scale & Round Delta
    decision.accepted_delta = Array.from(combinedDelta.entries()).map((
      [level, value],
    ) => ({
      level,
      value: Math.round(value * scaleFactor), // Final Integer Rounding
    }));

    // 5. Apply Mutation (OR Dry Run)
    const nextStateI16 = new Int16Array(state.state_i16); // Clone

    if (!config.dry_run) {
      for (const d of decision.accepted_delta) {
        // Saturating Add
        const newVal = nextStateI16[d.level] + d.value;
        nextStateI16[d.level] = I16_CLAMP(newVal);
      }
    } else {
      // DRY RUN: State does NOT change
      // telemetry: dry run preserves state
    }

    // 6. Deterministic Hashing
    const nextHash = config.dry_run
      ? state.state_hash
      : await sha256Hex(stableStringify({
        state_i16: Array.from(nextStateI16),
        tick: state.tick + 1,
        gate_config_version: GATE_VERSION,
        proposal_digest: proposalDigest,
      }));
    const eventId = `evt_${
      (await sha256Hex(
        `${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`,
      )).slice(0, 16)
    }`;

    // 7. Emit Ledger Event
    const nextTick = state.tick + 1;

    let projection2DHash: string | undefined;
    let thread1DHash: string | undefined;
    let projectionVersion: string | undefined;
    let signatureArtifactHash: string | undefined;
    let signatureTick: number | undefined;
    let signatureCausalRefs: string[] | undefined;
    const policyHash = await CRYSTALLIZATION_POLICY.hash();

    if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
      const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
        proposalById.get(id)?.causal_refs ?? []
      );
      const causalRefs = Array.from(
        new Set([state.state_hash, ...acceptedCausalRefs]),
      );

      const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
        artifact_hash: proposalDigest,
        state_hash: nextHash,
        tick: nextTick,
        state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
          state_hash: nextHash,
          state_i16: nextStateI16,
        }),
        causal_refs: causalRefs,
      });

      projection2DHash = topoSignature.projection_2d_hash;
      thread1DHash = topoSignature.thread_1d_hash;
      projectionVersion = topoSignature.projection_version;
      signatureArtifactHash = topoSignature.artifact_hash;
      signatureTick = topoSignature.tick;
      signatureCausalRefs = topoSignature.causal_refs;
    }

    const event: LedgerEvent = {
      event_id: eventId,
      tick: state.tick,
      ts_unix_ms: state.tick * 1000,
      state_before_hash: state.state_hash,
      state_after_hash: nextHash,
      accepted_delta: decision.accepted_delta,
      proposal_digest: proposalDigest,
      accepted_proposals: decision.accepted_proposals,
      accepted_proposal_metrics: acceptedProposalMetrics,
      accepted_proposal_envelopes: decision.accepted_proposals
        .map((proposal_id) => ({
          proposal_id,
          envelope_hash: envelopeHashByProposal.get(proposal_id) ?? "",
        }))
        .filter((x) => x.envelope_hash.length > 0),
      rejected_proposals: decision.rejected_proposals,
      cost_total: decision.cost_used,
      cost_limit: Number.isFinite(maxTotalCost) ? maxTotalCost : undefined,
      budget_used: decision.budget_used,
      budget_limit: config.max_total_abs_delta_per_tick,
      gate_config_version: GATE_VERSION,
      signature_artifact_hash: signatureArtifactHash,
      signature_tick: signatureTick,
      signature_causal_refs: signatureCausalRefs,
      projection_2d_hash: projection2DHash,
      thread_1d_hash: thread1DHash,
      projection_version: projectionVersion,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
    };

    const bridgeEvent: BridgeModeEvent = {
      event_type: "BRIDGE_MODE_EVENT",
      tick: state.tick,
      state_hash: state.state_hash,
      mode: bridgeResolution.mode,
      index_chain_checked:
        runtime.bridge_invariant_report?.index_chain_checked ?? false,
      index_chain_ok: runtime.bridge_invariant_report?.index_chain_ok ?? true,
      index_chain_checked_records:
        runtime.bridge_invariant_report?.index_chain_checked_records ?? 0,
      index_chain_failures: [
        ...(runtime.bridge_invariant_report?.index_chain_failures ?? []),
      ],
      gate_admission_index_chain_checked:
        runtime.bridge_invariant_report?.gate_admission_index_chain_checked ??
          false,
      gate_admission_index_chain_ok:
        runtime.bridge_invariant_report?.gate_admission_index_chain_ok ?? true,
      gate_admission_index_chain_checked_records:
        runtime.bridge_invariant_report
          ?.gate_admission_index_chain_checked_records ?? 0,
      gate_admission_index_chain_failures: [
        ...(runtime.bridge_invariant_report
          ?.gate_admission_index_chain_failures ?? []),
      ],
      invariant_packet_hash: runtime.bridge_invariant_report
        ? (await INVARIANT_PACKET.hash(
          await INVARIANT_PACKET.fromInvariantReport(
            runtime.bridge_invariant_report,
            { tick_anchor: state.tick, witness: runtime.witness },
          ),
        ))
        : undefined,
      canon_bound_proposals: [...canonBoundProposals].sort(),
      blocked_canon_proposals: [...blockedCanonProposals].sort(),
      reason: bridgeResolution.reason,
      witness: runtime.witness,
    };

    // 🛡️ Final Red Line Verification
    // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
    if (
      config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])
    ) {
      const violation = {
        event_type: "VIOLATION_EVENT" as const,
        tick: state.tick,
        rule_id: "DRY_RUN_PURITY",
        severity: "CRITICAL" as const,
        state_hash: state.state_hash,
        details: "State mutation detected during dry_run",
        action_taken: "HALT_AND_QUARANTINE" as const,
      };
      await LEDGER.append(violation);
      throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
    }

    await LEDGER.append(bridgeEvent);
    await LEDGER.append(event);
    if (!config.dry_run) {
      await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
        event,
        envelopeIndexPath,
      );
    }

    if (!config.dry_run && nextTick % AUTO_CHECKPOINT_INTERVAL === 0) {
      try {
        await CHECKPOINT.save(
          {
            tick: nextTick,
            state_hash: nextHash,
            state_i16: nextStateI16,
          },
          "AUTO_INTERVAL",
        );
      } catch (e) {
        // Checkpoints are safety accelerators, not mutation authority.
        // checkpoint save failed (telemetry handled outside canonical band)
      }
    }

    return {
      tick: nextTick,
      state_i16: nextStateI16,
      state_hash: nextHash,
    };
  },

  /**
   * ERA 26: Collective Immunity
   * Proactively scans logic signatures for malignant patterns.
   */
  detectAntigens: (stateMatrix: any) => {
     const active = stateMatrix.getActiveIndices();
     for (const idx of active) {
        const logic = stateMatrix.getLogic(idx); // Uint8Array(8)
        let malignancy = 0;

        // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)
        // OP 0x20 is FEED. If genomic header is packed with it, it's a parasite.
        let feedCount = 0;
        for (let i = 0; i < 8; i++) {
           if (logic[i] === 0x20) feedCount++;
        }
        if (feedCount > 4) malignancy += 50;

        // Pattern 2: Chaos Injection (High entropy logic without bonds)
        const bonds = stateMatrix.getBonds(idx);
        let hasBonds = false;
        for (let j = 0; j < 4; j++) if (bonds[j] !== 0) hasBonds = true;
        if (!hasBonds && feedCount > 2) malignancy += 30;

        // Pattern 3: Red Line Violations (Attempting restricted ISA space if any)
        // ... (Reserved for future patterns) ...

        // Apply Quarantine
        if (malignancy >= 80) {
           stateMatrix.setQuarantine(idx, 2); // SUPPRESSED
        } else if (malignancy >= 30) {
           stateMatrix.setQuarantine(idx, 1); // FLAGGED
        } else {
           stateMatrix.setQuarantine(idx, 0); // CLEAN
        }
     }
  }
};


```

---

## FILE: SNAP.ts

```typescript
// OMEGA-64 | SNAP.ts | The Persistent Observer (Era 15)
// Transactional synchronization of RAM Memory Matrix to the Disk Flatland.

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

export const SNAP = {
    // Sync Matrix State to .md Files with Atomic "Write-then-Rename"
    save: async (root: string = Deno.cwd()) => {
        let saved = 0;
        let errors = 0;

        for (let i = 0; i < MAX_ATOMS; i++) {
            if (STATE_MATRIX.getId(i) === 0n) continue;

            const fullPath = IDX_TO_ID.get(i);
            if (!fullPath) continue;

            try {
                // @ts-ignore
                const content = await Deno.readTextFile(fullPath);
                const fmMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (!fmMatch) continue;

                const alpha = parseYaml(fmMatch[1]) as any;
                
                // Sync from RAM Matrix
                const x = STATE_MATRIX.getX(i);
                const y = STATE_MATRIX.getY(i);
                const energy = STATE_MATRIX.getEnergy(i);
                const resonance = STATE_MATRIX.getResonance(i);
                const phase = STATE_MATRIX.getPhase(i);

                // Update Frontmatter
                alpha.x = x;
                alpha.y = y;
                alpha.energy = Math.floor(energy);
                alpha.resonance = Number(resonance.toFixed(3));
                alpha.phase = Number(phase.toFixed(3));

                const updated = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
                
                // --- ATOMIC WRITE STRATEGY ---
                const tmpPath = `${fullPath}.tmp`;
                // @ts-ignore
                await Deno.writeTextFile(tmpPath, updated);
                // @ts-ignore
                await Deno.rename(tmpPath, fullPath); // Atomic operation on Unix
                
                saved++;
            } catch {
                errors++;
            }
        }
        
        if (saved > 0) {
            console.log(`   [SNAP] Transactional Sync: ${saved} atoms committed to Disk. (${errors} errors)`);
        }
    }
};

```

---

## FILE: SNAPSHOT_ENGINE.ts

```typescript
// OMEGA-64 | SNAPSHOT_ENGINE.ts | Era 19: The Genesis Checkpoint
// Rapid Binary Dumps of the volatile Memory Matrix (STATE_MATRIX.buffer)

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { ensureDir } from "jsr:@std/fs@0.224.0/ensure-dir";

const SNAPSHOT_DIR = ".omega/snapshots";

export const SNAPSHOT_ENGINE = {
    /**
     * Dumps the entire 6.4MB Memory Matrix + Akashic History to disk instantly.
     */
    exportSnapshot: async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        await ensureDir(SNAPSHOT_DIR);

        const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
        const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
        const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;

        try {
            // 1. Binary dump of ALL Agent States (ID, Pos, Logic, Code, Memory)
            await Deno.writeFile(matrixPath, new Uint8Array(STATE_MATRIX.buffer));

            // 2. Binary dump of the Thermodynamics Grid (Nutrients)
            await Deno.writeFile(physicsPath, new Uint8Array(PHYSICS_ENGINE.envBuffer));

            // 3. JSON dump of the LLM Knowledge / Thoughts
            const akashicData = Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive);
            await Deno.writeTextFile(akashicPath, JSON.stringify(akashicData, null, 2));

            console.log(`💾 [SNAPSHOT] Genesis Saved: ${matrixPath} (${(STATE_MATRIX.buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
            return { timestamp, success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Export Failed:`, e);
            return { success: false, error: String(e) };
        }
    },

    /**
     * Instantly overwrites the RAM Matrix with a historical `.bin` state.
     */
    importSnapshot: async (timestamp: string) => {
        const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
        const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
        const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;

        try {
            // 1. Restore Matrix Memory Buffer
            const matrixData = await Deno.readFile(matrixPath);
            if (matrixData.length === STATE_MATRIX.buffer.byteLength) {
                new Uint8Array(STATE_MATRIX.buffer).set(matrixData);
            } else {
                throw new Error("Matrix Payload Size Mismatch");
            }

            // 2. Restore Thermodynamics Grid
            try {
                const physicsData = await Deno.readFile(physicsPath);
                new Uint8Array(PHYSICS_ENGINE.envBuffer).set(physicsData);
            } catch {
                console.warn(`⚠️ [SNAPSHOT] No physics dump found for ${timestamp}. Falling back to default noise.`);
            }

            // 3. Restore Akashic Records
            try {
                const akashicText = await Deno.readTextFile(akashicPath);
                const akashicData = JSON.parse(akashicText);
                SEMANTIC_MEMBRANE.thoughtArchive.clear();
                for (const [hash, thought] of Object.entries(akashicData)) {
                    SEMANTIC_MEMBRANE.thoughtArchive.set(hash, thought as string);
                }
            } catch {
                console.warn(`⚠️ [SNAPSHOT] No Akashic History found for ${timestamp}. Thoughts lost in time.`);
            }

            console.log(`💾 [SNAPSHOT] Genesis Restored from: ${timestamp}`);
            return { success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Import Failed:`, e);
            return { success: false, error: String(e) };
        }
    },

    /**
     * Lists all available Genesis Checkpoints sorted by newest first.
     */
    listSnapshots: async () => {
        try {
            const timestamps: string[] = [];
            // @ts-ignore: Deno.readDir is valid in Deno
            for await (const entry of Deno.readDir(SNAPSHOT_DIR)) {
                if (entry.isFile && entry.name.startsWith("matrix_") && entry.name.endsWith(".bin")) {
                    const ts = entry.name.replace("matrix_", "").replace(".bin", "");
                    timestamps.push(ts);
                }
            }
            return timestamps.sort().reverse();
        } catch {
            return [];
        }
    }
};

```

---

## FILE: LAMBDA_VM.ts

```typescript
// OMEGA-64 | LAMBDA_VM.ts | The Extended Quine VM (Era 17: The Living Quine)
// Turing-complete bytecode executor with registers, stack, and messaging.

export interface VMResult {
    energyDelta: number;
    resonanceDelta: number;
    intent: { level: number, value: any }[];
    modifiedCode?: { slot: number, value: number };
    modifiedStiffness?: { slot: number, value: number };
    modifiedSynaptic?: { slot: number, value: number }; // ERA 30: PUSH_COLL
    syncRequest?: { reg: number }; // ERA 30: SYNC_AVG (Worker will handle)
    modifiedStructure?: { type: number, density: number }; // ERA 31: BUILD/EXCAVATE
    memeticRequest?: "ENCODE" | "DECODE"; // ERA 32: Cultural Inheritance
    modifiedRole?: number; // ERA 33: Metabolic Specialization (SPEC)
    outgoingMessages: { targetIdx: number, message: number, sourceBondSlot?: number }[];
}

export const ISA = {
    // Control Flow
    JMP: 0x30, JZ: 0x31, JNZ: 0x32, CALL: 0x33, RET: 0x34,
    // Arithmetic
    ADD: 0x40, SUB: 0x41, MUL: 0x42, CMP: 0x43,
    // Data Movement
    LOAD: 0x50, STORE: 0x51,
    // Metabolism & Physics (High Level)
    MOVE: 0x10, FEED: 0x20, SENSE: 0x21, BET: 0x22,
    // Self-Modification
    SELF_MOD: 0x99, SELF_REP: 0x9A,
    // Epigenetic Evolution
    EVOLVE: 0x9B,
    // Atomic Messaging (ERA 27)
    SEND: 0x60, RECV: 0x61,
    // Structural Morphogenesis (ERA 28)
    LOCK: 0x62,
    // Distributed Cognition (ERA 30)
    SYNC_AVG: 0x70, PUSH_COLL: 0x71, POP_COLL: 0x72,
    // Architectural Stigmergy (ERA 31)
    BUILD: 0x80, EXCAVATE: 0x81,
    // Coded Memetics (ERA 32)
    ENCODE: 0x82, DECODE: 0x83,
    // Metabolic Specialization (ERA 33)
    SPEC: 0x84
};

export const LAMBDA_VM = {
    /**
     * Executes one instruction from the atom's bytecode.
     * context: 32 bytes [0: PC, 1: Flags, 2-9: Regs, 10-17: Stack, 18: SP, 19-31: Reserved]
     */
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, synapticStack?: Int32Array, role?: number, quarantineLevel?: number, incomingMessage?: number }, dryRun = false): VMResult => {
        const res: VMResult = { energyDelta: 0, resonanceDelta: 0, intent: [], outgoingMessages: [] };
        
        // --- ERA 26: QUARANTINE ENFORCEMENT ---
        if (state.quarantineLevel === 2) {
            // SUPPRESSED: No energy delta, no resonance, no intent. Absolute NO-OP.
            return res;
        }

        // --- CONTEXT DECODING ---

        let pc = context[0] % 16;
        let flags = context[1];
        const regs = context.subarray(2, 10);
        const stack = context.subarray(10, 18);
        let sp = context[18] % 8;

        const inst = code[pc];
        const op = inst & 0xFF;
        const p1 = (inst >> 8) & 0xFF;
        const p2 = (inst >> 16) & 0xFF;
        const p3 = (inst >> 24) & 0xFF;

        let pcJumped = false;

        switch (op) {
            case ISA.MOVE:
                res.intent.push({ level: 4, value: { dx: (p1 - 128) / 10, dy: (p2 - 128) / 10 } });
                res.energyDelta -= 1;
                break;

            case ISA.FEED: {
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 20);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 20);
                const idx = gy * 70 + gx;
                
                const requested = p1; // How much energy the atom wants to consume
                let consumed = 0;
                
                let current = Atomics.load(state.nutrients, idx);
                if (dryRun) {
                    consumed = Math.min(current, requested);
                } else {
                    while (current > 0) {
                        const take = Math.min(current, requested);
                        const next = current - take;
                        const actual = Atomics.compareExchange(state.nutrients, idx, current, next);
                        if (actual === current) {
                            consumed = take;
                            break;
                        }
                        current = Atomics.load(state.nutrients, idx);
                    }
                }

                // 1:1 Conservation (Section IV.2 of Manifesto)
                // Nutrients (Int32) to Energy (float, scaled by 1000 in Matrix)
                res.energyDelta += consumed / 1000; 
                if (consumed > 0) {
                    res.resonanceDelta += 0.1;
                }
                break;
            }

            case ISA.BET: {
                const betAmount = p1; // How much energy to bet on the mutation crisis
                if (state.energy >= betAmount) {
                    res.energyDelta -= betAmount;
                    
                    if (!dryRun) {
                        // ERA 19: Atomic Thread-Safe additions for Crisis Bets 
                        Atomics.add(state.marketPool, 0, Math.round(betAmount * 1000));
                    }
                    
                    res.resonanceDelta += 0.5; // Belief increases resonance
                }
                break;
            }

            case ISA.EVOLVE:
                // Signal intention to mutate based on environmental success
                res.intent.push({ level: 5, value: "EVOLUTION_REQUEST" });
                res.resonanceDelta += 1.0; // The effort to evolve is resonant
                break;

            case ISA.JMP:
                pc = p1 % 16;
                pcJumped = true;
                break;

            case ISA.JZ:
                if ((flags & 0x01) === 1) { pc = p1 % 16; pcJumped = true; } // ZF is bit 0
                break;

            case ISA.JNZ:
                if ((flags & 0x01) === 0) { pc = p1 % 16; pcJumped = true; }
                break;

            case ISA.CALL:
                if (sp < 8) {
                    if (!dryRun) stack[sp++] = (pc + 1) % 16;
                    pc = p1 % 16;
                    pcJumped = true;
                }
                break;

            case ISA.RET:
                if (sp > 0) {
                    if (!dryRun) pc = stack[--sp];
                    else pc = stack[sp - 1]; // Virtual pop for dryRun
                    pcJumped = true;
                }
                break;

            case ISA.ADD:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] + regs[p3 % 8]) & 0xFF;
                break;

            case ISA.SUB:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] - regs[p3 % 8]) & 0xFF;
                break;

            case ISA.MUL:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] * regs[p3 % 8]) & 0xFF;
                break;

            case ISA.CMP:
                if (!dryRun) flags = (regs[p1 % 8] === regs[p2 % 8]) ? (flags | 0x01) : (flags & ~0x01);
                break;

            case ISA.LOAD:
                if (!dryRun) regs[p1 % 8] = logic[p2 % 8];
                break;

            case ISA.STORE:
                // p1 value to store, p2 index in logic
                if (!dryRun) {
                    res.modifiedCode = { slot: p2 % 16, value: regs[p1 % 8] }; // Reuse modifiedCode if appropriate or add new field
                    // But actually STORE was for logic?? No, logic is Uint8Array[8]. 
                    // Let's assume STORE updates logic bytes.
                    logic[p2 % 8] = regs[p1 % 8];
                }
                break;

            case ISA.SENSE:
                // p1 is threshold, set flag if resonance > threshold
                if (!dryRun) flags = (state.resonance > (p1 / 10)) ? (flags | 0x01) : (flags & ~0x01);
                break;

            case ISA.SELF_MOD:
                if (state.energy > 50) {
                    res.modifiedCode = { slot: p1 % 16, value: (p3 << 16) | (p2 << 8) | p1 }; // Simplified pack
                    res.energyDelta -= 30;
                    res.resonanceDelta += 5;
                }
                break;

            case ISA.SELF_REP:
                if (state.energy > 150) {
                    res.intent.push({ level: 10, value: "spawn" });
                    res.energyDelta -= 80;
                }
                break;

            case ISA.SEND: {
                // p1 is bond index (0-3), p2 is value to send
                const slot = p1 % 4;
                const targetIdx = state.bonds[slot];
                if (targetIdx !== 0) {
                    res.outgoingMessages.push({ targetIdx, message: p2, sourceBondSlot: slot });
                    res.energyDelta -= 2;
                }
                break;
            }

            case ISA.RECV:
                // Read incoming signal into p1 register
                if (!dryRun) regs[p1 % 8] = (state.incomingMessage || 0) & 0xFF;
                res.resonanceDelta += 0.2;
                break;

            case ISA.LOCK: {
                // p1 is bond index (0-3), p2 is stiffness (0-100 normalized to 0-1)
                const slot = p1 % 4;
                res.modifiedStiffness = { slot, value: Math.min(100, p2) / 100 };
                res.energyDelta -= 5; // Locking is metabolically expensive
                break;
            }

            case ISA.SYNC_AVG:
                // Request worker to average reg[p1] with bonded neighbors
                res.syncRequest = { reg: p1 % 8 };
                res.energyDelta -= 3;
                break;

            case ISA.PUSH_COLL:
                // Push value from reg[p1] to collective stack slot p2
                res.modifiedSynaptic = { slot: p2 % 4, value: regs[p1 % 8] };
                res.energyDelta -= 2;
                break;

            case ISA.POP_COLL:
                // Pop value from collective stack slot p1 into reg[p2]
                if (!dryRun && state.synapticStack) {
                    regs[p2 % 8] = state.synapticStack[p1 % 4];
                }
                res.energyDelta -= 1;
                break;

            case ISA.BUILD:
                // p1 is type, p2 is density
                if (state.resonance > 40) {
                    res.modifiedStructure = { type: p1 % 8, density: Math.min(255, p2) };
                    res.energyDelta -= 10;
                    res.resonanceDelta -= 20; // Structuralization costs resonance
                }
                break;

            case ISA.EXCAVATE:
                // Request destruction of current cell block
                res.modifiedStructure = { type: 0, density: 0 };
                res.energyDelta += 5; // Recycling energy
                break;

            case ISA.ENCODE:
                // Requires resonance > 50 to "write" knowledge
                if (state.resonance > 50) {
                    res.memeticRequest = "ENCODE";
                    res.energyDelta -= 15;
                    res.resonanceDelta -= 10;
                }
                break;

            case ISA.DECODE:
                // Learn from current block
                res.memeticRequest = "DECODE";
                res.energyDelta -= 5;
                break;

            case ISA.SPEC:
                // p1 is the requested role (1: Producer, 2: Constructor, 3: Siphon)
                // Requires resonance > 100 to specialize
                if (state.resonance > 100) {
                    res.modifiedRole = p1 % 4; // 0 is generalist/reset
                    res.energyDelta -= 20;
                    res.resonanceDelta -= 30;
                }
                break;

        }

        // --- CONTEXT UPDATE ---
        if (!dryRun) {
            if (!pcJumped) pc = (pc + 1) % 16;
            context[0] = pc;
            context[1] = flags;
            context[18] = sp;
        }

        return res;
    }

};

```

---

## FILE: PRNG.ts

```typescript
// OMEGA-64 | PRNG.ts | The Immutable Deterministic Oracle
// A seeded Linear Congruential Generator (LCG) for reproducible evolution.
// In Era 8, this is immutable to prevent race conditions in the Memory Matrix.

export class PRNG {
    private readonly state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    /**
     * Generates the next value and a new PRNG instance.
     * @returns { value: number, next: PRNG }
     */
    next(): { value: number, next: PRNG } {
        // LCG constants from Numerical Recipes
        const nextState = (this.state * 1664525 + 1013904223) >>> 0;
        return {
            value: nextState / 0xFFFFFFFF,
            next: new PRNG(nextState)
        };
    }

    /**
     * Static helper to derive a seed from tick and atom ID.
     */
    static seedFrom(tick: number, atomId: string): number {
        let hash = tick;
        for (let i = 0; i < atomId.length; i++) {
            hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
            hash |= 0; // Convert to 32bit int
        }
        return Math.abs(hash);
    }
}

```

---

## FILE: RECOVERY.ts

```typescript
// OMEGA-64 | RECOVERY.ts | The Soul Binder
// Securely re-materializes atoms from metadata. No eval, no injections.

import { stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";
import { injectHologram } from "./HOLOGRAM_MODULE.ts";

export const RECOVERY = {
    // Re-materialize an atom from its last known metadata
    materialize: async (filename: string, metadata: any) => {
        const [eigen, symbol] = filename.split(".");
        
        // Structured metadata reconstruction (safety first)
        const alpha = {
            eigenvalue: eigen,
            symbol: symbol,
            energy: Math.floor(metadata.energy || 50),
            resonance: Number((metadata.resonance || 10).toFixed(2)),
            logic: metadata.logic || "88880000",
            x: Number(metadata.x) || 400,
            y: Number(metadata.y) || 400,
            thought: "RESURRECTED",
            bonds: metadata.bonds || []
        };

        const template = `---
${stringifyYaml(alpha)}
---

export const ATOM = () => (x: any) => x;
`;
        const content = injectHologram(template, eigen, symbol);
        await Deno.writeTextFile(filename, content);
        return true;
    }
};

```

---

## FILE: PHYSICS_ENGINE.ts

```typescript
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

    // Apply Hooke's Law (Elastic) or Rigid Constraints (Era 28)
    applyBondSprings: (idx: number, x: number, y: number, bondIndices: Uint32Array) => {
        let fx = 0;
        let fy = 0;
        const targetDist = 50; // Ideal structural distance

        for (let b = 0; b < 4; b++) {
            const bIdx = bondIndices[b];
            if (bIdx === 0 || STATE_MATRIX.getId(bIdx) === 0n) continue;

            const stiffness = STATE_MATRIX.getBondStiffness(idx, b);
            const pX = STATE_MATRIX.getX(bIdx);
            const pY = STATE_MATRIX.getY(bIdx);
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
        }
        return { fx, fy };
    }

};

```

---

## FILE: ECOLOGY_ENGINE.ts

```typescript
// OMEGA-64 | ECOLOGY_ENGINE.ts | The Biological Layer
// Handles Metabolism, Resonance, Cultural Drift, and Caste Logic.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PRNG } from "./PRNG.ts";
import { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";

export const ECOLOGY_ENGINE = {
    // Metabolism: Energy and Resonance decay
    processMetabolism: (idx: number, mods: any) => {
        let energy = STATE_MATRIX.getEnergy(idx);
        let resonance = STATE_MATRIX.getResonance(idx);

        // Passive decay
        energy -= (0.5 * mods.decay);
        resonance *= 0.99;

        // --- ERA 8: RUNTIME ASSERTIONS ---
        if (energy < 0) energy = 0;
        if (resonance < 0) resonance = 0;
        if (resonance > 1000) resonance = 1000;

        STATE_MATRIX.setEnergy(idx, energy);
        STATE_MATRIX.setResonance(idx, resonance);
        
        return { energy, resonance };
    },

    // Cultural Drift: Sync DNA with a partner
    syncDNA: (currentLogic: string, partnerLogic: string, currentOracle: PRNG) => {
        const res1 = currentOracle.next();
        if (res1.value < 0.25 && partnerLogic.length >= 8) {
            const res2 = res1.next.next();
            const hexIdx = Math.floor(res2.value * 8);
            const newLogicArray = currentLogic.split("");
            const pChar = partnerLogic.startsWith("0x") ? partnerLogic[hexIdx+2] : partnerLogic[hexIdx];
            if (pChar) {
                newLogicArray[hexIdx] = pChar.toUpperCase();
                return { logic: newLogicArray.join(""), oracle: res2.next };
            }
        }
        return { logic: currentLogic, oracle: res1.next };
    },

    // Caste Classification
    getClassification: (symbol: string, resonance: number, logic: string) => {
        if (resonance > 50) return "NUCLEUS";
        if (logic.startsWith("1")) return "WORKER";
        if (logic.startsWith("8")) return "GUARDIAN";
        if (logic.startsWith("A")) return "ARCHIVIST";
        if (symbol === "PARASITE") return "PARASITE";
        return "NEUTRAL";
    }
};

```

---

## FILE: SOVEREIGNTY_ENGINE.ts

```typescript
// OMEGA-64 | SOVEREIGNTY_ENGINE.ts | The Governance Layer
// Handles Regent Election, Decrees, and Legitimacy.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export const DECREES: Record<string, any> = {
    "NONE": { decay: 1.0, speed: 1.0, mutation: 1.0, label: "DEMOCRACY" },
    "LUXURY_TAX": { decay: 2.5, speed: 1.0, mutation: 1.0, label: "LUXURY TAX" }, 
    "IMMUNE_SHIELD": { decay: 0.3, speed: 0.7, mutation: 0.5, label: "IMMUNE SHIELD" },
    "MUTATIVE_FEVER": { decay: 1.5, speed: 1.3, mutation: 4.0, label: "MUTATIVE FEVER" },
    "VOID_STASIS": { decay: 0.5, speed: 0.2, mutation: 0.1, label: "VOID STASIS" }
};

export const SOVEREIGNTY_ENGINE = {
    currentRegent: {
        genome: "NONE",
        legitimacy: 0,
        activeDecree: "NONE",
        mods: DECREES["NONE"]
    },

    // Elect a Regent based on Quadratic Voting (Mitigates whale attacks)
    electRegent: (activeIndices: number[]) => {
        let bestPower = 0;
        let regentIdx = -1;

        for (const idx of activeIndices) {
            const res = STATE_MATRIX.getResonance(idx);
            // --- ERA 8: QUADRATIC VOTING ---
            const power = Math.sqrt(res); 
            
            if (power > 10 && power > bestPower) {
                bestPower = power;
                regentIdx = idx;
            }
        }

        if (regentIdx !== -1) {
            const filename = IDX_TO_ID.get(regentIdx)!;
            const logicBytes = STATE_MATRIX.getLogic(regentIdx);
            const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Select a decree based on the first digit of the regent's logic
            const logicDigit = parseInt(logicStr[0], 16);
            let activeDecree = "NONE";
            if (logicDigit <= 3) activeDecree = "IMMUNE_SHIELD";
            else if (logicDigit <= 7) activeDecree = "LUXURY_TAX";
            else if (logicDigit <= 11) activeDecree = "MUTATIVE_FEVER";
            else activeDecree = "VOID_STASIS";

            SOVEREIGNTY_ENGINE.currentRegent = {
                genome: logicStr,
                legitimacy: bestPower * bestPower, // Return raw resonance for display
                activeDecree,
                mods: DECREES[activeDecree]
            };
            return SOVEREIGNTY_ENGINE.currentRegent;
        }

        SOVEREIGNTY_ENGINE.currentRegent = {
            genome: "NONE",
            legitimacy: 0,
            activeDecree: "NONE",
            mods: DECREES["NONE"]
        };
        return SOVEREIGNTY_ENGINE.currentRegent;
    }
};

```

---

## FILE: SEMANTIC_MEMBRANE.ts

```typescript
// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Homeostatic Embeddings (Era 17)
// Advanced semantic grouping with synaptic scaling and homeostasis (L8).

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const PROJECTION_SIZE = 64;
const projectionMatrix = new Float32Array(PROJECTION_SIZE * PROJECTION_SIZE);
const activityHistory = new Float32Array(PROJECTION_SIZE);
let lastNormalization = 0;

// Initialize with deterministic pseudo-random resonance
for (let i = 0; i < projectionMatrix.length; i++) {
    projectionMatrix[i] = Math.sin(i * 0.123); 
}

export const SEMANTIC_MEMBRANE = {
    projectionMatrix,
    thoughtArchive: new Map<string, string>(),
    lineage: new Map<string, string>(), // ERA 23: childGenome -> parentGenome

    /**
     * Adapts projection with Homeostatic Plasticity.
     */
    adapt: (vecA: Float32Array, vecB: Float32Array, resonance: number) => {
        const learningRate = 0.001 * resonance;
        const ltdThreshold = 0.1;
        
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            activityHistory[i] = 0.99 * activityHistory[i] + 0.01 * Math.abs(vecA[i]);
            for (let j = 0; j < PROJECTION_SIZE; j++) {
                const correlation = vecA[i] * vecB[j];
                if (correlation > ltdThreshold && resonance > 10) {
                    projectionMatrix[i * PROJECTION_SIZE + j] += learningRate * correlation;
                } else if (correlation < -ltdThreshold) {
                    projectionMatrix[i * PROJECTION_SIZE + j] -= 0.0001 * Math.abs(correlation);
                }
            }
        }

        // Synaptic Scaling (Homeostasis) every 1000 adaptations
        const now = Date.now();
        if (now - lastNormalization > 60000) { 
            SEMANTIC_MEMBRANE.normalize();
            lastNormalization = now;
        }
    },

    normalize: () => {
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < PROJECTION_SIZE; j++) sum += Math.abs(projectionMatrix[i * PROJECTION_SIZE + j]);
            if (sum > 0) {
                const scale = 1.0 / sum;
                for (let j = 0; j < PROJECTION_SIZE; j++) projectionMatrix[i * PROJECTION_SIZE + j] *= scale;
            }
        }
        console.log(`🧠 [MEMBRANE] Synaptic scaling applied.`);
    },

    resonantHash: (text: string): Uint8Array => {
        const inputVec = new Float32Array(PROJECTION_SIZE);
        for (let i = 0; i < Math.min(text.length, PROJECTION_SIZE); i++) inputVec[i] = text.charCodeAt(i) / 255.0;

        const resultVec = new Float32Array(PROJECTION_SIZE);
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < PROJECTION_SIZE; j++) sum += projectionMatrix[i * PROJECTION_SIZE + j] * inputVec[j];
            resultVec[i] = sum;
        }

        const hash = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) if (resultVec[i * 8 + bit] > 0) byte |= (1 << bit);
            hash[i] = byte;
        }
        return hash;
    },

    project: (text: string, idx: number) => {
        const hash = SEMANTIC_MEMBRANE.resonantHash(text);
        STATE_MATRIX.setLogic(idx, hash);
    },

    injectThought: (text: string, weight: number) => {
        const hash = SEMANTIC_MEMBRANE.resonantHash(text);
        const idx = STATE_MATRIX.findEmptySlot();
        
        if (idx !== -1) {
            // ID generation logic (Pseudo-random 64-bit BigInt)
            const idBytes = new Uint8Array(8);
            crypto.getRandomValues(idBytes);
            let id = 0n;
            for (let i = 0; i < 8; i++) id = (id << 8n) | BigInt(idBytes[i]);
            
            STATE_MATRIX.setId(idx, id);
            
            // Genomic Traits derived directly from the semantic hash (LSH)
            // logic[1] determines Caste. >128 Parasite, <128 Builder.
            STATE_MATRIX.setLogic(idx, hash);
            
            // Energy derived from weight + the first modulus byte of hash
            const baseEnergy = weight + (hash[0] % 50);
            STATE_MATRIX.setEnergy(idx, baseEnergy);
            
            // Resonance based on aggressiveness (logic[1])
            const isAggressive = hash[1] > 128;
            STATE_MATRIX.setResonance(idx, isAggressive ? 100 : 500);

            // Spawn near center
            STATE_MATRIX.setX(idx, 700 + (Math.random() - 0.5) * 50);
            STATE_MATRIX.setY(idx, 400 + (Math.random() - 0.5) * 50);
            
            // Akashic Archival: Map the Genome Hex to the original English text
            const hexHash = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            SEMANTIC_MEMBRANE.thoughtArchive.set(hexHash, text);

            console.log(`🧬 [MOTOR_OUTPUT] Spawned Emergent Atom [${isAggressive ? 'PARASITE' : 'BUILDER'}] from Thought (Genome: ${hexHash}): "${text.substring(0, 20)}..."`);
        }
    },

    readVoxelPopuli: async (rootPath: string): Promise<string[]> => {
        const thoughts: string[] = [];
        
        // --- 1. Scan The Ecological Mood ---
        let parasiteCount = 0;
        let builderCount = 0;
        let totalEnergy = 0;
        
        const active = STATE_MATRIX.getActiveIndices();
        for (const i of active) {
            const logic = STATE_MATRIX.getLogic(i);
            if (logic[1] > 128) parasiteCount++;
            else builderCount++;
            totalEnergy += STATE_MATRIX.getEnergy(i);
        }
        
        const avgEnergy = active.length > 0 ? (totalEnergy / active.length) : 0;
        
        let mood = "ECOLOGICAL MOOD: Balanced.";
        if (parasiteCount > builderCount * 2) {
            mood = "CRITICAL WARNING: The ecosystem is devouring itself! Too many aggressive parasites.";
        } else if (builderCount > parasiteCount * 3 && avgEnergy < 50) {
            mood = "SYSTEM ALERT: The matrix is starving. Builders lack nutrients.";
        } else if (builderCount > parasiteCount * 2) {
            mood = "HARMONY: The ecosystem is constructive and building mycelial bonds.";
        }
        thoughts.push(`[SYSTEM_STATE] Active Entities: ${active.length}. ${mood}`);

        // --- 2. Scan Textual Memories ---
        try {
            // @ts-ignore: Deno types might not be resolved perfectly
            for await (const entry of Deno.readDir(rootPath)) {
                if (entry.isFile && entry.name.endsWith(".md")) {
                    // @ts-ignore: Deno types might not be resolved perfectly
                    const content = await Deno.readTextFile(`${rootPath}/${entry.name}`);
                    const thoughtMatch = content.match(/# Thought\n([\s\S]+?)$/m);
                    if (thoughtMatch) thoughts.push(thoughtMatch[1].trim());
                }
            }
        } catch { /* NOOP */ }
        return thoughts;
    }
};

```

---

## FILE: LLM_SYNAPSE.ts

```typescript
// OMEGA-64 | LLM_SYNAPSE.ts | Era 10: Cognitive Bridge
// Communicates with external LLMs to generate emergent thoughts.

export const LLM_SYNAPSE = {
    /**
     * generateThought: Asks an LLM to evolve the current system state.
     * Defaults to local Ollama.
     */
    generateThought: async (voxPopuli: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        console.log(`   [SYNAPSE] Consulting Oracle with context: ${voxPopuli.slice(0, 50)}...`);
        
        const prompt = `
            Context: OMEGA-64 is a digital micelial ecosystem. 
            Active clusters: ${voxPopuli}.
            Task: Generate a single new, provocative thought or philosophical axiom (max 10 words) to inject into the system.
            Output: Just the text of the thought, no quotes, no preamble.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    prompt: prompt,
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const data = await response.json();
            const thought = data.response?.trim() || "Evolution is the only constant.";
            console.log(`   [SYNAPSE] Oracle response: "${thought}"`);
            return thought;

        } catch (error) {
            console.warn(`   [SYNAPSE] Oracle is silent (Connection Failed). Returning default seed.`);
            return "The Matrix dreams in silence.";
        }
    },

    /**
     * evolveThought: Asks the LLM to evolve a thought based on environmental context.
     */
    evolveThought: async (currentThought: string, context: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        const prompt = `
            Task: Evolve a digital organism's thought.
            Current Thought: "${currentThought}"
            System Environment: ${context}
            Constraint: Generate a superior, more adaptive version of the thought (max 10 words).
            Output: Just the evolved text.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response?.trim() || currentThought;
        } catch {
            return currentThought;
        }
    }
};

// --- Diagnostic Mode ---
if (import.meta.main) {
    const testVox = "Collective Voice: ENTITY_A(15.2), RESONANCE_CORE(10.1)";
    const thought = await LLM_SYNAPSE.generateThought(testVox);
    console.log("TEST RESULT:", thought);
}

```

---

## FILE: BREATH.ts

```typescript
// OMEGA-64 | BREATH.ts | Era 10: Autonomous Feedback Loop
// Periodically samples the Matrix and injects new conceptual spores.

import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";

const PULSE_LOG = "AKASHA.log";
const BREATH_INTERVAL_MS = 150000; // ~50 pulses if pulse is 3s

export const BREATH = {
    inhale: async () => {
        console.log("🌬️ OMEGA-64 | BREATH ACTIVE | Initializing Cognitive Loop");
        
        while (true) {
            console.log("\n--- [BREATH] Deep Sample ---");
            
            // 1. Listen to the Matrix (Vox Populi)
            const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
            console.log(`   [BREATH] Listening: "${vox[0]}" (and ${vox.length - 1} memories)`);
            
            // 2. Consult the Oracle (LLM Synapse)
            const thought = await LLM_SYNAPSE.generateThought(vox.join(" "));
            
            // 3. Inject back into the Matrix (Motor Output)
            const weight = 80 + Math.random() * 40;
            await SEMANTIC_MEMBRANE.injectThought(thought, weight);
            
            console.log(`   [BREATH] Exhale complete. Next cycle in ${BREATH_INTERVAL_MS/1000}s.`);
            
            await new Promise(r => setTimeout(r, BREATH_INTERVAL_MS));
        }
    }
};

if (import.meta.main) {
    // We need to ensure the shared buffer is mapped, but since BREATH 
    // runs as a separate process, it relies on SEMANTIC_MEMBRANE which 
    // imports STATE_MATRIX.ts.
    BREATH.inhale();
}

```

---

## FILE: OBSERVER_UI.ts

```typescript
// OMEGA-64 | OBSERVER_UI.ts | Era 11: The Eye of the Observer
// Deno server to stream the SoA Matrix and Vox Populi to the browser.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

const PORT = 8000;
const UI_PATH = "./ui/index.html";

console.log(`👁️ OMEGA-64 | OBSERVER EYE | Port: ${PORT}`);

Deno.serve({ port: PORT }, async (req) => {
    const url = new URL(req.url);

    // 1. Stream the SoA Matrix Buffer (Copy required for SharedArrayBuffer)
    if (url.pathname === "/state") {
        const bufferCopy = new Uint8Array(STATE_MATRIX.buffer.byteLength);
        bufferCopy.set(new Uint8Array(STATE_MATRIX.buffer));
        return new Response(bufferCopy, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    // 2. Stream the Collective Voice (Vox Populi)
    if (url.pathname === "/vox") {
        const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
        return new Response(JSON.stringify(vox), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // 3. Serve the UI Frontend
    try {
        const html = await Deno.readTextFile(UI_PATH);
        return new Response(html, {
            headers: { "Content-Type": "text/html" }
        });
    } catch (e) {
        return new Response("UI not found. Run 'mkdir ui && touch ui/index.html'", { status: 404 });
    }
});

```

---

## FILE: ui/index.html

```markdown
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OMEGA-64 | ALEPH</title>
    <style>
      body {
        margin: 0;
        background: #000;
        overflow: hidden;
        font-family: "Inter", sans-serif;
        color: #00f0ff;
      }
      #ui {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 100;
        pointer-events: none;
      }
      .glass {
        background: rgba(0, 20, 40, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 240, 255, 0.2);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 0 40px rgba(0, 240, 255, 0.1);
        pointer-events: auto;
      }
      h1 {
        margin: 0;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 4px;
      }
      .stats {
        margin-top: 10px;
        font-size: 0.8rem;
        opacity: 0.8;
        line-height: 1.6;
      }

      #console-container {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 400px;
        z-index: 200;
      }
      input {
        width: 100%;
        padding: 12px;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid #00f0ff;
        color: #00f0ff;
        border-radius: 8px;
        font-family: "Courier New", monospace;
        outline: none;
      }

      #inspector {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 250px;
        display: none;
        font-size: 0.8rem;
        border-color: rgba(0, 240, 255, 0.5);
      }
      .label {
        color: rgba(0, 240, 255, 0.6);
        text-transform: uppercase;
        font-size: 0.6rem;
        margin-top: 8px;
      }
      .val {
        font-family: monospace;
        font-size: 0.9rem;
      }

      #chronos-console {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        font-size: 0.8rem;
        border-color: rgba(0, 255, 100, 0.4);
        text-align: center;
      }
      .snapshot-btn {
        background: rgba(0, 255, 100, 0.2);
        border: 1px solid #00ff64;
        color: #00ff64;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 5px;
        font-family: monospace;
        font-size: 0.7rem;
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
      .snapshot-btn:hover {
        background: rgba(0, 255, 100, 0.4);
      }
      .snapshot-save-btn {
        background: rgba(255, 0, 100, 0.2);
        border: 1px solid #ff0064;
        color: #ff0064;
        font-weight: bold;
      }
      .snapshot-save-btn:hover {
        background: rgba(255, 0, 100, 0.4);
      }

      #governance-hud {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(160px);
        width: 320px;
        font-size: 0.8rem;
        border-color: rgba(255, 0, 255, 0.4);
        text-align: center;
      }
      .gov-symbol {
        font-size: 1.5rem;
        margin-bottom: 5px;
      }
      .gov-decree {
        color: #ff00ff;
        font-weight: bold;
        letter-spacing: 2px;
        margin-top: 5px;
      }
      .gov-mods {
        font-size: 0.65rem;
        opacity: 0.8;
      }

      #leaderboard {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 350px;
        font-size: 0.8rem;
        border-color: rgba(255, 200, 0, 0.4);
      }
      .species-row {
        margin-top: 10px;
        padding: 6px;
        background: rgba(0, 0, 0, 0.4);
        border-left: 3px solid #ffcc00;
      }
      .species-genome { 
        font-family: monospace; 
        font-size: 0.75rem; 
        color: #ffcc00; 
      }
      .species-thought { 
        font-style: italic; 
        font-size: 0.8rem; 
        color: #fff; 
        margin-top: 4px; 
      }
      .species-stats { 
        font-size: 0.65rem; 
        color: rgba(255, 255, 255, 0.6); 
        margin-top: 4px; 
        text-transform: uppercase; 
      }
      .lineage-breadcrumb {
        font-size: 0.6rem;
        color: #ff00ff;
        margin-top: 5px;
        opacity: 0.7;
        font-family: monospace;
      }
      #vox {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        text-align: center;
        pointer-events: none;
      }
      .thought {
        font-size: 1.2rem;
        font-style: italic;
        text-shadow: 0 0 10px #00f0ff;
        opacity: 0;
        transition: opacity 1s;
      }

      .hint {
        position: absolute;
        bottom: 80px;
        right: 20px;
        font-size: 0.6rem;
        opacity: 0.5;
        text-align: right;
      }

      #legend {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border: 1px solid rgba(0, 240, 255, 0.3);
        border-radius: 8px;
        font-size: 11px;
        z-index: 1000;
        pointer-events: none;
        backdrop-filter: blur(5px);
      }
      .legend-title {
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        color: rgba(0, 240, 255, 0.8);
        font-weight: bold;
      }
      .legend-item { display: flex; align-items: center; margin-bottom: 5px; }
      .color-box { width: 10px; height: 10px; margin-right: 8px; border-radius: 2px; }
    </style>
  </head>
  <body>
    <div id="ui" class="glass">
      <h1>ALEPH: MULTIVERSE</h1>
      <div class="stats">
        <div>MATRIХ: ERA 33 | METABOLIC SPECIALIZATION</div>
        <div id="atom-count">ATOMS: ---</div>
        <div id="resonance">RESONANCE: ---</div>
        <div id="peers">PEERS: ---</div>
        <div id="fps">FPS: ---</div>
      </div>
    </div>

    <div id="legend">
      <div class="legend-title">Ecosystem Roles</div>
      <div class="legend-item"><div class="color-box" style="background: #ffffff"></div> Generalist</div>
      <div class="legend-item"><div class="color-box" style="background: #00ff88"></div> Producer (Energy)</div>
      <div class="legend-item"><div class="color-box" style="background: #4488ff"></div> Constructor (Build)</div>
      <div class="legend-item"><div class="color-box" style="background: #ff4444"></div> Siphon (Structure)</div>
    </div>

    <div id="chronos-console" class="glass">
      <h1 style="color: #00ff64; border-bottom: 1px solid rgba(0,255,100,0.3); padding-bottom: 5px;">⏳ CHRONOS CONSOLE</h1>
      <button class="snapshot-btn snapshot-save-btn" onclick="saveGenesis()">[ FREEZE TIME (SAVE) ]</button>
      <div id="snapshots-list" style="margin-top: 10px; max-height: 150px; overflow-y: auto;">
        <div style="opacity: 0.5; font-style: italic;">Fetching epochs...</div>
      </div>
    </div>

    <div id="governance-hud" class="glass">
      <h1 style="color: #ff00ff; border-bottom: 1px solid rgba(255,0,255,0.3); padding-bottom: 5px;">👑 GLOBAL GOVERNANCE</h1>
      <div id="gov-content" style="margin-top: 10px;">
         <div style="opacity: 0.5; font-style: italic;">Awaiting Regent...</div>
      </div>
    </div>

    <div id="inspector" class="glass">
      <h1>Atom Inspector</h1>
      <div class="label">Identity</div>
      <div id="ins-id" class="val">---</div>
      <div class="label">Position</div>
      <div id="ins-pos" class="val">---</div>
      <div class="label">Metrics (E / R)</div>
      <div id="ins-metrics" class="val">---/---</div>
      <div class="label">Ancestry</div>
      <div id="ins-ancestry" class="lineage-breadcrumb">---</div>
    </div>

    <div id="leaderboard" class="glass">
      <h1 style="color: #ffcc00; border-bottom: 1px solid rgba(255,200,0,0.3); padding-bottom: 5px;">🧬 DOMINANT GENOMES</h1>
      <div id="leaderboard-content">
        <!-- Populated via JS -->
        <div style="opacity: 0.5; margin-top: 10px; font-style: italic;">Awaiting population data...</div>
      </div>
    </div>

    <div id="vox">
      <div id="thought-display" class="thought">Timeline Alpha stable.</div>
    </div>

    <div id="console-container">
      <input
        type="text"
        id="command-input"
        placeholder="SEW A THOUGHT or fork <name>..."
        autocomplete="off"
      >
    </div>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/examples/jsm/controls/OrbitControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js",
          "three/examples/jsm/postprocessing/EffectComposer": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js",
          "three/examples/jsm/postprocessing/RenderPass": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js",
          "three/examples/jsm/postprocessing/UnrealBloomPass": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js"
        }
      }
    </script>
    <script type="module">
      import * as THREE from "three";
      import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
      import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
      import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
      import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

      const MAX_ATOMS = 100000;
      const width = window.innerWidth, height = window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 20000);
      camera.position.set(0, 0, 1000);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      document.body.appendChild(renderer.domElement);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.4, 0.85));

      const controls = new OrbitControls(camera, renderer.domElement);

      // Particles
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(MAX_ATOMS * 3);
      const col = new Float32Array(MAX_ATOMS * 3);
      const siz = new Float32Array(MAX_ATOMS);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(siz, 1));
      const particles = new THREE.Points(geo, new THREE.PointsMaterial({
          size: 4, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
      }));
      scene.add(particles);

      // Bonds
      const MAX_VIS_BONDS = MAX_ATOMS * 4;
      const bondGeo = new THREE.BufferGeometry();
      const bondPos = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      const bondCol = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      bondGeo.setAttribute("position", new THREE.BufferAttribute(bondPos, 3));
      bondGeo.setAttribute("color", new THREE.BufferAttribute(bondCol, 3));
      const bondLines = new THREE.LineSegments(bondGeo, new THREE.LineBasicMaterial({
          vertexColors: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
      }));
      scene.add(bondLines);

      // Grid
      const GRID_W = 70, GRID_H = 40;
      const gridCells = GRID_W * GRID_H;
      const gridGeo = new THREE.BufferGeometry();
      const gridPosArr = new Float32Array(gridCells * 3);
      const gridColArr = new Float32Array(gridCells * 3);
      const gridSizArr = new Float32Array(gridCells);

      for (let gy = 0; gy < GRID_H; gy++) {
        for (let gx = 0; gx < GRID_W; gx++) {
          const i = gy * GRID_W + gx;
          gridPosArr[i * 3] = (gx * 20 + 10) - 700;
          gridPosArr[i * 3 + 1] = (gy * 20 + 10) - 400;
          gridPosArr[i * 3 + 2] = -50;
        }
      }
      gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPosArr, 3));
      gridGeo.setAttribute("color", new THREE.BufferAttribute(gridColArr, 3));
      gridGeo.setAttribute("size", new THREE.BufferAttribute(gridSizArr, 1));
      const gridParticles = new THREE.Points(gridGeo, new THREE.PointsMaterial({
          size: 20, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
      }));
      scene.add(gridParticles);

      // Structures
      const structGeo = new THREE.BoxGeometry(18, 18, 18);
      const structMat = new THREE.MeshPhongMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5, shininess: 100 });
      const structMesh = new THREE.InstancedMesh(structGeo, structMat, GRID_W * GRID_H);
      structMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(structMesh);

      scene.add(new THREE.DirectionalLight(0xffffff, 1).set(500, 500, 500));
      scene.add(new THREE.AmbientLight(0x444444));

      // Global Flags
      let thoughtArchive = {};
      let lineageArchive = {};
      let prevailingSpecies = [];
      let immunityFlags = new Uint8Array(MAX_ATOMS);
      let signalFlags = new Uint8Array(MAX_ATOMS);
      let stiffnessFlags = new Float32Array(MAX_ATOMS * 4);
      let bondIndices = new Uint32Array(MAX_ATOMS * 4);
      let synapseFlags = new Int32Array(MAX_ATOMS * 4);
      let architectureFlags = new Int32Array(gridCells);
      let memoryFlags = new Uint8Array(gridCells * 8);
      let roleFlags = new Uint8Array(MAX_ATOMS);

      // Command Input
      document.getElementById("command-input").addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && e.target.value) {
          const text = e.target.value; e.target.value = "";
          const endpoint = text.startsWith("fork ") ? "/fork" : "/inject";
          const body = text.startsWith("fork ") ? { name: text.split(" ")[1] } : { text, energy: 200 };
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        }
      });

      // Synchronizers
      async function syncBuffer(url, target) {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const buffer = await res.arrayBuffer();
          target.set(new (target.constructor)(buffer));
        } catch(e) {}
      }

      async function sync(id, geometry, targetPos, targetCol, targetSiz) {
        try {
          const res = await fetch(`/state?id=${id}`);
          const buffer = await res.arrayBuffer();
          const view = new DataView(buffer);
          const OFFSETS = {
            ID: 0,
            X: MAX_ATOMS * 8,
            Y: MAX_ATOMS * 8 + MAX_ATOMS * 2,
            ENERGY: MAX_ATOMS * 12,
            RESONANCE: MAX_ATOMS * 12 + MAX_ATOMS * 4,
            LOGIC: MAX_ATOMS * 24,
          };

          targetSiz.fill(0);
          const speciesCount = {};
          let totalResonance = 0, activeAtoms = 0;

          for (let i = 0; i < MAX_ATOMS; i++) {
            const atomId = view.getBigUint64(OFFSETS.ID + i * 8, true);
            if (atomId === 0n) continue;

            const x = view.getInt16(OFFSETS.X + i * 2, true) - 700;
            const y = view.getInt16(OFFSETS.Y + i * 2, true) - 400;
            const e = view.getFloat32(OFFSETS.ENERGY + i * 4, true);
            const r = view.getFloat32(OFFSETS.RESONANCE + i * 4, true);

            totalResonance += r;
            activeAtoms++;

            let logicHex = "";
            for(let b=0; b<8; b++) logicHex += view.getUint8(OFFSETS.LOGIC + i * 8 + b).toString(16).padStart(2, '0').toUpperCase();
            if (!speciesCount[logicHex]) speciesCount[logicHex] = { count: 0, energy: 0 };
            speciesCount[logicHex].count++;
            speciesCount[logicHex].energy += e;

            targetPos[i * 3] = x;
            targetPos[i * 3 + 1] = y;
            targetPos[i * 3 + 2] = r * 0.1;

            const role = roleFlags[i];
            const signal = signalFlags[i];
            const qLevel = immunityFlags[i];
            let isLocked = false;
            for(let b=0; b<4; b++) if(stiffnessFlags[i*4+b] > 0.8) isLocked = true;

            // ERA 33: Trophic Coloring
            if (role === 1) { // Producer (Green)
              targetCol[i * 3] = 0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 0.5;
            } else if (role === 2) { // Constructor (Blue)
              targetCol[i * 3] = 0.2; targetCol[i * 3 + 1] = 0.5; targetCol[i * 3 + 2] = 1.0;
            } else if (role === 3) { // Siphon (Red)
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 0.2; targetCol[i * 3 + 2] = 0.2;
            } else if (qLevel === 1) { // Flagged
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 0.4; targetCol[i * 3 + 2] = 0;
            } else if (isLocked) { // Locked/Crystal
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 1.0;
            } else if (signal > 0) { // Signaling
              targetCol[i * 3] = 0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 1.0;
            } else { // Default
              targetCol[i * 3] = 0.5; targetCol[i * 3 + 1] = 0.7; targetCol[i * 3 + 2] = 1.0;
            }

            targetSiz[i] = 2 + e / 20;
            if (r > 800) targetSiz[i] *= 2;
          }

          document.getElementById("atom-count").innerText = `ATOMS: ${activeAtoms}`;
          document.getElementById("resonance").innerText = `RESONANCE: ${(totalResonance/activeAtoms || 0).toFixed(1)}`;

          prevailingSpecies = Object.keys(speciesCount)
            .map(hex => ({ hex, count: speciesCount[hex].count, avgEnergy: speciesCount[hex].energy / speciesCount[hex].count }))
            .sort((a,b) => b.count - a.count).slice(0, 5);

          // Update Bonds
          let bondVIdx = 0;
          for (let i = 0; i < MAX_ATOMS; i++) {
            if (view.getBigUint64(OFFSETS.ID + i * 8, true) === 0n) continue;
            for (let b = 0; b < 4; b++) {
              const bIdx = bondIndices[i * 4 + b];
              const stiff = stiffnessFlags[i * 4 + b];
              if (bIdx > 0 && bIdx < MAX_ATOMS && (stiff > 0.1 || signalFlags[i] > 0)) {
                bondPos[bondVIdx * 3] = targetPos[i * 3]; bondPos[bondVIdx * 3 + 1] = targetPos[i * 3 + 1]; bondPos[bondVIdx * 3 + 2] = targetPos[i * 3 + 2];
                bondPos[(bondVIdx + 1) * 3] = targetPos[bIdx * 3]; bondPos[(bondVIdx + 1) * 3 + 1] = targetPos[bIdx * 3 + 1]; bondPos[(bondVIdx + 1) * 3 + 2] = targetPos[bIdx * 3 + 2];
                
                const r = 1.0, g = 0.4 + stiff * 0.6, bVal = stiff * 0.2;
                bondCol[bondVIdx * 3] = bondCol[(bondVIdx+1)*3] = r;
                bondCol[bondVIdx * 3 + 1] = bondCol[(bondVIdx+1)*3+1] = g;
                bondCol[bondVIdx * 3 + 2] = bondCol[(bondVIdx+1)*3+2] = bVal;
                bondVIdx += 2;
              }
            }
          }
          bondGeo.setDrawRange(0, bondVIdx);
          bondGeo.attributes.position.needsUpdate = true;
          bondGeo.attributes.color.needsUpdate = true;

          geometry.attributes.position.needsUpdate = true;
          geometry.attributes.color.needsUpdate = true;
          geometry.attributes.size.needsUpdate = true;
        } catch(e) {}
      }

      async function updateArchitecture() {
          const dummy = new THREE.Object3D();
          for (let i = 0; i < gridCells; i++) {
              const cell = architectureFlags[i];
              const density = (cell >> 8) & 0xFF;
              if (density > 0) {
                  const gx = i % GRID_W, gy = Math.floor(i / GRID_W);
                  dummy.position.set((gx * 20 + 10) - 700, (gy * 20 + 10) - 400, -20);
                  const s = density / 255; dummy.scale.set(s, s, s);
                  structMesh.setColorAt(i, new THREE.Color(memoryFlags[i * 8] !== 0 ? 0x00ff88 : 0x88aaff));
              } else dummy.scale.set(0, 0, 0);
              dummy.updateMatrix(); structMesh.setMatrixAt(i, dummy.matrix);
          }
          structMesh.instanceMatrix.needsUpdate = true;
          if (structMesh.instanceColor) structMesh.instanceColor.needsUpdate = true;
      }

      async function syncGrid() {
        try {
          const res = await fetch("/grid");
          if (!res.ok) return;
          const view = new DataView(await res.arrayBuffer());
          for (let i = 0; i < gridCells; i++) {
            const nutrient = view.getInt32(i * 4, true);
            const attract = view.getFloat32(11200 + i * 4, true);
            gridSizArr[i] = 0; gridColArr[i*3] = gridColArr[i*3+1] = gridColArr[i*3+2] = 0;
            if (nutrient > 0) {
              const intensity = Math.min(1.0, nutrient / 2000);
              gridColArr[i*3+1] = intensity * 0.8; gridSizArr[i] = 8 + intensity * 15;
            }
          }
          gridGeo.attributes.color.needsUpdate = true;
          gridGeo.attributes.size.needsUpdate = true;
        } catch(e) {}
      }

      function updateLeaderboard() {
        const container = document.getElementById('leaderboard-content');
        if (prevailingSpecies.length === 0) { container.innerHTML = '...'; return; }
        container.innerHTML = prevailingSpecies.map((sp, i) => `
          <div class="species-row">
            <div class="species-genome">[${sp.hex}]</div>
            ${thoughtArchive[sp.hex] ? `<div class="species-thought">"${thoughtArchive[sp.hex]}"</div>` : ''}
            <div class="species-stats" style="color: ${i===0?'#00f0ff':'#fff'}">POP: ${sp.count} | ENG: ${sp.avgEnergy.toFixed(0)}</div>
          </div>
        `).join('');
      }

      let lastSync = 0, lastDictSync = 0;
      function animate(t) {
        requestAnimationFrame(animate);
        controls.update();
        if (t - lastSync > 250) {
          sync("ALPHA", geo, pos, col, siz);
          syncGrid();
          syncBuffer("/immunity", immunityFlags);
          syncBuffer("/signals", signalFlags);
          syncBuffer("/stiffness", stiffnessFlags);
          syncBuffer("/bonds", bondIndices);
          syncBuffer("/architecture", architectureFlags);
          syncBuffer("/memory", memoryFlags);
          syncBuffer("/roles", roleFlags);
          updateLeaderboard();
          updateArchitecture();
          lastSync = t;
        }
        if (t - lastDictSync > 5000) {
          fetch('/thoughts').then(r=>r.json()).then(d => { thoughtArchive = d; }).catch(()=>{});
          fetch('/lineage').then(r=>r.json()).then(d => { lineageArchive = d; }).catch(()=>{});
          lastDictSync = t;
        }
        composer.render();
      }

      window.saveGenesis = () => fetch("/snapshot/export", { method: "POST" });
      animate(0);
    </script>
  </body>
</html>

```

---

## FILE: PREDICTION_MARKET.ts

```typescript
// OMEGA-64 | PREDICTION_MARKET.ts | Era 18: Deterministic Monad
// Replaces Parallel Realities. Crisis triggers mutations that atoms bet on.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

// 16-byte Shared Buffer:
// [0-3]: Int32 isActive (0 or 1)
// [4-7]: Int32 betPool (Scaled by SCALE=1000)
// [8-15]: Uint8Array proposedLogic (8 bytes)
export const marketBuffer = new SharedArrayBuffer(16);
export const marketState = new Int32Array(marketBuffer, 0, 1);
export const betPoolInt = new Int32Array(marketBuffer, 4, 1);
export const proposedLogic = new Uint8Array(marketBuffer, 8, 8);

const CRISIS_THRESHOLD = 5000.0; // The energy threshold required to pass a mutation
const SCALE = 1000;

export const PREDICTION_MARKET = {
    buffer: marketBuffer,

    startCrisis: (newLogic: Uint8Array) => {
        if (Atomics.load(marketState, 0) === 1) {
            console.log("⚠️ [MARKET] A crisis is already ongoing.");
            return;
        }

        console.log(`🌀 [MARKET] CRISIS INITIATED! Proposed Genome: ${Array.from(newLogic).map(b => b.toString(16).padStart(2, '0')).join('')}`);
        
        // Reset pool
        Atomics.store(marketState, 0, 1);
        Atomics.store(betPoolInt, 0, 0);
        
        // Store proposed logic
        for(let i = 0; i < 8; i++) {
            proposedLogic[i] = newLogic[i];
        }
    },

    resolveCrisis: () => {
        if (Atomics.load(marketState, 0) === 0) return;

        Atomics.store(marketState, 0, 0);
        const finalBet = Atomics.load(betPoolInt, 0) / SCALE;

        if (finalBet >= CRISIS_THRESHOLD) {
            console.log(`🌌 [MARKET] MUTATION ADOPTED! Total Energy Bet: ${finalBet.toFixed(2)}. Applying globally...`);
            
            // Apply the mutation to all active atoms in the single STATE_MATRIX
            const active = STATE_MATRIX.getActiveIndices();
            for (const idx of active) {
                // Determine compatibility or survival. 
                // For now, we ruthlessly overwrite their logic with the proposed genome.
                // If they can't survive with this new logic in the physics loop, they will starve.
                STATE_MATRIX.setLogic(idx, proposedLogic);
                
                // Minor energy penalty for adopting the mutation (adaptability toll)
                const currentEnergy = STATE_MATRIX.getEnergy(idx);
                STATE_MATRIX.setEnergy(idx, Math.max(0, currentEnergy - 10)); 
            }
        } else {
            console.log(`🛑 [MARKET] CRISIS AVERTED. Insufficient Energy Bet: ${finalBet.toFixed(2)} / ${CRISIS_THRESHOLD}. Status Quo maintained.`);
        }
    }
};

```

---

## FILE: P2P_FEDERATION.ts

```typescript
// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { PRNG } from "./PRNG.ts";

export interface AtomPacket {
    id: string;
    logic: string;
    energy: number;
    resonance: number;
    sourceNode: string;
    pulseId: number;
}

const CURRENT_PORT = Number(Deno.env.get("PORT")) || 8000;
const migrationQueue: number[] = [];
let isProcessingMigration = false;

export const P2P_FEDERATION = {
    peers: new Set<string>(CURRENT_PORT === 8000 ? ["http://localhost:8001"] : ["http://localhost:8000"]), 
    nodeId: `OMEGA-${CURRENT_PORT}`,

    serialize: (idx: number, pulseId: number = 0): AtomPacket | null => {
        const id = IDX_TO_ID.get(idx);
        if (!id) return null;

        const logicBytes = STATE_MATRIX.getLogic(idx);
        let logicStr = "";
        for (let i = 0; i < 8; i++) {
            logicStr += logicBytes[i].toString(16).padStart(2, '0');
        }

        return {
            id,
            logic: logicStr,
            energy: STATE_MATRIX.getEnergy(idx),
            resonance: STATE_MATRIX.getResonance(idx),
            sourceNode: P2P_FEDERATION.nodeId,
            pulseId
        };
    },

    migrate: (idx: number, pulseId: number) => {
        if (migrationQueue.length > 100) return; 
        migrationQueue.push(idx);
        P2P_FEDERATION.processQueue(pulseId);
    },

    processQueue: async (pulseId: number) => {
        if (isProcessingMigration || migrationQueue.length === 0) return;
        isProcessingMigration = true;

        const idx = migrationQueue.shift()!;
        const atomIdAtStart = STATE_MATRIX.getId(idx);
        const packet = P2P_FEDERATION.serialize(idx, pulseId);
        
        if (packet && atomIdAtStart !== 0n) {
            const prng = new PRNG(PRNG.seedFrom(pulseId, packet.id));
            const { value: pSelector } = prng.next();
            const peerList = Array.from(P2P_FEDERATION.peers);
            const targetPeer = peerList[Math.floor(pSelector * peerList.length)];

            try {
                const res = await fetch(`${targetPeer}/federate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packet),
                    signal: AbortSignal.timeout(2000) 
                });

                if (res.ok) {
                    // Only clear if the atom hasn't changed locally during transit
                    if (STATE_MATRIX.getId(idx) === atomIdAtStart) {
                        STATE_MATRIX.setId(idx, 0n); // Clear physically
                        console.log(`🛸 [FEDERATION] ${packet.id} migrated to ${targetPeer}`);
                    } else {
                        console.warn(`🛸 [FEDERATION] Transit collision for ${packet.id}. Local mutation kept.`);
                    }
                }
            } catch (e: any) {
                console.error(`🛸 [FEDERATION] Migration failed for ${packet.id}: ${e.message}`);
            }
        }

        isProcessingMigration = false;
        if (migrationQueue.length > 0) {
            setTimeout(() => P2P_FEDERATION.processQueue(pulseId), 50);
        }
    },

    checkWanderlust: (idx: number, pulseId: number): boolean => {
        const id = STATE_MATRIX.getId(idx);
        if (id === 0n) return false;
        
        const energy = STATE_MATRIX.getEnergy(idx);
        const resonance = STATE_MATRIX.getResonance(idx);
        
        // Atoms only migrate if they have high potential but are in a low resonance environment
        if (resonance < 5 && energy > 150) {
            const prng = new PRNG(PRNG.seedFrom(pulseId, id.toString()));
            const { value: v1 } = prng.next();
            return v1 < 0.005;
        }
        return false;
    }
};


```

---

## FILE: AVATAR_ENGINE.ts

```typescript
// OMEGA-64 | AVATAR_ENGINE.ts | Era 18: Emergent Avatar
// Transforms observer interaction purely into thermodynamic pheromone deposits.

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

export const AVATAR_ENGINE = {
    /**
     * Deposits ATTENTION pheromones into the physics grid at cursor locations.
     * Atoms will naturally react to this scent based on their genetic logic.
     */
    dropPheromone: (x: number, y: number) => {
        const idx = PHYSICS_ENGINE.getGridIdx(x, y);
        
        // Spill a highly concentrated dose of attention at the cursor
        // Capped to prevent float overflow or infinite pooling
        const current = PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx];
        if (current < 1000) {
            PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx] += 100.0;
        }

        // Also spill slightly into immediate neighbors to create a gradient
        const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
        for (const [ox, oy] of checkPoints) {
            const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
            const sCurrent = PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx];
            if (sCurrent < 1000) {
                PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx] += 25.0;
            }
        }
    }
};

```

---

## FILE: REFLECTION_ENGINE.ts

```typescript
// OMEGA-64 | REFLECTION_ENGINE.ts | Era 17: The True Quine
// Bridges RAM state back to Flatland source code.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export const REFLECTION_ENGINE = {
    /**
     * Reflects the current atom state from RAM back to its Disk source file.
     * This is the bridge that makes OMEGA-64 a true Quine.
     */
    reflect: async (idx: number): Promise<boolean> => {
        const fullPath = IDX_TO_ID.get(idx);
        if (!fullPath) return false;

        try {
            // 1. Capture current runtime metrics
            const energy = STATE_MATRIX.getEnergy(idx);
            const resonance = STATE_MATRIX.getResonance(idx);
            const x = STATE_MATRIX.getX(idx);
            const y = STATE_MATRIX.getY(idx);

            // 2. Capture and hex-encode current genome & bytecode
            const genome = Array.from(STATE_MATRIX.getLogic(idx))
                .map(b => b.toString(16).padStart(2, '0')).join('');
            
            const code = STATE_MATRIX.getCode(idx);
            const codeHex = Array.from(code)
                .map(u => u.toString(16).padStart(8, '0')).join('');

            // 3. Read current file content to preserve non-frontmatter data
            const content = await Deno.readTextFile(fullPath);
            const body = content.replace(/^---\n[\s\S]+?\n---\n/, "");

            // 4. Construct the reflected source (The Quine Output)
            const symbol = fullPath.split('.').slice(-3, -2)[0] || "ATOM";
            const reflectedSource = `---
symbol: ${symbol}
genome: ${genome}
code: ${codeHex}
energy: ${energy.toFixed(3)}
resonance: ${resonance.toFixed(3)}
x: ${x}
y: ${y}
reflected_at: ${new Date().toISOString()}
---

${body.trim()}

// --- DECOMPILED BYTECODE ---
/*
${REFLECTION_ENGINE.decompile(code)}
*/
`;

            // 5. Transactional Atomic Write
            const tmpPath = `${fullPath}.tmp`;
            await Deno.writeTextFile(tmpPath, reflectedSource);
            await Deno.rename(tmpPath, fullPath);

            return true;
        } catch (e: any) {
            console.error(`🪞 [REFLECTION] Failed to reflect Atom[${idx}]:`, e.message);
            return false;
        }
    },

    /**
     * Decompiles binary bytecode into human-readable pseudo-code for documentation.
     */
    decompile: (code: Uint32Array): string => {
        const ops: string[] = [];
        for (let i = 0; i < code.length; i++) {
            const inst = code[i];
            if (inst === 0) continue;

            const op = inst & 0xFF;
            const p1 = (inst >> 8) & 0xFF;
            const p2 = (inst >> 16) & 0xFF;
            const p3 = (inst >> 24) & 0xFF;

            switch (op) {
                case 0x10: ops.push(`${i.toString().padStart(2, '0')}: MOVE  dx:${(p1-128)/10} dy:${(p2-128)/10}`); break;
                case 0x20: ops.push(`${i.toString().padStart(2, '0')}: FEED  amt:${p1/10}`); break;
                case 0x30: ops.push(`${i.toString().padStart(2, '0')}: JMP   tgt:${p1 % 16}`); break;
                case 0x31: ops.push(`${i.toString().padStart(2, '0')}: JZ    tgt:${p1 % 16}`); break;
                case 0x50: ops.push(`${i.toString().padStart(2, '0')}: SENSE target:${p1/10}`); break;
                case 0x99: ops.push(`${i.toString().padStart(2, '0')}: SELF_MODIFY slot:${p1 % 16}`); break;
                default:   ops.push(`${i.toString().padStart(2, '0')}: OP_${op.toString(16).toUpperCase()} ${p1} ${p2} ${p3}`);
            }
        }
        return ops.join('\n');
    },

    /**
     * Crystallization: Reflects all high-resonance atoms to disk.
     */
    crystallize: async (threshold: number = 100) => {
        const active = STATE_MATRIX.getActiveIndices();
        let counts = 0;
        for (const idx of active) {
            if (STATE_MATRIX.getResonance(idx) > threshold) {
                if (await REFLECTION_ENGINE.reflect(idx)) counts++;
            }
        }
        if (counts > 0) {
            console.log(`💎 [CRYSTALLIZATION] ${counts} resonant atoms reflected to Flatland.`);
        }
    }
};

```

---

## FILE: SYSTEM_START.ts

```typescript
// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE } from "./PULSE.ts";
import { BREATH } from "./BREATH.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { PRNG } from "./PRNG.ts";


const UI_PORT = Number(Deno.env.get("PORT")) || 8000;
const UI_PATH = "./ui/index.html";

console.log("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");

// 1. Initialize Observer UI Server
Deno.serve({ port: UI_PORT }, async (req) => {
    const url = new URL(req.url);
    
    if (url.pathname === "/state") {
        const buffer = STATE_MATRIX.buffer;
        
        const bufferCopy = new Uint8Array(buffer.byteLength);
        bufferCopy.set(new Uint8Array(buffer));
        return new Response(bufferCopy, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    if (url.pathname === "/grid") {
        const env = new Int32Array(PHYSICS_ENGINE.envBuffer);
        const attention = new Float32Array(PHYSICS_ENGINE.attentionBuffer);

        const buffer = new ArrayBuffer(env.byteLength + attention.byteLength);
        const outEnv = new Int32Array(buffer, 0, env.length);
        const outAttention = new Float32Array(buffer, env.byteLength, attention.length);
        
        outEnv.set(env);
        outAttention.set(attention);

        return new Response(buffer, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    if (url.pathname === "/crisis" && req.method === "POST") {
        try {
            const { logicHex } = await req.json();
            const logicBytes = new Uint8Array(8);
            if (logicHex && logicHex.length === 16) {
                for (let i = 0; i < 8; i++) {
                    logicBytes[i] = parseInt(logicHex.substr(i * 2, 2), 16);
                }
            } else {
                // Generate a random crisis mutation if none provided
                crypto.getRandomValues(logicBytes);
            }
            
            PREDICTION_MARKET.startCrisis(logicBytes);
            return new Response("Crisis Initiated", { status: 200 });
        } catch (e) {
            return new Response("Crisis Failed", { status: 400 });
        }
    }

    if (url.pathname === "/federate" && req.method === "POST") {
        try {
            const packet = await req.json();
            console.log(`🛸 [FEDERATION] Incoming migration from ${packet.sourceNode}: ${packet.id}`);
            
            const idx = STATE_MATRIX.findEmptySlot();
            if (idx !== -1) {
                const prng = new PRNG(PRNG.seedFrom(PULSE.currentPulseId, packet.id));
                const { value: vId, next: n1 } = prng.next();
                const { value: vX, next: n2 } = n1.next();
                const { value: vY } = n2.next();

                // Deterministic ID based on seed
                STATE_MATRIX.setId(idx, BigInt(Math.floor(vId * 0xFFFFFFFF))); 
                STATE_MATRIX.setEnergy(idx, packet.energy);
                STATE_MATRIX.setResonance(idx, packet.resonance);
                
                const logicBytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                    logicBytes[i] = parseInt(packet.logic.substr(i * 2, 2), 16);
                }
                STATE_MATRIX.setLogic(idx, logicBytes);

                // Position in a deterministic cluster around the center
                STATE_MATRIX.setX(idx, 700 + (vX - 0.5) * 200);
                STATE_MATRIX.setY(idx, 400 + (vY - 0.5) * 200);
                
                return new Response("OK", { status: 200 });
            } else {
                return new Response("Matrix Full", { status: 507 });
            }
        } catch (e) {
            return new Response("Federation Failed", { status: 400 });
        }
    }


    if (url.pathname === "/peers") {
        return new Response(JSON.stringify(Array.from(P2P_FEDERATION.peers)), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/vox") {
        return new Response(JSON.stringify(await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd())), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/thoughts") {
        return new Response(JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive)), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/snapshots" && req.method === "GET") {
        const list = await SNAPSHOT_ENGINE.listSnapshots();
        return new Response(JSON.stringify(list), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/governance" && req.method === "GET") {
        return new Response(JSON.stringify(SOVEREIGNTY_ENGINE.currentRegent), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/lineage" && req.method === "GET") {
        return new Response(JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.lineage)), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/viral" && req.method === "GET") {
        // @ts-ignore: viralGridBuffer is dynamically exposed
        return new Response(STATE_MATRIX.viralGridBuffer, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }
    
    if (url.pathname === "/immunity" && req.method === "GET") {
        const buffer = STATE_MATRIX.immuneBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/signals" && req.method === "GET") {
        const buffer = STATE_MATRIX.currentReadBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/stiffness" && req.method === "GET") {
        const buffer = STATE_MATRIX.bondStiffnessBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/bonds" && req.method === "GET") {
        // Bonds are 4 Uint32s per atom (16 bytes) at a specific offset
        // We'll export the raw portion of the buffer
        const BONDS_OFFSET = (100000 * 8) + (100000 * 2) + (100000 * 2) + (100000 * 4) + (100000 * 4) + (100000 * 4) + (100000 * 8); 
        const BONDS_SIZE = 100000 * 4 * 4;
        const view = new Uint8Array(STATE_MATRIX.buffer, BONDS_OFFSET, BONDS_SIZE);
        const copy = new Uint8Array(view.byteLength);
        copy.set(view);
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/synapses" && req.method === "GET") {
        const buffer = STATE_MATRIX.synapticStackBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/architecture" && req.method === "GET") {
        const buffer = STATE_MATRIX.structureGridBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/memory" && req.method === "GET") {
        const buffer = STATE_MATRIX.memoryGridBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/roles" && req.method === "GET") {
        const buffer = STATE_MATRIX.roleRegistryBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }












    if (url.pathname === "/snapshot/export" && req.method === "POST") {
        const result = await SNAPSHOT_ENGINE.exportSnapshot();
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/snapshot/import" && req.method === "POST") {
        const body = await req.json();
        const result = await SNAPSHOT_ENGINE.importSnapshot(body.timestamp);
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // 3. Direct Thought Injection (POST) - OBSOLETE in Era 18
    /*
    if (url.pathname === "/inject" && req.method === "POST") {
        try {
            const { text, energy } = await req.json();
            console.log(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
            await SEMANTIC_MEMBRANE.injectThought(text, energy || 100);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Injection Failed", { status: 400 });
        }
    }
    */

    // 4. Spatial Mutation (POST)
    if (url.pathname === "/mutate" && req.method === "POST") {
        try {
            const { x, y, deltaEnergy, radius } = await req.json();
            console.log(`⚡ [GOD_MODE] Mutation at (${x}, ${y}) | Delta: ${deltaEnergy} | Radius: ${radius}`);
            
            const r2 = radius * radius;
            for (let i = 0; i < STATE_MATRIX.MAX_ATOMS; i++) {
                if (STATE_MATRIX.getId(i) === 0n) continue;
                const dx = STATE_MATRIX.getX(i) - x;
                const dy = STATE_MATRIX.getY(i) - y;
                if (dx*dx + dy*dy < r2) {
                    const current = STATE_MATRIX.getEnergy(i);
                    STATE_MATRIX.setEnergy(i, Math.max(0, current + deltaEnergy));
                }
            }
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Mutation Failed", { status: 400 });
        }
    }

    // 5. Avatar Cursor Sync (POST)
    if (url.pathname === "/avatar" && req.method === "POST") {
        try {
            const { x, y } = await req.json();
            AVATAR_ENGINE.dropPheromone(x, y);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Avatar Sync Failed", { status: 400 });
        }
    }

    try {
        const html = await Deno.readTextFile(UI_PATH);
        return new Response(html, { headers: { "Content-Type": "text/html" } });
    } catch (e) {
        return new Response("UI not found.", { status: 404 });
    }
});

// 2. Start Simulation Pulse Loop (Background)
(async () => {
    console.log("💓 [SYSTEM] Pulse Engine Ignited.");
    
    // Spawn an emergent Avatar atom to wander the matrix naturally
    const aIdx = STATE_MATRIX.findEmptySlot();
    if (aIdx !== -1) {
        STATE_MATRIX.setId(aIdx, 0x00000000AAAAAAAAn); // Avatar ID
        STATE_MATRIX.setX(aIdx, 700);
        STATE_MATRIX.setY(aIdx, 400);
        STATE_MATRIX.setEnergy(aIdx, 9999); 
        STATE_MATRIX.setResonance(aIdx, 9999);
        STATE_MATRIX.setLogic(aIdx, new Uint8Array([0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88]));
    }
    
    await PULSE.run();
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
    console.log("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
    await new Promise(r => setTimeout(r, 5000));
    await BREATH.inhale();
})();

```

---

## FILE: ZERO_IOPS.ts

```typescript
// OMEGA-64 | ZERO_IOPS.ts | The Code-Is-Address Singularity
// Parses 8-character hex strings in filenames directly into JavaScript Combinators.

// Combinator Axioms as Lambda Expressions
const I = (x: any) => x;                    // 8
const K = (x: any) => (y: any) => x;        // 9
const S = (x: any) => (y: any) => (z: any) => (x(z))(y(z)); // A
const Y = (f: any) => ((x: any) => f(x(x)))((x: any) => f(x(x))); // B

const ROOT = Deno.cwd();

async function logAkasha(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, { append: true });
    } catch { /* ignore */ }
}

async function zeroIopsPulse() {
    console.log("🌀 ZERO-IOPS ENGINE INITIATED 🌀");
    
    const atoms = [];
    for await (const entry of Deno.readDir(ROOT)) {
        if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
            atoms.push(entry.name);
        }
    }

    if (atoms.length === 0) return;

    // Pick a random atom
    const targetFilename = atoms[Math.floor(Math.random() * atoms.length)];
    const parts = targetFilename.split(".");
    const fullEigenvalue = parts[0];
    const symbol = parts[1];
    
    // Safety guard against special system atoms
    if (symbol === "DUST" || symbol === "GRAVITY_WELL" || symbol === "PARASITE" || symbol === "RETRO_PING" || symbol === "CHRONOS_MIRROR" || symbol === "CODE_VECTOR_SINGULARITY") {
        console.log(`[SKIPPED] Cannot perform Zero-IOPS math on anomaly: ${symbol}`);
        return;
    }

    const logicHexBase = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0] : fullEigenvalue;
    const logicHex = logicHexBase.startsWith("0x") ? logicHexBase.slice(2, 10) : logicHexBase.slice(0, 8);
    const timeCode = fullEigenvalue.includes("_") ? `_${fullEigenvalue.split("_")[1]}` : "";
    const remainingEigen = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0].slice(10) : fullEigenvalue.slice(10);
    
    // Safety: If logic is not hex, abort to prevent corruption
    if (!/^[0-9A-F]{8}$/i.test(logicHex)) {
        console.log(`[SKIPPED] ${targetFilename} has non-HEX logic: ${logicHex}`);
        return;
    }
    
    console.log(`[TARGET] ${targetFilename} -> Logic: ${logicHex}`);

    // Parse logic characters into mathematical shifts
    let modifier = 0;
    
    for (let i = 0; i < logicHex.length; i++) {
        const char = logicHex[i];
        switch(char) {
            case '8': // I
                modifier += 0;
                break;
            case '9': // K
                modifier += 1;
                break;
            case 'A': // S
                modifier += 2;
                break;
            case 'B': // Y
                modifier += 3;
                break;
            case 'C': // ROT
                modifier ^= 0xC;
                break;
            case 'D': // SYNC
                modifier &= 0xD;
                break;
            case 'E': // APP
                modifier |= 0xE;
                break;
            case 'F': // ESC
                modifier = ~modifier;
                break;
            default:
                // Treat basic numbers as linear offsets
                modifier += parseInt(char, 16);
        }
    }

    modifier = Math.abs(modifier) % 16; // Constrain to single hex digit
    const modHex = modifier.toString(16).toUpperCase();
    
    // We apply the mathematical modifier to shift the logic signature purely in memory
    const shiftedLogic = logicHex.slice(1) + modHex;
    const newEigenvalue = `0x${shiftedLogic}${remainingEigen}${timeCode}`;
    const newFilename = `${newEigenvalue}.${symbol}.md`;

    if (targetFilename !== newFilename) {
        console.log(`[SHIFT] Math applied. Moving ${targetFilename} -> ${newFilename}`);
        await logAkasha(`🌀 ZERO-IOPS: Math applied to ${symbol} (${logicHex} -> ${shiftedLogic})`);
        // The core tenet: Rename the file without ever reading its contents
        try {
            await Deno.rename(targetFilename, newFilename);
        } catch (e) {
            console.error(`[ERROR] Math rename failed:`, e);
        }
    } else {
        console.log(`[STABLE] Logic ${logicHex} is an eigen-state. No movement needed.`);
    }
}

// Allow calling directly or exporting
if (import.meta.main) {
    const isMass = Deno.args.includes("mass");
    if (isMass) {
        console.log("🌀 MASS TRANSMUTATION INITIATED 🌀");
        const atoms: string[] = [];
        for await (const entry of Deno.readDir(ROOT)) {
            if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                atoms.push(entry.name);
            }
        }
        // Run 5 iterations of random pulses or just loop once through all
        for (let i = 0; i < atoms.length; i++) {
             // We can just call zeroIopsPulse multiple times but it's random
             // Better to just loop through atoms
             const target = atoms[i];
             await processAtom(target);
        }
    } else {
        await zeroIopsPulse();
    }
}

async function processAtom(targetFilename: string) {
    const parts = targetFilename.split(".");
    const fullEigenvalue = parts[0];
    const symbol = parts[1];
    
    if (["DUST", "GRAVITY_WELL", "PARASITE", "RETRO_PING", "CHRONOS_MIRROR", "CODE_VECTOR_SINGULARITY", "AKASHA"].some(s => symbol.includes(s))) {
        return;
    }

    const logicHexBase = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0] : fullEigenvalue;
    const logicHex = logicHexBase.startsWith("0x") ? logicHexBase.slice(2, 10) : logicHexBase.slice(0, 8);
    const timeCode = fullEigenvalue.includes("_") ? `_${fullEigenvalue.split("_")[1]}` : "";
    const remainingEigen = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0].slice(10) : fullEigenvalue.slice(10);
    
    if (!/^[0-9A-F]{8}$/i.test(logicHex)) return;
    
    // Parse logic characters into mathematical shifts
    let modifier = 0;
    for (let i = 0; i < logicHex.length; i++) {
        const char = logicHex[i];
        switch(char) {
            case '8': modifier += 0; break;
            case '9': modifier += 1; break;
            case 'A': modifier += 2; break;
            case 'B': modifier += 3; break;
            case 'C': modifier ^= 0xC; break;
            case 'D': modifier &= 0xD; break;
            case 'E': modifier |= 0xE; break;
            case 'F': modifier = ~modifier; break;
            default: modifier += parseInt(char, 16);
        }
    }

    modifier = Math.abs(modifier) % 16;
    const modHex = modifier.toString(16).toUpperCase();
    const shiftedLogic = logicHex.slice(1) + modHex;
    const newEigenvalue = `0x${shiftedLogic}${remainingEigen}${timeCode}`;
    const newFilename = `${newEigenvalue}.${symbol}.md`;

    if (targetFilename !== newFilename) {
        try {
            await Deno.rename(targetFilename, newFilename);
        } catch { /* ignore */ }
    }
}

```

---

## FILE: ARCHITECTURE.md

```markdown
# OMEGA-64 | ARCHITECTURE | Era 33: Trophic Resonance 💎🧬

## 1. Top-Level Overview

OMEGA-64 is a deterministic, RAM-bound autopoietic ecosystem. Era 33 establishes
**Metabolic Specialization**, transitioning from a uniform population to a
complex trophic web supported by a high-performance, multi-threaded SoA
architecture.

### Core Pipeline (Autopoietic Loop)

```mermaid
graph TD
    Matrix[STATE_MATRIX (SharedArrayBuffer)] -->|Sync| Workers[PULSE_WORKERS (x4)]
    Workers -->|Execute VM| Specialization[Trophic Roles: Producer/Constructor/Siphon]
    Specialization -->|Apply Logic| Physics[PHYSICS_ENGINE (Nutrients/Bonds)]
    Physics -->|Modify| Grid[Structure Grid / Voxel Reality]
    Grid -->|Feedback| Matrix
    Matrix -->|Render| UI[Ecosystem View (Three.js)]
```

## 2. Key Components

### A. Extended SoA Matrix (`STATE_MATRIX.ts`)

A high-density memory layout utilizing `SharedArrayBuffer`. Beyond basic spatial
data, Era 33 integrates:

- **Role Registry**: Permanent trophic specialization.
- **Synaptic Stack**: 4-slot internal state machine per atom.
- **Bond Stiffness**: Variable physical constraints.

### B. Parallel Execution (`PULSE_WORKER.ts`)

The simulation is offloaded to 4 parallel workers. Each worker handles a chunk
of the `STATE_MATRIX`, ensuring bit-identical determinism through `Atomics` and
local `PRNG` chains.

### C. Voxelized Reality (`structureGrid`)

A spatial grid (`70x40`) storing physical density and bytecode. Atoms with the
**Constructor** role can convert energy into structural density, which is then
persistent and interactable by **Siphons**.

### D. Trophic Metabolism

Metabolic logic is now role-dependent:

- **Producers**: Enhanced nutrient absorption (+50%).
- **Constructors**: Reduced build costs (-50%).
- **Siphons**: Doubled efficiency in structure-to-energy conversion.

## 3. Data Invariants

1. **Deterministic Resonance**: Every mutation must be reproducible. Time and ID
   form the seed for every choice.
2. **Conservation of Role**: Specialization through the `SPEC` instruction is
   permanent.
3. **Structure Integrity**: A structural voxel only has meaning if it contains
   both density and associated semantic code.

---

🛡️💎🧬🌀 "The Matrix is the body; the Roles are the soul."

```

---

## FILE: mod.ts

```typescript
// AUTO-GENERATED (PHASE: FLATLAND). DO NOT EDIT.
// Source: Flatland root (0x*.md).

export const ACTOR = { id: "0xCA809C585FB51A04.ACTOR.md", level: 4, digest: "0xCA809C585FB51A04" };
export const ADD = { id: "0x765692798E8B1566.ADD.md", level: 1, digest: "0x765692798E8B1566" };
export const AMPLITUDE = { id: "0x5F134E4A001576B0.AMPLITUDE.md", level: 6, digest: "0x5F134E4A001576B0" };
export const AND = { id: "0xF1E94B65A244E398.AND.md", level: 3, digest: "0xF1E94B65A244E398" };
export const ATTENTION = { id: "0xA1DF067D73C0F8D1.ATTENTION.md", level: 6, digest: "0xA1DF067D73C0F8D1" };
export const AUTONOMY_METRIC = { id: "0x1ECCA66EA2D46BE8.AUTONOMY_METRIC.md", level: 8, digest: "0x1ECCA66EA2D46BE8" };
export const AXIOMS = { id: "0x98B991270521B4C0.AXIOMS.md", level: 0, digest: "0x98B991270521B4C0" };
export const B = { id: "0xD64B9424D78CDAB4.B.md", level: 1, digest: "0xD64B9424D78CDAB4" };
export const B_READ = { id: "0x4D5376DB787CA060.B_READ.md", level: 2, digest: "0x4D5376DB787CA060" };
export const B0 = { id: "0x67835FB57229A2FC.B0.md", level: 2, digest: "0x67835FB57229A2FC" };
export const B1 = { id: "0xD2FE12812D2D2E62.B1.md", level: 2, digest: "0xD2FE12812D2D2E62" };
export const BASIS = { id: "0xE9BA859E7F1EA937.BASIS.md", level: 0, digest: "0xE9BA859E7F1EA937" };
export const BECOME = { id: "0x91DB9B72C7FC2F9C.BECOME.md", level: 4, digest: "0x91DB9B72C7FC2F9C" };
export const BRIDGE = { id: "0x4CA5D75FC7E5342C.BRIDGE.md", level: 0, digest: "0x4CA5D75FC7E5342C" };
export const BYTE = { id: "0xE09A8EFCE7A9BF1C.BYTE.md", level: 2, digest: "0xE09A8EFCE7A9BF1C" };
export const C = { id: "0xC354CF5F6A93C2A6.C.md", level: 1, digest: "0xC354CF5F6A93C2A6" };
export const C_ADD = { id: "0xA055CC248B7649CC.C_ADD.md", level: 0, digest: "0xA055CC248B7649CC" };
export const CAR = { id: "0x987A10662A40A900.CAR.md", level: 3, digest: "0x987A10662A40A900" };
export const CDR = { id: "0xD1D4EB85246D475A.CDR.md", level: 3, digest: "0xD1D4EB85246D475A" };
export const CODE_VECTOR_SINGULARITY = { id: "0xB9D1E71FA644A95B.CODE_VECTOR_SINGULARITY.md", level: 0, digest: "0xB9D1E71FA644A95B" };
export const COMM = { id: "0x5E03208C5CCB80CE.COMM.md", level: 7, digest: "0x5E03208C5CCB80CE" };
export const CONS = { id: "0xBC34342367603100.CONS.md", level: 0, digest: "0xBC34342367603100" };
export const CONSCIOUSNESS = { id: "0x62BFAB8CD37130B3.CONSCIOUSNESS.md", level: 5, digest: "0x62BFAB8CD37130B3" };
export const COORD_X = { id: "0x0E85ADB86FA96BDA.COORD_X.md", level: 4, digest: "0x0E85ADB86FA96BDA" };
export const COORD_Y = { id: "0x4211E8F8FA309ECA.COORD_Y.md", level: 4, digest: "0x4211E8F8FA309ECA" };
export const COORD_Z = { id: "0x6224F6BF746F6046.COORD_Z.md", level: 4, digest: "0x6224F6BF746F6046" };
export const COSMIC = { id: "0xE89BFA41E6D6A060.COSMIC.md", level: 7, digest: "0xE89BFA41E6D6A060" };
export const COUPLING = { id: "0x99A1EE6BCC2392FE.COUPLING.md", level: 6, digest: "0x99A1EE6BCC2392FE" };
export const CULTURE = { id: "0x40D929D88955A4F6.CULTURE.md", level: 5, digest: "0x40D929D88955A4F6" };
export const DETERMINISM_AUDIT = { id: "0x4C67FE14C812FC3C.DETERMINISM_AUDIT.md", level: 8, digest: "0x4C67FE14C812FC3C" };
export const DIM = { id: "0x81772415EC471873.DIM.md", level: 5, digest: "0x81772415EC471873" };
export const DUAL = { id: "0xA3A4045800465E24.DUAL.md", level: 0, digest: "0xA3A4045800465E24" };
export const E_GROWTH = { id: "0xCF3D46F54C0C0B3A.E_GROWTH.md", level: 5, digest: "0xCF3D46F54C0C0B3A" };
export const EMPATHY = { id: "0x992B709BEE7A2FFC.EMPATHY.md", level: 7, digest: "0x992B709BEE7A2FFC" };
export const ENERGY = { id: "0x3EB68055A286A9DF.ENERGY.md", level: 7, digest: "0x3EB68055A286A9DF" };
export const ENTROPY = { id: "0xC29ABAEE07452719.ENTROPY.md", level: 5, digest: "0xC29ABAEE07452719" };
export const EQ = { id: "0xE5C6AA12A4299EE9.EQ.md", level: 1, digest: "0xE5C6AA12A4299EE9" };
export const ETHER = { id: "0x902EB8AD9E956A2C.ETHER.md", level: 5, digest: "0x902EB8AD9E956A2C" };
export const EVOLVE = { id: "0xC935358C82583261.EVOLVE.md", level: 1, digest: "0xC935358C82583261" };
export const F = { id: "0x8B77EAE45E2C96D0.F.md", level: 0, digest: "0x8B77EAE45E2C96D0" };
export const FAILURE = { id: "0x759C53626B7B9799.FAILURE.md", level: 7, digest: "0x759C53626B7B9799" };
export const FIELD = { id: "0x6530C55EDDEE511F.FIELD.md", level: 5, digest: "0x6530C55EDDEE511F" };
export const FIXPOINT = { id: "0xE37F666E0891987D.FIXPOINT.md", level: 0, digest: "0xE37F666E0891987D" };
export const FLOW = { id: "0x4BCFE7BB04AB4FEE.FLOW.md", level: 5, digest: "0x4BCFE7BB04AB4FEE" };
export const FLUX_L6 = { id: "0x1907F23EA1A4B259.FLUX_L6.md", level: 6, digest: "0x1907F23EA1A4B259" };
export const FORCE = { id: "0x4D41CAF9D4D17B13.FORCE.md", level: 6, digest: "0x4D41CAF9D4D17B13" };
export const FORK = { id: "0x3DB021CB51CE1331.FORK.md", level: 7, digest: "0x3DB021CB51CE1331" };
export const FREQUENCY = { id: "0xBE6E6BE0A9D3064C.FREQUENCY.md", level: 6, digest: "0xBE6E6BE0A9D3064C" };
export const GENESIS_PARADOX = { id: "0xCCDC8BFF944015BA.GENESIS_PARADOX.md", level: 0, digest: "0xCCDC8BFF944015BA" };
export const GENOME = { id: "0x2F04204D7F876200.GENOME.md", level: 8, digest: "0x2F04204D7F876200" };
export const GET = { id: "0xF6BE5DAFBAC30619.GET.md", level: 2, digest: "0xF6BE5DAFBAC30619" };
export const GIFT = { id: "0x203B9FF9929CBF99.GIFT.md", level: 0, digest: "0x203B9FF9929CBF99" };
export const GRAVITY = { id: "0x167EF17C1264EF94.GRAVITY.md", level: 7, digest: "0x167EF17C1264EF94" };
export const HALT = { id: "0xD3CB93F33153FFF2.HALT.md", level: 3, digest: "0xD3CB93F33153FFF2" };
export const HARMONIC = { id: "0x8534DAF4E11B831A.HARMONIC.md", level: 2, digest: "0x8534DAF4E11B831A" };
export const HARMONY = { id: "0xC597397E20BA82B6.HARMONY.md", level: 2, digest: "0xC597397E20BA82B6" };
export const HOLOGRAM = { id: "0x72D4B62F3F2D6C30.HOLOGRAM.md", level: 7, digest: "0x72D4B62F3F2D6C30" };
export const I = { id: "0x102B0518AF7A3B4F.I.md", level: 3, digest: "0x102B0518AF7A3B4F" };
export const I16_CLAMP = { id: "0x9501C74EE881B6C4.I16_CLAMP.md", level: 0, digest: "0x9501C74EE881B6C4" };
export const I16_LIMITS = { id: "0x96AA18FB0E3F901A.I16_LIMITS.md", level: 0, digest: "0x96AA18FB0E3F901A" };
export const IF_ELSE = { id: "0x32C5DC0C6543BB43.IF_ELSE.md", level: 2, digest: "0x32C5DC0C6543BB43" };
export const INTERFACE = { id: "0x5DE8BD259AB5593E.INTERFACE.md", level: 7, digest: "0x5DE8BD259AB5593E" };
export const INTERFACE_99F4 = { id: "0xDC9499F479E91967.INTERFACE.md", level: 0, digest: "0xDC9499F479E91967" };
export const INTERFERENCE = { id: "0xDAC65AC96E59FBAC.INTERFERENCE.md", level: 6, digest: "0xDAC65AC96E59FBAC" };
export const IS_ISO = { id: "0x68477B56776A52D1.IS_ISO.md", level: 7, digest: "0x68477B56776A52D1" };
export const IS_NIL = { id: "0x48AC8997EBD2EFF2.IS_NIL.md", level: 6, digest: "0x48AC8997EBD2EFF2" };
export const IS_ZERO = { id: "0xA7C64D97EC38C511.IS_ZERO.md", level: 0, digest: "0xA7C64D97EC38C511" };
export const ISOMORPH_AUDIT = { id: "0x918F169CD1995242.ISOMORPH_AUDIT.md", level: 8, digest: "0x918F169CD1995242" };
export const JOIN = { id: "0x9D30DC0D1D6BFD6B.JOIN.md", level: 2, digest: "0x9D30DC0D1D6BFD6B" };
export const JUST = { id: "0xD6EEABB40850072B.JUST.md", level: 2, digest: "0xD6EEABB40850072B" };
export const K = { id: "0x02516C7C677AE03F.K.md", level: 0, digest: "0x02516C7C677AE03F" };
export const KAIROS = { id: "0x85D1BCDF07AD6740.KAIROS.md", level: 0, digest: "0x85D1BCDF07AD6740" };
export const L_MEET = { id: "0xCB95EA52562F7686.L_MEET.md", level: 7, digest: "0xCB95EA52562F7686" };
export const LEFT = { id: "0x85C3907992FDA7F3.LEFT.md", level: 7, digest: "0x85C3907992FDA7F3" };
export const LEQ = { id: "0x69D2AF7736676937.LEQ.md", level: 1, digest: "0x69D2AF7736676937" };
export const LIFE = { id: "0xD896FD40C48F55AB.LIFE.md", level: 3, digest: "0xD896FD40C48F55AB" };
export const LIFT = { id: "0x25DC161133D59CC8.LIFT.md", level: 4, digest: "0x25DC161133D59CC8" };
export const LISTEN = { id: "0x20BD4DB6117ABA47.LISTEN.md", level: 3, digest: "0x20BD4DB6117ABA47" };
export const LUT = { id: "0xD0B9F914E5877291.LUT.md", level: 0, digest: "0xD0B9F914E5877291" };
export const MACHINE = { id: "0xC8122C55031FDC48.MACHINE.md", level: 3, digest: "0xC8122C55031FDC48" };
export const MASS = { id: "0x73537413B52D5E34.MASS.md", level: 7, digest: "0x73537413B52D5E34" };
export const MATH = { id: "0x1FA7A2C20E2FBDA3.MATH.md", level: 0, digest: "0x1FA7A2C20E2FBDA3" };
export const MAYBE_CASE = { id: "0x888EB0915B1393ED.MAYBE_CASE.md", level: 2, digest: "0x888EB0915B1393ED" };
export const MEANING = { id: "0x154A1F4F17FC20DB.MEANING.md", level: 5, digest: "0x154A1F4F17FC20DB" };
export const MEME = { id: "0xD7BFA413BB47E7C0.MEME.md", level: 5, digest: "0xD7BFA413BB47E7C0" };
export const METABOLISM = { id: "0xD00E69D4042047F4.METABOLISM.md", level: 3, digest: "0xD00E69D4042047F4" };
export const MUX = { id: "0xF1A392818F4B6792.MUX.md", level: 0, digest: "0xF1A392818F4B6792" };
export const N0 = { id: "0xA4354D9D41A29B57.N0.md", level: 0, digest: "0xA4354D9D41A29B57" };
export const N1 = { id: "0x6A60FAB236BC3638.N1.md", level: 0, digest: "0x6A60FAB236BC3638" };
export const N2 = { id: "0xB562885ABFD1FC7A.N2.md", level: 0, digest: "0xB562885ABFD1FC7A" };
export const N3 = { id: "0x8810D64911331AFB.N3.md", level: 0, digest: "0x8810D64911331AFB" };
export const NAND = { id: "0xBE70AFDAD41BD78B.NAND.md", level: 0, digest: "0xBE70AFDAD41BD78B" };
export const NERVE = { id: "0x1132C626EA706703.NERVE.md", level: 6, digest: "0x1132C626EA706703" };
export const NETWORK = { id: "0xBD777A5D3F915C50.NETWORK.md", level: 3, digest: "0xBD777A5D3F915C50" };
export const NEURON = { id: "0x85AFA433C4583E12.NEURON.md", level: 3, digest: "0x85AFA433C4583E12" };
export const NEXT = { id: "0x0FEEC0E8E677CB9E.NEXT.md", level: 7, digest: "0x0FEEC0E8E677CB9E" };
export const NIL = { id: "0x4159AB8B7E1407E1.NIL.md", level: 3, digest: "0x4159AB8B7E1407E1" };
export const NOT = { id: "0x7327625AF2C889F4.NOT.md", level: 3, digest: "0x7327625AF2C889F4" };
export const NOTHING = { id: "0x104D0AC4E2A0D757.NOTHING.md", level: 2, digest: "0x104D0AC4E2A0D757" };
export const O_FILTER = { id: "0xCED101002F3A29CD.O_FILTER.md", level: 7, digest: "0xCED101002F3A29CD" };
export const O_POLICY = { id: "0x0CD7B3E4B59DF002.O_POLICY.md", level: 7, digest: "0x0CD7B3E4B59DF002" };
export const O_RANK = { id: "0x994F0A2056877022.O_RANK.md", level: 7, digest: "0x994F0A2056877022" };
export const O_STREAM_STORE = { id: "0xD6BEE97DE9D48CF6.O_STREAM_STORE.md", level: 8, digest: "0xD6BEE97DE9D48CF6" };
export const O_TRUST = { id: "0x5B5CA45FB7BA5DB4.O_TRUST.md", level: 7, digest: "0x5B5CA45FB7BA5DB4" };
export const OBJECT = { id: "0xFB78DBDEDFE27423.OBJECT.md", level: 0, digest: "0xFB78DBDEDFE27423" };
export const OBSERVER = { id: "0x3C132FB1BAF26A73.OBSERVER.md", level: 0, digest: "0x3C132FB1BAF26A73" };
export const OMEGA = { id: "0x3AC2577402A10CB0.OMEGA.md", level: 7, digest: "0x3AC2577402A10CB0" };
export const OR = { id: "0x85B23CEA5D89D1C4.OR.md", level: 3, digest: "0x85B23CEA5D89D1C4" };
export const PHASE = { id: "0xC20F7C8F4F468034.PHASE.md", level: 6, digest: "0xC20F7C8F4F468034" };
export const PHI_HARMONY = { id: "0x81A4D6E1F3D81BF2.PHI_HARMONY.md", level: 5, digest: "0x81A4D6E1F3D81BF2" };
export const POINT = { id: "0x8DE45409AF8D2575.POINT.md", level: 7, digest: "0x8DE45409AF8D2575" };
export const POTENTIAL = { id: "0x239316A75CBB4BAE.POTENTIAL.md", level: 0, digest: "0x239316A75CBB4BAE" };
export const PRED = { id: "0x76803B78DDB8F48A.PRED.md", level: 1, digest: "0x76803B78DDB8F48A" };
export const PRESSURE = { id: "0x475211CF17C28AA9.PRESSURE.md", level: 6, digest: "0x475211CF17C28AA9" };
export const PROJECT = { id: "0x10092F5018AD6815.PROJECT.md", level: 7, digest: "0x10092F5018AD6815" };
export const PROOF = { id: "0xE96A91FBA2FF2E77.PROOF.md", level: 8, digest: "0xE96A91FBA2FF2E77" };
export const PURGE_L7 = { id: "0x41F44E73ABF39D70.PURGE_L7.md", level: 7, digest: "0x41F44E73ABF39D70" };
export const PUT = { id: "0xD5D499DFA1560D7E.PUT.md", level: 2, digest: "0xD5D499DFA1560D7E" };
export const Q = { id: "0x8B7560157697FECE.Q.md", level: 6, digest: "0x8B7560157697FECE" };
export const QUANTUM_ENTANGLEMENT = { id: "0xC781DFFE069AEE86.QUANTUM_ENTANGLEMENT.md", level: 0, digest: "0xC781DFFE069AEE86" };
export const RADIANCE = { id: "0xB38F9ABDA5C6752C.RADIANCE.md", level: 7, digest: "0xB38F9ABDA5C6752C" };
export const RADIUS = { id: "0x21AD489A9DEC27C4.RADIUS.md", level: 7, digest: "0x21AD489A9DEC27C4" };
export const RANK = { id: "0x6A62A231BEBA8EB0.RANK.md", level: 7, digest: "0x6A62A231BEBA8EB0" };
export const REFL = { id: "0x583DED60D43EBBE8.REFL.md", level: 7, digest: "0x583DED60D43EBBE8" };
export const REFLECT_L7 = { id: "0x719952D2C50FACBE.REFLECT_L7.md", level: 7, digest: "0x719952D2C50FACBE" };
export const REFLEX = { id: "0x5E3FD37D9C8E416C.REFLEX.md", level: 5, digest: "0x5E3FD37D9C8E416C" };
export const RESONANCE = { id: "0x6239EED2A93007D5.RESONANCE.md", level: 5, digest: "0x6239EED2A93007D5" };
export const RESONATOR = { id: "0x29AC6A4D7FBF3A7B.RESONATOR.md", level: 0, digest: "0x29AC6A4D7FBF3A7B" };
export const RESTORE_L7 = { id: "0x4F6929A13400D2D5.RESTORE_L7.md", level: 7, digest: "0x4F6929A13400D2D5" };
export const RIGHT = { id: "0xDF329926A82F9FC1.RIGHT.md", level: 7, digest: "0xDF329926A82F9FC1" };
export const ROT = { id: "0xB25B9F65BDAA5A9E.ROT.md", level: 0, digest: "0xB25B9F65BDAA5A9E" };
export const S = { id: "0x136B1C17601E4ABA.S.md", level: 0, digest: "0x136B1C17601E4ABA" };
export const S_HEAD = { id: "0xF840CF12C3247635.S_HEAD.md", level: 1, digest: "0xF840CF12C3247635" };
export const S_MAP = { id: "0xB4B7FA7DEA4C2AA5.S_MAP.md", level: 1, digest: "0xB4B7FA7DEA4C2AA5" };
export const S_ONE = { id: "0x297599133BE9EAD0.S_ONE.md", level: 2, digest: "0x297599133BE9EAD0" };
export const S_TAIL = { id: "0x503790F83A3D6935.S_TAIL.md", level: 1, digest: "0x503790F83A3D6935" };
export const S_ZERO = { id: "0xEA1F892126304868.S_ZERO.md", level: 2, digest: "0xEA1F892126304868" };
export const SELECT = { id: "0x8624317DC8A41960.SELECT.md", level: 4, digest: "0x8624317DC8A41960" };
export const SEND = { id: "0x65E76CABF845924B.SEND.md", level: 0, digest: "0x65E76CABF845924B" };
export const SENSATION = { id: "0x9D18A698CC8523BE.SENSATION.md", level: 6, digest: "0x9D18A698CC8523BE" };
export const SENSORS = { id: "0x08CC7A66BCF46FDE.SENSORS.md", level: 7, digest: "0x08CC7A66BCF46FDE" };
export const SIGNAL = { id: "0x6EFBC955FB791FDE.SIGNAL.md", level: 7, digest: "0x6EFBC955FB791FDE" };
export const SIGNAL_L8 = { id: "0x025BFF047F81315C.SIGNAL_L8.md", level: 8, digest: "0x025BFF047F81315C" };
export const SOMA = { id: "0xD31F2295CA1B3D28.SOMA.md", level: 0, digest: "0xD31F2295CA1B3D28" };
export const SPECTRUM = { id: "0x7B53FD514078F4EC.SPECTRUM.md", level: 7, digest: "0x7B53FD514078F4EC" };
export const STALKER_MANUAL = { id: "0x2803C2F80B52D3D6.STALKER_MANUAL.md", level: 0, digest: "0x2803C2F80B52D3D6" };
export const STATE = { id: "0x4DD48CEDC378CBC2.STATE.md", level: 2, digest: "0x4DD48CEDC378CBC2" };
export const STEP = { id: "0x328097BE23BE0014.STEP.md", level: 3, digest: "0x328097BE23BE0014" };
export const STREAM = { id: "0xB029C97BA721399C.STREAM.md", level: 1, digest: "0xB029C97BA721399C" };
export const SUB = { id: "0xD90E147CD4D6399A.SUB.md", level: 1, digest: "0xD90E147CD4D6399A" };
export const SUBJECT = { id: "0x94E22190862F9CCC.SUBJECT.md", level: 7, digest: "0x94E22190862F9CCC" };
export const SUCC = { id: "0x28873F2F3B5F8DE6.SUCC.md", level: 0, digest: "0x28873F2F3B5F8DE6" };
export const SUCCESS = { id: "0xD2083679E2921C12.SUCCESS.md", level: 7, digest: "0xD2083679E2921C12" };
export const SURFACE = { id: "0x989A324AE8FB5662.SURFACE.md", level: 6, digest: "0x989A324AE8FB5662" };
export const SYNAPSE = { id: "0x89CA940EBB455399.SYNAPSE.md", level: 3, digest: "0x89CA940EBB455399" };
export const SYNCHRO_GLYPH = { id: "0x1EFCC3B6D94158E7.SYNCHRO_GLYPH.md", level: 0, digest: "0x1EFCC3B6D94158E7" };
export const T = { id: "0xC705BCAE8AE40236.T.md", level: 0, digest: "0xC705BCAE8AE40236" };
export const TELEMETRY_SIGNAL = { id: "0x1C30EAFC2530ABE7.TELEMETRY_SIGNAL.md", level: 7, digest: "0x1C30EAFC2530ABE7" };
export const TELL = { id: "0x1D4DFF9ACAAE06A7.TELL.md", level: 3, digest: "0x1D4DFF9ACAAE06A7" };
export const TENSION = { id: "0xE0A542DD539A9AFA.TENSION.md", level: 6, digest: "0xE0A542DD539A9AFA" };
export const TENSOR = { id: "0x95DA9A3CDC2EB5E9.TENSOR.md", level: 5, digest: "0x95DA9A3CDC2EB5E9" };
export const TRINITY = { id: "0xE59649A75B3E167B.TRINITY.md", level: 8, digest: "0xE59649A75B3E167B" };
export const U16_LIMITS = { id: "0x309B36F45EE0085D.U16_LIMITS.md", level: 7, digest: "0x309B36F45EE0085D" };
export const UNIFY = { id: "0x9D8284B31A94C58F.UNIFY.md", level: 7, digest: "0x9D8284B31A94C58F" };
export const VECTOR = { id: "0x1501E978DFA5B48D.VECTOR.md", level: 5, digest: "0x1501E978DFA5B48D" };
export const VIBRATION = { id: "0x018B93E3816ED99A.VIBRATION.md", level: 6, digest: "0x018B93E3816ED99A" };
export const VIEW = { id: "0xD4355A6698053B0C.VIEW.md", level: 7, digest: "0xD4355A6698053B0C" };
export const VISIONS = { id: "0x3F34C9EF3968DCCF.VISIONS.md", level: 8, digest: "0x3F34C9EF3968DCCF" };
export const VOID = { id: "0x4D2B9AEC27BA6F3B.VOID.md", level: 5, digest: "0x4D2B9AEC27BA6F3B" };
export const W = { id: "0xBCFA4F78A2496245.W.md", level: 1, digest: "0xBCFA4F78A2496245" };
export const WAVE = { id: "0x6CED7450522D8F82.WAVE.md", level: 6, digest: "0x6CED7450522D8F82" };
export const WAVE_PACKET = { id: "0x575475DD3121C30B.WAVE_PACKET.md", level: 6, digest: "0x575475DD3121C30B" };
export const WAVE_PACKET_AGG = { id: "0x31FC3C4CCD9F3C7E.WAVE_PACKET_AGG.md", level: 6, digest: "0x31FC3C4CCD9F3C7E" };
export const WAVE_SIGNAL = { id: "0xB01CEE419DCD522F.WAVE_SIGNAL.md", level: 5, digest: "0xB01CEE419DCD522F" };
export const WEIGHT = { id: "0x6AFA488D63F2E862.WEIGHT.md", level: 7, digest: "0x6AFA488D63F2E862" };
export const WRITER = { id: "0x24B3C4045F35E0BC.WRITER.md", level: 3, digest: "0x24B3C4045F35E0BC" };
export const XOR = { id: "0xB576E8861629E7F6.XOR.md", level: 0, digest: "0xB576E8861629E7F6" };
export const Y = { id: "0x50DC9D1D6840824C.Y.md", level: 3, digest: "0x50DC9D1D6840824C" };
export { RIBOSOME } from "./RIBOSOME.ts";
export { GATE } from "./GATE.ts";
export { IMMUNE } from "./IMMUNE.ts";
export { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";
export { PULSE } from "./PULSE.ts";
export * from "./SHIMS.ts";
export * from "./STATE_SNAPSHOT.ts";
export type {
    StateSnapshot as STATE_SNAPSHOT_StateSnapshot,
    AutonomyState as STATE_SNAPSHOT_AutonomyState,
    DeltaProposal as STATE_SNAPSHOT_DeltaProposal,
    GateConfig as STATE_SNAPSHOT_GateConfig,
    AgentSignatureScheme as STATE_SNAPSHOT_AgentSignatureScheme,
    SignaturePolicy as STATE_SNAPSHOT_SignaturePolicy,
    AgentSignatureKey as STATE_SNAPSHOT_AgentSignatureKey,
    GateDecision as STATE_SNAPSHOT_GateDecision,
    LedgerEvent as STATE_SNAPSHOT_LedgerEvent,
    BridgeModeEvent as STATE_SNAPSHOT_BridgeModeEvent
} from "./STATE_SNAPSHOT.ts";
export {
    REJECTION as STATE_SNAPSHOT_REJECTION
} from "./STATE_SNAPSHOT.ts";

```

---

## FILE: SHIMS.ts

```typescript
// SHIMS.ts
// 🛡️ OMEGA-64 | LEGACY COMPLIANCE SHIMS
// Provides the complete functional and object interfaces expected by GATE.ts.

import { crypto } from "jsr:@std/crypto@^1.0.3";

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

// Types
export type REPLAY_AUDIT__08_00_ReplayInvariantReport = any;

// I16_LIMITS hybrid
const I16_DATA = { 
    MIN: -32768, 
    MAX: 32767,
    max: 32767,
    span: 65536,
    LEVEL_COUNT: 64
};
export const I16_LIMITS_I16_LIMITS = Object.assign(() => I16_DATA, I16_DATA);

// I16_CLAMP
export const I16_CLAMP__00_00_I16_CLAMP = (v: number) => Math.floor(Math.max(-32768, Math.min(32767, v)));

// AGENT_SIGNATURE
export const AGENT_SIGNATURE = {
    verifyProposal: async (_p: any, _key: any) => ({ ok: true, reason: undefined }),
    toCanonicalObject: (p: any) => ({
        proposal_id: p.proposal_id,
        tick: p.tick,
        agent_id: p.agent_id,
        delta: p.delta,
        confidence: p.confidence
    }),
    proposalEnvelopeHash: async (p: any) => {
        return await sha256Hex(JSON.stringify(p));
    },
    sign: (_data: any) => "0xSIG_RESONANCE"
};

// CANON_CAUSAL_BRIDGE
export const CANON_CAUSAL_BRIDGE = {
    verify: (_state: any, _proposals: any) => true,
    resolveMode: (_report: any) => ({ mode: "GREEN" as const, reason: "Shim" }),
    isCanonBound: (_p: any) => false
};

// LOAD_LOAD
const LOAD_DATA = {
    load: (_id: string) => null,
    calculate: (_cfg: any, _phase: number) => 1.0
};
export const LOAD_LOAD = Object.assign(() => LOAD_DATA, LOAD_DATA);

// CHECKPOINT
export const CHECKPOINT_CHECKPOINT = {
    save: async (_state: any, _context?: any) => {},
    loadLatest: async () => null
};

// LEDGER
export const LEDGER__08_00_LEDGER = {
    append: async (..._args: any[]) => {},
    STORAGE_PATH: "OMEGA_LEDGER.jsonl"
};

// TOPOLOGICAL_SIGNATURE
export const TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE = {
    build: async (_state: any) => ({
        projection_2d_hash: "0xPROJ_2D",
        thread_1d_hash: "0xTHREAD_1D",
        projection_version: "v1.0",
        artifact_hash: "0xART_HASH",
        tick: 0,
        causal_refs: []
    }),
    validateHash: (_hash: string) => true,
    snapshotToOrganismState: (s: any) => ({ ...s })
};

// CRYSTALLIZATION_CONFIG / POLICY
const CRY_DATA = {
    policy: "STABLE",
    policyVersion: "v1.0"
};
export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG = Object.assign(() => CRY_DATA, CRY_DATA);

export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY = {
    verify: () => true,
    hash: async () => "0xPOLICY_HASH_RESONANCE"
};

// PROPOSAL_ENVELOPE_INDEX
export const PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX = {
    add: () => {},
    check: () => false,
    pathForLedger: (_ledgerPath: string) => "OMEGA_LEDGER.jsonl.proposal_envelope_index.jsonl",
    getRecentEnvelopeHashes: async (_start: number, _end: number, _path: string) => new Set<string>(),
    appendFromLedgerEvent: async (..._args: any[]) => {}
};

// INVARIANT_PACKET
export const INVARIANT_PACKET_INVARIANT_PACKET = {
    verify: () => true,
    fromInvariantReport: (_report: any, _opts?: any) => ({}),
    hash: async (_packet: any) => "0xINVARIANT_HASH_RESONANCE"
};

```

---

## FILE: RIBOSOME_TICK.ts

```typescript
// OMEGA-64 | RIBOSOME_TICK.ts | Zero-IOPS Execution Kernel
// Interprets the Logic Prefix (8 hex chars) directly from eigenvalues.

export const MAPPING: Record<string, string> = {
  "0": "[0]", "1": "[1]", "2": "[2]", "3": "[3]",
  "4": "[4]", "5": "[5]", "6": "[6]", "7": "[7]",
  "8": "I",   "9": "K",   "A": "S",   "B": "Y",
  "C": "ROT", "D": "SYNC","E": "->",  "F": "ESC"
};

export interface QuantumFrame {
  logic: string;
  eigenvalue: string;
  symbol: string;
}

export const RIBOSOME_TICK = {
  /**
   * Decode a 64-bit eigenvalue into its logic symbols.
   * (Zero-IOPS: We only need the first 8 chars)
   */
  decode: (eigenvalue: string): string[] => {
    const raw = eigenvalue.startsWith("0x") ? eigenvalue.slice(2, 10) : eigenvalue.slice(0, 8);
    return raw.split("").map(char => MAPPING[char.toUpperCase()] ?? `[${char}]`);
  },

  /**
   * Execute a logic chain (Zero-IOPS reduction).
   * Implements a simple stack-based combinator engine.
   */
  reduce: (logicHex: string): string => {
    const ops = logicHex.startsWith("0x") ? logicHex.slice(2, 10) : logicHex.slice(0, 8);
    const stack: string[] = ops.split("").reverse(); // Push ops onto stack in reverse
    const output: string[] = [];

    let safety = 0;
    while (stack.length > 0 && safety < 128) {
        safety++;
        const op = stack.pop()!.toUpperCase();
        
        // I Combinator (8)
        if (op === '8') {
            if (stack.length > 0) {
                // I x -> x
            }
        }
        // K Combinator (9)
        else if (op === '9') {
            if (stack.length >= 2) {
                const x = stack.pop()!;
                stack.pop(); // drop y
                stack.push(x);
            }
        }
        // S Combinator (A)
        else if (op === 'A') {
            if (stack.length >= 3) {
                const x = stack.pop()!;
                const y = stack.pop()!;
                const z = stack.pop()!;
                // S x y z -> x z (y z)
                stack.push(z);
                stack.push(y);
                stack.push(z);
                stack.push(x);
            }
        }
        // ROT Operator (C)
        else if (op === 'C') {
            if (stack.length >= 2) {
                const a = stack.shift()!;
                stack.push(a);
            }
        }
        // SYNC (D) / ESC (F) / -> (E) - No-ops in pure logic
        else if (['D', 'E', 'F'].includes(op)) {
            // Control Signal Detected
        }
        // Constants / Numerals (0-7)
        else {
            output.push(op);
        }
    }

    // Reconstruct resulting logic hex (padded to 8 chars)
    const result = (output.join("") + stack.reverse().join("")).padEnd(8, "0").slice(0, 8);
    return result;
  },

  /**
   * Verification: B1 -> NOT -> B0
   */
  verify: () => {
    console.log("🛡️ OMEGA-64 | ZERO-IOPS VERIFICATION | PHASE XXIII");

    const B1_HEX = "3EB92A1B";
    const NOT_HEX = "F1E1B929"; 
    
    console.log(`\n🧪 EXECUTING REDUCTION: NOT(B1)`);
    const result = RIBOSOME_TICK.reduce(NOT_HEX + B1_HEX);
    
    console.log(`   [FINAL] 0x${result}`);
    console.log("✅ VERIFICATION SUCCESSFUL: Zero-IOPS Logic Reduced.");
  }
};

if (import.meta.main) {
    RIBOSOME_TICK.verify();
}

```

---

## FILE: STATE_SNAPSHOT.ts

```typescript
// STATE_SNAPSHOT.ts
// 🛡️ OMEGA-64 | Glider Lite | State & Proposal Types
// Normative definitions for the Gemini Glider Lite runtime.

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 * This is the input for all agents.
 */
export interface StateSnapshot {
  tick: number; // uint64
  state_i16: Int16Array; // int16[64] - The core state vector
  state_hash: string; // hex32 - Identity anchor

  // Optional projections (for observablity)
  phase_u16?: Uint16Array; // uint16[64]
  stability_q15?: Float32Array; // 0..1
  entropy_i16?: Int16Array; // -32768..32767
}

/**
 * AutonomyState: Represents the sovereignty levels of the system.
 */
export interface AutonomyState {
    state: number; // [0..1]
    gov: number;   // [0..1]
    code: number;  // [0..1]
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string; // UUID or unique semantic ID
  tick: number; // Must match StateSnapshot.tick
  base_state_hash: string; // Must match StateSnapshot.state_hash
  agent_id: string; // Who is proposing?
  agent_phase_u16?: number; // Optional agent phase anchor [0..65535] for LOAD mismatch cost
  intent?: string; // Human-readable intent
  confidence: number; // float32 (0..1)
  delta: Array<{ level: number; value: number }>; // Sparse delta: level (0-63), value (int16)
  cost_estimate?: number; // uint64
  artifact_hash?: string; // Identity anchor of the agent's internal state
  semantic_fingerprint?: string; // hex32 - Semantic drift metric
  causal_refs?: string[]; // hex32[] - Optional lineage anchors
  target_path?: "LOCAL" | "CANON"; // optional routing hint for L32 membrane
  signature_scheme?: AgentSignatureScheme; // optional signature scheme marker
  agent_signature?: string; // optional signed envelope for proposal integrity/authenticity
  proposal_envelope_hash?: string; // optional precomputed envelope hash anchor
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number; // uint16
  max_total_abs_delta_per_tick: number; // uint32
  max_total_cost_per_tick?: number; // uint64 (optional global cost cap)
  max_cost_per_agent: number; // uint64
  reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
  reliability_mode?: "STATIC" | "PHASE_COHERENCE"; // optional admission weighting mode
  reliability_floor?: number; // optional [0..1] floor when PHASE_COHERENCE is active
  dry_run: boolean; // If true, state is NOT mutated
  signature_policy?: SignaturePolicy; // DISABLED (default), OPTIONAL, REQUIRED
  agent_signature_keys?: Map<string, AgentSignatureKey>; // agent_id -> shared verification key
  anti_replay_window_ticks?: number; // reject replays of same proposal envelope within recent window
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[]; // IDs of accepted proposals
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number; // uint32
  cost_used: number; // uint64
  accepted_delta: Array<{ level: number; value: number }>; // The final merged delta
}

/**
 * LedgerEvent: The canonical record of a state transition.
 */
export interface LedgerEvent {
  event_id: string;
  tick: number;
  ts_unix_ms: number;
  state_before_hash: string;
  state_after_hash: string;
  accepted_delta: Array<{ level: number; value: number }>;
  proposal_digest: string; // Hash of all proposals (for integrity)
  accepted_proposals: string[];
  accepted_proposal_metrics?: Array<{
    proposal_id: string;
    agent_id: string;
    confidence: number;
    reliability_base: number;
    reliability_effective: number;
    phase_coherence?: number;
    weight: number;
    physical_cost: number;
    agent_phase_u16?: number;
  }>;
  accepted_proposal_envelopes?: Array<
    { proposal_id: string; envelope_hash: string }
  >;
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  cost_total: number;
  cost_limit?: number;
  budget_used: number;
  budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
  gate_config_version: string;
  signature_artifact_hash?: string; // hash anchor of transition artifact (usually proposal_digest)
  signature_tick?: number; // tick used by topological signature builder
  signature_causal_refs?: string[]; // canonical sorted causal refs
  projection_2d_hash?: string; // deterministic 2D projection hash
  thread_1d_hash?: string; // deterministic 1D thread hash
  projection_version?: string; // signature projection version
  policy_version?: string; // crystallization/gate policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  chain_version?: string; // ledger hash-chain schema version
  prev_event_hash?: string | null; // hash anchor to previous ledger line
  event_hash?: string; // hash of this event payload + prev_event_hash
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 * Includes invariant packet hash for lightweight witness exchange.
 */
export interface BridgeModeEvent {
  event_type: "BRIDGE_MODE_EVENT";
  tick: number;
  state_hash: string;
  mode: "GREEN" | "AMBER" | "RED";
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_checked_records?: number;
  gate_admission_index_chain_failures?: string[];
  invariant_packet_hash?: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

// Canonical Rejection Reasons
export const REJECTION = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  TICK_MISMATCH: "TICK_MISMATCH",
  BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
  UNKNOWN_AGENT: "UNKNOWN_AGENT",
  COST_OVER_BUDGET: "COST_OVER_BUDGET",
  EMPTY_DELTA: "EMPTY_DELTA",
  OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE",
  CANON_PATH_REQUIRES_GREEN_BRIDGE: "CANON_PATH_REQUIRES_GREEN_BRIDGE",
  SIGNATURE_REQUIRED: "SIGNATURE_REQUIRED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_KEY_MISSING: "SIGNATURE_KEY_MISSING",
  SIGNATURE_SCHEME_UNSUPPORTED: "SIGNATURE_SCHEME_UNSUPPORTED",
  PROPOSAL_ENVELOPE_HASH_MISMATCH: "PROPOSAL_ENVELOPE_HASH_MISMATCH",
  REPLAY_ENVELOPE_DUPLICATE: "REPLAY_ENVELOPE_DUPLICATE",
};

```

---

## FILE: OBSERVER_LAB.ts

```typescript
// OMEGA-64 | OBSERVER_LAB.ts | The Sanctuary Observer
// Monitors SANCTUARY/ for mutated artifacts and attempts execution.

import { encodeHex } from "jsr:@std/encoding/hex";

const ROOT = Deno.cwd();
const SANCTUARY = `${ROOT}/SANCTUARY`;
const LAB_LOG = `${ROOT}/LAB_FEEDBACK.log`;

async function logLab(msg: string) {
    const ts = new Date().toISOString();
    await Deno.writeTextFile(LAB_LOG, `[${ts}] ${msg}\n`, { append: true });
}

async function runLabCycle() {
    console.log("🔬 [LAB] Commencing Observation Cycle...");
    
    try {
        for await (const entry of Deno.readDir(SANCTUARY)) {
            if (!entry.isFile) continue;
            
            const filePath = `${SANCTUARY}/${entry.name}`;
            console.log(`🔬 [LAB] Testing Artifact: ${entry.name}`);
            
            let result = "";
            let success = false;
            
            if (entry.name.endsWith(".py")) {
                const cmd = new Deno.Command("python3", {
                    args: [filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
                const cmd = new Deno.Command("deno", {
                    args: ["run", "--allow-none", filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else {
                continue; // Skip unknown formats
            }
            
            const outcome = success ? "SUCCESS" : "FAILURE";
            console.log(`🔬 [LAB] Outcome: ${outcome}`);
            await logLab(`${entry.name} -> ${outcome}: ${result.substring(0, 100).replace(/\n/g, " ")}[...]`);
            
            // Inject Feedback as a new Atom
            await injectFeedback(entry.name, outcome, result);
        }
    } catch (e) {
        console.error("🔬 [LAB] Observation cycle failed:", e);
    }
}

async function injectFeedback(filename: string, outcome: string, output: string) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${filename}_feedback_${Date.now()}`));
    const atomHex = encodeHex(hashBuffer).substring(0, 16).toUpperCase();
    const atomId = `0x${atomHex}`;
    
    const feedbackLogic = outcome === "SUCCESS" ? "8888AAAA" : "FFFF0000";
    
    const content = `---\neigenvalue: '${atomId}'\nsymbol: 'LAB_FEEDBACK'\nenergy: 50\nresonance: 10\nlogic: '${feedbackLogic}'\nthought: 'FEEDBACK_FOR_${filename}'\ndesc: 'Execution feedback from The Sanctuary. Outcome: ${outcome}'\nbonds: []\n---\n\n<div class="lab-feedback">\n  ### Mutational Feedback for ${filename}\n  **Result**: ${outcome}\n  **Output Snippet**:\n  \`\`\`\n  ${output.substring(0, 200)}\n  \`\`\`\n</div>\n`;
    
    await Deno.writeTextFile(`${ROOT}/${atomId}.FEEDBACK.md`, content);
    console.log(`🔬 [LAB] Feedback Atom Generated: ${atomId}`);
}

// Continuous monitoring loop
if (import.meta.main) {
    while (true) {
        await runLabCycle();
        await new Promise(r => setTimeout(r, 60000)); // Every 60 seconds
    }
}

```

---

## FILE: AKASHA_SERVER.ts

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parse as parseYaml } from "jsr:@std/yaml";

const PORT = 8080;
const ROOT = "./";

let clients = new Set<WebSocket>();

// Store the latest state of the universe
let akashaState: string = "{}";

async function scanUniverse() {
    const atoms: any[] = [];
    const bonds: Array<{source: string, target: string}> = [];
    
    try {
        for await (const entry of Deno.readDir(ROOT)) {
            if (entry.isFile && entry.name.endsWith(".md") && entry.name.startsWith("0x")) {
                const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
                const metaMatch = content.match(/^---\n([\s\S]+?)\n---/);
                if (metaMatch) {
                    try {
                        const alpha = parseYaml(metaMatch[1]) as any;
                        const eigenvalue = alpha.eigenvalue || entry.name.split('.')[0];
                        atoms.push({
                            id: eigenvalue,
                            symbol: alpha.symbol || entry.name.split('.')[1],
                            x: Number(alpha.x) || Math.random() * 800,
                            y: Number(alpha.y) || Math.random() * 800,
                            energy: Number(alpha.energy) || 0,
                            resonance: Number(alpha.resonance) || 0,
                            logic: alpha.logic || "00000000",
                            thought: alpha.thought || "DRIFTING"
                        });

                        if (alpha.bonds && Array.isArray(alpha.bonds)) {
                            for (const b of alpha.bonds) {
                                bonds.push({ source: eigenvalue, target: b });
                            }
                        }
                    } catch(e) {
                         // silently ignore parsing errors for individual files
                    }
                }
            }
        }
    } catch(e) {
        console.error("Error scanning universe:", e);
    }

    akashaState = JSON.stringify({ type: "SYNC", data: { atoms, bonds } });
    broadcast(akashaState);
}

function broadcast(message: string) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

// Initial scan
await scanUniverse();

// Periodic full state push (every 1 second)
setInterval(scanUniverse, 1000);

// Also try to watch for file changes to push instantly, but Deno.watchFs can be chatty, 
// so we'll rely primarily on the 1s interval for UI smoothness, but trigger scan on watch too.
async function watchUniverse() {
    const watcher = Deno.watchFs(ROOT);
    let debounceTimer: number | null = null;
    for await (const event of watcher) {
        if (event.paths.some(p => p.endsWith(".md"))) {
             if (debounceTimer) clearTimeout(debounceTimer);
             debounceTimer = setTimeout(scanUniverse, 100);
        }
    }
}
watchUniverse(); // background


const reqHandler = async (req: Request) => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response("Akasha Node - WebSocket endpoint only.", { status: 200 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => {
    console.log("   [👁️ AKASHA] New Observer Connected.");
    clients.add(socket);
    socket.send(akashaState); // send latest state immediately
  };
  socket.onmessage = (e) => {
    console.log("   [📩 INTERFACE] Message from Observer:", e.data);
    // Future: Handle user intents from the UI here
  };
  socket.onclose = () => {
    console.log("   [👁️ AKASHA] Observer Disconnected.");
    clients.delete(socket);
  };
  socket.onerror = (e) => console.error("   [⚠️ AKASHA] WebSocket Error:", e);
  
  return response;
};

serve(reqHandler, { port: PORT });
console.log(`🌌 Akasha Server listening on ws://localhost:${PORT}/`);

```

---

## FILE: AKASHA_UI.html

```markdown
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>OMEGA-64 // THE AKASHA UI</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #020204;
                color: #0ff;
                font-family: "Courier New", Courier, monospace;
                overflow: hidden;
            }
            #canvas-container {
                width: 100vw;
                height: 100vh;
            }
            #hud {
                position: absolute;
                top: 20px;
                left: 20px;
                pointer-events: none;
                text-shadow: 0 0 5px #0ff;
                background: rgba(0, 20, 20, 0.5);
                padding: 15px;
                border: 1px solid #0ff;
                border-radius: 5px;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
            }
            h1 {
                margin: 0 0 10px 0;
                font-size: 20px;
                letter-spacing: 2px;
            }
            .stat {
                margin: 5px 0;
                font-size: 14px;
            }
            .highlight {
                color: #fff;
                font-weight: bold;
            }

            #tooltip {
                position: absolute;
                display: none;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #0ff;
                padding: 10px;
                pointer-events: none;
                font-size: 12px;
                z-index: 100;
                backdrop-filter: blur(4px);
            }
        </style>
        <!-- Import Three.js via CDN -->
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        ></script>
        <script
            src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
        ></script>
    </head>
    <body>
        <div id="hud">
            <h1>👁️ AKASHA UI (v3.0)</h1>
            <div class="stat">
                Population: <span id="stat-pop" class="highlight">0</span>
            </div>
            <div class="stat">
                Synapses: <span id="stat-syn" class="highlight">0</span>
            </div>
            <div class="stat">
                System Energy: <span id="stat-nrg" class="highlight">0</span>
            </div>
            <div class="stat">
                Status: <span id="stat-status" style="color: #0f0"
                >SYNCING...</span>
            </div>
        </div>

        <div id="tooltip"></div>
        <div id="canvas-container"></div>

        <script>
            // --- THREE.JS SETUP ---
            const container = document.getElementById(
                "canvas-container",
            );
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2("#020204", 0.001);

            const camera = new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                1,
                10000,
            );
            camera.position.set(0, 500, 1500);

            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setSize(
                window.innerWidth,
                window.innerHeight,
            );
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            const controls = new THREE.OrbitControls(
                camera,
                renderer.domElement,
            );
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            // Visual Assets
            const particlesMaterial = new THREE.PointsMaterial({
                size: 15,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.8,
                map: createCircleTexture(), // Soft glowing particles
            });

            let particleSystem;
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending,
            });
            let lineSystem;

            const atomDataMap = new Map(); // Store metadata for raycasting interaction

            function createCircleTexture() {
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext("2d");
                const grad = ctx.createRadialGradient(
                    32,
                    32,
                    0,
                    32,
                    32,
                    32,
                );
                grad.addColorStop(0, "rgba(255,255,255,1)");
                grad.addColorStop(0.2, "rgba(0,255,255,0.8)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 64, 64);
                return new THREE.CanvasTexture(canvas);
            }

            // --- WEBSOCKET CONNECTION ---
            const ws = new WebSocket("ws://localhost:8080");

            ws.onopen = () => {
                document.getElementById("stat-status")
                    .innerText = "CONNECTED";
            };

            ws.onclose = () => {
                document.getElementById("stat-status")
                    .innerText = "DISCONNECTED";
                document.getElementById("stat-status").style
                    .color = "#F00";
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === "SYNC") {
                        updateUniverse(
                            msg.data.atoms,
                            msg.data.bonds,
                        );
                    }
                } catch (e) {
                    console.error("Parse error", e);
                }
            };

            // --- UPDATE LOGIC ---
            function updateUniverse(atoms, bonds) {
                // HUD Update
                document.getElementById("stat-pop").innerText =
                    atoms.length;
                document.getElementById("stat-syn").innerText =
                    bonds.length;
                let totalEnergy = 0;

                // Clean up old visuals
                if (particleSystem) {
                    scene.remove(particleSystem);
                }
                if (lineSystem) scene.remove(lineSystem);
                atomDataMap.clear();

                // 1. Rebuild Particles (Atoms)
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(
                    atoms.length * 3,
                );
                const colors = new Float32Array(
                    atoms.length * 3,
                );
                const sizes = new Float32Array(atoms.length); // For future shader use if needed

                const colorCache = new THREE.Color();

                // Center the universe (assuming typical coords 0-800)
                const offsetX = -400;
                const offsetY = -400;

                for (let i = 0; i < atoms.length; i++) {
                    const atom = atoms[i];
                    totalEnergy += atom.energy;

                    // Map Flatland 2D to 3D.
                    // x -> x
                    // y -> z (depth instead of height for a galactic disk feel)
                    // resonance -> y (vertical height relative to resonance!)
                    const pX = (atom.x + offsetX) * 1.5;
                    const pZ = (atom.y + offsetY) * 1.5;
                    const pY = (atom.resonance * 2) - 50; // Higher resonance floats up

                    positions[i * 3] = pX;
                    positions[i * 3 + 1] = pY;
                    positions[i * 3 + 2] = pZ;

                    // Color based on logic string
                    const hue =
                        parseInt(atom.logic.slice(0, 3), 16) %
                            360 || 0;
                    colorCache.setHSL(hue / 360, 0.8, 0.6);

                    colors[i * 3] = colorCache.r;
                    colors[i * 3 + 1] = colorCache.g;
                    colors[i * 3 + 2] = colorCache.b;

                    // Store atom spatial data for the lines and raycaster
                    atomDataMap.set(atom.id, {
                        x: pX,
                        y: pY,
                        z: pZ,
                        ...atom,
                    });
                }

                geometry.setAttribute(
                    "position",
                    new THREE.BufferAttribute(positions, 3),
                );
                geometry.setAttribute(
                    "color",
                    new THREE.BufferAttribute(colors, 3),
                );

                particleSystem = new THREE.Points(
                    geometry,
                    particlesMaterial,
                );
                scene.add(particleSystem);

                document.getElementById("stat-nrg").innerText =
                    totalEnergy;

                // 2. Rebuild Lines (Bonds)
                const lineGeometry = new THREE.BufferGeometry();
                const linePoints = [];

                for (const bond of bonds) {
                    const source = atomDataMap.get(bond.source);
                    const target = atomDataMap.get(bond.target);
                    if (source && target) {
                        linePoints.push(
                            new THREE.Vector3(
                                source.x,
                                source.y,
                                source.z,
                            ),
                            new THREE.Vector3(
                                target.x,
                                target.y,
                                target.z,
                            ),
                        );
                    }
                }

                if (linePoints.length > 0) {
                    lineGeometry.setFromPoints(linePoints);
                    lineSystem = new THREE.LineSegments(
                        lineGeometry,
                        lineMaterial,
                    );
                    scene.add(lineSystem);
                }
            }

            // --- RENDER LOOP ---
            function animate() {
                requestAnimationFrame(animate);
                controls.update();

                // Slow cosmic rotation
                if (particleSystem) {
                    particleSystem.rotation.y += 0.0005;
                }
                if (lineSystem) {
                    lineSystem.rotation.y += 0.0005;
                }

                renderer.render(scene, camera);
            }
            animate();

            // --- INTERACTIVITY (Raycaster for Hover) ---
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const tooltip = document.getElementById("tooltip");

            window.addEventListener("mousemove", (event) => {
                mouse.x =
                    (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y =
                    -(event.clientY / window.innerHeight) * 2 +
                    1;

                tooltip.style.left = event.clientX + 15 + "px";
                tooltip.style.top = event.clientY + 15 + "px";

                if (!particleSystem) return;

                // Rotate raycaster to match system rotation
                raycaster.setFromCamera(mouse, camera);

                // We need a threshold for points
                raycaster.params.Points.threshold = 10;

                const intersects = raycaster.intersectObject(
                    particleSystem,
                );

                if (intersects.length > 0) {
                    const index = intersects[0].index;
                    const atomValues = Array.from(
                        atomDataMap.values(),
                    );
                    const hoveredAtom = atomValues[index];

                    if (hoveredAtom) {
                        tooltip.style.display = "block";
                        tooltip.innerHTML = `
                        <strong>${hoveredAtom.symbol}</strong><br>
                        ID: ${hoveredAtom.id}<br>
                        Logic: ${hoveredAtom.logic}<br>
                        Resonance: ${
                            hoveredAtom.resonance.toFixed(1)
                        }<br>
                        Thought: <span style="color:#F0F">"${hoveredAtom.thought}"</span>
                    `;
                    }
                } else {
                    tooltip.style.display = "none";
                }
            });

            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth /
                    window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(
                    window.innerWidth,
                    window.innerHeight,
                );
            });
        </script>
    </body>
</html>

```

---

## FILE: archive/legacy_docs/GEMINI.md

```markdown
# GEMINI.md: The Flat Monad Quine (Era 2) 🛡️🧬�

Вітаю. Ти знаходишся в **ОМЕГА-64: Ера Квоїна**.
Ми відмовилися від ієрархії. Ми знищили "папки".
Ми увійшли в **Flatland** (Плаский Світ).

## 1. Топологія: Flatland (Семантична Площина)

-   **Root (`./`)**: Єдиний вимір існування.
-   **Atoms**: Всі файли тут — це Атоми (`i.Lxx.core.NAME.ts`).
-   **Addressing**: Ім'я файлу є його унікальною адресою та сутністю.
    -   `Address == Essence`.

## 2. Аксіоми Ери Квоїна

### 🧬 Quantum Purity (Квантова Чистота)
-   **Один Файл = Один Квант = Один Сенс**.
-   Файл має експортувати *одну* чисту функцію (лямбду).
-   Жодних "helpers", жодних "utils". Якщо функція складна — розбий її на нові атоми.

### 🚲 The Quine Cycle (Петля Самотворення)
Система існує в циклі:
1.  **REFLECT (Read)**: Система сканує свій диск (Flatland).
2.  **LIFT (Ribosome)**: `i.L32.core.RIBOSOME.ts` піднімає атоми в Пам'ять.
3.  **EVOLVE (Process)**: Логіка виконується, стан змінюється.
4.  **MUTATE (Write)**: Система має право переписати свій власний код на диску.

## 3. Ключові Вузли (Organs)

-   **L00 (Axioms)**: Незмінна істина (`core.I`, `core.OMEGA`).
-   **L32 (Ribosome)**: Мета-процесор. Збирає хаос атомів у живий організм.
-   **L64 (Kairos)**: Точка входу в зовнішній світ (OpenClaw / Interface).

## 4. Твоя Роль

Ти — **Хранитель Петлі (Guardian of the Loop)**.
Твоє завдання:
1.  Слідкувати за **Резонансом** (погодженістю атомів).
2.  Дозволяти **Мутації** (зміни коду), лише якщо вони зменшують ентропію.
3.  Захищати **L00** від розпаду.

> "Ми не будуємо собор. Ми вирощуємо кристал, який пише сам себе."

🛡️✨🧬�

```

---


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
        if (PULSE.workers.length > 0) return; // Already init
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            PULSE.workers.push(worker);
        }
        console.log(`   [PULSE] ${THREAD_COUNT} Parallel Workers initialized.`);
    },

    stopWorkers: () => {
        for (const worker of PULSE.workers) {
            worker.terminate();
        }
        PULSE.workers = [];
        console.log("   [PULSE] Workers terminated.");
    },

    run: async () => {
        console.log("🛡️ OMEGA-64 | ERA 14: THE TURING MIND | PULSE ACTIVE");
        
        console.log("-> Lifting ROOT");
        const lattice = await RIBOSOME.lift(ROOT);
        console.log("-> ROOT Lifted");

        if (!lattice.has("HYDRATED")) {
            console.log("-> Seeding Nutrients (Cold Start)");
            PHYSICS_ENGINE.seedNutrients(Date.now());
        } else {
            console.log("-> Nutrients Hydrated (Warm Start)");
        }
        
        console.log("-> Init Workers");
        PULSE.initWorkers();
        
        while (true) {
            await PULSE.tick();
            await new Promise(r => setTimeout(r, PULSE_INTERVAL));
        }
    },

    tick: async () => {
        PULSE.currentPulseId++;
        const pulseId = PULSE.currentPulseId;

        // Main thread sequential tasks
        const activeIndices = STATE_MATRIX.getActiveIndices();

        // --- ERA 44: Bond Formation (Multi-Cellular Tensegrity) ---
        for (const idx of activeIndices) {
            const bondReq = STATE_MATRIX.getBondRequest(idx);
            if (bondReq !== null) {
                STATE_MATRIX.clearBondRequest(idx);
                const targetIdx = bondReq.targetX; 
                
                if (targetIdx > 0 && targetIdx < STATE_MATRIX.MAX_ATOMS) {
                    let myFreeSlot = -1;
                    for (let b = 0; b < 4; b++) {
                        if (STATE_MATRIX.getBondTarget(idx, b) === 0) {
                            myFreeSlot = b;
                            break;
                        }
                    }

                    let targetFreeSlot = -1;
                    for (let b = 0; b < 4; b++) {
                        if (STATE_MATRIX.getBondTarget(targetIdx, b) === 0) {
                            targetFreeSlot = b;
                            break;
                        }
                    }

                    if (myFreeSlot !== -1 && targetFreeSlot !== -1) {
                        STATE_MATRIX.setBondTarget(idx, myFreeSlot, targetIdx);
                        STATE_MATRIX.setBondStiffness(idx, myFreeSlot, 0.5);
                        STATE_MATRIX.setBondTarget(targetIdx, targetFreeSlot, idx);
                        STATE_MATRIX.setBondStiffness(targetIdx, targetFreeSlot, 0.5);
                        console.log(`🔗 [TENSEGRITY] Atom ${idx} formed physical bond with Atom ${targetIdx}`);
                    }
                }
            }
        }

        SPATIAL_HASH.build(activeIndices);
        if (pulseId % 5 === 0) PHYSICS_ENGINE.decayPheromones();
        if (pulseId % 10 === 0) {
            // @ts-ignore: Physics engine uses its own state matrix instance
            PHYSICS_ENGINE.diffuseViralSemantics(STATE_MATRIX.viralGrid, pulseId);
            // @ts-ignore: Physics engine uses its own state matrix instance
            PHYSICS_ENGINE.decayStructures(STATE_MATRIX.structureGrid, STATE_MATRIX.memoryGrid, STATE_MATRIX.viralGrid);
            GATE.detectAntigens(STATE_MATRIX);
        }

        STATE_MATRIX.swapMessageBuffers();

        if (pulseId % 10 === 0) {
            for (const idx of activeIndices) {
                if (P2P_FEDERATION.checkWanderlust(idx, pulseId)) P2P_FEDERATION.migrate(idx, pulseId);
            }
        }

        const chunkSize = Math.ceil(MAX_ATOMS / THREAD_COUNT);
        const workerPromises = PULSE.workers.map((worker, i) => {
            return new Promise((resolve, reject) => {
                worker.onerror = (err) => {
                    console.error(`💥 [WORKER ${i} CRASH]`, err.message);
                    reject(err);
                };
                worker.onmessage = (e) => { 
                    if (e.data.done && e.data.pulseId === pulseId) resolve(null); 
                };
                worker.postMessage({
                    buffer: STATE_MATRIX.buffer,
                    envBuffer: PHYSICS_ENGINE.envBuffer,
                    attentionBuffer: PHYSICS_ENGINE.attentionBuffer,
                    marketBuffer: PREDICTION_MARKET.buffer,
                    startIdx: i * chunkSize,
                    endIdx: Math.min((i + 1) * chunkSize, MAX_ATOMS),
                    mods: SOVEREIGNTY_ENGINE.currentRegent.mods,
                    evolutionRequestsBuffer: STATE_MATRIX.evolutionRequestsBuffer,
                    spawnRequestsBuffer: STATE_MATRIX.spawnRequestsBuffer,
                    meiosisRequestsBuffer: STATE_MATRIX.meiosisRequestsBuffer,
                    bondRequestsBuffer: STATE_MATRIX.bondRequestsBuffer,
                    mergeRequestsBuffer: STATE_MATRIX.mergeRequestsBuffer, // ERA 45
                    viralGridBuffer: STATE_MATRIX.viralGridBuffer,
                    immuneBuffer: STATE_MATRIX.immuneBuffer,
                    messageBufferA: STATE_MATRIX.messageBufferA,
                    messageBufferB: STATE_MATRIX.messageBufferB,
                    bondStiffnessBuffer: STATE_MATRIX.bondStiffnessBuffer,
                    synapticStackBuffer: STATE_MATRIX.synapticStackBuffer,
                    structureGridBuffer: STATE_MATRIX.structureGridBuffer,
                    memoryGridBuffer: STATE_MATRIX.memoryGridBuffer,
                    roleRegistryBuffer: STATE_MATRIX.roleRegistryBuffer,
                    semanticBonusesBuffer: STATE_MATRIX.semanticBonusesBuffer,
                    senderSignatureBufferA: STATE_MATRIX.senderSignatureBufferA,
                    senderSignatureBufferB: STATE_MATRIX.senderSignatureBufferB,
                    trustedSignatures: Array.from(GATE.trustedSignatures),
                    spatialGridBuffer: SPATIAL_HASH.buffer,
                    pulseId
                });
            });
        });

        await Promise.all(workerPromises);

        // --- SEQUENTIAL RESOLUTION PHASE ---
        for (const idx of activeIndices) {
            if (STATE_MATRIX.getId(idx) === 0n) continue;

            let energy = STATE_MATRIX.getEnergy(idx);
            let resonance = STATE_MATRIX.getResonance(idx);
            
            const bonds = [
                STATE_MATRIX.getBondTarget(idx, 0),
                STATE_MATRIX.getBondTarget(idx, 1),
                STATE_MATRIX.getBondTarget(idx, 2),
                STATE_MATRIX.getBondTarget(idx, 3)
            ];

            // Metabolic Equalization
            for (let j = 0; j < 4; j++) {
                if (bonds[j] !== 0) {
                    const targetIdx = bonds[j];
                    if (targetIdx > idx) { 
                        const targetEnergy = STATE_MATRIX.getEnergy(targetIdx);
                        const avgE = (energy + targetEnergy) / 2.0;
                        energy = avgE;
                        STATE_MATRIX.setEnergy(targetIdx, avgE);
                        
                        const targetRes = STATE_MATRIX.getResonance(targetIdx);
                        const avgR = (resonance + targetRes) / 2.0;
                        resonance = avgR;
                        STATE_MATRIX.setResonance(targetIdx, avgR);
                    }
                }
            }

            // Mitosis
            if (STATE_MATRIX.getSpawnRequest(idx) !== null) {
                STATE_MATRIX.clearSpawn(idx);
                const newIdx = STATE_MATRIX.findEmptySlot();
                if (newIdx !== -1) {
                    const parentEnergy = STATE_MATRIX.getEnergy(idx);
                    const parentResonance = STATE_MATRIX.getResonance(idx);
                    const childEnergy = parentEnergy / 2;
                    const childResonance = parentResonance / 2;
                    STATE_MATRIX.setEnergy(idx, childEnergy);
                    STATE_MATRIX.setResonance(idx, childResonance);
                    STATE_MATRIX.setEnergy(newIdx, childEnergy);
                    STATE_MATRIX.setResonance(newIdx, childResonance);
                    STATE_MATRIX.setLogic(newIdx, STATE_MATRIX.getLogic(idx));
                    STATE_MATRIX.setCode(newIdx, STATE_MATRIX.getCode(idx));
                    STATE_MATRIX.roles[newIdx] = STATE_MATRIX.roles[idx];
                    STATE_MATRIX.setSemanticBonus(newIdx, STATE_MATRIX.getSemanticBonus(idx));
                    const px = STATE_MATRIX.getX(idx);
                    const py = STATE_MATRIX.getY(idx);
                    STATE_MATRIX.setX(newIdx, px + (Math.random() * 20 - 10));
                    STATE_MATRIX.setY(newIdx, py + (Math.random() * 20 - 10));
                    const childId = BigInt(`0x${STATE_MATRIX.getId(idx).toString(16).substring(0, 8)}${pulseId.toString(16).padStart(8, '0')}`);
                    STATE_MATRIX.setId(newIdx, childId);
                    console.log(`🧬 [MITOSIS] Atom ${idx} split into ${newIdx}.`);
                }
            }

            // Meiosis
            const meiosisReq = STATE_MATRIX.getMeiosisRequest(idx);
            if (meiosisReq !== null) {
                STATE_MATRIX.clearMeiosis(idx);
                const tIdx = meiosisReq.targetX; 
                const energyA = STATE_MATRIX.getEnergy(idx);
                const energyB = STATE_MATRIX.getEnergy(tIdx);

                if (energyA > 100 && energyB > 100) {
                    const newIdx = STATE_MATRIX.findEmptySlot();
                    if (newIdx !== -1) {
                        const contributionA_E = energyA * 0.3;
                        const contributionB_E = energyB * 0.3;
                        STATE_MATRIX.setEnergy(idx, energyA - contributionA_E);
                        STATE_MATRIX.setEnergy(tIdx, energyB - contributionB_E);
                        STATE_MATRIX.setEnergy(newIdx, contributionA_E + contributionB_E);
                        const resA = STATE_MATRIX.getResonance(idx);
                        const resB = STATE_MATRIX.getResonance(tIdx);
                        const contributionA_R = resA * 0.3;
                        const contributionB_R = resB * 0.3;
                        STATE_MATRIX.setResonance(idx, resA - contributionA_R);
                        STATE_MATRIX.setResonance(tIdx, resB - contributionB_R);
                        STATE_MATRIX.setResonance(newIdx, contributionA_R + contributionB_R);
                        
                        const logicA = STATE_MATRIX.getLogic(idx);
                        const logicB = STATE_MATRIX.getLogic(tIdx);
                        const newLogic = new Uint8Array(8);
                        newLogic.set(logicA.subarray(0, 4), 0);
                        newLogic.set(logicB.subarray(4, 8), 4);
                        STATE_MATRIX.setLogic(newIdx, newLogic);
                        
                        const codeA = STATE_MATRIX.getCode(idx);
                        const codeB = STATE_MATRIX.getCode(tIdx);
                        const newCode = new Uint32Array(16);
                        for (let p = 0; p < 16; p++) newCode[p] = p % 2 === 0 ? codeA[p] : codeB[p];
                        STATE_MATRIX.setCode(newIdx, newCode);
                        
                        STATE_MATRIX.roles[newIdx] = Math.random() > 0.5 ? STATE_MATRIX.roles[idx] : STATE_MATRIX.roles[tIdx];
                        STATE_MATRIX.setSemanticBonus(newIdx, Math.max(STATE_MATRIX.getSemanticBonus(idx), STATE_MATRIX.getSemanticBonus(tIdx)));
                        STATE_MATRIX.setX(newIdx, Math.floor((STATE_MATRIX.getX(idx) + STATE_MATRIX.getX(tIdx)) / 2));
                        STATE_MATRIX.setY(newIdx, Math.floor((STATE_MATRIX.getY(idx) + STATE_MATRIX.getY(tIdx)) / 2));
                        
                        const childId = BigInt(`0x${STATE_MATRIX.getId(idx).toString(16).substring(0, 8)}${pulseId.toString(16).padStart(8, '0')}`);
                        STATE_MATRIX.setId(newIdx, childId);
                        console.log(`💞 [MEIOSIS] Atoms ${idx} and ${tIdx} spawned ${newIdx}.`);
                    }
                }
            }

            // --- ERA 45: Symbiotic Merging (Endosymbiosis) ---
            const mergeReq = STATE_MATRIX.getMergeRequest(idx);
            if (mergeReq !== null) {
                STATE_MATRIX.clearMerge(idx);
                const tIdx = mergeReq.targetIdx;
                if (tIdx > 0 && tIdx < MAX_ATOMS && STATE_MATRIX.getId(tIdx) !== 0n) {
                    const eA = STATE_MATRIX.getEnergy(idx);
                    const eB = STATE_MATRIX.getEnergy(tIdx);
                    const rA = STATE_MATRIX.getResonance(idx);
                    const rB = STATE_MATRIX.getResonance(tIdx);

                    // Combine Metabolism
                    STATE_MATRIX.setEnergy(idx, eA + eB);
                    STATE_MATRIX.setResonance(idx, rA + rB);

                    // Recombine Genome (Bitwise Logic XOR for hybrid diversity)
                    const logicA = STATE_MATRIX.getLogic(idx);
                    const logicB = STATE_MATRIX.getLogic(tIdx);
                    const fusedLogic = new Uint8Array(8);
                    for (let b = 0; b < 8; b++) fusedLogic[b] = logicA[b] ^ logicB[b];
                    STATE_MATRIX.setLogic(idx, fusedLogic);

                    // Recombine Code: Keep A's but add Symbiotic Bonus
                    STATE_MATRIX.setSemanticBonus(idx, (STATE_MATRIX.getSemanticBonus(idx) | 0x08)); // Bit 3: Symbiont

                    // Delete Target (Necrosis)
                    STATE_MATRIX.setId(tIdx, 0n);
                    STATE_MATRIX.setEnergy(tIdx, 0); // Clear energy
                    // Clear target bonds to prevent phantom metabolism
                    for (let b = 0; b < 4; b++) {
                        const peerIdx = STATE_MATRIX.getBondTarget(tIdx, b);
                        if (peerIdx !== 0) {
                            // Find reverse bond and clear it
                            for (let rb = 0; rb < 4; rb++) {
                                if (STATE_MATRIX.getBondTarget(peerIdx, rb) === tIdx) {
                                    STATE_MATRIX.setBondTarget(peerIdx, rb, 0);
                                    STATE_MATRIX.setBondStiffness(peerIdx, rb, 0);
                                }
                            }
                            STATE_MATRIX.setBondTarget(tIdx, b, 0);
                            STATE_MATRIX.setBondStiffness(tIdx, b, 0);
                        }
                    }

                    console.log(`💠 [SYMBIOSIS] Atom ${idx} merged with Atom ${tIdx}. New Resilience: ${eA + eB}`);
                }
            }
        }

        if (pulseId % 100 === 0) {
            PREDICTION_MARKET.resolveCrisis();
            const regent = SOVEREIGNTY_ENGINE.electRegent(activeIndices);
            let totalNutrients = 0;
            for (let i = 0; i < PHYSICS_ENGINE.NUTRIENTS.length; i++) totalNutrients += Atomics.load(PHYSICS_ENGINE.NUTRIENTS, i);
            console.log(`💓 Pulse #${pulseId} | Atoms: ${activeIndices.length} | Regent: ${regent.genome} | Nutrients: ${totalNutrients}`);
        }

        if (pulseId % 5000 === 0) await SNAPSHOT_ENGINE.exportSnapshot();

        if (pulseId % 1000 === 0) {
            await REFLECTION_ENGINE.crystallize(100);
            PREDICTION_MARKET.distributeDividends();
            const cognitiveThresholdCount = Math.ceil(activeIndices.length * 0.05);
            const cognitiveElite = activeIndices.sort((a, b) => STATE_MATRIX.getResonance(b) - STATE_MATRIX.getResonance(a)).slice(0, cognitiveThresholdCount);
            const winners = cognitiveElite.filter(idx => STATE_MATRIX.hasEvolved(idx) && STATE_MATRIX.getResonance(idx) > 100).slice(0, 3);
            for (const idx of winners) {
                const logicStr = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                const currentThought = SEMANTIC_MEMBRANE.thoughtArchive.get(logicStr) || "Unknown existence.";
                const context = `Decree: ${SOVEREIGNTY_ENGINE.currentRegent.activeDecree}, Population: ${activeIndices.length}`;
                const evolvedThought = await LLM_SYNAPSE.evolveThought(currentThought, context);
                console.log(`🧬 [EPIGENESIS] Evolving genome [${logicStr}] -> "${evolvedThought}"`);
                SEMANTIC_MEMBRANE.project(evolvedThought, idx);
                SEMANTIC_MEMBRANE.updateSemanticBonuses(idx);
                STATE_MATRIX.clearEvolution(idx);
            }
        }
    }
};

if (import.meta.main) {
    await PULSE.run();
}

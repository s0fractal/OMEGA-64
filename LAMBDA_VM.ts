// OMEGA-64 | LAMBDA_VM.ts | The Extended Quine VM (Era 17: The Living Quine)
// Turing-complete bytecode executor with registers, stack, and messaging.

export interface VMResult {
    energyDelta: number;
    resonanceDelta: number;
    intent: { level: number, value: any }[];
    modifiedCode?: { slot: number, value: number };
    modifiedStiffness?: { slot: number, value: number };
    modifiedSynaptic?: { slot: number, value: number };
    syncRequest?: { reg: number };
    modifiedStructure?: { type: number, density: number };
    memeticRequest?: "ENCODE" | "DECODE";
    modifiedRole?: number;
    outgoingMessages: { targetIdx: number, message: number, sourceBondSlot?: number }[];
    imprintRequest?: { pheroSnapshot: number, phaseSnapshot: number, pulseId: number }; // ERA 51
    hebbRequest?: { bondSlot: number }; // ERA 52
    roleRequest?: { role: number }; // ERA 53
    apoptosisRequest?: boolean; // ERA 54
    quorumRequest?: { collectiveType: number, quorumCount: number }; // ERA 55
    lockPhaseRequest?: { targetPhase: number }; // ERA 58
}

export const ISA = {
    // Control Flow
    JMP: 0x30, JZ: 0x31, JNZ: 0x32, CALL: 0x33, RET: 0x34,
    // Arithmetic
    ADD: 0x40, SUB: 0x41, MUL: 0x42, CMP: 0x43,
    // Data Movement
    LOAD: 0x50, STORE: 0x51,
    // Metabolism & Physics (High Level)
    MOVE: 0x10, FEED: 0x20, BET: 0x22, SENSE: 0x9F,
    // Self-Modification
    SELF_MOD: 0x99, SELF_REP: 0x9A, CROSS_REP: 0x9C, BIND: 0x9D, MERGE: 0x9E,
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
    SPEC: 0x84,
    // Viral PURGE (ERA 49)
    PURGE: 0x85,
    // Swarm Intelligence (ERA 50)
    SYNC: 0x86, STAMP: 0x87,
    // Collective Memory (ERA 51)
    IMPRINT: 0x88, RECALL: 0x89,
    // Neural Substrate (ERA 52)
    HEBB: 0x8A, FIRE: 0x8B,
    // Emergent Roles (ERA 53)
    ATTUNE: 0x8C,
    // Temporal Cognition (ERA 54)
    AGE: 0x8D, PHASE_LIFE: 0x8E,
    // Quorum Sensing (ERA 55)
    QUORUM: 0x8F,
    // Epigenetic Inheritance (ERA 56)
    INHERIT: 0x90,
    // Synaptic Plasticity Decay (ERA 57)
    DECAY: 0x91,
    // Resonance Oscillators (ERA 58)
    OSCILLATE: 0x92, LOCK_PHASE: 0x93
};

export const LAMBDA_VM = {
    /**
     * Executes one instruction from the atom's bytecode.
     * context: 32 bytes [0: PC, 1: Flags, 2-9: Regs, 10-17: Stack, 18: SP, 19-31: Reserved]
     */
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, structureGrid: Int32Array, viralGrid: Uint8Array, pheromoneGrid: Int32Array, spatialGrid: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, synapticStack?: Int32Array, role?: number, semanticBonuses?: number, quarantineLevel?: number, incomingMessage?: number, isDiplomatic?: boolean, hiveMemory?: Uint8Array, age?: number, quorumData?: Int32Array, phase?: number }, dryRun = false, wasm?: any): VMResult => {
        const res: VMResult = { energyDelta: 0, resonanceDelta: 0, intent: [], outgoingMessages: [] };
        
        // --- ERA 36: Cognitive Scaffolding (Neural Stigmergy) ---
        const bonuses = state.semanticBonuses || 0;
        const isSwift = (bonuses & 1) === 1;
        const isGuardian = (bonuses & 2) === 2;
        const isHarvest = (bonuses & 4) === 4;

        // --- ERA 38: Metabolic Taxation (Cognitive Load) ---
        if (bonuses > 0) {
            res.energyDelta -= 0.05;
        }

        // --- ERA 26: QUARANTINE ENFORCEMENT ---
        if (state.quarantineLevel === 2) {
            return res;
        }

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
            case ISA.MOVE: {
                const dxVal = (p1 - 128) / 10.0;
                const dyVal = (p2 - 128) / 10.0;
                res.intent.push({ level: 1, value: { dx: dxVal * (isSwift ? 1.5 : 1.0), dy: dyVal * (isSwift ? 1.5 : 1.0) } });
                res.energyDelta -= 0.1;
                break;
            }

            case ISA.FEED: {
                const requested = p1;
                let consumed = 0;
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const idx = gy * 140 + gx;

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

                res.energyDelta += (consumed / 1000) * (isHarvest ? 1.2 : 1.0); 
                if (consumed > 0) res.resonanceDelta += 0.1;
                break;
            }

            case ISA.BET: {
                const betAmount = p1;
                if (state.energy >= betAmount) {
                    res.energyDelta -= betAmount;
                    if (!dryRun) Atomics.add(state.marketPool, 0, Math.round(betAmount * 1000));
                    res.resonanceDelta += 0.5;
                }
                break;
            }

            case ISA.SENSE: {
                const type = p1;
                const regIdx = p2 % 8;
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const idx = gy * 140 + gx;

                let val = 0;
                switch (type) {
                    case 0x01: val = Atomics.load(state.nutrients, idx); break;
                    case 0x02: val = (Atomics.load(state.structureGrid, idx) >> 8) & 0xFF; break;
                    case 0x03: val = Atomics.load(state.viralGrid, idx * 9 + 8); break;
                    case 0x04: val = Atomics.load(state.spatialGrid, idx * 32); break;
                    case 0x05: val = Atomics.load(state.spatialGrid, idx * 32 + 31); break; // Local Phase Average
                    case 0x06: val = (Atomics.load(state.pheromoneGrid, idx) >>> 8) & 0xFF; break; // Pheromone Intensity
                    case 0x07: { // ERA 51: Hive Memory intensity
                        if (state.hiveMemory) {
                            const hBase = idx * 16;
                            const raw = (state.hiveMemory[hBase] | (state.hiveMemory[hBase+1] << 8) |
                                         (state.hiveMemory[hBase+2] << 16) | (state.hiveMemory[hBase+3] << 24));
                            val = (raw >>> 8) & 0xFF;
                        }
                        break;
                    }
                    case 0x08: { // ERA 52: Synaptic weight of bond p2%4
                        if (state.synapticStack) {
                            val = Math.min(255, state.synapticStack[p2 % 4]);
                        }
                        break;
                    }
                    case 0x09: { // ERA 53: Incoming FIRE signal tally (slot 3)
                        if (state.synapticStack) {
                            val = Math.min(255, state.synapticStack[3]);
                        }
                        break;
                    }
                    case 0x0A: { // ERA 54: Age bucket (0=young, 1=mature, 2=aged, 3=senescent)
                        const a = state.age ?? 0;
                        if (a < 50) val = 0;
                        else if (a < 200) val = 1;
                        else if (a < 400) val = 2;
                        else val = 3;
                        break;
                    }
                    case 0x0B: { // ERA 55: Same-role quorum count in local cell
                        if (state.quorumData && state.role !== undefined) {
                            const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                            const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                            const safeRole = Math.min(7, Math.max(0, state.role));
                            val = Math.min(255, state.quorumData[(gy * 140 + gx) * 8 + safeRole]);
                        }
                        break;
                    }
                    case 0x0C: { // ERA 56: Imprint age (ticks since last IMPRINT in this cell)
                        if (state.hiveMemory) {
                            const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                            const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                            const hBase = (gy * 140 + gx) * 16;
                            // bytes 8-11 = pulseId of last imprint; age = current - imprintTick
                            const imprintTick = state.hiveMemory[hBase+8] | (state.hiveMemory[hBase+9] << 8) |
                                               (state.hiveMemory[hBase+10] << 16) | (state.hiveMemory[hBase+11] << 24);
                            const imprintAge = (state.age ?? 0) - (imprintTick & 0xFF);
                            val = Math.min(255, Math.max(0, imprintAge));
                        }
                        break;
                    }
                    case 0x0D: { // ERA 57: Minimum weight across synapticStack[0..2]
                        if (state.synapticStack) {
                            val = Math.min(state.synapticStack[0], state.synapticStack[1], state.synapticStack[2]);
                        }
                        break;
                    }
                    case 0x0E: { // ERA 58: Local phase average from spatialGrid slot 31
                        const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                        const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                        const cellBase = (gy * 140 + gx) * 32;
                        val = Math.min(255, Math.max(0, state.spatialGrid[cellBase + 31]));
                        break;
                    }
                }
                if (!dryRun) {
                    regs[regIdx] = Math.min(255, val);
                    // --- ERA 48: Metabolic Balancing ---
                    res.energyDelta -= 0.5; // Information is a metabolic resource
                }
                break;
            }

            case ISA.EVOLVE:
                res.intent.push({ level: 5, value: "EVOLUTION_REQUEST" });
                res.resonanceDelta += 1.0;
                break;

            case ISA.JMP:
                pc = p1 % 16;
                pcJumped = true;
                break;

            case ISA.JZ:
                if ((flags & 0x01) === 1) { pc = p1 % 16; pcJumped = true; }
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
                    else pc = stack[sp - 1];
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
                if (!dryRun) {
                    res.modifiedCode = { slot: p2 % 16, value: regs[p1 % 8] };
                    logic[p2 % 8] = regs[p1 % 8];
                }
                break;

            case ISA.SELF_MOD:
                if (state.energy > 50) {
                    res.modifiedCode = { slot: p1 % 16, value: (p3 << 16) | (p2 << 8) | p1 };
                    res.energyDelta -= 30;
                    res.resonanceDelta += 5;
                }
                break;

            case ISA.SELF_REP: {
                // --- ERA 48: High-Density Friction ---
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const density = Atomics.load(state.spatialGrid, (gy * 140 + gx) * 32);
                const baseCost = 80;
                const friction = density > 10 ? (density - 10) * 10 : 0;
                const totalCost = baseCost + friction;

                if (state.energy > (totalCost + 70)) {
                    res.intent.push({ level: 10, value: "spawn" });
                    res.energyDelta -= totalCost;
                }
                break;
            }

            case ISA.CROSS_REP: {
                // --- ERA 48: High-Density Friction ---
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const density = Atomics.load(state.spatialGrid, (gy * 140 + gx) * 32);
                const baseCost = 100;
                const friction = density > 10 ? (density - 10) * 15 : 0;
                const totalCost = baseCost + friction;

                if (state.energy > (totalCost + 50)) {
                    res.energyDelta -= totalCost;
                    res.intent.push({ level: 11, value: { type: "meiosis", targetBondSlot: p1 % 4 } });
                }
                break;
            }

            case ISA.BIND: {
                const dxVal = (p1 - 128) / 10.0;
                const dyVal = (p2 - 128) / 10.0;
                res.intent.push({ level: 12, value: { dx: dxVal, dy: dyVal } });
                res.energyDelta -= 10;
                break;
            }

            case ISA.MERGE: {
                if (state.resonance > 300) {
                    res.intent.push({ level: 13, value: { targetBondSlot: p1 % 4 } });
                    res.energyDelta -= 50;
                }
                break;
            }

            case ISA.SEND: {
                const slot = p1 % 4;
                const targetIdx = state.bonds[slot];
                if (targetIdx !== 0) {
                    res.outgoingMessages.push({ targetIdx, message: p2, sourceBondSlot: slot });
                    res.energyDelta -= 2;
                }
                break;
            }

            case ISA.RECV:
                if (!dryRun) regs[p1 % 8] = (state.incomingMessage || 0) & 0xFF;
                if (state.isDiplomatic) res.resonanceDelta += 2.0;
                else res.resonanceDelta += 0.2;
                break;

            case ISA.LOCK: {
                const slot = p1 % 4;
                res.modifiedStiffness = { slot, value: Math.min(100, p2) / 100 };
                res.energyDelta -= 5;
                break;
            }

            case ISA.SYNC_AVG:
                res.syncRequest = { reg: p1 % 8 };
                res.energyDelta -= 3;
                break;

            case ISA.PUSH_COLL:
                res.modifiedSynaptic = { slot: p2 % 4, value: regs[p1 % 8] };
                res.energyDelta -= 2;
                break;

            case ISA.POP_COLL:
                if (!dryRun && state.synapticStack) regs[p2 % 8] = state.synapticStack[p1 % 4];
                res.energyDelta -= 1;
                break;

            case ISA.BUILD:
                if (state.resonance > 40) {
                    res.modifiedStructure = { type: p1 % 8, density: Math.min(255, p2) };
                    res.energyDelta -= 10;
                    res.resonanceDelta -= isGuardian ? 10 : 20;
                }
                break;

            case ISA.EXCAVATE:
                res.modifiedStructure = { type: 0, density: 0 };
                res.energyDelta += 5;
                break;

            case ISA.ENCODE:
                if (state.resonance > 50) {
                    res.memeticRequest = "ENCODE";
                    res.energyDelta -= 15;
                    res.resonanceDelta -= 10;
                }
                break;

            case ISA.DECODE:
                res.memeticRequest = "DECODE";
                res.energyDelta -= 5;
                break;

            case ISA.SPEC:
                if (state.resonance > 100) {
                    const newRole = p1 % 4;
                    if (state.role !== undefined && state.role !== 0 && state.role !== newRole) {
                        res.energyDelta -= (state.energy * 0.5);
                        res.resonanceDelta -= (state.resonance * 0.5);
                    }
                    res.modifiedRole = newRole;
                    res.energyDelta -= 20;
                    res.resonanceDelta -= 30;
                }
                break;

            case ISA.PURGE: {
                // --- ERA 49: Viral Shielding (Immune Resolution) ---
                if (state.energy > 60) {
                    res.memeticRequest = "DECODE"; // Reuse existing memetic path to restore from memoryGrid
                    res.energyDelta -= 50;
                    res.resonanceDelta += 5;
                }
                break;
            }

            case ISA.SYNC: {
                // --- ERA 50: Collective Coordination ---
                res.intent.push({ level: 15, value: "SYNC_PHASE" });
                res.energyDelta -= 5;
                res.resonanceDelta += 2;
                break;
            }

            case ISA.STAMP: {
                // --- ERA 50: Stigmergy (Pheromones) ---
                if (state.resonance > 30) {
                    res.intent.push({ level: 16, value: { type: p1 % 8, intensity: Math.min(255, p2) } });
                    res.energyDelta -= 10;
                    res.resonanceDelta -= 2;
                }
                break;
            }

            case ISA.IMPRINT: {
                // --- ERA 51: Collective Memory — encode snapshot ---
                // Read current local pheromone + phase and request worker to write to hiveMemory
                if (state.resonance > 20 && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const pIdx = gy * 140 + gx;
                    const pheroSnap = Atomics.load(state.pheromoneGrid, pIdx);
                    const phaseSnap = state.resonance; // use resonance as phase proxy in VM scope
                    res.imprintRequest = { pheroSnapshot: pheroSnap, phaseSnapshot: Math.round(phaseSnap), pulseId: 0 };
                    res.energyDelta -= 5;
                    res.resonanceDelta -= 1;
                }
                break;
            }

            case ISA.RECALL: {
                // --- ERA 51: Collective Memory — read snapshot into register ---
                // p1 = field (0=phero intensity, 1=pheromone type, 2=phase)
                // p2 = destination register index
                if (state.hiveMemory && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const hBase = (gy * 140 + gx) * 16;
                    const raw32 = state.hiveMemory[hBase] | (state.hiveMemory[hBase+1] << 8) |
                                  (state.hiveMemory[hBase+2] << 16) | (state.hiveMemory[hBase+3] << 24);
                    let recalled = 0;
                    if (p1 === 0) recalled = (raw32 >>> 8) & 0xFF; // phero intensity
                    if (p1 === 1) recalled = raw32 & 0xFF;          // phero type
                    if (p1 === 2) recalled = state.hiveMemory[hBase + 4] | (state.hiveMemory[hBase + 5] << 8); // phase
                    regs[p2 % 8] = Math.min(255, recalled);
                    res.energyDelta -= 0.3;
                }
                break;
            }

            case ISA.HEBB: {
                // --- ERA 52: Hebbian Plasticity ---
                // p1 = bond slot (0-3); strengthen if both atoms resonating strongly
                // "Fire together → wire together"
                const HEBB_THRESHOLD = 200; // raw resonance (×SCALE = 0.2)
                const slot = p1 % 4;
                if (state.resonance > HEBB_THRESHOLD && state.synapticStack && !dryRun) {
                    // Check neighbour resonance via spatialGrid density as a proxy
                    // (actual resonance comparison happens in PULSE_WORKER)
                    const targetIdx = state.bonds[slot];
                    if (targetIdx > 0) {
                        res.hebbRequest = { bondSlot: slot };
                        res.energyDelta -= 1;
                    }
                }
                break;
            }

            case ISA.FIRE: {
                // --- ERA 52: Synaptic Signal Propagation ---
                // p1 = bond slot; p2 = amplitude (0-255)
                // Emit signal weighted by synapticStack[p1]
                const slot = p1 % 4;
                const amplitude = p2;
                if (state.synapticStack && !dryRun) {
                    const weight = state.synapticStack[slot]; // 0..255 scaled
                    if (weight > 10) {
                        res.intent.push({
                            level: 18,
                            value: { bondSlot: slot, amplitude, weight }
                        });
                        res.energyDelta -= (weight / 255) * amplitude * 0.1;
                    }
                }
                break;
            }

            case ISA.ATTUNE: {
                // --- ERA 53: Emergent Roles ---
                // Read incoming FIRE signal tally from synapticStack[3].
                // If tally exceeds threshold, auto-specialize into the role
                // derived from dominant incoming synapse weight (slots 0–2).
                // p1 = tally threshold (0=use default 20)
                // p2 = role override (0=auto-derive from weights)
                if (state.synapticStack && !dryRun) {
                    const tally = state.synapticStack[3]; // incoming FIRE count
                    const threshold = p1 > 0 ? p1 : 20;
                    if (tally >= threshold) {
                        let role: number;
                        if (p2 > 0) {
                            role = p2; // explicit override
                        } else {
                            // Derive role from the slot with the highest weight
                            const w0 = state.synapticStack[0];
                            const w1 = state.synapticStack[1];
                            const w2 = state.synapticStack[2];
                            if (w0 >= w1 && w0 >= w2)      role = 1; // Producer
                            else if (w1 >= w0 && w1 >= w2) role = 2; // Guardian
                            else                            role = 3; // Architect
                        }
                        res.roleRequest = { role };
                        res.energyDelta -= 5;
                        res.resonanceDelta += 10; // differentiation bonus
                    }
                }
                break;
            }

            case ISA.AGE: {
                // --- ERA 54: Temporal Cognition — read own age ---
                // p1 = destination register
                if (!dryRun) {
                    const ageVal = Math.min(255, state.age ?? 0);
                    regs[p1 % 8] = ageVal;
                }
                res.energyDelta -= 0.1;
                break;
            }

            case ISA.PHASE_LIFE: {
                // --- ERA 54: Lifecycle Phase Effects ---
                // Reads age and applies phase-appropriate effect.
                // Young   (0–49):   growth bonus — resonance +5
                // Mature  (50–199): productivity — energy recoup + hive imprint eligible
                // Aged    (200–399): teaching — FIRE amplitude boosted via resonanceDelta
                // Senescent (400+): apoptosis — emit self-dissolution request
                const age = state.age ?? 0;
                if (!dryRun) {
                    if (age < 50) {
                        // Young: grow
                        res.resonanceDelta += 5;
                        res.energyDelta -= 0.5;
                    } else if (age < 200) {
                        // Mature: productive, slight energy recoup from nutrients
                        res.resonanceDelta += 2;
                        res.energyDelta += 0.5; // mature efficiency
                    } else if (age < 400) {
                        // Aged: teaching — emit FIRE across all bonds
                        for (let b = 0; b < 4; b++) {
                            if (state.bonds[b] > 0 && state.synapticStack) {
                                const w = state.synapticStack[b];
                                if (w > 10) {
                                    res.intent.push({ level: 18, value: { bondSlot: b, amplitude: 150, weight: w } });
                                }
                            }
                        }
                        res.energyDelta -= 2;
                    } else {
                        // Senescent: apoptosis request
                        res.apoptosisRequest = true;
                        res.resonanceDelta += 20; // final resonance burst — wisdom transfer
                        res.energyDelta -= 50;
                    }
                }
                break;
            }

            case ISA.QUORUM: {
                // --- ERA 55: Quorum Sensing ---
                // p1 = quorum threshold (default 5)
                // p2 = collective behavior type:
                //   0 = resonance cascade (broadcast resonance boost)
                //   1 = coordinated STAMP (pheromone flood, intent level 19)
                //   2 = role lock (lock current role, suppress ATTUNE)
                const threshold = p1 > 0 ? p1 : 5;

                if (state.quorumData && state.role !== undefined && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const safeRole = Math.min(7, Math.max(0, state.role));
                    const quorumCount = state.quorumData[(gy * 140 + gx) * 8 + safeRole];

                    if (quorumCount >= threshold) {
                        const collectiveType = p2 % 3;
                        res.quorumRequest = { collectiveType, quorumCount };

                        if (collectiveType === 0) {
                            // Resonance cascade — collective amplification
                            res.resonanceDelta += Math.min(50, quorumCount * 2);
                            res.energyDelta -= 3;
                        } else if (collectiveType === 1) {
                            // Coordinated STAMP — pheromone flood
                            res.intent.push({ level: 19, value: { role: safeRole, intensity: Math.min(255, quorumCount * 10) } });
                            res.energyDelta -= 8;
                        } else {
                            // Role lock — freeze role identity
                            res.resonanceDelta += 5;
                            res.energyDelta -= 1;
                        }
                    }
                }
                break;
            }

            case ISA.INHERIT: {
                // --- ERA 56: Epigenetic Inheritance — voluntary weight sync ---
                // Read hiveMemory imprint at own cell and reinforce own synapticStack[p1%3]
                // p1 = weight slot to reinforce (0-2)
                // p2 = reinforce amplitude (0=light +1, >0=use p2 value)
                if (state.hiveMemory && state.synapticStack && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const hBase = (gy * 140 + gx) * 16;
                    // bytes 0-3: pheromone snapshot → use byte 1 as weight reference
                    const refWeight = state.hiveMemory[hBase + 1]; // intensity octet
                    const slot = p1 % 3;
                    const amplitude = p2 > 0 ? p2 : 1;
                    const curWeight = state.synapticStack[slot];
                    // Move current weight toward reference value by amplitude
                    const delta = refWeight > curWeight ? amplitude : -amplitude;
                    state.synapticStack[slot] = Math.max(0, Math.min(255, curWeight + delta));
                    res.modifiedSynaptic = { slot, value: state.synapticStack[slot] };
                    res.energyDelta -= 0.5;
                    res.resonanceDelta += 1; // cultural alignment bonus
                }
                break;
            }

            case ISA.DECAY: {
                // --- ERA 57: Synaptic Plasticity Decay ---
                // Explicit pruning: find the weakest synapse slot [0..2] and decrement it.
                // p1 = slot override (0-2: specific slot; 3=all three; default=auto-weakest)
                // p2 = decay rate (default 2)
                if (state.synapticStack && !dryRun) {
                    const rate = p2 > 0 ? p2 : 2;
                    if (p1 >= 3) {
                        // Decay all three slots
                        for (let s = 0; s < 3; s++) {
                            const cur = state.synapticStack[s];
                            if (cur > 0) {
                                state.synapticStack[s] = Math.max(0, cur - rate);
                                res.modifiedSynaptic = { slot: s, value: state.synapticStack[s] };
                            }
                        }
                    } else if (p1 > 0) {
                        // Decay specific slot
                        const cur = state.synapticStack[p1];
                        state.synapticStack[p1] = Math.max(0, cur - rate);
                        res.modifiedSynaptic = { slot: p1, value: state.synapticStack[p1] };
                    } else {
                        // Auto: find and decay weakest slot
                        let minSlot = 0;
                        if (state.synapticStack[1] < state.synapticStack[minSlot]) minSlot = 1;
                        if (state.synapticStack[2] < state.synapticStack[minSlot]) minSlot = 2;
                        const cur = state.synapticStack[minSlot];
                        if (cur > 0) {
                            state.synapticStack[minSlot] = Math.max(0, cur - rate);
                            res.modifiedSynaptic = { slot: minSlot, value: state.synapticStack[minSlot] };
                        }
                    }
                    res.energyDelta += 0.5;   // pruning releases metabolic energy
                    res.resonanceDelta += 1;   // neural efficiency bonus
                }
                break;
            }

            case ISA.OSCILLATE: {
                // --- ERA 58: Resonance Oscillators ---
                // Broadcasts a phase ripple to co-located atoms.
                // p1 = amplitude (0=auto from resonance, >0=explicit)
                // p2 = reach (0=same cell only, 1=adjacent cells)
                if (!dryRun) {
                    const ownPhase = state.phase ?? 128;
                    const amplitude = p1 > 0 ? p1 : Math.min(255, Math.floor(state.resonance / 10));
                    // Sinusoidal component: sin(phase*2π/255) maps to [-1..+1]
                    const sinComponent = Math.sin((ownPhase / 255) * Math.PI * 2);
                    const waveAmplitude = Math.round(amplitude * sinComponent);
                    if (Math.abs(waveAmplitude) > 0) {
                        res.intent.push({
                            level: 20,
                            value: { phase: ownPhase, waveAmplitude, reach: p2 }
                        });
                        res.energyDelta -= Math.abs(waveAmplitude) * 0.05;
                    }
                }
                break;
            }

            case ISA.LOCK_PHASE: {
                // --- ERA 58: Phase Lock ---
                // Snaps own phase to local average (constructive) or +128 (destructive).
                // p1: 0=constructive (sync), 1=destructive (anti-phase)
                // Reads spatialGrid slot 31 = local phase average
                if (!dryRun) {
                    const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                    const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                    const cellAvgPhase = state.spatialGrid[(gy * 140 + gx) * 32 + 31];
                    const targetPhase = p1 === 1
                        ? (cellAvgPhase + 128) % 256  // destructive: anti-phase
                        : cellAvgPhase;                // constructive: sync
                    res.lockPhaseRequest = { targetPhase };
                    // Resonance bonus scales with how close own phase is to target
                    const phaseDiff = Math.abs((state.phase ?? 128) - cellAvgPhase);
                    const alignment = 1 - phaseDiff / 255;
                    res.resonanceDelta += Math.round(alignment * 5);
                    res.energyDelta -= 1;
                }
                break;
            }
        }








        if (!dryRun) {
            if (!pcJumped) pc = (pc + 1) % 16;
            context[0] = pc;
            context[1] = flags;
            context[18] = sp;
        }

        return res;
    }
};

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
    SPEC: 0x84
};

export const LAMBDA_VM = {
    /**
     * Executes one instruction from the atom's bytecode.
     * context: 32 bytes [0: PC, 1: Flags, 2-9: Regs, 10-17: Stack, 18: SP, 19-31: Reserved]
     */
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, structureGrid: Int32Array, viralGrid: Uint8Array, spatialGrid: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, synapticStack?: Int32Array, role?: number, semanticBonuses?: number, quarantineLevel?: number, incomingMessage?: number, isDiplomatic?: boolean }, dryRun = false, wasm?: any): VMResult => {
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
                }
                if (!dryRun) regs[regIdx] = Math.min(255, val);
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

            case ISA.SELF_REP:
                if (state.energy > 150) {
                    res.intent.push({ level: 10, value: "spawn" });
                    res.energyDelta -= 80;
                }
                break;

            case ISA.CROSS_REP:
                if (state.energy > 150) {
                    res.energyDelta -= 100;
                    res.intent.push({ level: 11, value: { type: "meiosis", targetBondSlot: p1 % 4 } });
                }
                break;

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

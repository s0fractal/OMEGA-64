// OMEGA-64 | LAMBDA_VM.ts | The Extended Quine VM (Era 17: The Living Quine)
// Turing-complete bytecode executor with registers, stack, and messaging.

export interface VMResult {
    energyDelta: number;
    resonanceDelta: number;
    intent: { level: number, value: any }[];
    modifiedCode?: { slot: number, value: number };
    modifiedStiffness?: { slot: number, value: number };
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
    LOCK: 0x62
};

export const LAMBDA_VM = {
    /**
     * Executes one instruction from the atom's bytecode.
     * context: 32 bytes [0: PC, 1: Flags, 2-9: Regs, 10-17: Stack, 18: SP, 19-31: Reserved]
     */
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, quarantineLevel?: number, incomingMessage?: number }, dryRun = false): VMResult => {
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

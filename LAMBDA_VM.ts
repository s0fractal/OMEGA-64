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
    // ERA 40: Inject optional WebAssembly Kernel for extreme scale execution
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, synapticStack?: Int32Array, role?: number, semanticBonuses?: number, quarantineLevel?: number, incomingMessage?: number, isDiplomatic?: boolean }, dryRun = false, wasm?: any): VMResult => {
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
            // SUPPRESSED: No energy delta, no resonance, no intent. Absolute NO-OP.
            return res;
        }

        // --- CONTEXT DECODING ---

        let pc = context[0] % 16;
        let flags = context[1];
        const regs = context.subarray(2, 10);
        // Check Wasm Fast-Path Support (Era 39 & Era 43)
        // Supported: MOVE, ADD, SUB, MUL, CMP, LOAD, STORE, JMP, JZ, JNZ, CALL, RET
        const fastPathOps = new Set([
            0x10, 0x40, 0x41, 0x42, 0x43, 0x50, 0x51, 
            0x30, 0x31, 0x32, 0x33, 0x34
        ]);
        const stack = context.subarray(10, 18);
        let sp = context[18] % 8;

        const inst = code[pc];
        const op = inst & 0xFF;
        const p1 = (inst >> 8) & 0xFF;
        const p2 = (inst >> 16) & 0xFF;
        const p3 = (inst >> 24) & 0xFF;

        let pcJumped = false;

        // --- ERA 40: Wasm Fast Path (Zero-Copy Interception) ---
        if (wasm && (op === ISA.MOVE || op === ISA.ADD || op === ISA.SUB || op === ISA.LOAD || op === ISA.STORE)) {
            const u8 = new Uint8Array(wasm.memory.buffer);
            const f32 = new Float32Array(wasm.memory.buffer);

            // 1. Write Input (0..44)
            u8[0] = op;
            u8[1] = p1;
            u8[2] = p2;
            u8[3] = p3;
            u8[4] = state.semanticBonuses || 0;
            u8.set(context, 5); // 32 bytes Context (0..31)
            u8.set(logic, 37); // 8 bytes Logic (Base Genome)

            // 2. Execute Wasm Kernel
            const wasmResult = wasm.execute_atom();
            if (wasmResult > 0) {
                // 3. Read Output (64..123)
                res.energyDelta += f32[(64 >> 2) + 0];
                res.resonanceDelta += f32[(64 >> 2) + 1];
                
                if (u8[64 + 8] === 1) { // hasIntent
                    const dx = f32[(64 >> 2) + 3]; // offset 76
                    const dy = f32[(64 >> 2) + 4]; // offset 80
                    res.intent.push({ level: 4, value: { dx, dy } });
                }
                
                // Write back mutated registers/stack context
                context.set(u8.subarray(64 + 20, 64 + 20 + 32));
                
                // Write back mutated logic (Era 43 Viral Stores)
                logic.set(u8.subarray(64 + 52, 64 + 52 + 8));

                if (wasmResult === 2) {
                    pcJumped = true; // Wasm Kernel explicitly asked to jump PC
                    pc = context[0]; // Update local PC tracking var
                }

                if (!pcJumped) context[0] = (pc + 1) % 16;
                return res; // Fast Return. Bypasses TS AST completely!
            }
        }

        switch (op) {
            case ISA.MOVE:
                res.intent.push({ level: 4, value: { dx: (p1 - 128) / 10, dy: (p2 - 128) / 10 } });
                res.energyDelta -= isSwift ? 0 : 1; // Swift bonus: Free movement
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
                // ERA 36: Harvest bonus (20% increased efficiency)
                res.energyDelta += (consumed / 1000) * (isHarvest ? 1.2 : 1.0); 
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

            case ISA.CROSS_REP:
                // ERA 42: Genetic Recombination (Meiosis)
                // p1 specifies the bond slot (0-3) to target for mating
                if (state.energy > 150) {
                    // Costly to initiate meiosis
                    res.energyDelta -= 100;
                    res.intent.push({ level: 11, value: { type: "meiosis", targetBondSlot: p1 % 4 } });
                }
                break;

            case ISA.BIND: {
                // ERA 44: Multi-Cellular Tensegrity
                // p1: dx (0-255, center 128), p2: dy (0-255, center 128)
                const dxVal = (p1 - 128) / 10.0;
                const dyVal = (p2 - 128) / 10.0;
                res.intent.push({ level: 12, value: { dx: dxVal, dy: dyVal } });
                res.energyDelta -= 10; // Binding costs energy
                break;
            }

            case ISA.MERGE: {
                // ERA 45: Symbiotic Merging
                // p1 is bond index (0-3) to target for fusion
                if (state.resonance > 300) {
                    res.intent.push({ level: 13, value: { targetBondSlot: p1 % 4 } });
                    res.energyDelta -= 50; // Merging is metabolically expensive
                }
                break;
            }

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
                // ERA 38: Diplomatic Signaling (Boost resonance if message is from an Ally)
                if ((state as any).isDiplomatic) {
                    res.resonanceDelta += 2.0;
                } else {
                    res.resonanceDelta += 0.2;
                }
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
                    res.resonanceDelta -= isGuardian ? 10 : 20; // Guardian bonus: 50% resonance discount
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
                // ERA 34: Trophic Plasticity
                // If already specialized, switching role costs 50% current energy & resonance
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

// OMEGA-64 | LAMBDA_VM.ts | The Autonomous Executor (Era 14: The Turing Mind)
// Interprets the 8-byte Logic (Genome) as a conditional program.

/**
 * λ-VM INSTRUCTION SET (8-Byte Conditional Format)
 * ---------------------------------------------
 * Byte 0: CONDITION_TYPE
 *   0x00: ALWAYS (No condition)
 *   0x01: IF_ENERGY_LESS
 *   0x02: IF_ENERGY_GREATER
 *   0x03: IF_RESONANCE_LESS
 *   0x04: IF_RESONANCE_GREATER
 *   0x05: IF_BONDED_COUNT_GREATER
 * 
 * Byte 1: THRESHOLD (0-255)
 * 
 * Byte 2: ACTION_IF_TRUE
 *   0x10: MOVE (Params: Byte 5, 6 as dX, dY)
 *   0x20: FEED (Params: Byte 5 as amount)
 *   0x30: BOND (Params: Byte 5 as target_index)
 *   0x40: FISSION (Params: Byte 5 as threshold)
 *   0xA0: SPAWN (Params: Byte 5-7 inherited)
 * 
 * Byte 3: ACTION_IF_FALSE (Same opcodes as Byte 2)
 * 
 * Byte 4: RESERVED (Future expansion / PC)
 * 
 * Bytes 5-7: ARGUMENTS / DATA
 */

export interface VMResult {
    energyDelta: number;
    resonanceDelta: number;
    intent: { level: number, value: any }[];
}

export const LAMBDA_VM = {
    execute: (logic: Uint8Array, state: { energy: number, resonance: number, bonds: number }): VMResult => {
        const condType = logic[0];
        const threshold = logic[1];
        
        // 1. Evaluate Condition
        let conditionMet = true;
        switch (condType) {
            case 0x01: conditionMet = state.energy < threshold; break;
            case 0x02: conditionMet = state.energy > threshold; break;
            case 0x03: conditionMet = state.resonance < (threshold / 10); break;
            case 0x04: conditionMet = state.resonance > (threshold / 10); break;
            case 0x05: conditionMet = state.bonds > (threshold % 4); break;
            case 0x00: conditionMet = true; break;
            default: conditionMet = true;
        }

        // 2. Select Branch
        const op = conditionMet ? logic[2] : logic[3];
        
        // 3. Execute Selected Action
        return LAMBDA_VM.executeOp(op, logic, state);
    },

    executeOp: (op: number, logic: Uint8Array, _state: any): VMResult => {
        const res: VMResult = { energyDelta: 0, resonanceDelta: 0, intent: [] };
        
        switch (op) {
            case 0x10: // MOVE
                const dx = (logic[5] - 128) / 10;
                const dy = (logic[6] - 128) / 10;
                res.intent.push({ level: 4, value: { dx, dy } }); // Physics level move
                res.energyDelta -= 1; // Movement costs energy
                break;

            case 0x20: // FEED
                const amount = logic[5] / 10;
                res.energyDelta += amount;
                res.resonanceDelta += 0.1;
                break;

            case 0x40: // FISSION
                if (_state.energy > logic[5]) {
                    res.intent.push({ level: 10, value: "split" }); 
                    res.energyDelta -= _state.energy / 2;
                }
                break;

            case 0xA0: // SPAWN
                res.energyDelta -= 50;
                res.intent.push({ level: 10, value: "spawn" });
                break;

            default:
                // NOOP
                break;
        }

        return res;
    }
};

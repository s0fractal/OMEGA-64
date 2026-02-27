// OMEGA-64 | LAMBDA_VM.ts | The Autonomous Executor
// Interprets the 8-byte Logic (Genome) of an atom into a DeltaProposal.

/**
 * λ-VM INSTRUCTION SET (8 Bytes)
 * ----------------------------
 * Byte 0: OP_CODE
 *   0x00: NOOP
 *   0x10: MOVE (B1: dX, B2: dY)
 *   0x20: FEED (B1: Amount, B2: Direction)
 *   0x30: BOND (B1: Strength, B2: Index)
 *   0x40: FISSION (B1: Energy Threshold)
 *   0x50: PHASE_SHIFT
 *   0x60: SENSE   (Read neighbor state)
 *   0x70: SIGNAL  (Send message to bonded atoms)
 *   0x80: PARASITE (Steal Energy)
 *   0x90: MUTATE  (Self-modify logic)
 *   0xA0: SPAWN   (Create child with inherited logic)
 */

export interface VMResult {
    energy: number;
    resonance: number;
    intent: any[];
}

export const LAMBDA_VM = {
    execute: (logic: Uint8Array, context: { energy: number, resonance: number }): VMResult => {
        const op = logic[0];
        const intent: any[] = [];
        let energyDelta = 0;
        let resonanceDelta = 0;

        switch (op) {
            case 0x10: // MOVE
                const dx = (logic[1] - 128) / 10;
                const dy = (logic[2] - 128) / 10;
                intent.push({ level: 4, value: Math.floor(dx + dy) }); 
                break;

            case 0x20: // FEED
                energyDelta += logic[1] / 10;
                intent.push({ level: 7, value: Math.floor(energyDelta) });
                break;

            case 0x60: // SENSE
                resonanceDelta += 1;
                break;

            case 0x70: // SIGNAL
                resonanceDelta += 5;
                break;

            case 0x80: // PARASITE
                energyDelta -= 10;
                intent.push({ level: 7, value: -10 });
                break;

            case 0x90: // MUTATE
                resonanceDelta -= 2;
                break;

            case 0xA0: // SPAWN
                energyDelta -= 50;
                break;

            default:
                intent.push({ level: 0, value: 0 });
        }

        return {
            energy: energyDelta,
            resonance: resonanceDelta,
            intent
        };
    }
};

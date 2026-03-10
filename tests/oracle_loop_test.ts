// OMEGA-64 | oracle_loop_test.ts | Phase 31: The Sovereign Oracle
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PULSE } from "../PULSE.ts";
import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import { SOVEREIGN_ORACLE } from "../SOVEREIGN_ORACLE.ts";
import { LLM_SYNAPSE } from "../LLM_SYNAPSE.ts";

const EPOCH_BUFFER_SIZE = 1000;

Deno.test({
  name: "Phase 31: Sovereign Oracle Epistemic Gate (Shadow Simulation Assertions)",
  async fn() {
    // 1. Initialize an empty standard matrix with 1 test subject
    await PULSE.startWorkers(2);
    STATE_MATRIX.clear();

    const atomIdx = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setEnergy(atomIdx, 500);
    STATE_MATRIX.setId(atomIdx, 1n);

    // Initial naive loop genome: OP_REPLICATE (0x80)
    const initGenome = new Uint8Array(64).fill(0x00);
    initGenome[0] = 0x80;
    STATE_MATRIX.setInstructions(atomIdx, initGenome);
    
    // 2. Mock the `LLM_SYNAPSE.generateAtomicBytecode` function
    let callCounter = 0;
    const badGenome = new Uint8Array(64).fill(0x00);
    badGenome[0] = 0x03; // OP_PUT
    badGenome[1] = 0x09; // Reg 9 (Out of bounds yields 0)
    badGenome[2] = 0x00; // PROP_ENERGY
    
    const goodGenome = new Uint8Array(64).fill(0x00);
    goodGenome[0] = 0x81; // OP_SIGNAL
    goodGenome[4] = 0x80; // OP_REPLICATE
    goodGenome[8] = 0x81; // OP_SIGNAL

    // Override the LLM API module
    const originalGenerate = LLM_SYNAPSE.generateAtomicBytecode;
    LLM_SYNAPSE.generateAtomicBytecode = async (telemetry) => {
        callCounter++;
        if (callCounter === 1) {
            console.log(`[TEST] Mock LLM Returning BAD Genome (OP_DIE Payload)`);
            return { genome: badGenome };
        } else {
            console.log(`[TEST] Mock LLM Returning GOOD Genome (Survival Payload)`);
            return { genome: goodGenome };
        }
    };

    try {
        // 3. Test Phase 1: Rejection of Bad Genome via Drift Validation
        const t1 = SOVEREIGN_ORACLE.gatherEpochTelemetry();
        await SOVEREIGN_ORACLE.consultOracle(atomIdx, t1);
        
        // Assert BAD genome was rejected
        const drains1 = SOVEREIGN_ORACLE.drainPendingMutations();
        assertEquals(drains1.applied, 0, "Oracle MUST drop destructive mutations through Shadow Testing.");
        
        // Ensure instructions didn't mutate to 0x00 globally!
        assertEquals(STATE_MATRIX.getInstructions(atomIdx)[0], 0x80, "Original instructions should be intact!");

        // 4. Test Phase 2: Native acceptance of a successful Genome payload
        const t2 = SOVEREIGN_ORACLE.gatherEpochTelemetry();
        await SOVEREIGN_ORACLE.consultOracle(atomIdx, t2);

        // Process the injection
        const drains2 = SOVEREIGN_ORACLE.drainPendingMutations();
        assert(drains2.applied > 0, "Oracle MUST inject biologically successful mutations.");
        
        // Check `oracle_plasmid_injection` hit the memory grid near the cell.
        // ORACLE_MUTATION_MODE should be routing it safely to the matrix.
        console.log(`[TEST] Active Plasmids Injected Local: ${drains2.applied}`);

    } finally {
        // Cleanup Worker threads and mock overrides
        LLM_SYNAPSE.generateAtomicBytecode = originalGenerate;
        PULSE.stopWorkers();
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

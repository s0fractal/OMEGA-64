// OMEGA-64 | oracle_loop_test.ts | Phase 39: Sovereign Epistemics
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { NEXUS_DAEMON, PULSE } from "@02";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { SOVEREIGN_ORACLE } from "@05";
import { LLM_SYNAPSE } from "@05";

Deno.test({
  name: "Phase 39: Sovereign Oracle Epistemic Gate (Memetic Ingestion)",
  async fn() {
    // 1. Initialize an empty standard matrix with 1 test subject
    await PULSE.initWorkers(1);
    STATE_MATRIX.clear();

    const atomIdx = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setEnergy(atomIdx, 500);
    STATE_MATRIX.setId(atomIdx, 1n);

    // Give it a genome that executes OP_INCORPORATE_PLASMID (0xAB) at offset 8.
    const initGenome = new Uint8Array(64).fill(0x00);
    initGenome[0] = 0x01; // OP_SET
    initGenome[1] = 0x00; // R0
    initGenome[2] = 0x08; // Immutable value 8

    initGenome[3] = 0xAB; // OP_INCORPORATE_PLASMID
    initGenome[4] = 0x00; // Offset register R0
    STATE_MATRIX.setInstructions(atomIdx, initGenome);

    // 2. Mock `LLM_SYNAPSE.generateAtomicBytecode` function
    const optimalPlasmid = new Uint8Array(8).fill(0x00);
    optimalPlasmid[0] = 0x81; // OP_SIGNAL
    optimalPlasmid[1] = 0x01;
    optimalPlasmid[2] = 0x81; // Highly structured/low-entropy

    // Override the LLM API module
    const originalGenerate = LLM_SYNAPSE.generateAtomicBytecode;
    LLM_SYNAPSE.generateAtomicBytecode = async (_telemetry) => {
      return { plasmid: optimalPlasmid };
    };

    try {
      const telemetry = SOVEREIGN_ORACLE.gatherEpochTelemetry();
      await SOVEREIGN_ORACLE.consultOracle(atomIdx, telemetry);

      // Assert plasmid injection
      const drains = SOVEREIGN_ORACLE.drainPendingMutations();
      assert(drains.applied > 0, "Oracle MUST inject the Stigmergic Plasmid.");

      // Let's tick the simulation. The atom should execute OP_INCORPORATE_PLASMID
      // and fetch the new plasmid into index 8 of its genome.
      await PULSE.tick();
      await PULSE.tick();

      const studentGenomeAfter = STATE_MATRIX.getInstructions(atomIdx);

      let matchArray = true;
      for (let i = 0; i < 8; i++) {
        if (studentGenomeAfter[8 + i] !== optimalPlasmid[i]) {
          matchArray = false;
          break;
        }
      }

      assert(
        matchArray,
        "Atom did NOT successfully read the Oracle's plasmid from the environment!",
      );

      console.log("Atom first 16 bytes:", studentGenomeAfter.slice(0, 16));
      console.log("Oracle was successfully downloaded without forced rewrite.");
    } finally {
      // Cleanup Worker threads and mock overrides
      LLM_SYNAPSE.generateAtomicBytecode = originalGenerate;
      PULSE.stopWorkers();
      await NEXUS_DAEMON.stop();
      await new Promise((r) => setTimeout(r, 200));
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

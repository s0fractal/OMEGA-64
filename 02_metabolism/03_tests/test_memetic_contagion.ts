// OMEGA-64 | test_memetic_contagion.ts | Stage 38 Verification
import { assert } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { RISC, STATE_MATRIX } from "../../00_substrate/mod.ts";
import { NEXUS_DAEMON, PULSE } from "../mod.ts";
import { LOGGER } from "../../00_substrate/mod.ts";

Deno.test("Stage 38: Memetic Contagion (Horizontal Gene Transfer)", async () => {
  LOGGER.info("--- STAGE 38: THERMODYNAMIC MEMETICS TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  // Both atoms drop into cell (0,0)
  const atomTeacher = 200;
  const atomStudent = 201;

  STATE_MATRIX.setId(atomTeacher, 200n);
  STATE_MATRIX.setEnergy(atomTeacher, 500000); // Plenty of energy to afford 150_000 tax

  STATE_MATRIX.setId(atomStudent, 201n);
  STATE_MATRIX.setEnergy(atomStudent, 500000);

  // Teacher (Low Entropy)
  // Genome: SET R0 = 0 (offset), SECRETE_PLASMID (0xAA)
  const scriptTeacher = new Uint8Array(64);
  scriptTeacher[0] = RISC.OP_SET;
  scriptTeacher[1] = 0; // R0
  scriptTeacher[2] = 0; // Value 0 (Offset 0)
  scriptTeacher[3] = 0xAA; // OP_SECRETE_PLASMID
  scriptTeacher[4] = 0; // Param R0
  // Next 8 bytes at offset 0 are: [0x01, 0x00, 0x00, 0xAA, 0x00, 0x00, 0x00, 0x00]
  STATE_MATRIX.setInstructions(atomTeacher, scriptTeacher);

  // Student (High Entropy)
  // Genome: SET R0 = 0 (offset), INCORPORATE_PLASMID (0xAB) inside of a highly chaotic payload
  const scriptStudent = new Uint8Array(64);
  crypto.getRandomValues(scriptStudent); // High entropy!
  scriptStudent[0] = RISC.OP_SET;
  scriptStudent[1] = 0;
  scriptStudent[2] = 0;
  scriptStudent[3] = 0xAB; // OP_INCORPORATE_PLASMID
  scriptStudent[4] = 0;

  // We expect reading the first 8 random bytes to be replaced by the Teacher's low-entropy 8 bytes.
  STATE_MATRIX.setInstructions(atomStudent, scriptStudent);

  // Measure initial entropy
  const entropyBefore = Atomics.load(
    STATE_MATRIX.contexts,
    atomStudent * 16 + 15,
  );
  LOGGER.info(`Student Pre-Entropy Cache (Uninitialized): ${entropyBefore}`);

  LOGGER.info("Executing physics loop for 20 ticks...");
  for (let i = 0; i < 20; i++) {
    await PULSE.tick();
  }

  const entropyAfter = Atomics.load(
    STATE_MATRIX.contexts,
    atomStudent * 16 + 15,
  );
  LOGGER.info(
    `Student Post-Entropy Cache (Evicted or Recomputed): ${entropyAfter}`,
  );

  const teacherGenomeAfter = STATE_MATRIX.getInstructions(atomTeacher);
  const studentGenomeAfter = STATE_MATRIX.getInstructions(atomStudent);

  let matchArray = true;
  for (let i = 0; i < 8; i++) {
    if (teacherGenomeAfter[i] !== studentGenomeAfter[i]) {
      matchArray = false;
      break;
    }
  }

  assert(matchArray, "Student did NOT successfully incorporate the Plasmid!");

  console.log("Teacher first 8 bytes:", teacherGenomeAfter.slice(0, 8));
  console.log("Student first 8 bytes:", studentGenomeAfter.slice(0, 8));

  console.log("Teacher Final Energy: ", STATE_MATRIX.getEnergy(atomTeacher));
  console.log("Student Final Energy: ", STATE_MATRIX.getEnergy(atomStudent));

  await PULSE.stopWorkers();
  await NEXUS_DAEMON.stop();
  await new Promise((r) => setTimeout(r, 200)); // Grace period for connections to close
});

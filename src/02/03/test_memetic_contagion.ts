// OMEGA-64 | test_memetic_contagion.ts | Stage 38 Verification
import { assert } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX, LOGGER, Li } from "@generated";
import {
  NEXUS_DAEMON,
  PULSE
} from "@generated";

import {
  OP_SET
} from "@generated";

Deno.test("Stage 38: Memetic Contagion (Horizontal Gene Transfer)", async () => {
  Li("--- STAGE 38: THERMODYNAMIC MEMETICS TEST ---");

  MX.clear();
  Atomics.store(MX.syncState, 0, 0);
  Atomics.store(MX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  // Both atoms drop into cell (0,0)
  const atomTeacher = 200;
  const atomStudent = 201;

  MX.setId(atomTeacher, 200n);
  MX.setEnergy(atomTeacher, 500000); // Plenty of energy to afford 150_000 tax

  MX.setId(atomStudent, 201n);
  MX.setEnergy(atomStudent, 500000);

  // Teacher (Low Entropy)
  // Genome: SET R0 = 0 (offset), SECRETE_PLASMID (0xAA)
  const scriptTeacher = new Uint8Array(64);
  scriptTeacher[0] = OP_SET;
  scriptTeacher[1] = 0; // R0
  scriptTeacher[2] = 0; // Value 0 (Offset 0)
  scriptTeacher[3] = 0xAA; // OP_SECRETE_PLASMID
  scriptTeacher[4] = 0; // Param R0
  // Next 8 bytes at offset 0 are: [0x01, 0x00, 0x00, 0xAA, 0x00, 0x00, 0x00, 0x00]
  MX.setInstructions(atomTeacher, scriptTeacher);

  // Student (High Entropy)
  // Genome: SET R0 = 0 (offset), INCORPORATE_PLASMID (0xAB) inside of a highly chaotic payload
  const scriptStudent = new Uint8Array(64);
  crypto.getRandomValues(scriptStudent); // High entropy!
  scriptStudent[0] = OP_SET;
  scriptStudent[1] = 0;
  scriptStudent[2] = 0;
  scriptStudent[3] = 0xAB; // OP_INCORPORATE_PLASMID
  scriptStudent[4] = 0;

  // We expect reading the first 8 random bytes to be replaced by the Teacher's low-entropy 8 bytes.
  MX.setInstructions(atomStudent, scriptStudent);

  // Measure initial entropy
  const entropyBefore = Atomics.load(
    MX.contexts,
    atomStudent * 16 + 15,
  );
  Li(`Student Pre-Entropy Cache (Uninitialized): ${entropyBefore}`);

  Li("Executing physics loop for 20 ticks...");
  for (let i = 0; i < 20; i++) {
    await PULSE.tick();
  }

  const entropyAfter = Atomics.load(
    MX.contexts,
    atomStudent * 16 + 15,
  );
  Li(
    `Student Post-Entropy Cache (Evicted or Recomputed): ${entropyAfter}`,
  );

  const teacherGenomeAfter = MX.getInstructions(atomTeacher);
  const studentGenomeAfter = MX.getInstructions(atomStudent);

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

  console.log("Teacher Final Energy: ", MX.getEnergy(atomTeacher));
  console.log("Student Final Energy: ", MX.getEnergy(atomStudent));

  await PULSE.stopWorkers();
  await NEXUS_DAEMON.stop();
  await new Promise((r) => setTimeout(r, 200)); // Grace period for connections to close
});

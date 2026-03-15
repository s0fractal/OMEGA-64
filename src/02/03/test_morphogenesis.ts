import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "@generated";
import { STATE_MATRIX } from "@generated";

Deno.test({
  name: "Phase 41: Metazoan Morphogenesis (Organelle Differentiation)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.tickCounter, 0, 0);

    // Create a 7-atom structure (1 Core, 6 Surface)
    const CORE_ATOM = 1;
    const SURFACE_ATOMS = [2, 3, 4, 5, 6, 7];

    // Setup positions and identities
    STATE_MATRIX.setId(CORE_ATOM, 100n);
    STATE_MATRIX.setX(CORE_ATOM, 100);
    STATE_MATRIX.setY(CORE_ATOM, 100);
    STATE_MATRIX.setEnergy(CORE_ATOM, 10000);
    STATE_MATRIX.setRole(CORE_ATOM, STATE_MATRIX.ROLE_NEUTRAL);

    // Surface positions around Core
    const offsets = [
      { x: 10, y: 0 },
      { x: 5, y: 8 },
      { x: -5, y: 8 },
      { x: -10, y: 0 },
      { x: -5, y: -8 },
      { x: 5, y: -8 }
    ];

    for (let i = 0; i < 6; i++) {
        const atomId = SURFACE_ATOMS[i];
        STATE_MATRIX.setId(atomId, BigInt(101 + i));
        STATE_MATRIX.setX(atomId, 100 + offsets[i].x);
        STATE_MATRIX.setY(atomId, 100 + offsets[i].y);
        STATE_MATRIX.setEnergy(atomId, 10000);
        STATE_MATRIX.setRole(atomId, STATE_MATRIX.ROLE_NEUTRAL);
        
        // Link Surface -> Core
        const bonds = STATE_MATRIX.getBonds(atomId);
        Atomics.store(bonds, 0, CORE_ATOM);

        // Link Surface -> Next Surface (Forming the actual cyclic Membrane Ring)
        const nextSurfaceIdx = i === 5 ? SURFACE_ATOMS[0] : SURFACE_ATOMS[i + 1];
        Atomics.store(bonds, 1, nextSurfaceIdx);
    }

    // Core bonds point out back to first 4 surface nodes (simulating high internal links)
    const coreBonds = STATE_MATRIX.getBonds(CORE_ATOM);
    Atomics.store(coreBonds, 0, SURFACE_ATOMS[0]);
    Atomics.store(coreBonds, 1, SURFACE_ATOMS[1]);
    Atomics.store(coreBonds, 2, SURFACE_ATOMS[2]);
    Atomics.store(coreBonds, 3, SURFACE_ATOMS[3]);

    await PULSE.initWorkers(1);

    console.log("--- RUNNING MORPHOGENESIS CYCLE ---");

    // Tick the environment. The Membrane logic should run, do BFS, and perform Organelle Differentiation
    await PULSE.tick();

    // Verification
    const coreRole = STATE_MATRIX.getRole(CORE_ATOM) & ~0x80;
    console.log(`Core atom role (cleared Metazoan flag): ${coreRole}`);
    assertEquals(coreRole, STATE_MATRIX.ROLE_ARCHITECT, "Core atom (internalBonds >= 3) should become ROLE_ARCHITECT");

    let numGuardians = 0;
    for (const surfaceId of SURFACE_ATOMS) {
        const surfaceRole = STATE_MATRIX.getRole(surfaceId) & ~0x80;
        if (surfaceRole === STATE_MATRIX.ROLE_GUARDIAN) {
            numGuardians++;
        } else {
            console.log(`Surface atom ${surfaceId} mutated to wrong role: ${surfaceRole}`);
        }
        
        const hasFlag = (STATE_MATRIX.getRole(surfaceId) & 0x80) > 0;
        assertEquals(hasFlag, true, "Surface atom must maintain 0x80 Metazoan membership flag");
    }

    assertEquals(numGuardians, 6, "All 6 Surface atoms (internalBonds <= 2) should become ROLE_GUARDIAN");

    // Ensure the metazoan flag exists on core too
    const coreFlag = (STATE_MATRIX.getRole(CORE_ATOM) & 0x80) > 0;
    assertEquals(coreFlag, true, "Core atom must maintain 0x80 Metazoan membership flag");

    PULSE.stopWorkers();
  },
});

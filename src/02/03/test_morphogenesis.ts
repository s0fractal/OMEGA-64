import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "@generated";
import { MX } from "@generated";

Deno.test({
  name: "Phase 41: Metazoan Morphogenesis (Organelle Differentiation)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    // Create a 7-atom structure (1 Core, 6 Surface)
    const CORE_ATOM = 1;
    const SURFACE_ATOMS = [2, 3, 4, 5, 6, 7];

    // Setup positions and identities
    MX.setId(CORE_ATOM, 100n);
    MX.setX(CORE_ATOM, 100);
    MX.setY(CORE_ATOM, 100);
    MX.setEnergy(CORE_ATOM, 10000);
    MX.setRole(CORE_ATOM, MX.ROLE_NEUTRAL);

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
        MX.setId(atomId, BigInt(101 + i));
        MX.setX(atomId, 100 + offsets[i].x);
        MX.setY(atomId, 100 + offsets[i].y);
        MX.setEnergy(atomId, 10000);
        MX.setRole(atomId, MX.ROLE_NEUTRAL);
        
        // Link Surface -> Core
        const bonds = MX.getBonds(atomId);
        Atomics.store(bonds, 0, CORE_ATOM);

        // Link Surface -> Next Surface (Forming the actual cyclic Membrane Ring)
        const nextSurfaceIdx = i === 5 ? SURFACE_ATOMS[0] : SURFACE_ATOMS[i + 1];
        Atomics.store(bonds, 1, nextSurfaceIdx);
    }

    // Core bonds point out back to first 4 surface nodes (simulating high internal links)
    const coreBonds = MX.getBonds(CORE_ATOM);
    Atomics.store(coreBonds, 0, SURFACE_ATOMS[0]);
    Atomics.store(coreBonds, 1, SURFACE_ATOMS[1]);
    Atomics.store(coreBonds, 2, SURFACE_ATOMS[2]);
    Atomics.store(coreBonds, 3, SURFACE_ATOMS[3]);

    await PULSE.initWorkers(1);

    console.log("--- RUNNING MORPHOGENESIS CYCLE ---");

    // Tick the environment. The Membrane logic should run, do BFS, and perform Organelle Differentiation
    await PULSE.tick();

    // Verification
    const coreRole = MX.getRole(CORE_ATOM) & ~0x80;
    console.log(`Core atom role (cleared Metazoan flag): ${coreRole}`);
    assertEquals(coreRole, MX.ROLE_ARCHITECT, "Core atom (internalBonds >= 3) should become ROLE_ARCHITECT");

    let numGuardians = 0;
    for (const surfaceId of SURFACE_ATOMS) {
        const surfaceRole = MX.getRole(surfaceId) & ~0x80;
        if (surfaceRole === MX.ROLE_GUARDIAN) {
            numGuardians++;
        } else {
            console.log(`Surface atom ${surfaceId} mutated to wrong role: ${surfaceRole}`);
        }
        
        const hasFlag = (MX.getRole(surfaceId) & 0x80) > 0;
        assertEquals(hasFlag, true, "Surface atom must maintain 0x80 Metazoan membership flag");
    }

    assertEquals(numGuardians, 6, "All 6 Surface atoms (internalBonds <= 2) should become ROLE_GUARDIAN");

    // Ensure the metazoan flag exists on core too
    const coreFlag = (MX.getRole(CORE_ATOM) & 0x80) > 0;
    assertEquals(coreFlag, true, "Core atom must maintain 0x80 Metazoan membership flag");

    PULSE.stopWorkers();
  },
});

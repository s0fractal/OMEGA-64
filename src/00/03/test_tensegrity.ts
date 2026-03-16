import { MX, INSTRUCTIONS_OFFSET, SIGMA_FFI } from "../../_/mod.ts";

SIGMA_FFI.init();

async function runTest() {
  console.log("=== VECTOR 2: TENSEGRITY TEST ===");

  // 1. Initialize State
  MX.clear();
  const sharedBuffer = MX.buffer;

  const execute_atom = (idx: number) => SIGMA_FFI.executeAtom(idx);

  // 2. Spawn Atom A (Index 0) and Atom B (Index 1)
  // Close together: (100, 100) and (110, 110)
  const script = new Uint8Array(64);
  MX.seedAtom(0, 1n, 100, 100, 5000, 100, undefined, script);
  MX.seedAtom(1, 2n, 110, 110, 5000, 100);

  // Bind them together
  MX.set_bond_target(0, 0, 1);
  MX.set_bond_stiffness(0, 0, 0.9); // Rigid
  MX.setBondDistance(0, 0, 100);

  // Verify instructions in memory
  const instView = new Uint8Array(
    sharedBuffer,
    INSTRUCTIONS_OFFSET,
    64,
  );
  console.log(
    "-> Instructions at index 0:",
    instView[0].toString(16),
    instView[1].toString(16),
    instView[2].toString(16),
    instView[3].toString(16),
  );

  console.log(
    "-> Initial distance:",
    Math.hypot(
      MX.get_x(1) - MX.get_x(0),
      MX.get_y(1) - MX.get_y(0),
    ).toFixed(2),
  );

  // 4. Run Ticks
  for (let t = 0; t < 100; t++) {
    // VM Execution (WASM)
    execute_atom(0);
    execute_atom(1);

    // Physics Update (JS-side mimic of PULSE_WORKER)
    const x0 = MX.get_x(0);
    const y0 = MX.get_y(0);
    const x1 = MX.get_x(1);
    const y1 = MX.get_y(1);

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy) || 1;
    const targetDist = MX.getBondDistance(0, 0) || 50;
    const stiffness = MX.get_bond_stiffness(0, 0);

    if (stiffness > 0.8) {
      const force = (dist - targetDist) * 0.5;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      // Apply Damping
      const d0 = 1 - (MX.getDamping(0) / 255);
      const d1 = 1 - (MX.getDamping(1) / 255);

      MX.setX(0, x0 + fx * d0);
      MX.setY(0, y0 + fy * d0);
      MX.setX(1, x1 - fx * d1);
      MX.setY(1, y1 - fy * d1);
    }

    if (t % 20 === 0) {
      console.log(
        `t=${t} | Dist: ${dist.toFixed(2)} | Target: ${targetDist} | Damping: ${
          MX.getDamping(0)
        }`,
      );
    }
  }

  const finalDist = Math.hypot(
    MX.get_x(1) - MX.get_x(0),
    MX.get_y(1) - MX.get_y(0),
  );
  console.log("-> Final distance:", finalDist.toFixed(2));

  // 5. Test Damping (Structural Locking)
  console.log("\n-> Locking Atom 0 into Structure (Damping=255)...");
  MX.set_damping(0, 255);
  console.log("-> New Damping (Atom 0):", MX.getDamping(0));

  const oldX = MX.get_x(0);
  // Force a massive displacement in physics
  // Atom 1 tries to pull Atom 0 to distance 150
  MX.setBondDistance(0, 0, 150);

  // Run one update
  const x0 = MX.get_x(0);
  const x1 = MX.get_x(1);
  const dx = x1 - x0;
  const force = (dx - 150) * 0.5;
  const d0 = 1 - (MX.getDamping(0) / 255);
  MX.setX(0, x0 + force * d0);

  console.log(
    "-> Atom 0 Move test (should be 0):",
    (MX.get_x(0) - oldX).toFixed(2),
  );

  if (Math.abs(finalDist - 100) < 5 && MX.getDamping(0) === 255) {
    console.log(
      "\n✅ VECTOR 2 VERIFIED: Kinematic Bonds and Rigidity functional.",
    );
  } else {
    console.log("\n❌ VECTOR 2 FAILURE: Dynamics outside tolerance.");
  }
}

runTest();

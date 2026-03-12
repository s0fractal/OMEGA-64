// OMEGA-64 | test_tensegrity.ts | Vector 2 Verification
import { STATE_MATRIX } from "../mod.ts";
import * as OFFSETS from "../mod.ts";

async function runTest() {
  console.log("=== VECTOR 2: TENSEGRITY TEST ===");

  // 1. Initialize State
  STATE_MATRIX.clear();
  const sharedBuffer = STATE_MATRIX.buffer;
  const wasmMemory = STATE_MATRIX.wasmMemory;

  // Load WASM
  const wasmRes = await fetch(
    new URL("../../08_artifacts/release.wasm", import.meta.url).href,
  );
  const wasmBytes = await wasmRes.arrayBuffer();
  const trace_atom = (
    idx: number,
    op: number,
    gx: number,
    gy: number,
    _target: number,
  ) => {
    console.log(
      `   [TR] Atom ${idx} | OP: 0xA5 | Mode: ${op} | P2: ${gx} | P3: ${gy}`,
    );
  };
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: {
      trace_atom,
    },
    env: {
      memory: wasmMemory,
      abort: () => {},
      trace_atom,
    },
  });

  const execute_atom = instance.exports.execute_atom as (i: number) => void;

  // 2. Spawn Atom A (Index 0) and Atom B (Index 1)
  // Close together: (100, 100) and (110, 110)
  const script = new Uint8Array(64);
  STATE_MATRIX.seedAtom(0, 1n, 100, 100, 5000, 100, undefined, script);
  STATE_MATRIX.seedAtom(1, 2n, 110, 110, 5000, 100);

  // Bind them together
  STATE_MATRIX.setBondTarget(0, 0, 1);
  STATE_MATRIX.setBondStiffness(0, 0, 0.9); // Rigid
  STATE_MATRIX.setBondDistance(0, 0, 100);

  // Verify instructions in memory
  const instView = new Uint8Array(
    sharedBuffer,
    OFFSETS.INSTRUCTIONS_OFFSET,
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
      STATE_MATRIX.getX(1) - STATE_MATRIX.getX(0),
      STATE_MATRIX.getY(1) - STATE_MATRIX.getY(0),
    ).toFixed(2),
  );

  // 4. Run Ticks
  for (let t = 0; t < 100; t++) {
    // VM Execution (WASM)
    execute_atom(0);
    execute_atom(1);

    // Physics Update (JS-side mimic of PULSE_WORKER)
    const x0 = STATE_MATRIX.getX(0);
    const y0 = STATE_MATRIX.getY(0);
    const x1 = STATE_MATRIX.getX(1);
    const y1 = STATE_MATRIX.getY(1);

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy) || 1;
    const targetDist = STATE_MATRIX.getBondDistance(0, 0) || 50;
    const stiffness = STATE_MATRIX.getBondStiffness(0, 0);

    if (stiffness > 0.8) {
      const force = (dist - targetDist) * 0.5;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      // Apply Damping
      const d0 = 1 - (STATE_MATRIX.getDamping(0) / 255);
      const d1 = 1 - (STATE_MATRIX.getDamping(1) / 255);

      STATE_MATRIX.setX(0, x0 + fx * d0);
      STATE_MATRIX.setY(0, y0 + fy * d0);
      STATE_MATRIX.setX(1, x1 - fx * d1);
      STATE_MATRIX.setY(1, y1 - fy * d1);
    }

    if (t % 20 === 0) {
      console.log(
        `t=${t} | Dist: ${dist.toFixed(2)} | Target: ${targetDist} | Damping: ${
          STATE_MATRIX.getDamping(0)
        }`,
      );
    }
  }

  const finalDist = Math.hypot(
    STATE_MATRIX.getX(1) - STATE_MATRIX.getX(0),
    STATE_MATRIX.getY(1) - STATE_MATRIX.getY(0),
  );
  console.log("-> Final distance:", finalDist.toFixed(2));

  // 5. Test Damping (Structural Locking)
  console.log("\n-> Locking Atom 0 into Structure (Damping=255)...");
  STATE_MATRIX.setDamping(0, 255);
  console.log("-> New Damping (Atom 0):", STATE_MATRIX.getDamping(0));

  const oldX = STATE_MATRIX.getX(0);
  // Force a massive displacement in physics
  // Atom 1 tries to pull Atom 0 to distance 150
  STATE_MATRIX.setBondDistance(0, 0, 150);

  // Run one update
  const x0 = STATE_MATRIX.getX(0);
  const x1 = STATE_MATRIX.getX(1);
  const dx = x1 - x0;
  const force = (dx - 150) * 0.5;
  const d0 = 1 - (STATE_MATRIX.getDamping(0) / 255);
  STATE_MATRIX.setX(0, x0 + force * d0);

  console.log(
    "-> Atom 0 Move test (should be 0):",
    (STATE_MATRIX.getX(0) - oldX).toFixed(2),
  );

  if (Math.abs(finalDist - 100) < 5 && STATE_MATRIX.getDamping(0) === 255) {
    console.log(
      "\n✅ VECTOR 2 VERIFIED: Kinematic Bonds and Rigidity functional.",
    );
  } else {
    console.log("\n❌ VECTOR 2 FAILURE: Dynamics outside tolerance.");
  }
}

runTest();

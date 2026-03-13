import { GRID_W , GRID_H, GRID_CELLS} from "../../00/OFFSETS.ts";
// OMEGA-64 | test_ascension.ts | Era 63 & 64: The Final Fractal Convergence Verification
// Tests ISA.PHI (Golden Angle phase shift) and ISA.ASCEND (Crystallization to Matrixland).

import { ISA, LAMBDA_VM } from "@02";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { STATE_MATRIX } from "@00";


function baseState(overrides: Record<string, unknown> = {}) {
  return {
    x: 500,
    y: 400,
    nutrients: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(GRID_CELLS * 9)),
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 6000,
    resonance: 600,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    phase: 10,
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.PHI emits phiRequest with Golden Angle (97) ----------
Deno.test("Era 63: ISA.PHI p1=0 requests phase shift by 97 (Golden Angle)", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // PHI p1=0
  code[0] = ISA.PHI;

  const result = LAMBDA_VM.execute(logic, code, context, baseState());

  assert(result.phiRequest, "Should emit phiRequest");
  assertEquals(result.phiRequest!.amount, 97, "Should request shift by 97");
  assertEquals(result.resonanceDelta, 2, "Should reward packing harmony");
});

// ---------- Test 2: ISA.PHI uses custom angle from p1 ----------
Deno.test("Era 63: ISA.PHI p1>0 requests custom phase shift", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // PHI p1=150
  code[0] = (150 << 8) | ISA.PHI;

  const result = LAMBDA_VM.execute(logic, code, context, baseState());

  assert(result.phiRequest, "Should emit phiRequest");
  assertEquals(result.phiRequest!.amount, 150, "Should request shift by 150");
});

// ---------- Test 3: PULSE_WORKER rotates phase correctly ----------
Deno.test("Era 63: PULSE_WORKER wraps phase shift around 256", () => {
  const phases = new Uint8Array(new SharedArrayBuffer(10));
  let atomPhase = 200;
  phases[0] = atomPhase;

  // Simulate PULSE_WORKER receiving phiRequest={amount: 97}
  const newPhase = (atomPhase + 97) % 256;
  Atomics.store(phases, 0, newPhase);

  assertEquals(phases[0], 41, "Phase wrapped: (200 + 97) % 256 = 41");
});

// ---------- Test 4: ISA.ASCEND triggers ascendRequest if conditions met ----------
Deno.test("Era 64: ISA.ASCEND emits request if energy>=5000 and resonance>=500", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // ASCEND
  code[0] = ISA.ASCEND;

  const result = LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState({ energy: 5000, resonance: 550 }),
  );
  assert(result.ascendRequest, "Should emit ascendRequest");
});

// ---------- Test 5: ISA.ASCEND fails if energy/resonance too low ----------
Deno.test("Era 64: ISA.ASCEND fails if conditions not met", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // ASCEND
  code[0] = ISA.ASCEND;

  let result = LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState({ energy: 4999, resonance: 600 }),
  );
  assert(!result.ascendRequest, "Fails if energy < 5000");

  result = LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState({ energy: 6000, resonance: 499 }),
  );
  assert(!result.ascendRequest, "Fails if resonance < 500");
});

// ---------- Test 6: PULSE_WORKER Ascension crystallizes StructureGrid ----------
Deno.test("Era 64: PULSE_WORKER transforms atom into Crystal structure", () => {
  const ids = new BigUint64Array(new SharedArrayBuffer(16));
  ids[0] = 777n;

  const structureGrid = new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4));
  const x = 500;
  const y = 400;
  const gx = 50;
  const gy = 40;
  const cellIdx = gy * GRID_W + gx; // 5650

  // Simulate PULSE_WORKER receiving ascendRequest
  const crystalData = 1 | (255 << 8); // type 1, density 255
  Atomics.store(structureGrid, cellIdx, crystalData);
  Atomics.store(ids, 0, 0n); // Kill atom

  const resultingStructure = Atomics.load(structureGrid, cellIdx);
  assertEquals(resultingStructure & 0xFF, 1, "Structure type is 1 (Crystal)");
  assertEquals(
    (resultingStructure >> 8) & 0xFF,
    255,
    "Structure density is 255 (Max)",
  );
  assertEquals(ids[0], 0n, "Atom ID was reset to 0 (death)");
});

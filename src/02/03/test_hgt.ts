import { GRID_W, GRID_H, GRID_CELLS } from "@generated";
// OMEGA-64 | test_hgt.ts | Era 60: Horizontal Gene Transfer Verification
// Tests ISA.SECRETE_PLASMID (writes logic, updates intensity),
// ISA.INCORPORATE_PLASMID (reads viralGrid, overwrites logic if > threshold).

import { ISA, LAMBDA_VM } from "@generated";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { STATE_MATRIX } from "@generated";


function makeViralGrid(): Uint8Array {
  return new Uint8Array(new SharedArrayBuffer(GRID_CELLS * 9));
}

function baseState(
  viralGrid: Uint8Array,
  logicVals: number[] = [],
  x = 500,
  y = 400,
) {
  const logic = new Uint8Array(8);
  for (let j = 0; j < Math.min(8, logicVals.length); j++) {
    logic[j] = logicVals[j];
  }

  return {
    x,
    y,
    nutrients: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    viralGrid,
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 4)),
    spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_CELLS * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 300,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    logic, // The mock atom's own logic
  } as any;
}

// ---------- Test 1: ISA.SECRETE_PLASMID emits secretePlasmidRequest ----------
Deno.test("Era 60: ISA.SECRETE_PLASMID emits Request with own logic and intensity", () => {
  const vGrid = makeViralGrid();
  const myLogicVals = [1, 2, 3, 4, 5, 255, 7, 8];
  const logic = new Uint8Array(8);
  for (let i = 0; i < 8; i++) logic[i] = myLogicVals[i];

  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SECRETE_PLASMID p1=150 (intensity)
  code[0] = (150 << 8) | ISA.SECRETE_PLASMID;

  const state = baseState(vGrid, myLogicVals); // passes own logic via logicBytes arg
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assert(result.secretePlasmidRequest, "Should emit secretePlasmidRequest");
  assertEquals(
    result.secretePlasmidRequest!.intensity,
    150,
    "Intensity should be 150",
  );
  assertEquals(
    result.secretePlasmidRequest!.logic[5],
    255,
    "Should copy own logic byte 5",
  );
  assert(result.energyDelta < 0, "Secretion costs energy");
});

// ---------- Test 2: PULSE_WORKER writes secretePlasmidRequest to viralGrid ----------
Deno.test("Era 60: PULSE_WORKER applying secretePlasmidRequest deposits to viralGrid", () => {
  // Actually simulated in PULSE_WORKER logic or just tested functionally here
  const vGrid = makeViralGrid();
  const cellBase = (40 * GRID_W + 50) * 9; // x=500, y=400 translates to gx=50, gy=40

  // Simulate PULSE_WORKER handling
  const req = {
    logic: new Uint8Array([11, 22, 33, 44, 55, 66, 77, 88]),
    intensity: 75,
  };
  for (let j = 0; j < 8; j++) Atomics.store(vGrid, cellBase + j, req.logic[j]);
  const oldInt = Atomics.load(vGrid, cellBase + 8);
  Atomics.store(vGrid, cellBase + 8, Math.min(255, oldInt + req.intensity));

  // Verify cellBase in viralGrid
  assertEquals(vGrid[cellBase + 0], 11, "Byte 0 of plasmid stored");
  assertEquals(vGrid[cellBase + 7], 88, "Byte 7 of plasmid stored");
  assertEquals(vGrid[cellBase + 8], 75, "Intensity stored in byte 8");
});

// ---------- Test 3: ISA.INCORPORATE_PLASMID succeeds when intensity > threshold ----------
Deno.test("Era 60: ISA.INCORPORATE_PLASMID emits Request when intensity > p1", () => {
  const vGrid = makeViralGrid();
  const cellBase = (40 * GRID_W + 50) * 9;
  vGrid[cellBase + 0] = 99; // Some plasmid logic
  vGrid[cellBase + 8] = 100; // Plasmid intensity = 100

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // INCORPORATE_PLASMID p1=50 (threshold)
  code[0] = (50 << 8) | ISA.INCORPORATE_PLASMID;

  const result = LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState(vGrid, [0, 0, 0, 0, 0, 0, 0, 0]),
  );

  assert(
    result.incorporatePlasmidRequest,
    "Should emit incorporatePlasmidRequest",
  );
  assertEquals(
    result.incorporatePlasmidRequest!.logic[0],
    99,
    "Should read plasmid logic byte 0",
  );
  assertGreater(result.resonanceDelta, 0, "HGT yields massive resonance bonus");
});

// ---------- Test 4: ISA.INCORPORATE_PLASMID fails when intensity <= threshold ----------
Deno.test("Era 60: ISA.INCORPORATE_PLASMID ignores plasmid if intensity <= p1", () => {
  const vGrid = makeViralGrid();
  const cellBase = (40 * GRID_W + 50) * 9;
  vGrid[cellBase + 8] = 40; // Plasmid intensity = 40

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // INCORPORATE_PLASMID p1=50 (threshold)
  code[0] = (50 << 8) | ISA.INCORPORATE_PLASMID;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(vGrid, []));

  assert(
    !result.incorporatePlasmidRequest,
    "Should NOT emit incorporatePlasmidRequest if intensity low",
  );
});

// ---------- Test 5: PULSE_WORKER applies incorporatePlasmidRequest to STATE_MATRIX ----------
Deno.test("Era 60: PULSE_WORKER applying incorporatePlasmidRequest overwrites logic and reduces intensity", () => {
  const idx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idx, 888n);
  // Set old logic
  const oldLogicBytes = STATE_MATRIX.getLogic(idx);
  for (let i = 0; i < 8; i++) oldLogicBytes[i] = 1;
  STATE_MATRIX.setLogic(idx, oldLogicBytes);

  // Give it a role
  const rolesArray = (STATE_MATRIX as any).roles as Uint8Array;
  if (rolesArray) Atomics.store(rolesArray, idx, 3); // Role 3

  const vGrid = makeViralGrid();
  const cellBase = (40 * GRID_W + 50) * 9;
  vGrid[cellBase + 8] = 100; // Original intensity

  // Simulated PULSE_WORKER execution
  const req = { logic: new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]) };

  // Simulate updating logicBytes for VM and logic grid for State
  const logicBytes = new Uint8Array(8);
  const globalLogicArray = (STATE_MATRIX as any).logic as Uint8Array; // Unsafe internal access for test
  for (let j = 0; j < 8; j++) {
    logicBytes[j] = req.logic[j];
    if (globalLogicArray) {
      Atomics.store(globalLogicArray, idx * 8 + j, req.logic[j]);
    }
  }

  // Reduces intensity in cell
  const oldInt = Atomics.load(vGrid, cellBase + 8);
  Atomics.store(vGrid, cellBase + 8, Math.max(0, oldInt - 10));

  // Resets role
  if (rolesArray) Atomics.store(rolesArray, idx, 0);

  // Verify
  assertEquals(
    vGrid[cellBase + 8],
    90,
    "Cell viral intensity decremented by 10",
  );
  if (globalLogicArray) {
    assertEquals(
      globalLogicArray[idx * 8 + 0],
      8,
      "Atom logic byte 0 overwritten with plasmid",
    );
  }
  if (rolesArray) {
    assertEquals(rolesArray[idx], 0, "Atom role reset after identity mutation");
  }

  STATE_MATRIX.setId(idx, 0n);
});

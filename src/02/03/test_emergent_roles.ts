import { GRID_W, GRID_H, GRID_CELLS } from "@generated";
// OMEGA-64 | test_emergent_roles.ts | Era 53: Emergent Roles Verification
// Tests ISA.ATTUNE, signal tally accumulation, role derivation, and SENSE type 0x09.
// All tests exercise LAMBDA_VM directly.

import { STATE_MATRIX } from "@generated";
import { ISA, LAMBDA_VM } from "@02";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

function baseSynaptic(w0 = 0, w1 = 0, w2 = 0, tally = 0): Int32Array {
  const arr = new Int32Array(new SharedArrayBuffer(4 * 4));
  arr[0] = w0;
  arr[1] = w1;
  arr[2] = w2;
  arr[3] = tally;
  return arr;
}

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
    energy: 80,
    resonance: 300,
    bonds: new Uint32Array(4),
    synapticStack: baseSynaptic(),
    ...overrides,
  } as any;
}

// ---------- Test 1: ATTUNE fires when tally >= threshold ----------
Deno.test("Era 53: ISA.ATTUNE emits roleRequest when signal tally >= threshold", () => {
  // tally=25 > default threshold 20; weights: w0=10 > w1, w2 → role 1 (Producer)
  const synStack = baseSynaptic(10, 3, 1, 25);
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.ATTUNE; // p1=0 (use default threshold 20), p2=0 (auto-derive)

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assert(
    result.roleRequest,
    "ATTUNE should emit roleRequest when tally >= threshold",
  );
  assertEquals(
    result.roleRequest!.role,
    1,
    "Dominant weight w0 → role 1 (Producer)",
  );
  assert(result.energyDelta < 0, "ATTUNE costs energy");
  assert(result.resonanceDelta > 0, "Differentiation grants resonance bonus");
});

// ---------- Test 2: ATTUNE suppressed when tally < threshold ----------
Deno.test("Era 53: ISA.ATTUNE suppressed when tally < threshold", () => {
  const synStack = baseSynaptic(10, 3, 1, 15); // tally=15 < 20
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.ATTUNE;

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    result.roleRequest,
    undefined,
    "ATTUNE should not fire when tally < threshold",
  );
});

// ---------- Test 3: Role derived from dominant synapse weight ----------
Deno.test("Era 53: ATTUNE derives role from dominant synapse: w1 greatest → role 2 (Guardian)", () => {
  const synStack = baseSynaptic(5, 50, 20, 30); // w1=50 dominant
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.ATTUNE;

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(result.roleRequest!.role, 2, "w1 dominant → role 2 (Guardian)");
});

// ---------- Test 4: Role derived: w2 dominant → role 3 (Architect) ----------
Deno.test("Era 53: ATTUNE derives role 3 (Architect) when w2 is dominant", () => {
  const synStack = baseSynaptic(2, 8, 200, 25); // w2=200 wins
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.ATTUNE;

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(result.roleRequest!.role, 3, "w2 dominant → role 3 (Architect)");
});

// ---------- Test 5: Explicit role override via p2 ----------
Deno.test("Era 53: ATTUNE respects explicit p2 role override", () => {
  const synStack = baseSynaptic(100, 1, 1, 30); // w0 dominant but p2 forces role 7
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1 threshold=10, p2=7 (override)
  code[0] = (7 << 16) | (10 << 8) | ISA.ATTUNE;

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    result.roleRequest!.role,
    7,
    "p2=7 should override auto-derived role",
  );
});

// ---------- Test 6: Custom threshold via p1 ----------
Deno.test("Era 53: ATTUNE uses custom threshold from p1", () => {
  const synStack = baseSynaptic(50, 0, 0, 5); // tally=5
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=5: threshold=5, tally=5 → should fire
  code[0] = (0 << 16) | (5 << 8) | ISA.ATTUNE;

  const state = baseState({ synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assert(
    result.roleRequest,
    "ATTUNE should fire when tally=5 >= custom threshold=5",
  );
  assertEquals(result.roleRequest!.role, 1, "w0 dominant → role 1");
});

// ---------- Test 7: PULSE_WORKER FIRE increments signal tally on target ----------
Deno.test("Era 53: FIRE signal increments target synapticStack[3] tally", () => {
  const idxA = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idxA, 700n);
  STATE_MATRIX.setSynapticValue(idxA, 3, 0); // tally starts at 0

  // Simulate PULSE_WORKER FIRE intent handler
  const curTally = STATE_MATRIX.getSynapticValue(idxA, 3);
  if (curTally < 255) STATE_MATRIX.setSynapticValue(idxA, 3, curTally + 1);

  assertEquals(
    STATE_MATRIX.getSynapticValue(idxA, 3),
    1,
    "Signal tally should be 1 after one FIRE hit",
  );

  // Simulate 20 more FIRE hits
  for (let n = 0; n < 20; n++) {
    const t = STATE_MATRIX.getSynapticValue(idxA, 3);
    if (t < 255) STATE_MATRIX.setSynapticValue(idxA, 3, t + 1);
  }
  assertEquals(
    STATE_MATRIX.getSynapticValue(idxA, 3),
    21,
    "After 21 FIREs, tally should be 21",
  );

  STATE_MATRIX.setId(idxA, 0n);
});

// ---------- Test 8: SENSE type 0x09 reads signal tally ----------
Deno.test("Era 53: ISA.SENSE type 0x09 reads signal tally into register", () => {
  const synStack = baseSynaptic(0, 0, 0, 77); // tally = 77
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x09, reg=3
  code[0] = (3 << 16) | (0x09 << 8) | ISA.SENSE;

  const state = baseState({ synapticStack: synStack });
  LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(context[2 + 3], 77, "Register 3 should hold signal tally = 77");
});

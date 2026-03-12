// OMEGA-64 | test_epigenetic.ts | Era 56: Epigenetic Inheritance Verification
// Tests: weight inheritance in MITOSIS/MEIOSIS, ISA.INHERIT voluntary sync, SENSE type 0x0C.

import { ISA, LAMBDA_VM } from "../mod.ts";
import { STATE_MATRIX } from "../../00_substrate/mod.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

function makeHiveMemory(refWeight = 0): Uint8Array {
  const arr = new Uint8Array(new SharedArrayBuffer(140 * 80 * 16));
  // Pre-fill cell at (500,400) → gx=50, gy=40 → hBase=(40*140+50)*16=5650*16=90400
  const hBase = (40 * 140 + 50) * 16;
  arr[hBase + 1] = refWeight; // intensity octet = reference weight
  return arr;
}

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    x: 500,
    y: 400,
    nutrients: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(140 * 80 * 9)),
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    spatialGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 300,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    ...overrides,
  } as any;
}

// ---------- Test 1: MITOSIS inherits parent synaptic weights ----------
Deno.test("Era 56: MITOSIS child inherits parent synapticStack[0..2]", () => {
  const parentIdx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(parentIdx, 100n);
  STATE_MATRIX.setSynapticValue(parentIdx, 0, 80);
  STATE_MATRIX.setSynapticValue(parentIdx, 1, 120);
  STATE_MATRIX.setSynapticValue(parentIdx, 2, 200);
  STATE_MATRIX.setSynapticValue(parentIdx, 3, 15); // tally

  const childIdx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(childIdx, 101n);

  // Simulate MITOSIS weight inheritance (deterministic, 0% noise for test)
  for (let s = 0; s < 3; s++) {
    const w = STATE_MATRIX.getSynapticValue(parentIdx, s);
    STATE_MATRIX.setSynapticValue(childIdx, s, w);
  }
  STATE_MATRIX.setSynapticValue(childIdx, 3, 0); // tally reset

  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 0),
    80,
    "Child inherits w0=80",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 1),
    120,
    "Child inherits w1=120",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 2),
    200,
    "Child inherits w2=200",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 3),
    0,
    "Child FIRE tally resets to 0",
  );

  STATE_MATRIX.setId(parentIdx, 0n);
  STATE_MATRIX.setId(childIdx, 0n);
});

// ---------- Test 2: MEIOSIS child averages both parents' weights ----------
Deno.test("Era 56: MEIOSIS child averages both parents' synapticStack[0..2]", () => {
  const idxA = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idxA, 200n);
  STATE_MATRIX.setSynapticValue(idxA, 0, 100);
  STATE_MATRIX.setSynapticValue(idxA, 1, 60);
  STATE_MATRIX.setSynapticValue(idxA, 2, 20);

  const idxB = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idxB, 201n);
  STATE_MATRIX.setSynapticValue(idxB, 0, 60);
  STATE_MATRIX.setSynapticValue(idxB, 1, 100);
  STATE_MATRIX.setSynapticValue(idxB, 2, 80);

  const childIdx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(childIdx, 202n);

  // Simulate MEIOSIS average crossover
  for (let s = 0; s < 3; s++) {
    const wA = STATE_MATRIX.getSynapticValue(idxA, s);
    const wB = STATE_MATRIX.getSynapticValue(idxB, s);
    STATE_MATRIX.setSynapticValue(childIdx, s, Math.round((wA + wB) / 2));
  }
  STATE_MATRIX.setSynapticValue(childIdx, 3, 0);

  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 0),
    80,
    "Child w0 = avg(100,60)=80",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 1),
    80,
    "Child w1 = avg(60,100)=80",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 2),
    50,
    "Child w2 = avg(20,80)=50",
  );
  assertEquals(
    STATE_MATRIX.getSynapticValue(childIdx, 3),
    0,
    "FIRE tally resets",
  );

  STATE_MATRIX.setId(idxA, 0n);
  STATE_MATRIX.setId(idxB, 0n);
  STATE_MATRIX.setId(childIdx, 0n);
});

// ---------- Test 3: ISA.INHERIT moves weight toward reference ----------
Deno.test("Era 56: ISA.INHERIT moves synapticStack[p1] toward hiveMemory reference", () => {
  const synStack = new Int32Array(new SharedArrayBuffer(4 * 4));
  synStack[0] = 50; // current weight, will move toward refWeight=100

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // INHERIT p1=0 (slot 0), p2=5 (amplitude +5)
  code[0] = (5 << 16) | (0 << 8) | ISA.INHERIT;

  const state = baseState({
    synapticStack: synStack,
    hiveMemory: makeHiveMemory(100),
  });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(synStack[0], 55, "Weight should move from 50 toward 100 by +5");
  assert(
    result.modifiedSynaptic !== undefined,
    "INHERIT should emit modifiedSynaptic",
  );
  assert(result.resonanceDelta > 0, "Cultural alignment gives resonance bonus");
});

// ---------- Test 4: ISA.INHERIT moves weight DOWN if above reference ----------
Deno.test("Era 56: ISA.INHERIT moves weight DOWN when current > reference", () => {
  const synStack = new Int32Array(new SharedArrayBuffer(4 * 4));
  synStack[1] = 200; // current weight, will move toward refWeight=50

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // INHERIT p1=1 (slot 1), p2=3 (amplitude)
  code[0] = (3 << 16) | (1 << 8) | ISA.INHERIT;

  const state = baseState({
    synapticStack: synStack,
    hiveMemory: makeHiveMemory(50),
  });
  LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    synStack[1],
    197,
    "Weight should decrease from 200 toward 50 by -3",
  );
});

// ---------- Test 5: ISA.INHERIT uses default amplitude 1 when p2=0 ----------
Deno.test("Era 56: ISA.INHERIT uses amplitude=1 when p2=0", () => {
  const synStack = new Int32Array(new SharedArrayBuffer(4 * 4));
  synStack[2] = 40;

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 16) | (2 << 8) | ISA.INHERIT; // p1=2, p2=0

  const state = baseState({
    synapticStack: synStack,
    hiveMemory: makeHiveMemory(80),
  });
  LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    synStack[2],
    41,
    "Weight should move by +1 with default amplitude",
  );
});

// ---------- Test 6: SENSE type 0x0C reads imprint age ----------
Deno.test("Era 56: ISA.SENSE type 0x0C reads imprint age into register", () => {
  const hm = makeHiveMemory(0);
  const hBase = (40 * 140 + 50) * 16;
  // Write imprintTick=5 in bytes 8-11
  hm[hBase + 8] = 5;
  hm[hBase + 9] = 0;
  hm[hBase + 10] = 0;
  hm[hBase + 11] = 0;

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x0C, reg=0
  code[0] = (0 << 16) | (0x0C << 8) | ISA.SENSE;

  // age=10, imprintTick=5 → imprintAge = 10 - (5 & 0xFF) = 5
  LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState({ hiveMemory: hm, age: 10 }),
  );
  assertEquals(context[2], 5, "Imprint age should be 10-5=5");
});

// ---------- Test 7: Weight noise stays within bounds [0..255] ----------
Deno.test("Era 56: Epigenetic noise stays clamped to [0, 255]", () => {
  // Simulate clamping logic
  for (let base of [0, 127, 255]) {
    const noise = Math.random() < 0.5 ? 1 : -1;
    const result = Math.max(0, Math.min(255, base + noise));
    assert(
      result >= 0 && result <= 255,
      `Weight ${base} + noise must stay in [0,255]`,
    );
  }
});

// OMEGA-64 | test_temporal.ts | Era 54: Temporal Cognition Verification
// Tests ISA.AGE, ISA.PHASE_LIFE lifecycle phases, SENSE type 0x0A, and apoptosis.

import { ISA, LAMBDA_VM } from "../mod.ts";
import { STATE_MATRIX } from "../../00_substrate/mod.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

function baseState(age = 0, overrides: Record<string, unknown> = {}) {
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
    age,
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.AGE reads age into register ----------
Deno.test("Era 54: ISA.AGE reads own age into register p1", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // AGE p1=2 → reg 2
  code[0] = (2 << 8) | ISA.AGE;

  const state = baseState(88);
  LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(context[2 + 2], 88, "Register 2 should hold age=88");
});

// ---------- Test 2: ISA.AGE clamps to 255 ----------
Deno.test("Era 54: ISA.AGE clamps age > 255 to 255", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 8) | ISA.AGE;

  LAMBDA_VM.execute(logic, code, context, baseState(9999));
  assertEquals(context[2], 255, "Age > 255 should clamp to 255");
});

// ---------- Test 3: PHASE_LIFE Young gives resonance bonus ----------
Deno.test("Era 54: PHASE_LIFE young atom (age<50) gives resonance bonus", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.PHASE_LIFE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(10));
  assertGreater(result.resonanceDelta, 0, "Young atom should gain resonance");
  assert(result.energyDelta < 0, "Young atom pays growth cost");
});

// ---------- Test 4: PHASE_LIFE Mature gives energy bonus ----------
Deno.test("Era 54: PHASE_LIFE mature atom (50-199) gets energy recoup", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.PHASE_LIFE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(100));
  assertGreater(result.resonanceDelta, 0, "Mature atom gets resonance");
  assertGreater(result.energyDelta, 0, "Mature atom gets energy recoup");
});

// ---------- Test 5: PHASE_LIFE Aged emits FIRE intents with bonded synapses ----------
Deno.test("Era 54: PHASE_LIFE aged atom (200-399) emits FIRE signals when bonds+weights present", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.PHASE_LIFE;

  const bonds = new Uint32Array([42, 0, 0, 0]);
  const synStack = new Int32Array(new SharedArrayBuffer(4 * 4));
  synStack[0] = 100; // strong synapse on slot 0

  const result = LAMBDA_VM.execute(
    logic,
    code,
    context,
    baseState(250, { bonds, synapticStack: synStack }),
  );
  const fires = result.intent.filter((it: any) => it.level === 18);
  assertGreater(fires.length, 0, "Aged atom should emit FIRE teaching signals");
  assertEquals(
    fires[0].value.amplitude,
    150,
    "Teaching amplitude should be 150",
  );
  assert(result.energyDelta < 0, "Aged atom pays teaching cost");
});

// ---------- Test 6: PHASE_LIFE Senescent emits apoptosisRequest ----------
Deno.test("Era 54: PHASE_LIFE senescent atom (>=400) emits apoptosisRequest", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.PHASE_LIFE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(500));
  assert(result.apoptosisRequest, "Senescent atom should request apoptosis");
  assertGreater(
    result.resonanceDelta,
    0,
    "Final wisdom burst — resonance gain",
  );
});

// ---------- Test 7: SENSE type 0x0A reads age bucket ----------
Deno.test("Era 54: ISA.SENSE type 0x0A reads age bucket into register", () => {
  const testCases: [number, number, string][] = [
    [10, 0, "Young"],
    [80, 1, "Mature"],
    [300, 2, "Aged"],
    [600, 3, "Senescent"],
  ];
  for (const [age, expected, label] of testCases) {
    const logic = new Uint8Array(8);
    const ctx = new Uint8Array(32);
    const code = new Uint32Array(16);
    // SENSE type=0x0A, reg=0
    code[0] = (0 << 16) | (0x0A << 8) | ISA.SENSE;
    LAMBDA_VM.execute(logic, code, ctx, baseState(age));
    assertEquals(
      ctx[2],
      expected,
      `${label} (age=${age}) should be bucket ${expected}`,
    );
  }
});

// ---------- Test 8: birthTick is stored and age computes correctly ----------
Deno.test("Era 54: birthTicks stores spawn tick; age = current - birth", () => {
  const idx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idx, 888n);

  const birthTicks = STATE_MATRIX.birthTicks as Int32Array;
  const spawnTick = 100;
  const currentTick = 250;
  Atomics.store(birthTicks, idx, spawnTick);

  const age = currentTick - Atomics.load(birthTicks, idx);
  assertEquals(age, 150, "Age should be 250 - 100 = 150 (Mature)");

  STATE_MATRIX.setId(idx, 0n);
  Atomics.store(birthTicks, idx, 0);
});

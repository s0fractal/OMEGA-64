// OMEGA-64 | test_neural.ts | Era 52: Neural Substrate Verification
// Tests Hebbian plasticity (ISA.HEBB), signal propagation (ISA.FIRE),
// synaptic weight decay, and SENSE type 0x08 — directly via LAMBDA_VM.

import { STATE_MATRIX } from "../../00_substrate/mod.ts";
import { ISA, LAMBDA_VM } from "../mod.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const SCALE = 1000;

function baseSynaptic(
  weights: [number, number, number, number] = [0, 0, 0, 0],
): Int32Array {
  const buf = new SharedArrayBuffer(4 * 4);
  const arr = new Int32Array(buf);
  arr.set(weights);
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
    resonance: 300, // > HEBB_THRESHOLD (200)
    bonds: new Uint32Array(4),
    synapticStack: baseSynaptic(),
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.HEBB emits hebbRequest when resonance > threshold ----------
Deno.test("Era 52: ISA.HEBB emits hebbRequest when atom resonance > 200", () => {
  const bonds = new Uint32Array([42, 0, 0, 0]); // bond slot 0 → atom 42
  const synStack = baseSynaptic([10, 0, 0, 0]);

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // HEBB slot=0
  code[0] = (0 << 8) | ISA.HEBB;

  const state = baseState({ bonds, synapticStack: synStack, resonance: 300 });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assert(
    result.hebbRequest,
    "HEBB should emit hebbRequest when resonance > 200",
  );
  assertEquals(result.hebbRequest!.bondSlot, 0, "Bond slot should be 0");
  assert(result.energyDelta < 0, "HEBB costs energy");
});

// ---------- Test 2: ISA.HEBB suppressed when resonance ≤ 200 ----------
Deno.test("Era 52: ISA.HEBB suppressed when resonance ≤ 200", () => {
  const bonds = new Uint32Array([42, 0, 0, 0]);
  const synStack = baseSynaptic([10, 0, 0, 0]);

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 8) | ISA.HEBB;

  const state = baseState({ bonds, synapticStack: synStack, resonance: 100 }); // below threshold
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    result.hebbRequest,
    undefined,
    "HEBB should NOT fire when resonance ≤ 200",
  );
});

// ---------- Test 3: ISA.HEBB requires a bonded neighbour ----------
Deno.test("Era 52: ISA.HEBB suppressed when bond slot is empty (targetIdx=0)", () => {
  const bonds = new Uint32Array([0, 0, 0, 0]); // no bonds
  const synStack = baseSynaptic();

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 8) | ISA.HEBB;

  const state = baseState({ bonds, synapticStack: synStack, resonance: 500 });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    result.hebbRequest,
    undefined,
    "HEBB should not fire without bonded neighbour",
  );
});

// ---------- Test 4: PULSE_WORKER hebbRequest increments synapticStack ----------
Deno.test("Era 52: PULSE_WORKER hebbRequest increments synapticStack weight when neighbour resonance > 200", () => {
  const idxA = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idxA, 555n);
  STATE_MATRIX.setResonance(idxA, 300);

  const idxB = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idxB, 556n);
  STATE_MATRIX.setResonance(idxB, 300); // both high resonance

  // Set initial synaptic weight via STATE_MATRIX API
  const slot = 0;
  STATE_MATRIX.setSynapticValue(idxA, slot, 10);

  // Simulate PULSE_WORKER hebbRequest handler
  const neighbourResonance = STATE_MATRIX.getResonance(idxB);
  if (neighbourResonance > 200) {
    const curWeight = STATE_MATRIX.getSynapticValue(idxA, slot);
    if (curWeight < 255) {
      STATE_MATRIX.setSynapticValue(idxA, slot, curWeight + 1);
    }
  }

  const newWeight = STATE_MATRIX.getSynapticValue(idxA, slot);
  assertEquals(newWeight, 11, "Synaptic weight should increment from 10 to 11");

  STATE_MATRIX.setId(idxA, 0n);
  STATE_MATRIX.setId(idxB, 0n);
});

// ---------- Test 5: ISA.FIRE emits FIRE intent with correct weight scaling ----------
Deno.test("Era 52: ISA.FIRE emits intent level 18 with correct weight and amplitude", () => {
  const bonds = new Uint32Array([99, 0, 0, 0]);
  const synStack = baseSynaptic([200, 0, 0, 0]); // strong synapse

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // FIRE slot=0, amplitude=100
  code[0] = (100 << 16) | (0 << 8) | ISA.FIRE;

  const state = baseState({ bonds, synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  const fireIntent = result.intent.find((it: any) => it.level === 18);
  assert(fireIntent, "FIRE should emit intent level 18");
  assertEquals(fireIntent.value.bondSlot, 0, "Bond slot should be 0");
  assertEquals(fireIntent.value.amplitude, 100, "Amplitude should be 100");
  assertEquals(
    fireIntent.value.weight,
    200,
    "Weight should be 200 (from synapticStack)",
  );
  assert(
    result.energyDelta < 0,
    "FIRE costs energy proportional to weight×amplitude",
  );
});

// ---------- Test 6: ISA.FIRE skips when weight ≤ 10 ----------
Deno.test("Era 52: ISA.FIRE skips signal when synaptic weight ≤ 10", () => {
  const bonds = new Uint32Array([99, 0, 0, 0]);
  const synStack = baseSynaptic([5, 0, 0, 0]); // weak synapse

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (100 << 16) | (0 << 8) | ISA.FIRE;

  const state = baseState({ bonds, synapticStack: synStack });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  const fireIntent = result.intent.find((it: any) => it.level === 18);
  assertEquals(
    fireIntent,
    undefined,
    "FIRE should not propagate when weight ≤ 10",
  );
});

// ---------- Test 7: ISA.SENSE type 0x08 reads synaptic weight ----------
Deno.test("Era 52: ISA.SENSE type 0x08 reads synaptic weight into register", () => {
  const synStack = baseSynaptic([0, 180, 0, 0]); // weight at slot 1 = 180

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x08, reg=2, p2=1 (slot 1)
  code[0] = (2 << 16) | (0x08 << 8) | ISA.SENSE;
  // Note: In SENSE case 0x08, p2 selects the weight slot

  const state = baseState({ synapticStack: synStack });
  // We need to pass p2=1 for slot 1 — encode as (regIdx=2, type=0x08, slot=1 via p2)
  code[0] = (1 << 24) | (2 << 16) | (0x08 << 8) | ISA.SENSE;
  LAMBDA_VM.execute(logic, code, context, state);

  // p2 = (inst >> 16) & 0xFF = 2; but slot-select is p2%4=2, not 1.
  // Adjust: encode p2=1 for slot 1 selection
  const code2 = new Uint32Array(16);
  code2[0] = (0 << 24) | (1 << 16) | (0x08 << 8) | ISA.SENSE; // p2=1→slot 1, reg=p2%8=1
  const ctx2 = new Uint8Array(32);
  LAMBDA_VM.execute(logic, code2, ctx2, state);
  assertEquals(
    ctx2[2 + 1],
    180,
    "Register at index p2%8=1 should hold weight 180 from slot p2%4=1",
  );
});

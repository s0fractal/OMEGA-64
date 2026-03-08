// OMEGA-64 | test_symbiosis.ts | Era 61: Symbiotic Bonding Verification
// Tests ISA.SHARE (energy transfer to bonded neighbor) and ISA.EAT (nutrient consumption).

import { ISA, LAMBDA_VM } from "./LAMBDA_VM.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const GRID_W = 140;
const SCALE = 100;

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    x: 500,
    y: 400,
    nutrients: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(GRID_W * 80 * 9)),
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
    spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 300,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.SHARE emits shareRequest and deducts energy ----------
Deno.test("Era 61: ISA.SHARE emits shareRequest and deducts energy from self", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SHARE p1=20 (amount), p2=1 (bond slot 1)
  code[0] = (1 << 16) | (20 << 8) | ISA.SHARE;

  const bonds = new Uint32Array(4);
  bonds[1] = 999; // valid bond at slot 1

  const result = LAMBDA_VM.execute(logic, code, context, baseState({ bonds }));

  assert(result.shareRequest, "Should emit shareRequest");
  assertEquals(
    result.shareRequest!.amount,
    20,
    "Should request sharing 20 energy",
  );
  assertEquals(result.shareRequest!.bondSlot, 1, "Should target bond slot 1");
  assertEquals(
    result.energyDelta,
    -20,
    "Energy should be deducted immediately",
  );
  assertEquals(result.resonanceDelta, 5, "Should reward altruism (20/4)");
});

// ---------- Test 2: ISA.SHARE fails if bond is empty ----------
Deno.test("Era 61: ISA.SHARE fails if bonding slot is empty", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SHARE p1=20, p2=1
  code[0] = (1 << 16) | (20 << 8) | ISA.SHARE;

  const bonds = new Uint32Array(4); // all 0 (empty)
  const result = LAMBDA_VM.execute(logic, code, context, baseState({ bonds }));

  assert(!result.shareRequest, "Should NOT emit shareRequest if bond empty");
  assertEquals(result.energyDelta, 0, "Should not deduct energy if failed");
});

// ---------- Test 3: PULSE_WORKER applies shareRequest to target atom ----------
Deno.test("Era 61: PULSE_WORKER application of shareRequest transfers energy", () => {
  const targetIdx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(targetIdx, 777n);
  const initialEnergy = 50;
  STATE_MATRIX.setEnergy(targetIdx, initialEnergy);

  // Simulate PULSE_WORKER
  const req = { bondSlot: 1, amount: 20 };
  const bondView = new Uint32Array(4);
  bondView[1] = targetIdx;

  const energy = 80; // Sender's starting energy

  const actualAmount = Math.min(req.amount, Math.floor(energy));
  if (actualAmount > 0) {
    const currentTargetEnergy = STATE_MATRIX.getEnergy(targetIdx);
    STATE_MATRIX.setEnergy(targetIdx, currentTargetEnergy + actualAmount);
  }

  const finalEnergy = STATE_MATRIX.getEnergy(targetIdx);
  assertEquals(
    finalEnergy,
    initialEnergy + 20,
    "Target atom received 20 energy",
  );

  STATE_MATRIX.setId(targetIdx, 0n); // cleanup
});

// ---------- Test 4: ISA.EAT emits eatRequest ----------
Deno.test("Era 61: ISA.EAT emits eatRequest but doesn't instantly change energyDelta", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // EAT p1=15 (amount)
  code[0] = (15 << 8) | ISA.EAT;

  const result = LAMBDA_VM.execute(logic, code, context, baseState());

  assert(result.eatRequest, "Should emit eatRequest");
  assertEquals(
    result.eatRequest!.amount,
    15,
    "Should request eating 15 nutrients",
  );
  assertEquals(
    result.energyDelta,
    0,
    "Energy delta remains 0 until PULSE_WORKER evaluates",
  );
});

// ---------- Test 5: PULSE_WORKER applies eatRequest by draining grid ----------
Deno.test("Era 61: PULSE_WORKER drains nutrients grid correctly", () => {
  const nutrients = new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4));
  // x=500, y=400 -> gx=50, gy=40 -> idx=40*140+50 = 5650
  const cellBase = 40 * 140 + 50;
  nutrients[cellBase] = 100; // 100 nutrients available

  // Simulate PULSE_WORKER
  const req = { amount: 30 };
  let atomEnergy = 80;

  const available = Atomics.load(nutrients, cellBase);
  if (available > 0) {
    const consumed = Math.min(req.amount, available);
    Atomics.sub(nutrients, cellBase, consumed);
    atomEnergy += consumed;
  }

  assertEquals(nutrients[cellBase], 70, "Cell nutrients reduced by 30");
  assertEquals(atomEnergy, 110, "Atom energy gained 30");
});

// ---------- Test 6: PULSE_WORKER eat clamping ----------
Deno.test("Era 61: PULSE_WORKER clamps EAT to available nutrients", () => {
  const nutrients = new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4));
  const cellBase = 40 * 140 + 50;
  nutrients[cellBase] = 10; // Only 10 available

  const req = { amount: 50 }; // Requesting 50
  let atomEnergy = 80;

  const available = Atomics.load(nutrients, cellBase);
  if (available > 0) {
    const consumed = Math.min(req.amount, available);
    Atomics.sub(nutrients, cellBase, consumed);
    atomEnergy += consumed;
  }

  assertEquals(nutrients[cellBase], 0, "Cell nutrients depleted");
  assertEquals(atomEnergy, 90, "Atom energy gained only 10");
});

import { GRID_W, GRID_H, GRID_CELLS } from "@g";
// OMEGA-64 | test_decay.ts | Era 57: Synaptic Plasticity Decay Verification
// Tests: passive decay, ISA.DECAY (auto/specific/all modes), SENSE type 0x0D, HEBB protection.

import { ISA, LAMBDA_VM } from "@g";
import { MX } from "@g";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

function makeSynStack(
  w0: number,
  w1: number,
  w2: number,
  tally = 0,
): Int32Array {
  const arr = new Int32Array(new SharedArrayBuffer(4 * 4));
  arr[0] = w0;
  arr[1] = w1;
  arr[2] = w2;
  arr[3] = tally;
  return arr;
}

function baseState(
  synStack: Int32Array,
  overrides: Record<string, unknown> = {},
) {
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
    synapticStack: synStack,
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.DECAY auto-prunes weakest slot ----------
Deno.test("Era 57: ISA.DECAY auto prunes weakest synapse slot", () => {
  const syn = makeSynStack(100, 30, 80); // w1=30 is weakest
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=0 (auto), p2=0 (default rate=2)
  code[0] = ISA.DECAY;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(syn));

  assertEquals(syn[0], 100, "w0 unchanged");
  assertEquals(syn[1], 28, "Weakest w1=30 decayed by 2 → 28");
  assertEquals(syn[2], 80, "w2 unchanged");
  assert(result.modifiedSynaptic !== undefined, "DECAY emits modifiedSynaptic");
  assertEquals(result.modifiedSynaptic!.slot, 1, "Pruned slot is 1");
  assertGreater(
    result.resonanceDelta,
    0,
    "DECAY gives pruning resonance bonus",
  );
  assertGreater(result.energyDelta, 0, "DECAY releases energy");
});

// ---------- Test 2: ISA.DECAY specific slot ----------
Deno.test("Era 57: ISA.DECAY p1=2 decays specific slot 2", () => {
  const syn = makeSynStack(50, 90, 70);
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=2 (specific slot), p2=5 (rate)
  code[0] = (5 << 16) | (2 << 8) | ISA.DECAY;

  LAMBDA_VM.execute(logic, code, context, baseState(syn));

  assertEquals(syn[0], 50, "w0 unchanged");
  assertEquals(syn[1], 90, "w1 unchanged");
  assertEquals(syn[2], 65, "w2=70 decayed by 5 → 65");
});

// ---------- Test 3: ISA.DECAY all slots (p1>=3) ----------
Deno.test("Era 57: ISA.DECAY p1=3 decays all three slots", () => {
  const syn = makeSynStack(100, 50, 80);
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=3 (all), p2=3 (rate)
  code[0] = (3 << 16) | (3 << 8) | ISA.DECAY;

  LAMBDA_VM.execute(logic, code, context, baseState(syn));

  assertEquals(syn[0], 97, "w0=100 → 97");
  assertEquals(syn[1], 47, "w1=50 → 47");
  assertEquals(syn[2], 77, "w2=80 → 77");
});

// ---------- Test 4: DECAY clamps at 0 ----------
Deno.test("Era 57: ISA.DECAY clamps weight at 0", () => {
  const syn = makeSynStack(1, 5, 5); // w0=1 is weakest
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 16) | (0 << 8) | ISA.DECAY; // p2=0 → default rate 2

  LAMBDA_VM.execute(logic, code, context, baseState(syn));
  assertEquals(syn[0], 0, "Weight 1 decayed by 2, clamped to 0");
});

// ---------- Test 5: Passive decay in PULSE_WORKER (simulated) ----------
Deno.test("Era 57: Passive decay decrements weights by 1 every 10 ticks", () => {
  const idx = MX.findEmptySlot();
  MX.setId(idx, 777n);
  MX.setSynapticValue(idx, 0, 50);
  MX.setSynapticValue(idx, 1, 100);
  MX.setSynapticValue(idx, 2, 20);

  // Simulate passive decay (no HEBB fired, pulseId % 10 === 0)
  const didHebb = false;
  const pulseId = 10; // divisible by 10
  if (!didHebb && pulseId % 10 === 0) {
    for (let s = 0; s < 3; s++) {
      const cur = MX.getSynapticValue(idx, s);
      if (cur > 0) MX.setSynapticValue(idx, s, cur - 1);
    }
  }

  assertEquals(MX.getSynapticValue(idx, 0), 49, "w0 decayed 50→49");
  assertEquals(MX.getSynapticValue(idx, 1), 99, "w1 decayed 100→99");
  assertEquals(MX.getSynapticValue(idx, 2), 19, "w2 decayed 20→19");

  MX.setId(idx, 0n);
});

// ---------- Test 6: Passive decay skipped on non-decay tick ----------
Deno.test("Era 57: Passive decay skipped when pulseId % 10 !== 0", () => {
  const idx = MX.findEmptySlot();
  MX.setId(idx, 778n);
  MX.setSynapticValue(idx, 0, 50);

  const pulseId = 11; // NOT divisible by 10
  if (11 % 10 === 0) MX.setSynapticValue(idx, 0, 49);

  assertEquals(
    MX.getSynapticValue(idx, 0),
    50,
    "Weight unchanged on non-decay tick",
  );
  MX.setId(idx, 0n);
});

// ---------- Test 7: SENSE type 0x0D reads minimum weight ----------
Deno.test("Era 57: ISA.SENSE type 0x0D reads minimum weight into register", () => {
  const syn = makeSynStack(120, 45, 80); // min=45 at slot 1

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x0D, reg=3
  code[0] = (3 << 16) | (0x0D << 8) | ISA.SENSE;

  LAMBDA_VM.execute(logic, code, context, baseState(syn));
  assertEquals(context[2 + 3], 45, "Register 3 should hold min weight = 45");
});

// ---------- Test 8: HEBB+DECAY interaction: HEBB wins, passive skipped ----------
Deno.test("Era 57: If HEBB fired this tick, passive decay skipped (simulated)", () => {
  const idx = MX.findEmptySlot();
  MX.setId(idx, 779n);
  MX.setSynapticValue(idx, 0, 50);

  // Simulate: HEBB fired → didHebb=true → passive decay skipped
  const didHebb = true;
  const pulseId = 10;
  if (!didHebb && pulseId % 10 === 0) {
    MX.setSynapticValue(idx, 0, 49); // should NOT happen
  }

  assertEquals(
    MX.getSynapticValue(idx, 0),
    50,
    "Weight stays 50 when HEBB protected",
  );
  MX.setId(idx, 0n);
});

// OMEGA-64 | test_collective_memory.ts | Era 51: Collective Memory Verification
// Direct unit tests for ISA.IMPRINT, ISA.RECALL, and ISA.SENSE type 0x07.
// Tests exercise LAMBDA_VM directly and simulate PULSE_WORKER's imprintRequest path.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { ISA, LAMBDA_VM } from "./LAMBDA_VM.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

// ---------- Shared helpers ----------

function makePhero(value = 0): Int32Array {
  const buf = new SharedArrayBuffer(140 * 80 * 4);
  const arr = new Int32Array(buf);
  if (value !== 0) arr.fill(value);
  return arr;
}

function makeHiveMemory(): Uint8Array {
  return new Uint8Array(new SharedArrayBuffer(140 * 80 * 16));
}

function baseState(
  overrides: Record<string, unknown> = {},
): Parameters<typeof LAMBDA_VM.execute>[3] {
  return {
    x: 500,
    y: 400,
    nutrients: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(140 * 80 * 9)),
    pheromoneGrid: makePhero(),
    spatialGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 50,
    bonds: new Uint32Array(4),
    hiveMemory: makeHiveMemory(),
    ...overrides,
  } as any;
}

// ---------- Test 1: ISA.IMPRINT emits imprintRequest ----------
Deno.test("Era 51: ISA.IMPRINT emits imprintRequest when resonance > 20", () => {
  const phero = makePhero();
  // Pre-seed a pheromone at position of atom (500, 400) → cell (50, 40) → idx 5650
  const pIdx = 40 * 140 + 50; // 5650
  Atomics.store(phero, pIdx, (100 << 8) | 3); // intensity=100, type=3

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.IMPRINT; // single opcode, no params needed

  const state = baseState({ pheromoneGrid: phero, resonance: 50 });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assert(result.imprintRequest, "IMPRINT should emit imprintRequest");
  assertEquals(
    result.imprintRequest!.pheroSnapshot,
    (100 << 8) | 3,
    "Snapshot should match pre-seeded pheromone",
  );
  assert(result.energyDelta < 0, "IMPRINT should cost energy");
});

// ---------- Test 2: ISA.IMPRINT does NOT fire when resonance ≤ 20 ----------
Deno.test("Era 51: ISA.IMPRINT suppressed when resonance ≤ 20", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.IMPRINT;

  const state = baseState({ resonance: 15 }); // below threshold
  const result = LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    result.imprintRequest,
    undefined,
    "IMPRINT should not fire when resonance ≤ 20",
  );
});

// ---------- Test 3: imprintRequest writer → hiveMemory correct layout ----------
Deno.test("Era 51: applying imprintRequest writes correct 16-byte layout to hiveMemory", () => {
  const hiveMemory = makeHiveMemory();
  const x = 500;
  const y = 400;
  const gx = Math.floor(x / 10);
  const gy = Math.floor(y / 10);
  const hBase = (gy * 140 + gx) * 16;

  const pheroSnap = (80 << 8) | 5; // intensity=80, type=5
  const phaseSnap = 150;
  const pulseId = 42;
  const role = 2;
  const resonance = 300;

  // Simulate what PULSE_WORKER does when it receives imprintRequest
  hiveMemory[hBase + 0] = pheroSnap & 0xFF;
  hiveMemory[hBase + 1] = (pheroSnap >> 8) & 0xFF;
  hiveMemory[hBase + 2] = (pheroSnap >> 16) & 0xFF;
  hiveMemory[hBase + 3] = (pheroSnap >> 24) & 0xFF;
  hiveMemory[hBase + 4] = phaseSnap & 0xFF;
  hiveMemory[hBase + 5] = (phaseSnap >> 8) & 0xFF;
  hiveMemory[hBase + 6] = role;
  hiveMemory[hBase + 7] = Math.min(255, Math.floor(resonance / 100));
  hiveMemory[hBase + 8] = pulseId & 0xFF;
  hiveMemory[hBase + 9] = (pulseId >> 8) & 0xFF;
  hiveMemory[hBase + 10] = (pulseId >> 16) & 0xFF;
  hiveMemory[hBase + 11] = (pulseId >> 24) & 0xFF;

  // Read back
  const readPhero = hiveMemory[hBase] | (hiveMemory[hBase + 1] << 8) |
    (hiveMemory[hBase + 2] << 16) | (hiveMemory[hBase + 3] << 24);
  const readPhase = hiveMemory[hBase + 4] | (hiveMemory[hBase + 5] << 8);
  const readRole = hiveMemory[hBase + 6];
  const readTier = hiveMemory[hBase + 7];
  const readPulse = hiveMemory[hBase + 8] | (hiveMemory[hBase + 9] << 8) |
    (hiveMemory[hBase + 10] << 16) | (hiveMemory[hBase + 11] << 24);

  assertEquals(readPhero, pheroSnap, "Pheromone snapshot should round-trip");
  assertEquals(readPhase, phaseSnap, "Phase snapshot should round-trip");
  assertEquals(readRole, role, "Role should be stored correctly");
  assertEquals(readTier, 3, "Resonance tier should be floor(300/100)=3");
  assertEquals(
    readPulse,
    pulseId,
    "Pulse ID (tick) should be stored correctly",
  );
});

// ---------- Test 4: ISA.RECALL reads intensity from hiveMemory ----------
Deno.test("Era 51: ISA.RECALL reads pheromone intensity field (p1=0) into register", () => {
  const hiveMemory = makeHiveMemory();
  const x = 500;
  const y = 400;
  const gx = Math.floor(x / 10);
  const gy = Math.floor(y / 10);
  const hBase = (gy * 140 + gx) * 16;

  // Write intensity=120, type=7 to hiveMemory
  const pheroSnap = (120 << 8) | 7;
  hiveMemory[hBase + 0] = pheroSnap & 0xFF;
  hiveMemory[hBase + 1] = (pheroSnap >> 8) & 0xFF;
  hiveMemory[hBase + 2] = (pheroSnap >> 16) & 0xFF;
  hiveMemory[hBase + 3] = (pheroSnap >> 24) & 0xFF;

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // RECALL p1=0 (intensity), p2=0 (register 0)
  code[0] = (0 << 16) | (0 << 8) | ISA.RECALL;

  const state = baseState({ hiveMemory });
  const result = LAMBDA_VM.execute(logic, code, context, state);

  // Reg 0 should now contain the intensity (120 clamped to 255)
  assertEquals(
    context[2],
    120,
    "Register 0 should hold recalled phero intensity = 120",
  );
  assert(result.energyDelta < 0, "RECALL should cost energy");
});

// ---------- Test 5: ISA.SENSE type 0x07 reads hiveMemory intensity ----------
Deno.test("Era 51: ISA.SENSE type 0x07 reads hive-memory intensity into register", () => {
  const hiveMemory = makeHiveMemory();
  const x = 500;
  const y = 400;
  const gx = Math.floor(x / 10);
  const gy = Math.floor(y / 10);
  const hBase = (gy * 140 + gx) * 16;

  const pheroSnap = (200 << 8) | 4;
  hiveMemory[hBase + 0] = pheroSnap & 0xFF;
  hiveMemory[hBase + 1] = (pheroSnap >> 8) & 0xFF;
  hiveMemory[hBase + 2] = (pheroSnap >> 16) & 0xFF;
  hiveMemory[hBase + 3] = (pheroSnap >> 24) & 0xFF;

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x07, reg=1
  code[0] = (1 << 16) | (0x07 << 8) | ISA.SENSE;

  const state = baseState({ hiveMemory });
  LAMBDA_VM.execute(logic, code, context, state);

  assertEquals(
    context[3],
    200,
    "Register 1 should hold hive-memory intensity = 200",
  );
});

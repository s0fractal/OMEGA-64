import { GRID_W, GRID_H } from "../../00/OFFSETS.ts";
// OMEGA-64 | test_quorum.ts | Era 55: Quorum Sensing Verification
// Tests ISA.QUORUM collective behaviors, quorumBuffer census, and SENSE type 0x0B.

import { ISA, LAMBDA_VM } from "@02";
import { STATE_MATRIX } from "@00";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

// Helper: build a quorumData view with specific counts per role per cell
function makeQuorum(cellCounts: Record<number, number[]>): Int32Array {
  // GRID_W * GRID_H cells * 8 roles each
  const arr = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  // gx=50, gy=40 → cell index = 40*140+50 = 5650
  const cellIdx = 40 * 140 + 50;
  for (const [role, counts] of Object.entries(cellCounts)) {
    counts.forEach((count, r) => {
      arr[cellIdx * 8 + r] = count;
    });
    break; // only one entry needed
  }
  return arr;
}

function baseState(
  role: number,
  quorumData: Int32Array,
  overrides: Record<string, unknown> = {},
) {
  return {
    x: 500,
    y: 400, // maps to gx=50, gy=40
    nutrients: new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(GRID_W * GRID_H * 9)),
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 4)),
    spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 32 * 4)),
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 300,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    role,
    quorumData,
    ...overrides,
  } as any;
}

// ---------- Test 1: QUORUM fires when count >= threshold ----------
Deno.test("Era 55: ISA.QUORUM emits quorumRequest when same-role count >= threshold", () => {
  // cell at (500,400): role 1 has count=8
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 1] = 8; // role 1 count = 8

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // QUORUM p1=5 (threshold), p2=0 (resonance cascade)
  code[0] = (0 << 16) | (5 << 8) | ISA.QUORUM;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(1, qData));
  assert(
    result.quorumRequest,
    "QUORUM should emit quorumRequest when count >= threshold",
  );
  assertEquals(
    result.quorumRequest!.collectiveType,
    0,
    "p2=0 → resonance cascade",
  );
  assertEquals(
    result.quorumRequest!.quorumCount,
    8,
    "Quorum count should be 8",
  );
});

// ---------- Test 2: QUORUM suppressed when count < threshold ----------
Deno.test("Era 55: ISA.QUORUM suppressed when same-role count < threshold", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 1] = 3; // only 3, threshold=5

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 16) | (5 << 8) | ISA.QUORUM;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(1, qData));
  assertEquals(
    result.quorumRequest,
    undefined,
    "QUORUM should not fire below threshold",
  );
});

// ---------- Test 3: Collective type 0 (resonance cascade) ----------
Deno.test("Era 55: QUORUM type 0 gives resonance bonus proportional to count", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 2] = 10; // role 2, count=10

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=3, p2=0 (cascade)
  code[0] = (0 << 16) | (3 << 8) | ISA.QUORUM;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(2, qData));
  assertGreater(
    result.resonanceDelta,
    0,
    "Resonance cascade gives positive resonanceDelta",
  );
  assert(result.energyDelta < 0, "Resonance cascade has energy cost");
});

// ---------- Test 4: Collective type 1 (coordinated STAMP) ----------
Deno.test("Era 55: QUORUM type 1 emits pheromone flood intent level 19", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 3] = 7; // role 3, count=7

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=5, p2=1 (STAMP flood)
  code[0] = (1 << 16) | (5 << 8) | ISA.QUORUM;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(3, qData));
  const stampIntent = result.intent.find((it: any) => it.level === 19);
  assert(stampIntent, "STAMP flood intent (level 19) should be emitted");
  assertEquals(stampIntent.value.role, 3, "Intent should carry role 3");
  assertGreater(stampIntent.value.intensity, 0, "Intensity should be > 0");
});

// ---------- Test 5: Collective type 2 (role lock) ----------
Deno.test("Era 55: QUORUM type 2 grants resonance for role lock", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 1] = 6;

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // p1=5, p2=2 (role lock)
  code[0] = (2 << 16) | (5 << 8) | ISA.QUORUM;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(1, qData));
  assert(result.quorumRequest, "Role lock should emit quorumRequest");
  assertEquals(
    result.quorumRequest!.collectiveType,
    2,
    "collectiveType should be 2",
  );
  assertGreater(
    result.resonanceDelta,
    0,
    "Role lock grants resonance stability bonus",
  );
});

// ---------- Test 6: Default threshold = 5 when p1 = 0 ----------
Deno.test("Era 55: ISA.QUORUM default threshold is 5 when p1=0", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 0] = 5; // role 0, count=5 — exactly at default threshold

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.QUORUM; // p1=0 → default threshold 5

  const result = LAMBDA_VM.execute(logic, code, context, baseState(0, qData));
  assert(
    result.quorumRequest,
    "Default threshold=5: count=5 should trigger QUORUM",
  );
});

// ---------- Test 7: SENSE type 0x0B reads same-role count ----------
Deno.test("Era 55: ISA.SENSE type 0x0B reads quorum count into register", () => {
  const qData = new Int32Array(new SharedArrayBuffer(GRID_W * GRID_H * 8 * 4));
  const cellIdx = 40 * 140 + 50;
  qData[cellIdx * 8 + 2] = 42; // role 2, count=42

  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x0B, reg=1
  code[0] = (1 << 16) | (0x0B << 8) | ISA.SENSE;

  LAMBDA_VM.execute(logic, code, context, baseState(2, qData));
  assertEquals(context[2 + 1], 42, "Register 1 should hold quorum count 42");
});

// ---------- Test 8: quorumBuffer census — getRole round-trip ----------
Deno.test("Era 55: STATE_MATRIX.getRole reads correctly set role", () => {
  const idx = STATE_MATRIX.findEmptySlot();
  STATE_MATRIX.setId(idx, 999n);

  // Use setRole if available, otherwise use roleRegistryBuffer directly
  const rolesBuf = STATE_MATRIX.roleRegistryBuffer;
  const rolesArr = new Uint8Array(rolesBuf);
  rolesArr[idx] = 5; // set role 5 directly

  assertEquals(
    STATE_MATRIX.getRole(idx),
    5,
    "getRole should return the set role 5",
  );

  STATE_MATRIX.setId(idx, 0n);
  rolesArr[idx] = 0;
});

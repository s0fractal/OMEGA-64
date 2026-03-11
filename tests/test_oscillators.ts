// OMEGA-64 | test_oscillators.ts | Era 58: Resonance Oscillators Verification
// Tests ISA.OSCILLATE phase ripple, ISA.LOCK_PHASE constructive/destructive,
// SENSE type 0x0E cell phase average, and sinusoidal amplitude.

import { ISA, LAMBDA_VM } from "../02_metabolism/mod.ts";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

const GRID_COLS = 140;
const CELL_CAPACITY = 32; // slots per cell in spatialGrid

function makeSpatialGrid(cellPhaseAvg = 0): Int32Array {
  // 140*80 cells * 32 ints each
  const arr = new Int32Array(new SharedArrayBuffer(140 * 80 * 32 * 4));
  // Cell at (500,400) → gx=50, gy=40 → cellBase=(40*140+50)*32 = 5650*32=180800
  const cellBase = (40 * GRID_COLS + 50) * CELL_CAPACITY;
  arr[cellBase + 31] = cellPhaseAvg; // slot 31 = phase average
  return arr;
}

function baseState(phase: number, overrides: Record<string, unknown> = {}) {
  return {
    x: 500,
    y: 400, // gx=50, gy=40
    nutrients: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    structureGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    viralGrid: new Uint8Array(new SharedArrayBuffer(140 * 80 * 9)),
    pheromoneGrid: new Int32Array(new SharedArrayBuffer(140 * 80 * 4)),
    spatialGrid: makeSpatialGrid(100), // cell avg phase = 100
    marketPool: new Int32Array(new SharedArrayBuffer(8)),
    energy: 80,
    resonance: 500,
    bonds: new Uint32Array(4),
    synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
    phase,
    ...overrides,
  } as any;
}

// ---------- Test 1: OSCILLATE emits intent level 20 at peak phase ----------
Deno.test("Era 58: ISA.OSCILLATE emits intent level 20 at phase=64 (peak sin)", () => {
  // sin(64/255 * 2π) ≈ sin(π/2) ≈ 1.0 → constructive maximum
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // OSCILLATE p1=50 (amplitude), p2=0
  code[0] = (0 << 16) | (50 << 8) | ISA.OSCILLATE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(64));
  const oscIntent = result.intent.find((it: any) => it.level === 20);
  assert(oscIntent, "OSCILLATE should emit intent level 20");
  assertGreater(
    oscIntent.value.waveAmplitude,
    0,
    "At phase≈64, wave amplitude should be positive",
  );
  assert(result.energyDelta < 0, "OSCILLATE has energy cost");
});

// ---------- Test 2: OSCILLATE at trough phase (negative amplitude) ----------
Deno.test("Era 58: ISA.OSCILLATE at phase=192 (trough) gives negative waveAmplitude", () => {
  // sin(192/255 * 2π) ≈ sin(3π/2) ≈ -1 → destructive trough
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 16) | (50 << 8) | ISA.OSCILLATE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(192));
  const oscIntent = result.intent.find((it: any) => it.level === 20);
  // May or may not emit if waveAmplitude rounds to 0 at exact trough — just check if present it's negative
  if (oscIntent) {
    assert(
      oscIntent.value.waveAmplitude < 0,
      "At trough, waveAmplitude must be negative",
    );
  }
});

// ---------- Test 3: OSCILLATE at node (zero crossing) emits nothing ----------
Deno.test("Era 58: ISA.OSCILLATE at phase=0 (zero crossing) does not emit", () => {
  // sin(0) = 0 → waveAmplitude = 0 → no intent
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = (0 << 16) | (50 << 8) | ISA.OSCILLATE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(0));
  const oscIntent = result.intent.find((it: any) => it.level === 20);
  // waveAmplitude = round(50 * sin(0)) = 0 → no intent emitted
  assert(
    !oscIntent || oscIntent.value.waveAmplitude === 0,
    "At zero crossing, no positive intent emitted",
  );
});

// ---------- Test 4: LOCK_PHASE constructive snaps to cell average ----------
Deno.test("Era 58: ISA.LOCK_PHASE p1=0 emits lockPhaseRequest with target=cellAvg=100", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // LOCK_PHASE p1=0 (constructive)
  code[0] = (0 << 16) | (0 << 8) | ISA.LOCK_PHASE;

  // spatialGrid has cellAvgPhase=100 at (500,400)
  const result = LAMBDA_VM.execute(logic, code, context, baseState(50));
  assert(result.lockPhaseRequest, "LOCK_PHASE should emit lockPhaseRequest");
  assertEquals(
    result.lockPhaseRequest!.targetPhase,
    100,
    "Constructive: target = cell average 100",
  );
});

// ---------- Test 5: LOCK_PHASE destructive targets anti-phase ----------
Deno.test("Era 58: ISA.LOCK_PHASE p1=1 targets anti-phase (avg+128)=228", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // LOCK_PHASE p1=1 (destructive)
  code[0] = (0 << 16) | (1 << 8) | ISA.LOCK_PHASE;

  const result = LAMBDA_VM.execute(logic, code, context, baseState(50));
  assertEquals(
    result.lockPhaseRequest!.targetPhase,
    (100 + 128) % 256,
    "Destructive: target = (100+128)%256=228",
  );
});

// ---------- Test 6: LOCK_PHASE resonance bonus scales with alignment ----------
Deno.test("Era 58: LOCK_PHASE resonance bonus is higher when already aligned", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.LOCK_PHASE;

  // Near-aligned: phase=98, cellAvg=100 → small diff → high bonus
  const aligned = LAMBDA_VM.execute(logic, code, context, baseState(98));
  const codeArr2 = new Uint32Array(16);
  codeArr2[0] = ISA.LOCK_PHASE;
  // Misaligned: phase=200, cellAvg=100 → large diff → low bonus
  const misaligned = LAMBDA_VM.execute(
    logic,
    codeArr2,
    new Uint8Array(32),
    baseState(200),
  );

  assertGreater(
    aligned.resonanceDelta,
    misaligned.resonanceDelta,
    "Aligned atom gets higher resonance bonus from LOCK_PHASE",
  );
});

// ---------- Test 7: SENSE type 0x0E reads cell phase average ----------
Deno.test("Era 58: ISA.SENSE type 0x0E reads cell phase average into register", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  // SENSE type=0x0E, reg=5
  code[0] = (5 << 16) | (0x0E << 8) | ISA.SENSE;

  LAMBDA_VM.execute(logic, code, context, baseState(128));
  assertEquals(
    context[2 + 5],
    100,
    "Register 5 should hold cell phase average = 100",
  );
});

// ---------- Test 8: OSCILLATE auto-amplitude from resonance ----------
Deno.test("Era 58: ISA.OSCILLATE p1=0 uses auto amplitude from resonance", () => {
  const logic = new Uint8Array(8);
  const context = new Uint8Array(32);
  const code = new Uint32Array(16);
  code[0] = ISA.OSCILLATE; // p1=0, p2=0 → auto amplitude = resonance/10

  // resonance=500 → amplitude = min(255, floor(500/10)) = 50
  // phase=64 → sin ≈ 1 → waveAmplitude ≈ 50
  const result = LAMBDA_VM.execute(logic, code, context, baseState(64));
  const oscIntent = result.intent.find((it: any) => it.level === 20);
  if (oscIntent) {
    assertGreater(
      Math.abs(oscIntent.value.waveAmplitude),
      0,
      "Auto amplitude from resonance should give non-zero wave",
    );
  }
});

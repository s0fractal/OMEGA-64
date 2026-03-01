// OMEGA-64 | test_morpho.ts | Era 59: Morphogenetic Gradients Verification
// Tests ISA.GRAD (direction encoding), ISA.MORPH (zone classification + role),
// SENSE type 0x0F (gradient magnitude), and zone-based resonance bonuses.

import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { assertEquals, assertGreater, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

const GRID_W = 140;

function makePheroGrid(overrides: [number, number, number][] = []): Int32Array {
    // 140*80 cells
    const arr = new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4));
    // atom at (500,400) → px=50, py=40 → index=40*140+50=5650
    for (const [idx, val, _] of overrides) arr[idx] = val;
    return arr;
}

function baseState(pheroGrid: Int32Array, x = 500, y = 400, overrides: Record<string, unknown> = {}) {
    return {
        x, y,
        nutrients: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
        structureGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
        viralGrid: new Uint8Array(new SharedArrayBuffer(GRID_W * 80 * 9)),
        pheromoneGrid: pheroGrid,
        spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 32 * 4)),
        marketPool: new Int32Array(new SharedArrayBuffer(8)),
        energy: 80, resonance: 300,
        bonds: new Uint32Array(4),
        synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
        ...overrides,
    } as any;
}

// ---------- Test 1: ISA.GRAD encodes rightward gradient as ~0 or ~255 ----------
Deno.test("Era 59: ISA.GRAD p2=0 encodes gradient angle into register", () => {
    // Strong rightward gradient: phero[x+1] >> phero[x-1]
    const phero = makePheroGrid();
    const py = 40, px = 50;
    phero[py * 140 + px + 1] = 10000; // right high
    phero[py * 140 + px - 1] = 0;     // left low
    phero[(py + 1) * 140 + px] = 0;
    phero[(py - 1) * 140 + px] = 0;

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // GRAD p1=2 (store in reg 2), p2=0 (angle)
    code[0] = (0 << 16) | (2 << 8) | ISA.GRAD;

    LAMBDA_VM.execute(logic, code, context, baseState(phero));
    // atan2(0, +big) ≈ 0 → mapped to 0/255 range → ~127 (center of 0..255 for angle=0)
    // angle = 0 → floor((0 + π) / 2π * 255) ≈ 127
    const reg2 = context[2 + 2];
    assert(reg2 >= 120 && reg2 <= 135, `Rightward gradient angle ~127, got ${reg2}`);
});

// ---------- Test 2: ISA.GRAD p2=1 reads dx component ----------
Deno.test("Era 59: ISA.GRAD p2=1 reads dx as 0..255 into register", () => {
    const phero = makePheroGrid();
    const py = 40, px = 50;
    phero[py * 140 + px + 1] = 5000;
    phero[py * 140 + px - 1] = 0;

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // GRAD p1=0 (reg 0), p2=1 (dx)
    code[0] = (1 << 16) | (0 << 8) | ISA.GRAD;

    LAMBDA_VM.execute(logic, code, context, baseState(phero));
    // dx = 5000 - 0 = 5000; normalized: (5000+32767)/257 ≈ 147
    const reg0 = context[2];
    assert(reg0 > 100, `dx component should be > 100 for rightward gradient, got ${reg0}`);
});

// ---------- Test 3: ISA.MORPH classifies apex zone (high concentration) ----------
Deno.test("Era 59: ISA.MORPH zone=0 (apex) when concentration > p1*100", () => {
    const phero = makePheroGrid();
    const py = 40, px = 50;
    phero[py * 140 + px] = 2000; // high concentration — above default hiThresh=10*100=1000

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // MORPH p1=10 (hiThresh=1000), p2=3 (loThresh=300)
    code[0] = (3 << 16) | (10 << 8) | ISA.MORPH;

    const result = LAMBDA_VM.execute(logic, code, context, baseState(phero));
    assert(result.morphRequest, "MORPH should emit morphRequest");
    assertEquals(result.morphRequest!.zone, 0, "High concentration → zone 0 (Apex)");
    assertEquals(result.roleRequest?.role, 3, "Apex zone → Architect role (3)");
    assertGreater(result.resonanceDelta, 0, "Apex zone has highest resonance bonus");
});

// ---------- Test 4: ISA.MORPH classifies slope zone ----------
Deno.test("Era 59: ISA.MORPH zone=1 (slope) when in mid concentration range", () => {
    const phero = makePheroGrid();
    const py = 40, px = 50;
    phero[py * 140 + px] = 500; // mid concentration

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // MORPH p1=10 (hiThresh=1000), p2=3 (loThresh=300)
    code[0] = (3 << 16) | (10 << 8) | ISA.MORPH;

    const result = LAMBDA_VM.execute(logic, code, context, baseState(phero));
    assertEquals(result.morphRequest!.zone, 1, "Mid concentration → zone 1 (Slope)");
    assertEquals(result.roleRequest?.role, 2, "Slope zone → Guardian role (2)");
});

// ---------- Test 5: ISA.MORPH classifies base zone (low concentration) ----------
Deno.test("Era 59: ISA.MORPH zone=2 (base) when concentration is low", () => {
    const phero = makePheroGrid(); // all zeros = base zone

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // MORPH p1=10, p2=3 (both default)
    code[0] = (3 << 16) | (10 << 8) | ISA.MORPH;

    const result = LAMBDA_VM.execute(logic, code, context, baseState(phero));
    assertEquals(result.morphRequest!.zone, 2, "Low concentration → zone 2 (Base)");
    assertEquals(result.roleRequest?.role, 1, "Base zone → Producer role (1)");
});

// ---------- Test 6: Apex zone has highest resonance, base lowest ----------
Deno.test("Era 59: Apex resonance bonus > Slope > Base", () => {
    const logic = new Uint8Array(8);
    const code = new Uint32Array(16);
    code[0] = (3 << 16) | (10 << 8) | ISA.MORPH;

    const pApex = makePheroGrid(); pApex[40 * 140 + 50] = 2000;
    const pSlope = makePheroGrid(); pSlope[40 * 140 + 50] = 500;
    const pBase = makePheroGrid();

    const rApex  = LAMBDA_VM.execute(logic, code, new Uint8Array(32), baseState(pApex));
    const rSlope = LAMBDA_VM.execute(logic, code, new Uint8Array(32), baseState(pSlope));
    const rBase  = LAMBDA_VM.execute(logic, code, new Uint8Array(32), baseState(pBase));

    assertGreater(rApex.resonanceDelta, rSlope.resonanceDelta, "Apex > Slope resonance");
    assertGreater(rSlope.resonanceDelta, rBase.resonanceDelta, "Slope > Base resonance");
});

// ---------- Test 7: ISA.SENSE type 0x0F reads gradient magnitude ----------
Deno.test("Era 59: ISA.SENSE type 0x0F reads gradient magnitude into register", () => {
    const phero = makePheroGrid();
    const py = 40, px = 50;
    // Strong gradient in x-direction
    phero[py * 140 + px + 1] = 25500;
    phero[py * 140 + px - 1] = 0;

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // SENSE type=0x0F, reg=4
    code[0] = (4 << 16) | (0x0F << 8) | ISA.SENSE;

    LAMBDA_VM.execute(logic, code, context, baseState(phero));
    // dx=25500, dy=0 → magnitude = sqrt(25500²)/100 = 255
    assertEquals(context[2 + 4], 255, "Max gradient magnitude = 255");
});

// ---------- Test 8: MORPH gradAngle is within valid range ----------
Deno.test("Era 59: ISA.MORPH gradAngle is always in [0..255]", () => {
    const phero = makePheroGrid();
    phero[40 * 140 + 51] = 1000; // gradient present
    phero[40 * 140 + 49] = 100;

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    code[0] = (3 << 16) | (10 << 8) | ISA.MORPH;

    const result = LAMBDA_VM.execute(logic, code, context, baseState(phero));
    const angle = result.morphRequest!.gradAngle;
    assert(angle >= 0 && angle <= 255, `gradAngle must be 0..255, got ${angle}`);
});

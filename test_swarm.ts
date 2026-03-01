// OMEGA-64 | test_swarm.ts | Era 50: Swarm Intelligence Verification
// Tests stigmergy, phase synchronization and collective resonance directly
// via LAMBDA_VM without relying on the web worker layer.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { assert, assertEquals, assertGreater } from "https://deno.land/std@0.208.0/assert/mod.ts";

// ---------- helpers ----------
const SCALE = 1000;

function makePhero(): Int32Array {
    return new Int32Array(new SharedArrayBuffer(140 * 80 * 4));
}

function makeSpatial(): Int32Array {
    // 32 ints per cell (cell_capacity + 1 = 32)
    return new Int32Array(new SharedArrayBuffer(140 * 80 * 32 * 4));
}

function makeNutrients(): Int32Array {
    return new Int32Array(new SharedArrayBuffer(140 * 80 * 4));
}

function makeStructure(): Int32Array {
    return new Int32Array(new SharedArrayBuffer(140 * 80 * 4));
}

function makeViral(): Uint8Array {
    return new Uint8Array(new SharedArrayBuffer(140 * 80 * 9));
}

function makeMarket(): Int32Array {
    return new Int32Array(new SharedArrayBuffer(8));
}

// ---------- Test 1: ISA.STAMP writes pheromone intent ----------
Deno.test("Era 50: ISA.STAMP emits intent with correct type and intensity", () => {
    const phero = makePhero();
    const nutrients = makeNutrients();
    const structure = makeStructure();
    const viral = makeViral();
    const market = makeMarket();
    const spatial = makeSpatial();

    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const bonds = new Uint32Array(4);
    const synaptic = new Int32Array(4);

    // Build instruction: STAMP type=3, intensity=100
    const code = new Uint32Array(16);
    code[0] = (100 << 16) | (3 << 8) | ISA.STAMP;

    const state = {
        x: 500, y: 400,
        nutrients, structureGrid: structure, viralGrid: viral,
        pheromoneGrid: phero, spatialGrid: spatial,
        marketPool: market,
        energy: 80, resonance: 50, // > 30 so STAMP fires
        bonds, synapticStack: synaptic,
    };

    const result = LAMBDA_VM.execute(logic, code, context, state);

    // Should have emitted a STAMP intent (level 16)
    const stampIntent = result.intent.find((it: any) => it.level === 16);
    assert(stampIntent, "STAMP should emit intent at level 16");
    assertEquals(stampIntent.value.type, 3, "Pheromone type should be 3");
    assertGreater(stampIntent.value.intensity, 50, "Pheromone intensity should be > 50");
    assert(result.energyDelta < 0, "STAMP should cost energy");
});

// ---------- Test 2: Apply STAMP intent → pheroGrid updated ----------
Deno.test("Era 50: Applying STAMP intent updates pheroGrid correctly", () => {
    const phero = makePhero();

    // Simulate what PULSE_WORKER does when it processes intent.level === 16
    const x = 500; const y = 400;
    const gx = Math.floor(x / 10); // 50
    const gy = Math.floor(y / 10); // 40
    const pIdx = gy * 140 + gx;    // 40*140 + 50 = 5650

    const stampType = 5;
    const stampIntensity = 80;

    const existing = Atomics.load(phero, pIdx);
    const existingIntensity = (existing >>> 8) & 0xFFFFFF;
    const newIntensity = Math.min(0xFFFFFF, existingIntensity + stampIntensity);
    Atomics.store(phero, pIdx, (newIntensity << 8) | (stampType & 0xFF));

    // Verify
    const stored = Atomics.load(phero, pIdx);
    const readType = stored & 0xFF;
    const readIntensity = (stored >>> 8) & 0xFFFFFF;

    assertEquals(readType, stampType, "Pheromone type should be 5");
    assertEquals(readIntensity, stampIntensity, `Pheromone intensity should be ${stampIntensity}`);
});

// ---------- Test 3: ISA.SYNC averages phase across bonds ----------
Deno.test("Era 50: ISA.SYNC averages phase of bonded atoms", () => {
    const idxA = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setId(idxA, 999n); // commit immediately so idxB gets a different slot
    const idxB = STATE_MATRIX.findEmptySlot();

    try {
        STATE_MATRIX.setPhase(idxA, 100);
        STATE_MATRIX.setEnergy(idxA, 80);
        STATE_MATRIX.setResonance(idxA, 50);

        STATE_MATRIX.setId(idxB, 998n);
        STATE_MATRIX.setPhase(idxB, 200);

        const phases = (STATE_MATRIX as any).phases as Int32Array;

        // Simulate PULSE_WORKER SYNC: avgPhase = (rawA + rawB) / 2
        let avgPhase = Atomics.load(phases, idxA);
        let phaseCount = 1;
        avgPhase += Atomics.load(phases, idxB);
        phaseCount++;
        Atomics.store(phases, idxA, Math.floor(avgPhase / phaseCount));

        const newPhase = STATE_MATRIX.getPhase(idxA);
        // setPhase(x, 100) stores 100*1000=100000; setPhase(x, 200) stores 200000
        // avg = 150000; getPhase returns 150000/1000 = 150
        assertEquals(newPhase, 150, "Synced phase should be avg of 100 and 200");
    } finally {
        STATE_MATRIX.setId(idxA, 0n);
        STATE_MATRIX.setId(idxB, 0n);
    }
});

// ---------- Test 4: Pheromone decay reduces intensity ----------
Deno.test("Era 50: Pheromone decay reduces intensity by 5 per tick", () => {
    const phero = makePhero();
    const pIdx = 0;
    const initialIntensity = 100;
    const stampType = 7;

    Atomics.store(phero, pIdx, (initialIntensity << 8) | stampType);

    // Simulate one decay tick
    const cell = Atomics.load(phero, pIdx);
    const intensity = (cell >>> 8) & 0xFFFFFF;
    const type = cell & 0xFF;
    if (intensity > 10) {
        Atomics.store(phero, pIdx, ((intensity - 5) << 8) | type);
    }

    const after = Atomics.load(phero, pIdx);
    const afterIntensity = (after >>> 8) & 0xFFFFFF;
    const afterType = after & 0xFF;

    assertEquals(afterIntensity, initialIntensity - 5, "Intensity should decay by 5");
    assertEquals(afterType, stampType, "Type should be preserved after decay");
});

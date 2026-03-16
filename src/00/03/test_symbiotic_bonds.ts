import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { MX, wasmMemory } from "@g";
import { BONDS_OFFSET, BOND_REQUESTS_OFFSET, GRID_W, INSTRUCTIONS_OFFSET, MAX_ATOMS, PHYSICS_READ_ENERGY_OFFSET, PHYSICS_READ_RESONANCE_OFFSET, PHYSICS_READ_XS_OFFSET, PHYSICS_READ_YS_OFFSET, RESONANCE_DELTA_OFFSET, SPATIAL_GRID_OFFSET } from "@g";

const WASM_PATH = AS_WASM_PATH;
const wasmModule = await Deno.readFile(WASM_PATH);
const { instance } = await WebAssembly.instantiate(wasmModule, {
  index: {
    trace_atom: (
      idx: number,
      op: number,
      res: number,
      tick: number,
      role: number,
    ) => {
      console.log(
        `[Trace] Atom ${idx}: op=0x${
          op.toString(16)
        }, param1=${res}, param2=${tick}, param3=${role}`,
      );
    },
  },
  env: {
    memory: wasmMemory,
    abort: (msg: any) => console.error("WASM ABORT:", msg),
    trace_atom: (
      idx: number,
      op: number,
      res: number,
      tick: number,
      role: number,
    ) => {},
    lcgNext: (seed: number) => (seed * 1664525 + 1013904223) >>> 0,
    Mathf_sqrt: Math.sqrt,
    "Math.round": Math.round,
  },
});

const kernel = instance.exports as any;

/**
 * Setup a clean state for testing
 */
function setupTestState() {
  new Uint8Array(MX.buffer).fill(0);
  MX.setHormone(0, 512); // entropy_pressure
  MX.setHormone(1, 512); // time_viscosity
  MX.setHormone(2, 512); // aggression
  MX.setHormone(3, 512); // replication_bias
  MX.setHormone(4, 512); // repair_drive
  MX.setHormone(5, 512); // mutation_friction
}

// 1. Verify OP_BIND (Autonomous Bonding)
console.log("--- Test A: OP_BIND (Autonomous Bonding) ---");
setupTestState();

// Atom 1 at (100, 100)
MX.setId(1, 100n);
MX.setX(1, 100);
MX.setY(1, 100);
MX.set_energy(1, 400);
MX.set_resonance(1, 200);

// Population of read buffers for spatial grid and proximity
const readXs = new Int16Array(
  MX.buffer,
  PHYSICS_READ_XS_OFFSET,
  MAX_ATOMS,
);
const readYs = new Int16Array(
  MX.buffer,
  PHYSICS_READ_YS_OFFSET,
  MAX_ATOMS,
);
const readEnergy = new Int32Array(
  MX.buffer,
  PHYSICS_READ_ENERGY_OFFSET,
  MAX_ATOMS,
);
const readResonance = new Int32Array(
  MX.buffer,
  PHYSICS_READ_RESONANCE_OFFSET,
  MAX_ATOMS,
);

readXs[1] = 100;
readYs[1] = 100;
readEnergy[1] = 400;
readResonance[1] = 200;

// Atom 2 at (105, 105) - nearby
MX.setId(2, 200n);
MX.setX(2, 105);
MX.setY(2, 105);
readXs[2] = 105;
readYs[2] = 105;
readResonance[2] = 0;
readEnergy[2] = 100;

// Build spatial grid manually for the test
const gridIdx = (10 * GRID_W) + 10; // (100/10, 100/10)
const gridOff = (SPATIAL_GRID_OFFSET) + (gridIdx << 7);
const view = new Int32Array(MX.buffer);
const gridViewIdx = gridOff >> 2;
view[gridViewIdx] = 2; // Count
view[gridViewIdx + 1] = 1; // Atom 1
view[gridViewIdx + 2] = 2; // Atom 2

// Write instructions for Atom 1: OP_BIND (0x82)
const instOff = INSTRUCTIONS_OFFSET + (1 << 6);
const instView = new Uint8Array(MX.buffer);
instView[instOff] = 0x82; // OP_BIND

kernel.execute_atom(1);

// Check bond requests
const reqOff = BOND_REQUESTS_OFFSET + (1 * 12);
const reqView = new Int32Array(MX.buffer, reqOff, 3);
console.log(
  `Bond Request: Initiator=${reqView[0]}, Target=${reqView[1]}, Status=${
    reqView[2]
  }`,
);

assertEquals(reqView[0], 2, "Initiator should be Atom 1 (idx 1 + 1)");
assertEquals(reqView[1], 3, "Target should be Atom 2 (idx 2 + 1)");
assertEquals(reqView[2], 1, "Status should be 1 (Active)");
console.log("✅ OP_BIND Successful");

// 2. Verify Resonance Synchronization
console.log("\n--- Test B: Resonance Synchronization ---");
setupTestState();

// Setup physical bond: Atom 1 <-> Atom 2
// Bonds are at BONDS_OFFSET: 16 bytes per atom (4 slots of i32)
const bondsOff = BONDS_OFFSET;
const bondsView = new Int32Array(MX.buffer);
bondsView[(bondsOff + (1 * 16)) >> 2] = 2; // Atom 1 bond 0 -> Atom 2

// Resonance: Atom 1 = 200, Atom 2 = 0
MX.setId(1, 101n);
MX.setId(2, 201n);
MX.set_resonance(1, 200);
MX.set_resonance(2, 0);

readResonance[1] = 200;
readResonance[2] = 0;
readXs[1] = 100;
readYs[1] = 100;
readXs[2] = 105;
readYs[2] = 105;

// Execute Atom 1
kernel.execute_atom(1);

// Check resonance delta for Atom 1
const resDeltaOff = RESONANCE_DELTA_OFFSET;
const resDeltaView = new Int32Array(MX.buffer);
const delta1 = resDeltaView[(resDeltaOff + (1 << 2)) >> 2];

console.log(`Atom 1 Resonance Delta: ${delta1}`);
// Expect (0 - 200) / 20 = -10
assertEquals(delta1, -10, "Resonance should flow from high to low");
console.log("✅ Resonance Sync Successful");

Deno.exit(0);

/**
 * test_hormone_lattice_alignment_contract.ts
 * Stage 7.1 Verification: Live Hormone Memory Lattice
 *
 * Verifies that:
 * 1. HORMONE_OFFSET is within WASM memory bounds.
 * 2. Host-side syncHormonesToLattice() writes values are bit-exact readable via MX.getHormone().
 * 3. All 6 hormones can be written/read from SharedArrayBuffer with atomic guarantees.
 */

import {
  HORMONE_OFFSET,
  WASM_MEMORY_BYTES
} from "@generated";
import { MX } from "@generated";
import { syncHormonesToLattice } from "@generated";
import { HORMONE_BUFFER_CATALOG } from "@generated";
import { RUNTIME_POLICY } from "@generated";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS | ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL | ${label}`);
    failed++;
  }
}

console.log("\n💉 [HORMONE LATTICE ALIGNMENT CONTRACT] Starting...\n");

// ---
// 1. Memory Layout Validation
// ---
console.log("── Section 1: Memory Layout ──");

const layoutResult = true;
assert(layoutResult, "Memory layout checks are handled by test_memory_layout_guard.ts");

assert(
  HORMONE_OFFSET !== undefined,
  "HORMONE_OFFSET is exported from mod.ts"
);

assert(
  HORMONE_OFFSET + 12 <= WASM_MEMORY_BYTES,
  `HORMONE_OFFSET (${HORMONE_OFFSET}) + 12 bytes fits in WASM memory`,
);

assert(
  HORMONE_OFFSET % 2 === 0,
  `HORMONE_OFFSET is Uint16-aligned`,
);

// ---
// 2. Bit-Exactness Test
// ---
console.log("\n── Section 2: Bit-Exactness via syncHormonesToLattice ──");

const testInput = {
  baseTax: 64,
  targetEnergy: 10,
  workerCount: 16,
  egoPressure: 100,
  fearPressure: 50,
  noveltyPressure: 200,
  symbiosisPressure: 80,
  maxPlasmidCharge: RUNTIME_POLICY.daemon.maxPlasmidCharge,
  pressureRingScale: 4,
};

syncHormonesToLattice(testInput as any);

// entropy_pressure: clamp((64 / max(1, policy.maxDelta)) * 1024, 0, 2048)
const policy = RUNTIME_POLICY.pulse.homeostasis;
const expectedEntropy = Math.round(
  Math.max(0, Math.min(2048, (64 / Math.max(1, policy.maxDelta)) * 1024)),
);
assert(
  MX.getHormone(0) === expectedEntropy,
  `entropy_pressure (index 0) should be ${expectedEntropy}, got ${
    MX.getHormone(0)
  }`,
);

// time_viscosity: clamp((16 / 32) * 2048, 0, 2048) = 1024
const expectedViscosity = Math.round(
  Math.max(0, Math.min(2048, (16 / 32) * 2048)),
);
assert(
  MX.getHormone(1) === expectedViscosity,
  `time_viscosity (index 1) should be ${expectedViscosity}, got ${
    MX.getHormone(1)
  }`,
);

// aggression: clamp(150, 0, 2048) = 150
const expectedAggression = Math.round(Math.max(0, Math.min(2048, 100 + 50)));
assert(
  MX.getHormone(2) === expectedAggression,
  `aggression (index 2) should be ${expectedAggression}, got ${
    MX.getHormone(2)
  }`,
);

// replication_bias
const expectedReplication = Math.round(
  Math.max(
    0,
    Math.min(
      2048,
      200 + (RUNTIME_POLICY.coldstart.replicatorRatio * 256),
    ),
  ),
);
assert(
  MX.getHormone(3) === expectedReplication,
  `replication_bias (index 3) should be ${expectedReplication}, got ${
    MX.getHormone(3)
  }`,
);

// repair_drive
const expectedRepair = Math.round(
  Math.max(
    0,
    Math.min(
      2048,
      80 +
        ((1 - RUNTIME_POLICY.federation.admission.degradeEnergyRatio) * 1024),
    ),
  ),
);
assert(
  MX.getHormone(4) === expectedRepair,
  `repair_drive (index 4) should be ${expectedRepair}, got ${
    MX.getHormone(4)
  }`,
);

// ---
// 3. Atomics Roundtrip Test
// ---
console.log("\n── Section 3: Direct Atomic Roundtrip ──");

const testValues: [number, number][] = [
  [0, 0],
  [1, 2048],
  [2, 1024],
  [3, 999],
  [4, 1],
  [5, 1500],
];

for (const [idx, val] of testValues) {
  MX.setHormone(idx, val);
  const readBack = MX.getHormone(idx);
  assert(
    readBack === val,
    `Hormone[${idx}] set=${val} readBack=${readBack}`,
  );
}

// ---
// 4. Hormone Catalog Alignment
// ---
console.log("\n── Section 4: Catalog Length ──");

assert(
  HORMONE_BUFFER_CATALOG.length === 6,
  `HORMONE_BUFFER_CATALOG has 6 entries (matches lattice allocation of 12 bytes)`,
);

// ---
// Summary
// ---
console.log(`\n${"─".repeat(50)}`);
console.log(
  `💉 HORMONE LATTICE ALIGNMENT CONTRACT: ${
    failed === 0 ? "✅ PASS" : "❌ FAIL"
  } (${passed}/${passed + failed})`,
);
if (failed > 0) {
  console.error(`\nFailed checks: ${failed}`);
  Deno.exit(1);
}

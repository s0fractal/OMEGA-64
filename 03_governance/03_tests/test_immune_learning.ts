// OMEGA-64 | test_immune_learning.ts | Era 62: Immune Learning Verification
// Tests GATE.ts tracking average resonance of novel plasmids and promoting them cleanly.

import { GATE } from "@03";
import {
  assert,
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { STATE_MATRIX } from "@00";

// Helper to construct a mock state matrix interface for GATE testing
function mockStateMatrix(
  atoms: Array<
    {
      logic: number[];
      resonance: number;
      x: number;
      y: number;
      feedCount?: number;
      bonds?: number[];
      active: boolean;
    }
  >,
) {
  return {
    getActiveIndices: () =>
      atoms.map((a, i) => a.active ? i : -1).filter((i) => i !== -1),
    getLogic: (i: number) => new Uint8Array(atoms[i].logic),
    getResonance: (i: number) => atoms[i].resonance,
    getX: (i: number) => atoms[i].x,
    getY: (i: number) => atoms[i].y,
    getBonds: (i: number) => atoms[i].bonds || [0, 0, 0, 0],
    getEnergy: (i: number) => 30000,
    setQuarantine: (i: number, level: number) => {
      atoms[i].quarantine = level;
    },
    viralGrid: new Uint8Array(140 * 80 * 9),
  } as any;
}

// Ensure clean state before tests
function setup() {
  GATE.trustedSignatures.clear();
  GATE.immuneMemory.clear();
}

// ---------- Test 1: Harmful variant gets penalized ----------
Deno.test("Era 62: GATE penalizes variants with resonance lower than baseline", () => {
  setup();
  const canonLogic = [1, 1, 1, 1, 1, 1, 1, 1];
  const canonHex = "0101010101010101";
  GATE.trustedSignatures.add(canonHex);

  const atoms = [
    // Baseline (High resonance)
    { logic: canonLogic, resonance: 20000, x: 0, y: 0, active: true },
    { logic: canonLogic, resonance: 20000, x: 0, y: 0, active: true },
    // Toxic Variant (feed intensive, no bonds) - Low resonance
    {
      logic: [0x20, 0x20, 0x20, 0x20, 0x20, 2, 2, 2],
      resonance: 5000,
      x: 0,
      y: 0,
      active: true,
    },
    {
      logic: [0x20, 0x20, 0x20, 0x20, 0x20, 2, 2, 2],
      resonance: 5000,
      x: 0,
      y: 0,
      active: true,
    },
    {
      logic: [0x20, 0x20, 0x20, 0x20, 0x20, 2, 2, 2],
      resonance: 5000,
      x: 0,
      y: 0,
      active: true,
    },
  ];

  const matrix = mockStateMatrix(atoms);

  // Evaluate multiple times
  GATE.detectAntigens(matrix);
  GATE.detectAntigens(matrix);

  const toxicHex = "2020202020020202";
  const score = GATE.immuneMemory.get(toxicHex) || 0;
  assertEquals(score, 0, "Toxic variant score clamped to 0");
  assertEquals(
    atoms[2].quarantine,
    2,
    "Toxic variant suppressed (Quarantine 2)",
  );
});

// ---------- Test 2: Beneficial variant gets rewarded and promoted ----------
Deno.test("Era 62: GATE promotes high-resonance variants to trustedSignatures", () => {
  setup();
  const canonLogic = [1, 1, 1, 1, 1, 1, 1, 1];
  const canonHex = "0101010101010101";
  GATE.trustedSignatures.add(canonHex);

  // Baseline avg starts at ~10000
  // Beneficial variant avg is 25000 (must be > 3 atoms to get reward)
  const plasmidLogic = [8, 8, 8, 8, 8, 8, 8, 8];
  const plasmidHex = "0808080808080808";

  const atoms = [
    { logic: canonLogic, resonance: 10000, x: 0, y: 0, active: true },
    { logic: canonLogic, resonance: 10000, x: 0, y: 0, active: true },
    { logic: plasmidLogic, resonance: 25000, x: 0, y: 0, active: true },
    { logic: plasmidLogic, resonance: 25000, x: 0, y: 0, active: true },
    { logic: plasmidLogic, resonance: 25000, x: 0, y: 0, active: true },
  ];

  const matrix = mockStateMatrix(atoms);

  // Run until threshold > 100 is reached (11 times)
  for (let i = 0; i < 11; i++) {
    GATE.detectAntigens(matrix);
  }

  assert(GATE.immuneMemory.get(plasmidHex)! > 100, "Score should exceed 100");
  assert(
    GATE.trustedSignatures.has(plasmidHex),
    "Beneficial plasmid promoted to Canon",
  );
});

// ---------- Test 3: Trusted signature bypasses quarantine ----------
Deno.test("Era 62: Trusted signatures ignore antigen checks", () => {
  setup();
  const trustedHex = "2020202020202020"; // Highly "malignant" sequence 8x FEED
  GATE.trustedSignatures.add(trustedHex);

  const atoms = [
    {
      logic: [0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20],
      resonance: 10000,
      x: 0,
      y: 0,
      active: true,
    },
  ];

  const matrix = mockStateMatrix(atoms);

  GATE.detectAntigens(matrix);

  // Despite being malignant mechanically, it's trusted
  assertEquals(atoms[0].quarantine, 0, "Trusted signatures stay CLEAN (0)");
});

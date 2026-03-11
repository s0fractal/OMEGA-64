/**
 * test_hormone_daemon_admission_contract.ts
 * Stage 7.3 Verification: Hormone-Aware Daemon Admission
 *
 * Verifies that hormone regime affects daemon admission scores as designed:
 * 1. hormoneRegime field parsed from narrative context.
 * 2. high_entropy regime adds HORMONE_HIGH_ENTROPY_RISK (+1 score).
 * 3. aggressive_bloom + INJECT_PLASMID adds HORMONE_AGGRESSIVE_BLOOM_PLASMID (+1).
 * 4. repair_surge + DROP_PHEROMONE subtracts HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT (-1).
 * 5. dormant_baseline has no hormone effect.
 * 6. Cross-regime: normalizeDaemonNarrativeContext reads hormoneRegime from narrative.
 */

import {
  type DaemonInjectEnvelope,
  type DaemonNarrativeContext,
  evaluateInvariantAdmission,
  normalizeDaemonNarrativeContext,
} from "/Users/s0fractal/OMEGA/DAEMON_INGRESS_POLICY.ts";

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

// Baseline narrative context (all neutral)
const baseContext: DaemonNarrativeContext = {
  mood: "STABLE",
  sharedCenter: "tick.exists",
  dominantInvariantVector: "none",
  codexLineageLabel: "none",
  codexLineageGuardScore: 0,
  codexLineageGuardReasons: [],
  glyphStatus: "Glyph transport dormant.",
  glyphRegime: "dormant",
  glyphDominantRole: "none",
  glyphSourceMode: "none",
  metabolicPressure: 0,
  hormoneRegime: "dormant_baseline",
};

const baseMetrics = { population: 200, avgEnergy: 50 };

const plasmidEnvelope: DaemonInjectEnvelope = {
  action_type: "INJECT_PLASMID",
  payload: {
    target_x: 50,
    target_y: 50,
    intensity: 10,
    hex_code: "0102030405060708",
  },
};
const pheromoneEnvelope: DaemonInjectEnvelope = {
  action_type: "DROP_PHEROMONE",
  payload: { target_x: 50, target_y: 50, intensity: 10 },
};

console.log("\n💉 [HORMONE DAEMON ADMISSION CONTRACT] Starting...\n");

// ---
// Section 1: hormoneRegime field is parsed from narrative
// ---
console.log("── Section 1: hormoneRegime Normalization ──");
const parsedCtx = normalizeDaemonNarrativeContext(
  { hormoneRegime: "high_entropy", mood: "STABLE", sharedCenter: "" },
  "AABBCCDD11223344",
);
assert(
  parsedCtx.hormoneRegime === "high_entropy",
  `normalizeDaemonNarrativeContext parses hormoneRegime='high_entropy', got='${parsedCtx.hormoneRegime}'`,
);

const parsedCtxDefault = normalizeDaemonNarrativeContext(
  { mood: "STABLE" }, // no hormoneRegime
  "AABBCCDD11223344",
);
assert(
  parsedCtxDefault.hormoneRegime === "dormant_baseline",
  `hormoneRegime defaults to 'dormant_baseline' when missing, got='${parsedCtxDefault.hormoneRegime}'`,
);

// ---
// Section 2: dormant_baseline — no hormone effect
// ---
console.log("\n── Section 2: dormant_baseline Has No Hormone Effect ──");
const baseResult = evaluateInvariantAdmission(
  plasmidEnvelope,
  baseMetrics,
  baseContext,
);
const hasHormoneReason = baseResult.reasons.some((r) =>
  r.startsWith("HORMONE_")
);
assert(
  !hasHormoneReason,
  `dormant_baseline produces no HORMONE_ reason, got: ${
    JSON.stringify(baseResult.reasons)
  }`,
);

// ---
// Section 3: high_entropy adds +1 risk
// ---
console.log("\n── Section 3: high_entropy → HORMONE_HIGH_ENTROPY_RISK (+1) ──");
const highEntropyCtx: DaemonNarrativeContext = {
  ...baseContext,
  hormoneRegime: "high_entropy",
};

const entropyPlasmidResult = evaluateInvariantAdmission(
  plasmidEnvelope,
  baseMetrics,
  highEntropyCtx,
);
assert(
  entropyPlasmidResult.reasons.includes("HORMONE_HIGH_ENTROPY_RISK"),
  "INJECT_PLASMID + high_entropy includes HORMONE_HIGH_ENTROPY_RISK",
);
assert(
  entropyPlasmidResult.score > baseResult.score,
  `high_entropy raises score (base=${baseResult.score} → entropy=${entropyPlasmidResult.score})`,
);

const entropyPheromoneResult = evaluateInvariantAdmission(
  pheromoneEnvelope,
  baseMetrics,
  highEntropyCtx,
);
assert(
  entropyPheromoneResult.reasons.includes("HORMONE_HIGH_ENTROPY_RISK"),
  "DROP_PHEROMONE + high_entropy also includes HORMONE_HIGH_ENTROPY_RISK",
);

// ---
// Section 4: aggressive_bloom + INJECT_PLASMID adds +1
// ---
console.log("\n── Section 4: aggressive_bloom + INJECT_PLASMID → +1 ──");
const aggrCtx: DaemonNarrativeContext = {
  ...baseContext,
  hormoneRegime: "aggressive_bloom",
};

const aggrPlasmidResult = evaluateInvariantAdmission(
  plasmidEnvelope,
  baseMetrics,
  aggrCtx,
);
assert(
  aggrPlasmidResult.reasons.includes("HORMONE_AGGRESSIVE_BLOOM_PLASMID"),
  "INJECT_PLASMID + aggressive_bloom includes HORMONE_AGGRESSIVE_BLOOM_PLASMID",
);
assert(
  aggrPlasmidResult.score > baseResult.score,
  "aggressive_bloom raises plasmid injection score",
);

const aggrPheromoneResult = evaluateInvariantAdmission(
  pheromoneEnvelope,
  baseMetrics,
  aggrCtx,
);
assert(
  !aggrPheromoneResult.reasons.includes("HORMONE_AGGRESSIVE_BLOOM_PLASMID"),
  "DROP_PHEROMONE + aggressive_bloom does NOT trigger HORMONE_AGGRESSIVE_BLOOM_PLASMID",
);

// ---
// Section 5: repair_surge + DROP_PHEROMONE gives -1 accept
// ---
console.log(
  "\n── Section 5: repair_surge + DROP_PHEROMONE → -1 (accept bonus) ──",
);
const repairCtx: DaemonNarrativeContext = {
  ...baseContext,
  hormoneRegime: "repair_surge",
};

const basePheroResult = evaluateInvariantAdmission(
  pheromoneEnvelope,
  baseMetrics,
  baseContext,
);
const repairPheroResult = evaluateInvariantAdmission(
  pheromoneEnvelope,
  baseMetrics,
  repairCtx,
);
assert(
  repairPheroResult.reasons.includes("HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT"),
  "DROP_PHEROMONE + repair_surge includes HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT",
);
assert(
  repairPheroResult.score <= basePheroResult.score,
  `repair_surge lowers or keeps pheromone score (base=${basePheroResult.score} → repair=${repairPheroResult.score})`,
);

const repairPlasmidResult = evaluateInvariantAdmission(
  plasmidEnvelope,
  baseMetrics,
  repairCtx,
);
assert(
  !repairPlasmidResult.reasons.includes(
    "HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT",
  ),
  "INJECT_PLASMID + repair_surge does NOT trigger HORMONE_REPAIR_SURGE_PHEROMONE_ACCEPT",
);

// ---
// Summary
// ---
console.log(`\n${"─".repeat(50)}`);
console.log(
  `💉 HORMONE DAEMON ADMISSION CONTRACT: ${
    failed === 0 ? "✅ PASS" : "❌ FAIL"
  } (${passed}/${passed + failed})`,
);
if (failed > 0) {
  Deno.exit(1);
}

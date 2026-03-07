import { evaluateArchitectPlasmidPromotion } from "./ARCHITECT_PLASMID_PROMOTION.ts";

type Failure = {
  name: string;
  reason: string;
};

const failures: Failure[] = [];

const expect = (condition: boolean, name: string, reason: string) => {
  if (!condition) failures.push({ name, reason });
};

const warming = evaluateArchitectPlasmidPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 12,
  fallbackRuns: 0,
  emitBranchCount: 8,
  suppressBranchCount: 4,
  allowedArchitectPlasmids: 8,
  suppressedArchitectPlasmids: 4,
  shadowSuppressedArchitectPlasmids: 4,
  lastTick: 144,
  lastStatus: "emit",
  lastBranch: "emit",
  lastFallbackReason: "",
});
expect(
  warming.ready === false && warming.status === "warming" &&
    warming.recommendedMode === "shadow-reduce",
  "warming",
  "Insufficient shadow sample count must keep the slit in shadow mode.",
);

const fallbackHeavy = evaluateArchitectPlasmidPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 80,
  fallbackRuns: 8,
  emitBranchCount: 24,
  suppressBranchCount: 12,
  allowedArchitectPlasmids: 20,
  suppressedArchitectPlasmids: 12,
  shadowSuppressedArchitectPlasmids: 12,
  lastTick: 288,
  lastStatus: "fallback",
  lastBranch: "unknown",
  lastFallbackReason: "unsupported_architect_opcode",
});
expect(
  fallbackHeavy.ready === false &&
    fallbackHeavy.reasons.some((reason) => reason.startsWith("fallback_ratio_")),
  "fallback-heavy",
  "Excess fallback ratio must block promotion to hybrid mode.",
);

const ready = evaluateArchitectPlasmidPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 96,
  fallbackRuns: 2,
  emitBranchCount: 24,
  suppressBranchCount: 16,
  allowedArchitectPlasmids: 32,
  suppressedArchitectPlasmids: 16,
  shadowSuppressedArchitectPlasmids: 16,
  lastTick: 512,
  lastStatus: "suppress",
  lastBranch: "suppress",
  lastFallbackReason: "",
});
expect(
  ready.ready === true && ready.status === "ready" &&
    ready.recommendedMode === "hybrid-reduce",
  "ready",
  "Balanced shadow coverage with low fallback ratio must recommend hybrid-reduce.",
);

const alreadyHybrid = evaluateArchitectPlasmidPromotion({
  mode: "hybrid-reduce",
  hybridRuns: 48,
  shadowRuns: 96,
  fallbackRuns: 1,
  emitBranchCount: 28,
  suppressBranchCount: 18,
  allowedArchitectPlasmids: 38,
  suppressedArchitectPlasmids: 19,
  shadowSuppressedArchitectPlasmids: 14,
  lastTick: 640,
  lastStatus: "emit",
  lastBranch: "emit",
  lastFallbackReason: "",
});
expect(
  alreadyHybrid.ready === true &&
    alreadyHybrid.status === "already-hybrid" &&
    alreadyHybrid.recommendedMode === "hybrid-reduce",
  "already-hybrid",
  "Hybrid mode should report itself as already promoted.",
);

const legacy = evaluateArchitectPlasmidPromotion({
  mode: "legacy-execute",
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  emitBranchCount: 0,
  suppressBranchCount: 0,
  allowedArchitectPlasmids: 0,
  suppressedArchitectPlasmids: 0,
  shadowSuppressedArchitectPlasmids: 0,
  lastTick: 0,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
expect(
  legacy.ready === false &&
    legacy.status === "legacy-baseline-needed" &&
    legacy.recommendedMode === "shadow-reduce",
  "legacy",
  "Legacy mode must recommend building a shadow baseline before hybrid rollout.",
);

if (failures.length > 0) {
  console.error("[architect-plasmid-promotion] contract violated.");
  for (const failure of failures) {
    console.error(` - ${failure.name}`);
    console.error(`   reason: ${failure.reason}`);
  }
  Deno.exit(1);
}

console.log("[architect-plasmid-promotion] contract guard passed.");

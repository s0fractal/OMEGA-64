import { evaluateGuardianSignalPromotion } from "@03";

type Failure = {
  name: string;
  reason: string;
};

const failures: Failure[] = [];

const expect = (condition: boolean, name: string, reason: string) => {
  if (!condition) failures.push({ name, reason });
};

const warming = evaluateGuardianSignalPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 12,
  fallbackRuns: 0,
  stableBranchCount: 8,
  repairBranchCount: 4,
  allowedGuardianSignals: 8,
  suppressedGuardianSignals: 4,
  shadowSuppressedGuardianSignals: 4,
  lastTick: 144,
  lastStatus: "stable",
  lastBranch: "stable",
  lastFallbackReason: "",
});
expect(
  warming.ready === false && warming.status === "warming" &&
    warming.recommendedMode === "shadow-reduce",
  "warming",
  "Insufficient shadow sample count must keep the slit in shadow mode.",
);

const fallbackHeavy = evaluateGuardianSignalPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 80,
  fallbackRuns: 8,
  stableBranchCount: 24,
  repairBranchCount: 12,
  allowedGuardianSignals: 20,
  suppressedGuardianSignals: 12,
  shadowSuppressedGuardianSignals: 12,
  lastTick: 288,
  lastStatus: "fallback",
  lastBranch: "unknown",
  lastFallbackReason: "unsupported_guardian_opcode",
});
expect(
  fallbackHeavy.ready === false &&
    fallbackHeavy.reasons.some((reason) =>
      reason.startsWith("fallback_ratio_")
    ),
  "fallback-heavy",
  "Excess fallback ratio must block promotion to hybrid mode.",
);

const ready = evaluateGuardianSignalPromotion({
  mode: "shadow-reduce",
  hybridRuns: 0,
  shadowRuns: 96,
  fallbackRuns: 2,
  stableBranchCount: 24,
  repairBranchCount: 16,
  allowedGuardianSignals: 32,
  suppressedGuardianSignals: 16,
  shadowSuppressedGuardianSignals: 16,
  lastTick: 512,
  lastStatus: "repair",
  lastBranch: "repair",
  lastFallbackReason: "",
});
expect(
  ready.ready === true && ready.status === "ready" &&
    ready.recommendedMode === "hybrid-reduce",
  "ready",
  "Balanced shadow coverage with low fallback ratio must recommend hybrid-reduce.",
);

const alreadyHybrid = evaluateGuardianSignalPromotion({
  mode: "hybrid-reduce",
  hybridRuns: 48,
  shadowRuns: 96,
  fallbackRuns: 1,
  stableBranchCount: 28,
  repairBranchCount: 18,
  allowedGuardianSignals: 38,
  suppressedGuardianSignals: 19,
  shadowSuppressedGuardianSignals: 14,
  lastTick: 640,
  lastStatus: "stable",
  lastBranch: "stable",
  lastFallbackReason: "",
});
expect(
  alreadyHybrid.ready === true &&
    alreadyHybrid.status === "already-hybrid" &&
    alreadyHybrid.recommendedMode === "hybrid-reduce",
  "already-hybrid",
  "Hybrid mode should report itself as already promoted.",
);

const legacy = evaluateGuardianSignalPromotion({
  mode: "legacy-execute",
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  stableBranchCount: 0,
  repairBranchCount: 0,
  allowedGuardianSignals: 0,
  suppressedGuardianSignals: 0,
  shadowSuppressedGuardianSignals: 0,
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
  console.error("[guardian-signal-promotion] contract violated.");
  for (const failure of failures) {
    console.error(` - ${failure.name}`);
    console.error(`   reason: ${failure.reason}`);
  }
  Deno.exit(1);
}

console.log("[guardian-signal-promotion] contract guard passed.");

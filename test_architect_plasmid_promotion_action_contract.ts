import { evaluateArchitectPlasmidPromotionAction } from "./ARCHITECT_PLASMID_PROMOTION_ACTION.ts";

type Failure = {
  name: string;
  reason: string;
};

const failures: Failure[] = [];

const expect = (condition: boolean, name: string, reason: string) => {
  if (!condition) failures.push({ name, reason });
};

const promote = evaluateArchitectPlasmidPromotionAction({
  currentMode: "shadow-reduce",
  decision: {
    verdict: "promote",
    promotionReady: true,
    healthPass: true,
    recommendedMode: "hybrid-reduce",
    blockers: [],
    thresholds: { minReadyRatio: 0.5, maxFallbackRatioP95: 0.05 },
  },
});
expect(
  promote.verdict === "promote" &&
    promote.targetMode === "hybrid-reduce",
  "promote",
  "Ready shadow slit must emit a promote action toward hybrid-reduce.",
);

const hold = evaluateArchitectPlasmidPromotionAction({
  currentMode: "shadow-reduce",
  decision: {
    verdict: "hold",
    promotionReady: false,
    healthPass: true,
    recommendedMode: "shadow-reduce",
    blockers: ["promotion_latest_not_ready(warming)"],
    thresholds: { minReadyRatio: 0.5, maxFallbackRatioP95: 0.05 },
  },
});
expect(
  hold.verdict === "hold" &&
    hold.targetMode === "shadow-reduce" &&
    hold.reasons[0]?.startsWith("promotion_latest_not_ready"),
  "hold",
  "Unready shadow slit must hold and preserve its blocker trail.",
);

const demote = evaluateArchitectPlasmidPromotionAction({
  currentMode: "hybrid-reduce",
  decision: {
    verdict: "hold",
    promotionReady: false,
    healthPass: false,
    recommendedMode: "shadow-reduce",
    blockers: ["telemetry_latency_900.000_gt_700.000"],
    thresholds: { minReadyRatio: 0.5, maxFallbackRatioP95: 0.05 },
  },
});
expect(
  demote.verdict === "demote" &&
    demote.targetMode === "shadow-reduce",
  "demote",
  "Hybrid slit with failing decision must request demotion back to shadow.",
);

const hybridHold = evaluateArchitectPlasmidPromotionAction({
  currentMode: "hybrid-reduce",
  decision: {
    verdict: "promote",
    promotionReady: true,
    healthPass: true,
    recommendedMode: "hybrid-reduce",
    blockers: [],
    thresholds: { minReadyRatio: 0.5, maxFallbackRatioP95: 0.05 },
  },
});
expect(
  hybridHold.verdict === "hold" &&
    hybridHold.targetMode === "hybrid-reduce",
  "hybrid-hold",
  "Already-hybrid slit should hold when health still supports the promoted state.",
);

if (failures.length > 0) {
  console.error("[architect-plasmid-promotion-action] contract violated.");
  for (const failure of failures) {
    console.error(` - ${failure.name}`);
    console.error(`   reason: ${failure.reason}`);
  }
  Deno.exit(1);
}

console.log("[architect-plasmid-promotion-action] contract guard passed.");

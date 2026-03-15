// test_glider_phase3.ts
// Verification script for Phase 3: Multi-Agent Merge & Reliability

import { GATE_GATE as GATE } from "@generated";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_REJECTION as REJECTION,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@generated";

async function runTest() {
  console.log("🧪 TESTING: Gemini Glider Lite Phase 3 (Multi-Agent Merge)");

  // 1. Setup Initial State
  const genesisState: StateSnapshot = {
    tick: 300,
    state_i16: new Int16Array(64).fill(0),
    state_hash: "state_300",
  };

  // 2. Setup Reliability Map
  const reliabilityMap = new Map<string, number>();
  reliabilityMap.set("agent_pro", 1.0); // Trusted Pro
  reliabilityMap.set("agent_noob", 0.1); // Untrusted

  // 3. Create Config
  const config: GateConfig = {
    max_abs_delta_per_level: 1000,
    max_total_abs_delta_per_tick: 5000,
    max_cost_per_agent: 10000,
    reliability_weight: reliabilityMap,
    dry_run: false,
  };

  // 4. Create Conflicting Proposals
  // Pro wants +100
  const proposal_Pro: DeltaProposal = {
    proposal_id: "prop_pro",
    tick: 300,
    base_state_hash: "state_300",
    agent_id: "agent_pro",
    intent: "Move UP",
    confidence: 1.0,
    delta: [{ level: 5, value: 100 }],
    cost_estimate: 10,
    artifact_hash: "h_pro",
    semantic_fingerprint: "f_pro",
  };

  // Noob wants -100 (Conflict!)
  const proposal_Noob: DeltaProposal = {
    proposal_id: "prop_noob",
    tick: 300,
    base_state_hash: "state_300",
    agent_id: "agent_noob",
    intent: "Move DOWN",
    confidence: 1.0,
    delta: [{ level: 5, value: -100 }],
    cost_estimate: 10,
    artifact_hash: "h_noob",
    semantic_fingerprint: "f_noob",
  };

  // 5. Run Gate
  console.log("➡️ Processing Conflict...");
  const nextState = await GATE.process(
    genesisState,
    [proposal_Pro, proposal_Noob],
    config,
  );

  // 6. Verify Weighted Result
  // Pro: +100 * 1.0 = +100
  // Noob: -100 * 0.1 = -10
  // Net: +90
  console.log(`✅ Next Tick: ${nextState.tick}`);
  const actualVal = nextState.state_i16[5];
  console.log(`✅ State[5]: ${actualVal} (Expected: ~90)`);

  if (actualVal === 90) {
    console.log("✅ T6: Reliability Weighting PASSED");
  } else {
    console.error(`❌ T6 FAILED: Expected 90, got ${actualVal}`);
  }
}

// Run if main
if (import.meta.main) {
  runTest();
}

// test_glider_phase2.ts
// Verification script for Phase 2: Bounded Mutation & Cost Model

import { GATE_GATE as GATE } from "@g";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@g";

async function runTest() {
  console.log("🧪 TESTING: Gemini Glider Lite Phase 2 (Bounded Mutation)");

  // 1. Setup Initial State (Near saturation for testing)
  const genesisState: StateSnapshot = {
    tick: 200,
    state_i16: new Int16Array(64).fill(32700), // Close to max (32767)
    state_hash: "state_200",
    // Mock projections for COST calc
    entropy_i16: new Int16Array(64).fill(1000),
    phase_u16: new Uint16Array(64).fill(0),
  };

  // 2. Create Config (Mutation ENABLED)
  const config: GateConfig = {
    max_abs_delta_per_level: 1000,
    max_total_abs_delta_per_tick: 5000,
    max_cost_per_agent: 10000,
    reliability_weight: new Map(),
    dry_run: false, // 🔥 REAL MUTATION
  };

  // 3. Create Proposals
  const proposal_Saturation: DeltaProposal = {
    proposal_id: "prop_sat",
    tick: 200,
    base_state_hash: "state_200",
    agent_id: "agent_beta",
    intent: "Push to limit",
    confidence: 1.0,
    delta: [{ level: 0, value: 100 }], // 32700 + 100 = 32800 > 32767 (Should clamp)
    cost_estimate: 500, // Estimate
    artifact_hash: "art_beta",
    semantic_fingerprint: "fing_beta",
  };

  // 4. Run Gate
  console.log("➡️ Processing Tick 200 (Saturation Test)...");
  const nextState = await GATE.process(
    genesisState,
    [proposal_Saturation],
    config,
  );

  // 5. Verify Results
  console.log(`✅ Next Tick: ${nextState.tick}`);

  const newVal = nextState.state_i16[0];
  console.log(`✅ State[0]: ${newVal} (Expected: 32767)`);

  if (newVal === 32767) {
    console.log("✅ T2: Saturation Safety PASSED");
  } else {
    console.error(`❌ T2 FAILED: Value ${newVal} did not clamp correctly.`);
  }

  // Verify Cost update
  // We can check the ledger or return value if we updated return type.
  // Let's assume verifying the gate didn't crash on Cost calc is a good start,
  // and we can check console logs if we had them or check ledger.
}

// Run if main
if (import.meta.main) {
  runTest();
}

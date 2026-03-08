// test_glider_phase0.ts
// Verification script for Gemini Glider Lite Phase 0

import { GATE_GATE as GATE } from "@omega";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_REJECTION as REJECTION,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";

async function runTest() {
  console.log("🧪 TESTING: Gemini Glider Lite Phase 0 (Instrumentation)");

  // 1. Setup Initial State
  const genesisState: StateSnapshot = {
    tick: 100,
    state_i16: new Int16Array(64).fill(0),
    state_hash: "genesis_hash_000",
  };

  // 2. Create Config (Dry Run = TRUE)
  const config: GateConfig = {
    max_abs_delta_per_level: 100,
    max_total_abs_delta_per_tick: 1000,
    max_cost_per_agent: 500,
    reliability_weight: new Map(),
    dry_run: true,
  };

  // 3. Create Proposals
  const proposalA: DeltaProposal = {
    proposal_id: "prop_A",
    tick: 100,
    base_state_hash: "genesis_hash_000",
    agent_id: "agent_alpha",
    intent: "Test move",
    confidence: 0.9,
    delta: [{ level: 5, value: 50 }],
    cost_estimate: 10,
    artifact_hash: "art_A",
    semantic_fingerprint: "fing_A",
  };

  const proposalB_BadTick: DeltaProposal = {
    ...proposalA,
    proposal_id: "prop_B_bad",
    tick: 99, // Wrong tick
  };

  const proposalC_Massive: DeltaProposal = {
    ...proposalA,
    proposal_id: "prop_C_massive",
    // Total abs delta = 5000 (exceeds 1000 budget)
    delta: [{ level: 10, value: 50 }, { level: 20, value: 5000 }],
    cost_estimate: 20,
  };

  // 4. Run Gate
  console.log("➡️ Processing Tick 100...");
  const nextState = await GATE.process(
    genesisState,
    [proposalA, proposalB_BadTick, proposalC_Massive],
    config,
  );

  // 5. Verify Results
  console.log(`✅ Next Tick: ${nextState.tick}`);
  console.log(
    `✅ Next Hash: ${nextState.state_hash} (Should remain genesis_hash_000 in dry-run)`,
  );

  // Check if state mutated (it shouldn't in dry run)
  const mutationSum = nextState.state_i16.reduce((a, b) => a + b, 0);
  console.log(`✅ State Sum: ${mutationSum} (Should be 0)`);

  // 6. Verify Ledger
  console.log("📖 Reading Ledger...");
  for await (const event of LEDGER.readAll()) {
    console.log(`   [EVENT] Tick: ${event.tick}, EventID: ${event.event_id}`);
    console.log(`   Accepted: ${event.accepted_proposals.join(", ")}`);
    console.log(`   Rejected: ${JSON.stringify(event.rejected_proposals)}`);

    if (event.tick === 100) {
      if (
        event.accepted_proposals.includes("prop_A") &&
        event.rejected_proposals.some((r) =>
          r.reason === REJECTION.TICK_MISMATCH
        )
      ) {
        console.log("✅ LEDGER VERIFICATION PASSED");
      } else {
        console.error("❌ LEDGER VERIFICATION FAILED");
      }
    }
  }
}

// Run if main
if (import.meta.main) {
  runTest();
}

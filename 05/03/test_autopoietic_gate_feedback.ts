// OMEGA-64 | test_autopoietic_gate_feedback.ts | Stage 25: Sovereign Feedback Verification
import { STATE_MATRIX } from "@00";
import { QuorumAdvocate } from "@07/02/relics/QUORUM_ADVOCATE.ts";
import { mergeGateProposals } from "@03";
import { syncHormonesToLattice } from "@02";
import { LOGGER } from "@00";
import { type DeltaProposal, type GateConfig, type GateDecision, type StateSnapshot } from "@00";

async function runTest() {
  LOGGER.info(
    "🧪 [TEST] Starting Sovereign Feedback (Stage 25) Verification...",
  );

  const qa = new QuorumAdvocate();

  // --- 1. Test Hormone Lattice Signaling ---
  LOGGER.info("Step 1: Testing Hormone Lattice alignment...");
  const syntropy = 0.85; // High organization

  syncHormonesToLattice({
    baseTax: 1000,
    targetEnergy: 5000,
    workerCount: 8,
    egoPressure: 10,
    fearPressure: 5,
    noveltyPressure: 20,
    symbiosisPressure: 100,
    maxPlasmidCharge: 1000,
    pressureRingScale: 1.0,
    homeostasisBand: 500,
    homeostasisMaxDelta: 50,
    homeostasisOverflowThreshold: 0.1,
    daemonMaxActions: 100,
    federationDegradeEnergyRatio: 0.5,
    globalSyntropy: syntropy, // New field
  });

  const value = STATE_MATRIX.getHormone(6);
  LOGGER.info(`📡 Hormone 6 (global_consensus) value: ${value}`);
  if (value > 800) {
    LOGGER.info("✅ Syntropy successfully synced to hormone lattice.");
  } else {
    LOGGER.error("❌ Hormone sync failed or value is incorrect.");
  }

  // --- 2. Test Gate Cost Discounting ---
  LOGGER.info("Step 2: Testing Gate Cost Discounting...");

  const mockState: StateSnapshot = {
    tick: 1,
    state_i16: new Int16Array(100),
    state_hash: "mock",
  };

  const mockProposal: DeltaProposal = {
    proposal_id: "prop_123",
    tick: 1,
    base_state_hash: "mock",
    agent_id: "test_atom",
    confidence: 1.0,
    delta: [{ level: 0, value: 10 }],
    cost_estimate: 1000,
    origin_atom_idx: 42,
    causal_refs: [],
    quorum_strength: 0.9, // High local quorum
  };

  const mockConfig: GateConfig = {
    dry_run: false,
    max_abs_delta_per_level: 100,
    max_total_abs_delta_per_tick: 1000,
    max_cost_per_agent: 5000,
    reliability_weight: new Map(),
    global_syntropy: syntropy, // System-wide organization
  };

  const decision: GateDecision = {
    accepted_proposals: [],
    rejected_proposals: [],
    budget_used: 0,
    cost_used: 0,
    accepted_delta: [],
  };

  // Set atom resonance
  STATE_MATRIX.setResonance(42, 20000); // 200.0 resonance (high)

  const { acceptedProposalMetrics } = mergeGateProposals(
    mockState,
    [mockProposal],
    mockConfig,
    decision,
    { span: 32767, max: 32767 },
  );

  const appliedCost = acceptedProposalMetrics[0]?.physical_cost ?? 1000;
  LOGGER.info(`💸 Original Cost: 1000, Applied Cost: ${appliedCost}`);

  if (appliedCost < 700) {
    LOGGER.info("✅ Sovereing Discount successfully applied in GATE.");
  } else {
    LOGGER.error(`❌ Sovereing Discount failed. Applied cost: ${appliedCost}`);
  }

  LOGGER.info(
    "✅ Sovereign Feedback (Stage 25) Verification Script Completed.",
  );
}

if (import.meta.main) {
  runTest().catch(console.error);
}

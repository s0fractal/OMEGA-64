// test_gate_admission_report.ts
// Verifies aggregation of accepted_proposal_metrics from ledger events.

import { GATE_GATE as GATE } from "@omega";
import { GATE_ADMISSION_REPORT_GATE_ADMISSION_REPORT as GATE_ADMISSION_REPORT } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import { PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX } from "@omega";
import type {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@omega";

const config = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([
    ["agent_a", 1.0],
    ["agent_b", 1.0],
  ]),
  reliability_mode: "PHASE_COHERENCE",
  reliability_floor: 0,
  dry_run: false,
});

const proposal = (
  proposal_id: string,
  tick: number,
  base_state_hash: string,
  agent_id: string,
  agent_phase_u16: number,
  value: number,
): DeltaProposal => ({
  proposal_id,
  tick,
  base_state_hash,
  agent_id,
  agent_phase_u16,
  intent: "admission-report",
  confidence: 1,
  delta: [{ level: 5, value }],
  cost_estimate: 500,
  artifact_hash: `artifact_${proposal_id}`,
  semantic_fingerprint: `sem_${proposal_id}`,
});

Deno.test("gate admission report aggregates coherence and weight metrics", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-admission-report-",
    suffix: ".jsonl",
  });
  const indexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(tempPath);
  LEDGER.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
  await Deno.writeTextFile(tempPath, "");

  try {
    const state0: StateSnapshot = {
      tick: 1,
      state_hash: "state_1",
      state_i16: new Int16Array(64).fill(0),
      phase_u16: new Uint16Array(64).fill(0),
      entropy_i16: new Int16Array(64).fill(0),
    };

    const state1 = await GATE.process(
      state0,
      [
        proposal("p1_a", 1, "state_1", "agent_a", 0, 100),
        proposal("p1_b", 1, "state_1", "agent_b", 32768, 100),
      ],
      config(),
    );
    const state2 = await GATE.process(
      {
        ...state0,
        tick: 2,
        state_hash: state1.state_hash,
        state_i16: state1.state_i16,
      },
      [
        proposal("p2_b", 2, state1.state_hash, "agent_b", 0, 50),
      ],
      config(),
    );
    if (state2.state_i16[5] <= state1.state_i16[5]) {
      throw new Error("expected second tick mutation to apply");
    }

    const report = await GATE_ADMISSION_REPORT.generate({
      startTick: 1,
      endTick: 2,
      topAgents: 2,
    });

    if (!report.ok) {
      throw new Error(
        `expected ok report, failures: ${report.failures.join(",")}`,
      );
    }
    if (report.eventsAnalyzed !== 2 || report.eventsWithMetrics !== 2) {
      throw new Error(
        `unexpected events analyzed: ${report.eventsAnalyzed}/${report.eventsWithMetrics}`,
      );
    }
    if (report.proposalsAnalyzed !== 3) {
      throw new Error(
        `expected 3 proposals analyzed, got ${report.proposalsAnalyzed}`,
      );
    }
    if (report.coherenceCoverage !== 1) {
      throw new Error(
        `expected full coherence coverage, got ${report.coherenceCoverage}`,
      );
    }
    if ((report.outOfPhasePressureMean ?? 0) <= 0) {
      throw new Error("expected positive out-of-phase pressure");
    }
    if (report.topAgents.length !== 2) {
      throw new Error(
        `expected two top agents, got ${report.topAgents.length}`,
      );
    }
    if (report.topAgents[0].agent_id !== "agent_b") {
      throw new Error(
        `expected agent_b first by proposal count, got ${
          report.topAgents[0].agent_id
        }`,
      );
    }
    if (report.timeline.length !== 2) {
      throw new Error(
        `expected timeline length 2, got ${report.timeline.length}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
    try {
      await Deno.remove(tempPath);
    } catch {
      // ignore
    }
    try {
      await Deno.remove(indexPath);
    } catch {
      // ignore
    }
  }
});

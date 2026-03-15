// test_replay_gate_admission_threshold.ts
// Ensures crystallization can be gated by gate-admission pressure metrics.

import { GATE_PIPELINE_GATE_PIPELINE as GATE_PIPELINE } from "@generated";
import { CRYSTALLIZATION_CRYSTALLIZATION as CRYSTALLIZATION } from "@generated";
import { CRYSTALLIZATION_REPORT_CRYSTALLIZATION_REPORT as CRYSTALLIZATION_REPORT } from "@generated";
import { GATE_ADMISSION_REPORT_GATE_ADMISSION_REPORT as GATE_ADMISSION_REPORT } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import type {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@generated";

const processLocal = async (
  state: StateSnapshot,
  proposals: DeltaProposal[],
  config: GateConfig,
): Promise<StateSnapshot> =>
  (await GATE_PIPELINE.processWithInvariantContext(state, proposals, config))
    .nextState;

Deno.test("crystallization rejects when gate admission pressure exceeds threshold", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-replay-gate-admission-",
    suffix: ".jsonl",
  });
  const originalReportDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const originalReportIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const tempReportDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-gate-admission-",
  });
  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempReportDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempReportDir}/index.jsonl`;
  const originalGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const originalGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-report-",
  });
  GATE_ADMISSION_REPORT.STORAGE_DIR = tempGateAdmissionDir;
  GATE_ADMISSION_REPORT.INDEX_PATH = `${tempGateAdmissionDir}/index.jsonl`;
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const genesisState: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
      phase_u16: new Uint16Array(64).fill(0),
      entropy_i16: new Int16Array(64).fill(0),
    };

    const config: GateConfig = {
      max_abs_delta_per_level: 1000,
      max_total_abs_delta_per_tick: 5000,
      max_cost_per_agent: 10000,
      reliability_weight: new Map([["agent_sync", 1.0]]),
      reliability_mode: "PHASE_COHERENCE",
      reliability_floor: 0,
      dry_run: false,
    };

    const p1: DeltaProposal = {
      proposal_id: "p1",
      tick: 1,
      base_state_hash: "state_1",
      agent_id: "agent_sync",
      agent_phase_u16: 32768, // opposite phase
      intent: "seed",
      confidence: 1,
      delta: [{ level: 0, value: 6 }],
      cost_estimate: 100,
      artifact_hash: "a1",
      semantic_fingerprint: "s1",
    };
    const s2 = await processLocal(genesisState, [p1], config);

    const p2: DeltaProposal = {
      proposal_id: "p2",
      tick: 2,
      base_state_hash: s2.state_hash,
      agent_id: "agent_sync",
      agent_phase_u16: 32768, // opposite phase
      intent: "stabilize",
      confidence: 1,
      delta: [{ level: 0, value: -2 }],
      cost_estimate: 100,
      artifact_hash: "a1",
      semantic_fingerprint: "s1",
    };
    const s3 = await processLocal(s2, [p2], config);

    const {
      crystallized,
      audit,
      projectionDriftGatePass,
      gateAdmissionReport,
      gateAdmissionGatePass,
    } = await CRYSTALLIZATION.evaluateWithAudit(
      2,
      "artifact_demo",
      s3.state_hash,
      {
        tick: 1,
        state_i16: genesisState.state_i16,
        state_hash: "state_1",
      },
      {
        requiredWindows: 1,
        windowSize: 2,
        replayRuns: 1,
        gateAdmissionMinCoherenceCoverage: 1.0,
        gateAdmissionOutOfPhasePressureMaxMean: 0.1,
      },
    );

    if (!audit.replayGreen) {
      throw new Error(
        `replay should remain green: ${audit.failures.join(",")}`,
      );
    }
    if (!projectionDriftGatePass) {
      throw new Error("projection drift gate should pass in this scenario");
    }
    if ((gateAdmissionReport.outOfPhasePressureMean ?? 0) < 0.9) {
      throw new Error(
        `expected high out-of-phase pressure, got ${gateAdmissionReport.outOfPhasePressureMean}`,
      );
    }
    if (gateAdmissionReport.coherenceCoverage < 1) {
      throw new Error(
        `expected full coherence coverage, got ${gateAdmissionReport.coherenceCoverage}`,
      );
    }
    if (gateAdmissionGatePass) {
      throw new Error("gate admission threshold gate should fail");
    }
    if (crystallized) {
      throw new Error(
        "crystallization must be rejected when gate admission gate fails",
      );
    }
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup
    }
    try {
      await Deno.remove(tempReportDir, { recursive: true });
    } catch {
      // ignore cleanup
    }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch {
      // ignore cleanup
    }
    CRYSTALLIZATION_REPORT.STORAGE_DIR = originalReportDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = originalReportIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = originalGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = originalGateAdmissionIndex;
    LEDGER.STORAGE_PATH = originalPath;
  }
});

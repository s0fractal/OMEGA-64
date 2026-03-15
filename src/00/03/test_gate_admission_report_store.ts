// test_gate_admission_report_store.ts
// Verifies content-addressed materialization and index-chain integrity for gate admission reports.

import {
  GATE_ADMISSION_REPORT_GATE_ADMISSION_REPORT as GATE_ADMISSION_REPORT,
  type GATE_ADMISSION_REPORT_GateAdmissionReport as GateAdmissionReport,
} from "@generated";

const mkReport = (): GateAdmissionReport => ({
  version: GATE_ADMISSION_REPORT.VERSION,
  ok: true,
  startTick: 1,
  endTick: 5,
  eventsAnalyzed: 5,
  eventsWithMetrics: 5,
  proposalsAnalyzed: 12,
  coherenceCoverage: 1,
  weightMean: 0.42,
  weightP95: 0.9,
  reliabilityEffectiveMean: 0.7,
  phaseCoherenceMean: 0.8,
  phaseCoherenceP95: 0.95,
  outOfPhasePressureMean: 0.2,
  topAgents: [{
    agent_id: "agent_a",
    proposals: 7,
    mean_weight: 0.5,
    p95_weight: 0.95,
    mean_reliability_effective: 0.75,
    mean_phase_coherence: 0.8,
    mean_physical_cost: 12,
  }],
  timeline: [{
    tick: 1,
    proposals: 2,
    mean_weight: 0.4,
    mean_reliability_effective: 0.7,
    mean_phase_coherence: 0.8,
    mean_physical_cost: 10,
  }],
  failures: [],
});

Deno.test("gate admission report materialization is idempotent by hash", async () => {
  const originalDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const originalIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-store-",
  });
  GATE_ADMISSION_REPORT.STORAGE_DIR = tempDir;
  GATE_ADMISSION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    const report = mkReport();
    const reportHash = await GATE_ADMISSION_REPORT.hash(report);
    const first = await GATE_ADMISSION_REPORT.materialize(report, reportHash, {
      tick_anchor: 5,
    });
    const second = await GATE_ADMISSION_REPORT.materialize(report, reportHash, {
      tick_anchor: 5,
    });

    if (!first.created) {
      throw new Error("first materialize should create new file");
    }
    if (second.created) {
      throw new Error("second materialize should reuse existing file");
    }
    if (first.path !== second.path) {
      throw new Error("materialized path must remain stable for same hash");
    }

    const indexRaw = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
    const indexLines = indexRaw.split("\n").filter((x) => x.trim().length > 0);
    if (indexLines.length !== 1) {
      throw new Error(
        `expected exactly 1 index record, got ${indexLines.length}`,
      );
    }

    const chain = await GATE_ADMISSION_REPORT.verifyIndexChain(true);
    if (!chain.ok) {
      throw new Error(
        `index chain should be valid: ${chain.failures.join(",")}`,
      );
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // ignore
    }
    GATE_ADMISSION_REPORT.STORAGE_DIR = originalDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = originalIndex;
  }
});

Deno.test("gate admission report index chain detects tamper", async () => {
  const originalDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const originalIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-store-tamper-",
  });
  GATE_ADMISSION_REPORT.STORAGE_DIR = tempDir;
  GATE_ADMISSION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    const report = mkReport();
    const reportHash = await GATE_ADMISSION_REPORT.hash(report);
    await GATE_ADMISSION_REPORT.materialize(report, reportHash, {
      tick_anchor: 5,
    });

    const indexRaw = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
    const lines = indexRaw.split("\n").filter((x) => x.trim().length > 0);
    const rec = JSON.parse(lines[0]);
    rec.record_hash = "f".repeat(64);
    await Deno.writeTextFile(
      GATE_ADMISSION_REPORT.INDEX_PATH,
      JSON.stringify(rec) + "\n",
    );

    const chain = await GATE_ADMISSION_REPORT.verifyIndexChain(true);
    if (chain.ok) {
      throw new Error("index chain should fail after tamper");
    }
    if (!chain.failures.some((x) => x.includes("INDEX_RECORD_HASH_MISMATCH"))) {
      throw new Error(`unexpected failures: ${chain.failures.join(",")}`);
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // ignore
    }
    GATE_ADMISSION_REPORT.STORAGE_DIR = originalDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = originalIndex;
  }
});

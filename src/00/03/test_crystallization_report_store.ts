// test_crystallization_report_store.ts
// Verifies content-addressed materialization for crystallization reports.

import { CRYSTALLIZATION_REPORT_CRYSTALLIZATION_REPORT as CRYSTALLIZATION_REPORT } from "@generated";
import {
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY,
} from "@generated";

Deno.test("crystallization report materialization is idempotent by hash", async () => {
  const originalDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const originalIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({ prefix: "omega-cr-report-store-" });
  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    const report = {
      version: CRYSTALLIZATION_REPORT.VERSION,
      artifact_hash: "a".repeat(64),
      state_hash: "b".repeat(64),
      current_tick: 10,
      replay_start_tick: 1,
      replay_end_tick: 10,
      policy: {
        version: CRYSTALLIZATION_CONFIG.policyVersion,
        hash: policyHash,
      },
      thresholds: {
        window: CRYSTALLIZATION_CONFIG.window,
        min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
        default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
        projection_drift_max_p95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95,
        projection_drift_slope_max_p95:
          CRYSTALLIZATION_CONFIG.projectionDriftSlopeMaxP95,
      },
      verification_summary: {
        replay_green: true,
        projection_checks: 0,
        policy_checks: 0,
        canon_report_checks: 0,
        gate_admission_report_checks: 0,
        canon_index_chain_checked: false,
        canon_index_chain_ok: true,
        gate_admission_index_chain_checked: false,
        gate_admission_index_chain_ok: true,
      },
      replay_audit: {
        replayGreen: true,
        runs: 1,
        checkedEvents: 0,
        skippedEvents: 0,
        checkedProjectionEvents: 0,
        skippedProjectionEvents: 0,
        projectionTickReport: [],
        checkedPolicyEvents: 0,
        skippedPolicyEvents: 0,
        policyTickReport: [],
        checkedCanonReports: 0,
        skippedCanonReports: 0,
        canonReportTickReport: [],
        checkedGateAdmissionReports: 0,
        skippedGateAdmissionReports: 0,
        gateAdmissionReportTickReport: [],
        invariantReport: {
          index_chain_checked: false,
          index_chain_ok: true,
          index_chain_checked_records: 0,
          index_chain_failures: [],
          gate_admission_index_chain_checked: false,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 0,
          gate_admission_index_chain_failures: [],
        },
        finalHashes: [],
        failures: [],
      },
      projection_report: {
        ok: true,
        totalTicks: 0,
        passCount: 0,
        failCount: 0,
        skipCount: 0,
        ticks: [],
        failures: [],
      },
      drift_report: {
        ok: true,
        eventsAnalyzed: 0,
        levelCount: 64,
        driftByLevelMean: [],
        driftByLevelP95: [],
        driftSlopeByLevelMean: [],
        driftSlopeByLevelP95: [],
        topHotLevels: [],
        timeline: [],
        replayAudit: {
          replayGreen: true,
          checkedEvents: 0,
          checkedProjectionEvents: 0,
        },
        failures: [],
      },
      projection_drift_gate_pass: true,
    };

    const reportHash = await CRYSTALLIZATION_REPORT.hash(report);
    const first = await CRYSTALLIZATION_REPORT.materialize(report, reportHash, {
      tick: 10,
      artifact_hash: report.artifact_hash,
      state_hash: report.state_hash,
    });
    const second = await CRYSTALLIZATION_REPORT.materialize(
      report,
      reportHash,
      {
        tick: 10,
        artifact_hash: report.artifact_hash,
        state_hash: report.state_hash,
      },
    );

    if (!first.created) {
      throw new Error("first materialize should create new file");
    }
    if (second.created) {
      throw new Error("second materialize should reuse existing file");
    }
    if (first.path !== second.path) {
      throw new Error("materialized path must remain stable for same hash");
    }

    const indexRaw = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
    const indexLines = indexRaw.split("\n").filter((x) => x.trim().length > 0);
    if (indexLines.length !== 1) {
      throw new Error(
        `expected exactly 1 index record, got ${indexLines.length}`,
      );
    }
    const chain = await CRYSTALLIZATION_REPORT.verifyIndexChain(true);
    if (!chain.ok) {
      throw new Error(
        `index chain should be valid: ${chain.failures.join(",")}`,
      );
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // ignore cleanup
    }
    CRYSTALLIZATION_REPORT.STORAGE_DIR = originalDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = originalIndex;
  }
});

Deno.test("crystallization report index chain detects tamper", async () => {
  const originalDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const originalIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-cr-report-store-tamper-",
  });
  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    const report = {
      version: CRYSTALLIZATION_REPORT.VERSION,
      artifact_hash: "c".repeat(64),
      state_hash: "d".repeat(64),
      current_tick: 20,
      replay_start_tick: 1,
      replay_end_tick: 20,
      policy: {
        version: CRYSTALLIZATION_CONFIG.policyVersion,
        hash: policyHash,
      },
      thresholds: {
        window: CRYSTALLIZATION_CONFIG.window,
        min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
        default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
        projection_drift_max_p95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95,
        projection_drift_slope_max_p95:
          CRYSTALLIZATION_CONFIG.projectionDriftSlopeMaxP95,
      },
      verification_summary: {
        replay_green: true,
        projection_checks: 0,
        policy_checks: 0,
        canon_report_checks: 0,
        gate_admission_report_checks: 0,
        canon_index_chain_checked: false,
        canon_index_chain_ok: true,
        gate_admission_index_chain_checked: false,
        gate_admission_index_chain_ok: true,
      },
      replay_audit: {
        replayGreen: true,
        runs: 1,
        checkedEvents: 0,
        skippedEvents: 0,
        checkedProjectionEvents: 0,
        skippedProjectionEvents: 0,
        projectionTickReport: [],
        checkedPolicyEvents: 0,
        skippedPolicyEvents: 0,
        policyTickReport: [],
        checkedCanonReports: 0,
        skippedCanonReports: 0,
        canonReportTickReport: [],
        checkedGateAdmissionReports: 0,
        skippedGateAdmissionReports: 0,
        gateAdmissionReportTickReport: [],
        invariantReport: {
          index_chain_checked: false,
          index_chain_ok: true,
          index_chain_checked_records: 0,
          index_chain_failures: [],
          gate_admission_index_chain_checked: false,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 0,
          gate_admission_index_chain_failures: [],
        },
        finalHashes: [],
        failures: [],
      },
      projection_report: {
        ok: true,
        totalTicks: 0,
        passCount: 0,
        failCount: 0,
        skipCount: 0,
        ticks: [],
        failures: [],
      },
      drift_report: {
        ok: true,
        eventsAnalyzed: 0,
        levelCount: 64,
        driftByLevelMean: [],
        driftByLevelP95: [],
        driftSlopeByLevelMean: [],
        driftSlopeByLevelP95: [],
        topHotLevels: [],
        timeline: [],
        replayAudit: {
          replayGreen: true,
          checkedEvents: 0,
          checkedProjectionEvents: 0,
        },
        failures: [],
      },
      projection_drift_gate_pass: true,
    };

    const reportHash = await CRYSTALLIZATION_REPORT.hash(report);
    await CRYSTALLIZATION_REPORT.materialize(report, reportHash, {
      tick: 20,
      artifact_hash: report.artifact_hash,
      state_hash: report.state_hash,
    });

    const indexRaw = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
    const lines = indexRaw.split("\n").filter((x) => x.trim().length > 0);
    const rec = JSON.parse(lines[0]);
    rec.record_hash = "f".repeat(64);
    await Deno.writeTextFile(
      CRYSTALLIZATION_REPORT.INDEX_PATH,
      JSON.stringify(rec) + "\n",
    );

    const chain = await CRYSTALLIZATION_REPORT.verifyIndexChain(true);
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
      // ignore cleanup
    }
    CRYSTALLIZATION_REPORT.STORAGE_DIR = originalDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = originalIndex;
  }
});

Deno.test("crystallization report index chain rejects malformed lines", async () => {
  const originalDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const originalIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-cr-report-store-malformed-",
  });
  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    await Deno.writeTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH, "{not-json}\n");
    const chain = await CRYSTALLIZATION_REPORT.verifyIndexChain(false);
    if (chain.ok) {
      throw new Error("index chain should fail on malformed line");
    }
    if (!chain.failures.some((x) => x.includes("INDEX_LINE_PARSE_FAIL"))) {
      throw new Error(`unexpected failures: ${chain.failures.join(",")}`);
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // ignore cleanup
    }
    CRYSTALLIZATION_REPORT.STORAGE_DIR = originalDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = originalIndex;
  }
});

Deno.test("crystallization report index chain enforces monotonic tick causality", async () => {
  const originalDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const originalIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-cr-report-store-causality-",
  });
  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempDir}/index.jsonl`;

  try {
    const policyHash = await CRYSTALLIZATION_POLICY.hash();
    const mkReport = (tick: number, suffix: string) => ({
      version: CRYSTALLIZATION_REPORT.VERSION,
      artifact_hash: suffix.repeat(64),
      state_hash: suffix.repeat(64),
      current_tick: tick,
      replay_start_tick: 1,
      replay_end_tick: tick,
      policy: {
        version: CRYSTALLIZATION_CONFIG.policyVersion,
        hash: policyHash,
      },
      thresholds: {
        window: CRYSTALLIZATION_CONFIG.window,
        min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
        default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
        projection_drift_max_p95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95,
        projection_drift_slope_max_p95:
          CRYSTALLIZATION_CONFIG.projectionDriftSlopeMaxP95,
      },
      verification_summary: {
        replay_green: true,
        projection_checks: 0,
        policy_checks: 0,
        canon_report_checks: 0,
        gate_admission_report_checks: 0,
        canon_index_chain_checked: false,
        canon_index_chain_ok: true,
        gate_admission_index_chain_checked: false,
        gate_admission_index_chain_ok: true,
      },
      replay_audit: {
        replayGreen: true,
        runs: 1,
        checkedEvents: 0,
        skippedEvents: 0,
        checkedProjectionEvents: 0,
        skippedProjectionEvents: 0,
        projectionTickReport: [],
        checkedPolicyEvents: 0,
        skippedPolicyEvents: 0,
        policyTickReport: [],
        checkedCanonReports: 0,
        skippedCanonReports: 0,
        canonReportTickReport: [],
        checkedGateAdmissionReports: 0,
        skippedGateAdmissionReports: 0,
        gateAdmissionReportTickReport: [],
        invariantReport: {
          index_chain_checked: false,
          index_chain_ok: true,
          index_chain_checked_records: 0,
          index_chain_failures: [],
          gate_admission_index_chain_checked: false,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 0,
          gate_admission_index_chain_failures: [],
        },
        finalHashes: [],
        failures: [],
      },
      projection_report: {
        ok: true,
        totalTicks: 0,
        passCount: 0,
        failCount: 0,
        skipCount: 0,
        ticks: [],
        failures: [],
      },
      drift_report: {
        ok: true,
        eventsAnalyzed: 0,
        levelCount: 64,
        driftByLevelMean: [],
        driftByLevelP95: [],
        driftSlopeByLevelMean: [],
        driftSlopeByLevelP95: [],
        topHotLevels: [],
        timeline: [],
        replayAudit: {
          replayGreen: true,
          checkedEvents: 0,
          checkedProjectionEvents: 0,
        },
        failures: [],
      },
      projection_drift_gate_pass: true,
    });

    const reportA = mkReport(10, "a");
    const hashA = await CRYSTALLIZATION_REPORT.hash(reportA);
    await CRYSTALLIZATION_REPORT.materialize(reportA, hashA, {
      tick: 10,
      artifact_hash: reportA.artifact_hash,
      state_hash: reportA.state_hash,
    });

    const reportB = mkReport(11, "b");
    const hashB = await CRYSTALLIZATION_REPORT.hash(reportB);
    await CRYSTALLIZATION_REPORT.materialize(reportB, hashB, {
      tick: 11,
      artifact_hash: reportB.artifact_hash,
      state_hash: reportB.state_hash,
    });

    const raw = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length !== 2) {
      throw new Error(`expected 2 index records, got ${lines.length}`);
    }
    const first = JSON.parse(lines[0]);
    const second = JSON.parse(lines[1]);
    second.tick = 9;
    second.record_hash = await CRYSTALLIZATION_REPORT.indexRecordHash({
      report_hash: second.report_hash,
      report_version: second.report_version,
      report_path: second.report_path,
      tick: second.tick,
      artifact_hash: second.artifact_hash,
      state_hash: second.state_hash,
      ts_unix_ms: second.ts_unix_ms,
      prev_record_hash: second.prev_record_hash,
      witness: second.witness,
    });
    await Deno.writeTextFile(
      CRYSTALLIZATION_REPORT.INDEX_PATH,
      `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`,
    );

    const chain = await CRYSTALLIZATION_REPORT.verifyIndexChain(true);
    if (chain.ok) {
      throw new Error("index chain should fail on non-monotonic tick");
    }
    if (!chain.failures.some((x) => x.includes("INDEX_TICK_NON_MONOTONIC"))) {
      throw new Error(`unexpected failures: ${chain.failures.join(",")}`);
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // ignore cleanup
    }
    CRYSTALLIZATION_REPORT.STORAGE_DIR = originalDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = originalIndex;
  }
});

// test_replay_canon_report_verification.ts
// Verifies replay-time validation of canonization report hash/uri.

import { GATE_PIPELINE_GATE_PIPELINE as GATE_PIPELINE } from "@omega";
import { CRYSTALLIZATION_CRYSTALLIZATION as CRYSTALLIZATION } from "@omega";
import { CRYSTALLIZATION_REPORT_CRYSTALLIZATION_REPORT as CRYSTALLIZATION_REPORT } from "@omega";
import { GATE_ADMISSION_REPORT_GATE_ADMISSION_REPORT as GATE_ADMISSION_REPORT } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import { REPLAY_AUDIT__08_00_REPLAY_AUDIT as REPLAY_AUDIT } from "@omega";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@omega";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const processLocal = async (
  state: StateSnapshot,
  proposals: DeltaProposal[],
  config: GateConfig,
): Promise<StateSnapshot> =>
  (await GATE_PIPELINE.processWithInvariantContext(state, proposals, config))
    .nextState;

async function prepareCrystallized(
  tempLedger: string,
  tempReportDir: string,
  tempGateAdmissionDir: string,
) {
  LEDGER.STORAGE_PATH = tempLedger;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  CRYSTALLIZATION_REPORT.STORAGE_DIR = tempReportDir;
  CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempReportDir}/index.jsonl`;
  GATE_ADMISSION_REPORT.STORAGE_DIR = tempGateAdmissionDir;
  GATE_ADMISSION_REPORT.INDEX_PATH = `${tempGateAdmissionDir}/index.jsonl`;

  const genesis: StateSnapshot = {
    tick: 1,
    state_i16: new Int16Array(64).fill(0),
    state_hash: "state_1",
  };

  const p1: DeltaProposal = {
    proposal_id: "p1",
    tick: 1,
    base_state_hash: "state_1",
    agent_id: "agent_sync",
    intent: "seed",
    confidence: 1,
    delta: [{ level: 0, value: 6 }],
    cost_estimate: 100,
    artifact_hash: "a1",
    semantic_fingerprint: "s1",
  };
  const s2 = await processLocal(genesis, [p1], baseConfig());

  const p2: DeltaProposal = {
    proposal_id: "p2",
    tick: 2,
    base_state_hash: s2.state_hash,
    agent_id: "agent_sync",
    intent: "stabilize",
    confidence: 1,
    delta: [{ level: 0, value: -2 }],
    cost_estimate: 100,
    artifact_hash: "a1",
    semantic_fingerprint: "s1",
  };
  const s3 = await processLocal(s2, [p2], baseConfig());

  await CRYSTALLIZATION.evaluateWithAudit(
    2,
    "artifact_demo",
    s3.state_hash,
    {
      tick: 1,
      state_i16: genesis.state_i16,
      state_hash: "state_1",
    },
    {
      requiredWindows: 1,
      windowSize: 2,
      replayRuns: 1,
      witness: "test",
    },
  );

  return genesis;
}

Deno.test("replay fails when canonization report file is tampered", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-canon-verify-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const canon = JSON.parse(
      lines.find((l) => l.includes('"event_type":"CANONIZATION_EVENT"'))!,
    );
    const reportPath = canon.crystallization_report_uri as string;

    const report = JSON.parse(await Deno.readTextFile(reportPath));
    report.thresholds.window = 999; // tamper without hash update
    await Deno.writeTextFile(reportPath, JSON.stringify(report, null, 2));

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when canonization report file is tampered",
      );
    }
    if (!audit.invariantReport.index_chain_checked) {
      throw new Error("expected invariantReport index_chain_checked=true");
    }
    if (
      !audit.failures.some((f) =>
        f.includes("index_chain:INDEX_REPORT_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("replay fails when gate admission report file is tampered", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-admission-verify-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const canon = JSON.parse(
      lines.find((l) => l.includes('"event_type":"CANONIZATION_EVENT"'))!,
    );
    const reportPath = canon.gate_admission_report_uri as string;

    const report = JSON.parse(await Deno.readTextFile(reportPath));
    report.weightMean = (report.weightMean ?? 0) + 0.5; // tamper without hash update
    await Deno.writeTextFile(reportPath, JSON.stringify(report, null, 2));

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when gate admission report file is tampered",
      );
    }
    if (
      !audit.failures.some((f) =>
        f.includes("gate admission report hash mismatch")
      ) &&
      !audit.failures.some((f) =>
        f.includes("gate_admission_index_chain:INDEX_REPORT_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("replay fails when canonization report file is missing", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-canon-verify-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const canon = JSON.parse(
      lines.find((l) => l.includes('"event_type":"CANONIZATION_EVENT"'))!,
    );
    const reportPath = canon.crystallization_report_uri as string;
    await Deno.remove(reportPath);

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when canonization report file is missing",
      );
    }
    if (!audit.invariantReport.index_chain_checked) {
      throw new Error("expected invariantReport index_chain_checked=true");
    }
    if (
      !audit.failures.some((f) =>
        f.includes("index_chain:INDEX_REPORT_READ_FAIL")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("replay fails when canonization report index chain is tampered", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-canon-verify-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const rawIndex = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
    const lines = rawIndex.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length < 1) {
      throw new Error("missing report index line");
    }
    const record = JSON.parse(lines[0]);
    record.record_hash = "f".repeat(64);
    await Deno.writeTextFile(
      CRYSTALLIZATION_REPORT.INDEX_PATH,
      JSON.stringify(record) + "\n",
    );

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when canonization report index chain is tampered",
      );
    }
    if (!audit.invariantReport.index_chain_checked) {
      throw new Error("expected invariantReport index_chain_checked=true");
    }
    if (
      !audit.failures.some((f) =>
        f.includes("index_chain:INDEX_RECORD_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("replay fails when gate admission report index chain is tampered", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-index-verify-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const rawIndex = await Deno.readTextFile(GATE_ADMISSION_REPORT.INDEX_PATH);
    const lines = rawIndex.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length < 1) {
      throw new Error("missing gate admission report index line");
    }
    const record = JSON.parse(lines[0]);
    record.record_hash = "f".repeat(64);
    await Deno.writeTextFile(
      GATE_ADMISSION_REPORT.INDEX_PATH,
      JSON.stringify(record) + "\n",
    );

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      { runs: 1, startTick: 1, endTick: 2 },
    );

    if (audit.replayGreen) {
      throw new Error(
        "replay must fail when gate admission index chain is tampered",
      );
    }
    if (
      !audit.failures.some((f) =>
        f.includes("gate_admission_index_chain:INDEX_RECORD_HASH_MISMATCH")
      )
    ) {
      throw new Error(
        `missing expected failure, got: ${audit.failures.join(",")}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("replay invariant-only mode reports index chain status", async () => {
  const origLedger = LEDGER.STORAGE_PATH;
  const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
  const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
  const origGateAdmissionDir = GATE_ADMISSION_REPORT.STORAGE_DIR;
  const origGateAdmissionIndex = GATE_ADMISSION_REPORT.INDEX_PATH;
  const tempLedger = await Deno.makeTempFile({
    prefix: "omega-ledger-invariant-only-",
    suffix: ".jsonl",
  });
  const tempDir = await Deno.makeTempDir({
    prefix: "omega-canon-report-verify-",
  });
  const tempGateAdmissionDir = await Deno.makeTempDir({
    prefix: "omega-gate-admission-verify-",
  });

  try {
    const genesis = await prepareCrystallized(
      tempLedger,
      tempDir,
      tempGateAdmissionDir,
    );

    const audit = await REPLAY_AUDIT.audit(
      { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
      {
        runs: 1,
        startTick: 1,
        endTick: 2,
        verifyLedgerChain: true,
        invariantOnly: true,
      },
    );

    if (!audit.replayGreen) {
      throw new Error(
        `expected invariant-only replay green, got: ${
          audit.failures.join(",")
        }`,
      );
    }
    if (!audit.invariantPacket) {
      throw new Error("expected invariant packet in invariant-only mode");
    }
    if (
      !audit.invariantReport.index_chain_checked ||
      !audit.invariantReport.index_chain_ok
    ) {
      throw new Error("expected canon index chain to be checked and ok");
    }
    if (
      !audit.invariantReport.gate_admission_index_chain_checked ||
      !audit.invariantReport.gate_admission_index_chain_ok
    ) {
      throw new Error(
        "expected gate admission index chain to be checked and ok",
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = origLedger;
    CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
    GATE_ADMISSION_REPORT.STORAGE_DIR = origGateAdmissionDir;
    GATE_ADMISSION_REPORT.INDEX_PATH = origGateAdmissionIndex;
    try {
      await Deno.remove(tempLedger);
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
    try {
      await Deno.remove(tempGateAdmissionDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

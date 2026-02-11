// test_replay_canon_report_verification.ts
// Verifies replay-time validation of canonization report hash/uri.

import { GATE } from "./i.L32.core.GATE.ts";
import { CRYSTALLIZATION } from "./i.L99.core.CRYSTALLIZATION.ts";
import { CRYSTALLIZATION_REPORT } from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";
import { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

const baseConfig = (): GateConfig => ({
    max_abs_delta_per_level: 1000,
    max_total_abs_delta_per_tick: 5000,
    max_cost_per_agent: 10000,
    reliability_weight: new Map([["agent_sync", 1.0]]),
    dry_run: false
});

async function prepareCrystallized(tempLedger: string, tempReportDir: string) {
    LEDGER.STORAGE_PATH = tempLedger;
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

    CRYSTALLIZATION_REPORT.STORAGE_DIR = tempReportDir;
    CRYSTALLIZATION_REPORT.INDEX_PATH = `${tempReportDir}/index.jsonl`;

    const genesis: StateSnapshot = {
        tick: 1,
        state_i16: new Int16Array(64).fill(0),
        state_hash: "state_1"
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
        semantic_fingerprint: "s1"
    };
    const s2 = await GATE.process(genesis, [p1], baseConfig());

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
        semantic_fingerprint: "s1"
    };
    const s3 = await GATE.process(s2, [p2], baseConfig());

    await CRYSTALLIZATION.evaluateWithAudit(
        2,
        "artifact_demo",
        s3.state_hash,
        {
            tick: 1,
            state_i16: genesis.state_i16,
            state_hash: "state_1"
        },
        {
            requiredWindows: 1,
            windowSize: 2,
            replayRuns: 1,
            witness: "test"
        }
    );

    return genesis;
}

Deno.test("replay fails when canonization report file is tampered", async () => {
    const origLedger = LEDGER.STORAGE_PATH;
    const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
    const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
    const tempLedger = await Deno.makeTempFile({ prefix: "omega-ledger-canon-verify-", suffix: ".jsonl" });
    const tempDir = await Deno.makeTempDir({ prefix: "omega-canon-report-verify-" });

    try {
        const genesis = await prepareCrystallized(tempLedger, tempDir);

        const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
        const lines = raw.split("\n").filter((x) => x.trim().length > 0);
        const canon = JSON.parse(lines.find((l) => l.includes("\"event_type\":\"CANONIZATION_EVENT\""))!);
        const reportPath = canon.crystallization_report_uri as string;

        const report = JSON.parse(await Deno.readTextFile(reportPath));
        report.thresholds.window = 999; // tamper without hash update
        await Deno.writeTextFile(reportPath, JSON.stringify(report, null, 2));

        const audit = await REPLAY_AUDIT.audit(
            { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
            { runs: 1, startTick: 1, endTick: 2 }
        );

        if (audit.replayGreen) {
            throw new Error("replay must fail when canonization report file is tampered");
        }
        if (!audit.invariantReport.index_chain_checked) {
            throw new Error("expected invariantReport index_chain_checked=true");
        }
        if (!audit.failures.some((f) => f.includes("index_chain:INDEX_REPORT_HASH_MISMATCH"))) {
            throw new Error(`missing expected failure, got: ${audit.failures.join(",")}`);
        }
    } finally {
        LEDGER.STORAGE_PATH = origLedger;
        CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
        CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
        try { await Deno.remove(tempLedger); } catch { /* ignore */ }
        try { await Deno.remove(tempDir, { recursive: true }); } catch { /* ignore */ }
    }
});

Deno.test("replay fails when canonization report file is missing", async () => {
    const origLedger = LEDGER.STORAGE_PATH;
    const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
    const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
    const tempLedger = await Deno.makeTempFile({ prefix: "omega-ledger-canon-verify-", suffix: ".jsonl" });
    const tempDir = await Deno.makeTempDir({ prefix: "omega-canon-report-verify-" });

    try {
        const genesis = await prepareCrystallized(tempLedger, tempDir);

        const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
        const lines = raw.split("\n").filter((x) => x.trim().length > 0);
        const canon = JSON.parse(lines.find((l) => l.includes("\"event_type\":\"CANONIZATION_EVENT\""))!);
        const reportPath = canon.crystallization_report_uri as string;
        await Deno.remove(reportPath);

        const audit = await REPLAY_AUDIT.audit(
            { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
            { runs: 1, startTick: 1, endTick: 2 }
        );

        if (audit.replayGreen) {
            throw new Error("replay must fail when canonization report file is missing");
        }
        if (!audit.invariantReport.index_chain_checked) {
            throw new Error("expected invariantReport index_chain_checked=true");
        }
        if (!audit.failures.some((f) => f.includes("index_chain:INDEX_REPORT_READ_FAIL"))) {
            throw new Error(`missing expected failure, got: ${audit.failures.join(",")}`);
        }
    } finally {
        LEDGER.STORAGE_PATH = origLedger;
        CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
        CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
        try { await Deno.remove(tempLedger); } catch { /* ignore */ }
        try { await Deno.remove(tempDir, { recursive: true }); } catch { /* ignore */ }
    }
});

Deno.test("replay fails when canonization report index chain is tampered", async () => {
    const origLedger = LEDGER.STORAGE_PATH;
    const origDir = CRYSTALLIZATION_REPORT.STORAGE_DIR;
    const origIndex = CRYSTALLIZATION_REPORT.INDEX_PATH;
    const tempLedger = await Deno.makeTempFile({ prefix: "omega-ledger-canon-verify-", suffix: ".jsonl" });
    const tempDir = await Deno.makeTempDir({ prefix: "omega-canon-report-verify-" });

    try {
        const genesis = await prepareCrystallized(tempLedger, tempDir);

        const rawIndex = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
        const lines = rawIndex.split("\n").filter((x) => x.trim().length > 0);
        if (lines.length < 1) {
            throw new Error("missing report index line");
        }
        const record = JSON.parse(lines[0]);
        record.record_hash = "f".repeat(64);
        await Deno.writeTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH, JSON.stringify(record) + "\n");

        const audit = await REPLAY_AUDIT.audit(
            { tick: 1, state_i16: genesis.state_i16, state_hash: "state_1" },
            { runs: 1, startTick: 1, endTick: 2 }
        );

        if (audit.replayGreen) {
            throw new Error("replay must fail when canonization report index chain is tampered");
        }
        if (!audit.invariantReport.index_chain_checked) {
            throw new Error("expected invariantReport index_chain_checked=true");
        }
        if (!audit.failures.some((f) => f.includes("index_chain:INDEX_RECORD_HASH_MISMATCH"))) {
            throw new Error(`missing expected failure, got: ${audit.failures.join(",")}`);
        }
    } finally {
        LEDGER.STORAGE_PATH = origLedger;
        CRYSTALLIZATION_REPORT.STORAGE_DIR = origDir;
        CRYSTALLIZATION_REPORT.INDEX_PATH = origIndex;
        try { await Deno.remove(tempLedger); } catch { /* ignore */ }
        try { await Deno.remove(tempDir, { recursive: true }); } catch { /* ignore */ }
    }
});

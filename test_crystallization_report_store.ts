// test_crystallization_report_store.ts
// Verifies content-addressed materialization for crystallization reports.

import { CRYSTALLIZATION_REPORT } from "./i.L99.core.CRYSTALLIZATION_REPORT.ts";
import { CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_POLICY } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";

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
                hash: policyHash
            },
            thresholds: {
                window: CRYSTALLIZATION_CONFIG.window,
                min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
                default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
                projection_drift_max_p95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95
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
                finalHashes: [],
                failures: []
            },
            projection_report: {
                ok: true,
                totalTicks: 0,
                passCount: 0,
                failCount: 0,
                skipCount: 0,
                ticks: [],
                failures: []
            },
            drift_report: {
                ok: true,
                eventsAnalyzed: 0,
                levelCount: 64,
                driftByLevelMean: [],
                driftByLevelP95: [],
                topHotLevels: [],
                timeline: [],
                replayAudit: {
                    replayGreen: true,
                    checkedEvents: 0,
                    checkedProjectionEvents: 0
                },
                failures: []
            },
            projection_drift_gate_pass: true
        };

        const reportHash = await CRYSTALLIZATION_REPORT.hash(report);
        const first = await CRYSTALLIZATION_REPORT.materialize(report, reportHash, {
            tick: 10,
            artifact_hash: report.artifact_hash,
            state_hash: report.state_hash
        });
        const second = await CRYSTALLIZATION_REPORT.materialize(report, reportHash, {
            tick: 10,
            artifact_hash: report.artifact_hash,
            state_hash: report.state_hash
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

        const indexRaw = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
        const indexLines = indexRaw.split("\n").filter((x) => x.trim().length > 0);
        if (indexLines.length !== 1) {
            throw new Error(`expected exactly 1 index record, got ${indexLines.length}`);
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

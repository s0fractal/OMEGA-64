// i.L99.core.CRYSTALLIZATION_REPORT.ts
// OMEGA-64 | Canon Protocol | Canonization Report Artifact

import { ProjectionDriftAnalyticsReport } from "./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts";
import { ProjectionReplayReport } from "./i.L99.core.PROJECTION_REPLAY_REPORT.ts";
import { ReplayAuditResult } from "./i.L99.core.REPLAY_AUDIT.ts";
import { CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_POLICY } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";

export interface CrystallizationReportInput {
    artifact_hash: string;
    state_hash: string;
    current_tick: number;
    replay_start_tick: number;
    replay_end_tick: number;
    replay_audit: ReplayAuditResult;
    projection_report: ProjectionReplayReport;
    drift_report: ProjectionDriftAnalyticsReport;
    projection_drift_gate_pass: boolean;
    projection_drift_max_p95: number;
}

export interface CrystallizationReport {
    version: string;
    artifact_hash: string;
    state_hash: string;
    current_tick: number;
    replay_start_tick: number;
    replay_end_tick: number;
    policy: {
        version: string;
        hash: string;
    };
    thresholds: {
        window: number;
        min_soft_passes: number;
        default_required_windows: number;
        projection_drift_max_p95: number;
    };
    verification_summary: {
        replay_green: boolean;
        projection_checks: number;
        policy_checks: number;
        canon_report_checks: number;
    };
    replay_audit: ReplayAuditResult;
    projection_report: ProjectionReplayReport;
    drift_report: ProjectionDriftAnalyticsReport;
    projection_drift_gate_pass: boolean;
}

export interface CrystallizationReportMaterializeMeta {
    tick: number;
    artifact_hash: string;
    state_hash: string;
    witness?: string;
}

export interface CrystallizationReportIndexRecord {
    report_hash: string;
    report_version: string;
    report_path: string;
    tick: number;
    artifact_hash: string;
    state_hash: string;
    ts_unix_ms: number;
    prev_record_hash: string | null;
    record_hash: string;
    witness?: string;
}

const REPORT_VERSION = "crystallization-report/v1";

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

export const CRYSTALLIZATION_REPORT = {
    VERSION: REPORT_VERSION,
    STORAGE_DIR: "./OMEGA_CANON_REPORTS",
    INDEX_PATH: "./OMEGA_CANON_REPORTS/index.jsonl",

    build: async (input: CrystallizationReportInput): Promise<CrystallizationReport> => {
        const policyHash = await CRYSTALLIZATION_POLICY.hash();
        return {
            version: REPORT_VERSION,
            artifact_hash: input.artifact_hash,
            state_hash: input.state_hash,
            current_tick: input.current_tick,
            replay_start_tick: input.replay_start_tick,
            replay_end_tick: input.replay_end_tick,
            policy: {
                version: CRYSTALLIZATION_CONFIG.policyVersion,
                hash: policyHash
            },
            thresholds: {
                window: CRYSTALLIZATION_CONFIG.window,
                min_soft_passes: CRYSTALLIZATION_CONFIG.minSoftPasses,
                default_required_windows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
                projection_drift_max_p95: input.projection_drift_max_p95
            },
            verification_summary: {
                replay_green: input.replay_audit.replayGreen,
                projection_checks: input.replay_audit.checkedProjectionEvents,
                policy_checks: input.replay_audit.checkedPolicyEvents,
                canon_report_checks: input.replay_audit.checkedCanonReports
            },
            replay_audit: input.replay_audit,
            projection_report: input.projection_report,
            drift_report: input.drift_report,
            projection_drift_gate_pass: input.projection_drift_gate_pass
        };
    },

    hash: async (report: CrystallizationReport): Promise<string> =>
        await sha256Hex(stableStringify(report)),

    buildWithHash: async (
        input: CrystallizationReportInput
    ): Promise<{ report: CrystallizationReport; reportHash: string }> => {
        const report = await CRYSTALLIZATION_REPORT.build(input);
        const reportHash = await CRYSTALLIZATION_REPORT.hash(report);
        return { report, reportHash };
    },

    reportPath: (reportHash: string): string =>
        `${CRYSTALLIZATION_REPORT.STORAGE_DIR}/${reportHash}.json`,

    indexRecordHash: async (
        record: Omit<CrystallizationReportIndexRecord, "record_hash">
    ): Promise<string> => await sha256Hex(stableStringify(record)),

    readIndex: async function* (): AsyncGenerator<CrystallizationReportIndexRecord> {
        try {
            const content = await Deno.readTextFile(CRYSTALLIZATION_REPORT.INDEX_PATH);
            for (const line of content.split("\n")) {
                if (line.trim().length === 0) continue;
                try {
                    const parsed = JSON.parse(line) as CrystallizationReportIndexRecord;
                    if (
                        typeof parsed.report_hash === "string" &&
                        typeof parsed.report_path === "string" &&
                        typeof parsed.record_hash === "string" &&
                        (typeof parsed.prev_record_hash === "string" || parsed.prev_record_hash === null)
                    ) {
                        yield parsed;
                    }
                } catch {
                    // ignore malformed line
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e;
            }
        }
    },

    findIndexRecord: async (
        reportHash: string,
        reportPath?: string
    ): Promise<CrystallizationReportIndexRecord | null> => {
        let found: CrystallizationReportIndexRecord | null = null;
        for await (const rec of CRYSTALLIZATION_REPORT.readIndex()) {
            if (rec.report_hash !== reportHash) continue;
            if (reportPath && rec.report_path !== reportPath) continue;
            found = rec;
        }
        return found;
    },

    verifyIndexChain: async (verifyReportFiles: boolean = true): Promise<{ ok: boolean; failures: string[] }> => {
        const failures: string[] = [];
        const records: CrystallizationReportIndexRecord[] = [];
        for await (const rec of CRYSTALLIZATION_REPORT.readIndex()) {
            records.push(rec);
        }

        let prev: string | null = null;
        for (let i = 0; i < records.length; i++) {
            const rec = records[i];
            if (rec.prev_record_hash !== prev) {
                failures.push(`INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
                break;
            }
            const expected = await CRYSTALLIZATION_REPORT.indexRecordHash({
                report_hash: rec.report_hash,
                report_version: rec.report_version,
                report_path: rec.report_path,
                tick: rec.tick,
                artifact_hash: rec.artifact_hash,
                state_hash: rec.state_hash,
                ts_unix_ms: rec.ts_unix_ms,
                prev_record_hash: rec.prev_record_hash,
                witness: rec.witness
            });
            if (expected !== rec.record_hash) {
                failures.push(`INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
                break;
            }

            if (verifyReportFiles) {
                try {
                    const body = await Deno.readTextFile(rec.report_path);
                    const parsed = JSON.parse(body) as CrystallizationReport;
                    const computed = await CRYSTALLIZATION_REPORT.hash(parsed);
                    if (computed !== rec.report_hash) {
                        failures.push(`INDEX_REPORT_HASH_MISMATCH_AT_LINE_${i + 1}`);
                        break;
                    }
                } catch {
                    failures.push(`INDEX_REPORT_READ_FAIL_AT_LINE_${i + 1}`);
                    break;
                }
            }

            prev = rec.record_hash;
        }

        return { ok: failures.length === 0, failures };
    },

    materialize: async (
        report: CrystallizationReport,
        reportHash: string,
        meta: CrystallizationReportMaterializeMeta
    ): Promise<{ path: string; created: boolean; indexRecord?: CrystallizationReportIndexRecord }> => {
        await Deno.mkdir(CRYSTALLIZATION_REPORT.STORAGE_DIR, { recursive: true });
        const path = CRYSTALLIZATION_REPORT.reportPath(reportHash);
        const payload = JSON.stringify(report, null, 2);

        try {
            await Deno.writeTextFile(path, payload, { createNew: true });
            let prevRecordHash: string | null = null;
            for await (const rec of CRYSTALLIZATION_REPORT.readIndex()) {
                prevRecordHash = rec.record_hash;
            }
            const indexRecordWithoutHash: Omit<CrystallizationReportIndexRecord, "record_hash"> = {
                report_hash: reportHash,
                report_version: report.version,
                report_path: path,
                tick: meta.tick,
                artifact_hash: meta.artifact_hash,
                state_hash: meta.state_hash,
                ts_unix_ms: Date.now(),
                prev_record_hash: prevRecordHash,
                witness: meta.witness
            };
            const recordHash = await CRYSTALLIZATION_REPORT.indexRecordHash(indexRecordWithoutHash);
            const indexRecord: CrystallizationReportIndexRecord = {
                ...indexRecordWithoutHash,
                record_hash: recordHash
            };
            await Deno.writeTextFile(
                CRYSTALLIZATION_REPORT.INDEX_PATH,
                JSON.stringify(indexRecord) + "\n",
                { append: true, create: true }
            );
            return { path, created: true, indexRecord };
        } catch (e) {
            if (!(e instanceof Deno.errors.AlreadyExists)) throw e;

            const existing = await Deno.readTextFile(path);
            const parsed = JSON.parse(existing) as CrystallizationReport;
            const existingHash = await CRYSTALLIZATION_REPORT.hash(parsed);
            if (existingHash !== reportHash) {
                throw new Error(`CRYSTALLIZATION_REPORT_HASH_CONFLICT:${reportHash}`);
            }
            return { path, created: false };
        }
    }
};

// i.L99.core.DETERMINISM_AUDIT.ts
// OMEGA-64 | Determinism Audit
// "Scan the lattice for law coherence."

/// <reference lib="deno.ns" />

import { DETERMINISM_LAWS } from "@omega";
import { DETERMINISM_BANDS_atomIdToBand as atomIdToBand, DETERMINISM_BANDS_atomIdToLevel as atomIdToLevel, DETERMINISM_BANDS_DeterminismBand as DeterminismBand } from "@omega";
import { TELEMETRY as TELEMETRY_ATOM } from "@omega";
import { TELEMETRY_SIGNAL as TELEMETRY_SIGNAL_ATOM } from "@omega";
import { SIGNAL__07_07_SIGNAL as SIGNAL } from "@omega";

const TELEMETRY = TELEMETRY_ATOM();
const TELEMETRY_SIGNAL = TELEMETRY_SIGNAL_ATOM({
  siblings: { TELEMETRY, SIGNAL: async () => SIGNAL }
});

export interface DeterminismAuditRecord {
    atom_id: string;
    path: string;
    band: DeterminismBand;
    level: number | null;
    ok: boolean;
    reasons: string[];
}

export interface DeterminismAuditReport {
    ok: boolean;
    scanned: number;
    violations: number;
    by_band: Record<DeterminismBand, number>;
    records: DeterminismAuditRecord[];
    timestamp: number;
}

const DEFAULT_ROOT = ".";

const isCandidate = (path: string): boolean => {
    if (!path.endsWith(".ts")) return false;
    const normalized = path.replaceAll("\\", "/");
    const canonForm = /(?:^|\/)[0-8]\/[0-7]\/[^/]+\/_\.ts$/;
    const legacyDot = /i\.L\d{2}\.core\..+\.ts$/;
    const legacySlash = /i[\\/]+L\d{2}[\\/]+core[\\/]+.+\.ts$/;
    return canonForm.test(normalized) || legacyDot.test(path) || legacySlash.test(path);
};

const walk = async function* (root: string): AsyncGenerator<string> {
    for await (const entry of Deno.readDir(root)) {
        const full = `${root}/${entry.name}`;
        if (entry.isDirectory) {
            if (entry.name.startsWith(".")) continue;
            if (entry.name === "archive") continue;
            if (entry.name === "omega_rust_core") continue;
            if (entry.name === "UI") continue;
            if (entry.name === "SINGULARITY") continue;
            if (entry.name === "tests") continue;
            if (entry.name === "e") continue;
            yield* walk(full);
        } else if (entry.isFile) {
            if (isCandidate(full)) yield full;
        }
    }
};

const initBandCounter = (): Record<DeterminismBand, number> => ({
    AX: 0,
    OP: 0,
    FL: 0,
    PJ: 0,
    DR: 0,
    UNKNOWN: 0
});

export const DETERMINISM_AUDIT = {
    scan: async (root: string = DEFAULT_ROOT): Promise<DeterminismAuditReport> => {
        const records: DeterminismAuditRecord[] = [];
        const byBand = initBandCounter();

        for await (const path of walk(root)) {
            const canonicalId = path.replace(/^\.\//, "")
                .split(/[\\/]+/)
                .filter(Boolean)
                .join(".");
            const band = atomIdToBand(canonicalId);
            const level = atomIdToLevel(canonicalId);
            const content = await Deno.readTextFile(path);
            const result = DETERMINISM_LAWS.audit({ atomId: canonicalId, content });

            byBand[band] += 1;
            records.push({
                atom_id: canonicalId,
                path,
                band,
                level,
                ok: result.ok,
                reasons: result.reasons
            });
        }

        const violations = records.filter((r) => !r.ok).length;
        return {
            ok: violations === 0,
            scanned: records.length,
            violations,
            by_band: byBand,
            records,
            timestamp: Date.now()
        };
    }
};

if (import.meta.main) {
    const flags = new Set(Deno.args.filter((arg) => arg.startsWith("--")));
    const root = Deno.args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_ROOT;
    const report = await DETERMINISM_AUDIT.scan(root);
    if (flags.has("--signal")) {
        const violations = report.records.filter((r) => !r.ok);
        const sample = violations.slice(0, 8).map((v) => ({
            atom_id: v.atom_id,
            reasons: v.reasons
        }));
        await TELEMETRY_SIGNAL(
            TELEMETRY(
                "DETERMINISM_AUDIT",
                violations.length === 0
                    ? `Determinism audit OK. Scanned ${report.scanned} atoms.`
                    : `Determinism audit violations: ${violations.length} / ${report.scanned}.`,
                {
                    violations: violations.length,
                    by_band: report.by_band,
                    sample
                }
            ),
            violations.length === 0 ? "INFO" : "WARNING"
        );
    }
    console.log(JSON.stringify(report, null, 2));
    if (flags.has("--fail") && report.violations > 0) {
        Deno.exit(1);
    }
}

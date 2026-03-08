// i.L99.core.DETERMINISM_AUDIT.ts
// OMEGA-64 | Determinism Audit
// "Scan the lattice for law coherence."

/// <reference lib="deno.ns" />

import { DETERMINISM_LAWS } from "./i.L99.core.DETERMINISM_LAWS.ts";
import {
  atomIdToBand,
  atomIdToLevel,
  DeterminismBand,
} from "./i.L99.core.DETERMINISM_BANDS.ts";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

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
  const dotForm = /i\.L\d{2}\.core\..+\.ts$/;
  const slashForm = /i[\\/]+L\d{2}[\\/]+core[\\/]+.+\.ts$/;
  if (!dotForm.test(path) && !slashForm.test(path)) return false;
  return true;
};

const walk = async function* (root: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (entry.name.startsWith(".")) continue;
      if (entry.name === "archive") continue;
      if (entry.name === "omega_rust_core") continue;
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
  UNKNOWN: 0,
});

export const DETERMINISM_AUDIT = {
  scan: async (
    root: string = DEFAULT_ROOT,
  ): Promise<DeterminismAuditReport> => {
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
        reasons: result.reasons,
      });
    }

    const violations = records.filter((r) => !r.ok).length;
    return {
      ok: violations === 0,
      scanned: records.length,
      violations,
      by_band: byBand,
      records,
      timestamp: Date.now(),
    };
  },
};

if (import.meta.main) {
  const flags = new Set(Deno.args.filter((arg) => arg.startsWith("--")));
  const root = Deno.args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_ROOT;
  const report = await DETERMINISM_AUDIT.scan(root);
  if (flags.has("--signal")) {
    const violations = report.records.filter((r) => !r.ok);
    const sample = violations.slice(0, 8).map((v) => ({
      atom_id: v.atom_id,
      reasons: v.reasons,
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
          sample,
        },
      ),
      violations.length === 0 ? "INFO" : "WARNING",
    );
  }
  console.log(JSON.stringify(report, null, 2));
  if (flags.has("--fail") && report.violations > 0) {
    Deno.exit(1);
  }
}

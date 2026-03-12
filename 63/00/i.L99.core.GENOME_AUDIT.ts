// i.L99.core.GENOME_AUDIT.ts
// OMEGA-64 | GENOME_AUDIT (Soft)

import { GENOME } from "./i.L99.core.GENOME.ts";

export type GenomeAuditItem = {
  level: number;
  triplet: string;
  expected: string[];
  observed: string[];
};

export type GenomeAuditReport = {
  total: number;
  mismatches: number;
  items: GenomeAuditItem[];
};

const extractLevel = (name: string): number | null => {
  const match = name.match(/^i\.L([0-9]+)\./);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
};

const extractProjection = (name: string): string | null => {
  const parts = name.split(".");
  const ext = parts[parts.length - 1];
  return ext ?? null;
};

export const GENOME_AUDIT = (paths: string[]): GenomeAuditReport => {
  const genome = GENOME();
  const byLevel = new Map<number, Set<string>>();

  for (const path of paths) {
    const base = path.split("/").pop() ?? path;
    const level = extractLevel(base);
    if (level === null) continue;
    const projection = extractProjection(base);
    if (!projection) continue;
    const set = byLevel.get(level) ?? new Set<string>();
    set.add(projection);
    byLevel.set(level, set);
  }

  const items: GenomeAuditItem[] = [];
  for (let level = 0; level < 64; level++) {
    const triplet = genome.triplet_of(level);
    const expected = genome.projections_for(triplet).sort();
    const observed = Array.from(byLevel.get(level) ?? []).sort();
    const same = expected.length === observed.length &&
      expected.every((v, i) => v === observed[i]);
    if (!same) {
      items.push({ level, triplet, expected, observed });
    }
  }

  return {
    total: 64,
    mismatches: items.length,
    items,
  };
};

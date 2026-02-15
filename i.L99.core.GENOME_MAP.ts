// i.L99.core.GENOME_MAP.ts
// OMEGA-64 | GENOME_MAP (Triplet Map)

import { GENOME } from "./i.L99.core.GENOME.ts";

export type GenomeMapEntry = {
  level: number;
  triplet: string;
  projections: string[];
};

export const GENOME_MAP = (): GenomeMapEntry[] => {
  const genome = GENOME();
  const out: GenomeMapEntry[] = [];
  for (let level = 0; level < 64; level++) {
    const triplet = genome.triplet_of(level);
    out.push({
      level,
      triplet,
      projections: genome.projections_for(triplet),
    });
  }
  return out;
};

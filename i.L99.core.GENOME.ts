// i.L99.core.GENOME.ts
// OMEGA-64 | GENOME (Triplet Seed)

export type GenomeSeed = {
  symbols: string[];
  projection_map: Record<string, string>;
  triplets: string[];
  triplet_of: (level: number) => string;
  level_of: (triplet: string) => number | null;
  projections_for: (triplet: string) => string[];
};

export const GENOME = (): GenomeSeed => {
  const symbols = ["S", "K", "I", "Y"];
  const projection_map: Record<string, string> = {
    S: "rs",
    K: "ts",
    I: "md",
    Y: "q",
  };

  const tripletOf = (level: number): string => {
    const idx = ((level % 64) + 64) % 64;
    const a = Math.floor(idx / 16);
    const b = Math.floor((idx % 16) / 4);
    const c = idx % 4;
    return `${symbols[a]}${symbols[b]}${symbols[c]}`;
  };

  const levelOf = (triplet: string): number | null => {
    if (!triplet || triplet.length !== 3) return null;
    const chars = triplet.toUpperCase().split("");
    const a = symbols.indexOf(chars[0]);
    const b = symbols.indexOf(chars[1]);
    const c = symbols.indexOf(chars[2]);
    if (a < 0 || b < 0 || c < 0) return null;
    return a * 16 + b * 4 + c;
  };

  const projectionsFor = (triplet: string): string[] => {
    const chars = triplet.toUpperCase().split("");
    const out: string[] = [];
    for (const ch of chars) {
      const proj = projection_map[ch];
      if (proj) out.push(proj);
    }
    return out;
  };

  const triplets = Array.from({ length: 64 }, (_, i) => tripletOf(i));

  return {
    symbols: [...symbols],
    projection_map: { ...projection_map },
    triplets,
    triplet_of: tripletOf,
    level_of: levelOf,
    projections_for: projectionsFor,
  };
};

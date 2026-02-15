// i.L99.core.SPECTRAL_INVARIANTS.ts
// OMEGA-64 | Spectral Invariants (Executable Law)
// "Lens mismatch is a physics violation, not a style issue."

export type SpectralSignature = string | number | number[];

export type SpectralLens = {
  id: string;
  project: (sample: unknown) => SpectralSignature;
};

export type SpectralInvariantInput = {
  lenses: SpectralLens[];
  sample: unknown;
  min_lenses?: number;
  max_delta?: number;
};

export type SpectralInvariantResult = {
  ok: boolean;
  lens_count: number;
  min_lenses: number;
  max_delta: number;
  mean_delta: number;
  divergences: Array<{ a: string; b: string; delta: number }>;
  reason?: string;
};

export const SPECTRAL_INVARIANTS = (
  input: SpectralInvariantInput,
): SpectralInvariantResult => {
  const DEFAULT_MIN_LENSES = 2;
  const DEFAULT_MAX_DELTA = 0;
  const lenses = input.lenses ?? [];
  const minLenses = Number.isFinite(input.min_lenses)
    ? Math.max(0, Math.floor(input.min_lenses ?? DEFAULT_MIN_LENSES))
    : DEFAULT_MIN_LENSES;
  const maxDelta = Number.isFinite(input.max_delta)
    ? Math.max(0, input.max_delta ?? DEFAULT_MAX_DELTA)
    : DEFAULT_MAX_DELTA;

  if (lenses.length < minLenses) {
    return {
      ok: false,
      lens_count: lenses.length,
      min_lenses: minLenses,
      max_delta: maxDelta,
      mean_delta: 0,
      divergences: [],
      reason: "INSUFFICIENT_LENSES",
    };
  }

  const signatures = lenses.map((lens) => ({
    id: lens.id,
    sig: lens.project(input.sample),
  }));

  const divergences: Array<{ a: string; b: string; delta: number }> = [];
  let sumDelta = 0;
  let count = 0;

  for (let i = 0; i < signatures.length; i++) {
    for (let j = i + 1; j < signatures.length; j++) {
      const a = signatures[i];
      const b = signatures[j];
      let delta = 0;

      if (typeof a.sig === "string" && typeof b.sig === "string") {
        delta = a.sig === b.sig ? 0 : 1;
      } else if (typeof a.sig === "number" && typeof b.sig === "number") {
        delta = Math.abs(a.sig - b.sig);
      } else if (Array.isArray(a.sig) && Array.isArray(b.sig)) {
        const len = Math.min(a.sig.length, b.sig.length);
        let acc = 0;
        for (let k = 0; k < len; k++) {
          const av = Number.isFinite(a.sig[k]) ? Number(a.sig[k]) : 0;
          const bv = Number.isFinite(b.sig[k]) ? Number(b.sig[k]) : 0;
          acc += Math.abs(av - bv);
        }
        const base = len > 0 ? acc / len : 0;
        const penalty = Math.abs(a.sig.length - b.sig.length);
        delta = base + penalty;
      } else {
        delta = 1;
      }

      divergences.push({ a: a.id, b: b.id, delta });
      sumDelta += delta;
      count += 1;
    }
  }

  const meanDelta = count > 0 ? sumDelta / count : 0;
  const maxObserved = divergences.reduce((m, d) => Math.max(m, d.delta), 0);
  const ok = maxObserved <= maxDelta;

  return {
    ok,
    lens_count: lenses.length,
    min_lenses: minLenses,
    max_delta: maxDelta,
    mean_delta: meanDelta,
    divergences,
    reason: ok ? "OK" : "SPECTRAL_DIVERGENCE",
  };
};

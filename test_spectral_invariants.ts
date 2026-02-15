// test_spectral_invariants.ts
// @noncanonical
// OMEGA-64 | Spectral invariants sanity test

import { SPECTRAL_INVARIANTS, SpectralLens } from "./i.L99.core.SPECTRAL_INVARIANTS.ts";

const sample = { value: [1, 2, 3], label: "seed" };

const lensA: SpectralLens = {
  id: "lensA",
  project: (s) => (s as { value: number[] }).value,
};

const lensB: SpectralLens = {
  id: "lensB",
  project: (s) => (s as { value: number[] }).value.slice(),
};

const lensC: SpectralLens = {
  id: "lensC",
  project: () => [1, 2, 4],
};

const ok = SPECTRAL_INVARIANTS({
  lenses: [lensA, lensB],
  sample,
  min_lenses: 2,
  max_delta: 0,
});

if (!ok.ok) {
  throw new Error(`SPECTRAL_INVARIANTS expected OK, got ${ok.reason}`);
}

const fail = SPECTRAL_INVARIANTS({
  lenses: [lensA, lensC],
  sample,
  min_lenses: 2,
  max_delta: 0,
});

if (fail.ok) {
  throw new Error("SPECTRAL_INVARIANTS expected divergence, got OK");
}

console.log("✅ spectral invariants: PASS");

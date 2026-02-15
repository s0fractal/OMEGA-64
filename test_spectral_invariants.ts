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

const spectralTag = (content: string): string | null => {
  const match = content.match(/@spectral:\s*([^\n\r]+)/i)
    ?? content.match(/SPECTRAL:\s*([^\n\r]+)/i);
  return match ? match[1].trim() : null;
};

const readTag = async (path: string): Promise<string> => {
  const content = await Deno.readTextFile(path);
  const tag = spectralTag(content);
  if (!tag) {
    throw new Error(`Missing spectral tag in ${path}`);
  }
  return tag;
};

const fieldPaths = [
  "./i.L11.core.FIELD.ts",
  "./i.L11.core.FIELD.rs",
  "./i.L11.core.FIELD.md",
];

const fieldTags = await Promise.all(fieldPaths.map((p) => readTag(p)));
const fieldLenses: SpectralLens[] = fieldTags.map((tag, idx) => ({
  id: fieldPaths[idx],
  project: () => tag,
}));

const fieldCheck = SPECTRAL_INVARIANTS({
  lenses: fieldLenses,
  sample: {},
  min_lenses: 2,
  max_delta: 0,
});

if (!fieldCheck.ok) {
  throw new Error(`FIELD spectral mismatch: ${fieldCheck.reason}`);
}

const phasePaths = [
  "./i.L14.core.PHASE.ts",
  "./i.L14.core.PHASE.rs",
  "./i.L14.core.PHASE.md",
];

const phaseTags = await Promise.all(phasePaths.map((p) => readTag(p)));
const phaseLenses: SpectralLens[] = phaseTags.map((tag, idx) => ({
  id: phasePaths[idx],
  project: () => tag,
}));

const phaseCheck = SPECTRAL_INVARIANTS({
  lenses: phaseLenses,
  sample: {},
  min_lenses: 2,
  max_delta: 0,
});

if (!phaseCheck.ok) {
  throw new Error(`PHASE spectral mismatch: ${phaseCheck.reason}`);
}

const interferencePaths = [
  "./i.L13.core.INTERFERENCE.ts",
  "./i.L13.core.INTERFERENCE.rs",
  "./i.L13.core.INTERFERENCE.md",
];

const interferenceTags = await Promise.all(interferencePaths.map((p) => readTag(p)));
const interferenceLenses: SpectralLens[] = interferenceTags.map((tag, idx) => ({
  id: interferencePaths[idx],
  project: () => tag,
}));

const interferenceCheck = SPECTRAL_INVARIANTS({
  lenses: interferenceLenses,
  sample: {},
  min_lenses: 2,
  max_delta: 0,
});

if (!interferenceCheck.ok) {
  throw new Error(`INTERFERENCE spectral mismatch: ${interferenceCheck.reason}`);
}

const dynamicsPaths = [
  "./i.L10.core.DYNAMICS.ts",
  "./i.L10.core.DYNAMICS.rs",
  "./i.L10.core.DYNAMICS.md",
];

const dynamicsTags = await Promise.all(dynamicsPaths.map((p) => readTag(p)));
const dynamicsLenses: SpectralLens[] = dynamicsTags.map((tag, idx) => ({
  id: dynamicsPaths[idx],
  project: () => tag,
}));

const dynamicsCheck = SPECTRAL_INVARIANTS({
  lenses: dynamicsLenses,
  sample: {},
  min_lenses: 2,
  max_delta: 0,
});

if (!dynamicsCheck.ok) {
  throw new Error(`DYNAMICS spectral mismatch: ${dynamicsCheck.reason}`);
}

console.log("✅ spectral invariants: PASS");

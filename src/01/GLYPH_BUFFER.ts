import { GRID_CELLS, GRID_H, GRID_W, SECRETION_STATS_OFFSET, MAX_GLYPH_AMP, MIN_GLYPH_AMP } from "@00";
import { STATE_MATRIX } from "@00";

const GLYPH_KIND_MASK = 0xFF;
const GLYPH_AMPLITUDE_SHIFT = 8;
const GLYPH_AMPLITUDE_MAX = 0x00FF_FFFF;
const WORLD_W = GRID_W * 10;
const WORLD_H = GRID_H * 10;

export const GLYPH_KIND = {
  NONE: 0,
  PHEROMONE: 1,
  PLASMID: 2,
} as const;

console.log(
  `[GLYPH_BUFFER] Initialized with SECRETION_STATS_OFFSET=${SECRETION_STATS_OFFSET}`,
);
const secretionStatsView = new Int32Array(
  STATE_MATRIX.buffer,
  SECRETION_STATS_OFFSET,
  12,
);

type GlyphKind = typeof GLYPH_KIND[keyof typeof GLYPH_KIND];

export type GlyphRoleCounters = {
  neutral: number;
  producer: number;
  guardian: number;
  architect: number;
  parasite: number;
};

export type GlyphSnapshot = {
  activeCells: number;
  pheromoneCells: number;
  plasmidCells: number;
  maxAmplitude: number;
  totalAmplitude: number;
  internalSignalSeeds: number;
  internalMemorySeeds: number;
  internalAtomPheromoneSeeds: number;
  internalAtomPlasmidSeeds: number;
  atomRolePheromone: GlyphRoleCounters;
  atomRolePlasmid: GlyphRoleCounters;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const packHeader = (kind: GlyphKind, amplitude: number): number => {
  let amp = Math.round(amplitude);
  if (amp < MIN_GLYPH_AMP) amp = MIN_GLYPH_AMP;
  if (amp > MAX_GLYPH_AMP) amp = MAX_GLYPH_AMP;
  return ((amp << GLYPH_AMPLITUDE_SHIFT) | (kind & GLYPH_KIND_MASK)) >>> 0;
};

const unpackKind = (header: number): GlyphKind =>
  (header & GLYPH_KIND_MASK) as GlyphKind;

const unpackAmplitude = (header: number): number =>
  header >> GLYPH_AMPLITUDE_SHIFT;

const toGridCell = (x: number, y: number): number => {
  const wx = clamp(Math.round(x), 0, WORLD_W - 1);
  const wy = clamp(Math.round(y), 0, WORLD_H - 1);
  const gx = clamp(Math.floor(wx / 10), 0, GRID_W - 1);
  const wy_grid = clamp(Math.floor(wy / 10), 0, GRID_H - 1);
  return wy_grid * GRID_W + gx;
};

const depositHeader = (
  cell: number,
  kind: GlyphKind,
  amplitude: number,
  payload?: Uint8Array,
): void => {
  let nextAmplitude = Math.round(amplitude);
  if (nextAmplitude === 0) return;

  if (nextAmplitude < MIN_GLYPH_AMP) nextAmplitude = MIN_GLYPH_AMP;
  if (nextAmplitude > MAX_GLYPH_AMP) nextAmplitude = MAX_GLYPH_AMP;

  const current = STATE_MATRIX.getGlyphHeader(cell);
  const currentKind = unpackKind(current);
  const currentAmplitude = unpackAmplitude(current);

  let mergedAmplitude = nextAmplitude;
  let finalKind = kind;

  if (currentKind === kind || currentKind === GLYPH_KIND.NONE) {
    mergedAmplitude = currentAmplitude + nextAmplitude;
    if (mergedAmplitude < MIN_GLYPH_AMP) mergedAmplitude = MIN_GLYPH_AMP;
    if (mergedAmplitude > MAX_GLYPH_AMP) mergedAmplitude = MAX_GLYPH_AMP;
    // Annihilation check
    if (mergedAmplitude === 0) finalKind = GLYPH_KIND.NONE;
  } else {
    // Differing kinds - power comparison for override
    if (Math.abs(nextAmplitude) <= Math.abs(currentAmplitude)) {
      return; // Current signal is stronger or equal
    }
  }

  STATE_MATRIX.setGlyphHeader(cell, packHeader(finalKind, mergedAmplitude));
  if (payload && payload.length > 0) {
    STATE_MATRIX.setGlyphPayload(cell, payload);
  }
};

export const GLYPH_BUFFER = {
  GLYPH_KIND,

  clear: () => {
    STATE_MATRIX.glyphHeaders.fill(0);
    STATE_MATRIX.glyphPayload.fill(0);
    secretionStatsView.fill(0);
  },

  beginInternalAtomEmissionTick: () => {
    secretionStatsView.fill(0);
  },

  depositPheromone: (x: number, y: number, intensity: number) => {
    const cell = toGridCell(x, y);
    const core = clamp(Math.round(intensity), -4096, 4096);
    const halo = core > 0
      ? Math.max(1, Math.floor(core * 0.25))
      : Math.min(-1, Math.ceil(core * 0.25));
    depositHeader(cell, GLYPH_KIND.PHEROMONE, core);
    const gx = cell % GRID_W;
    const gy = Math.floor(cell / GRID_W);
    if (gx > 0) depositHeader(cell - 1, GLYPH_KIND.PHEROMONE, halo);
    if (gx < GRID_W - 1) depositHeader(cell + 1, GLYPH_KIND.PHEROMONE, halo);
    if (gy > 0) depositHeader(cell - GRID_W, GLYPH_KIND.PHEROMONE, halo);
    if (gy < GRID_H - 1) {
      depositHeader(cell + GRID_W, GLYPH_KIND.PHEROMONE, halo);
    }
  },

  depositPlasmid: (
    x: number,
    y: number,
    charge: number,
    payload: Uint8Array,
  ) => {
    const cell = toGridCell(x, y);
    depositHeader(
      cell,
      GLYPH_KIND.PLASMID,
      clamp(Math.round(charge), -4096, 4096),
      payload,
    );
  },

  emitAtomPheromone: (x: number, y: number, intensity: number, role = 0) => {
    Atomics.add(secretionStatsView, role, 1);
    const phaseIntensity = role === 4 ? -intensity : intensity;
    GLYPH_BUFFER.depositPheromone(x, y, phaseIntensity);
  },

  emitAtomPlasmid: (
    x: number,
    y: number,
    charge: number,
    payload: Uint8Array,
    role = 0,
  ) => {
    Atomics.add(secretionStatsView, 5 + role, 1);
    const phaseCharge = role === 4 ? -charge : charge;
    GLYPH_BUFFER.depositPlasmid(x, y, phaseCharge, payload);
  },

  snapshot: (): GlyphSnapshot => {
    let activeCells = 0;
    let pheromoneCells = 0;
    let plasmidCells = 0;
    let maxAmplitude = 0;
    let totalAmplitude = 0;

    for (let cell = 0; cell < GRID_CELLS; cell++) {
      const header = STATE_MATRIX.getGlyphHeader(cell);
      const kind = unpackKind(header);
      const amplitude = unpackAmplitude(header);
      if (amplitude <= 0) continue;
      activeCells++;
      totalAmplitude += amplitude;
      if (amplitude > maxAmplitude) maxAmplitude = amplitude;
      if (kind === GLYPH_KIND.PHEROMONE) pheromoneCells++;
      if (kind === GLYPH_KIND.PLASMID) plasmidCells++;
    }

    // WASM-side Atomic Telemetry (Stage 5.1)
    const pNeutral = Atomics.load(secretionStatsView, 0);
    const pProducer = Atomics.load(secretionStatsView, 1);
    const pGuardian = Atomics.load(secretionStatsView, 2);
    const pArchitect = Atomics.load(secretionStatsView, 3);
    const pParasite = Atomics.load(secretionStatsView, 4);

    const mNeutral = Atomics.load(secretionStatsView, 5);
    const mProducer = Atomics.load(secretionStatsView, 6);
    const mGuardian = Atomics.load(secretionStatsView, 7);
    const mArchitect = Atomics.load(secretionStatsView, 8);
    const mParasite = Atomics.load(secretionStatsView, 9);

    const totalPhero = pNeutral + pProducer + pGuardian + pArchitect +
      pParasite;
    const totalPlasmid = mNeutral + mProducer + mGuardian + mArchitect +
      mParasite;

    const signalLeak = Atomics.load(secretionStatsView, 10);
    const memoryLeak = Atomics.load(secretionStatsView, 11);

    return {
      activeCells,
      pheromoneCells,
      plasmidCells,
      maxAmplitude,
      totalAmplitude,
      internalSignalSeeds: signalLeak,
      internalMemorySeeds: memoryLeak,
      internalAtomPheromoneSeeds: totalPhero,
      internalAtomPlasmidSeeds: totalPlasmid,
      atomRolePheromone: {
        neutral: pNeutral,
        producer: pProducer,
        guardian: pGuardian,
        architect: pArchitect,
        parasite: pParasite,
      },
      atomRolePlasmid: {
        neutral: mNeutral,
        producer: mProducer,
        guardian: mGuardian,
        architect: mArchitect,
        parasite: mParasite,
      },
    };
  },
};

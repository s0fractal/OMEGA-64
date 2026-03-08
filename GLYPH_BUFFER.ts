import {
  GRID_CELLS,
  GRID_H,
  GRID_W,
  SECRETION_STATS_OFFSET,
} from "./OFFSETS.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

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

let lastInternalSignalSeeds = 0;
let lastInternalMemorySeeds = 0;
let lastInternalAtomPheromoneSeeds = 0;
let lastInternalAtomPlasmidSeeds = 0;

const createRoleCounters = (): GlyphRoleCounters => ({
  neutral: 0,
  producer: 0,
  guardian: 0,
  architect: 0,
  parasite: 0,
});

const resetRoleCounters = (counters: GlyphRoleCounters): void => {
  counters.neutral = 0;
  counters.producer = 0;
  counters.guardian = 0;
  counters.architect = 0;
  counters.parasite = 0;
};

const cloneRoleCounters = (counters: GlyphRoleCounters): GlyphRoleCounters => ({
  neutral: counters.neutral,
  producer: counters.producer,
  guardian: counters.guardian,
  architect: counters.architect,
  parasite: counters.parasite,
});

const lastAtomRolePheromone = createRoleCounters();
const lastAtomRolePlasmid = createRoleCounters();

const incrementRoleCounter = (
  counters: GlyphRoleCounters,
  role: number,
): void => {
  if (role === STATE_MATRIX.ROLE_PRODUCER) {
    counters.producer++;
    return;
  }
  if (role === STATE_MATRIX.ROLE_GUARDIAN) {
    counters.guardian++;
    return;
  }
  if (role === STATE_MATRIX.ROLE_ARCHITECT) {
    counters.architect++;
    return;
  }
  if (role === STATE_MATRIX.ROLE_PARASITE) {
    counters.parasite++;
    return;
  }
  counters.neutral++;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const packHeader = (kind: GlyphKind, amplitude: number): number =>
  ((clamp(Math.round(amplitude), 0, GLYPH_AMPLITUDE_MAX) <<
    GLYPH_AMPLITUDE_SHIFT) | (kind & GLYPH_KIND_MASK)) >>> 0;

const unpackKind = (header: number): GlyphKind =>
  (header & GLYPH_KIND_MASK) as GlyphKind;

const unpackAmplitude = (header: number): number =>
  (header >>> GLYPH_AMPLITUDE_SHIFT) & GLYPH_AMPLITUDE_MAX;

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
  const nextAmplitude = clamp(Math.round(amplitude), 0, GLYPH_AMPLITUDE_MAX);
  if (nextAmplitude <= 0) return;
  const current = STATE_MATRIX.getGlyphHeader(cell);
  const currentKind = unpackKind(current);
  const currentAmplitude = unpackAmplitude(current);
  const mergedAmplitude = currentKind === kind
    ? Math.min(GLYPH_AMPLITUDE_MAX, currentAmplitude + nextAmplitude)
    : Math.max(currentAmplitude, nextAmplitude);
  STATE_MATRIX.setGlyphHeader(cell, packHeader(kind, mergedAmplitude));
  if (payload && payload.length > 0) {
    STATE_MATRIX.setGlyphPayload(cell, payload);
  }
};

export const GLYPH_BUFFER = {
  GLYPH_KIND,

  clear: () => {
    STATE_MATRIX.glyphHeaders.fill(0);
    STATE_MATRIX.glyphPayload.fill(0);
    lastInternalSignalSeeds = 0;
    lastInternalMemorySeeds = 0;
    secretionStatsView.fill(0);
  },

  beginInternalAtomEmissionTick: () => {
    secretionStatsView.fill(0);
  },

  depositPheromone: (x: number, y: number, intensity: number) => {
    const cell = toGridCell(x, y);
    const core = clamp(Math.round(intensity), 1, 4096);
    const halo = Math.max(1, Math.floor(core * 0.25));
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
      clamp(Math.round(charge), 1, 4096),
      payload,
    );
  },

  emitAtomPheromone: (x: number, y: number, intensity: number, role = 0) => {
    lastInternalAtomPheromoneSeeds++;
    incrementRoleCounter(lastAtomRolePheromone, role);
    GLYPH_BUFFER.depositPheromone(x, y, intensity);
  },

  emitAtomPlasmid: (
    x: number,
    y: number,
    charge: number,
    payload: Uint8Array,
    role = 0,
  ) => {
    lastInternalAtomPlasmidSeeds++;
    incrementRoleCounter(lastAtomRolePlasmid, role);
    GLYPH_BUFFER.depositPlasmid(x, y, charge, payload);
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

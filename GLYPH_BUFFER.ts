import { GRID_CELLS, GRID_H, GRID_W } from "./OFFSETS.ts";
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

type GlyphKind = typeof GLYPH_KIND[keyof typeof GLYPH_KIND];

type GlyphSnapshot = {
  activeCells: number;
  pheromoneCells: number;
  plasmidCells: number;
  maxAmplitude: number;
  totalAmplitude: number;
};

const scratchHeader = new Int32Array(GRID_CELLS);
const scratchPayload = new Uint8Array(GRID_CELLS * 8);

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
  const gy = clamp(Math.floor(wy / 10), 0, GRID_H - 1);
  return gy * GRID_W + gx;
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

const decayForKind = (kind: GlyphKind, amplitude: number): number => {
  if (kind === GLYPH_KIND.PLASMID) {
    return amplitude > 256 ? 3 : 1;
  }
  if (kind === GLYPH_KIND.PHEROMONE) {
    return amplitude > 64 ? 8 : 4;
  }
  return amplitude;
};

const diffusionShareForKind = (kind: GlyphKind, amplitude: number): number => {
  if (kind === GLYPH_KIND.PLASMID) {
    return amplitude >= 96 ? Math.floor(amplitude * 0.125) : 0;
  }
  if (kind === GLYPH_KIND.PHEROMONE) {
    return amplitude >= 24 ? Math.floor(amplitude * 0.25) : 0;
  }
  return 0;
};

const nextCellForDiffusion = (cell: number, tick: number): number => {
  const gx = cell % GRID_W;
  const gy = Math.floor(cell / GRID_W);
  const selector = (tick + cell) & 3;
  if (selector === 0 && gx < GRID_W - 1) return cell + 1;
  if (selector === 1 && gy < GRID_H - 1) return cell + GRID_W;
  if (selector === 2 && gx > 0) return cell - 1;
  if (selector === 3 && gy > 0) return cell - GRID_W;
  return cell;
};

const writeScratch = (
  cell: number,
  kind: GlyphKind,
  amplitude: number,
): void => {
  if (amplitude <= 0) return;
  const current = scratchHeader[cell];
  const currentKind = unpackKind(current);
  const currentAmplitude = unpackAmplitude(current);
  const mergedKind = currentKind === GLYPH_KIND.NONE ? kind : currentKind;
  const mergedAmplitude = currentKind === kind
    ? Math.min(GLYPH_AMPLITUDE_MAX, currentAmplitude + amplitude)
    : Math.max(currentAmplitude, amplitude);
  scratchHeader[cell] = packHeader(mergedKind, mergedAmplitude);
};

export const GLYPH_BUFFER = {
  GLYPH_KIND,

  clear: () => {
    STATE_MATRIX.glyphHeaders.fill(0);
    STATE_MATRIX.glyphPayload.fill(0);
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

  tick: (tick: number): GlyphSnapshot => {
    scratchHeader.fill(0);
    scratchPayload.fill(0);

    for (let cell = 0; cell < GRID_CELLS; cell++) {
      const header = STATE_MATRIX.getGlyphHeader(cell);
      const kind = unpackKind(header);
      const amplitude = unpackAmplitude(header);
      if (kind === GLYPH_KIND.NONE || amplitude <= 0) continue;

      const decayed = Math.max(0, amplitude - decayForKind(kind, amplitude));
      if (decayed <= 0) continue;

      const share = diffusionShareForKind(kind, decayed);
      const retained = Math.max(0, decayed - share);
      writeScratch(cell, kind, retained);
      if (kind === GLYPH_KIND.PLASMID && retained > 0) {
        const targetOffset = cell * 8;
        scratchPayload.set(STATE_MATRIX.getGlyphPayload(cell), targetOffset);
      }

      if (share > 0) {
        const nextCell = nextCellForDiffusion(cell, tick);
        writeScratch(nextCell, kind, share);
        if (kind === GLYPH_KIND.PLASMID && nextCell !== cell) {
          const targetOffset = nextCell * 8;
          scratchPayload.set(STATE_MATRIX.getGlyphPayload(cell), targetOffset);
        }
      }
    }

    let activeCells = 0;
    let pheromoneCells = 0;
    let plasmidCells = 0;
    let maxAmplitude = 0;
    let totalAmplitude = 0;

    for (let cell = 0; cell < GRID_CELLS; cell++) {
      const header = scratchHeader[cell];
      Atomics.store(STATE_MATRIX.glyphHeaders, cell, header);
      const kind = unpackKind(header);
      const amplitude = unpackAmplitude(header);
      if (amplitude > 0) {
        activeCells++;
        totalAmplitude += amplitude;
        if (amplitude > maxAmplitude) maxAmplitude = amplitude;
        if (kind === GLYPH_KIND.PHEROMONE) pheromoneCells++;
        if (kind === GLYPH_KIND.PLASMID) plasmidCells++;
      }
    }
    STATE_MATRIX.glyphPayload.set(scratchPayload);

    return {
      activeCells,
      pheromoneCells,
      plasmidCells,
      maxAmplitude,
      totalAmplitude,
    };
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

    return {
      activeCells,
      pheromoneCells,
      plasmidCells,
      maxAmplitude,
      totalAmplitude,
    };
  },
};

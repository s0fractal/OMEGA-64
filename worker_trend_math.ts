export const ensurePositive = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export const limitByRatioAndDelta = (
  baseline: number,
  ratioMax: number,
  deltaMax: number,
): number => (baseline * ratioMax) + deltaMax;

export const limitByRatioAndDeltaCeil = (
  baseline: number,
  ratioMax: number,
  deltaMax: number,
): number => Math.ceil(limitByRatioAndDelta(baseline, ratioMax, deltaMax));

export const minByRatio = (baseline: number, ratioMin: number): number =>
  baseline * ratioMin;

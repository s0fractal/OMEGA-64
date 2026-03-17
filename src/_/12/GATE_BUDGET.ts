// SSoT: file:///Users/s0fractal/OMEGA/I/core/gate_budget.md
import { GateMergedDelta, CRYSTALLIZATION_CONFIG } from "@g11";

const totalAbsDeltaRounded = (combinedDelta: Map<number, number>): number => {
  let total = 0;
  for (const val of combinedDelta.values()) {
    total += Math.abs(Math.round(val));
  }
  return total;
};

const computeScaleFactor = (
  totalAbsDelta: number,
  maxTotalAbsDeltaPerTick: number,
): number => {
  if (totalAbsDelta <= 0) return 1;
  if (totalAbsDelta <= maxTotalAbsDeltaPerTick) return 1;
  return maxTotalAbsDeltaPerTick / totalAbsDelta;
};

const flattenScaledDelta = (
  combinedDelta: Map<number, number>,
  scaleFactor: number,
): GateMergedDelta =>
  Array.from(combinedDelta.entries()).map(([level, value]) => ({
    level,
    value: Math.round(value * scaleFactor),
  }));

export const GATE_BUDGET = {
  totalAbsDeltaRounded,
  computeScaleFactor,
  flattenScaledDelta,
};

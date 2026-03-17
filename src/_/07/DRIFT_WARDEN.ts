// SSoT: file:///Users/s0fractal/OMEGA/I/core/drift_warden.md
import { COHERENCE_OFFSET, ENERGY_OFFSET, IDS_OFFSET, LOGGER, Li, MAX_ATOMS, sharedBuffer, DriftMetrics } from "@g06";

// OMEGA-64 | DRIFT_WARDEN.ts | Stage 22: Adaptive Genesis & Drift Response

/**
 * DriftWarden monitors the global state for behavioral anomalies and instability.
 */
export class DriftWarden {
  private energyView: Int32Array;
  private idsView: BigUint64Array;
  private coherenceView: Int32Array;

  private lastPopulation = 0;
  private driftThreshold = 0.65; // High drift signals instability

  constructor(
    customEnergyView?: Int32Array,
    customIdsView?: BigUint64Array,
    customCoherenceView?: Int32Array,
  ) {
    this.energyView = customEnergyView ??
      new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
    this.idsView = customIdsView ??
      new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
    this.coherenceView = customCoherenceView ??
      new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);
  }

  /**
   * Calculates the current drift status of the system.
   */
  public analyze(currentTick: number): DriftMetrics {
    const activeIds = [];
    let totalEnergy = 0;

    // 1. Gather active population metrics
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (this.idsView[i] !== 0n) {
        activeIds.push(i);
        totalEnergy += this.energyView[i];
      }
    }

    const population = activeIds.length;
    const avgEnergy = population > 0 ? totalEnergy / population : 0;

    // 2. Coherence (from WASM kernel neural sync)
    // Coherence is usually 0..1000 in our standard (fixed point)
    const rawCoherence = Atomics.load(this.coherenceView, 0);
    const coherenceNormalized = rawCoherence / 1000.0;

    // 3. Energy Variance (local stability)
    let varianceSum = 0;
    if (population > 1) {
      for (const idx of activeIds) {
        const diff = this.energyView[idx] - avgEnergy;
        varianceSum += diff * diff;
      }
    }
    const energyVariance = population > 0
      ? Math.sqrt(varianceSum / population) / 1000.0
      : 0;

    // 4. Population Stability (Delta from last analysis)
    const popDelta = Math.abs(population - this.lastPopulation);
    const populationStability = population > 0
      ? 1.0 - Math.min(1.0, popDelta / (population * 0.1))
      : 1.0;
    this.lastPopulation = population;

    // 5. Final Drift Index Calculation
    // High drift = Low coherence, High variance, Low stability
    const driftIndex = ((1.0 - coherenceNormalized) * 0.5) +
      (Math.min(1.0, energyVariance) * 0.3) +
      ((1.0 - populationStability) * 0.2);

    const shadowForkRecommended = driftIndex > this.driftThreshold;

    if (currentTick % 100 === 0) {
      Li(
        `[DRIFT WARDEN] Tick ${currentTick} | Drift: ${
          driftIndex.toFixed(4)
        } | Coherence: ${
          coherenceNormalized.toFixed(4)
        } | Fork: ${shadowForkRecommended}`,
      );
    }

    return {
      coherence: coherenceNormalized,
      energyVariance,
      populationStability,
      driftIndex,
      shadowForkRecommended,
    };
  }
}

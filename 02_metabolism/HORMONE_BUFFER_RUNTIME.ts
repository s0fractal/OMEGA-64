import { HORMONE_BUFFER_CATALOG, type HormoneId } from "./HORMONE_BUFFER.ts";
import { RUNTIME_POLICY } from "../03_governance/RUNTIME_POLICY.ts";

export type HormoneSyncInput = {
  baseTax: number;
  targetEnergy: number;
  workerCount: number;
  egoPressure: number;
  fearPressure: number;
  noveltyPressure: number;
  symbiosisPressure: number;
  maxPlasmidCharge: number;
  pressureRingScale: number;
  // Generic Ledger inputs (Stage 7.2)
  homeostasisBand: number;
  homeostasisMaxDelta: number;
  homeostasisOverflowThreshold: number;
  daemonMaxActions: number;
  federationDegradeEnergyRatio: number;
  globalSyntropy: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Synchronizes physiological signals from host runtimes into the shared memory lattice.
 * This allows the WASM λ-VM to read global "hormones" directly.
 */
export const syncHormonesToLattice = (
  input: HormoneSyncInput,
): Record<HormoneId, number> => {
  return {
    entropy_pressure: Math.round(
      clamp(
        (input.baseTax / Math.max(1, input.homeostasisMaxDelta)) * 1024 +
          (1024 / Math.max(1, input.homeostasisBand)),
        0,
        2048,
      ),
    ),
    time_viscosity: Math.round(
      clamp(
        (input.daemonMaxActions / 128) * 1024,
        0,
        2048,
      ),
    ),
    aggression: Math.round(
      clamp(input.egoPressure + input.fearPressure, 0, 2048),
    ),
    replication_bias: Math.round(
      clamp(
        input.noveltyPressure +
          ((1 - input.homeostasisOverflowThreshold) * 512),
        0,
        2048,
      ),
    ),
    repair_drive: Math.round(
      clamp(
        input.symbiosisPressure +
          ((1 - input.federationDegradeEnergyRatio) * 1024),
        0,
        2048,
      ),
    ),
    mutation_friction: Math.round(
      clamp(
        (input.maxPlasmidCharge / Math.max(1, input.pressureRingScale)) * 256,
        0,
        2048,
      ),
    ),
    global_consensus: Math.round(clamp(input.globalSyntropy * 1024, 0, 2048)),
  };
};

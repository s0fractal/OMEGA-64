import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { HORMONE_BUFFER_CATALOG } from "./HORMONE_BUFFER.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

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
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Synchronizes physiological signals from host runtimes into the shared memory lattice.
 * This allows the WASM λ-VM to read global "hormones" directly.
 */
export const syncHormonesToLattice = (input: HormoneSyncInput): void => {
  // 1. entropy_pressure (derived from baseTax)
  const entropyPressure = Math.round(
    clamp(
      (input.baseTax / Math.max(1, RUNTIME_POLICY.pulse.homeostasis.maxDelta)) * 1024,
      0,
      2048,
    ),
  );
  STATE_MATRIX.setHormone(0, entropyPressure);

  // 2. time_viscosity (derived from workerCount)
  const timeViscosity = Math.round(
    clamp((input.workerCount / 32) * 2048, 0, 2048),
  );
  STATE_MATRIX.setHormone(1, timeViscosity);

  // 3. aggression (ego + fear)
  const aggression = Math.round(
    clamp(input.egoPressure + input.fearPressure, 0, 2048),
  );
  STATE_MATRIX.setHormone(2, aggression);

  // 4. replication_bias (novelty + coldstart ratio)
  const replicationBias = Math.round(
    clamp(
      input.noveltyPressure + (RUNTIME_POLICY.coldstart.replicatorRatio * 256),
      0,
      2048,
    ),
  );
  STATE_MATRIX.setHormone(3, replicationBias);

  // 5. repair_drive (symbiosis + degrade ratio inverse)
  const repairDrive = Math.round(
    clamp(
      input.symbiosisPressure +
        ((1 - RUNTIME_POLICY.federation.admission.degradeEnergyRatio) * 1024),
      0,
      2048,
    ),
  );
  STATE_MATRIX.setHormone(4, repairDrive);

  // 6. mutation_friction (maxPlasmidCharge / ringScale)
  const mutationFriction = Math.round(
    clamp(
      (input.maxPlasmidCharge / Math.max(1, input.pressureRingScale)) * 256,
      0,
      2048,
    ),
  );
  STATE_MATRIX.setHormone(5, mutationFriction);
};

// SSoT: file:///Users/s0fractal/OMEGA/I/core/hormone_buffer.md
import { createLedgerRuntime, HormoneId, HormoneDomain, HormoneSpec, RUNTIME_POLICY, GENERIC_LEDGER_SYSTEM } from "@g09";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const pressureScale = Math.max(1, RUNTIME_POLICY.pulse.pressureRing.scale);

const hormone = (
  spec: Omit<HormoneSpec, "index">,
  index: number,
): HormoneSpec => ({
  ...spec,
  index,
  defaultValue: clamp(spec.defaultValue, spec.min, spec.max),
});

export const HORMONE_ENTROPY_PRESSURE = 0;
export const HORMONE_TIME_VISCOSITY = 1;
export const HORMONE_AGGRESSION = 2;
export const HORMONE_REPLICATION_BIAS = 3;
export const HORMONE_REPAIR_DRIVE = 4;
export const HORMONE_MUTATION_FRICTION = 5;
export const HORMONE_GLOBAL_CONSENSUS = 6;

export const HORMONE_BUFFER_CATALOG: readonly HormoneSpec[] = Object.freeze([
  hormone({
    id: "entropy_pressure",
    domain: "systemic",
    min: 0,
    max: 2048,
    defaultValue: Math.round(
      clamp(
        (RUNTIME_POLICY.pulse.homeostasis.baseTax /
          Math.max(1, RUNTIME_POLICY.pulse.homeostasis.maxDelta)) * 1024,
        0,
        2048,
      ),
    ),
    controlPlane: "mixed",
    sourcePath: "pulse.homeostasis.baseTax",
    notes:
      "Derived from homeostasis taxation. Higher values mean the world burns surplus energy faster.",
  }, HORMONE_ENTROPY_PRESSURE),
  hormone({
    id: "time_viscosity",
    domain: "temporal",
    min: 0,
    max: 2048,
    defaultValue: Math.round(
      clamp(
        (RUNTIME_POLICY.pulse.workerCount / 32) * 2048,
        0,
        2048,
      ),
    ),
    controlPlane: "pulse",
    sourcePath: "pulse.workerCount",
    notes:
      "Proxy for how dense each tick may become relative to available worker throughput.",
  }, HORMONE_TIME_VISCOSITY),
  hormone({
    id: "aggression",
    domain: "conflict",
    min: 0,
    max: 2048,
    defaultValue: clamp(
      RUNTIME_POLICY.pulse.egoPressure + RUNTIME_POLICY.pulse.fearPressure,
      0,
      2048,
    ),
    controlPlane: "mixed",
    sourcePath: "pulse.egoPressure + pulse.fearPressure",
    notes:
      "Conflict climate projected from the current pressure ring / signed pressure state.",
  }, HORMONE_AGGRESSION),
  hormone({
    id: "replication_bias",
    domain: "reproduction",
    min: 0,
    max: 2048,
    defaultValue: clamp(
      RUNTIME_POLICY.pulse.noveltyPressure +
        Math.round(
          (RUNTIME_POLICY.coldstart.replicatorRatio / 1) * 256,
        ),
      0,
      2048,
    ),
    controlPlane: "mixed",
    sourcePath: "pulse.noveltyPressure + coldstart.replicatorRatio",
    notes:
      "Bias toward exploratory reproduction. Uses current novelty pressure with a coldstart baseline.",
  }, HORMONE_REPLICATION_BIAS),
  hormone({
    id: "repair_drive",
    domain: "repair",
    min: 0,
    max: 2048,
    defaultValue: clamp(
      RUNTIME_POLICY.pulse.symbiosisPressure +
        Math.round(
          (1 - RUNTIME_POLICY.federation.admission.degradeEnergyRatio) * 1024,
        ),
      0,
      2048,
    ),
    controlPlane: "mixed",
    sourcePath:
      "pulse.symbiosisPressure + federation.admission.degradeEnergyRatio",
    notes:
      "World tendency to preserve/repair structure instead of letting mutations land at full energy.",
  }, HORMONE_REPAIR_DRIVE),
  hormone({
    id: "mutation_friction",
    domain: "mutation",
    min: 0,
    max: 2048,
    defaultValue: clamp(
      Math.round(
        (RUNTIME_POLICY.daemon.maxPlasmidCharge /
          Math.max(1, pressureScale)) * 256,
      ),
      0,
      2048,
    ),
    controlPlane: "daemon",
    sourcePath: "daemon.maxPlasmidCharge / pulse.pressureRing.scale",
    notes:
      "How expensive it is for daemon-side symbolic ingress to cross the membrane.",
  }, HORMONE_MUTATION_FRICTION),
  hormone({
    id: "global_consensus",
    domain: "systemic",
    min: 0,
    max: 2048,
    defaultValue: 0,
    controlPlane: "pulse",
    sourcePath: "pulse.syntropy",
    notes:
      "Global measure of structural syntropy (quorum coherence). Higher values signal a stable, organized reality.",
  }, HORMONE_GLOBAL_CONSENSUS),
]);

const HORMONE_BY_ID = new Map<HormoneId, HormoneSpec>(
  HORMONE_BUFFER_CATALOG.map((spec) => [spec.id, spec]),
);

export const hormoneSpecById = (id: HormoneId): HormoneSpec | null =>
  HORMONE_BY_ID.get(id) ?? null;

export const HORMONE_BUFFER_LENGTH = HORMONE_BUFFER_CATALOG.length;

export const hormoneBaselineState = (): Record<HormoneId, number> =>
  Object.fromEntries(
    HORMONE_BUFFER_CATALOG.map((spec) => [spec.id, spec.defaultValue]),
  ) as Record<HormoneId, number>;

export const createPhysiologicalLedgerRuntime = (
  id: HormoneId,
  initialValue?: number,
  historyLimit = 32,
): LedgerRuntimeState<HormoneId> => {
  const spec = hormoneSpecById(id);
  if (!spec) throw new Error(`[HORMONE_BUFFER] missing ${id} spec`);
  const config: LedgerRuntimeConfig<HormoneId> = {
    key: spec.id,
    defaultValue: spec.defaultValue,
    min: spec.min,
    max: spec.max,
    rollbackClass: "immediate", // Physiologies adapt instantly
  };
  return createLedgerRuntime(config, initialValue, historyLimit);
};

export const HORMONE_BUFFER = {
  HORMONE_BUFFER_CATALOG,
  hormoneSpecById,
  HORMONE_BUFFER_LENGTH,
  hormoneBaselineState,
  createPhysiologicalLedgerRuntime,
};

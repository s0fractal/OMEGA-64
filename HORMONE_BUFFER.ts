import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

export type HormoneId =
  | "entropy_pressure"
  | "time_viscosity"
  | "aggression"
  | "replication_bias"
  | "repair_drive"
  | "mutation_friction"
  | "global_consensus";

export type HormoneDomain = "systemic" | "temporal" | "conflict" | "reproduction" | "repair" | "mutation";

export type HormoneSpec = {
  id: HormoneId;
  index: number;
  domain: HormoneDomain;
  min: number;
  max: number;
  defaultValue: number;
  controlPlane: "daemon" | "pulse" | "mixed";
  sourcePath: string;
  notes: string;
};

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
  }, 0),
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
  }, 1),
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
  }, 2),
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
  }, 3),
  hormone({
    id: "repair_drive",
    domain: "repair",
    min: 0,
    max: 2048,
    defaultValue: clamp(
      RUNTIME_POLICY.pulse.symbiosisPressure +
        Math.round((1 - RUNTIME_POLICY.federation.admission.degradeEnergyRatio) * 1024),
      0,
      2048,
    ),
    controlPlane: "mixed",
    sourcePath: "pulse.symbiosisPressure + federation.admission.degradeEnergyRatio",
    notes:
      "World tendency to preserve/repair structure instead of letting mutations land at full energy.",
  }, 4),
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
  }, 5),
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
  }, 6),
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

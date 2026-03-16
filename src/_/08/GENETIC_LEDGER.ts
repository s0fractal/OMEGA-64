// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/genetic_ledger.md

import { RUNTIME_POLICY } from "../02/RUNTIME_POLICY.ts";

export type GeneticLedgerKey =
  | "pulse.homeostasis.targetEnergy"
  | "pulse.homeostasis.band"
  | "pulse.homeostasis.maxDelta"
  | "pulse.homeostasis.overflowThreshold"
  | "pulse.homeostasis.baseTax"
  | "pulse.pressureRing.scale"
  | "daemon.maxActionsPerWindow"
  | "daemon.maxPheromoneIntensity"
  | "daemon.maxPlasmidCharge"
  | "federation.admission.degradeEnergyRatio"
  | "federation.admission.degradeResonanceRatio";

export type LedgerMutability =
  | "hard-invariant"
  | "bounded-runtime"
  | "daemon-governed";

export type GeneticLedgerEntry = {
  key: GeneticLedgerKey;
  defaultValue: number;
  min: number;
  max: number;
  mutability: LedgerMutability;
  hormoneLink: string | null;
  rollbackClass: "immediate" | "epochal";
  sourcePath: string;
  notes: string;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const ledgerEntry = (entry: GeneticLedgerEntry): GeneticLedgerEntry => ({
  ...entry,
  defaultValue: clamp(entry.defaultValue, entry.min, entry.max),
});

export const GENETIC_LEDGER_CATALOG: readonly GeneticLedgerEntry[] = Object
  .freeze([
    ledgerEntry({
      key: "pulse.homeostasis.targetEnergy",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.targetEnergy,
      min: 1,
      max: 10_000,
      mutability: "daemon-governed",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.targetEnergy",
      notes: "Primary metabolic target for average energy plateau.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.band",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.band,
      min: 1,
      max: 4096,
      mutability: "bounded-runtime",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.band",
      notes: "Acceptable energy band around the target plateau.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.maxDelta",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.maxDelta,
      min: 1,
      max: 256,
      mutability: "bounded-runtime",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.maxDelta",
      notes: "Per-tick cap for host-side homeostasis adjustments.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.overflowThreshold",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.overflowThreshold,
      min: 0.01,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "time_viscosity",
      rollbackClass: "epochal",
      sourcePath: "pulse.homeostasis.overflowThreshold",
      notes:
        "Threshold where spatial overflow starts contributing to taxation.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.baseTax",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.baseTax,
      min: 0,
      max: 128,
      mutability: "daemon-governed",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.baseTax",
      notes: "Base metabolic tax applied before overflow-specific pressure.",
    }),
    ledgerEntry({
      key: "pulse.pressureRing.scale",
      defaultValue: RUNTIME_POLICY.pulse.pressureRing.scale,
      min: 0,
      max: 2048,
      mutability: "daemon-governed",
      hormoneLink: "aggression",
      rollbackClass: "immediate",
      sourcePath: "pulse.pressureRing.scale",
      notes:
        "Global amplitude of the pressure ring projected into signed axes.",
    }),
    ledgerEntry({
      key: "daemon.maxActionsPerWindow",
      defaultValue: RUNTIME_POLICY.daemon.maxActionsPerWindow,
      min: 1,
      max: 128,
      mutability: "bounded-runtime",
      hormoneLink: "time_viscosity",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxActionsPerWindow",
      notes: "Daemon action budget before rate-limiting blocks ingress.",
    }),
    ledgerEntry({
      key: "daemon.maxPheromoneIntensity",
      defaultValue: RUNTIME_POLICY.daemon.maxPheromoneIntensity,
      min: 1,
      max: 4096,
      mutability: "daemon-governed",
      hormoneLink: "aggression",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxPheromoneIntensity",
      notes: "Upper membrane intensity for soft external perturbations.",
    }),
    ledgerEntry({
      key: "daemon.maxPlasmidCharge",
      defaultValue: RUNTIME_POLICY.daemon.maxPlasmidCharge,
      min: 1,
      max: 4096,
      mutability: "daemon-governed",
      hormoneLink: "mutation_friction",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxPlasmidCharge",
      notes: "Upper membrane intensity for durable symbolic cargo.",
    }),
    ledgerEntry({
      key: "federation.admission.degradeEnergyRatio",
      defaultValue: RUNTIME_POLICY.federation.admission.degradeEnergyRatio,
      min: 0.1,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "repair_drive",
      rollbackClass: "epochal",
      sourcePath: "federation.admission.degradeEnergyRatio",
      notes:
        "How sharply external federated ingress loses energy under degradation.",
    }),
    ledgerEntry({
      key: "federation.admission.degradeResonanceRatio",
      defaultValue: RUNTIME_POLICY.federation.admission.degradeResonanceRatio,
      min: 0.1,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "repair_drive",
      rollbackClass: "epochal",
      sourcePath: "federation.admission.degradeResonanceRatio",
      notes:
        "How sharply external federated ingress loses resonance under degradation.",
    }),
  ]);

const LEDGER_BY_KEY = new Map<GeneticLedgerKey, GeneticLedgerEntry>(
  GENETIC_LEDGER_CATALOG.map((entry) => [entry.key, entry]),
);

export const geneticLedgerEntryByKey = (
  key: GeneticLedgerKey,
): GeneticLedgerEntry | null => LEDGER_BY_KEY.get(key) ?? null;

export const geneticLedgerBaseline = (): Record<GeneticLedgerKey, number> =>
  Object.fromEntries(
    GENETIC_LEDGER_CATALOG.map((entry) => [entry.key, entry.defaultValue]),
  ) as Record<GeneticLedgerKey, number>;

export const GENETIC_LEDGER = {
  geneticLedgerEntryByKey,
  geneticLedgerBaseline
};

import {
  GENETIC_LEDGER_CATALOG,
  type GeneticLedgerEntry,
  type GeneticLedgerKey,
} from "./GENETIC_LEDGER.ts";
import {
  HORMONE_BUFFER_CATALOG,
  type HormoneId,
  type HormoneSpec,
} from "./HORMONE_BUFFER.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

export type PhysiologyHomeostasisInput = {
  targetEnergyCurrent: number;
  band: number;
  maxDelta: number;
  overflowThreshold: number;
  baseTaxCurrent: number;
};

export type PhysiologyPressureInput = {
  novelty: number;
  fear: number;
  symbiosis: number;
  ego: number;
  ring: {
    scale: number;
  };
};

export type PhysiologySnapshotInput = {
  tick: number;
  homeostasis: PhysiologyHomeostasisInput;
  pressure: PhysiologyPressureInput;
};

export type HormoneSnapshot = HormoneSpec & {
  currentValue: number;
  deltaFromDefault: number;
};

export type LedgerSnapshot = GeneticLedgerEntry & {
  currentValue: number;
  deltaFromDefault: number;
  currentSource: "runtime" | "policy";
};

export type PhysiologySnapshot = {
  tick: number;
  hormones: Record<HormoneId, HormoneSnapshot>;
  ledger: Record<GeneticLedgerKey, LedgerSnapshot>;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const currentHormoneValue = (
  spec: HormoneSpec,
  input: PhysiologySnapshotInput,
): number => {
  switch (spec.id) {
    case "entropy_pressure":
      return Math.round(
        clamp(
          (input.homeostasis.baseTaxCurrent /
            Math.max(1, input.homeostasis.maxDelta)) * 1024,
          spec.min,
          spec.max,
        ),
      );
    case "time_viscosity":
      return Math.round(
        clamp(
          (RUNTIME_POLICY.pulse.workerCount / 32) * 2048,
          spec.min,
          spec.max,
        ),
      );
    case "aggression":
      return Math.round(
        clamp(input.pressure.fear + input.pressure.ego, spec.min, spec.max),
      );
    case "replication_bias":
      return Math.round(
        clamp(
          input.pressure.novelty +
            Math.round(RUNTIME_POLICY.coldstart.replicatorRatio * 256),
          spec.min,
          spec.max,
        ),
      );
    case "repair_drive":
      return Math.round(
        clamp(
          input.pressure.symbiosis +
            Math.round(
              (1 - RUNTIME_POLICY.federation.admission.degradeEnergyRatio) *
                1024,
            ),
          spec.min,
          spec.max,
        ),
      );
    case "mutation_friction":
      return Math.round(
        clamp(
          (RUNTIME_POLICY.daemon.maxPlasmidCharge /
            Math.max(1, input.pressure.ring.scale)) * 256,
          spec.min,
          spec.max,
        ),
      );
  }
};

const currentLedgerValue = (
  entry: GeneticLedgerEntry,
  input: PhysiologySnapshotInput,
): { currentValue: number; currentSource: "runtime" | "policy" } => {
  switch (entry.key) {
    case "pulse.homeostasis.targetEnergy":
      return {
        currentValue: clamp(
          input.homeostasis.targetEnergyCurrent,
          entry.min,
          entry.max,
        ),
        currentSource: "runtime",
      };
    case "pulse.homeostasis.band":
      return {
        currentValue: clamp(input.homeostasis.band, entry.min, entry.max),
        currentSource: "runtime",
      };
    case "pulse.homeostasis.maxDelta":
      return {
        currentValue: clamp(input.homeostasis.maxDelta, entry.min, entry.max),
        currentSource: "runtime",
      };
    case "pulse.homeostasis.overflowThreshold":
      return {
        currentValue: clamp(
          input.homeostasis.overflowThreshold,
          entry.min,
          entry.max,
        ),
        currentSource: "runtime",
      };
    case "pulse.homeostasis.baseTax":
      return {
        currentValue: clamp(input.homeostasis.baseTaxCurrent, entry.min, entry.max),
        currentSource: "runtime",
      };
    case "pulse.pressureRing.scale":
      return {
        currentValue: clamp(input.pressure.ring.scale, entry.min, entry.max),
        currentSource: "runtime",
      };
    default:
      return {
        currentValue: entry.defaultValue,
        currentSource: "policy",
      };
  }
};

export const capturePhysiologySnapshot = (
  input: PhysiologySnapshotInput,
): PhysiologySnapshot => {
  const hormones = Object.fromEntries(
    HORMONE_BUFFER_CATALOG.map((spec) => {
      const currentValue = currentHormoneValue(spec, input);
      return [spec.id, {
        ...spec,
        currentValue,
        deltaFromDefault: currentValue - spec.defaultValue,
      }];
    }),
  ) as Record<HormoneId, HormoneSnapshot>;

  const ledger = Object.fromEntries(
    GENETIC_LEDGER_CATALOG.map((entry) => {
      const live = currentLedgerValue(entry, input);
      return [entry.key, {
        ...entry,
        currentValue: live.currentValue,
        currentSource: live.currentSource,
        deltaFromDefault: live.currentValue - entry.defaultValue,
      }];
    }),
  ) as Record<GeneticLedgerKey, LedgerSnapshot>;

  return {
    tick: Math.max(0, Math.floor(input.tick)),
    hormones,
    ledger,
  };
};

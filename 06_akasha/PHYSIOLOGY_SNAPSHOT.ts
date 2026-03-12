import { GENETIC_LEDGER_CATALOG, type GeneticLedgerEntry, type GeneticLedgerKey } from "@03";
import { HORMONE_BUFFER_CATALOG, type HormoneId, type HormoneSpec } from "@02";
import type { LedgerRuntimeSnapshot } from "@03";

export type PhysiologySnapshotInput = {
  tick: number;
  hormones: Record<HormoneId, LedgerRuntimeSnapshot<HormoneId>>;
  ledger: Partial<
    Record<GeneticLedgerKey, LedgerRuntimeSnapshot<GeneticLedgerKey>>
  >;
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

export const capturePhysiologySnapshot = (
  input: PhysiologySnapshotInput,
): PhysiologySnapshot => {
  const hormones = Object.fromEntries(
    HORMONE_BUFFER_CATALOG.map((spec) => {
      const snap = input.hormones[spec.id];
      const val = snap ? snap.currentValue : spec.defaultValue;
      return [spec.id, {
        ...spec,
        currentValue: val,
        deltaFromDefault: val - spec.defaultValue,
      }];
    }),
  ) as Record<HormoneId, HormoneSnapshot>;

  const ledger = Object.fromEntries(
    GENETIC_LEDGER_CATALOG.map((entry) => {
      const snap = input.ledger[entry.key];
      const val = snap ? snap.currentValue : entry.defaultValue;
      const src = snap ? "runtime" : "policy";
      return [entry.key, {
        ...entry,
        currentValue: val,
        currentSource: src,
        deltaFromDefault: val - entry.defaultValue,
      }];
    }),
  ) as Record<GeneticLedgerKey, LedgerSnapshot>;

  return {
    tick: Math.max(0, Math.floor(input.tick)),
    hormones,
    ledger,
  };
};

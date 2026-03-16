// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/physiology_snapshot.md
import { GENETIC_LEDGER_CATALOG, HORMONE_BUFFER_CATALOG, PhysiologySnapshotInput, HormoneSnapshot, LedgerSnapshot, PhysiologySnapshot, HORMONE_BUFFER, TYPES } from "@g10";

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
    GENETIC_LEDGER_CATALOG.map((entry: GeneticLedgerEntry) => {
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

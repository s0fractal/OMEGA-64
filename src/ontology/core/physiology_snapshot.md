---
id: PHYSIOLOGY_SNAPSHOT
type: module
description: Migrated from src/06/PHYSIOLOGY_SNAPSHOT.ts
tags:
  - membrane
  - host
deps:
  - HORMONE_BUFFER
min_level: 9
vars:
  - GENETIC_LEDGER_CATALOG
  - HORMONE_BUFFER_CATALOG
extra_symbols:
  - HormoneSnapshot
  - LedgerSnapshot
  - PhysiologySnapshot
  - PhysiologySnapshotInput
  - capturePhysiologySnapshot
---

### TypeScript

```typescript
import type { LedgerRuntimeSnapshot } from "@generated";

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
```

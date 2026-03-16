---
id: GATE_LEDGER
type: module
description: Implementation of GATE_LEDGER
tags: []
min_level: 12
extra_symbols:
  - GATE_LEDGER
  - persistGateLedgerArtifacts
deps:
  - TYPES
---

### TypeScript
```typescript





export const persistGateLedgerArtifacts = async (
  bridgeEvent: BridgeModeEvent,
  event: LedgerEvent,
  config: GateConfig,
  envelopeIndexPath: string,
  nextTick: number,
  nextHash: string,
  nextStateI16: Int16Array,
  autoCheckpointInterval: number,
): Promise<void> => {
  await LEDGER.append(bridgeEvent);
  await LEDGER.append(event);

  if (!config.dry_run) {
    await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
      event,
      envelopeIndexPath,
    );
  }

  if (!config.dry_run && nextTick % autoCheckpointInterval === 0) {
    try {
      await CHECKPOINT.save(
        {
          tick: nextTick,
          state_hash: nextHash,
          state_i16: nextStateI16,
        },
        "AUTO_INTERVAL",
      );
    } catch {
      // Checkpoints are safety accelerators, not mutation authority.
    }
  }
};

export const GATE_LEDGER = {
};
```

// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate_ledger.md

import { type BridgeModeEvent, type LedgerEvent, type GateConfig } from "@g00";
import { LEDGER__08_00_LEDGER as LEDGER, PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX, CHECKPOINT_CHECKPOINT as CHECKPOINT } from "@g08";

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
  persistGateLedgerArtifacts
};

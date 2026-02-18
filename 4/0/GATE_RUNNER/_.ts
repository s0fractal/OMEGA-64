// i.L32.core.GATE_RUNNER.ts
// OMEGA-64 | Minimal runtime runner that routes all gate mutations via GATE_PIPELINE.

import { GATE_PIPELINE_GATE_PIPELINE as GATE_PIPELINE } from "@omega";
import type { CANON_CAUSAL_BRIDGE as BridgeMode } from "@omega";
import type { REPLAY_AUDIT__08_00_ReplayAuditOptions as ReplayAuditOptions, REPLAY_AUDIT__08_00_ReplayAuditResult as ReplayAuditResult, REPLAY_AUDIT__08_00_ReplayGenesis as ReplayGenesis, REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";
import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal, STATE_SNAPSHOT_GateConfig as GateConfig, STATE_SNAPSHOT_StateSnapshot as StateSnapshot } from "@omega";

export interface GateRunnerTickInput {
    state: StateSnapshot;
    proposals: DeltaProposal[];
    config: GateConfig;
    mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
    replayGenesis?: ReplayGenesis;
    replayAuditOptions?: ReplayAuditOptions;
    invariantReport?: ReplayInvariantReport;
    witness?: string;
}

export interface GateRunnerTickOutput {
    nextState: StateSnapshot;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_RUNNER = {
    step: async (input: GateRunnerTickInput): Promise<GateRunnerTickOutput> => {
        const mode = input.mode ?? (input.invariantReport ? "INVARIANT_CONTEXT" : "REPLAY_CONTEXT");
        if (mode === "INVARIANT_CONTEXT") {
            return await GATE_PIPELINE.processWithInvariantContext(
                input.state,
                input.proposals,
                input.config,
                input.invariantReport,
                input.witness
            );
        }

        return await GATE_PIPELINE.processWithReplayContext(
            input.state,
            input.proposals,
            input.config,
            {
                replayGenesis: input.replayGenesis,
                replayAuditOptions: input.replayAuditOptions,
                witness: input.witness
            }
        );
    }
};

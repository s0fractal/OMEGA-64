// i.L32.core.GATE_RUNNER.ts
// OMEGA-64 | Minimal runtime runner that routes all gate mutations via GATE_PIPELINE.

import { GATE_PIPELINE } from "./i.L32.core.GATE_PIPELINE.ts";
import type { BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import type { ReplayAuditOptions, ReplayAuditResult, ReplayGenesis, ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";
import type { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

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

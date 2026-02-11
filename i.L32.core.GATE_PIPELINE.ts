// i.L32.core.GATE_PIPELINE.ts
// OMEGA-64 | L32 pipeline entrypoint for gate processing with bridge context.

import { GATE } from "./i.L32.core.GATE.ts";
import { GATE_RUNTIME_CONTEXT } from "./i.L32.core.GATE_RUNTIME_CONTEXT.ts";
import type { DeltaProposal, GateConfig, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
    ReplayAuditOptions,
    ReplayAuditResult,
    ReplayGenesis,
    ReplayInvariantReport
} from "./i.L99.core.REPLAY_AUDIT.ts";
import type { BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";

export interface GatePipelineOptions {
    replayGenesis?: ReplayGenesis;
    replayAuditOptions?: ReplayAuditOptions;
    witness?: string;
}

export interface GatePipelineResult {
    nextState: StateSnapshot;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_PIPELINE = {
    processWithReplayContext: async (
        state: StateSnapshot,
        proposals: DeltaProposal[],
        config: GateConfig,
        options: GatePipelineOptions = {}
    ): Promise<GatePipelineResult> => {
        const replayGenesis: ReplayGenesis = options.replayGenesis ?? {
            tick: state.tick,
            state_i16: state.state_i16,
            state_hash: state.state_hash
        };

        const replayAuditOptions: ReplayAuditOptions = options.replayAuditOptions ?? {
            runs: 1,
            startTick: state.tick,
            endTick: state.tick
        };

        const envelope = await GATE_RUNTIME_CONTEXT.fromReplayAudit(
            replayGenesis,
            replayAuditOptions,
            options.witness
        );

        const nextState = await GATE.process(state, proposals, config, envelope.runtime);
        return {
            nextState,
            bridge_mode: envelope.bridge_mode,
            bridge_reason: envelope.bridge_reason,
            replay_audit: envelope.replay_audit
        };
    },

    processWithInvariantContext: async (
        state: StateSnapshot,
        proposals: DeltaProposal[],
        config: GateConfig,
        invariantReport?: ReplayInvariantReport,
        witness?: string
    ): Promise<GatePipelineResult> => {
        const envelope = GATE_RUNTIME_CONTEXT.fromInvariantReport(invariantReport, witness);
        const nextState = await GATE.process(state, proposals, config, envelope.runtime);
        return {
            nextState,
            bridge_mode: envelope.bridge_mode,
            bridge_reason: envelope.bridge_reason
        };
    }
};

// i.L32.core.GATE_PIPELINE.ts
// OMEGA-64 | L32 pipeline entrypoint for gate processing with bridge context.

import { GATE_GATE as GATE } from "@omega";
import { GATE_RUNTIME_CONTEXT_GATE_RUNTIME_CONTEXT as GATE_RUNTIME_CONTEXT } from "@omega";
import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal, STATE_SNAPSHOT_GateConfig as GateConfig, STATE_SNAPSHOT_StateSnapshot as StateSnapshot } from "@omega";
import type { REPLAY_AUDIT__08_00_ReplayAuditOptions as ReplayAuditOptions, REPLAY_AUDIT__08_00_ReplayAuditResult as ReplayAuditResult, REPLAY_AUDIT__08_00_ReplayGenesis as ReplayGenesis, REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";
import type { CANON_CAUSAL_BRIDGE as BridgeMode } from "@omega";

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

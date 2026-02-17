// i.L32.core.GATE_RUNTIME_CONTEXT.ts
// OMEGA-64 | L32 helper to build Gate runtime context from replay invariants.

import type { ReplayAuditOptions, ReplayAuditResult, ReplayGenesis, ReplayInvariantReport } from "../../../8/0/REPLAY_AUDIT/_.ts";
import { REPLAY_AUDIT } from "../../../8/0/REPLAY_AUDIT/_.ts";
import type { GateRuntimeContext } from "../GATE/_.ts";
import { CANON_CAUSAL_BRIDGE, type BridgeMode } from "../../../3/7/CANON_CAUSAL_BRIDGE/_.ts";
import { CRYSTALLIZATION_CONFIG } from "../../../8/1/CRYSTALLIZATION_CONFIG/_.ts";
import { INVARIANT_PACKET, type InvariantPacket } from "../INVARIANT_PACKET/_.ts";

export interface GateRuntimeContextEnvelope {
    runtime: GateRuntimeContext;
    bridge_mode: BridgeMode;
    bridge_reason: string;
    replay_audit?: ReplayAuditResult;
}

export const GATE_RUNTIME_CONTEXT = {
    fromInvariantReport: (
        invariant: ReplayInvariantReport | undefined,
        witness?: string
    ): GateRuntimeContextEnvelope => {
        const mode = CANON_CAUSAL_BRIDGE.resolveMode(invariant);
        return {
            runtime: {
                bridge_invariant_report: invariant,
                witness
            },
            bridge_mode: mode.mode,
            bridge_reason: mode.reason
        };
    },

    fromInvariantPacket: async (
        packet: InvariantPacket,
        witness?: string
    ): Promise<GateRuntimeContextEnvelope> => {
        const verified = await INVARIANT_PACKET.verify(packet);
        if (!verified.ok) {
            throw new Error(`Invalid invariant packet: ${verified.reasons.join("|")}`);
        }
        const report = INVARIANT_PACKET.toInvariantReport(packet);
        return GATE_RUNTIME_CONTEXT.fromInvariantReport(report, witness ?? packet.witness);
    },

    fromReplayAudit: async (
        genesis: ReplayGenesis,
        options: ReplayAuditOptions = {},
        witness?: string
    ): Promise<GateRuntimeContextEnvelope> => {
        const auditOptions: ReplayAuditOptions = {
            ...options,
            verifyLedgerChain: options.verifyLedgerChain ?? CRYSTALLIZATION_CONFIG.verifyLedgerChain
        };
        const audit = await REPLAY_AUDIT.audit(genesis, auditOptions);
        const out = GATE_RUNTIME_CONTEXT.fromInvariantReport(audit.invariantReport, witness);
        return {
            ...out,
            replay_audit: audit
        };
    }
};

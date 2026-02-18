// i.L32.core.GATE_RUNTIME_CONTEXT.ts
// OMEGA-64 | L32 helper to build Gate runtime context from replay invariants.

import type { REPLAY_AUDIT__08_00_ReplayAuditOptions as ReplayAuditOptions, REPLAY_AUDIT__08_00_ReplayAuditResult as ReplayAuditResult, REPLAY_AUDIT__08_00_ReplayGenesis as ReplayGenesis, REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";
import { REPLAY_AUDIT__08_00_REPLAY_AUDIT as REPLAY_AUDIT } from "@omega";
import type { GATE_GateRuntimeContext as GateRuntimeContext } from "@omega";
import { CANON_CAUSAL_BRIDGE, type CANON_CAUSAL_BRIDGE as BridgeMode } from "@omega";
import { CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG } from "@omega";
import { INVARIANT_PACKET_INVARIANT_PACKET as INVARIANT_PACKET, type INVARIANT_PACKET_InvariantPacket as InvariantPacket } from "@omega";

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

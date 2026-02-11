// i.L32.core.GATE_RUNTIME_CONTEXT.ts
// OMEGA-64 | L32 helper to build Gate runtime context from replay invariants.

import type { ReplayAuditOptions, ReplayAuditResult, ReplayGenesis, ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";
import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";
import type { GateRuntimeContext } from "./i.L32.core.GATE.ts";
import { CANON_CAUSAL_BRIDGE, type BridgeMode } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import { CRYSTALLIZATION_CONFIG } from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";

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

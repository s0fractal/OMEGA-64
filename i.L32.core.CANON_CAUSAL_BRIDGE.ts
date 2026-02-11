// i.L32.core.CANON_CAUSAL_BRIDGE.ts
// OMEGA-64 | L32 membrane runtime mapping for canon causal invariants.

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import type { ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";

export type BridgeMode = "GREEN" | "AMBER" | "RED";

export interface BridgeModeResolution {
    mode: BridgeMode;
    reason: string;
}

export const CANON_CAUSAL_BRIDGE = {
    resolveMode: (invariant?: ReplayInvariantReport): BridgeModeResolution => {
        if (!invariant || !invariant.index_chain_checked) {
            return { mode: "AMBER", reason: "CANON_CHAIN_UNCHECKED" };
        }
        if (!invariant.gate_admission_index_chain_checked) {
            return { mode: "AMBER", reason: "GATE_ADMISSION_CHAIN_UNCHECKED" };
        }
        if (!invariant.index_chain_ok) {
            return { mode: "RED", reason: "CANON_CHAIN_RED" };
        }
        if (!invariant.gate_admission_index_chain_ok) {
            return { mode: "RED", reason: "GATE_ADMISSION_CHAIN_RED" };
        }
        return { mode: "GREEN", reason: "INDEX_CHAIN_GREEN" };
    },

    isCanonBound: (proposal: DeltaProposal): boolean =>
        proposal.target_path === "CANON"
};

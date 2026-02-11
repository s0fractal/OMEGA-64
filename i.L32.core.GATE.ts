// i.L32.core.GATE.ts
// 🛡️ OMEGA-64 | Glider Lite | The Deterministic L32 Gate
// "No mutation without admission."

import { 
    StateSnapshot, 
    DeltaProposal, 
    GateConfig, 
    GateDecision, 
    LedgerEvent,
    REJECTION 
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";

export const GATE = {
    
    /**
     * The Core Function: Process proposals and produce a decision.
     * Pure function (mostly), side effect is only LEDGER emit.
     */
    process: async (
        state: StateSnapshot, 
        proposals: DeltaProposal[], 
        config: GateConfig
    ): Promise<StateSnapshot> => {
        
        const decision: GateDecision = {
            accepted_proposals: [],
            rejected_proposals: [],
            budget_used: 0,
            cost_used: 0,
            accepted_delta: []
        };

        // 1. Validation & Filtering
        const validProposals: DeltaProposal[] = [];
        
        for (const p of proposals) {
            // Check 1: Tick Mismatch
            if (p.tick !== state.tick) {
                decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.TICK_MISMATCH });
                continue;
            }
            // Check 2: Base Hash Mismatch
            if (p.base_state_hash !== state.state_hash) {
                decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.BASE_HASH_MISMATCH });
                continue;
            }
            // Check 3: Schema/Values (Simplified)
            if (!p.delta || p.delta.length === 0) {
                 decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.EMPTY_DELTA });
                 continue;
            }

            // ... Additional checks (bounds, cost) would go here ...
            
            validProposals.push(p);
        }

        // 2. Deterministic Sort (Canonical Order)
        validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

        // 3. Merge with Budget Enforcement
        const combinedDelta = new Map<number, number>();
        let currentTotalAbsDelta = 0;

        for (const p of validProposals) {
            // Check cost budget per agent
            if (p.cost_estimate > (config.max_cost_per_agent || Infinity)) {
                decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.COST_OVER_BUDGET });
                continue;
            }

            decision.accepted_proposals.push(p.proposal_id);
            decision.cost_used += p.cost_estimate;

            for (const d of p.delta) {
                // Clip per level
                let val = d.value;
                if (Math.abs(val) > config.max_abs_delta_per_level) {
                    val = Math.sign(val) * config.max_abs_delta_per_level;
                }
                
                const current = combinedDelta.get(d.level) || 0;
                combinedDelta.set(d.level, current + val);
            }
        }
        
        // 4. Global Budget Enforcement & Scaling
        // Calculate total absolute delta of the merged vector
        let totalAbsDelta = 0;
        for (const val of combinedDelta.values()) {
            totalAbsDelta += Math.abs(val);
        }
        decision.budget_used = totalAbsDelta;

        let scaleFactor = 1.0;
        if (totalAbsDelta > config.max_total_abs_delta_per_tick) {
            scaleFactor = config.max_total_abs_delta_per_tick / totalAbsDelta;
            // console.warn(`⚖️ GATE: Scaling deltas by ${scaleFactor.toFixed(4)} (Budget Exceeded)`);
        }

        // 5. Flatten & Scale Delta
        decision.accepted_delta = Array.from(combinedDelta.entries()).map(([level, value]) => ({ 
            level, 
            value: Math.round(value * scaleFactor) // Integer rounding after scaling
        }));

        // 5. Apply Mutation (OR Dry Run)
        let nextStateI16 = new Int16Array(state.state_i16); // Clone
        
        if (!config.dry_run) {
             for (const d of decision.accepted_delta) {
                 // Saturating Add
                 let newVal = nextStateI16[d.level] + d.value;
                 if (newVal > 32767) newVal = 32767;
                 if (newVal < -32768) newVal = -32768;
                 nextStateI16[d.level] = newVal;
             }
        } else {
             // DRY RUN: State does NOT change
             // console.log("🛡️ GATE: Dry Run - State preserved.");
        }

        // 6. Hashing (Simulation)
        // In real impl, would be a real hash of the Int16Array
        const nextHash = config.dry_run ? state.state_hash : `hash_${state.tick + 1}_${Date.now()}`; 

        // 7. Emit Ledger Event
        const event: LedgerEvent = {
            event_id: `evt_${state.tick}_${Date.now()}`,
            tick: state.tick,
            ts_unix_ms: Date.now(),
            state_before_hash: state.state_hash,
            state_after_hash: nextHash,
            accepted_delta: decision.accepted_delta,
            proposal_digest: "digest_placeholder",
            accepted_proposals: decision.accepted_proposals,
            rejected_proposals: decision.rejected_proposals,
            cost_total: decision.cost_used,
            budget_used: decision.budget_used,
            gate_config_version: "v0.1",
        };

        await LEDGER.append(event);

        return {
            tick: state.tick + 1,
            state_i16: nextStateI16,
            state_hash: nextHash
        };
    }
};

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
import { LOAD } from "./i.L99.core.LOAD.ts";
import { ACCESS_BY_RESONANCE } from "./i.L00.core.ACCESS_BY_RESONANCE.ts";
import { CHECKPOINT } from "./i.L99.core.CHECKPOINT.ts";
import { TOPOLOGICAL_SIGNATURE } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";

const GATE_VERSION = "v0.2";
const AUTO_CHECKPOINT_INTERVAL = 128;

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        const body = entries
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
            .join(",");
        return `{${body}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

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
        const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));

        const canonicalProposalList = proposals
            .map((p) => ({
                proposal_id: p.proposal_id,
                tick: p.tick,
                base_state_hash: p.base_state_hash,
                agent_id: p.agent_id,
                intent: p.intent,
                confidence: p.confidence,
                delta: [...p.delta].sort((a, b) => a.level - b.level).map((d) => ({ level: d.level, value: d.value })),
                cost_estimate: p.cost_estimate,
                artifact_hash: p.artifact_hash,
                semantic_fingerprint: p.semantic_fingerprint,
                causal_refs: [...(p.causal_refs ?? [])].sort()
            }))
            .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
        const proposalDigest = await sha256Hex(stableStringify(canonicalProposalList));

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
            if (
                p.delta.some((d) =>
                    !Number.isInteger(d.level) ||
                    d.level < 0 ||
                    d.level > 63 ||
                    !Number.isFinite(d.value)
                )
            ) {
                decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.OUT_OF_RANGE_VALUE });
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
            // Calculate Physical Cost using LOAD model
            let physicalCost = 0;
            const agentPhase = 0; // TODO: Get agent phase from state or proposal metadata if available. using 0 for now as placeholder or need to extend StateSnapshot
            // Actually, we can assume state.phase_u16 exists or use default 0 if not tracked yet.
            // For Glider Lite i16, we might not have explicit phase yet per agent, but let's check StateSnapshot.
            
            // Re-evaluating: StateSnapshot has `phase_u16?: Uint16Array`.
            // But the proposal doesn't explicitly carry the AGENT's current phase, except maybe implicitly in `delta`.
            // The Handoff says: "cost_l = abs(delta_l) * (1 + load_l) * (1 + mismatch_l)"
            // "load_l" comes from Hybrid Load Model (Entropy + Phase).
            
            // Let's implement a simplified version for Phase 2 that assumes some default entropy/phase if missing
            for (const d of p.delta) {
                // Get current level properties from state (if available)
                const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
                const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;
                
                // Calculate Load of this specific mutation
                // We treat the delta value as a "weight" or "force"
                const load = LOAD.calculate({
                    entropy: levelEntropy,
                    phase: levelPhase, 
                    weight: Math.abs(d.value)
                }, levelPhase); // System phase vs Local phase? Or Agent vs Level?
                
                // Simplified Cost: Base Cost + Load Penalty
                // cost = |delta| + Load
                physicalCost += Math.abs(d.value) + load;
            }
            
            // Update decision cost with calculated physical cost (or keep estimate if we trust agent?)
            // The constraint checks `p.cost_estimate`. Let's enforce that physicalCost <= p.cost_estimate (Anti-Spam)
            // If actual cost > estimate, we reject? Or just charge the actual? 
            // "Max cost per agent" usually refers to the CHARGED cost.
            
            // Let's use the physical cost as the authoritative cost.
            const finalCost = Math.round(physicalCost);
            
             // Check cost budget per agent RE-CHECK with verified cost
            if (finalCost > (config.max_cost_per_agent || Infinity)) {
                decision.rejected_proposals.push({ proposal_id: p.proposal_id, reason: REJECTION.COST_OVER_BUDGET });
                continue;
            }

            decision.accepted_proposals.push(p.proposal_id);
            decision.cost_used += finalCost;

            // 4. Weighted Merge Logic
            // Weight = Confidence (0..1) * Reliability (0..1)
            const agentReliability = config.reliability_weight.get(p.agent_id) ?? 1.0;
            const weight = p.confidence * agentReliability;

            for (const d of p.delta) {
                // Clip per level
                let val = d.value;
                if (Math.abs(val) > config.max_abs_delta_per_level) {
                    val = Math.sign(val) * config.max_abs_delta_per_level;
                }
                
                // Accumulate Weighted Delta (Float)
                const weightedVal = val * weight;
                const current = combinedDelta.get(d.level) || 0;
                combinedDelta.set(d.level, current + weightedVal);
            }
        }
        
        // 5. Global Budget Enforcement & Scaling
        // Calculate total absolute delta of the merged vector (using rounded values for check)
        let totalAbsDelta = 0;
        for (const val of combinedDelta.values()) {
            totalAbsDelta += Math.abs(Math.round(val));
        }
        decision.budget_used = totalAbsDelta;

        let scaleFactor = 1.0;
        if (totalAbsDelta > config.max_total_abs_delta_per_tick) {
            scaleFactor = config.max_total_abs_delta_per_tick / totalAbsDelta;
            // console.warn(`⚖️ GATE: Scaling deltas by ${scaleFactor.toFixed(4)} (Budget Exceeded)`);
        }

        // 6. Flatten & Scale & Round Delta
        decision.accepted_delta = Array.from(combinedDelta.entries()).map(([level, value]) => ({ 
            level, 
            value: Math.round(value * scaleFactor) // Final Integer Rounding
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

        // 6. Deterministic Hashing
        const nextHash = config.dry_run
            ? state.state_hash
            : await sha256Hex(stableStringify({
                state_i16: Array.from(nextStateI16),
                tick: state.tick + 1,
                gate_config_version: GATE_VERSION,
                proposal_digest: proposalDigest
            }));
        const eventId = `evt_${(await sha256Hex(`${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`)).slice(0, 16)}`;

        // 7. Emit Ledger Event
        const nextTick = state.tick + 1;

        let projection2DHash: string | undefined;
        let thread1DHash: string | undefined;
        let projectionVersion: string | undefined;
        let signatureArtifactHash: string | undefined;
        let signatureTick: number | undefined;
        let signatureCausalRefs: string[] | undefined;

        if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
            const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
                proposalById.get(id)?.causal_refs ?? []
            );
            const causalRefs = Array.from(new Set([state.state_hash, ...acceptedCausalRefs]));

            const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
                artifact_hash: proposalDigest,
                state_hash: nextHash,
                tick: nextTick,
                state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
                    state_hash: nextHash,
                    state_i16: nextStateI16,
                    phase_u16: state.phase_u16,
                    stability_q15: state.stability_q15,
                    entropy_i16: state.entropy_i16
                }),
                causal_refs: causalRefs
            });

            projection2DHash = topoSignature.projection_2d_hash;
            thread1DHash = topoSignature.thread_1d_hash;
            projectionVersion = topoSignature.projection_version;
            signatureArtifactHash = topoSignature.artifact_hash;
            signatureTick = topoSignature.tick;
            signatureCausalRefs = topoSignature.causal_refs;
        }

        const event: LedgerEvent = {
            event_id: eventId,
            tick: state.tick,
            ts_unix_ms: Date.now(),
            state_before_hash: state.state_hash,
            state_after_hash: nextHash,
            accepted_delta: decision.accepted_delta,
            proposal_digest: proposalDigest,
            accepted_proposals: decision.accepted_proposals,
            rejected_proposals: decision.rejected_proposals,
            cost_total: decision.cost_used,
            budget_used: decision.budget_used,
            budget_limit: config.max_total_abs_delta_per_tick,
            gate_config_version: GATE_VERSION,
            signature_artifact_hash: signatureArtifactHash,
            signature_tick: signatureTick,
            signature_causal_refs: signatureCausalRefs,
            projection_2d_hash: projection2DHash,
            thread_1d_hash: thread1DHash,
            projection_version: projectionVersion,
        };

        // 🛡️ Final Red Line Verification
        // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
        if (config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])) {
             const violation = {
                event_type: "VIOLATION_EVENT" as const,
                tick: state.tick,
                rule_id: "DRY_RUN_PURITY",
                severity: "CRITICAL" as const,
                state_hash: state.state_hash,
                details: "State mutation detected during dry_run",
                action_taken: "HALT_AND_QUARANTINE" as const
             };
             await LEDGER.append(violation);
             throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
        }

        await LEDGER.append(event);

        if (!config.dry_run && nextTick % AUTO_CHECKPOINT_INTERVAL === 0) {
            try {
                await CHECKPOINT.save(
                    {
                        tick: nextTick,
                        state_hash: nextHash,
                        state_i16: nextStateI16
                    },
                    "AUTO_INTERVAL"
                );
            } catch (e) {
                // Checkpoints are safety accelerators, not mutation authority.
                console.warn("⚠️ CHECKPOINT SAVE FAILED", e);
            }
        }

        return {
            tick: nextTick,
            state_i16: nextStateI16,
            state_hash: nextHash
        };
    }
};

import { 
  REJECTION, 
  type StateSnapshot, 
  type DeltaProposal, 
  type GateConfig, 
  type GateDecision, 
  type LedgerEvent, 
  type BridgeModeEvent 
} from "./STATE_SNAPSHOT.ts";

/**
 * Mocking legacy @omega imports that are not used in the core logic or are redundant.
 * In a full production system, these would be properly resolved via a registry.
 */
const LEDGER = { 
  STORAGE_PATH: "./OMEGA_LEDGER.jsonl", 
  append: async (e: any) => { 
    if (e) console.log(`[LEDGER] ${JSON.stringify(e).slice(0, 100)}...`); 
  } 
};
const LOAD = { calculate: (p: { weight: number, entropy: number, phase: number }, _lp: number) => Math.abs(p.weight) * 0.1 };
const CHECKPOINT = { save: async (_s: any, r: string) => console.log(`[CHECKPOINT] ${r}`) };
const TOPOLOGICAL_SIGNATURE = { 
  validateHash: (_h: string) => true, 
  build: async (_p: any) => ({
    projection_2d_hash: "0x",
    thread_1d_hash: "0x",
    projection_version: "v1",
    artifact_hash: "0x",
    tick: 0,
    causal_refs: []
  }), 
  snapshotToOrganismState: (_s: any) => ({}) 
};
const CANON_CAUSAL_BRIDGE = { resolveMode: (_r: any) => ({ mode: "GREEN" as const, reason: "Autonomous" }), isCanonBound: (_p: any) => false };
const AGENT_SIGNATURE = { 
  toCanonicalObject: (p: any) => p, 
  proposalEnvelopeHash: async (_p: any) => "0x", 
  verifyProposal: async (_p: any, _k: any) => ({ ok: true, reason: undefined as string | undefined }) 
};
const PROPOSAL_ENVELOPE_INDEX = { 
  pathForLedger: (p: string) => p + ".index", 
  getRecentEnvelopeHashes: async (_s: number, _e: number, _p: string) => new Set<string>(), 
  appendFromLedgerEvent: async (_e: any, _p: string) => {} 
};
const INVARIANT_PACKET = { hash: async (_p: any) => "0x", fromInvariantReport: async (_r: any, _c: any) => ({}) };
const I16_CLAMP = (n: number) => Math.max(-32768, Math.min(32767, n));
const I16_LIMITS = () => ({ max: 32767, min: -32768, span: 65536 });
const CRYSTALLIZATION_CONFIG = { policyVersion: "v1" };
const CRYSTALLIZATION_POLICY = { hash: async () => "0x" };

export interface ReplayInvariantReport {
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  gate_admission_index_chain_checked_records: number;
  gate_admission_index_chain_failures: string[];
}

const GATE_VERSION = "v0.3-pure";
const AUTO_CHECKPOINT_INTERVAL = 128;
const I16 = I16_LIMITS();

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

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
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16?: Uint16Array,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > I16.max) dPhi = I16.span - dPhi;
    const angle = (dPhi / I16.max) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2; // [0..1]
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const GATE = {
  /**
   * The Core Function: Process proposals and produce a decision.
   * Pure function (mostly), side effect is only LEDGER emit.
   */
  process: async (
    state: StateSnapshot,
    proposals: DeltaProposal[],
    config: GateConfig,
    runtime: GateRuntimeContext = {},
  ): Promise<StateSnapshot> => {
    const decision: GateDecision = {
      accepted_proposals: [],
      rejected_proposals: [],
      budget_used: 0,
      cost_used: 0,
      accepted_delta: [],
    };
    const acceptedProposalMetrics: Array<{
      proposal_id: string;
      agent_id: string;
      confidence: number;
      reliability_base: number;
      reliability_effective: number;
      phase_coherence?: number;
      weight: number;
      physical_cost: number;
      agent_phase_u16?: number;
    }> = [];
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const canonBoundProposals: string[] = [];
    const blockedCanonProposals: string[] = [];
    const signaturePolicy = config.signature_policy ?? "DISABLED";
    const signatureKeys = config.agent_signature_keys;
    const reliabilityMode = config.reliability_mode ?? "STATIC";
    const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
    const maxTotalCost = Number.isFinite(config.max_total_cost_per_tick ?? Infinity)
      ? Math.max(0, config.max_total_cost_per_tick ?? Infinity)
      : Infinity;
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const antiReplayWindow = Math.max(
      0,
      Math.floor(config.anti_replay_window_ticks ?? 0),
    );
    const historicalEnvelopeHashes = antiReplayWindow > 0
      ? await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
        state.tick - antiReplayWindow,
        state.tick,
        envelopeIndexPath,
      )
      : new Set<string>();
    const envelopeHashByProposal = new Map<string, string>();
    const seenEnvelopeHashesInTick = new Set<string>();

    const canonicalProposalList = proposals
      .map((p) => AGENT_SIGNATURE.toCanonicalObject(p))
      .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
    const proposalDigest = await sha256Hex(
      stableStringify(canonicalProposalList),
    );

    // 1. Validation & Filtering
    const validProposals: DeltaProposal[] = [];

    for (const p of proposals) {
      const envelopeHash = await AGENT_SIGNATURE.proposalEnvelopeHash(p);
      envelopeHashByProposal.set(p.proposal_id, envelopeHash);
      if (
        p.proposal_envelope_hash && p.proposal_envelope_hash !== envelopeHash
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.PROPOSAL_ENVELOPE_HASH_MISMATCH,
        });
        continue;
      }
      if (antiReplayWindow > 0) {
        if (
          seenEnvelopeHashesInTick.has(envelopeHash) ||
          historicalEnvelopeHashes.has(envelopeHash)
        ) {
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.REPLAY_ENVELOPE_DUPLICATE,
          });
          continue;
        }
        seenEnvelopeHashesInTick.add(envelopeHash);
      }
      if (CANON_CAUSAL_BRIDGE.isCanonBound(p)) {
        canonBoundProposals.push(p.proposal_id);
        if (bridgeResolution.mode !== "GREEN") {
          blockedCanonProposals.push(p.proposal_id);
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.CANON_PATH_REQUIRES_GREEN_BRIDGE,
          });
          continue;
        }
      }
      if (signaturePolicy !== "DISABLED") {
        const key = signatureKeys?.get(p.agent_id);
        if (!key) {
          if (
            signaturePolicy === "REQUIRED" || p.agent_signature ||
            p.signature_scheme
          ) {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: REJECTION.SIGNATURE_KEY_MISSING,
            });
            continue;
          }
        } else {
          if (!p.agent_signature) {
            if (signaturePolicy === "REQUIRED") {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: REJECTION.SIGNATURE_REQUIRED,
              });
              continue;
            }
          } else {
            const verify = await AGENT_SIGNATURE.verifyProposal(p, key);
            if (!verify.ok) {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: verify.reason ?? REJECTION.SIGNATURE_INVALID,
              });
              continue;
            }
          }
        }
      }
      // Check 1: Tick Mismatch
      if (p.tick !== state.tick) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.TICK_MISMATCH,
        });
        continue;
      }
      // Check 2: Base Hash Mismatch
      if (p.base_state_hash !== state.state_hash) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.BASE_HASH_MISMATCH,
        });
        continue;
      }
      // Check 3: Schema/Values (Simplified)
      if (!p.delta || p.delta.length === 0) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.EMPTY_DELTA,
        });
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
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }
      if (
        p.agent_phase_u16 !== undefined &&
        (
          !Number.isInteger(p.agent_phase_u16) ||
          p.agent_phase_u16 < 0 ||
          p.agent_phase_u16 > I16.span
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }

      // ... Additional checks (bounds, cost) would go here ...

      validProposals.push(p);
    }

    // 2. Deterministic Sort (Canonical Order)
    validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

    // 3. Merge with Budget Enforcement
    const combinedDelta = new Map<number, number>();

    for (const p of validProposals) {
      if ((p as any).resonance !== undefined) {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, resonance: ${(p as any).resonance}`);
      } else {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, NO RESONANCE FOUND.`);
      }
      
      // Calculate Physical Cost using LOAD model
      let physicalCost = 0;
      const agentPhase = p.agent_phase_u16 ?? 0;
      for (const d of p.delta) {
        // Get current level properties from state (if available)
        const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
        const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;

        // Calculate Load of this specific mutation
        // Agent phase is proposal-local; level phase is substrate-local.
        const load = LOAD.calculate({
          entropy: levelEntropy,
          phase: agentPhase,
          weight: Math.abs(d.value),
        }, levelPhase);

        // Simplified Cost: Base Cost + Load Penalty
        // cost = |delta| + Load
        physicalCost += Math.abs(d.value) + load;
      }
      
      // --- PROOF OF RESONANCE (PoR): Zero-Friction Routing ---
      // Atoms that have proven high topological utility (Resonance) 
      // experience less friction (cost) when modifying the state.
      const atomResonance = (p as any).resonance || 0;
      let discountLabel = "";
      if (atomResonance > 0) {
        // The higher the resonance, the greater the discount (cap at 95%)
        const discountFactor = Math.min(0.95, atomResonance / 500); 
        physicalCost = physicalCost * (1 - discountFactor);
        discountLabel = `(PoR Discount: ${(discountFactor * 100).toFixed(1)}%)`;
        console.log(`      ⚖️ [PoR] Route subsidized for Atom. Base: ${Math.abs(p.delta[0]?.value || 0)}, Res: ${atomResonance.toFixed(1)}, Discount: ${(discountFactor * 100).toFixed(1)}%`);
      }

      const finalCost = Math.round(physicalCost);

      // Check cost budget per agent with measured physical cost.
      if (finalCost > (config.max_cost_per_agent || Infinity)) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      // Check total cost budget for this tick (energy budget).
      const nextTotalCost = decision.cost_used + finalCost;
      if (nextTotalCost > maxTotalCost) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      decision.accepted_proposals.push(p.proposal_id);
      decision.cost_used = nextTotalCost;

      // 4. Weighted Merge Logic
      // Weight = Confidence (0..1) * Reliability (0..1)
      const reliabilityBase = clamp01(
        config.reliability_weight.get(p.agent_id) ?? 1.0,
      );
      let phaseCoherenceScore: number | undefined = undefined;
      let agentReliability = reliabilityBase;
      if (reliabilityMode === "PHASE_COHERENCE") {
        phaseCoherenceScore = p.agent_phase_u16 === undefined
          ? 1
          : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16);
        const modulation = reliabilityFloor +
          (1 - reliabilityFloor) * phaseCoherenceScore;
        agentReliability *= modulation;
      }
      agentReliability = clamp01(agentReliability);
      const weight = p.confidence * agentReliability;
      acceptedProposalMetrics.push({
        proposal_id: p.proposal_id,
        agent_id: p.agent_id,
        confidence: p.confidence,
        reliability_base: reliabilityBase,
        reliability_effective: agentReliability,
        phase_coherence: phaseCoherenceScore,
        weight,
        physical_cost: finalCost,
        agent_phase_u16: p.agent_phase_u16,
      });

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
      // telemetry: scaling deltas by budget constraint
    }

    // 6. Flatten & Scale & Round Delta
    decision.accepted_delta = Array.from(combinedDelta.entries()).map((
      [level, value],
    ) => ({
      level,
      value: Math.round(value * scaleFactor), // Final Integer Rounding
    }));

    // 5. Apply Mutation (OR Dry Run)
    const nextStateI16 = new Int16Array(state.state_i16); // Clone

    if (!config.dry_run) {
      for (const d of decision.accepted_delta) {
        // Saturating Add
        const newVal = nextStateI16[d.level] + d.value;
        nextStateI16[d.level] = I16_CLAMP(newVal);
      }
    } else {
      // DRY RUN: State does NOT change
      // telemetry: dry run preserves state
    }

    // 6. Deterministic Hashing
    const nextHash = config.dry_run
      ? state.state_hash
      : await sha256Hex(stableStringify({
        state_i16: Array.from(nextStateI16),
        tick: state.tick + 1,
        gate_config_version: GATE_VERSION,
        proposal_digest: proposalDigest,
      }));
    const eventId = `evt_${
      (await sha256Hex(
        `${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`,
      )).slice(0, 16)
    }`;

    // 7. Emit Ledger Event
    const nextTick = state.tick + 1;

    let projection2DHash: string | undefined;
    let thread1DHash: string | undefined;
    let projectionVersion: string | undefined;
    let signatureArtifactHash: string | undefined;
    let signatureTick: number | undefined;
    let signatureCausalRefs: string[] | undefined;
    const policyHash = await CRYSTALLIZATION_POLICY.hash();

    if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
      const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
        proposalById.get(id)?.causal_refs ?? []
      );
      const causalRefs = Array.from(
        new Set([state.state_hash, ...acceptedCausalRefs]),
      );

      const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
        artifact_hash: proposalDigest,
        state_hash: nextHash,
        tick: nextTick,
        state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
          state_hash: nextHash,
          state_i16: nextStateI16,
        }),
        causal_refs: causalRefs,
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
      ts_unix_ms: state.tick * 1000,
      state_before_hash: state.state_hash,
      state_after_hash: nextHash,
      accepted_delta: decision.accepted_delta,
      proposal_digest: proposalDigest,
      accepted_proposals: decision.accepted_proposals,
      accepted_proposal_metrics: acceptedProposalMetrics,
      accepted_proposal_envelopes: decision.accepted_proposals
        .map((proposal_id) => ({
          proposal_id,
          envelope_hash: envelopeHashByProposal.get(proposal_id) ?? "",
        }))
        .filter((x) => x.envelope_hash.length > 0),
      rejected_proposals: decision.rejected_proposals,
      cost_total: decision.cost_used,
      cost_limit: Number.isFinite(maxTotalCost) ? maxTotalCost : undefined,
      budget_used: decision.budget_used,
      budget_limit: config.max_total_abs_delta_per_tick,
      gate_config_version: GATE_VERSION,
      signature_artifact_hash: signatureArtifactHash,
      signature_tick: signatureTick,
      signature_causal_refs: signatureCausalRefs,
      projection_2d_hash: projection2DHash,
      thread_1d_hash: thread1DHash,
      projection_version: projectionVersion,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
    };

    const bridgeEvent: BridgeModeEvent = {
      event_type: "BRIDGE_MODE_EVENT",
      tick: state.tick,
      state_hash: state.state_hash,
      mode: bridgeResolution.mode,
      index_chain_checked:
        runtime.bridge_invariant_report?.index_chain_checked ?? false,
      index_chain_ok: runtime.bridge_invariant_report?.index_chain_ok ?? true,
      index_chain_checked_records:
        runtime.bridge_invariant_report?.index_chain_checked_records ?? 0,
      index_chain_failures: [
        ...(runtime.bridge_invariant_report?.index_chain_failures ?? []),
      ],
      gate_admission_index_chain_checked:
        runtime.bridge_invariant_report?.gate_admission_index_chain_checked ??
          false,
      gate_admission_index_chain_ok:
        runtime.bridge_invariant_report?.gate_admission_index_chain_ok ?? true,
      gate_admission_index_chain_checked_records:
        runtime.bridge_invariant_report
          ?.gate_admission_index_chain_checked_records ?? 0,
      gate_admission_index_chain_failures: [
        ...(runtime.bridge_invariant_report
          ?.gate_admission_index_chain_failures ?? []),
      ],
      invariant_packet_hash: runtime.bridge_invariant_report
        ? (await INVARIANT_PACKET.hash(
          await INVARIANT_PACKET.fromInvariantReport(
            runtime.bridge_invariant_report,
            { tick_anchor: state.tick, witness: runtime.witness },
          ),
        ))
        : undefined,
      canon_bound_proposals: [...canonBoundProposals].sort(),
      blocked_canon_proposals: [...blockedCanonProposals].sort(),
      reason: bridgeResolution.reason,
      witness: runtime.witness,
    };

    // 🛡️ Final Red Line Verification
    // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
    if (
      config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])
    ) {
      const violation = {
        event_type: "VIOLATION_EVENT" as const,
        tick: state.tick,
        rule_id: "DRY_RUN_PURITY",
        severity: "CRITICAL" as const,
        state_hash: state.state_hash,
        details: "State mutation detected during dry_run",
        action_taken: "HALT_AND_QUARANTINE" as const,
      };
      await LEDGER.append(violation);
      throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
    }

    await LEDGER.append(bridgeEvent);
    await LEDGER.append(event);
    if (!config.dry_run) {
      await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
        event,
        envelopeIndexPath,
      );
    }

    if (!config.dry_run && nextTick % AUTO_CHECKPOINT_INTERVAL === 0) {
      try {
        await CHECKPOINT.save(
          {
            tick: nextTick,
            state_hash: nextHash,
            state_i16: nextStateI16,
          },
          "AUTO_INTERVAL",
        );
      } catch (e) {
        // Checkpoints are safety accelerators, not mutation authority.
        // checkpoint save failed (telemetry handled outside canonical band)
      }
    }

    return {
      tick: nextTick,
      state_i16: nextStateI16,
      state_hash: nextHash,
    };
  },

   /**
    * ERA 35: Immune Learning (Ally Registry)
    * Whitelist for "Good Viruses" that have proven their worth.
    */
   trustedSignatures: new Set<string>(),

   /**
    * ERA 62: Immune Memory (Symbiogenesis)
    * Tracks average resonance of novel plasmids to determine if they become Canon.
    * Key: 8-byte logic hex, Value: accumulated symbiosis score.
    */
   immuneMemory: new Map<string, number>(),

   evaluateSymbiosis: (stateMatrix: any) => {
      // --- ERA 62: Evaluate Pro-Resonant Viral Logic ---
      const active = stateMatrix.getActiveIndices();
      const variantStats = new Map<string, { count: number, totalResonance: number }>();
      let baseResonanceSum = 0;
      let baseCount = 0;

      for (const idx of active) {
         const logic = stateMatrix.getLogic(idx) as Uint8Array;
         let logicStr = "";
         for (let n = 0; n < 8; n++) logicStr += logic[n].toString(16).padStart(2, '0');
         
         const resonance = stateMatrix.getResonance(idx);
         
         if (GATE.trustedSignatures.has(logicStr)) {
             // Treat established allies and original canon as baseline
             baseCount++;
             baseResonanceSum += resonance;
         } else {
             // Track novel variants
             const stats = variantStats.get(logicStr) || { count: 0, totalResonance: 0 };
             stats.count++;
             stats.totalResonance += resonance;
             variantStats.set(logicStr, stats);
         }
      }

      const baselineAvg = baseCount > 0 ? baseResonanceSum / baseCount : 15000; // 150 default

      // Reward variants that outperform the baseline or spread widely while healthy
      for (const [logicStr, stats] of variantStats.entries()) {
         const avgResonance = stats.totalResonance / stats.count;
         let score = GATE.immuneMemory.get(logicStr) || 0;
         
         if (avgResonance > baselineAvg && stats.count >= 3) {
             score += 10; // Reward successful propagation
         } else if (avgResonance < baselineAvg * 0.5) {
             score -= 5; // Penalize toxic variants
         }
         
         GATE.immuneMemory.set(logicStr, Math.max(0, score));

         // If score exceeds threshold, promote to Canon!
         if (score > 100 && !GATE.trustedSignatures.has(logicStr)) {
             console.log(`🛡️ [ERA 62: IMMUNE_LEARNING] Viral Plasmid evolved into Symbiont: ${logicStr} (Avg Resonance: ${(avgResonance/100).toFixed(1)} > Baseline: ${(baselineAvg/100).toFixed(1)})`);
             GATE.trustedSignatures.add(logicStr);
         }
      }
   },

   /**
    * ERA 26: Collective Immunity
    * Proactively scans logic signatures for malignant patterns.
    * ERA 62: Integrated with evaluateSymbiosis.
    */
   detectAntigens: (stateMatrix: any) => {
      // Run the Era 62 symbiosis evaluator first
      GATE.evaluateSymbiosis(stateMatrix);

      const active = stateMatrix.getActiveIndices();
      const viralGrid = stateMatrix.viralGrid; 

      for (const idx of active) {
         const logic = stateMatrix.getLogic(idx) as Uint8Array;
         let logicStr = "";
         for (let n = 0; n < 8; n++) logicStr += logic[n].toString(16).padStart(2, '0');
         
         // 🛡️ Era 35/62: Whitelist Bypass
         if (GATE.trustedSignatures.has(logicStr)) {
            if (typeof stateMatrix.setQuarantine === "function") {
              stateMatrix.setQuarantine(idx, 0); // Always CLEAN if trusted
            }
            continue;
         }

         let malignancy = 0;

         // --- ERA 49: Viral Load Detection (DEPRECATED in Pure Automaton Era) ---
         // Viral detection is now handled via metabolic cost and resonance audits.
         
         // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)

         // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)
         let feedCount = 0;
         for (let i = 0; i < 8; i++) {
            if (logic[i] === 0x20) feedCount++;
         }
         if (feedCount > 4) malignancy += 50;

         // Pattern 2: Chaos Injection (High entropy logic without bonds)
         const bonds = stateMatrix.getBonds(idx);
         let hasBonds = false;
         for (let j = 0; j < 4; j++) if (bonds[j] !== 0) hasBonds = true;
         if (!hasBonds && feedCount > 2) malignancy += 30;

         // Apply Audit Decisions
         if (malignancy >= 80) {
            stateMatrix.setId(idx, 0n); // RECYCLED (FATAL AUDIT)
            console.log(`⚖️ [GATE] Fatal Audit: Atom ${idx} recycled (Malignancy: ${malignancy})`);
         } else if (malignancy >= 40) {
            const parasiteRole = stateMatrix.ROLE_PARASITE ?? 4;
            stateMatrix.setRole(idx, parasiteRole); // FLAGGED (IMMUNE WATCH)
         }
      }
   },

   auditMatrix: (stateMatrix: any) => {
       console.log("⚖️ [GATE] Starting Autonomous Systemic Audit...");
       
       // 1. Evaluate Symbiogenesis (Reward pro-resonant mutations)
       GATE.evaluateSymbiosis(stateMatrix);
       
       // 2. Detect Antigens (Identify and quarantine parasitic logic)
       GATE.detectAntigens(stateMatrix);
       
       // 3. Population Health Check
       const active = stateMatrix.getActiveIndices();
       let ghostCount = 0;
       for (const idx of active) {
           const energy = stateMatrix.getEnergy(idx);
           const resonance = stateMatrix.getResonance(idx);
           
           // If an atom has negative energy or extreme corruption, recycle it
           if (energy <= 0 || isNaN(energy) || isNaN(resonance)) {
               stateMatrix.setId(idx, 0n);
               ghostCount++;
           }
       }
       
       if (ghostCount > 0) console.log(`⚖️ [GATE] Recycled ${ghostCount} corrupted/starved atoms.`);
       console.log(`⚖️ [GATE] Audit Complete. Population: ${active.length}. Trusted Signatures: ${GATE.trustedSignatures.size}`);
   }
};

---
id: GATE
type: module
description: "Implementation of GATE"
tags: []
min_level: 12
vars:
  - REJECTION
  - ReplayInvariantReport
  - GateRuntimeContext
  - StateSnapshot
  - DeltaProposal
  - GateConfig
  - GateDecision
  - BridgeModeEvent
  - LedgerEvent
deps:
  - TYPES
---

### TypeScript

```typescript
import { GRID_H } from "@g00";
import { LOGGER, Ld, Li, Lw } from "@g06";
import {
  CANON_CAUSAL_BRIDGE
} from "@g12";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY
} from "@g08";
import {
  INVARIANT_PACKET
} from "@g08";
import {
  LEDGER__08_00_LEDGER as LEDGER
} from "@g08";
import {
  PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX
} from "@g08";
import {
  TOPOLOGICAL_SIGNATURE
} from "@g08";

import {
  validateGateProposals
} from "@g12";
import {
  mergeGateProposals
} from "@g12";
import {
  persistGateLedgerArtifacts
} from "@g12";

const GATE_VERSION = "v0.3-pure";
const AUTO_CHECKPOINT_INTERVAL = 128;
const I16 = {
  MIN: -32768,
  MAX: 32767,
  max: 32767,
  span: 65536,
  LEVEL_COUNT: 64,
};
const I16_CLAMP = (x: number): number => Math.max(-32768, Math.min(32767, x));

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
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const {
      validProposals,
      proposalDigest,
      envelopeHashByProposal,
      canonBoundProposals,
      blockedCanonProposals,
    } = await validateGateProposals(
      state,
      proposals,
      config,
      decision,
      bridgeResolution,
      I16.span,
      envelopeIndexPath,
    );
    const { acceptedProposalMetrics, maxTotalCost } = mergeGateProposals(
      state,
      validProposals,
      config,
      decision,
      I16,
    );

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

    await persistGateLedgerArtifacts(
      bridgeEvent,
      event,
      config,
      envelopeIndexPath,
      nextTick,
      nextHash,
      nextStateI16,
      AUTO_CHECKPOINT_INTERVAL,
    );

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
    const variantStats = new Map<
      string,
      { count: number; totalResonance: number }
    >();
    let baseResonanceSum = 0;
    let baseCount = 0;

    for (const idx of active) {
      const logic = stateMatrix.getLogic(idx) as Uint8Array;
      let logicStr = "";
      for (let n = 0; n < 8; n++) {
        logicStr += logic[n].toString(16).padStart(2, "0");
      }

      const resonance = stateMatrix.getResonance(idx);

      if (GATE.trustedSignatures.has(logicStr)) {
        // Treat established allies and original canon as baseline
        baseCount++;
        baseResonanceSum += resonance;
      } else {
        // Track novel variants
        const stats = variantStats.get(logicStr) ||
          { count: 0, totalResonance: 0 };
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
        Li(
          `🛡️ [ERA 62: IMMUNE_LEARNING] Viral Plasmid evolved into Symbiont: ${logicStr} (Avg Resonance: ${
            (avgResonance / 100).toFixed(1)
          } > Baseline: ${(baselineAvg / 100).toFixed(1)})`,
        );
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
      for (let n = 0; n < 8; n++) {
        logicStr += logic[n].toString(16).padStart(2, "0");
      }

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
      if (malignancy >= GRID_H) {
        stateMatrix.setId(idx, 0n); // RECYCLED (FATAL AUDIT)
        Lw(
          `⚖️ [GATE] Fatal Audit: Atom ${idx} recycled (Malignancy: ${malignancy})`,
        );
      } else if (malignancy >= 40) {
        const parasiteRole = stateMatrix.ROLE_PARASITE ?? 4;
        stateMatrix.setRole(idx, parasiteRole); // FLAGGED (IMMUNE WATCH)
      }
    }
  },

  auditMatrix: (stateMatrix: any) => {
    Ld("⚖️ [GATE] Starting Autonomous Systemic Audit...");

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

    if (ghostCount > 0) {
      Li(`⚖️ [GATE] Recycled ${ghostCount} corrupted/starved atoms.`);
    }
    Ld(
      `⚖️ [GATE] Audit Complete. Population: ${active.length}. Trusted Signatures: ${GATE.trustedSignatures.size}`,
    );
  },
};
```

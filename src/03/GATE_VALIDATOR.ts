import { type DeltaProposal, type GateConfig, type GateDecision, REJECTION, type StateSnapshot } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { AGENT_SIGNATURE, CANON_CAUSAL_BRIDGE, PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX
    as PROPOSAL_ENVELOPE_INDEX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

type GateBridgeResolution = {
  mode: "GREEN" | "AMBER" | "RED";
  reason: string;
};

export type GateValidationResult = {
  validProposals: DeltaProposal[];
  proposalDigest: string;
  envelopeHashByProposal: Map<string, string>;
  canonBoundProposals: string[];
  blockedCanonProposals: string[];
};

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

export const validateGateProposals = async (
  state: StateSnapshot,
  proposals: DeltaProposal[],
  config: GateConfig,
  decision: GateDecision,
  bridgeResolution: GateBridgeResolution,
  i16Span: number,
  envelopeIndexPath: string,
): Promise<GateValidationResult> => {
  const signaturePolicy = config.signature_policy ?? "DISABLED";
  const signatureKeys = config.agent_signature_keys;
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

  const validProposals: DeltaProposal[] = [];
  const canonBoundProposals: string[] = [];
  const blockedCanonProposals: string[] = [];

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
    if (p.tick !== state.tick) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.TICK_MISMATCH,
      });
      continue;
    }
    if (p.base_state_hash !== state.state_hash) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.BASE_HASH_MISMATCH,
      });
      continue;
    }
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
        p.agent_phase_u16 > i16Span
      )
    ) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.OUT_OF_RANGE_VALUE,
      });
      continue;
    }

    validProposals.push(p);
  }

  return {
    validProposals,
    proposalDigest,
    envelopeHashByProposal,
    canonBoundProposals,
    blockedCanonProposals,
  };
};

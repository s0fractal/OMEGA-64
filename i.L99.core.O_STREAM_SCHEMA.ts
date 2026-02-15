// i.L99.core.O_STREAM_SCHEMA.ts
// OMEGA-64 | O_STREAM_SCHEMA (Minimal)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const O_STREAM_SCHEMA = (proposal: DeltaProposal): boolean => {
  if (!proposal) return false;
  if (typeof proposal.proposal_id !== "string" || proposal.proposal_id.length === 0) return false;
  if (!isNumber(proposal.tick)) return false;
  if (typeof proposal.base_state_hash !== "string" || proposal.base_state_hash.length === 0) return false;
  if (typeof proposal.agent_id !== "string" || proposal.agent_id.length === 0) return false;
  if (typeof proposal.intent !== "string" || proposal.intent.length === 0) return false;
  if (!isNumber(proposal.confidence)) return false;
  if (!Array.isArray(proposal.delta) || proposal.delta.length === 0) return false;
  if (!isNumber(proposal.cost_estimate)) return false;
  if (typeof proposal.artifact_hash !== "string" || proposal.artifact_hash.length === 0) return false;
  if (typeof proposal.semantic_fingerprint !== "string" || proposal.semantic_fingerprint.length === 0) return false;

  for (const entry of proposal.delta) {
    if (!entry) return false;
    if (!isNumber(entry.level)) return false;
    if (!isNumber(entry.value)) return false;
  }

  return true;
};

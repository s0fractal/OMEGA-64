// i.L32.core.AGENT_SIGNATURE.ts
// OMEGA-64 | Agent proposal signature helper (shared-secret HMAC v1).

import type {
  AgentSignatureKey,
  DeltaProposal,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
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

const signHmacSha256Hex = async (
  secret: string,
  payload: string,
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(digest);
};

const canonicalProposalPayload = (proposal: DeltaProposal): string =>
  stableStringify({
    proposal_id: proposal.proposal_id,
    tick: proposal.tick,
    base_state_hash: proposal.base_state_hash,
    agent_id: proposal.agent_id,
    intent: proposal.intent,
    confidence: proposal.confidence,
    delta: [...proposal.delta]
      .sort((a, b) => a.level - b.level)
      .map((d) => ({ level: d.level, value: d.value })),
    cost_estimate: proposal.cost_estimate,
    artifact_hash: proposal.artifact_hash,
    semantic_fingerprint: proposal.semantic_fingerprint,
    causal_refs: [...(proposal.causal_refs ?? [])].sort(),
    target_path: proposal.target_path ?? "LOCAL",
  });

export const AGENT_SIGNATURE = {
  canonicalProposalPayload,

  signProposal: async (
    proposal: DeltaProposal,
    key: AgentSignatureKey,
  ): Promise<string> => {
    if (key.scheme !== "hmac-sha256/v1") {
      throw new Error(`UNSUPPORTED_SIGNATURE_SCHEME:${key.scheme}`);
    }
    const payload = canonicalProposalPayload(proposal);
    return await signHmacSha256Hex(
      key.secret,
      `scheme=${key.scheme}|payload=${payload}`,
    );
  },

  verifyProposal: async (
    proposal: DeltaProposal,
    key: AgentSignatureKey,
  ): Promise<{
    ok: boolean;
    reason?:
      | "SIGNATURE_SCHEME_UNSUPPORTED"
      | "SIGNATURE_REQUIRED"
      | "SIGNATURE_INVALID";
  }> => {
    if (key.scheme !== "hmac-sha256/v1") {
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    }
    const scheme = proposal.signature_scheme ?? key.scheme;
    if (scheme !== key.scheme) {
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    }
    if (!proposal.agent_signature) {
      return { ok: false, reason: "SIGNATURE_REQUIRED" };
    }
    const expected = await AGENT_SIGNATURE.signProposal(proposal, key);
    if (proposal.agent_signature !== expected) {
      return { ok: false, reason: "SIGNATURE_INVALID" };
    }
    return { ok: true };
  },
};

// OMEGA-64 | agent_signature.ts
// Legacy Compliance Shims - Proposal Signatures

import { base64_to_bytes, bytes_to_base64, bytes_to_hex, hex_to_bytes, import_ed25519_private, import_ed25519_public, import_hmac, sha256_hex, stable_stringify } from "@generated";
import { REJECTION } from "@generated";
import type { Ed25519SigningKey, Ed25519VerifyKey, HmacKey } from "@generated";

const encoder = new TextEncoder();
const crypto = globalThis.crypto;

const canonicalProposalPayload = (proposal: any): string =>
  stable_stringify(AGENT_SIGNATURE.toCanonicalObject(proposal));

export const AGENT_SIGNATURE = {
  toCanonicalObject: (p: any) => ({
    proposal_id: p?.proposal_id,
    tick: p?.tick,
    base_state_hash: p?.base_state_hash,
    agent_id: p?.agent_id,
    agent_phase_u16: p?.agent_phase_u16,
    intent: p?.intent,
    confidence: p?.confidence,
    delta: p?.delta,
    cost_estimate: p?.cost_estimate,
    artifact_hash: p?.artifact_hash,
    semantic_fingerprint: p?.semantic_fingerprint,
    causal_refs: p?.causal_refs,
    target_path: p?.target_path,
    signature_scheme: p?.signature_scheme,
  }),

  proposalEnvelopeHash: async (p: any): Promise<string> =>
    await sha256_hex(canonicalProposalPayload(p)),

  generateEd25519KeyPair: async (): Promise<{
    public_key_b64: string;
    private_key_pkcs8_b64: string;
  }> => {
    const pair = await crypto.subtle.generateKey(
      { name: "Ed25519" },
      true,
      ["sign", "verify"],
    ) as CryptoKeyPair;

    const publicKey = new Uint8Array(
      await crypto.subtle.exportKey("spki", pair.publicKey),
    );
    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", pair.privateKey),
    );

    return {
      public_key_b64: bytes_to_base64(publicKey),
      private_key_pkcs8_b64: bytes_to_base64(privateKey),
    };
  },

  signProposal: async (
    proposal: any,
    signingKey: Ed25519SigningKey | HmacKey,
  ): Promise<string> => {
    const payload = encoder.encode(canonicalProposalPayload(proposal));
    if (signingKey.scheme === "hmac-sha256/v1") {
      const key = await import_hmac(signingKey.secret, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, payload);
      return bytes_to_hex(new Uint8Array(sig));
    }
    if (signingKey.scheme === "ed25519/v1") {
      const key = await import_ed25519_private(signingKey.private_key_pkcs8_b64);
      const sig = await crypto.subtle.sign("Ed25519", key, payload);
      return bytes_to_hex(new Uint8Array(sig));
    }
    throw new Error("SIGNATURE_SCHEME_UNSUPPORTED");
  },

  verifyProposal: async (
    proposal: any,
    verifyKey: Ed25519VerifyKey | HmacKey,
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      const signature = typeof proposal?.agent_signature === "string"
        ? proposal.agent_signature
        : "";
      if (!signature) {
        return { ok: false, reason: REJECTION.SIGNATURE_REQUIRED };
      }

      const proposalScheme = proposal?.signature_scheme;
      if (proposalScheme && proposalScheme !== verifyKey.scheme) {
        return { ok: false, reason: REJECTION.SIGNATURE_SCHEME_UNSUPPORTED };
      }

      const sigBytes = hex_to_bytes(signature);
      if (!sigBytes) return { ok: false, reason: REJECTION.SIGNATURE_INVALID };

      const payload = encoder.encode(canonicalProposalPayload(proposal));
      if (verifyKey.scheme === "hmac-sha256/v1") {
        const key = await import_hmac(verifyKey.secret, ["verify"]);
        const ok = await crypto.subtle.verify(
          "HMAC",
          key,
          sigBytes as unknown as BufferSource,
          payload,
        );
        return ok
          ? { ok: true }
          : { ok: false, reason: REJECTION.SIGNATURE_INVALID };
      }
      if (verifyKey.scheme === "ed25519/v1") {
        const key = await import_ed25519_public(verifyKey.public_key_b64);
        const ok = await crypto.subtle.verify(
          "Ed25519",
          key,
          sigBytes as unknown as BufferSource,
          payload,
        );
        return ok
          ? { ok: true }
          : { ok: false, reason: REJECTION.SIGNATURE_INVALID };
      }

      return { ok: false, reason: REJECTION.SIGNATURE_SCHEME_UNSUPPORTED };
    } catch {
      return { ok: false, reason: REJECTION.SIGNATURE_INVALID };
    }
  },

  sign: async (data: unknown): Promise<string> =>
    await sha256_hex(typeof data === "string" ? data : stable_stringify(data)),
};

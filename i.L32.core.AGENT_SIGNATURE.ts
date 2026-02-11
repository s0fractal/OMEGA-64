// i.L32.core.AGENT_SIGNATURE.ts
// OMEGA-64 | Agent proposal signature helper (Ed25519 v1 + legacy HMAC v1).

import type {
  AgentSignatureKey,
  AgentSignatureScheme,
  DeltaProposal,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

export type AgentSigningKey =
  | { scheme: "ed25519/v1"; private_key_pkcs8_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

export interface Ed25519KeyPairMaterial {
  public_key_b64: string;
  private_key_pkcs8_b64: string;
}

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

const fromHex = (hex: string): Uint8Array => {
  const clean = hex.trim().toLowerCase();
  if (clean.length === 0 || clean.length % 2 !== 0 || /[^0-9a-f]/.test(clean)) {
    throw new Error("INVALID_HEX");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
};

const fromBase64 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
};

const asArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  Uint8Array.from(bytes).buffer;

const signHmacSha256 = async (
  secret: string,
  payload: Uint8Array,
): Promise<ArrayBuffer> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("HMAC", key, asArrayBuffer(payload));
};

const verifyHmacSha256 = async (
  secret: string,
  signatureHex: string,
  payload: Uint8Array,
): Promise<boolean> => {
  const signature = fromHex(signatureHex);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify(
    "HMAC",
    key,
    asArrayBuffer(signature),
    asArrayBuffer(payload),
  );
};

const signEd25519 = async (
  privateKeyPkcs8B64: string,
  payload: Uint8Array,
): Promise<ArrayBuffer> => {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    asArrayBuffer(fromBase64(privateKeyPkcs8B64)),
    { name: "Ed25519" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("Ed25519", privateKey, asArrayBuffer(payload));
};

const verifyEd25519 = async (
  publicKeyB64: string,
  signatureHex: string,
  payload: Uint8Array,
): Promise<boolean> => {
  const signature = fromHex(signatureHex);
  const publicKey = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(fromBase64(publicKeyB64)),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return await crypto.subtle.verify(
    "Ed25519",
    publicKey,
    asArrayBuffer(signature),
    asArrayBuffer(payload),
  );
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

const envelopeBytes = (
  scheme: AgentSignatureScheme,
  proposal: DeltaProposal,
): Uint8Array =>
  new TextEncoder().encode(
    `scheme=${scheme}|payload=${canonicalProposalPayload(proposal)}`,
  );

type VerifyResult = {
  ok: boolean;
  reason?:
    | "SIGNATURE_SCHEME_UNSUPPORTED"
    | "SIGNATURE_REQUIRED"
    | "SIGNATURE_INVALID";
};

export const AGENT_SIGNATURE = {
  canonicalProposalPayload,

  generateEd25519KeyPair: async (): Promise<Ed25519KeyPairMaterial> => {
    const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
      "sign",
      "verify",
    ]);
    if (!("publicKey" in pair) || !("privateKey" in pair)) {
      throw new Error("ED25519_KEYPAIR_GENERATION_FAILED");
    }
    return {
      public_key_b64: toBase64(
        await crypto.subtle.exportKey("raw", pair.publicKey),
      ),
      private_key_pkcs8_b64: toBase64(
        await crypto.subtle.exportKey("pkcs8", pair.privateKey),
      ),
    };
  },

  signProposal: async (
    proposal: DeltaProposal,
    key: AgentSigningKey,
  ): Promise<string> => {
    const payload = envelopeBytes(key.scheme, proposal);
    if (key.scheme === "ed25519/v1") {
      return toHex(await signEd25519(key.private_key_pkcs8_b64, payload));
    }
    if (key.scheme === "hmac-sha256/v1") {
      return toHex(await signHmacSha256(key.secret, payload));
    }
    throw new Error("UNSUPPORTED_SIGNATURE_SCHEME");
  },

  verifyProposal: async (
    proposal: DeltaProposal,
    key: AgentSignatureKey,
  ): Promise<VerifyResult> => {
    const scheme = proposal.signature_scheme ?? key.scheme;
    if (!proposal.agent_signature) {
      return { ok: false, reason: "SIGNATURE_REQUIRED" };
    }
    if (scheme !== key.scheme) {
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    }
    const payload = envelopeBytes(scheme, proposal);
    try {
      if (scheme === "ed25519/v1" && key.scheme === "ed25519/v1") {
        return (await verifyEd25519(
            key.public_key_b64,
            proposal.agent_signature,
            payload,
          ))
          ? { ok: true }
          : { ok: false, reason: "SIGNATURE_INVALID" };
      }
      if (scheme === "hmac-sha256/v1" && key.scheme === "hmac-sha256/v1") {
        return (await verifyHmacSha256(
            key.secret,
            proposal.agent_signature,
            payload,
          ))
          ? { ok: true }
          : { ok: false, reason: "SIGNATURE_INVALID" };
      }
      return { ok: false, reason: "SIGNATURE_SCHEME_UNSUPPORTED" };
    } catch {
      return { ok: false, reason: "SIGNATURE_INVALID" };
    }
  },
};

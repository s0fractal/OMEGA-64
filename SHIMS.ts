// SHIMS.ts
// OMEGA-64 | Legacy Compliance Shims
// Shared dependency surface for Gate/runtime paths.

import { crypto } from "jsr:@std/crypto@^1.0.3";
import { REJECTION } from "./STATE_SNAPSHOT.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string): Uint8Array | null => {
  if (!/^[0-9a-fA-F]*$/u.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!Number.isFinite(byte)) return null;
    out[i] = byte;
  }
  return out;
};

const bytesToBase64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
const base64ToBytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${
      entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")
    }}`;
  }
  return JSON.stringify(value);
};

const sha256Hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
};

const appendJsonl = async (path: string, entry: unknown): Promise<void> => {
  await Deno.writeTextFile(path, `${JSON.stringify(entry)}\n`, {
    append: true,
    create: true,
  });
};

const readJsonl = async function* (path: string): AsyncGenerator<any> {
  try {
    const raw = await Deno.readTextFile(path);
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        yield JSON.parse(t);
      } catch {
        // skip malformed rows for compatibility
      }
    }
  } catch {
    // no file => empty stream
  }
};

export type REPLAY_AUDIT__08_00_ReplayInvariantReport = any;

const I16_DATA = {
  MIN: -32768,
  MAX: 32767,
  max: 32767,
  span: 65536,
  LEVEL_COUNT: 64,
};
export const I16_LIMITS_I16_LIMITS = Object.assign(() => I16_DATA, I16_DATA);
export const I16_CLAMP__00_00_I16_CLAMP = (v: number): number =>
  Math.floor(Math.max(-32768, Math.min(32767, v)));

type Ed25519SigningKey = {
  scheme: "ed25519/v1";
  private_key_pkcs8_b64: string;
};
type Ed25519VerifyKey = { scheme: "ed25519/v1"; public_key_b64: string };
type HmacKey = { scheme: "hmac-sha256/v1"; secret: string };

const importHmac = async (
  secret: string,
  usages: KeyUsage[],
): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );

const importEd25519Private = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "pkcs8",
    base64ToBytes(b64),
    { name: "Ed25519" },
    false,
    ["sign"],
  );

const importEd25519Public = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "spki",
    base64ToBytes(b64),
    { name: "Ed25519" },
    false,
    ["verify"],
  );

const canonicalProposalPayload = (proposal: any): string =>
  stableStringify(AGENT_SIGNATURE.toCanonicalObject(proposal));

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
    await sha256Hex(canonicalProposalPayload(p)),

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
      public_key_b64: bytesToBase64(publicKey),
      private_key_pkcs8_b64: bytesToBase64(privateKey),
    };
  },

  signProposal: async (
    proposal: any,
    signingKey: Ed25519SigningKey | HmacKey,
  ): Promise<string> => {
    const payload = encoder.encode(canonicalProposalPayload(proposal));
    if (signingKey.scheme === "hmac-sha256/v1") {
      const key = await importHmac(signingKey.secret, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, payload);
      return bytesToHex(new Uint8Array(sig));
    }
    if (signingKey.scheme === "ed25519/v1") {
      const key = await importEd25519Private(signingKey.private_key_pkcs8_b64);
      const sig = await crypto.subtle.sign("Ed25519", key, payload);
      return bytesToHex(new Uint8Array(sig));
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

      const sigBytes = hexToBytes(signature);
      if (!sigBytes) return { ok: false, reason: REJECTION.SIGNATURE_INVALID };

      const payload = encoder.encode(canonicalProposalPayload(proposal));
      if (verifyKey.scheme === "hmac-sha256/v1") {
        const key = await importHmac(verifyKey.secret, ["verify"]);
        const ok = await crypto.subtle.verify("HMAC", key, sigBytes, payload);
        return ok
          ? { ok: true }
          : { ok: false, reason: REJECTION.SIGNATURE_INVALID };
      }
      if (verifyKey.scheme === "ed25519/v1") {
        const key = await importEd25519Public(verifyKey.public_key_b64);
        const ok = await crypto.subtle.verify(
          "Ed25519",
          key,
          sigBytes,
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
    await sha256Hex(typeof data === "string" ? data : stableStringify(data)),
};

export const CANON_CAUSAL_BRIDGE = {
  verify: (_state: any, _proposals: any) => true,
  resolveMode: (_report: any) => ({ mode: "GREEN" as const, reason: "Shim" }),
  isCanonBound: (_p: any) => false,
};

const LOAD_DATA = {
  load: (_id: string) => null,
  calculate: (_cfg: any, _phase: number) => 1.0,
};
export const LOAD_LOAD = Object.assign(() => LOAD_DATA, LOAD_DATA);

export const CHECKPOINT_CHECKPOINT = {
  STORAGE_PATH: "OMEGA_CHECKPOINT.jsonl",
  save: async (state: any, context?: any): Promise<void> => {
    await appendJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH, {
      tick: state?.tick ?? 0,
      state_hash: state?.state_hash ?? "",
      state_i16: Array.from((state?.state_i16 ?? []) as number[]),
      context: context ?? null,
      ts: Date.now(),
    });
  },
  loadLatest: async (): Promise<any | null> => {
    let latest: any | null = null;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      latest = row;
    }
    return latest;
  },
};

export const LEDGER__08_00_LEDGER = {
  STORAGE_PATH: "OMEGA_LEDGER.jsonl",
  append: async (entry: any): Promise<void> => {
    if (entry === undefined) return;
    await appendJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH, entry);
  },
  readAllRaw: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  readAll: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
};

export const TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE = {
  PROJECTION_VERSION: "v1.0",
  build: (_state: any) => ({
    projection_2d_hash: "0xPROJ_2D",
    thread_1d_hash: "0xTHREAD_1D",
    projection_version: "v1.0",
    artifact_hash: "0xART_HASH",
    tick: 0,
    causal_refs: [],
  }),
  validateHash: (_hash: string) => true,
  snapshotToOrganismState: (s: any) => ({ ...s }),
  verify: (_signature: any, _state: any) => ({ ok: true, failures: [] }),
};

const CRY_DATA = {
  policy: "STABLE",
  policyVersion: "v1.0",
};
export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG = Object.assign(
  () => CRY_DATA,
  CRY_DATA,
);

export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY = {
  verify: () => true,
  hash: () => "0xPOLICY_HASH_RESONANCE",
};

const defaultEnvelopeIndexPath = (): string =>
  `${LEDGER__08_00_LEDGER.STORAGE_PATH}.proposal_envelope_index.jsonl`;

const resolveEnvelopeIndexPath = (path?: string): string =>
  path ?? PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;

export const PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX = {
  STORAGE_PATH: defaultEnvelopeIndexPath(),
  add: () => {},
  check: () => false,
  pathForLedger: (ledgerPath: string) =>
    `${ledgerPath}.proposal_envelope_index.jsonl`,
  resetCacheForTests: (_path?: string) => {},
  verifyChainDetailed: (_path?: string) => ({
    ok: true,
    checked_records: 0,
    failures: [] as string[],
  }),
  getRecentEnvelopeHashes: async (
    startTick: number,
    endTick: number,
    path?: string,
  ): Promise<Set<string>> => {
    const result = new Set<string>();
    for await (const row of readJsonl(resolveEnvelopeIndexPath(path))) {
      const tick = Number(row?.tick ?? -1);
      const envelopeHash = typeof row?.envelope_hash === "string"
        ? row.envelope_hash
        : "";
      if (!envelopeHash) continue;
      if (tick >= startTick && tick <= endTick) result.add(envelopeHash);
    }
    return result;
  },
  appendFromLedgerEvent: async (event: any, path?: string): Promise<void> => {
    const indexPath = resolveEnvelopeIndexPath(path);
    const tick = Number(event?.tick ?? -1);
    const envelopes = Array.isArray(event?.accepted_proposal_envelopes)
      ? event.accepted_proposal_envelopes
      : [];

    for (const env of envelopes) {
      const proposalId = typeof env?.proposal_id === "string"
        ? env.proposal_id
        : "";
      const envelopeHash = typeof env?.envelope_hash === "string"
        ? env.envelope_hash
        : "";
      if (!envelopeHash) continue;
      await appendJsonl(indexPath, {
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
      });
    }
  },
};

export const INVARIANT_PACKET_INVARIANT_PACKET = {
  verify: () => true,
  fromInvariantReport: (report: any, opts?: any) => ({ report, opts }),
  hash: async (packet: any) => {
    const json = typeof packet === "string"
      ? packet
      : decoder.decode(encoder.encode(stableStringify(packet)));
    return await sha256Hex(json);
  },
};

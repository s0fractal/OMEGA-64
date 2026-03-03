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

type BridgeInvariantReportLike = {
  index_chain_checked?: boolean;
  index_chain_ok?: boolean;
  index_chain_failures?: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_failures?: string[];
};

const resolveBridgeMode = (
  report?: BridgeInvariantReportLike,
): { mode: "GREEN" | "AMBER" | "RED"; reason: string } => {
  if (!report) {
    return { mode: "AMBER", reason: "INVARIANT_REPORT_MISSING" };
  }

  const indexChecked = report.index_chain_checked === true;
  const indexOk = report.index_chain_ok !== false;
  const gateChecked = report.gate_admission_index_chain_checked === true;
  const gateOk = report.gate_admission_index_chain_ok !== false;

  if (!indexOk) {
    const failure = report.index_chain_failures?.[0] ?? "INDEX_CHAIN_FAILED";
    return { mode: "RED", reason: failure };
  }
  if (!gateOk) {
    const failure = report.gate_admission_index_chain_failures?.[0] ??
      "GATE_ADMISSION_INDEX_CHAIN_FAILED";
    return { mode: "RED", reason: failure };
  }

  if (!indexChecked || !gateChecked) {
    const missingChecks: string[] = [];
    if (!indexChecked) missingChecks.push("INDEX_CHAIN_UNCHECKED");
    if (!gateChecked) {
      missingChecks.push("GATE_ADMISSION_INDEX_CHAIN_UNCHECKED");
    }
    return { mode: "AMBER", reason: missingChecks.join("+") };
  }

  return { mode: "GREEN", reason: "INVARIANT_INDEX_CHAIN_VERIFIED" };
};

const proposalIsCanonBound = (proposal: unknown): boolean => {
  const p = proposal as { target_path?: string; canon_bound?: boolean };
  if (p?.canon_bound === true) return true;
  const target = typeof p?.target_path === "string"
    ? p.target_path.trim().toUpperCase()
    : "";
  return target === "CANON" || target.startsWith("CANON/") ||
    target.startsWith("CANON:") || target.startsWith("/CANON");
};

const extractBridgeInvariantReport = (
  state: unknown,
  explicit?: BridgeInvariantReportLike,
): BridgeInvariantReportLike | undefined => {
  if (explicit) return explicit;
  if (!state || typeof state !== "object") return undefined;
  const s = state as Record<string, unknown>;
  const direct = s.bridge_invariant_report;
  if (direct && typeof direct === "object") {
    return direct as BridgeInvariantReportLike;
  }
  const runtime = s.runtime;
  if (runtime && typeof runtime === "object") {
    const fromRuntime = (runtime as Record<string, unknown>)
      .bridge_invariant_report;
    if (fromRuntime && typeof fromRuntime === "object") {
      return fromRuntime as BridgeInvariantReportLike;
    }
  }
  const replayAudit = s.replay_audit;
  if (replayAudit && typeof replayAudit === "object") {
    const invariantReport = (replayAudit as Record<string, unknown>)
      .invariantReport;
    if (invariantReport && typeof invariantReport === "object") {
      return invariantReport as BridgeInvariantReportLike;
    }
  }
  return undefined;
};

const bridgeVerifyDetailed = (
  state: unknown,
  proposals: unknown,
  explicitReport?: BridgeInvariantReportLike,
): {
  ok: boolean;
  mode: "GREEN" | "AMBER" | "RED";
  reason: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
} => {
  const list = Array.isArray(proposals) ? proposals : [];
  const canonBound = list
    .filter((p) => proposalIsCanonBound(p))
    .map((p, idx) => {
      const id =
        typeof (p as { proposal_id?: unknown }).proposal_id === "string"
          ? ((p as { proposal_id: string }).proposal_id)
          : `canon_${idx}`;
      return id;
    });
  const report = extractBridgeInvariantReport(state, explicitReport);
  const resolution = resolveBridgeMode(report);
  const blocked = resolution.mode === "GREEN" ? [] : [...canonBound];
  return {
    ok: blocked.length === 0,
    mode: resolution.mode,
    reason: resolution.reason,
    canon_bound_proposals: canonBound,
    blocked_canon_proposals: blocked,
  };
};

export const CANON_CAUSAL_BRIDGE = {
  verify: (
    state: unknown,
    proposals: unknown,
    report?: BridgeInvariantReportLike,
  ): boolean => bridgeVerifyDetailed(state, proposals, report).ok,
  verifyDetailed: bridgeVerifyDetailed,
  resolveMode: (report?: BridgeInvariantReportLike) =>
    resolveBridgeMode(report),
  isCanonBound: (proposal: unknown) => proposalIsCanonBound(proposal),
};

const LOAD_DATA = {
  load: (_id: string) => null,
  calculate: (_cfg: any, _phase: number) => 1.0,
};
export const LOAD_LOAD = Object.assign(() => LOAD_DATA, LOAD_DATA);

const CHECKPOINT_CHAIN_VERSION = "checkpoint-hash-chain/v1";

const stripCheckpointChainFields = (entry: Record<string, unknown>) => {
  const body = { ...entry };
  delete body.chain_version;
  delete body.prev_checkpoint_hash;
  delete body.checkpoint_hash;
  return body;
};

const checkpointRecordHash = async (
  body: Record<string, unknown>,
  prevCheckpointHash: string | null,
): Promise<string> =>
  await sha256Hex(stableStringify({
    chain_version: CHECKPOINT_CHAIN_VERSION,
    prev_checkpoint_hash: prevCheckpointHash,
    body,
  }));

type CheckpointChainReportInternal = {
  ok: boolean;
  checkedRows: number;
  chainAnchoredRows: number;
  legacyRows: number;
  failures: string[];
  tailCheckpointHash: string | null;
};

const verifyCheckpointChainDetailedInternal = async (
  path: string,
): Promise<CheckpointChainReportInternal> => {
  const lines = await readJsonlLines(path);
  const failures: string[] = [];
  let chainAnchoredRows = 0;
  let legacyRows = 0;
  let prevAnchoredHash: string | null = null;
  let tailCheckpointHash: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch {
      failures.push(`CHECKPOINT_CHAIN_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
      continue;
    }

    const hasChainVersion = row.chain_version !== undefined;
    const hasPrev = row.prev_checkpoint_hash !== undefined;
    const hasHash = row.checkpoint_hash !== undefined;
    const hasAnyChain = hasChainVersion || hasPrev || hasHash;
    const hasAllChain = hasChainVersion && hasPrev && hasHash;

    if (!hasAnyChain) {
      legacyRows++;
      continue;
    }
    if (!hasAllChain) {
      failures.push(`CHECKPOINT_CHAIN_PARTIAL_FIELDS_AT_LINE_${lineNo}`);
      continue;
    }

    chainAnchoredRows++;
    if (row.chain_version !== CHECKPOINT_CHAIN_VERSION) {
      failures.push(`CHECKPOINT_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`);
    }

    const body = stripCheckpointChainFields(row);
    const expectedHash = await checkpointRecordHash(body, prevAnchoredHash);

    const recordedPrev = row.prev_checkpoint_hash === null
      ? null
      : normalizeHex64(row.prev_checkpoint_hash);
    if (
      row.prev_checkpoint_hash !== null &&
      typeof row.prev_checkpoint_hash !== "string"
    ) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalizeHex64(row.checkpoint_hash);
    if (!recordedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_INVALID_AT_LINE_${lineNo}`);
      prevAnchoredHash = expectedHash;
      tailCheckpointHash = expectedHash;
      continue;
    }
    if (recordedHash !== expectedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    prevAnchoredHash = recordedHash;
    tailCheckpointHash = recordedHash;
  }

  return {
    ok: failures.length === 0,
    checkedRows: lines.length,
    chainAnchoredRows,
    legacyRows,
    failures,
    tailCheckpointHash,
  };
};

export const CHECKPOINT_CHECKPOINT = {
  STORAGE_PATH: "OMEGA_CHECKPOINT.jsonl",
  CHAIN_VERSION: CHECKPOINT_CHAIN_VERSION,
  save: async (state: any, context?: any): Promise<void> => {
    const chain = await verifyCheckpointChainDetailedInternal(
      CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    if (!chain.ok) {
      throw new Error(`CHECKPOINT_CHAIN_INVALID:${chain.failures.join(",")}`);
    }

    const body = {
      tick: state?.tick ?? 0,
      state_hash: state?.state_hash ?? "",
      state_i16: Array.from((state?.state_i16 ?? []) as number[]),
      context: context ?? null,
      ts: Date.now(),
    } as Record<string, unknown>;

    const prevCheckpointHash = chain.tailCheckpointHash;
    const checkpointHash = await checkpointRecordHash(body, prevCheckpointHash);
    await appendJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH, {
      ...body,
      chain_version: CHECKPOINT_CHAIN_VERSION,
      prev_checkpoint_hash: prevCheckpointHash,
      checkpoint_hash: checkpointHash,
    });
  },
  loadLatest: async (): Promise<any | null> => {
    let latest: any | null = null;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      latest = row;
    }
    return latest;
  },
  loadExact: async (tick: number): Promise<any | null> => {
    let exact: any | null = null;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      if (Number(row?.tick) === tick) {
        exact = row;
      }
    }
    return exact;
  },
  loadNearestAtOrBefore: async (tick: number): Promise<any | null> => {
    let nearest: any | null = null;
    let nearestTick = Number.NEGATIVE_INFINITY;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      const rowTick = Number(row?.tick);
      if (
        !Number.isFinite(rowTick) || rowTick > tick || rowTick < nearestTick
      ) {
        continue;
      }
      nearest = row;
      nearestTick = rowTick;
    }
    return nearest;
  },
  verifyChainDetailed: async (path?: string) => {
    const report = await verifyCheckpointChainDetailedInternal(
      path ?? CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    return {
      ok: report.ok,
      checkedRows: report.checkedRows,
      chainAnchoredRows: report.chainAnchoredRows,
      legacyRows: report.legacyRows,
      failures: report.failures,
      tailCheckpointHash: report.tailCheckpointHash,
    };
  },
};

const LEDGER_CHAIN_VERSION = "ledger-hash-chain/v1";

const stripLedgerChainFields = (entry: Record<string, unknown>) => {
  const body = { ...entry };
  delete body.chain_version;
  delete body.prev_event_hash;
  delete body.event_hash;
  return body;
};

const ledgerEventHash = async (
  body: Record<string, unknown>,
  prevEventHash: string | null,
): Promise<string> =>
  await sha256Hex(stableStringify({
    chain_version: LEDGER_CHAIN_VERSION,
    prev_event_hash: prevEventHash,
    body,
  }));

type LedgerChainReportInternal = {
  ok: boolean;
  checkedEvents: number;
  chainAnchoredEvents: number;
  legacyEvents: number;
  failures: string[];
  tailEventHash: string | null;
};

const verifyLedgerChainDetailedInternal = async (
  path: string,
): Promise<LedgerChainReportInternal> => {
  const lines = await readJsonlLines(path);
  const failures: string[] = [];
  let chainAnchoredEvents = 0;
  let legacyEvents = 0;
  let prevAnchoredHash: string | null = null;
  let tailEventHash: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch {
      failures.push(`LEDGER_CHAIN_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
      continue;
    }

    const hasChainVersion = row.chain_version !== undefined;
    const hasPrev = row.prev_event_hash !== undefined;
    const hasHash = row.event_hash !== undefined;
    const hasAnyChain = hasChainVersion || hasPrev || hasHash;
    const hasAllChain = hasChainVersion && hasPrev && hasHash;

    if (!hasAnyChain) {
      legacyEvents++;
      continue;
    }
    if (!hasAllChain) {
      failures.push(`LEDGER_CHAIN_PARTIAL_FIELDS_AT_LINE_${lineNo}`);
      continue;
    }

    chainAnchoredEvents++;
    if (row.chain_version !== LEDGER_CHAIN_VERSION) {
      failures.push(`LEDGER_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`);
    }

    const body = stripLedgerChainFields(row);
    const expectedHash = await ledgerEventHash(body, prevAnchoredHash);

    const recordedPrev = row.prev_event_hash === null
      ? null
      : normalizeHex64(row.prev_event_hash);
    if (
      row.prev_event_hash !== null &&
      typeof row.prev_event_hash !== "string"
    ) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalizeHex64(row.event_hash);
    if (!recordedHash) {
      failures.push(`LEDGER_CHAIN_EVENT_HASH_INVALID_AT_LINE_${lineNo}`);
      prevAnchoredHash = expectedHash;
      tailEventHash = expectedHash;
      continue;
    }
    if (recordedHash !== expectedHash) {
      failures.push(`LEDGER_CHAIN_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    prevAnchoredHash = recordedHash;
    tailEventHash = recordedHash;
  }

  return {
    ok: failures.length === 0,
    checkedEvents: lines.length,
    chainAnchoredEvents,
    legacyEvents,
    failures,
    tailEventHash,
  };
};

export const LEDGER__08_00_LEDGER = {
  STORAGE_PATH: "OMEGA_LEDGER.jsonl",
  CHAIN_VERSION: LEDGER_CHAIN_VERSION,
  append: async (entry: any): Promise<void> => {
    if (entry === undefined) return;
    const chain = await verifyLedgerChainDetailedInternal(
      LEDGER__08_00_LEDGER.STORAGE_PATH,
    );
    if (!chain.ok) {
      throw new Error(`LEDGER_CHAIN_INVALID:${chain.failures.join(",")}`);
    }

    const rawEntry = entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : { value: entry };
    const body = stripLedgerChainFields(rawEntry);
    const prevEventHash = chain.tailEventHash;
    const eventHash = await ledgerEventHash(body, prevEventHash);
    await appendJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH, {
      ...body,
      chain_version: LEDGER_CHAIN_VERSION,
      prev_event_hash: prevEventHash,
      event_hash: eventHash,
    });
  },
  readAllRaw: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  readAll: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  verifyChainDetailed: async (path?: string) => {
    const report = await verifyLedgerChainDetailedInternal(
      path ?? LEDGER__08_00_LEDGER.STORAGE_PATH,
    );
    return {
      ok: report.ok,
      checkedEvents: report.checkedEvents,
      chainAnchoredEvents: report.chainAnchoredEvents,
      legacyEvents: report.legacyEvents,
      failures: report.failures,
      tailEventHash: report.tailEventHash,
    };
  },
};

const normalizeHex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};

const sha256HexBytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const clampByte = (x: number): number => {
  const n = Math.round(x);
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n;
};

const clampI16 = (x: number): number => {
  if (x < -32768) return -32768;
  if (x > 32767) return 32767;
  return x;
};

const normalizeAngle = (angle: number): number => {
  const tau = 2 * Math.PI;
  let a = angle % tau;
  if (a < 0) a += tau;
  return a / tau;
};

const toInt16BigEndian = (values: Int16Array): Uint8Array => {
  const out = new Uint8Array(values.length * 2);
  for (let i = 0; i < values.length; i++) {
    const v = values[i] < 0 ? values[i] + 0x1_0000 : values[i];
    out[i * 2] = (v >>> 8) & 0xFF;
    out[i * 2 + 1] = v & 0xFF;
  }
  return out;
};

const fnv1a32 = (input: string): number => {
  let hash = 0x811C9DC5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const makeXorShift32 = (seed: number): () => number => {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};

const canonicalCausalRefs = (refs: unknown): string[] => {
  if (!Array.isArray(refs)) return [];
  const out = new Set<string>();
  for (const ref of refs) {
    if (typeof ref !== "string") continue;
    const trimmed = ref.trim();
    if (!trimmed) continue;
    out.add(trimmed);
  }
  return Array.from(out).sort();
};

const deriveFeatureVector = (
  state: unknown,
  size: number = 16,
): number[] => {
  const text = stableStringify(state);
  const out = new Array<number>(size).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const idx = i % size;
    out[idx] = (out[idx] + code * ((i % 7) + 1)) % 65535;
  }
  for (let i = 0; i < out.length; i++) {
    const norm = (out[i] / 65535) * 2 - 1;
    out[i] = i % 2 === 0 ? norm : -norm;
  }
  return out;
};

export interface TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions {
  resolution?: number;
  deterministic?: boolean;
  noiseAmplitude?: number;
  noiseAlpha?: number;
}

export interface TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig {
  radial_bins: number;
  angular_bins: number;
}

export interface TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignature {
  artifact_hash: string;
  state_hash: string;
  tick: number;
  causal_refs: string[];
  projection_2d_hash: string;
  thread_1d_hash: string;
  projection_version: string;
  witness?: string;
}

export interface TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignatureInput {
  artifact_hash: string;
  state_hash: string;
  tick: number;
  state: unknown;
  causal_refs?: string[];
  witness?: string;
}

const TOPO_PROJECTION_VERSION = "topo-signature/v1";
const TOPO_CANONICAL_2D_OPTIONS: Required<
  TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions
> = {
  resolution: 256,
  deterministic: true,
  noiseAmplitude: 20,
  noiseAlpha: 50,
};
const TOPO_CANONICAL_THREAD_CONFIG:
  TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig = {
    radial_bins: 64,
    angular_bins: 256,
  };

const normalizeProjectionOptions = (
  options: TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions = {},
): Required<TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions> => {
  const resolution = Number.isFinite(options.resolution)
    ? Math.max(16, Math.min(1024, Math.floor(options.resolution!)))
    : TOPO_CANONICAL_2D_OPTIONS.resolution;
  const deterministic = options.deterministic ??
    TOPO_CANONICAL_2D_OPTIONS.deterministic;
  const noiseAmplitude = Number.isFinite(options.noiseAmplitude)
    ? Math.max(0, Math.min(128, Math.floor(options.noiseAmplitude!)))
    : TOPO_CANONICAL_2D_OPTIONS.noiseAmplitude;
  const noiseAlpha = Number.isFinite(options.noiseAlpha)
    ? Math.max(0, Math.min(255, Math.floor(options.noiseAlpha!)))
    : TOPO_CANONICAL_2D_OPTIONS.noiseAlpha;
  return { resolution, deterministic, noiseAmplitude, noiseAlpha };
};

const normalizeThreadConfig = (
  config: TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig =
    TOPO_CANONICAL_THREAD_CONFIG,
): TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig => {
  const radial_bins = Number.isFinite(config.radial_bins)
    ? Math.max(4, Math.min(256, Math.floor(config.radial_bins)))
    : TOPO_CANONICAL_THREAD_CONFIG.radial_bins;
  const angular_bins = Number.isFinite(config.angular_bins)
    ? Math.max(8, Math.min(1024, Math.floor(config.angular_bins)))
    : TOPO_CANONICAL_THREAD_CONFIG.angular_bins;
  return { radial_bins, angular_bins };
};

const toOrganismState = (
  snapshot: {
    state_hash?: string;
    state_i16?: Int16Array;
    phase_u16?: Uint16Array;
    stability_q15?: Float32Array;
    entropy_i16?: Int16Array;
  },
): {
  identity: string;
  wave: { center: number; width: number; phase: number; amplitude: number };
  chrono: { tau: number; depth: number; flowRate: number; curvature: number };
  metabolism: number;
  coherence: number;
} => {
  const vector = snapshot.state_i16 ?? new Int16Array(64);
  const n = vector.length > 0 ? vector.length : 1;
  const level = (idx: number): number =>
    idx >= 0 && idx < vector.length ? vector[idx] : 0;

  let sumAbs = 0;
  for (let i = 0; i < vector.length; i++) {
    sumAbs += Math.abs(vector[i]);
  }
  const absMean = sumAbs / n;
  const absMeanNorm = clamp01(absMean / 32767);
  const center = level(32);
  const width = Math.max(1, Math.min(32767, Math.abs(level(24)) + 1));
  const phase = snapshot.phase_u16
    ? snapshot.phase_u16[13] ?? 0
    : Math.round(((clampI16(level(13)) + 32768) / 65535) * 65535) & 0xFFFF;
  const amplitude = Math.min(
    65535,
    Math.max(0, Math.round(absMeanNorm * 65535)),
  );

  let stabilityMean = 1 - absMeanNorm;
  if (snapshot.stability_q15 && snapshot.stability_q15.length > 0) {
    let s = 0;
    for (let i = 0; i < snapshot.stability_q15.length; i++) {
      s += snapshot.stability_q15[i];
    }
    stabilityMean = clamp01(s / snapshot.stability_q15.length);
  }

  let entropyMean = absMean;
  if (snapshot.entropy_i16 && snapshot.entropy_i16.length > 0) {
    let e = 0;
    for (let i = 0; i < snapshot.entropy_i16.length; i++) {
      e += Math.abs(snapshot.entropy_i16[i]);
    }
    entropyMean = e / snapshot.entropy_i16.length;
  }
  const entropyNorm = clamp01(entropyMean / 32767);
  const coherence = clamp01(stabilityMean * (1 - entropyNorm));
  const metabolism = clamp01((clampI16(level(19)) + 32768) / 65535);
  const tau = clamp01((clampI16(level(22)) + 32768) / 65535);
  const flowRate = clamp01(Math.abs(level(10)) / 32767);
  const curvature = Math.abs(center) < 1
    ? Math.abs(level(21))
    : (Math.abs(level(21)) / 1000) * (1 / Math.log1p(Math.abs(center)));

  return {
    identity: snapshot.state_hash ?? "organism",
    wave: { center, width, phase, amplitude },
    chrono: { tau, depth: center, flowRate, curvature },
    metabolism,
    coherence,
  };
};

const project2D = (
  state: unknown,
  options: TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions = {},
): Uint8Array => {
  const opts = normalizeProjectionOptions(options);
  const resolution = opts.resolution;
  const out = new Uint8Array(resolution * resolution * 4);
  const center = resolution / 2;
  const maxRadius = Math.max(1, center - 1);
  const features = deriveFeatureVector(state, 16);
  const seed = fnv1a32(stableStringify({ state, options: opts })) || 1;
  const nextRand = makeXorShift32(seed);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const i = (y * resolution + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const rho = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxRadius);
      const theta = normalizeAngle(Math.atan2(dy, dx));
      const fx = features[(x + y) % features.length];
      const fy = features[(x * 3 + y * 5) % features.length];
      const fz = features[(x * 7 + y * 11) % features.length];

      const carrier = Math.sin(
        rho * Math.PI * (8 + Math.abs(fx) * 10) +
          theta * Math.PI * (1 + Math.abs(fy) * 6) +
          fz * Math.PI,
      );
      const lattice = Math.cos(
        (x / resolution) * Math.PI * (2 + Math.abs(fy) * 9) +
          (y / resolution) * Math.PI * (3 + Math.abs(fz) * 7) +
          fx * Math.PI,
      );
      const tone = carrier * 0.65 + lattice * 0.35;
      const base = (tone * 0.5 + 0.5) * 255;
      const noiseUnit = opts.deterministic
        ? ((nextRand() >>> 8) & 0xFF) / 255
        : Math.random();
      const noise = (noiseUnit - 0.5) * opts.noiseAmplitude * 2;

      out[i] = clampByte(base + noise + fx * 24);
      out[i + 1] = clampByte(base - noise * 0.5 + fy * 28);
      out[i + 2] = clampByte(255 - base + noise * 0.75 + fz * 20);
      out[i + 3] = clampByte(
        255 - Math.min(200, rho * 220) + opts.noiseAlpha * 0.1,
      );
    }
  }
  return out;
};

const projectThread1D = (
  rgba: Uint8Array,
  resolution: number,
  config: TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig =
    TOPO_CANONICAL_THREAD_CONFIG,
): Int16Array => {
  const cfg = normalizeThreadConfig(config);
  const bins = cfg.radial_bins * cfg.angular_bins;
  const thread = new Int16Array(bins);
  const center = resolution / 2;
  const maxDist = Math.max(1, center - 2);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) continue;
      const rho = dist / maxDist;
      const theta = normalizeAngle(Math.atan2(dy, dx));
      const rBin = Math.min(
        cfg.radial_bins - 1,
        Math.max(0, Math.floor(rho * (cfg.radial_bins - 1))),
      );
      const aBin = Math.min(
        cfg.angular_bins - 1,
        Math.max(0, Math.floor(theta * (cfg.angular_bins - 1))),
      );
      const k = rBin * cfg.angular_bins + aBin;
      const idx = (y * resolution + x) * 4;
      const lum = Math.round(
        (rgba[idx] + rgba[idx + 1] + rgba[idx + 2]) / 3 - 127,
      );
      thread[k] = clampI16(thread[k] + lum);
    }
  }
  return thread;
};

export const TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE = {
  PROJECTION_VERSION: TOPO_PROJECTION_VERSION,
  CANONICAL_2D_OPTIONS: TOPO_CANONICAL_2D_OPTIONS,
  CANONICAL_THREAD_CONFIG: TOPO_CANONICAL_THREAD_CONFIG,

  validateHash: (hash: string): boolean => normalizeHex64(hash) !== null,

  project2D,

  projectThread1D,

  hash2D: async (
    state: unknown,
    options: TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions =
      TOPO_CANONICAL_2D_OPTIONS,
  ): Promise<string> => {
    const rgba = project2D(state, options);
    return await sha256HexBytes(rgba);
  },

  hashThread1D: async (
    state: unknown,
    options: TOPOLOGICAL_SIGNATURE__08_00_ProjectionOptions =
      TOPO_CANONICAL_2D_OPTIONS,
    config: TOPOLOGICAL_SIGNATURE__08_00_ThreadProjectionConfig =
      TOPO_CANONICAL_THREAD_CONFIG,
  ): Promise<string> => {
    const opts = normalizeProjectionOptions(options);
    const rgba = project2D(state, opts);
    const thread = projectThread1D(rgba, opts.resolution, config);
    return await sha256HexBytes(toInt16BigEndian(thread));
  },

  snapshotToOrganismState: toOrganismState,

  build: async (
    input: TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignatureInput,
  ): Promise<TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignature> => {
    const artifactHash = normalizeHex64(input.artifact_hash);
    const stateHash = normalizeHex64(input.state_hash);
    if (!artifactHash) {
      throw new Error("Invalid artifact_hash: expected SHA-256 lowercase hex");
    }
    if (!stateHash) {
      throw new Error("Invalid state_hash: expected SHA-256 lowercase hex");
    }
    if (!Number.isInteger(input.tick) || input.tick < 0) {
      throw new Error("Invalid tick: expected non-negative integer");
    }

    const opts = normalizeProjectionOptions(TOPO_CANONICAL_2D_OPTIONS);
    const rgba = project2D(input.state, opts);
    const projection2dHash = await sha256HexBytes(rgba);
    const thread = projectThread1D(
      rgba,
      opts.resolution,
      TOPO_CANONICAL_THREAD_CONFIG,
    );
    const thread1dHash = await sha256HexBytes(toInt16BigEndian(thread));

    return {
      artifact_hash: artifactHash,
      state_hash: stateHash,
      tick: input.tick,
      causal_refs: canonicalCausalRefs(input.causal_refs),
      projection_2d_hash: projection2dHash,
      thread_1d_hash: thread1dHash,
      projection_version: TOPO_PROJECTION_VERSION,
      witness: input.witness,
    };
  },

  verify: async (
    signature: TOPOLOGICAL_SIGNATURE__08_00_TopologicalSignature,
    state: unknown,
  ): Promise<{ ok: boolean; reasons: string[]; failures: string[] }> => {
    const reasons: string[] = [];
    if (!normalizeHex64(signature.artifact_hash)) {
      reasons.push("INVALID_ARTIFACT_HASH");
    }
    if (!normalizeHex64(signature.state_hash)) {
      reasons.push("INVALID_STATE_HASH");
    }
    if (!normalizeHex64(signature.projection_2d_hash)) {
      reasons.push("INVALID_PROJECTION_2D_HASH");
    }
    if (!normalizeHex64(signature.thread_1d_hash)) {
      reasons.push("INVALID_THREAD_1D_HASH");
    }
    if (signature.projection_version !== TOPO_PROJECTION_VERSION) {
      reasons.push("UNSUPPORTED_PROJECTION_VERSION");
    }

    const opts = normalizeProjectionOptions(TOPO_CANONICAL_2D_OPTIONS);
    const rgba = project2D(state, opts);
    const projection2dHash = await sha256HexBytes(rgba);
    if (projection2dHash !== signature.projection_2d_hash) {
      reasons.push("PROJECTION_2D_HASH_MISMATCH");
    }

    const thread = projectThread1D(
      rgba,
      opts.resolution,
      TOPO_CANONICAL_THREAD_CONFIG,
    );
    const thread1dHash = await sha256HexBytes(toInt16BigEndian(thread));
    if (thread1dHash !== signature.thread_1d_hash) {
      reasons.push("THREAD_1D_HASH_MISMATCH");
    }

    return { ok: reasons.length === 0, reasons, failures: [...reasons] };
  },
};

const CRY_DATA = {
  policy: "STABLE",
  policyVersion: "crystallization/v1",
  window: 512,
  minSoftPasses: 5,
  defaultRequiredWindows: 3,
  projectionDriftMaxP95: 1024,
  projectionDriftTopLevels: 8,
  gateAdmissionOutOfPhasePressureMaxMean: 1.0,
  gateAdmissionMinCoherenceCoverage: 0.0,
  gateAdmissionTopAgents: 8,
  verifyLedgerChain: true,
};
export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG = Object.assign(
  () => CRY_DATA,
  CRY_DATA,
);

const canonicalCrystallizationPolicyPayload = (): string =>
  stableStringify({
    policyVersion: CRY_DATA.policyVersion,
    window: CRY_DATA.window,
    minSoftPasses: CRY_DATA.minSoftPasses,
    defaultRequiredWindows: CRY_DATA.defaultRequiredWindows,
    projectionDriftMaxP95: CRY_DATA.projectionDriftMaxP95,
    projectionDriftTopLevels: CRY_DATA.projectionDriftTopLevels,
    gateAdmissionOutOfPhasePressureMaxMean:
      CRY_DATA.gateAdmissionOutOfPhasePressureMaxMean,
    gateAdmissionMinCoherenceCoverage:
      CRY_DATA.gateAdmissionMinCoherenceCoverage,
    gateAdmissionTopAgents: CRY_DATA.gateAdmissionTopAgents,
    verifyLedgerChain: CRY_DATA.verifyLedgerChain,
  });

export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY = {
  canonicalPayload: canonicalCrystallizationPolicyPayload,
  hash: async (): Promise<string> =>
    await sha256Hex(canonicalCrystallizationPolicyPayload()),
  verify: async (
    input?:
      | string
      | { policy_hash?: string; policy_version?: string }
      | { policyHash?: string; policyVersion?: string },
  ): Promise<boolean> => {
    const expectedHash = await CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY
      .hash();
    if (typeof input === "undefined") return true;
    if (typeof input === "string") return input === expectedHash;
    const maybeVersion = "policy_version" in input
      ? input.policy_version
      : input.policyVersion;
    const maybeHash = "policy_hash" in input
      ? input.policy_hash
      : input.policyHash;
    if (
      typeof maybeVersion === "string" &&
      maybeVersion !== CRY_DATA.policyVersion
    ) {
      return false;
    }
    if (typeof maybeHash === "string") {
      return maybeHash === expectedHash;
    }
    return true;
  },
};

const defaultEnvelopeIndexPath = (): string =>
  `${LEDGER__08_00_LEDGER.STORAGE_PATH}.proposal_envelope_index.jsonl`;

const resolveEnvelopeIndexPath = (path?: string): string =>
  path ?? PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;

const ENVELOPE_INDEX_CHAIN_VERSION = "proposal-envelope-index/v1";
const envelopeIndexSeenByPath = new Map<string, Set<string>>();
const envelopeIndexTailByPath = new Map<string, string | null>();
const envelopeIndexCacheLoaded = new Set<string>();

const getEnvelopeIndexSeen = (path: string): Set<string> => {
  let seen = envelopeIndexSeenByPath.get(path);
  if (!seen) {
    seen = new Set<string>();
    envelopeIndexSeenByPath.set(path, seen);
  }
  return seen;
};

const canonicalEnvelopeIndexPayload = (entry: {
  tick: number;
  proposal_id: string;
  envelope_hash: string;
  source_event_id?: string;
}): string =>
  stableStringify({
    tick: entry.tick,
    proposal_id: entry.proposal_id,
    envelope_hash: entry.envelope_hash,
    source_event_id: entry.source_event_id,
  });

const envelopeIndexRecordHash = async (
  entry: {
    tick: number;
    proposal_id: string;
    envelope_hash: string;
    source_event_id?: string;
  },
  prevIndexHash: string | null,
): Promise<string> =>
  await sha256Hex(stableStringify({
    chain_version: ENVELOPE_INDEX_CHAIN_VERSION,
    prev_index_hash: prevIndexHash,
    payload: JSON.parse(canonicalEnvelopeIndexPayload(entry)),
  }));

const readJsonlLines = async (path: string): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);
  } catch {
    return [];
  }
};

const ensureEnvelopeIndexCache = async (path: string): Promise<void> => {
  if (envelopeIndexCacheLoaded.has(path)) return;
  const seen = getEnvelopeIndexSeen(path);
  let tail: string | null = null;
  const lines = await readJsonlLines(path);
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      const tick = Number(row.tick);
      const proposalId = typeof row.proposal_id === "string"
        ? row.proposal_id
        : "";
      const envelopeHash = normalizeHex64(row.envelope_hash) ?? "";
      const sourceEventId = typeof row.source_event_id === "string"
        ? row.source_event_id
        : undefined;
      if (
        !Number.isInteger(tick) || tick < 0 || proposalId.length === 0 ||
        envelopeHash.length === 0
      ) {
        continue;
      }
      seen.add(envelopeHash);
      const recordedHash = normalizeHex64(row.index_hash);
      if (recordedHash) {
        tail = recordedHash;
      } else {
        tail = await envelopeIndexRecordHash({
          tick,
          proposal_id: proposalId,
          envelope_hash: envelopeHash,
          source_event_id: sourceEventId,
        }, tail);
      }
    } catch {
      // ignore malformed historical lines in cache warmup
    }
  }
  envelopeIndexTailByPath.set(path, tail);
  envelopeIndexCacheLoaded.add(path);
};

export const PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX = {
  STORAGE_PATH: defaultEnvelopeIndexPath(),
  add: (envelopeHash?: string, path?: string): void => {
    const hash = normalizeHex64(envelopeHash);
    if (!hash) return;
    const indexPath = resolveEnvelopeIndexPath(path);
    getEnvelopeIndexSeen(indexPath).add(hash);
  },
  check: (envelopeHash?: string, path?: string): boolean => {
    const hash = normalizeHex64(envelopeHash);
    if (!hash) return false;
    const indexPath = resolveEnvelopeIndexPath(path);
    return getEnvelopeIndexSeen(indexPath).has(hash);
  },
  pathForLedger: (ledgerPath: string) =>
    `${ledgerPath}.proposal_envelope_index.jsonl`,
  resetCacheForTests: (path?: string) => {
    if (path) {
      const p = resolveEnvelopeIndexPath(path);
      envelopeIndexSeenByPath.delete(p);
      envelopeIndexTailByPath.delete(p);
      envelopeIndexCacheLoaded.delete(p);
      return;
    }
    envelopeIndexSeenByPath.clear();
    envelopeIndexTailByPath.clear();
    envelopeIndexCacheLoaded.clear();
  },
  verifyChainDetailed: async (path?: string) => {
    const indexPath = resolveEnvelopeIndexPath(path);
    const lines = await readJsonlLines(indexPath);
    const failures: string[] = [];
    let prevHash: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      let row: Record<string, unknown>;
      try {
        row = JSON.parse(lines[i]) as Record<string, unknown>;
      } catch {
        failures.push(`ENVELOPE_INDEX_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
        continue;
      }

      const tick = Number(row.tick);
      const proposalId = typeof row.proposal_id === "string"
        ? row.proposal_id
        : "";
      const envelopeHash = normalizeHex64(row.envelope_hash);
      const sourceEventId = typeof row.source_event_id === "string"
        ? row.source_event_id
        : undefined;
      if (!Number.isInteger(tick) || tick < 0) {
        failures.push(`ENVELOPE_INDEX_TICK_INVALID_AT_LINE_${lineNo}`);
        continue;
      }
      if (proposalId.length === 0) {
        failures.push(`ENVELOPE_INDEX_PROPOSAL_ID_INVALID_AT_LINE_${lineNo}`);
        continue;
      }
      if (!envelopeHash) {
        failures.push(`ENVELOPE_INDEX_ENVELOPE_HASH_INVALID_AT_LINE_${lineNo}`);
        continue;
      }
      if (
        row.chain_version !== undefined &&
        row.chain_version !== ENVELOPE_INDEX_CHAIN_VERSION
      ) {
        failures.push(
          `ENVELOPE_INDEX_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`,
        );
      }

      const expectedHash = await envelopeIndexRecordHash({
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
      }, prevHash);

      const recordedPrev = row.prev_index_hash === null
        ? null
        : normalizeHex64(row.prev_index_hash);
      const hasRecordedPrev = row.prev_index_hash !== undefined;
      if (hasRecordedPrev && recordedPrev !== prevHash) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
      }

      const recordedHash = normalizeHex64(row.index_hash);
      if (row.index_hash !== undefined && !recordedHash) {
        failures.push(`ENVELOPE_INDEX_RECORD_HASH_INVALID_AT_LINE_${lineNo}`);
      }
      if (!hasRecordedPrev && recordedHash && i > 0) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISSING_AT_LINE_${lineNo}`);
      }
      if (recordedHash && recordedHash !== expectedHash) {
        failures.push(`ENVELOPE_INDEX_RECORD_HASH_MISMATCH_AT_LINE_${lineNo}`);
      }

      prevHash = recordedHash ?? expectedHash;
    }

    return {
      ok: failures.length === 0,
      checked_records: lines.length,
      failures,
    };
  },
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
    await ensureEnvelopeIndexCache(indexPath);
    const seen = getEnvelopeIndexSeen(indexPath);
    const tick = Number(event?.tick ?? -1);
    const envelopes = Array.isArray(event?.accepted_proposal_envelopes)
      ? event.accepted_proposal_envelopes
      : [];
    const sourceEventId = typeof event?.event_id === "string"
      ? event.event_id
      : undefined;
    let prevIndexHash = envelopeIndexTailByPath.get(indexPath) ?? null;

    for (const env of envelopes) {
      const proposalId = typeof env?.proposal_id === "string"
        ? env.proposal_id
        : "";
      const envelopeHash = normalizeHex64(env?.envelope_hash) ?? "";
      if (!envelopeHash) continue;
      const indexHash = await envelopeIndexRecordHash({
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
      }, prevIndexHash);
      await appendJsonl(indexPath, {
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
        chain_version: ENVELOPE_INDEX_CHAIN_VERSION,
        prev_index_hash: prevIndexHash,
        index_hash: indexHash,
      });
      seen.add(envelopeHash);
      prevIndexHash = indexHash;
    }
    envelopeIndexTailByPath.set(indexPath, prevIndexHash);
    envelopeIndexCacheLoaded.add(indexPath);
  },
};

export interface INVARIANT_PACKET__08_00_InvariantPacket {
  version: string;
  tick_anchor: number;
  canon_index_chain_checked: boolean;
  canon_index_chain_ok: boolean;
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  ledger_chain_checked?: boolean;
  ledger_chain_ok?: boolean;
  witness?: string;
  packet_hash?: string;
  signature_scheme?: "hmac-sha256/v1";
  packet_signature?: string;
}

type InvariantPacketSigningKey = { scheme: "hmac-sha256/v1"; secret: string };

const INVARIANT_PACKET_VERSION = "invariant-packet/v1";

const packetSigningSecret = (
  key?: InvariantPacketSigningKey,
): string | undefined => {
  if (key?.scheme === "hmac-sha256/v1" && key.secret.length > 0) {
    return key.secret;
  }
  const envSecret = Deno.env.get("OMEGA_INVARIANT_PACKET_HMAC_SECRET");
  return envSecret && envSecret.length > 0 ? envSecret : undefined;
};

const canonicalInvariantPacket = (
  packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
): INVARIANT_PACKET__08_00_InvariantPacket => {
  const tickAnchor =
    Number.isInteger(packet.tick_anchor) && packet.tick_anchor! >= 0
      ? packet.tick_anchor!
      : 0;
  const normalized: INVARIANT_PACKET__08_00_InvariantPacket = {
    version: INVARIANT_PACKET_VERSION,
    tick_anchor: tickAnchor,
    canon_index_chain_checked: packet.canon_index_chain_checked === true,
    canon_index_chain_ok: packet.canon_index_chain_ok === true,
    gate_admission_index_chain_checked:
      packet.gate_admission_index_chain_checked === true,
    gate_admission_index_chain_ok:
      packet.gate_admission_index_chain_ok === true,
  };
  if (packet.ledger_chain_checked !== undefined) {
    normalized.ledger_chain_checked = packet.ledger_chain_checked === true;
    normalized.ledger_chain_ok = packet.ledger_chain_ok === true;
  }
  if (typeof packet.witness === "string" && packet.witness.trim().length > 0) {
    normalized.witness = packet.witness.trim();
  }
  if (typeof packet.packet_hash === "string" && packet.packet_hash.length > 0) {
    normalized.packet_hash = packet.packet_hash;
  }
  if (
    packet.signature_scheme === "hmac-sha256/v1" &&
    typeof packet.packet_signature === "string"
  ) {
    normalized.signature_scheme = packet.signature_scheme;
    normalized.packet_signature = packet.packet_signature;
  }
  return normalized;
};

const canonicalInvariantPacketPayload = (
  packet: INVARIANT_PACKET__08_00_InvariantPacket,
): string =>
  stableStringify({
    version: packet.version,
    tick_anchor: packet.tick_anchor,
    canon_index_chain_checked: packet.canon_index_chain_checked,
    canon_index_chain_ok: packet.canon_index_chain_ok,
    gate_admission_index_chain_checked:
      packet.gate_admission_index_chain_checked,
    gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
    ledger_chain_checked: packet.ledger_chain_checked,
    ledger_chain_ok: packet.ledger_chain_ok,
    witness: packet.witness,
  });

const signInvariantPacketHash = async (
  packetHash: string,
  secret: string,
): Promise<string> => {
  const key = await importHmac(secret, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(packetHash));
  return bytesToHex(new Uint8Array(sig));
};

const verifyInvariantPacketSignature = async (
  packetHash: string,
  signature: string,
  secret: string,
): Promise<boolean> => {
  const sigBytes = hexToBytes(signature);
  if (!sigBytes) return false;
  const key = await importHmac(secret, ["verify"]);
  return await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    encoder.encode(packetHash),
  );
};

const invariantPacketFailures = (
  label: string,
  ok: boolean,
): string[] => ok ? [] : [`INVARIANT_PACKET_${label}_FAIL`];

export const INVARIANT_PACKET_INVARIANT_PACKET = {
  VERSION: INVARIANT_PACKET_VERSION,

  hash: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket> | string,
  ): Promise<string> => {
    if (typeof packet === "string") {
      return await sha256Hex(packet);
    }
    const normalized = canonicalInvariantPacket(packet);
    return await sha256Hex(canonicalInvariantPacketPayload(normalized));
  },

  seal: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
    signingKey?: InvariantPacketSigningKey,
  ): Promise<INVARIANT_PACKET__08_00_InvariantPacket> => {
    const normalized = canonicalInvariantPacket(packet);
    const packetHash = await INVARIANT_PACKET_INVARIANT_PACKET.hash(normalized);
    const sealed: INVARIANT_PACKET__08_00_InvariantPacket = {
      ...normalized,
      packet_hash: packetHash,
    };
    const secret = packetSigningSecret(signingKey);
    if (secret) {
      sealed.signature_scheme = "hmac-sha256/v1";
      sealed.packet_signature = await signInvariantPacketHash(
        packetHash,
        secret,
      );
    }
    return sealed;
  },

  verify: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
    verifyKey?: InvariantPacketSigningKey,
  ): Promise<{
    ok: boolean;
    expected?: string;
    actual?: string;
    reasons: string[];
    failures: string[];
  }> => {
    const normalized = canonicalInvariantPacket(packet);
    const reasons: string[] = [];

    if (
      packet.version !== undefined &&
      packet.version !== INVARIANT_PACKET_VERSION
    ) {
      reasons.push("UNSUPPORTED_VERSION");
    }
    if (
      !Number.isInteger(packet.tick_anchor) || (packet.tick_anchor ?? -1) < 0
    ) {
      reasons.push("INVALID_TICK_ANCHOR");
    }
    if (
      typeof packet.packet_hash !== "string" || packet.packet_hash.length === 0
    ) {
      reasons.push("MISSING_PACKET_HASH");
      return {
        ok: false,
        reasons,
        failures: [...reasons],
      };
    }

    const expected = await INVARIANT_PACKET_INVARIANT_PACKET.hash(normalized);
    if (expected !== packet.packet_hash) {
      reasons.push("PACKET_HASH_MISMATCH");
    }

    const hasSignature = typeof packet.packet_signature === "string" &&
      packet.packet_signature.length > 0;
    if (
      packet.signature_scheme && packet.signature_scheme !== "hmac-sha256/v1"
    ) {
      reasons.push("UNSUPPORTED_SIGNATURE_SCHEME");
    } else if (hasSignature) {
      const secret = packetSigningSecret(verifyKey);
      if (!secret) {
        reasons.push("SIGNATURE_KEY_MISSING");
      } else {
        const verified = await verifyInvariantPacketSignature(
          packet.packet_hash,
          packet.packet_signature!,
          secret,
        );
        if (!verified) {
          reasons.push("PACKET_SIGNATURE_INVALID");
        }
      }
    } else if (packet.signature_scheme === "hmac-sha256/v1") {
      reasons.push("MISSING_PACKET_SIGNATURE");
    }

    return {
      ok: reasons.length === 0,
      expected,
      actual: packet.packet_hash,
      reasons,
      failures: [...reasons],
    };
  },

  fromInvariantReport: async (
    report: REPLAY_AUDIT__08_00_ReplayInvariantReport,
    opts: { tick_anchor: number; witness?: string } = { tick_anchor: 0 },
  ): Promise<INVARIANT_PACKET__08_00_InvariantPacket> =>
    await INVARIANT_PACKET_INVARIANT_PACKET.seal({
      tick_anchor: opts.tick_anchor,
      witness: opts.witness,
      canon_index_chain_checked: report?.index_chain_checked === true,
      canon_index_chain_ok: report?.index_chain_ok !== false,
      gate_admission_index_chain_checked:
        report?.gate_admission_index_chain_checked === true,
      gate_admission_index_chain_ok:
        report?.gate_admission_index_chain_ok !== false,
      ledger_chain_checked: report?.ledger_chain_checked === true,
      ledger_chain_ok: report?.ledger_chain_ok === true,
    }),

  toInvariantReport: (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
  ): REPLAY_AUDIT__08_00_ReplayInvariantReport => {
    const p = canonicalInvariantPacket(packet);
    const out: Record<string, unknown> = {
      index_chain_checked: p.canon_index_chain_checked,
      index_chain_ok: p.canon_index_chain_ok,
      index_chain_checked_records: 0,
      index_chain_failures: invariantPacketFailures(
        "CANON",
        p.canon_index_chain_ok,
      ),
      gate_admission_index_chain_checked: p.gate_admission_index_chain_checked,
      gate_admission_index_chain_ok: p.gate_admission_index_chain_ok,
      gate_admission_index_chain_checked_records: 0,
      gate_admission_index_chain_failures: invariantPacketFailures(
        "GATE_ADMISSION",
        p.gate_admission_index_chain_ok,
      ),
    };
    if (p.ledger_chain_checked !== undefined) {
      out.ledger_chain_checked = p.ledger_chain_checked;
      out.ledger_chain_ok = p.ledger_chain_ok === true;
      out.ledger_chain_failures = p.ledger_chain_checked
        ? invariantPacketFailures("LEDGER", p.ledger_chain_ok === true)
        : ["INVARIANT_PACKET_LEDGER_UNCHECKED"];
    }
    return out;
  },
};

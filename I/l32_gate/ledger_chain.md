---
id: ledger_chain
type: module
description: Implementation of ledger_chain
tags: []
min_level: 8
vars:
  - append_jsonl
  - normalize_hex64
  - read_jsonl
  - read_jsonl_lines
  - sha256_hex
  - stable_stringify
  - LedgerChainReportInternal
extra_symbols:
  - LEDGER__08_00_LEDGER
  - PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX
  - LEDGER_CHAIN
  - PROPOSAL_ENVELOPE_INDEX
deps:
  - normalize_hex64
  - sha256_hex
  - TYPES
---


```typescript
// OMEGA-64 | ledger_chain.ts
// Ledger Chain and Proposal Envelope Index verification

// Stream utils managed by injected deps

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
  await sha256_hex(
    stable_stringify({
      chain_version: LEDGER_CHAIN_VERSION,
      prev_event_hash: prevEventHash,
      body,
    }),
  );

const verifyLedgerChainDetailedInternal = async (
  path: string,
): Promise<LedgerChainReportInternal> => {
  const lines = await read_jsonl_lines(path);
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
      : normalize_hex64(row.prev_event_hash);
    if (
      row.prev_event_hash !== null &&
      typeof row.prev_event_hash !== "string"
    ) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalize_hex64(row.event_hash);
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
    await append_jsonl(LEDGER__08_00_LEDGER.STORAGE_PATH, {
      ...body,
      chain_version: LEDGER_CHAIN_VERSION,
      prev_event_hash: prevEventHash,
      event_hash: eventHash,
    });
  },
  readAllRaw: async function* (): AsyncGenerator<any> {
    yield* read_jsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  readAll: async function* (): AsyncGenerator<any> {
    yield* read_jsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
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

// -------------------------------------------------------------------------
// PROPOSAL ENVELOPE INDEX
// -------------------------------------------------------------------------

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
  stable_stringify({
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
  await sha256_hex(
    stable_stringify({
      chain_version: ENVELOPE_INDEX_CHAIN_VERSION,
      prev_index_hash: prevIndexHash,
      payload: JSON.parse(canonicalEnvelopeIndexPayload(entry)),
    }),
  );

const ensureEnvelopeIndexCache = async (path: string): Promise<void> => {
  if (envelopeIndexCacheLoaded.has(path)) return;
  const seen = getEnvelopeIndexSeen(path);
  let tail: string | null = null;
  const lines = await read_jsonl_lines(path);
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      const tick = Number(row.tick);
      const proposalId = typeof row.proposal_id === "string"
        ? row.proposal_id
        : "";
      const envelopeHash = normalize_hex64(row.envelope_hash) ?? "";
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
      const recordedHash = normalize_hex64(row.index_hash);
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
    const hash = normalize_hex64(envelopeHash);
    if (!hash) return;
    const indexPath = resolveEnvelopeIndexPath(path);
    getEnvelopeIndexSeen(indexPath).add(hash);
  },
  check: (envelopeHash?: string, path?: string): boolean => {
    const hash = normalize_hex64(envelopeHash);
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
    const lines = await read_jsonl_lines(indexPath);
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
      const envelopeHash = normalize_hex64(row.envelope_hash);
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
        failures.push(
          `ENVELOPE_INDEX_ENVELOPE_HASH_INVALID_AT_LINE_${lineNo}`,
        );
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
        : normalize_hex64(row.prev_index_hash);
      const hasRecordedPrev = row.prev_index_hash !== undefined;
      if (hasRecordedPrev && recordedPrev !== prevHash) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
      }

      const recordedHash = normalize_hex64(row.index_hash);
      if (row.index_hash !== undefined && !recordedHash) {
        failures.push(
          `ENVELOPE_INDEX_RECORD_HASH_INVALID_AT_LINE_${lineNo}`,
        );
      }
      if (!hasRecordedPrev && recordedHash && i > 0) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISSING_AT_LINE_${lineNo}`);
      }
      if (recordedHash && recordedHash !== expectedHash) {
        failures.push(
          `ENVELOPE_INDEX_RECORD_HASH_MISMATCH_AT_LINE_${lineNo}`,
        );
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
    for await (const row of read_jsonl(resolveEnvelopeIndexPath(path))) {
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
      const envelopeHash = normalize_hex64(env?.envelope_hash) ?? "";
      if (!envelopeHash) continue;
      const indexHash = await envelopeIndexRecordHash({
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
      }, prevIndexHash);
      await append_jsonl(indexPath, {
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
```

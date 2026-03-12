// i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts
// OMEGA-64 | Append-only envelope replay index for O(1)-style recent duplicate checks.

import type { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface ProposalEnvelopeIndexRecord {
    chain_version: string;
    prev_record_hash: string | null;
    record_hash: string;
    envelope_hash: string;
    proposal_id: string;
    tick: number;
    event_id: string;
    state_before_hash: string;
    state_after_hash: string;
    ts_unix_ms: number;
    witness?: string;
}

export interface ProposalEnvelopeIndexVerification {
    ok: boolean;
    failures: string[];
    checked_records: number;
    tail_hash: string | null;
}

const CHAIN_VERSION = "proposal-envelope-index/v1";
const HEX_64_RE = /^[0-9a-f]{64}$/;
const DEFAULT_STORAGE_PATH = "./OMEGA_PROPOSAL_ENVELOPE_INDEX.jsonl";

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
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

const indexRecordHash = async (
    record: Omit<ProposalEnvelopeIndexRecord, "record_hash">
): Promise<string> => await sha256Hex(stableStringify(record));

const parseRecord = (
    line: string,
    lineNumber: number
): { ok: true; record: ProposalEnvelopeIndexRecord } | { ok: false; error: string } => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(line);
    } catch {
        return { ok: false, error: `ENVELOPE_INDEX_LINE_PARSE_FAIL_AT_LINE_${lineNumber}` };
    }
    const rec = parsed as Partial<ProposalEnvelopeIndexRecord>;
    const shapeOk =
        rec.chain_version === CHAIN_VERSION &&
        (typeof rec.prev_record_hash === "string" || rec.prev_record_hash === null) &&
        typeof rec.record_hash === "string" &&
        HEX_64_RE.test(rec.record_hash) &&
        typeof rec.envelope_hash === "string" &&
        HEX_64_RE.test(rec.envelope_hash) &&
        typeof rec.proposal_id === "string" &&
        typeof rec.tick === "number" &&
        Number.isSafeInteger(rec.tick) &&
        rec.tick >= 0 &&
        typeof rec.event_id === "string" &&
        typeof rec.state_before_hash === "string" &&
        typeof rec.state_after_hash === "string" &&
        typeof rec.ts_unix_ms === "number" &&
        Number.isSafeInteger(rec.ts_unix_ms) &&
        rec.ts_unix_ms >= 0 &&
        (rec.witness === undefined || typeof rec.witness === "string");
    if (!shapeOk) {
        return { ok: false, error: `ENVELOPE_INDEX_LINE_SCHEMA_INVALID_AT_LINE_${lineNumber}` };
    }
    return { ok: true, record: rec as ProposalEnvelopeIndexRecord };
};

interface CacheEntry {
    loaded: boolean;
    tail_hash: string | null;
    tick_to_hashes: Map<number, Set<string>>;
}

const caches = new Map<string, CacheEntry>();

const cacheFor = (storagePath: string): CacheEntry => {
    const existing = caches.get(storagePath);
    if (existing) return existing;
    const created: CacheEntry = {
        loaded: false,
        tail_hash: null,
        tick_to_hashes: new Map()
    };
    caches.set(storagePath, created);
    return created;
};

const resetCache = (storagePath?: string): void => {
    if (storagePath) {
        caches.delete(storagePath);
        return;
    }
    caches.clear();
};

const pruneBeforeTick = (entry: CacheEntry, minTick: number): void => {
    for (const tick of entry.tick_to_hashes.keys()) {
        if (tick < minTick) {
            entry.tick_to_hashes.delete(tick);
        }
    }
};

const ensureLoaded = async (storagePath: string): Promise<CacheEntry> => {
    const entry = cacheFor(storagePath);
    if (entry.loaded) return entry;

    entry.loaded = false;
    entry.tail_hash = null;
    entry.tick_to_hashes.clear();

    const verify = await PROPOSAL_ENVELOPE_INDEX.verifyChainDetailed(storagePath);
    if (!verify.ok) {
        throw new Error(`ENVELOPE_INDEX_CHAIN_INVALID:${verify.failures.join(",")}`);
    }

    try {
        const content = await Deno.readTextFile(storagePath);
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().length === 0) continue;
            const parsed = parseRecord(line, i + 1);
            if (!parsed.ok) {
                throw new Error(parsed.error);
            }
            const rec = parsed.record;
            let set = entry.tick_to_hashes.get(rec.tick);
            if (!set) {
                set = new Set<string>();
                entry.tick_to_hashes.set(rec.tick, set);
            }
            set.add(rec.envelope_hash);
            entry.tail_hash = rec.record_hash;
        }
    } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
            throw e;
        }
    }

    entry.loaded = true;
    return entry;
};

export const PROPOSAL_ENVELOPE_INDEX = {
    CHAIN_VERSION,
    STORAGE_PATH: DEFAULT_STORAGE_PATH,
    pathForLedger: (ledgerPath: string): string => `${ledgerPath}.proposal_envelope_index.jsonl`,

    resetCacheForTests: (storagePath?: string): void => resetCache(storagePath),

    verifyChainDetailed: async (
        storagePath?: string
    ): Promise<ProposalEnvelopeIndexVerification> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const failures: string[] = [];
        let checked = 0;
        let prevHash: string | null = null;
        let prevTick = -1;
        let prevTs = -1;

        try {
            const content = await Deno.readTextFile(path);
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim().length === 0) continue;
                checked++;
                const parsed = parseRecord(line, i + 1);
                if (!parsed.ok) {
                    failures.push(parsed.error);
                    break;
                }
                const rec = parsed.record;
                if (rec.prev_record_hash !== prevHash) {
                    failures.push(`ENVELOPE_INDEX_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (rec.tick < prevTick) {
                    failures.push(`ENVELOPE_INDEX_TICK_NON_MONOTONIC_AT_LINE_${i + 1}`);
                    break;
                }
                if (rec.ts_unix_ms < prevTs) {
                    failures.push(`ENVELOPE_INDEX_TS_NON_MONOTONIC_AT_LINE_${i + 1}`);
                    break;
                }
                const expected = await indexRecordHash({
                    chain_version: rec.chain_version,
                    prev_record_hash: rec.prev_record_hash,
                    envelope_hash: rec.envelope_hash,
                    proposal_id: rec.proposal_id,
                    tick: rec.tick,
                    event_id: rec.event_id,
                    state_before_hash: rec.state_before_hash,
                    state_after_hash: rec.state_after_hash,
                    ts_unix_ms: rec.ts_unix_ms,
                    witness: rec.witness
                });
                if (expected !== rec.record_hash) {
                    failures.push(`ENVELOPE_INDEX_RECORD_HASH_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                prevHash = rec.record_hash;
                prevTick = rec.tick;
                prevTs = rec.ts_unix_ms;
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e;
            }
        }

        return {
            ok: failures.length === 0,
            failures,
            checked_records: checked,
            tail_hash: prevHash
        };
    },

    appendFromLedgerEvent: async (
        event: LedgerEvent,
        storagePath?: string
    ): Promise<void> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const accepted = event.accepted_proposal_envelopes ?? [];
        if (accepted.length === 0) return;

        const entry = await ensureLoaded(path);
        let prev = entry.tail_hash;
        const lines: string[] = [];
        for (const a of accepted) {
            if (typeof a.envelope_hash !== "string" || !HEX_64_RE.test(a.envelope_hash)) {
                continue;
            }
            const recordWithoutHash: Omit<ProposalEnvelopeIndexRecord, "record_hash"> = {
                chain_version: CHAIN_VERSION,
                prev_record_hash: prev,
                envelope_hash: a.envelope_hash,
                proposal_id: a.proposal_id,
                tick: event.tick,
                event_id: event.event_id,
                state_before_hash: event.state_before_hash,
                state_after_hash: event.state_after_hash,
                ts_unix_ms: event.ts_unix_ms,
                witness: event.witness
            };
            const recHash = await indexRecordHash(recordWithoutHash);
            const rec: ProposalEnvelopeIndexRecord = {
                ...recordWithoutHash,
                record_hash: recHash
            };
            lines.push(JSON.stringify(rec));
            prev = recHash;
            let set = entry.tick_to_hashes.get(rec.tick);
            if (!set) {
                set = new Set<string>();
                entry.tick_to_hashes.set(rec.tick, set);
            }
            set.add(rec.envelope_hash);
        }
        if (lines.length > 0) {
            await Deno.writeTextFile(path, lines.map((x) => `${x}\n`).join(""), {
                append: true,
                create: true
            });
            entry.tail_hash = prev;
        }
    },

    getRecentEnvelopeHashes: async (
        minTick: number,
        maxTick: number,
        storagePath?: string
    ): Promise<Set<string>> => {
        const path = storagePath ?? PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;
        const entry = await ensureLoaded(path);
        const out = new Set<string>();
        pruneBeforeTick(entry, minTick);
        for (const [tick, hashes] of entry.tick_to_hashes.entries()) {
            if (tick < minTick || tick > maxTick) continue;
            for (const hash of hashes) {
                out.add(hash);
            }
        }
        return out;
    }
};

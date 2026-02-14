/// <reference lib="deno.ns" />
// i.L99.core.LEDGER.ts
// 🛡️ OMEGA-64 | Glider Lite | Append-Only Ledger
// Records every state transition for replay and audit.

import { LedgerEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { CHECKPOINT } from "./i.L99.core.CHECKPOINT.ts";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

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

const CHAIN_VERSION = "ledger-hash/v1";
const LEGACY_HASH_VERSION = "legacy-event/v0";

type ChainAwareEvent = TopologyEvent & {
    chain_version?: string;
    prev_event_hash?: string | null;
    event_hash?: string;
};

const stripChainFields = (event: TopologyEvent): Record<string, unknown> => {
    const clone = { ...((event as unknown) as Record<string, unknown>) };
    delete clone.chain_version;
    delete clone.prev_event_hash;
    delete clone.event_hash;
    return clone;
};

const eventHashPayload = (event: TopologyEvent, prevEventHash: string | null) => ({
    chain_version: CHAIN_VERSION,
    prev_event_hash: prevEventHash,
    body: stripChainFields(event)
});

const legacyHashPayload = (event: TopologyEvent) => ({
    chain_version: LEGACY_HASH_VERSION,
    body: stripChainFields(event)
});

export interface LedgerChainVerification {
    ok: boolean;
    failures: string[];
    checkedEvents: number;
    chainAnchoredEvents: number;
    legacyEvents: number;
    tailHash: string | null;
}

export const LEDGER = {
    
    // Path to the physical ledger file (simulated for now)
    STORAGE_PATH: "./OMEGA_LEDGER.jsonl",
    CHAIN_VERSION,

    /**
     * Appends a new event to the ledger.
     * In a real system, this would be an atomic file append or DB insert.
     */
    append: async (event: TopologyEvent): Promise<void> => {
        const chain = await LEDGER.verifyChainDetailed();
        if (!chain.ok) {
            throw new Error(`LEDGER_CHAIN_INVALID:${chain.failures.join(",")}`);
        }

        const prevEventHash = chain.tailHash;
        const eventHash = await sha256Hex(stableStringify(eventHashPayload(event, prevEventHash)));
        const chainEvent: ChainAwareEvent = {
            ...(event as ChainAwareEvent),
            chain_version: CHAIN_VERSION,
            prev_event_hash: prevEventHash,
            event_hash: eventHash
        };

        const line = JSON.stringify(chainEvent);
        const eventRef = "event_id" in event ? event.event_id : event.event_type;
        try {
            await Deno.writeTextFile(LEDGER.STORAGE_PATH, line + "\n", { append: true });
            // console.log(`📝 LEDGER: Event ${event.event_id} appended.`);
        } catch (e) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("LEDGER", `Could not write event ${eventRef}`, { error: String(e) }),
                "ERROR"
            );
            throw e; // Integrity failure is fatal
        }
    },

    /**
     * Reads the entire ledger for replay.
     * Returns a generator to handle large files.
     */
    readAllRaw: async function* (): AsyncGenerator<TopologyEvent> {
        try {
            const content = await Deno.readTextFile(LEDGER.STORAGE_PATH);
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim().length === 0) continue;
                try {
                    yield JSON.parse(line);
                } catch (e) {
                    await TELEMETRY_SIGNAL(
                        TELEMETRY("LEDGER", "Corrupt line skipped", { error: String(e) }),
                        "WARNING"
                    );
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                await TELEMETRY_SIGNAL(
                    TELEMETRY("LEDGER", "LEDGER READ FAILURE", { error: String(e) }),
                    "ERROR"
                );
            }
        }
    },

    readAll: async function* (): AsyncGenerator<LedgerEvent> {
        for await (const entry of LEDGER.readAllRaw()) {
            if (LEDGER.isLedgerEvent(entry)) {
                yield entry;
            }
        }
    },

    isLedgerEvent: (entry: unknown): entry is LedgerEvent => {
        const e = entry as Partial<LedgerEvent> | null;
        return Boolean(
            e &&
            typeof e === "object" &&
            typeof e.tick === "number" &&
            Array.isArray(e.accepted_delta) &&
            typeof e.state_before_hash === "string" &&
            typeof e.state_after_hash === "string"
        );
    },

    /**
     * Verifies the hash chain integrity of the ledger.
     * (Placeholder for future implementation)
     */
    verifyChain: async (): Promise<boolean> => {
        const result = await LEDGER.verifyChainDetailed();
        return result.ok;
    },

    verifyChainDetailed: async (): Promise<LedgerChainVerification> => {
        const failures: string[] = [];
        let checkedEvents = 0;
        let chainAnchoredEvents = 0;
        let legacyEvents = 0;
        let prevHash: string | null = null;

        try {
            const content = await Deno.readTextFile(LEDGER.STORAGE_PATH);
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim().length === 0) continue;
                checkedEvents++;

                let parsed: TopologyEvent;
                try {
                    parsed = JSON.parse(line) as TopologyEvent;
                } catch {
                    failures.push(`LEDGER_LINE_PARSE_FAIL_AT_LINE_${i + 1}`);
                    break;
                }

                const e = parsed as ChainAwareEvent;
                const hasChainFields = typeof e.event_hash === "string" || typeof e.prev_event_hash !== "undefined";

                if (!hasChainFields) {
                    legacyEvents++;
                    prevHash = await sha256Hex(stableStringify(legacyHashPayload(parsed)));
                    continue;
                }

                chainAnchoredEvents++;

                if (e.chain_version !== CHAIN_VERSION) {
                    failures.push(`LEDGER_CHAIN_VERSION_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (e.prev_event_hash !== prevHash) {
                    failures.push(`LEDGER_CHAIN_PREV_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }
                if (typeof e.event_hash !== "string") {
                    failures.push(`LEDGER_CHAIN_HASH_MISSING_AT_LINE_${i + 1}`);
                    break;
                }

                const expectedHash = await sha256Hex(stableStringify(eventHashPayload(parsed, prevHash)));
                if (expectedHash !== e.event_hash) {
                    failures.push(`LEDGER_CHAIN_HASH_MISMATCH_AT_LINE_${i + 1}`);
                    break;
                }

                prevHash = e.event_hash;
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e;
            }
        }

        return {
            ok: failures.length === 0,
            failures,
            checkedEvents,
            chainAnchoredEvents,
            legacyEvents,
            tailHash: prevHash
        };
    },

    /**
     * Gets the first LedgerEvent or Checkpoint to serve as Genesis for audits.
     */
    getGenesis: async (): Promise<{ tick: number; state_hash: string; state_i16: Int16Array } | null> => {
        // 1. RITUAL PRIORITY: Search for the latest STABILIZATION_RITUAL checkpoint.
        // This allows the operator to reset the audit anchor and drift awareness.
        let latestRitual: any = null;
        for await (const c of CHECKPOINT.readAll()) {
            if (c.reason === "STABILIZATION_RITUAL") {
                if (!latestRitual || c.tick > latestRitual.tick) {
                    latestRitual = c;
                }
            }
        }

        if (latestRitual) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("LEDGER", `Anchoring Genesis to Ritual at Tick ${latestRitual.tick}`),
                "INFO"
            );
            return {
                tick: latestRitual.tick,
                state_hash: latestRitual.state_hash,
                state_i16: new Int16Array(latestRitual.state_i16)
            };
        }

        // 2. Fallback: Find the first event in history
        let firstEvent: LedgerEvent | null = null;
        for await (const entry of LEDGER.readAllRaw()) {
            if (LEDGER.isLedgerEvent(entry)) {
                firstEvent = entry;
                break;
            }
        }

        if (!firstEvent) return null;

        // 3. Resolve the snapshot at or before this event
        const checkpoint = await CHECKPOINT.loadNearestAtOrBefore(firstEvent.tick);
        if (checkpoint) {
            return {
                tick: checkpoint.tick,
                state_hash: checkpoint.state_hash,
                state_i16: new Int16Array(checkpoint.state_i16)
            };
        }

        // 4. Reconstruction Fallback
        if (firstEvent.tick === 0) {
            return {
                tick: 0,
                state_hash: firstEvent.state_before_hash,
                state_i16: new Int16Array(64)
            };
        }

        await TELEMETRY_SIGNAL(
            TELEMETRY("LEDGER", `Cold Start fallback for tick ${firstEvent.tick}. Audit may drift.`),
            "WARNING"
        );
        return {
            tick: firstEvent.tick,
            state_hash: firstEvent.state_before_hash,
            state_i16: new Int16Array(64)
        };
    }
};

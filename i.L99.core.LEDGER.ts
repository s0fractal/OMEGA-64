// i.L99.core.LEDGER.ts
// 🛡️ OMEGA-64 | Glider Lite | Append-Only Ledger
// Records every state transition for replay and audit.

import { LedgerEvent, TopologyEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export const LEDGER = {
    
    // Path to the physical ledger file (simulated for now)
    STORAGE_PATH: "./OMEGA_LEDGER.jsonl",

    /**
     * Appends a new event to the ledger.
     * In a real system, this would be an atomic file append or DB insert.
     */
    append: async (event: TopologyEvent): Promise<void> => {
        const line = JSON.stringify(event);
        const eventRef = "event_id" in event ? event.event_id : event.event_type;
        try {
            await Deno.writeTextFile(LEDGER.STORAGE_PATH, line + "\n", { append: true });
            // console.log(`📝 LEDGER: Event ${event.event_id} appended.`);
        } catch (e) {
            console.error(`🚨 LEDGER FAILURE: Could not write event ${eventRef}`, e);
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
                    console.warn(`⚠️ LEDGER: Corrupt line skipped`, e);
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                console.error("🚨 LEDGER READ FAILURE", e);
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
        // TODO: Implement hash chain verification
        return true;
    }
};

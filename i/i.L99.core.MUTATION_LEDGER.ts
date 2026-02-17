/// <reference lib="deno.ns" />
// i.L99.core.MUTATION_LEDGER.ts
// OMEGA-64 | The Hand's Memory
// Append-only audit trail for structural evolution.
import { TOPOLOGICAL_SIGNATURE } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

export interface MutationEvent {
    timestamp: string;
    atom_id: string;
    action: "WRITE" | "ARCHIVE" | "RESTORE";
    hash_before: string;
    hash_after?: string;
    reason: "TENSION" | "RESONANCE" | "EMERGENCE" | "RECOVERY" | "CLEANSE" | "PRE_MUTATION";
    invariant_packet_hash?: string;
    details?: string;
    prev_event_hash?: string | null;
    event_hash?: string;
    manifold_coordinate?: number[]; // Projected [Int16Array] as Array
}

const MUTATION_LEDGER_PATH = "./OMEGA_MUTATION_LEDGER.jsonl";

export const MUTATION_LEDGER = {
    /**
     * Appends a mutation event to the ledger with causal chaining.
     */
    append: async (event: Omit<MutationEvent, "event_hash" | "prev_event_hash">) => {
        const lastHash = await MUTATION_LEDGER.getTailHash();
        
        const chainEvent: MutationEvent = {
            ...event,
            prev_event_hash: lastHash
        };

        const eventHash = await MUTATION_LEDGER.computeHash(chainEvent);
        chainEvent.event_hash = eventHash;
        chainEvent.manifold_coordinate = Array.from(TOPOLOGICAL_SIGNATURE.hashToManifoldPoint(eventHash));

        const line = JSON.stringify(chainEvent) + "\n";
        try {
            await Deno.writeTextFile(MUTATION_LEDGER_PATH, line, { append: true });
            await TELEMETRY_SIGNAL(
                TELEMETRY(
                    "MUTATION_LEDGER",
                    `Recorded ${event.action} on ${event.atom_id} (Chain: ${eventHash.slice(0, 8)})`
                ),
                "INFO"
            );
        } catch (err) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("MUTATION_LEDGER", "MUTATION_LEDGER FAILURE", { error: String(err) }),
                "ERROR"
            );
        }
    },

    /**
     * Internal: Resolves the tail hash of the mutation ledger.
     */
    getTailHash: async (): Promise<string | null> => {
        try {
            const content = await Deno.readTextFile(MUTATION_LEDGER_PATH);
            const lines = content.trim().split("\n");
            if (lines.length === 0 || lines[0] === "") return null;
            const lastLine = lines[lines.length - 1];
            const parsed = JSON.parse(lastLine) as MutationEvent;
            return parsed.event_hash ?? null;
        } catch {
            return null;
        }
    },

    /**
     * Internal: Computes hash for an event.
     */
    computeHash: async (event: MutationEvent): Promise<string> => {
        const payload = JSON.stringify({
            timestamp: event.timestamp,
            atom_id: event.atom_id,
            action: event.action,
            hash_before: event.hash_before,
            hash_after: event.hash_after,
            reason: event.reason,
            details: event.details,
            invariant_packet_hash: event.invariant_packet_hash,
            prev_event_hash: event.prev_event_hash
        });
        const data = new TextEncoder().encode(payload);
        const digest = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }
};

// i.L99.core.CHECKPOINT.ts
// OMEGA-64 | Persistent Checkpoint Store
// Stores and resolves rollback snapshots.

import { CheckpointRecord, StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

export const CHECKPOINT = {
    STORAGE_PATH: "./OMEGA_CHECKPOINTS.jsonl",

    save: async (
        snapshot: Pick<StateSnapshot, "tick" | "state_hash" | "state_i16">,
        reason: string,
        witness?: string
    ): Promise<CheckpointRecord> => {
        const checkpointId = `ckp_${(await sha256Hex(`${snapshot.tick}|${snapshot.state_hash}|${reason}`)).slice(0, 16)}`;
        const record: CheckpointRecord = {
            checkpoint_id: checkpointId,
            tick: snapshot.tick,
            state_hash: snapshot.state_hash,
            state_i16: Array.from(snapshot.state_i16),
            ts_unix_ms: Date.now(),
            reason,
            witness
        };
        await Deno.writeTextFile(CHECKPOINT.STORAGE_PATH, JSON.stringify(record) + "\n", { append: true });
        return record;
    },

    readAll: async function* (): AsyncGenerator<CheckpointRecord> {
        try {
            const content = await Deno.readTextFile(CHECKPOINT.STORAGE_PATH);
            for (const line of content.split("\n")) {
                if (line.trim().length === 0) continue;
                try {
                    const parsed = JSON.parse(line) as CheckpointRecord;
                    if (
                        typeof parsed.tick === "number" &&
                        typeof parsed.state_hash === "string" &&
                        Array.isArray(parsed.state_i16)
                    ) {
                        yield parsed;
                    }
                } catch {
                    // ignore malformed line
                }
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                await TELEMETRY_SIGNAL(
                    TELEMETRY("CHECKPOINT", "CHECKPOINT READ FAILURE", { error: String(e) }),
                    "ERROR"
                );
            }
        }
    },

    loadExact: async (tick: number): Promise<CheckpointRecord | null> => {
        let found: CheckpointRecord | null = null;
        for await (const c of CHECKPOINT.readAll()) {
            if (c.tick === tick) found = c;
        }
        return found;
    },

    loadNearestAtOrBefore: async (tick: number): Promise<CheckpointRecord | null> => {
        let best: CheckpointRecord | null = null;
        for await (const c of CHECKPOINT.readAll()) {
            if (c.tick <= tick && (!best || c.tick > best.tick)) {
                best = c;
            }
        }
        return best;
    },

    /**
     * RITUAL OF STABILIZATION:
     * Manually requested by the operator to anchor the manifold and reset drift awareness.
     */
    witnessedStabilization: async (
        snapshot: Pick<StateSnapshot, "tick" | "state_hash" | "state_i16">,
        witness: string
    ): Promise<CheckpointRecord> => {
        await TELEMETRY_SIGNAL(
            TELEMETRY("CHECKPOINT", `Performing Ritual of Stabilization at Tick ${snapshot.tick} (Witness: ${witness})`),
            "INFO"
        );
        return await CHECKPOINT.save(snapshot, "STABILIZATION_RITUAL", witness);
    }
};

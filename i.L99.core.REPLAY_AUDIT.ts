// i.L99.core.REPLAY_AUDIT.ts
// OMEGA-64 | Deterministic Replay Audit
// Produces a strict replayGreen signal from ledger events.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { TOPOLOGICAL_SIGNATURE, TopologicalSignature } from "./i.L99.core.TOPOLOGICAL_SIGNATURE.ts";

export interface ReplayGenesis {
    tick: number;
    state_i16: Int16Array;
    state_hash: string;
}

export interface ReplayAuditOptions {
    runs?: number;
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
}

export interface ReplayAuditResult {
    replayGreen: boolean;
    runs: number;
    checkedEvents: number;
    skippedEvents: number;
    checkedProjectionEvents: number;
    skippedProjectionEvents: number;
    finalHashes: string[];
    failures: string[];
}

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
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

const saturatingAdd = (base: Int16Array, delta: Array<{ level: number; value: number }>): Int16Array => {
    const next = new Int16Array(base) as Int16Array;
    for (const d of delta) {
        if (!Number.isInteger(d.level) || d.level < 0 || d.level >= next.length) {
            continue;
        }
        let value = next[d.level] + d.value;
        if (value > 32767) value = 32767;
        if (value < -32768) value = -32768;
        next[d.level] = value;
    }
    return next;
};

const expectedStateHash = async (
    nextState: Int16Array,
    nextTick: number,
    gateConfigVersion: string,
    proposalDigest: string
): Promise<string> =>
    await sha256Hex(stableStringify({
        state_i16: Array.from(nextState),
        tick: nextTick,
        gate_config_version: gateConfigVersion,
        proposal_digest: proposalDigest
    }));

const collectLedgerEvents = async (startTick?: number, endTick?: number): Promise<{ events: LedgerEvent[]; skipped: number }> => {
    const byTick = new Map<number, LedgerEvent>();
    let skipped = 0;

    for await (const entry of LEDGER.readAll()) {
        const inStart = startTick === undefined || entry.tick >= startTick;
        const inEnd = endTick === undefined || entry.tick <= endTick;
        if (!inStart || !inEnd) {
            continue;
        }
        // Skip non-mutating dry-run style events in replay chain.
        if (entry.state_after_hash === entry.state_before_hash) {
            skipped++;
            continue;
        }
        // Last event for same tick wins (append-only correction pattern).
        byTick.set(entry.tick, entry);
    }

    return {
        events: Array.from(byTick.values()).sort((a, b) => a.tick - b.tick),
        skipped
    };
};

export const REPLAY_AUDIT = {
    audit: async (genesis: ReplayGenesis, options: ReplayAuditOptions = {}): Promise<ReplayAuditResult> => {
        const runs = options.runs ?? 3;
        const verifyTopologicalSignatures = options.verifyTopologicalSignatures ?? true;
        const { events, skipped } = await collectLedgerEvents(options.startTick, options.endTick);
        const finalHashes: string[] = [];
        const failures: string[] = [];
        let checkedProjectionEvents = 0;
        let skippedProjectionEvents = 0;

        for (let run = 0; run < runs; run++) {
            let tick = genesis.tick;
            let stateHash = genesis.state_hash;
            let state = new Int16Array(genesis.state_i16) as Int16Array;

            for (const evt of events) {
                const expectedTick = tick;
                if (evt.tick !== expectedTick) {
                    failures.push(`run=${run} tick continuity mismatch: expected ${expectedTick}, got ${evt.tick}`);
                    break;
                }
                if (evt.state_before_hash !== stateHash) {
                    failures.push(`run=${run} state_before_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                const nextState = saturatingAdd(state, evt.accepted_delta);
                const nextTick = tick + 1;
                const expectedHash = await expectedStateHash(
                    nextState,
                    nextTick,
                    evt.gate_config_version,
                    evt.proposal_digest
                );

                if (evt.state_after_hash !== expectedHash) {
                    failures.push(`run=${run} state_after_hash mismatch at tick ${evt.tick}`);
                    break;
                }

                if (verifyTopologicalSignatures) {
                    const hasProjectionData = Boolean(
                        evt.projection_2d_hash ||
                        evt.thread_1d_hash ||
                        evt.projection_version ||
                        evt.signature_artifact_hash ||
                        evt.signature_tick ||
                        evt.signature_causal_refs
                    );

                    if (hasProjectionData) {
                        if (!evt.projection_2d_hash || !evt.thread_1d_hash || !evt.projection_version) {
                            failures.push(`run=${run} incomplete projection fields at tick ${evt.tick}`);
                            break;
                        }
                        if (evt.projection_version !== TOPOLOGICAL_SIGNATURE.PROJECTION_VERSION) {
                            failures.push(`run=${run} unsupported projection version at tick ${evt.tick}`);
                            break;
                        }
                        if (evt.signature_tick !== undefined && evt.signature_tick !== nextTick) {
                            failures.push(`run=${run} signature_tick mismatch at tick ${evt.tick}`);
                            break;
                        }
                        if (evt.signature_artifact_hash !== undefined && evt.signature_artifact_hash !== evt.proposal_digest) {
                            failures.push(`run=${run} signature_artifact_hash mismatch at tick ${evt.tick}`);
                            break;
                        }

                        const signature: TopologicalSignature = {
                            artifact_hash: evt.signature_artifact_hash ?? evt.proposal_digest,
                            state_hash: expectedHash,
                            tick: evt.signature_tick ?? nextTick,
                            causal_refs: evt.signature_causal_refs ?? [],
                            projection_2d_hash: evt.projection_2d_hash,
                            thread_1d_hash: evt.thread_1d_hash,
                            projection_version: evt.projection_version
                        };

                        const verifyResult = await TOPOLOGICAL_SIGNATURE.verify(
                            signature,
                            TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
                                state_hash: expectedHash,
                                state_i16: nextState
                            })
                        );

                        if (!verifyResult.ok) {
                            failures.push(
                                `run=${run} projection mismatch at tick ${evt.tick}: ${verifyResult.reasons.join("|")}`
                            );
                            break;
                        }

                        if (run === 0) checkedProjectionEvents++;
                    } else {
                        if (run === 0) skippedProjectionEvents++;
                    }
                }

                tick = nextTick;
                state = nextState;
                stateHash = expectedHash;
            }

            finalHashes.push(stateHash);
        }

        const allEqual = finalHashes.length > 0 && finalHashes.every((h) => h === finalHashes[0]);
        const replayGreen = failures.length === 0 && allEqual;

        return {
            replayGreen,
            runs,
            checkedEvents: events.length,
            skippedEvents: skipped,
            checkedProjectionEvents,
            skippedProjectionEvents,
            finalHashes,
            failures
        };
    }
};

if (import.meta.main) {
    console.log("Usage: import REPLAY_AUDIT and call audit(genesis, options).");
}

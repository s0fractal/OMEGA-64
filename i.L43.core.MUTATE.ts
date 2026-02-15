// i.L43.core.MUTATE.ts
// OMEGA-64 | The Hand of Sovereignty
// Disciplined structural evolution through the Safe Window.

import { MUTATION_LEDGER, MutationEvent } from "./i.L99.core.MUTATION_LEDGER.ts";
import { CANON_CAUSAL_BRIDGE } from "./i.L32.core.CANON_CAUSAL_BRIDGE.ts";
import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { PROJECTION_DRIFT_ANALYTICS } from "./i.L99.core.PROJECTION_DRIFT_ANALYTICS.ts";
import { DETERMINISM_LAWS } from "./i.L99.core.DETERMINISM_LAWS.ts";

export interface MutationRequest {
    atomId: string;
    content?: string;
    reason: MutationEvent["reason"];
    details?: string;
    dryRun?: boolean;
    invariant_packet_hash?: string;
    timestamp?: string;
}

export const MUTATE = {
    SAFE_DRIFT_THRESHOLD: 0.05, // 5% mean drift limit for safe window
    SAFE_DRIFT_SLOPE_THRESHOLD: 0.02, // 2% drift slope limit for safe window

    /**
     * Checks if the system is in a Safe Mutation Window.
     */
    checkSovereignty: async () => {
        // 1. Get Genesis for Audit
        const genesisRecord = await LEDGER.getGenesis();
        if (!genesisRecord) return { ok: false, reason: "GENESIS_NOT_FOUND" };
        const genesis = {
            tick: genesisRecord.tick,
            state_hash: genesisRecord.state_hash,
            state_i16: genesisRecord.state_i16
        };

        // 2. Run Structural Audit
        const audit = await REPLAY_AUDIT.audit(genesis, { runs: 1, verifyLedgerChain: true });
        
        // 3. Resolve Bridge Mode
        const bridge = CANON_CAUSAL_BRIDGE.resolveMode(audit.invariantReport);

        // 4. Run Drift Analytics
        const driftReport = await PROJECTION_DRIFT_ANALYTICS.analyze(genesis, {});
        const meanDrift = driftReport.ok ? 
            driftReport.driftByLevelMean.reduce((a, b) => a + b, 0) / driftReport.levelCount : 
            1.0;
        const meanSlope = driftReport.ok ?
            driftReport.driftSlopeByLevelMean.reduce((a, b) => a + b, 0) / driftReport.levelCount :
            1.0;

        // 5. Threshold Logic
        const isGreen = bridge.mode === "GREEN";
        const isReplayGreen = audit.replayGreen;
        const indexOk = audit.invariantReport.gate_admission_index_chain_ok;
        const driftOk = meanDrift <= MUTATE.SAFE_DRIFT_THRESHOLD &&
            meanSlope <= MUTATE.SAFE_DRIFT_SLOPE_THRESHOLD;

        if (!isGreen || !isReplayGreen || !indexOk || !driftOk) {
            return { 
                ok: false, 
                reason: `WINDOW_CLOSED: bridge=${bridge.mode}, replay=${isReplayGreen}, index=${indexOk}, drift=${meanDrift.toFixed(4)}, slope=${meanSlope.toFixed(4)}`,
                bridge_mode: bridge.mode,
                replay_green: isReplayGreen,
                index_ok: indexOk,
                meanDrift,
                meanSlope
            };
        }

        return { 
            ok: true, 
            audit, 
            meanDrift, 
            meanSlope,
            bridge_mode: bridge.mode,
            replay_green: isReplayGreen,
            index_ok: indexOk
        };
    },

    /**
     * Atomic Write with Ledger and Sovereignty Check.
     */
    write: async (req: MutationRequest) => {
        const { atomId, content, reason, details, dryRun = false, invariant_packet_hash, timestamp } = req;
        if (!content) throw new Error("MUTATE: Content required for WRITE action.");


        // Structural mutations (TENSION/RESONANCE/EMERGENCE) MUST have an invariant packet
        if (["TENSION", "RESONANCE", "EMERGENCE"].includes(reason) && !invariant_packet_hash) {
            return { ok: false, reason: "MISSING_INVARIANT_PACKET" };
        }

        // Determinism Law Audit (Physics Gate)
        const audit = DETERMINISM_LAWS.audit({ atomId, content });
        if (!audit.ok) {
            const reasonText = audit.reasons.join("|");
            return { ok: false, reason: `DETERMINISM_LAW_VIOLATION:${reasonText}` };
        }

        // Check window
        const window = await MUTATE.checkSovereignty();
        if (!window.ok) {
            return { ok: false, reason: window.reason };
        }

        if (dryRun) {
            return { ok: true, dryRun: true };
        }

        try {
            const hashBefore = await MUTATE.getHash(atomId);
            const tail = await MUTATION_LEDGER.getTailHash();
            const stamp = tail ? tail.slice(0, 12) : "GENESIS";
            const eventTimestamp = timestamp ?? `T${stamp}`;
            
            // Backup (Pass sovereigntyVerified: true as we just checked it)
            await MUTATE.archive(atomId, "PRE_MUTATION", true, eventTimestamp);

            // Write
            await Deno.writeTextFile(atomId, content);
            const hashAfter = await MUTATE.getHash(atomId);

            // Record in Mutation Ledger
            await MUTATION_LEDGER.append({
                timestamp: eventTimestamp,
                atom_id: atomId,
                action: "WRITE",
                hash_before: hashBefore,
                hash_after: hashAfter,
                reason,
                details,
                invariant_packet_hash
            });

            return { ok: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { ok: false, reason: msg };
        }
    },

    /**
     * Archives an Atom.
     */
    archive: async (
        atomId: string,
        reason: MutationEvent["reason"] = "CLEANSE",
        sovereigntyVerified = false,
        timestamp?: string
    ) => {
        try {
            // Check window if not already verified (e.g. by write())
            if (!sovereigntyVerified) {
                const window = await MUTATE.checkSovereignty();
                if (!window.ok) {
                    return { ok: false, reason: window.reason };
                }
            }

            const hashBefore = await MUTATE.getHash(atomId);
            const tail = await MUTATION_LEDGER.getTailHash();
            const stamp = tail ? tail.slice(0, 12) : "GENESIS";
            const eventTimestamp = timestamp ?? `T${stamp}`;
            const backupPath = `./archive/${atomId}.${hashBefore.slice(0, 8)}.${stamp}.bak`;
            await Deno.mkdir("./archive", { recursive: true });
            await Deno.rename(atomId, backupPath);

            await MUTATION_LEDGER.append({
                timestamp: eventTimestamp,
                atom_id: atomId,
                action: "ARCHIVE",
                hash_before: hashBefore,
                reason,
                details: `Archived to ${backupPath}`
            });

            return { ok: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { ok: false, reason: msg };
        }
    },

    /**
     * Internal: Computes SHA-256 hash of a file.
     */
    getHash: async (path: string): Promise<string> => {
        try {
            const data = await Deno.readFile(path);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        } catch {
            return "NULL_OR_MISSING";
        }
    }
};

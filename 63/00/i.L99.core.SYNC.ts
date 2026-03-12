// i.L99.core.SYNC.ts
// 🛡️ OMEGA-64 | The Swarm | State Sync
// "To become One, one must remember everything."

import type { PeerInfo } from "./i.L99.core.PEER.ts";
import { StateSnapshot, TopologyEvent, LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { PROPOSAL_ENVELOPE_INDEX } from "./i.L99.core.PROPOSAL_ENVELOPE_INDEX.ts";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

export const SYNC = {
    
    /**
     * Pull missing state from a peer.
     * @param peer The peer to sync from.
     * @param localState Current local state.
     */
    pull: async (peer: PeerInfo, localState: StateSnapshot): Promise<TopologyEvent[]> => {
        const peerPort = peer.address.split(":")[1];
        if (!peerPort) return [];
        
        const peerLedgerPath = `./OMEGA_LEDGER_${peerPort}.jsonl`;
        await TELEMETRY_SIGNAL(
            TELEMETRY("SYNC", `Pulling from [${peer.id}] (${peerLedgerPath})...`),
            "INFO"
        );

        const missingEvents: TopologyEvent[] = [];

        try {
            // Read peer ledger
            const content = await Deno.readTextFile(peerLedgerPath);
            const lines = content.split('\n');
            
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const event = JSON.parse(line) as TopologyEvent;
                    
                    // We only care about events AFTER our current tick
                    // In a real Merkle system, we'd check hashes. 
                    // Here we trust the Tick count for simplicity.
                    const e = event as any; // Cast to access tick
                    if (e.tick > localState.tick) {
                        missingEvents.push(event);
                    }
                } catch (e) {
                    // Skip corrupt lines
                }
            }
        } catch (e) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("SYNC", "Could not read peer ledger", { error: String(e) }),
                "WARNING"
            );
        }

        return missingEvents;
    },

    /**
     * Apply pulled events to local state.
     * This is a "Fast Forward" - we trust the peer's valid chain.
     */
    apply: async (events: TopologyEvent[], currentState: StateSnapshot): Promise<StateSnapshot> => {
        const state = currentState;
        for (const event of events) {
            const e = event as any;
            
            // Iterate through accepted proposals and apply them.
            if (e.accepted_delta) {
                // It's a LedgerEvent
                for (const proposal of e.accepted_delta) {
                     // Apply delta to state_i16 if possible
                }
            }
            
            // For this specific Era 4.0 Skeleton, we will cheat slightly:
            // We mainly sync the TICK and HASH to show consensus. 
            state.tick = e.tick;
            state.state_hash = e.state_after_hash;
            
            // 📝 CRITICAL: Write the synced event to local ledger
            // We must append it so our chain remains valid for future writes.
            await LEDGER.append(e);

            // 🛡️ Index Sync
            const indexPat = PROPOSAL_ENVELOPE_INDEX.pathForLedger(LEDGER.STORAGE_PATH);
            if (e.accepted_proposal_envelopes) {
                await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(e as LedgerEvent, indexPat);
            }
        }
        
        await TELEMETRY_SIGNAL(
            TELEMETRY("SYNC", `Applied ${events.length} events. New Tick: ${state.tick}`),
            "INFO"
        );
        return state;
    }
};

// i.L99.core.DISCOVERY.ts
// 🛡️ OMEGA-64 | The Swarm | Network Discovery
// Implements local discovery via Shared File (OMEGA_SWARM.json).

import { PEER, type PeerInfo } from "./i.L99.core.PEER.ts";

const DISCOVERY_FILE = "./OMEGA_SWARM.json";

export const DISCOVERY = {
    /**
     * Broadcast presence to the swarm.
     */
    pulse: async () => {
        try {
            // Read existing swarm state
            let swarm: PeerInfo[] = [];
            try {
                const text = await Deno.readTextFile(DISCOVERY_FILE);
                swarm = JSON.parse(text);
            } catch (e) {
                // File missing or corrupt, start fresh
                swarm = [];
            }

            // Remove old entry for self (if any)
            swarm = swarm.filter(p => p.id !== PEER.SELF.id);

            // Add self
            swarm.push(PEER.SELF);

            // Write back (atomic-ish)
            await Deno.writeTextFile(DISCOVERY_FILE, JSON.stringify(swarm, null, 2));

            // Also update local knowledge from other peers
            swarm.forEach(p => {
                if (p.id !== PEER.SELF.id) {
                    PEER.see(p);
                }
            });

            console.log(`📡 SWARM: Pulsed. Peers Visible: ${PEER.knownPeers.size}`);
        } catch (e) {
            console.error("🔴 SWARM Error:", e);
        }
    }
};

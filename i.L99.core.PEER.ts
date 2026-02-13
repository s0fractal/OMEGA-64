// i.L99.core.PEER.ts
// 🛡️ OMEGA-64 | The Swarm | Peer Identity
// Manages the node's identity and awareness of other nodes.

export interface PeerInfo {
    id: string;
    address: string; // "localhost:8080"
    role: "SEED" | "PEER" | "OBSERVER";
    tick: number;
    entropy: number; // Current system entropy
    lastSeen: number; // Timestamp
}

export const PEER = {
    // Local Identity
    SELF: {
        id: crypto.randomUUID(),
        address: "localhost:8080", // Default
        role: "PEER",
        tick: 0,
        entropy: 0
    } as PeerInfo,

    // Swarm Awareness
    knownPeers: new Map<string, PeerInfo>(),

    /**
     * Update local status (called by LOOP)
     */
    updateSelf: (tick: number, entropy: number, port?: number) => {
        PEER.SELF.tick = tick;
        PEER.SELF.entropy = entropy;
        PEER.SELF.lastSeen = Date.now();
        if (port) {
            PEER.SELF.address = `localhost:${port}`;
        }
    },

    /**
     * Register or update a remote peer
     */
    see: (info: PeerInfo) => {
        if (info.id === PEER.SELF.id) return; // Don't talk to self
        PEER.knownPeers.set(info.id, { ...info, lastSeen: Date.now() });
        // Prune old peers? Later.
    },

    /**
     * Get Swarm Report
     */
    report: () => {
        return {
            self: PEER.SELF,
            peers: Array.from(PEER.knownPeers.values())
        };
    }
};

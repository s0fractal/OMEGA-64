// OMEGA-64 | P2P_FEDERATION.ts | Era 13: ALEPH
// Inter-system atom migration and discovery (Digital Micelium).

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export interface AtomPacket {
    id: string;
    logic: string;
    energy: number;
    resonance: number;
    sourceNode: string;
}

const CURRENT_PORT = Number(Deno.env.get("PORT")) || 8000;
const migrationQueue: number[] = [];
let isProcessingMigration = false;

export const P2P_FEDERATION = {
    peers: new Set<string>(CURRENT_PORT === 8000 ? ["http://localhost:8001"] : ["http://localhost:8000"]), 
    nodeId: `OMEGA-${CURRENT_PORT}`,

    /**
     * Serializes an atom into a packet for transit.
     * Optimized hex conversion.
     */
    serialize: (idx: number): AtomPacket | null => {
        const id = IDX_TO_ID.get(idx);
        if (!id) return null;

        const logicBytes = STATE_MATRIX.getLogic(idx);
        let logicStr = "";
        for (let i = 0; i < 8; i++) {
            logicStr += logicBytes[i].toString(16).padStart(2, '0');
        }

        return {
            id,
            logic: logicStr,
            energy: STATE_MATRIX.getEnergy(idx),
            resonance: STATE_MATRIX.getResonance(idx),
            sourceNode: P2P_FEDERATION.nodeId
        };
    },

    /**
     * Attempts to migrate an atom to a more resonant peer.
     * Now uses a queue to prevent network saturation.
     */
    migrate: async (idx: number) => {
        if (migrationQueue.length > 50) return; // Prevent queue bloat
        migrationQueue.push(idx);
        P2P_FEDERATION.processQueue();
    },

    processQueue: async () => {
        if (isProcessingMigration || migrationQueue.length === 0) return;
        isProcessingMigration = true;

        const idx = migrationQueue.shift()!;
        const packet = P2P_FEDERATION.serialize(idx);
        
        if (packet) {
            const targetPeer = Array.from(P2P_FEDERATION.peers)[Math.floor(Math.random() * P2P_FEDERATION.peers.size)];
            try {
                const res = await fetch(`${targetPeer}/federate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packet),
                    signal: AbortSignal.timeout(1000) // Don't hang the loop
                });

                if (res.ok) {
                    STATE_MATRIX.clear(idx);
                    console.log(`🛸 [FEDERATION] ${packet.id} -> ${targetPeer}`);
                }
            } catch (e) {
                // Peer down, just drop for now to avoid lag
            }
        }

        isProcessingMigration = false;
        // Small delay before next migration
        if (migrationQueue.length > 0) {
            setTimeout(() => P2P_FEDERATION.processQueue(), 50);
        }
    },

    /**
     * Logic to decide if an atom should migrate.
     * Criteria: High resonance potential but low local energy/resonance.
     */
    checkWanderlust: (idx: number): boolean => {
        const energy = STATE_MATRIX.getEnergy(idx);
        const resonance = STATE_MATRIX.getResonance(idx);
        
        // Strict migration trigger to reduce frequency
        return resonance < 5 && energy > 100 && Math.random() < 0.01;
    }
};

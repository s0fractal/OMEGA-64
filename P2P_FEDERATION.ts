// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export interface AtomPacket {
    id: string;
    logic: string;
    energy: number;
    resonance: number;
    sourceNode: string;
    pulseId: number;
}

const CURRENT_PORT = Number(Deno.env.get("PORT")) || 8000;
const migrationQueue: number[] = [];
let isProcessingMigration = false;

export const P2P_FEDERATION = {
    peers: new Set<string>(CURRENT_PORT === 8000 ? ["http://localhost:8001"] : ["http://localhost:8000"]), 
    nodeId: `OMEGA-${CURRENT_PORT}`,

    serialize: (idx: number, pulseId: number = 0): AtomPacket | null => {
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
            sourceNode: P2P_FEDERATION.nodeId,
            pulseId
        };
    },

    migrate: async (idx: number) => {
        if (migrationQueue.length > 100) return; 
        migrationQueue.push(idx);
        P2P_FEDERATION.processQueue();
    },

    processQueue: async () => {
        if (isProcessingMigration || migrationQueue.length === 0) return;
        isProcessingMigration = true;

        const idx = migrationQueue.shift()!;
        // Capture state before transit
        const packet = P2P_FEDERATION.serialize(idx);
        const atomIdAtStart = STATE_MATRIX.getId(idx);
        
        if (packet && atomIdAtStart !== 0n) {
            const targetPeer = Array.from(P2P_FEDERATION.peers)[Math.floor(Math.random() * P2P_FEDERATION.peers.size)];
            try {
                const res = await fetch(`${targetPeer}/federate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packet),
                    signal: AbortSignal.timeout(2000) 
                });

                if (res.ok) {
                    // --- RELIABLE HANDSHAKE ---
                    // Only clear if the atom hasn't changed locally during transit
                    if (STATE_MATRIX.getId(idx) === atomIdAtStart) {
                        STATE_MATRIX.clear(idx);
                        console.log(`🛸 [FEDERATION] ${packet.id} migrated to ${targetPeer}`);
                    } else {
                        console.warn(`🛸 [FEDERATION] Transit collision for ${packet.id}. Local mutation kept.`);
                    }
                }
            } catch (e: any) {
                console.error(`🛸 [FEDERATION] Migration failed for ${packet.id}: ${e.message}`);
            }
        }

        isProcessingMigration = false;
        if (migrationQueue.length > 0) {
            setTimeout(() => P2P_FEDERATION.processQueue(), 50);
        }
    },

    checkWanderlust: (idx: number): boolean => {
        const energy = STATE_MATRIX.getEnergy(idx);
        const resonance = STATE_MATRIX.getResonance(idx);
        // Atoms only migrate if they have high potential but are in a low resonance environment
        return resonance < 5 && energy > 150 && Math.random() < 0.005;
    }
};

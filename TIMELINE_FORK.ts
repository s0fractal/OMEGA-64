// OMEGA-64 | TIMELINE_FORK.ts | Era 13: ALEPH
// Management of parallel realities (SharedArrayBuffer cloning and convergence).

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";

export interface Timeline {
    id: string;
    buffer: SharedArrayBuffer;
    pulseCount: number;
    avgResonance: number;
    active: boolean;
}

export const TIMELINE_FORK = {
    timelines: new Map<string, Timeline>(),
    primaryId: "ALPHA",

    /**
     * Forks the current primary timeline into a new secondary reality.
     */
    branch: (id: string): Timeline => {
        const primary = TIMELINE_FORK.timelines.get(TIMELINE_FORK.primaryId);
        const sourceBuffer = primary ? primary.buffer : STATE_MATRIX.buffer;

        // Zero-cost (byte-wise) clone of the entire Matrix
        const newBuffer = new SharedArrayBuffer(sourceBuffer.byteLength);
        new Uint8Array(newBuffer).set(new Uint8Array(sourceBuffer));

        const fork: Timeline = {
            id,
            buffer: newBuffer,
            pulseCount: 0,
            avgResonance: 0,
            active: true
        };

        TIMELINE_FORK.timelines.set(id, fork);
        console.log(`🌀 [TIMELINE] Fork created: ${id}`);
        return fork;
    },

    /**
     * Initializes the primary timeline if not present.
     */
    init: () => {
        if (!TIMELINE_FORK.timelines.has("ALPHA")) {
            TIMELINE_FORK.timelines.set("ALPHA", {
                id: "ALPHA",
                buffer: STATE_MATRIX.buffer,
                pulseCount: 0,
                avgResonance: 0,
                active: true
            });
        }
    },

    /**
     * Collapses parallel timelines into one survivor based on performance (Resonance).
     */
    collapse: () => {
        if (TIMELINE_FORK.timelines.size <= 1) return;

        let winner: Timeline | null = null;
        let maxRes = -1;

        for (const t of TIMELINE_FORK.timelines.values()) {
            if (t.avgResonance > maxRes) {
                maxRes = t.avgResonance;
                winner = t;
            }
        }

        if (winner && winner.id !== TIMELINE_FORK.primaryId) {
            console.log(`🌌 [COLLAPSE] Timeline ${winner.id} is now CANON. Resonance: ${maxRes.toFixed(2)}`);
            // Synchronize the canonical STATE_MATRIX buffer back to the winner's buffer
            // In this SoA architecture, we swap reference pointer if possible, or copy back
            new Uint8Array(STATE_MATRIX.buffer).set(new Uint8Array(winner.buffer));
            TIMELINE_FORK.primaryId = "ALPHA"; // Always reset ALPHA as canon
        }

        // Prune all but primary
        const primary = TIMELINE_FORK.timelines.get("ALPHA")!;
        TIMELINE_FORK.timelines.clear();
        TIMELINE_FORK.timelines.set("ALPHA", primary);
    }
};

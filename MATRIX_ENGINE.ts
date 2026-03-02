// OMEGA-64 | MATRIX_ENGINE.ts | Era 68: The Awakened Matrix
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const GRID_COLS = 140;
const GRID_ROWS = 80;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const MATRIX_ENGINE = {
    tick: () => {
        const structure = STATE_MATRIX.structureGrid;
        const signal = STATE_MATRIX.signalGrid;
        
        // Temporary buffer for deterministic propagation
        const nextSignal = new Int32Array(TOTAL_CELLS);

        for (let cy = 0; cy < GRID_ROWS; cy++) {
            for (let cx = 0; cx < GRID_COLS; cx++) {
                const i = cy * GRID_COLS + cx;
                const type = Atomics.load(structure, i);
                if (type === 0) continue; 

                let currentRes = Atomics.load(signal, i);
                
                // 1. Neighbor Conduction
                const neighbors = [
                    (cy > 0) ? (cy - 1) * GRID_COLS + cx : -1,
                    (cy < GRID_ROWS - 1) ? (cy + 1) * GRID_COLS + cx : -1,
                    (cx > 0) ? cy * GRID_COLS + (cx - 1) : -1,
                    (cx < GRID_COLS - 1) ? cy * GRID_COLS + (cx + 1) : -1
                ];

                for (const ni of neighbors) {
                    if (ni === -1) continue;
                    const neighborType = Atomics.load(structure, ni);
                    if (neighborType > 0) {
                        const neighborRes = Atomics.load(signal, ni);
                        if (neighborRes > currentRes) {
                            const flux = Math.floor((neighborRes - currentRes) * 0.4);
                            currentRes += flux;
                        }
                    }
                }

                if (type > 5) {
                    if (currentRes < 200) currentRes = 0; 
                }

                currentRes = Math.max(0, currentRes - 5);
                nextSignal[i] = currentRes;
            }
        }

        for (let i = 0; i < TOTAL_CELLS; i++) {
            Atomics.store(signal, i, nextSignal[i]);
        }
    },

    inject: (x: number, y: number, amount: number) => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            const i = cy * GRID_COLS + cx;
            Atomics.add(STATE_MATRIX.signalGrid, i, amount);
        }
    },

    read: (x: number, y: number): number => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            const i = cy * GRID_COLS + cx;
            return Atomics.load(STATE_MATRIX.signalGrid, i);
        }
        return 0;
    },

    setStructure: (x: number, y: number, type: number) => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            const i = cy * GRID_COLS + cx;
            Atomics.store(STATE_MATRIX.structureGrid, i, type);
        }
    }
};

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const CELL_SIZE = 10; // Finer resolution for bonding
const GRID_COLS = 140; // 1400 / 10
const GRID_ROWS = 80;  // 800 / 10
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const CELL_CAPACITY = 31; // Max atoms per hash cell. [count, idx1, idx2... idx31] = 32 ints per cell
const gridView = (STATE_MATRIX as any).spatialGrid as Int32Array; // Linked to WASM Memory

// ERA 55: Role-census per cell (8 role slots per cell, role=0..7)
const quorumBuffer = new SharedArrayBuffer(TOTAL_CELLS * 8 * 4);
const quorumView = new Int32Array(quorumBuffer);

export const SPATIAL_HASH = {
    buffer: STATE_MATRIX.buffer,
    quorumBuffer, // ERA 55: role census per cell
    CELL_CAPACITY,

    build: (activeIndices: number[]) => {
        // Clear all cell counts atomics-safely
        for (let i = 0; i < TOTAL_CELLS; i++) {
            Atomics.store(gridView, i * (CELL_CAPACITY + 1), 0);
        }

        for (const idx of activeIndices) {
            const x = Math.max(0, Math.min(1399, STATE_MATRIX.getX(idx)));
            const y = Math.max(0, Math.min(799, STATE_MATRIX.getY(idx)));
            
            const cellX = Math.floor(x / CELL_SIZE);
            const cellY = Math.floor(y / CELL_SIZE);
            const cellIdx = cellY * GRID_COLS + cellX;
            
            const offset = cellIdx * (CELL_CAPACITY + 1);
            
            // Atomic update of count
            const count = Atomics.load(gridView, offset);
            if (count < CELL_CAPACITY - 1) { // Leave last slot for phase sum
                const newCount = count + 1;
                Atomics.store(gridView, offset + newCount, idx);
                Atomics.store(gridView, offset, newCount);
                
                // --- ERA 50: Local Phase Tracking ---
                const myPhase = Atomics.load((STATE_MATRIX as any).phases, idx);
                Atomics.add(gridView, offset + (CELL_CAPACITY), Number(myPhase));

                // --- ERA 55: Role census per cell ---
                const myRole = (STATE_MATRIX as any).roles[idx]; // Access roles directly
                const safeRole = Math.min(7, Math.max(0, myRole));
                Atomics.add(quorumView, cellIdx * 8 + safeRole, 1);
            }
        }

        // Finalize phase averages + reset quorum counts for next sweep
        for (let i = 0; i < TOTAL_CELLS; i++) {
            const offset = i * (CELL_CAPACITY + 1);
            const count = Atomics.load(gridView, offset);
            if (count > 0) {
                const sum = Atomics.load(gridView, offset + (CELL_CAPACITY));
                Atomics.store(gridView, offset + (CELL_CAPACITY), 0);
                Atomics.store(gridView, offset + 31, Math.floor(sum / count));
            }
            // Reset quorum tallies for next tick
            for (let r = 0; r < 8; r++) Atomics.store(quorumView, i * 8 + r, 0);
        }
    },

    queryRadius: (x: number, y: number, radius: number): number[] => {
        const results: number[] = [];
        const minX = Math.max(0, Math.floor((x - radius) / CELL_SIZE));
        const maxX = Math.min(GRID_COLS - 1, Math.floor((x + radius) / CELL_SIZE));
        const minY = Math.max(0, Math.floor((y - radius) / CELL_SIZE));
        const maxY = Math.min(GRID_ROWS - 1, Math.floor((y + radius) / CELL_SIZE));

        for (let cy = minY; cy <= maxY; cy++) {
            for (let cx = minX; cx <= maxX; cx++) {
                const cellIdx = cy * GRID_COLS + cx;
                const offset = cellIdx * (CELL_CAPACITY + 1);
                const count = Atomics.load(gridView, offset);
                
                for (let c = 1; c <= count; c++) {
                    const neighborIdx = Atomics.load(gridView, offset + c);
                    const nx = STATE_MATRIX.getX(neighborIdx);
                    const ny = STATE_MATRIX.getY(neighborIdx);
                    const dx = nx - x;
                    const dy = ny - y;
                    if (dx * dx + dy * dy <= radius * radius) {
                        results.push(neighborIdx);
                    }
                }
            }
        }
        return results;
    },

    getGridIdx: (x: number, y: number) => {
        const cellX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / CELL_SIZE)));
        const cellY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / CELL_SIZE)));
        return cellY * GRID_COLS + cellX;
    },

    hash: (x: number, y: number) => {
        const hx = Math.max(0, Math.min(139, Math.floor(x / 10)));
        const hy = Math.max(0, Math.min(79, Math.floor(y / 10)));
        return hy * 140 + hx;
    }
};

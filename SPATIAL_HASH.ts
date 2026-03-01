// OMEGA-64 | SPATIAL_HASH.ts | O(1) Proximity Index
// Spatial indexing for optimized neighborhood queries.
// ERA 44: Upgraded to SharedArrayBuffer for Web Worker lock-free reading

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const CELL_SIZE = 10; // Finer resolution for bonding
const GRID_COLS = 140; // 1400 / 10
const GRID_ROWS = 80;  // 800 / 10
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const CELL_CAPACITY = 31; // Max atoms per hash cell. [count, idx1, idx2... idx31] = 32 ints per cell
const BUFFER_SIZE = TOTAL_CELLS * (CELL_CAPACITY + 1) * 4;

const buffer = new SharedArrayBuffer(BUFFER_SIZE);
const gridView = new Int32Array(buffer);

export const SPATIAL_HASH = {
    buffer, // Export buffer for web worker inclusion
    CELL_CAPACITY,

    build: (activeIndices: number[]) => {
        // Clear all cell counts
        for (let i = 0; i < TOTAL_CELLS; i++) {
            gridView[i * (CELL_CAPACITY + 1)] = 0;
        }

        for (const idx of activeIndices) {
            const x = Math.max(0, Math.min(1399, STATE_MATRIX.getX(idx)));
            const y = Math.max(0, Math.min(799, STATE_MATRIX.getY(idx)));
            
            const cellX = Math.floor(x / CELL_SIZE);
            const cellY = Math.floor(y / CELL_SIZE);
            const cellIdx = cellY * GRID_COLS + cellX;
            
            const offset = cellIdx * (CELL_CAPACITY + 1);
            let count = gridView[offset];
            
            if (count < CELL_CAPACITY) {
                count++;
                gridView[offset] = count;
                gridView[offset + count] = idx;
            }
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
                const count = gridView[offset];
                
                for (let c = 1; c <= count; c++) {
                    const neighborIdx = gridView[offset + c];
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

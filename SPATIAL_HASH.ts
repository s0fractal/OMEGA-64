// OMEGA-64 | SPATIAL_HASH.ts | O(1) Proximity Index
// Spatial indexing for optimized neighborhood queries.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const CELL_SIZE = 100;
const GRID_COLS = 15; // 1500 / 100
const GRID_ROWS = 9;  // 900 / 100

// Grid: Map<CellKey, number[]>
const grid: Map<number, number[]> = new Map();

export const SPATIAL_HASH = {
    build: (activeIndices: number[]) => {
        grid.clear();
        for (const idx of activeIndices) {
            const x = STATE_MATRIX.getX(idx);
            const y = STATE_MATRIX.getY(idx);
            const cellX = Math.floor(x / CELL_SIZE);
            const cellY = Math.floor(y / CELL_SIZE);
            const key = cellY * GRID_COLS + cellX;
            
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key)!.push(idx);
        }
    },

    queryRadius: (x: number, y: number, radius: number): number[] => {
        const results: number[] = [];
        const minX = Math.floor((x - radius) / CELL_SIZE);
        const maxX = Math.floor((x + radius) / CELL_SIZE);
        const minY = Math.floor((y - radius) / CELL_SIZE);
        const maxY = Math.floor((y + radius) / CELL_SIZE);

        for (let cy = minY; cy <= maxY; cy++) {
            for (let cx = minX; cx <= maxX; cx++) {
                const key = cy * GRID_COLS + cx;
                const cell = grid.get(key);
                if (cell) {
                    for (const neighborIdx of cell) {
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
        }
        return results;
    },

    getGridIdx: (x: number, y: number) => {
        const cellX = Math.floor(x / CELL_SIZE);
        const cellY = Math.floor(y / CELL_SIZE);
        return cellY * GRID_COLS + cellX;
    }
};

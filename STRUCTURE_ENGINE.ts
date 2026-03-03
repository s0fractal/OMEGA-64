import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";

const GRID_W = 140;
const GRID_H = 80;
const DIR4 = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;
const DIR8 = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
] as const;

export const STRUCTURE_ENGINE = {
    tick: () => {
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const i = y * GRID_W + x;
                const type = STATE_MATRIX.getGridType(i);
                const currentCharge = STATE_MATRIX.getGridCharge(i);

                // Vector 10 autopoiesis parity with WASM: charged VOID can recrystallize.
                if (type === STRUCTURE.VOID) {
                    let maxNeighborCharge = currentCharge;
                    for (const [dx, dy] of DIR8) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
                        const ni = ny * GRID_W + nx;
                        const nCharge = STATE_MATRIX.getGridCharge(ni);
                        if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
                    }

                    if (maxNeighborCharge > 100) {
                        const seedCharge = Math.max(64, Math.min(255, maxNeighborCharge - 20));
                        STATE_MATRIX.setGridType(i, STRUCTURE.WIRE);
                        STATE_MATRIX.setGridDensity(i, 0);
                        STATE_MATRIX.setGridCharge(i, seedCharge);
                        STATE_MATRIX.setGridState(i, 0);
                    } else if (currentCharge > 0) {
                        STATE_MATRIX.setGridCharge(i, Math.max(0, currentCharge - 8));
                    }
                    continue;
                }

                let nextCharge = Math.max(0, currentCharge - 10);

                if (type === STRUCTURE.SOURCE) {
                    nextCharge = 255;
                } else if (type === STRUCTURE.WIRE || type === STRUCTURE.NODE || type === STRUCTURE.CAPACITOR) {
                    let maxNeighborCharge = 0;
                    let chargedNeighborCount = 0;

                    for (const [dx, dy] of DIR4) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
                        const ni = ny * GRID_W + nx;
                        const nCharge = STATE_MATRIX.getGridCharge(ni);
                        if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
                        if (nCharge > 50) chargedNeighborCount++;
                    }

                    if (type === STRUCTURE.WIRE) {
                        nextCharge = Math.max(nextCharge, maxNeighborCharge - 5);
                    } else if (type === STRUCTURE.NODE) {
                        const state = STATE_MATRIX.getGridState(i);
                        if (state === 1) {
                            nextCharge = (chargedNeighborCount >= 2) ? 255 : nextCharge;
                        } else {
                            nextCharge = (chargedNeighborCount >= 1) ? 255 : nextCharge;
                        }
                    } else if (type === STRUCTURE.CAPACITOR) {
                        nextCharge = Math.max(nextCharge, maxNeighborCharge - 2);
                    }
                } else if (type === STRUCTURE.DIODE) {
                    const direction = STATE_MATRIX.getGridState(i);
                    let ni = -1;
                    if (direction === 0 && x > 0) ni = y * GRID_W + (x - 1);
                    if (direction === 1 && x < GRID_W - 1) ni = y * GRID_W + (x + 1);
                    if (direction === 2 && y > 0) ni = (y - 1) * GRID_W + x;
                    if (direction === 3 && y < GRID_H - 1) ni = (y + 1) * GRID_W + x;

                    if (ni !== -1) {
                        const inputCharge = STATE_MATRIX.getGridCharge(ni);
                        nextCharge = Math.max(nextCharge, inputCharge - 5);
                    }
                }

                if (type !== STRUCTURE.SOURCE && nextCharge === 0) {
                    let stabilized = false;
                    for (const [dx, dy] of DIR4) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
                        const ni = ny * GRID_W + nx;
                        if (STATE_MATRIX.getGridCharge(ni) > 20) {
                            stabilized = true;
                            break;
                        }
                    }

                    if (!stabilized) {
                        STATE_MATRIX.setGridType(i, STRUCTURE.VOID);
                        STATE_MATRIX.setGridDensity(i, 0);
                        STATE_MATRIX.setGridCharge(i, 0);
                        STATE_MATRIX.setGridState(i, 0);
                        continue;
                    }
                }

                STATE_MATRIX.setGridCharge(i, nextCharge);
            }
        }
    }
};

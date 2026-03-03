import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";

const GRID_W = 140;
const GRID_H = 80;

export const STRUCTURE_ENGINE = {
    tick: () => {
        // We use a temporary charge buffer to avoid order-of-operation bias during single-pass
        // Or we use a simple diffusion rule that is stable
        
        const nextCharges = new Uint8Array(GRID_W * GRID_H);

        // 1. Calculate Next State
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const i = y * GRID_W + x;
                const type = STATE_MATRIX.getGridType(i);
                if (type === STRUCTURE.VOID) continue;

                const currentCharge = STATE_MATRIX.getGridCharge(i);
                let nextCharge = Math.max(0, currentCharge - 10); // Default decay

                if (type === STRUCTURE.SOURCE) {
                    nextCharge = 255;
                } else if (type === STRUCTURE.WIRE || type === STRUCTURE.NODE || type === STRUCTURE.CAPACITOR) {
                    // Check neighbors
                    const neighbors = [
                        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
                    ];
                    
                    let maxNeighborCharge = 0;
                    let chargedNeighborCount = 0;

                    for (const [nx, ny] of neighbors) {
                        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
                        const ni = ny * GRID_W + nx;
                        const nCharge = STATE_MATRIX.getGridCharge(ni);
                        if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
                        if (nCharge > 50) chargedNeighborCount++;
                    }

                    if (type === STRUCTURE.WIRE) {
                        nextCharge = Math.max(nextCharge, maxNeighborCharge - 5);
                    } else if (type === STRUCTURE.NODE) {
                        // Logic Node: OR by default for now, but can be configured via State
                        const state = STATE_MATRIX.getGridState(i);
                        if (state === 1) { // AND Gate
                            nextCharge = (chargedNeighborCount >= 2) ? 255 : nextCharge;
                        } else { // OR Gate
                            nextCharge = (chargedNeighborCount >= 1) ? 255 : nextCharge;
                        }
                    } else if (type === STRUCTURE.CAPACITOR) {
                        nextCharge = Math.max(nextCharge, maxNeighborCharge - 2); // Slower decay
                    }
                } else if (type === STRUCTURE.DIODE) {
                    const direction = STATE_MATRIX.getGridState(i); // 0: L, 1: R, 2: U, 3: D
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

                nextCharges[i] = nextCharge;
            }
        }

        // 2. Commit Charges
        for (let i = 0; i < GRID_W * GRID_H; i++) {
            STATE_MATRIX.setGridCharge(i, nextCharges[i]);
        }
    }
};

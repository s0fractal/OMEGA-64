import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";

const GRID_W = 140;
const GRID_H = 80;
const DIR4 = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;
const DIR8 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
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
            const seedCharge = Math.max(
              64,
              Math.min(255, maxNeighborCharge - 20),
            );
            STATE_MATRIX.setGridType(i, STRUCTURE.WIRE);
            STATE_MATRIX.setGridDensity(i, 0);
            STATE_MATRIX.setGridCharge(i, seedCharge);
            STATE_MATRIX.setGridState(i, 0);
          } else if (currentCharge > 0) {
            STATE_MATRIX.setGridCharge(i, Math.max(0, currentCharge - 8));
          }
          continue;
        }

        const state = STATE_MATRIX.getGridState(i);

        // AUTOPOIESIS: Resonance Shielding
        const spatialIdx = y * 140 + x;
        const avgPhase = STATE_MATRIX.spatialGrid[spatialIdx * 32 + 31];

        let decay = 10;
        if (avgPhase > 128) decay = 2; // Shielded

        let nextCharge = Math.max(0, currentCharge - decay);

        if (type === STRUCTURE.SOURCE) {
          nextCharge = 255;
        } else if (
          type === STRUCTURE.WIRE || type === STRUCTURE.NODE ||
          type === STRUCTURE.CAPACITOR
        ) {
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
            if (state === 1) { // AND
              nextCharge = (chargedNeighborCount >= 2) ? 255 : nextCharge;
            } else { // OR
              nextCharge = (chargedNeighborCount >= 1) ? 255 : nextCharge;
            }
          } else if (type === STRUCTURE.CAPACITOR) {
            nextCharge = Math.max(nextCharge, maxNeighborCharge - 2);
          }
        } else if (type === STRUCTURE.DIODE) {
          const direction = state;
          let ni = -1;
          if (direction === 0 && x > 0) ni = y * GRID_W + (x - 1);
          if (direction === 1 && x < GRID_W - 1) ni = y * GRID_W + (x + 1);
          if (direction === 2 && y > 0) ni = (y - 1) * GRID_W + x;
          if (direction === 3 && y < GRID_H - 1) ni = (y + 1) * GRID_W + x;

          if (ni !== -1) {
            const inputCharge = STATE_MATRIX.getGridCharge(ni);
            nextCharge = Math.max(nextCharge, inputCharge - 5);
          }
        } else if (type === STRUCTURE.INVERTER) {
          let maxInputCharge = 0;
          for (const [dx, dy] of DIR4) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
            const nCharge = STATE_MATRIX.getGridCharge(ny * GRID_W + nx);
            // Only count as input if it's stronger than our own reflection
            if (nCharge > maxInputCharge && nCharge >= currentCharge) {
              maxInputCharge = nCharge;
            }
          }
          nextCharge = (maxInputCharge < 50) ? 255 : 0;
        } else if (type === STRUCTURE.LATCH) {
          let newState = state;
          // Neighbor 0 (Left): SET
          const setX = x + DIR4[0][0];
          const setY = y + DIR4[0][1];
          if (setX >= 0 && setX < GRID_W && setY >= 0 && setY < GRID_H) {
            const pulse = STATE_MATRIX.getGridCharge(setY * GRID_W + setX);
            if (pulse > 100 && pulse >= currentCharge) newState = 1;
          }
          // Neighbor 1 (Right): RESET
          const rstX = x + DIR4[1][0];
          const rstY = y + DIR4[1][1];
          if (rstX >= 0 && rstX < GRID_W && rstY >= 0 && rstY < GRID_H) {
            const pulse = STATE_MATRIX.getGridCharge(rstY * GRID_W + rstX);
            if (pulse > 100 && pulse >= currentCharge) newState = 0;
          }
          if (newState !== state) {
            STATE_MATRIX.setGridState(i, newState);
          }
          nextCharge = (newState === 1) ? 255 : 0;
        }

        if (
          type !== STRUCTURE.SOURCE && type !== STRUCTURE.INVERTER &&
          type !== STRUCTURE.LATCH && nextCharge === 0
        ) {
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
  },
};

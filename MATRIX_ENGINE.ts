// OMEGA-64 | MATRIX_ENGINE.ts | Era 66: The Awakened Matrix
// A Crystalline Neural Network running as a Cellular Automaton over the static structureGrid.

const GRID_W = 140;
const GRID_H = 80;
const GRID_SIZE = GRID_W * GRID_H;

// We use an internal double-buffer to prevent directional propagation bias during a single tick.
const nextSignalGrid = new Uint8Array(GRID_SIZE);

export const MATRIX_ENGINE = {
    /**
     * Evaluates the Crystalline Neural Network for one tick.
     * @param signalGrid The current electrical state of the matrix (0 = idle, 255 = firing, 1-254 = refractory)
     * @param structureGrid The physical structures (Density | Type)
     */
    tick: (signalGrid: Uint8Array, structureGrid: Int32Array) => {
        // 1. Compute Next State based on Current State
        for (let i = 0; i < GRID_SIZE; i++) {
            const structureCell = Atomics.load(structureGrid, i);
            const type = (structureCell >> 0) & 0xFF;
            const density = (structureCell >> 8) & 0xFF;

            const currentState = signalGrid[i];

            // Only Crystals (Type 1) can conduct matrix signals
            if (type !== 1 || density < 50) {
                nextSignalGrid[i] = 0;
                continue;
            }

            if (currentState === 255) {
                // Was firing -> enter refractory period
                nextSignalGrid[i] = 200; // 200 ticks of refractory cooldown
            } else if (currentState > 0) {
                // In refractory period -> decay
                nextSignalGrid[i] = currentState - 1;
            } else {
                // Idle (0) -> Check for incoming signals from Von Neumann neighborhood
                const x = i % GRID_W;
                const y = Math.floor(i / GRID_W);
                
                let firingNeighbors = 0;

                // Check Up
                if (y > 0 && signalGrid[i - GRID_W] === 255) firingNeighbors++;
                // Check Down
                if (y < GRID_H - 1 && signalGrid[i + GRID_W] === 255) firingNeighbors++;
                // Check Left
                if (x > 0 && signalGrid[i - 1] === 255) firingNeighbors++;
                // Check Right
                if (x < GRID_W - 1 && signalGrid[i + 1] === 255) firingNeighbors++;

                // If no signals, stay idle
                if (firingNeighbors === 0) {
                    nextSignalGrid[i] = 0;
                    continue;
                }

                // Determine Gate Logic based on structural density signature modulo
                // Derived organically from how the Ascended Atom formed the crystal
                const gateType = density % 3;

                let willFire = false;
                if (gateType === 0) {
                    // OR Gate (default conduction)
                    willFire = firingNeighbors >= 1;
                } else if (gateType === 1) {
                    // AND Gate
                    willFire = firingNeighbors >= 2;
                } else if (gateType === 2) {
                    // XOR Gate
                    willFire = firingNeighbors === 1;
                }

                nextSignalGrid[i] = willFire ? 255 : 0;
            }
        }

        // 2. Commit Next State to Shared Array Buffer
        for (let i = 0; i < GRID_SIZE; i++) {
            signalGrid[i] = nextSignalGrid[i];
        }
    },

    /**
     * Manually triggers a spark at a specific location, used by Observer or Atoms.
     */
    injectSpark: (signalGrid: Uint8Array, x: number, y: number) => {
        if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
            signalGrid[y * GRID_W + x] = 255;
        }
    }
};

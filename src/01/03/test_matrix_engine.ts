import { GRID_W, GRID_H , GRID_CELLS} from "../../00/OFFSETS.ts";
// test_matrix_engine.ts
import { MATRIX_ENGINE } from "@01";


const signalGrid = new Uint8Array(GRID_CELLS);
const structureGrid = new Int32Array(GRID_CELLS);

// Helper to set structure
function setStructure(x: number, y: number, type: number, density: number) {
  structureGrid[y * GRID_W + x] = (density << 8) | type;
}

// Helper to get signal
function getSignal(x: number, y: number) {
  return signalGrid[y * GRID_W + x];
}

console.log("💎 Testing MATRIX_ENGINE...");

// Test 1: Conduction along a wire (OR gate logic: 51 % 3 == 0)
// Crystal row from (10,10) to (13,10)
setStructure(10, 10, 1, 51);
setStructure(11, 10, 1, 51);
setStructure(12, 10, 1, 51);

// Spark at (10, 10)
MATRIX_ENGINE.injectSpark(signalGrid, 10, 10);
console.assert(getSignal(10, 10) === 255, "Spark failed");

// Tick 1
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(10, 10) === 200, "Refractory failed");
console.assert(getSignal(11, 10) === 255, "Conduction to +1x failed");

// Tick 2
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(10, 10) === 199, "Refractory decay failed");
console.assert(getSignal(11, 10) === 200, "Refractory 2 failed");
console.assert(getSignal(12, 10) === 255, "Conduction to +2x failed");

console.log("✅ Conduction test passed.");

// Test 2: AND Gate (Density 52 % 3 == 1)
// Center at (20, 20), AND gate.
setStructure(20, 20, 1, 52);
// Inputs at (19, 20) and (20, 19). Both OR wires (51).
setStructure(19, 20, 1, 51);
setStructure(20, 19, 1, 51);

MATRIX_ENGINE.injectSpark(signalGrid, 19, 20); // Only 1 input fires
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(
  getSignal(20, 20) === 0,
  "AND gate fired incorrectly with 1 input",
);

// Refractory period resets... Let's just manually clear signalGrid around there
signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 19, 20);
MATRIX_ENGINE.injectSpark(signalGrid, 20, 19); // Both inputs fire
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(
  getSignal(20, 20) === 255,
  "AND gate failed to fire with 2 inputs",
);

console.log("✅ AND Gate test passed.");

// Test 3: XOR Gate (Density 53 % 3 == 2)
setStructure(30, 30, 1, 53);
setStructure(29, 30, 1, 51);
setStructure(30, 29, 1, 51);

signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 29, 30); // 1 input
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(
  getSignal(30, 30) === 255,
  "XOR gate failed to fire with 1 input",
);

signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 29, 30); // 2 inputs
MATRIX_ENGINE.injectSpark(signalGrid, 30, 29);
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(
  getSignal(30, 30) === 0,
  "XOR gate fired incorrectly with 2 inputs",
);

console.log("✅ XOR Gate test passed.");

console.log("🎉 MATRIX_ENGINE tests complete!");

import { GRID_W, GRID_H } from "../../00/OFFSETS.ts";
import { STATE_MATRIX, STRUCTURE } from "@00";
import { STRUCTURE_ENGINE } from "@01";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";


function clearGrid() {
  for (let i = 0; i < GRID_W * GRID_H; i++) {
    STATE_MATRIX.setGridType(i, STRUCTURE.VOID);
    STATE_MATRIX.setGridCharge(i, 0);
    STATE_MATRIX.setGridState(i, 0);
    STATE_MATRIX.spatialGrid[i * 32 + 31] = 0;
  }
}

function clearArea(cx: number, cy: number, radius: number) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      const i = y * GRID_W + x;
      STATE_MATRIX.setGridType(i, STRUCTURE.VOID);
      STATE_MATRIX.setGridCharge(i, 0);
      STATE_MATRIX.setGridState(i, 0);
    }
  }
}

Deno.test("Structure: Inverter Logic (Pure)", () => {
  clearGrid();
  const pos = (x: number, y: number) => y * GRID_W + x;
  const invIdx = pos(50, 50);
  const inIdx = pos(49, 50);

  STATE_MATRIX.setGridType(invIdx, STRUCTURE.INVERTER);

  // 1. Initial
  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridCharge(invIdx), 255, "No input");

  // 2. Pulse
  STATE_MATRIX.setGridType(inIdx, STRUCTURE.SOURCE);
  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridCharge(invIdx), 0, "With input");

  // 3. Remove & Clear Bloom
  clearArea(50, 50, 3); // Wipe everything EXCEPT the inverter
  STATE_MATRIX.setGridType(invIdx, STRUCTURE.INVERTER); // Restore type

  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridCharge(invIdx), 255, "Restored");
});

Deno.test("Structure: Latch Logic (Pure)", () => {
  clearGrid();
  const pos = (x: number, y: number) => y * GRID_W + x;
  const lIdx = pos(30, 30);

  STATE_MATRIX.setGridType(lIdx, STRUCTURE.LATCH);

  // SET
  STATE_MATRIX.setGridType(pos(29, 30), STRUCTURE.SOURCE);
  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridState(lIdx), 1, "SET");

  // Persistence
  clearArea(30, 30, 2);
  STATE_MATRIX.setGridType(lIdx, STRUCTURE.LATCH);
  STATE_MATRIX.setGridState(lIdx, 1);
  STATE_MATRIX.setGridCharge(lIdx, 255);

  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridState(lIdx), 1, "Persist");

  // RESET
  clearArea(30, 30, 2);
  STATE_MATRIX.setGridType(lIdx, STRUCTURE.LATCH);
  STATE_MATRIX.setGridState(lIdx, 1);
  STATE_MATRIX.setGridCharge(lIdx, 255);
  STATE_MATRIX.setGridType(pos(31, 30), STRUCTURE.SOURCE);

  STRUCTURE_ENGINE.tick();
  STRUCTURE_ENGINE.tick(); // Second tick for propagation
  assertEquals(STATE_MATRIX.getGridState(lIdx), 0, "RESET");
});

Deno.test("Structure: Resonance Shielding", () => {
  clearGrid();
  const i1 = 1000;
  const i2 = 2000;
  STATE_MATRIX.setGridType(i1, STRUCTURE.WIRE);
  STATE_MATRIX.setGridCharge(i1, 255);
  STATE_MATRIX.setGridType(i2, STRUCTURE.WIRE);
  STATE_MATRIX.setGridCharge(i2, 255);
  STATE_MATRIX.spatialGrid[i1 * 32 + 31] = 200;
  STRUCTURE_ENGINE.tick();
  assertEquals(STATE_MATRIX.getGridCharge(i1), 253);
  assertEquals(STATE_MATRIX.getGridCharge(i2), 245);
});

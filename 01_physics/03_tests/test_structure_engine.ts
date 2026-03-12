import { STATE_MATRIX, STRUCTURE } from "../../00_substrate/mod.ts";
import { STRUCTURE_ENGINE } from "../STRUCTURE_ENGINE.ts";

const gridIndex = (x: number, y: number): number => y * 140 + x;

function resetStructureGrid() {
  for (let y = 0; y < 80; y++) {
    for (let x = 0; x < 140; x++) {
      const i = gridIndex(x, y);
      STATE_MATRIX.setGridType(i, STRUCTURE.VOID);
      STATE_MATRIX.setGridDensity(i, 0);
      STATE_MATRIX.setGridCharge(i, 0);
      STATE_MATRIX.setGridState(i, 0);
    }
  }
}

function runTest() {
  console.log("🧪 [TEST] STRUCTURE_ENGINE reference verification");

  resetStructureGrid();

  // 1) SOURCE at (5,5), WIRE chain to (10,5)
  const source = gridIndex(5, 5);
  STATE_MATRIX.setGridType(source, STRUCTURE.SOURCE);
  STATE_MATRIX.setGridCharge(source, 255);

  for (let x = 6; x <= 10; x++) {
    const i = gridIndex(x, 5);
    STATE_MATRIX.setGridType(i, STRUCTURE.WIRE);
    STATE_MATRIX.setGridCharge(i, 0);
  }

  for (let t = 0; t < 6; t++) {
    STRUCTURE_ENGINE.tick();
  }

  const tail = gridIndex(10, 5);
  const tailCharge = STATE_MATRIX.getGridCharge(tail);
  console.log(`   tail charge=${tailCharge}`);

  if (tailCharge <= 0) {
    throw new Error(
      `[TEST] Expected positive propagated charge at tail, got ${tailCharge}`,
    );
  }

  // 2) Autopoiesis: charged VOID neighborhood should recrystallize into WIRE.
  resetStructureGrid();
  const target = gridIndex(20, 20);
  const feeder = gridIndex(21, 20);
  STATE_MATRIX.setGridType(target, STRUCTURE.VOID);
  STATE_MATRIX.setGridCharge(target, 0);
  STATE_MATRIX.setGridType(feeder, STRUCTURE.WIRE);
  STATE_MATRIX.setGridCharge(feeder, 220);
  STRUCTURE_ENGINE.tick();

  const regrownType = STATE_MATRIX.getGridType(target);
  const regrownCharge = STATE_MATRIX.getGridCharge(target);
  console.log(`   autopoiesis type=${regrownType} charge=${regrownCharge}`);
  if (regrownType !== STRUCTURE.WIRE) {
    throw new Error(
      `[TEST] Expected autopoietic regrowth into WIRE, got type=${regrownType}`,
    );
  }
  if (regrownCharge < 64) {
    throw new Error(
      `[TEST] Expected seeded autopoietic charge >= 64, got ${regrownCharge}`,
    );
  }

  // 3) Entropic decay: isolated dead structure should collapse into VOID.
  resetStructureGrid();
  const isolated = gridIndex(30, 30);
  STATE_MATRIX.setGridType(isolated, STRUCTURE.WIRE);
  STATE_MATRIX.setGridCharge(isolated, 5);
  STRUCTURE_ENGINE.tick();

  const collapsedType = STATE_MATRIX.getGridType(isolated);
  const collapsedCharge = STATE_MATRIX.getGridCharge(isolated);
  console.log(`   entropic type=${collapsedType} charge=${collapsedCharge}`);
  if (collapsedType !== STRUCTURE.VOID || collapsedCharge !== 0) {
    throw new Error(
      `[TEST] Expected isolated structure to decay into VOID/0, got type=${collapsedType}, charge=${collapsedCharge}`,
    );
  }

  console.log(
    "✅ [TEST] STRUCTURE_ENGINE propagation/autopoiesis/entropy verified.",
  );
}

if (import.meta.main) {
  try {
    runTest();
    Deno.exit(0);
  } catch (err) {
    console.error("❌ [TEST]", err);
    Deno.exit(1);
  }
}

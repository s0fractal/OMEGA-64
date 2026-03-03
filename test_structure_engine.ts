import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";
import { STRUCTURE_ENGINE } from "./STRUCTURE_ENGINE.ts";

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

    // SOURCE at (5,5), WIRE chain to (10,5)
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
        throw new Error(`[TEST] Expected positive propagated charge at tail, got ${tailCharge}`);
    }

    console.log("✅ [TEST] STRUCTURE_ENGINE propagation verified.");
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

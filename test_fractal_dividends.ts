import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PREDICTION_MARKET, betPoolInt } from "./PREDICTION_MARKET.ts";

console.log("💹 [TEST] Verifying Era 37: Fractal Dividends...");

// 1. Setup atoms
const winnerIdx = 1;
const loserIdx = 2;
// @ts-ignore
STATE_MATRIX.setId(winnerIdx, 101n);
// @ts-ignore
STATE_MATRIX.setId(loserIdx, 102n);

const winningLogic = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x00, 0x00, 0x00]);
const losingLogic = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

STATE_MATRIX.setLogic(winnerIdx, winningLogic);
STATE_MATRIX.setLogic(loserIdx, losingLogic);

STATE_MATRIX.setEnergy(winnerIdx, 100);
STATE_MATRIX.setEnergy(loserIdx, 100);

// 2. Setup Market Success
const winningHex = Array.from(winningLogic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
PREDICTION_MARKET.successfulGenomes.set(winningHex, 5); // 5 historical wins

// 3. Populate Pool
const SCALE = 1000;
const poolEnergy = 1000;
Atomics.store(betPoolInt, 0, poolEnergy * SCALE);

console.log(`   [TEST] Pool: ${poolEnergy}, Winner Energy: 100, Loser Energy: 100`);

// 4. Distribute Dividends
PREDICTION_MARKET.distributeDividends();

// 5. Verify
const newWinnerEnergy = STATE_MATRIX.getEnergy(winnerIdx);
const newLoserEnergy = STATE_MATRIX.getEnergy(loserIdx);
const newPool = Atomics.load(betPoolInt, 0) / SCALE;

console.log(`   [TEST] NEW Pool: ${newPool}, NEW Winner Energy: ${newWinnerEnergy.toFixed(2)}, NEW Loser Energy: ${newLoserEnergy.toFixed(2)}`);

const dividend = poolEnergy * 0.1;
if (newWinnerEnergy > 100 && newLoserEnergy === 100 && newPool === (poolEnergy - dividend)) {
    console.log("✅ [TEST] SUCCESS: Fractal Dividends distributed correctly.");
} else {
    console.log("❌ [TEST] FAILURE: Dividend distribution imbalance.");
    Deno.exit(1);
}

Deno.exit(0);

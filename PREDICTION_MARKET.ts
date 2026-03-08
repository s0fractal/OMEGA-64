// OMEGA-64 | PREDICTION_MARKET.ts | Era 18: Deterministic Monad
// Replaces Parallel Realities. Crisis triggers mutations that atoms bet on.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { AKASHA_CODEX } from "./AKASHA_CODEX.ts";

// 16-byte Shared Buffer:
// [0-3]: Int32 isActive (0 or 1)
// [4-7]: Int32 betPool (Scaled by SCALE=1000)
// [8-15]: Uint8Array proposedLogic (8 bytes)
export const marketBuffer = new SharedArrayBuffer(16);
export const marketState = new Int32Array(marketBuffer, 0, 1);
export const betPoolInt = new Int32Array(marketBuffer, 4, 1);
export const proposedLogic = new Uint8Array(marketBuffer, 8, 8);

const CRISIS_THRESHOLD = 5000.0; // The energy threshold required to pass a mutation
const SCALE = 1000;

export const PREDICTION_MARKET = {
  buffer: marketBuffer,
  successfulGenomes: new Map<string, number>(), // ERA 37: Track successful mutation signatures

  startCrisis: (newLogic: Uint8Array) => {
    if (Atomics.load(marketState, 0) === 1) {
      console.log("⚠️ [MARKET] A crisis is already ongoing.");
      return;
    }

    console.log(
      `🌀 [MARKET] CRISIS INITIATED! Proposed Genome: ${
        Array.from(newLogic).map((b) => b.toString(16).padStart(2, "0")).join(
          "",
        )
      }`,
    );

    // Reset pool
    Atomics.store(marketState, 0, 1);
    Atomics.store(betPoolInt, 0, 0);

    // Store proposed logic
    for (let i = 0; i < 8; i++) {
      proposedLogic[i] = newLogic[i];
    }
  },

  resolveCrisis: () => {
    if (Atomics.load(marketState, 0) === 0) return;

    Atomics.store(marketState, 0, 0);
    const finalBet = Atomics.load(betPoolInt, 0) / SCALE;
    const proposalHex = Array.from(proposedLogic).map((b) =>
      b.toString(16).padStart(2, "0")
    ).join("").toUpperCase();
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);

    if (finalBet >= CRISIS_THRESHOLD) {
      const winnersHex = proposalHex;
      console.log(
        `🌌 [MARKET] MUTATION ADOPTED! Total Energy Bet: ${
          finalBet.toFixed(2)
        }. Signature [${winnersHex}] is now Blessed.`,
      );

      // ERA 37: Record success
      const currentWins = PREDICTION_MARKET.successfulGenomes.get(winnersHex) ||
        0;
      PREDICTION_MARKET.successfulGenomes.set(winnersHex, currentWins + 1);

      // Apply the mutation to all active atoms in the single STATE_MATRIX
      const active = STATE_MATRIX.getActiveIndices();
      for (const idx of active) {
        STATE_MATRIX.setLogic(idx, proposedLogic);

        // Minor energy penalty for adopting the mutation (adaptability toll)
        const currentEnergy = STATE_MATRIX.getEnergy(idx);
        STATE_MATRIX.setEnergy(idx, Math.max(0, currentEnergy - 10));
      }
      AKASHA_CODEX.recordMarketResolution(tick, true, finalBet, winnersHex);
    } else {
      console.log(
        `🛑 [MARKET] CRISIS AVERTED. Insufficient Energy Bet: ${
          finalBet.toFixed(2)
        } / ${CRISIS_THRESHOLD}. Status Quo maintained.`,
      );
      AKASHA_CODEX.recordMarketResolution(
        tick,
        false,
        finalBet,
        proposalHex,
      );
    }
  },

  /**
   * ERA 37: Fractal Dividends
   * Periodically distributes portions of the market pool to successful genetic lineages.
   */
  distributeDividends: () => {
    const currentPool = Atomics.load(betPoolInt, 0) / SCALE;
    if (currentPool < 100) return; // Only distribute if there's enough capital

    const dividend = currentPool * 0.1; // 10% dividend
    if (
      Atomics.compareExchange(
        betPoolInt,
        0,
        Math.round(currentPool * SCALE),
        Math.round((currentPool - dividend) * SCALE),
      ) !== Math.round(currentPool * SCALE)
    ) {
      return; // Concurrency guard
    }

    const active = STATE_MATRIX.getActiveIndices();
    const winners = active.filter((idx) => {
      const logic = STATE_MATRIX.getLogic(idx);
      const hex = Array.from(logic).map((b) => b.toString(16).padStart(2, "0"))
        .join("").toUpperCase();
      return PREDICTION_MARKET.successfulGenomes.has(hex);
    });

    if (winners.length === 0) return;

    // Weight distribution by the number of historical wins
    let totalWinWeight = 0;
    const weights = winners.map((idx) => {
      const hex = Array.from(STATE_MATRIX.getLogic(idx)).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      const w = PREDICTION_MARKET.successfulGenomes.get(hex) || 1;
      totalWinWeight += w;
      return w;
    });

    console.log(
      `💹 [MARKET] Distributing ${
        dividend.toFixed(1)
      } energy dividends to ${winners.length} successful atoms...`,
    );

    for (let i = 0; i < winners.length; i++) {
      const idx = winners[i];
      const share = (weights[i] / totalWinWeight) * dividend;
      const currentEnergy = STATE_MATRIX.getEnergy(idx);
      STATE_MATRIX.setEnergy(idx, currentEnergy + share);
    }
  },
};

// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/prediction_market.md
import { MX, PredictionMarketAkashaDelegate } from "@g04";

let delegate: PredictionMarketAkashaDelegate | null = null;

// 72-byte Shared Buffer:
// [0-3]: Int32 isActive (0 or 1)
// [4-7]: Int32 betPool (Scaled by SCALE=1000)
// [8-71]: Uint8Array proposedInstructions (64 bytes)
export const marketBuffer = new SharedArrayBuffer(72);
export const marketState = new Int32Array(marketBuffer, 0, 1);
export const betPoolInt = new Int32Array(marketBuffer, 4, 1);
export const proposedInstructions = new Uint8Array(marketBuffer, 8, 64);

const CRISIS_THRESHOLD = 5000.0; // The energy threshold required to pass a mutation
const SCALE = 1000;

export const PREDICTION_MARKET = {
  setDelegate: (newDelegate: PredictionMarketAkashaDelegate) => {
    delegate = newDelegate;
  },
  buffer: marketBuffer,
  successfulGenomes: new Map<string, number>(), // ERA 37: Track successful mutation signatures

  startCrisis: (newInstructions: Uint8Array) => {
    if (Atomics.load(marketState, 0) === 1) {
      console.log("⚠️ [MARKET] A crisis is already ongoing.");
      return;
    }

    console.log(
      `🌀 [MARKET] CRISIS INITIATED! Proposed Genome: ${
        Array.from(newInstructions).map((b) => b.toString(16).padStart(2, "0"))
          .join(
            "",
          )
      }`,
    );

    // Reset pool
    Atomics.store(marketState, 0, 1);
    Atomics.store(betPoolInt, 0, 0);

    // Store proposed instructions
    for (let i = 0; i < 64; i++) {
      proposedInstructions[i] = newInstructions[i] || 0;
    }
  },

  resolveCrisis: () => {
    if (Atomics.load(marketState, 0) === 0) return;

    Atomics.store(marketState, 0, 0);
    const finalBet = Atomics.load(betPoolInt, 0) / SCALE;
    const proposalHex = Array.from(proposedInstructions).map((b) =>
      b.toString(16).padStart(2, "0")
    ).join("").toUpperCase();
    const tick = Atomics.load(MX.tickCounter, 0);

    if (finalBet >= CRISIS_THRESHOLD) {
      const winnersHex = proposalHex;
      console.log(
        `🌌 [MARKET] MUTATION ADOPTED! Total Energy Bet: ${
          finalBet.toFixed(2)
        }. Signature [${winnersHex.substring(0, 16)}...] is now Blessed.`,
      );

      // ERA 37: Record success
      const currentWins = PREDICTION_MARKET.successfulGenomes.get(winnersHex) ||
        0;
      PREDICTION_MARKET.successfulGenomes.set(winnersHex, currentWins + 1);

      // Apply the mutation to all active atoms in the single MX
      const active = MX.getActiveIndices();
      for (const idx of active) {
        MX.setInstructions(idx, proposedInstructions);

        // Minor energy penalty for adopting the mutation (adaptability toll)
        const currentEnergy = MX.getEnergy(idx);
        MX.setEnergy(idx, Math.max(0, currentEnergy - 10));
      }
      delegate?.recordMarketResolution(tick, true, finalBet, winnersHex);
    } else {
      console.log(
        `🛑 [MARKET] CRISIS AVERTED. Insufficient Energy Bet: ${
          finalBet.toFixed(2)
        } / ${CRISIS_THRESHOLD}. Status Quo maintained.`,
      );
      delegate?.recordMarketResolution(
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

    const active = MX.getActiveIndices();
    const winners = active.filter((idx) => {
      const instr = MX.getInstructions(idx);
      const hex = Array.from(instr).map((b) => b.toString(16).padStart(2, "0"))
        .join("").toUpperCase();
      return PREDICTION_MARKET.successfulGenomes.has(hex);
    });

    if (winners.length === 0) return;

    // Weight distribution by the number of historical wins
    let totalWinWeight = 0;
    const weights = winners.map((idx) => {
      const hex = Array.from(MX.getInstructions(idx)).map((b) =>
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
      const currentEnergy = MX.getEnergy(idx);
      MX.setEnergy(idx, currentEnergy + share);
    }
  },
};

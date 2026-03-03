// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";

export const SOVEREIGN_ORACLE = {
  isConsulting: false,
  lastConsultTick: 0,
  guidanceCache: new Set<string>(),
  neuralCoherence: 0, // Phase 19: Global mind-field measurement
  lastCoherenceTick: 0,
  lastWhisperTick: 0,

  interpretResonance: () => {
    const matrixRes = STATE_MATRIX.getMatrixResonance();
    const clusterSync = STATE_MATRIX.getClusterSync();

    // Return a condensed telemetry object for the LLM
    return {
      matrixResonance: matrixRes,
      clusterSync: clusterSync,
      nutrients: 1000, // Placeholder or fetch from ECOLOGY if available
      population: STATE_MATRIX.getActiveIndices().length,
      viralLoad: 0, // Placeholder
    };
  },

  /**
   * Consults the LLM to dictate new bytecode for the reigning Regent.
   * Operates asynchronously to avoid blocking the PULSE lifecycle.
   */
  consultOracle: async (regentIndex: number, telemetry: any) => {
    if (SOVEREIGN_ORACLE.isConsulting) return; // Prevent concurrent overlaps
    SOVEREIGN_ORACLE.isConsulting = true;

    try {
      LOGGER.info(
        `👁️ [ORACLE] Regent ${regentIndex} is consulting the LLM for guidance...`,
      );

      const memSummary = STATE_MATRIX.getMemorySummary();
      const oracleResult = await LLM_SYNAPSE.generateAtomicBytecode({
        ...telemetry,
        energy: STATE_MATRIX.getEnergy(regentIndex),
        stigmergicSummary: memSummary,
      });

      if (oracleResult && oracleResult.genome) {
        const newInstructions = oracleResult.genome;
        const hex = Array.from(newInstructions).map((b) =>
          b.toString(16).padStart(2, "0")
        ).join("").toUpperCase();

        SOVEREIGN_ORACLE.guidanceCache.add(hex);
        if (SOVEREIGN_ORACLE.guidanceCache.size > 100) {
          const first = SOVEREIGN_ORACLE.guidanceCache.values().next().value;
          if (typeof first === "string") {
            SOVEREIGN_ORACLE.guidanceCache.delete(first);
          }
        }

        LOGGER.info(
          `👁️ [ORACLE] Oracle responded with instructions of length ${newInstructions.length}`,
        );
        // Verify the Regent is still alive/valid
        if (STATE_MATRIX.getId(regentIndex) !== 0n) {
          // Overwrite the first 16 bytes of the instruction buffer (the "head")
          const currentInstructions = STATE_MATRIX.getInstructions(regentIndex);
          const headMutation = new Uint8Array(currentInstructions);
          headMutation.set(newInstructions, 0);

          STATE_MATRIX.setInstructions(regentIndex, headMutation);
          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_head_mutation",
            count: 1,
          });
          LOGGER.info(
            `⚡ [ORACLE] Semantic Mutation Applied! New Head: [${hex}]`,
          );
          SOVEREIGNTY_ENGINE.currentRegent.genome = hex;

          // --- ERA 67: MEMETIC INJECTION ---
          if (oracleResult.meme) {
            const memeHex = Array.from(oracleResult.meme).map((b) =>
              b.toString(16).padStart(2, "0")
            ).join("");
            LOGGER.info(
              `🌀 [ORACLE] Memetic Injection! Seeding Grid with: [${memeHex.toUpperCase()}]`,
            );

            // Seed the 3x3 area around the Regent
            const rx = Math.floor(STATE_MATRIX.getX(regentIndex) / 10);
            const ry = Math.floor(STATE_MATRIX.getY(regentIndex) / 10);
            let seededCells = 0;

            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                const gx = rx + dx;
                const gy = ry + dy;
                if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                  const gridIdx = (gy * 140 + gx) * 8;
                  // Set energy (1000) + meme (4 bytes)
                  STATE_MATRIX.memoryGrid.set(
                    [0xE8, 0x03, 0x00, 0x00],
                    gridIdx,
                  ); // 1000 in little endian
                  STATE_MATRIX.memoryGrid.set(oracleResult.meme, gridIdx + 4);
                  seededCells++;
                }
              }
            }
            if (seededCells > 0) {
              MUTATION_TELEMETRY.record({
                lane: "internal_oracle",
                kind: "oracle_memetic_injection",
                count: seededCells,
              });
            }
          }
        } else {
          LOGGER.debug(
            `👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`,
          );
        }
      } else {
        LOGGER.debug(
          `👁️ [ORACLE] The Oracle was silent or spoke in riddles (Invalid hex returned).`,
        );
      }
    } catch (err) {
      LOGGER.error(`👁️ [ORACLE] Connection severed:`, err);

      // --- ERA 68: CACHE FALLBACK ---
      if (SOVEREIGN_ORACLE.guidanceCache.size > 0) {
        const cacheArray = Array.from(SOVEREIGN_ORACLE.guidanceCache);
        const cachedHex =
          cacheArray[Math.floor(Math.random() * cacheArray.length)];
        const bytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
          bytes[i] = parseInt(cachedHex.substring(i * 2, i * 2 + 2), 16);
        }

        if (STATE_MATRIX.getId(regentIndex) !== 0n) {
          STATE_MATRIX.setLogic(regentIndex, bytes);
          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_cache_fallback",
            count: 1,
          });
          LOGGER.warn(
            `♻️ [ORACLE] LLM Offline. Pulling from Canon Cache: [${cachedHex}]`,
          );
        }
      }
    } finally {
      SOVEREIGN_ORACLE.isConsulting = false;
    }
  },
  /**
   * Vector 10: periodic memory-grid whisper channel.
   * Writes high-value resonance seeds into MEMORY_GRID when the field is active.
   */
  broadcastWhisper: (
    currentTick: number,
    telemetry: any,
    neuralCoherence: number,
  ) => {
    if (currentTick - SOVEREIGN_ORACLE.lastWhisperTick < 7) return;
    if (telemetry.matrixResonance < 2000 && neuralCoherence < 200) return;

    SOVEREIGN_ORACLE.lastWhisperTick = currentTick;

    const seed = (((currentTick * 2654435761) >>> 0) ^
      ((telemetry.matrixResonance | 0) >>> 0) ^
      ((neuralCoherence | 0) << 8)) >>> 0;
    const gx = seed % 140;
    const gy = Math.floor(seed / 140) % 80;
    const gridIdx = (gy * 140 + gx) * 8;

    const charge = Math.min(0xFFFF, 800 + Math.max(0, neuralCoherence | 0));
    const meme = new Uint8Array([
      0xD1,
      seed & 0xFF,
      (seed >> 8) & 0xFF,
      (seed >> 16) & 0xFF,
    ]);

    STATE_MATRIX.memoryGrid[gridIdx] = charge & 0xFF;
    STATE_MATRIX.memoryGrid[gridIdx + 1] = (charge >> 8) & 0xFF;
    STATE_MATRIX.memoryGrid[gridIdx + 2] = 0;
    STATE_MATRIX.memoryGrid[gridIdx + 3] = 0;
    STATE_MATRIX.memoryGrid.set(meme, gridIdx + 4);
    MUTATION_TELEMETRY.record({
      lane: "internal_oracle",
      kind: "oracle_whisper_broadcast",
      count: 1,
    });
  },
  /**
   * Phase 19: Planetary Consciousness
   * Poll WASM for global neural coherence and broadcast it back
   * to the shared memory register so ISA_SENSE atoms can tune in.
   */
  pollNeuralCoherence: (workerExports: any, currentTick: number) => {
    if (currentTick - SOVEREIGN_ORACLE.lastCoherenceTick < 5) return;
    SOVEREIGN_ORACLE.lastCoherenceTick = currentTick;

    try {
      const coherence: number = workerExports.get_neural_coherence();
      SOVEREIGN_ORACLE.neuralCoherence = coherence;

      if (coherence > 0) {
        // Write back to shared memory so ISA_SENSE atoms can read it
        workerExports.set_neural_coherence(coherence);

        if (coherence >= 100) {
          LOGGER.info(
            `🧠 [ORACLE] Neural Coherence: ${coherence} — planetary mind-field active!`,
          );
        }
        if (coherence >= 1000) {
          LOGGER.info(
            `⚡ [ORACLE] PEAK COHERENCE ${coherence} — Planetary Consciousness ONLINE! 🌍🧠`,
          );
        }
      }
    } catch (_) {
      // WASM export not yet available — skip
    }
  },
};

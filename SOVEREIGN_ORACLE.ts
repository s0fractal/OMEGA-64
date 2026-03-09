// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

type OraclePendingMutation =
  | {
    kind: "oracle_head_mutation";
    regentIndex: number;
    headBytes: Uint8Array;
    genomeHex: string;
  }
  | {
    kind: "oracle_memetic_injection";
    regentIndex: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_cache_fallback";
    regentIndex: number;
    logicBytes: Uint8Array;
    cachedHex: string;
  }
  | {
    kind: "oracle_whisper_broadcast";
    gridIdx: number;
    charge: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_plasmid_injection";
    gridIdx: number;
    charge: number;
    plasmidBytes: Uint8Array;
    source: "oracle_guidance" | "oracle_cache_fallback";
  };

type OracleDrainStats = {
  applied: number;
  skipped: number;
  dropped: number;
  remaining: number;
};

const ORACLE_PENDING_MAX = RUNTIME_POLICY.oracle.pendingMax;
const ORACLE_MUTATION_MODE = RUNTIME_POLICY.oracle.mutationMode;
const GRID_W = 140;
const GRID_H = 80;
const GRID_CELL_BYTES = 8;

const toGridIndexNearRegent = (regentIndex: number): number | null => {
  if (STATE_MATRIX.getId(regentIndex) === 0n) return null;
  const gx = Math.max(
    0,
    Math.min(
      GRID_W - 1,
      Math.floor(
        STATE_MATRIX.getX(regentIndex) / 10,
      ),
    ),
  );
  const gy = Math.max(
    0,
    Math.min(
      GRID_H - 1,
      Math.floor(
        STATE_MATRIX.getY(regentIndex) / 10,
      ),
    ),
  );
  return (gy * GRID_W + gx) * GRID_CELL_BYTES;
};

export const SOVEREIGN_ORACLE = {
  isConsulting: false,
  lastConsultTick: 0,
  guidanceCache: new Set<string>(),
  neuralCoherence: 0, // Phase 19: Global mind-field measurement
  lastCoherenceTick: 0,
  lastWhisperTick: 0,
  pendingMutations: [] as OraclePendingMutation[],
  droppedMutations: 0,
  maxPendingMutations: ORACLE_PENDING_MAX,

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
  queueMutation: (mutation: OraclePendingMutation): void => {
    if (
      SOVEREIGN_ORACLE.pendingMutations.length >=
        SOVEREIGN_ORACLE.maxPendingMutations
    ) {
      SOVEREIGN_ORACLE.pendingMutations.shift();
      SOVEREIGN_ORACLE.droppedMutations++;
      MUTATION_TELEMETRY.record({
        lane: "internal_oracle",
        kind: "oracle_pending_drop",
        count: 1,
      });
    }
    SOVEREIGN_ORACLE.pendingMutations.push(mutation);
  },
  drainPendingMutations: (): OracleDrainStats => {
    let applied = 0;
    let skipped = 0;
    const droppedBefore = SOVEREIGN_ORACLE.droppedMutations;

    while (SOVEREIGN_ORACLE.pendingMutations.length > 0) {
      const mutation = SOVEREIGN_ORACLE.pendingMutations.shift()!;

      switch (mutation.kind) {
        case "oracle_head_mutation": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          const currentInstructions = STATE_MATRIX.getInstructions(
            mutation.regentIndex,
          );
          const headMutation = new Uint8Array(currentInstructions);
          headMutation.set(mutation.headBytes, 0);
          STATE_MATRIX.setInstructions(mutation.regentIndex, headMutation);
          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_head_mutation",
            count: 1,
          });
          SOVEREIGNTY_ENGINE.currentRegent.genome = mutation.genomeHex;
          applied++;
          break;
        }
        case "oracle_memetic_injection": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          const rx = Math.floor(STATE_MATRIX.getX(mutation.regentIndex) / 10);
          const ry = Math.floor(STATE_MATRIX.getY(mutation.regentIndex) / 10);
          let seededCells = 0;

          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const gx = rx + dx;
              const gy = ry + dy;
              if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                const gridIdx = (gy * 140 + gx) * 8;
                STATE_MATRIX.memoryGrid.set([0xE8, 0x03, 0x00, 0x00], gridIdx);
                STATE_MATRIX.memoryGrid.set(mutation.memeBytes, gridIdx + 4);
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
            applied += seededCells;
          }
          break;
        }
        case "oracle_cache_fallback": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          STATE_MATRIX.setLogic(mutation.regentIndex, mutation.logicBytes);
          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_cache_fallback",
            count: 1,
          });
          LOGGER.warn(
            `♻️ [ORACLE] LLM Offline. Pulling from Canon Cache: [${mutation.cachedHex}]`,
          );
          applied++;
          break;
        }
        case "oracle_whisper_broadcast": {
          if (
            mutation.gridIdx < 0 ||
            mutation.gridIdx + 7 >= STATE_MATRIX.memoryGrid.length
          ) {
            skipped++;
            break;
          }
          STATE_MATRIX.memoryGrid[mutation.gridIdx] = mutation.charge & 0xFF;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 1] =
            (mutation.charge >> 8) & 0xFF;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 2] = 0;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 3] = 0;
          STATE_MATRIX.memoryGrid.set(mutation.memeBytes, mutation.gridIdx + 4);
          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_whisper_broadcast",
            count: 1,
          });
          applied++;
          break;
        }
        case "oracle_plasmid_injection": {
          if (
            mutation.gridIdx < 0 ||
            mutation.gridIdx + 7 >= STATE_MATRIX.memoryGrid.length
          ) {
            skipped++;
            break;
          }
          const seedCharge = Math.max(128, Math.min(0xFFFF, mutation.charge));
          const plasmid = mutation.plasmidBytes.length >= 8
            ? mutation.plasmidBytes
            : new Uint8Array(8);
          const head = plasmid.subarray(0, 4);
          const tail = plasmid.subarray(4, 8);
          const writeCell = (
            gridIdx: number,
            charge: number,
            payload: Uint8Array,
          ) => {
            STATE_MATRIX.memoryGrid[gridIdx] = charge & 0xFF;
            STATE_MATRIX.memoryGrid[gridIdx + 1] = (charge >> 8) & 0xFF;
            STATE_MATRIX.memoryGrid[gridIdx + 2] = 0;
            STATE_MATRIX.memoryGrid[gridIdx + 3] = 0;
            STATE_MATRIX.memoryGrid.set(payload, gridIdx + 4);
          };

          let seededCells = 0;
          writeCell(mutation.gridIdx, seedCharge, head);
          seededCells++;

          const cell = Math.floor(mutation.gridIdx / GRID_CELL_BYTES);
          const col = cell % GRID_W;
          if (col < GRID_W - 1) {
            const nextGridIdx = mutation.gridIdx + GRID_CELL_BYTES;
            if (nextGridIdx + 7 < STATE_MATRIX.memoryGrid.length) {
              writeCell(
                nextGridIdx,
                Math.max(64, seedCharge - 128),
                tail,
              );
              seededCells++;
            }
          }

          MUTATION_TELEMETRY.record({
            lane: "internal_oracle",
            kind: "oracle_plasmid_injection",
            count: seededCells,
          });
          applied += seededCells;
          break;
        }
      }
    }

    return {
      applied,
      skipped,
      dropped: SOVEREIGN_ORACLE.droppedMutations - droppedBefore,
      remaining: SOVEREIGN_ORACLE.pendingMutations.length,
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
        if (STATE_MATRIX.getId(regentIndex) === 0n) {
          LOGGER.debug(
            `👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`,
          );
          return;
        }
        if (ORACLE_MUTATION_MODE === "shadow") {
          const proposalId = `sp_${Date.now()}`;
          const driftBudget = 0.15; // Fixed budget for now
          const proposal = {
            id: proposalId,
            targetRole: "any",
            proposedBytecode: Array.from(newInstructions),
            driftBudget,
          };
          try {
            const sandboxPath = "./reduction_core/sandbox/PROPOSALS.json";
            let proposals = [];
            try {
              const data = await Deno.readTextFile(sandboxPath);
              proposals = JSON.parse(data).proposals || [];
            } catch {
              // Ignore if missing or invalid
            }
            proposals.push(proposal);
            await Deno.writeTextFile(sandboxPath, JSON.stringify({ proposals }, null, 2));
            LOGGER.info(
              `🌑 [ORACLE] Generated Sandbox Proposal ${proposalId} (Drift Budget: ${driftBudget})`,
            );
          } catch (err) {
            LOGGER.error(`🌑 [ORACLE] Failed to write Sandbox Proposal:`, err);
          }
        } else if (ORACLE_MUTATION_MODE === "direct") {
          SOVEREIGN_ORACLE.queueMutation({
            kind: "oracle_head_mutation",
            regentIndex,
            headBytes: new Uint8Array(newInstructions),
            genomeHex: hex,
          });
          LOGGER.info(
            `⚡ [ORACLE] Direct semantic mutation queued for HOST_LOCK apply. Head: [${hex}]`,
          );
        } else {
          const gridIdx = toGridIndexNearRegent(regentIndex);
          if (gridIdx !== null) {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_plasmid_injection",
              gridIdx,
              charge: 1000,
              plasmidBytes: new Uint8Array(newInstructions.slice(0, 8)),
              source: "oracle_guidance",
            });
            LOGGER.info(
              `🧬 [ORACLE] Stigmergic plasmid queued for HOST_LOCK apply (mode=${ORACLE_MUTATION_MODE}). Head: [${
                hex.slice(0, 16)
              }]`,
            );
          }
        }

        // --- ERA 67: MEMETIC INJECTION ---
        if (oracleResult.meme) {
          const memeBytes = new Uint8Array(oracleResult.meme);
          const memeHex = Array.from(memeBytes).map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();
          SOVEREIGN_ORACLE.queueMutation({
            kind: "oracle_memetic_injection",
            regentIndex,
            memeBytes,
          });
          LOGGER.info(
            `🌀 [ORACLE] Memetic Injection queued for HOST_LOCK apply: [${memeHex}]`,
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
          if (ORACLE_MUTATION_MODE === "direct") {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_cache_fallback",
              regentIndex,
              logicBytes: bytes,
              cachedHex,
            });
            LOGGER.warn(
              `♻️ [ORACLE] LLM Offline. Direct cache mutation queued for HOST_LOCK: [${cachedHex}]`,
            );
          } else {
            const gridIdx = toGridIndexNearRegent(regentIndex);
            if (gridIdx !== null) {
              SOVEREIGN_ORACLE.queueMutation({
                kind: "oracle_plasmid_injection",
                gridIdx,
                charge: 900,
                plasmidBytes: bytes,
                source: "oracle_cache_fallback",
              });
              LOGGER.warn(
                `♻️ [ORACLE] LLM Offline. Stigmergic cache plasmid queued for HOST_LOCK: [${cachedHex}]`,
              );
            }
          }
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

    SOVEREIGN_ORACLE.queueMutation({
      kind: "oracle_whisper_broadcast",
      gridIdx,
      charge,
      memeBytes: meme,
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

// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "@05/LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "@00";
import { SOVEREIGNTY_ENGINE } from "@03";
import { LOGGER } from "@00";
import { RUNTIME_POLICY } from "@03";
import { PULSE } from "@02";
import { SEMANTIC_MEMBRANE } from "@05/SEMANTIC_MEMBRANE.ts";

export interface SovereignOracleAkashaDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  appendObserverCommentary(tick: number, epoch: number, message: string): Promise<void>;
}

let delegate: SovereignOracleAkashaDelegate | null = null;

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
  setAkashaDelegate: (newDelegate: SovereignOracleAkashaDelegate) => {
    delegate = newDelegate;
  },
  isConsulting: false,
  lastConsultTick: 0,
  guidanceCache: new Set<string>(),
  neuralCoherence: 0, // Phase 19: Global mind-field measurement
  lastCoherenceTick: 0,
  lastWhisperTick: 0,
  pendingMutations: [] as OraclePendingMutation[],
  droppedMutations: 0,
  maxPendingMutations: ORACLE_PENDING_MAX,

  declareEschaton: async (reason: string): Promise<void> => {
    LOGGER.info(`🔥 [ESCHATON] The Big Crunch is imminent. Reason: ${reason}`);
    const epitaph = await LLM_SYNAPSE.generateEpitaph(reason);
    LOGGER.info(`🏛️ [ORACLE EPITAPH] "${epitaph}"`);
    
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    await delegate?.appendObserverCommentary(
      tick,
      Math.floor(tick / 10000), 
      `[END OF KALPA] ${reason} - ${epitaph}`
    );
  },

  gatherEpochTelemetry: () => {
    const matrixRes = STATE_MATRIX.getMatrixResonance();
    const clusterSync = STATE_MATRIX.getClusterSync();

    // Calculate global Matrix statistics
    const activeIndices = STATE_MATRIX.getActiveIndices();
    const population = activeIndices.length;

    let totalEnergy = 0;
    let successfulSynapses = 0;

    // Tally dominant species base genomes (first 8 bytes)
    const genomeCounts = new Map<string, number>();

    for (const idx of activeIndices) {
      totalEnergy += STATE_MATRIX.getEnergy(idx);

      // Count active learned synapses
      // (Assuming each atom has 8 semantic weight channels in Phase 25)
      for (let s = 0; s < 8; s++) {
        if (STATE_MATRIX.getSynapticWeight(idx, s) > 0) {
          successfulSynapses++;
          break; // just count if the atom has ANY active synapses
        }
      }

      const genomeBase = STATE_MATRIX.getInstructions(idx).subarray(0, 8);
      const hex = Array.from(genomeBase).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      genomeCounts.set(hex, (genomeCounts.get(hex) || 0) + 1);
    }

    const avgEnergy = population > 0 ? Math.floor(totalEnergy / population) : 0;

    // Sort and get top 3 dominant genomes
    const topGenomes = Array.from(genomeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hex, count]) => ({ signature: hex, count }));

    return {
      matrixResonance: matrixRes,
      clusterSync: clusterSync,
      population,
      avg_energy: avgEnergy,
      successful_synapses: successfulSynapses,
      dominant_genomes: topGenomes,
    };
  },

  parseLLMResponse: (response: string): Uint8Array => {
    // Clean string of all whitespace, quotes, markdown formatting
    const cleanHex = response.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

    // We expect exactly 8 bytes (16 hex characters)
    if (cleanHex.length !== 16) {
      throw new Error(
        `LLM Oracle payload size mismatch. Expected 16 hex chars (8 bytes), parsed ${cleanHex.length}.`,
      );
    }

    const plasmid = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      plasmid[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return plasmid;
  },
  queueMutation: (mutation: OraclePendingMutation): void => {
    if (
      SOVEREIGN_ORACLE.pendingMutations.length >=
        SOVEREIGN_ORACLE.maxPendingMutations
    ) {
      SOVEREIGN_ORACLE.pendingMutations.shift();
      SOVEREIGN_ORACLE.droppedMutations++;
      delegate?.recordTelemetry({
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
          delegate?.recordTelemetry({
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
            delegate?.recordTelemetry({
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
          delegate?.recordTelemetry({
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
          delegate?.recordTelemetry({
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
            byteIdx: number,
            charge: number,
            payload: Uint8Array,
          ) => {
            const trueCellIdx = Math.floor(byteIdx / GRID_CELL_BYTES);
            // Pack kind 3 (plasmid) and amplitude into the 32-bit header
            const kind = 3;
            let amp = charge;
            if (amp > 8388607) amp = 8388607;
            if (amp < -8388608) amp = -8388608;
            const packedHeader = (amp << 8) | (kind & 0xFF);

            STATE_MATRIX.glyphHeaders[trueCellIdx] = packedHeader;
            STATE_MATRIX.glyphPayload.set(payload, trueCellIdx * 8);
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

          delegate?.recordTelemetry({
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

      if (oracleResult && oracleResult.intent) {
        LOGGER.info(`👁️ [ORACLE] Intent grasped: "${oracleResult.intent}"`);
        let newPlasmid: Uint8Array;
        let hex: string;

        try {
          // --- ERA 69: PHASE 49 Semantic Bridge (LSH Quantization) ---
          newPlasmid = await SEMANTIC_MEMBRANE.quantizeThought(oracleResult.intent);
          if (newPlasmid.length !== 8) {
            throw new Error(`LSH Projection structure breach. Expected 8 byte payload, received ${newPlasmid.length}`);
          }

          hex = Array.from(newPlasmid).map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();

          // Save the exact intent into the archive for UI/Telemetry
          SEMANTIC_MEMBRANE.thoughtArchive.set(hex, oracleResult.intent);
        } catch (parseError) {
          LOGGER.warn(`🛑 [ORACLE] Semantic Quantization Failed: ${parseError}`);
          return;
        }

        SOVEREIGN_ORACLE.guidanceCache.add(hex);
        if (SOVEREIGN_ORACLE.guidanceCache.size > 100) {
          const first = SOVEREIGN_ORACLE.guidanceCache.values().next().value;
          if (typeof first === "string") {
            SOVEREIGN_ORACLE.guidanceCache.delete(first);
          }
        }

        LOGGER.info(
          `👁️ [ORACLE] Oracle responded with plasmid of length ${newPlasmid.length} [Hash: ${hex}]`,
        );
        if (STATE_MATRIX.getId(regentIndex) === 0n) {
          LOGGER.debug(
            `👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`,
          );
          return;
        }

        if (
          ORACLE_MUTATION_MODE === "direct" || ORACLE_MUTATION_MODE === "shadow"
        ) {
          // Fallback legacy behavior: overwrite beginning of instructions
          const fullGenome = new Uint8Array(
            STATE_MATRIX.getInstructions(regentIndex),
          );
          fullGenome.set(newPlasmid, 0); // Put the 8 bytes at the start

          // --- PHASE 23: EPISTEMIC LOOP CAUTION ---
          try {
            const drift = await PULSE.simulateFuture(
              50,
              regentIndex,
              fullGenome,
            );

            let driftIndex = 0;
            if (drift.populationDiff < 0) {
              driftIndex += Math.abs(drift.populationDiff) * 2;
            }
            if (drift.coherenceDiff < 0) {
              driftIndex += Math.abs(drift.coherenceDiff) * 0.5;
            }
            if (drift.energyDiff < -100) {
              driftIndex += Math.abs(drift.energyDiff) * 0.01;
            }

            if (driftIndex > 20 || drift.populationDiff <= -1) {
              LOGGER.warn(
                `🛑 [ORACLE] REJECTED_BY_SHADOW. Drift constraints violated (\u0394Pop: ${drift.populationDiff}, \u0394Coh: ${drift.coherenceDiff}, Index: ${
                  driftIndex.toFixed(2)
                })`,
              );
              return;
            }
            LOGGER.info(
              `🔬 [ORACLE] Shadow Simulation passed. Drift Index: ${
                driftIndex.toFixed(2)
              }`,
            );
          } catch (simErr) {
            LOGGER.warn(`🛑 [ORACLE] Shadow Simulation Crash: ${simErr}`);
            return;
          }

          if (ORACLE_MUTATION_MODE === "shadow") {
            const proposalId = `sp_${Date.now()}`;
            const driftBudget = 0.15;
            const proposal = {
              id: proposalId,
              targetRole: "any",
              proposedBytecode: Array.from(fullGenome),
              driftBudget,
            };
            try {
              const sandboxPath = "./@07/02/sandbox/PROPOSALS.json";
              let proposals = [];
              try {
                const data = await Deno.readTextFile(sandboxPath);
                proposals = JSON.parse(data).proposals || [];
              } catch {
                // Ignore if missing
              }
              proposals.push(proposal);
              await Deno.writeTextFile(
                sandboxPath,
                JSON.stringify({ proposals }, null, 2),
              );
            } catch (err) {
              // Ignore if sandbox directory does not exist or write fails
            }
          } else {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_head_mutation",
              regentIndex,
              headBytes: fullGenome,
              genomeHex: hex,
            });
            LOGGER.info(
              `⚡ [ORACLE] Divine Intervention applied. Direct semantic mutation queued. Hash: [${hex}]`,
            );
          }
        } else {
          // Default: stigmergic
          const gridIdx = toGridIndexNearRegent(regentIndex);
          if (gridIdx !== null) {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_plasmid_injection",
              gridIdx,
              charge: 3000,
              plasmidBytes: newPlasmid,
              source: "oracle_guidance",
            });
            LOGGER.info(
              `🧬 [ORACLE] Divine Intervention applied. Stigmergic plasmid queued. Hash: [${hex}]`,
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
   * consultAutonomousOracle: Genesis mode where Oracle provides 8-byte plasmid based on world state.
   */
  consultAutonomousOracle: async (telemetry: any) => {
    if (SOVEREIGN_ORACLE.isConsulting) return;
    SOVEREIGN_ORACLE.isConsulting = true;

    try {
      LOGGER.info(`👁️ [AUTONOMOUS_ORACLE] Asking for guidance on epoch ${telemetry.epoch}...`);

      const oracleResult = await LLM_SYNAPSE.generateAutonomousPlasmid(telemetry);

      if (oracleResult && oracleResult.intent) {
        let newPlasmid: Uint8Array;
        let hex: string;

        try {
          newPlasmid = await SEMANTIC_MEMBRANE.quantizeThought(oracleResult.intent);
          hex = Array.from(newPlasmid).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
          SEMANTIC_MEMBRANE.thoughtArchive.set(hex, oracleResult.intent);
        } catch (parseError) {
          LOGGER.warn(`🛑 [AUTONOMOUS_ORACLE] Semantic Quantization Failed: ${parseError}`);
          return;
        }

        // Drop the plasmid randomly near center
        const cx = 70 + Math.floor(Math.random() * 20 - 10);
        const cy = 40 + Math.floor(Math.random() * 20 - 10);
        const gridIdx = (cy * 140 + cx) * 8;

        SOVEREIGN_ORACLE.queueMutation({
          kind: "oracle_plasmid_injection",
          gridIdx,
          charge: 10000, // Very high charge to ensure it sits there
          plasmidBytes: newPlasmid,
          source: "oracle_guidance",
        });

        LOGGER.info(`🧬 [AUTONOMOUS_ORACLE] Divine Plasmid Dropped: "${oracleResult.intent}" at (${cx}, ${cy}) [Hash: ${hex}]`);

        if (oracleResult.narrativeMood) {
          LOGGER.info(`📖 [PSYCHOHISTORY] Oracle Commentary: ${oracleResult.narrativeMood}`);
          const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
          await delegate?.appendObserverCommentary(tick, telemetry.epoch, oracleResult.narrativeMood);
        }
      }
    } catch (err) {
      LOGGER.error(`👁️ [AUTONOMOUS_ORACLE] Connection severed:`, err);
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

// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/semantic_membrane.md
import { BehaviorFingerprint, BehaviorCluster, BehaviorRuntime, Aggregate } from "@g04";

// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Homeostatic Embeddings (Era 17)
// Advanced semantic grouping with synaptic scaling and homeostasis (L8).


const PROJECTION_SIZE = 64;
const projectionMatrix = new Float32Array(PROJECTION_SIZE * PROJECTION_SIZE);
const activityHistory = new Float32Array(PROJECTION_SIZE);
let lastNormalization = 0;
const BEHAVIOR_FRAME_MAX_ATOMS = 4096;
const BEHAVIOR_CURVE_LENGTH = 16;
const BEHAVIOR_STATE_TTL_TICKS = 2048;
const OP_REPLICATE = 0x80;
const OP_SIGNAL = 0x81;
const OP_BUILD = 0xA8;

// Initialize with deterministic pseudo-random resonance
for (let i = 0; i < projectionMatrix.length; i++) {
  projectionMatrix[i] = Math.sin(i * 0.123);
}

let hyperplanes: Float32Array[] = [];
function getHyperplanes(dim: number): Float32Array[] {
  if (hyperplanes.length === 64 && hyperplanes[0].length === dim) {
    return hyperplanes;
  }
  hyperplanes = [];
  for (let i = 0; i < 64; i++) {
    const plane = new Float32Array(dim);
    for (let j = 0; j < dim; j++) {
      const u1 = Math.sin(i * 13.37 + j * 9.99) || 0.001;
      const u2 = Math.cos(i * 4.2 + j * 7.77);
      plane[j] = Math.sqrt(-2.0 * Math.log(Math.abs(u1))) *
        Math.cos(2.0 * Math.PI * u2);
    }
    hyperplanes.push(plane);
  }
  return hyperplanes;
}

const toGenomeHex = (logic: Uint8Array): string =>
  Array.from(logic).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const quantizeRatio = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const bounded = Math.max(0, Math.min(1, value));
  return Math.round(bounded * 100) / 100;
};

const deriveBehaviorFingerprint = (
  instructions: Uint8Array,
): Omit<BehaviorFingerprint, "survivalCurve"> => {
  let replicate = 0;
  let signal = 0;
  let build = 0;
  let activeSlots = 0;

  for (let i = 0; i < 64; i += 4) {
    const op = instructions[i];
    if (op !== 0) activeSlots++;
    if (op === OP_REPLICATE) replicate++;
    if (op === OP_SIGNAL) signal++;
    if (op === OP_BUILD) build++;
  }

  const denom = Math.max(1, activeSlots);
  return {
    replicateRatio: quantizeRatio(replicate / denom),
    signalRatio: quantizeRatio(signal / denom),
    buildRatio: quantizeRatio(build / denom),
  };
};

const behaviorSignature = (
  fingerprint: Omit<BehaviorFingerprint, "survivalCurve">,
): string =>
  `R${fingerprint.replicateRatio.toFixed(2)}|S${
    fingerprint.signalRatio.toFixed(2)
  }|B${fingerprint.buildRatio.toFixed(2)}`;

const trimCurve = (curve: number[]): number[] =>
  curve.length > BEHAVIOR_CURVE_LENGTH
    ? curve.slice(-BEHAVIOR_CURVE_LENGTH)
    : curve;

const behaviorRuntime = new Map<string, BehaviorRuntime>();
let behaviorFrameCache: BehaviorCluster[] = [];
let behaviorFrameTick = -1;

export const SEMANTIC_MEMBRANE = {
  projectionMatrix,
  thoughtArchive: new Map<string, string>(),
  lineage: new Map<string, string>(), // ERA 23: childGenome -> parentGenome
  behaviorRuntime,

  captureBehaviorFrame: (
    tick: number,
    sampleLimit: number = BEHAVIOR_FRAME_MAX_ATOMS,
  ): BehaviorCluster[] => {
    const safeTick = Number.isFinite(tick) ? Math.max(0, Math.floor(tick)) : 0;
    if (safeTick === behaviorFrameTick) {
      return behaviorFrameCache;
    }

    const active = MX.getActiveIndices();
    const localSampleLimit = Number.isFinite(sampleLimit)
      ? Math.max(64, Math.floor(sampleLimit))
      : BEHAVIOR_FRAME_MAX_ATOMS;
    const stride = active.length > localSampleLimit
      ? Math.ceil(active.length / localSampleLimit)
      : 1;

    const aggregates = new Map<string, Aggregate>();
    for (let i = 0; i < active.length; i += stride) {
      const idx = active[i];
      const fingerprint = deriveBehaviorFingerprint(
        MX.getInstructions(idx),
      );
      const signature = behaviorSignature(fingerprint);
      let bucket = aggregates.get(signature);
      if (!bucket) {
        bucket = {
          memberCount: 0,
          replicateTotal: 0,
          signalTotal: 0,
          buildTotal: 0,
          roleCounts: [0, 0, 0, 0, 0, 0, 0, 0],
          genomeSamples: [],
        };
        aggregates.set(signature, bucket);
      }

      bucket.memberCount++;
      bucket.replicateTotal += fingerprint.replicateRatio;
      bucket.signalTotal += fingerprint.signalRatio;
      bucket.buildTotal += fingerprint.buildRatio;
      const role = Math.min(7, Math.max(0, MX.getRole(idx)));
      bucket.roleCounts[role] += 1;

      const genome = toGenomeHex(MX.getLogic(idx));
      if (
        bucket.genomeSamples.length < 6 &&
        !bucket.genomeSamples.includes(genome)
      ) {
        bucket.genomeSamples.push(genome);
      }
    }

    const seen = new Set<string>();
    const frame: BehaviorCluster[] = [];
    for (const [signature, bucket] of aggregates.entries()) {
      seen.add(signature);
      const memberCount = Math.max(1, bucket.memberCount);
      const dominantRole = bucket.roleCounts.indexOf(
        Math.max(...bucket.roleCounts),
      );
      const fingerprint: BehaviorFingerprint = {
        replicateRatio: quantizeRatio(bucket.replicateTotal / memberCount),
        signalRatio: quantizeRatio(bucket.signalTotal / memberCount),
        buildRatio: quantizeRatio(bucket.buildTotal / memberCount),
        survivalCurve: [],
      };

      const previous = behaviorRuntime.get(signature);
      const survivalCurve = trimCurve([
        ...(previous?.survivalCurve ?? []),
        bucket.memberCount,
      ]);
      fingerprint.survivalCurve = survivalCurve;

      behaviorRuntime.set(signature, {
        survivalCurve,
        lastTick: safeTick,
        memberCount: bucket.memberCount,
        dominantRole,
        genomeSamples: bucket.genomeSamples.slice(0, 6),
        fingerprint,
      });

      frame.push({
        behaviorSignature: signature,
        memberCount: bucket.memberCount,
        dominantRole,
        genomeSamples: bucket.genomeSamples.slice(0, 6),
        fingerprint,
        lastTick: safeTick,
      });
    }

    for (const [signature, runtime] of behaviorRuntime.entries()) {
      if (seen.has(signature)) continue;
      if (safeTick - runtime.lastTick > BEHAVIOR_STATE_TTL_TICKS) {
        behaviorRuntime.delete(signature);
        continue;
      }
      runtime.survivalCurve = trimCurve([...runtime.survivalCurve, 0]);
      runtime.lastTick = safeTick;
      runtime.fingerprint = {
        ...runtime.fingerprint,
        survivalCurve: runtime.survivalCurve,
      };
      behaviorRuntime.set(signature, runtime);
    }

    frame.sort((a, b) => b.memberCount - a.memberCount);
    behaviorFrameCache = frame.slice(0, 32);
    behaviorFrameTick = safeTick;
    return behaviorFrameCache;
  },

  getBehaviorClusters: (limit: number = 6): BehaviorCluster[] => {
    const take = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 6;
    return behaviorFrameCache.slice(0, take);
  },

  dominantBehaviorInvariant: (): string =>
    behaviorFrameCache.length > 0
      ? behaviorFrameCache[0].behaviorSignature
      : "none",

  /**
   * Adapts projection with Homeostatic Plasticity.
   */
  adapt: (vecA: Float32Array, vecB: Float32Array, resonance: number) => {
    const learningRate = 0.001 * resonance;
    const ltdThreshold = 0.1;

    for (let i = 0; i < PROJECTION_SIZE; i++) {
      activityHistory[i] = 0.99 * activityHistory[i] + 0.01 * Math.abs(vecA[i]);
      for (let j = 0; j < PROJECTION_SIZE; j++) {
        const correlation = vecA[i] * vecB[j];
        if (correlation > ltdThreshold && resonance > 10) {
          projectionMatrix[i * PROJECTION_SIZE + j] += learningRate *
            correlation;
        } else if (correlation < -ltdThreshold) {
          projectionMatrix[i * PROJECTION_SIZE + j] -= 0.0001 *
            Math.abs(correlation);
        }
      }
    }

    // Synaptic Scaling (Homeostasis) every 1000 adaptations
    const now = Date.now();
    if (now - lastNormalization > 60000) {
      SEMANTIC_MEMBRANE.normalize();
      lastNormalization = now;
    }
  },

  normalize: () => {
    for (let i = 0; i < PROJECTION_SIZE; i++) {
      let sum = 0;
      for (let j = 0; j < PROJECTION_SIZE; j++) {
        sum += Math.abs(projectionMatrix[i * PROJECTION_SIZE + j]);
      }
      if (sum > 0) {
        const scale = 1.0 / sum;
        for (let j = 0; j < PROJECTION_SIZE; j++) {
          projectionMatrix[i * PROJECTION_SIZE + j] *= scale;
        }
      }
    }
    console.log(`🧠 [MEMBRANE] Synaptic scaling applied.`);
  },

  /**
   * ERA 65: SimHash (Cosine LSH) Vector Quantization
   */
  quantizeThought: async (text: string): Promise<Uint8Array> => {
    const embedding = await LLM_SYNAPSE.getEmbedding(text);
    const dim = embedding.length;
    const hash = new Uint8Array(8);
    if (dim === 0) return hash;

    const planes = getHyperplanes(dim);
    for (let bitIndex = 0; bitIndex < 64; bitIndex++) {
      const plane = planes[bitIndex];
      let dotProduct = 0;
      for (let j = 0; j < dim; j++) {
        dotProduct += embedding[j] * plane[j];
      }
      if (dotProduct > 0) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitOffset = bitIndex % 8;
        hash[byteIndex] |= 1 << bitOffset;
      }
    }
    return hash;
  },

  project: async (text: string, idx: number) => {
    const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
    MX.setLogic(idx, hash);
  },

  injectThought: async (text: string, weight: number) => {
    const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
    const idx = MX.findEmptySlot();

    if (idx !== -1) {
      // ID generation logic (Pseudo-random 64-bit BigInt)
      const idBytes = new Uint8Array(8);
      crypto.getRandomValues(idBytes);
      let id = 0n;
      for (let i = 0; i < 8; i++) id = (id << 8n) | BigInt(idBytes[i]);

      MX.setId(idx, id);

      // Genomic Traits derived directly from the semantic hash (LSH)
      // logic[1] determines Caste. >128 Parasite, <128 Builder.
      MX.setLogic(idx, hash);

      // Energy derived from weight + the first modulus byte of hash
      const baseEnergy = weight + (hash[0] % 50);
      MX.setEnergy(idx, baseEnergy);

      // Resonance based on aggressiveness (logic[1])
      const isAggressive = hash[1] > 128;
      MX.setResonance(idx, isAggressive ? 100 : 500);

      // Spawn near center
      MX.setX(idx, 700 + (Math.random() - 0.5) * 50);
      MX.setY(idx, 400 + (Math.random() - 0.5) * 50);

      // Akashic Archival: Map the Genome Hex to the original English text
      const hexHash = Array.from(hash).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      SEMANTIC_MEMBRANE.thoughtArchive.set(hexHash, text);

      console.log(
        `🧬 [MOTOR_OUTPUT] Spawned Emergent Atom [${
          isAggressive ? "PARASITE" : "BUILDER"
        }] from Thought (Genome: ${hexHash}): "${text.substring(0, 20)}..."`,
      );

      // --- ERA 36: Cognitive Scaffolding ---
      SEMANTIC_MEMBRANE.updateSemanticBonuses(idx);
    }
  },

  getBonuses: (text: string): number => {
    let mask = 0;
    const low = text.toLowerCase();
    if (
      low.includes("swift") || low.includes("fast") || low.includes("quick") ||
      low.includes("light")
    ) mask |= 1; // Bit 0: SWIFT (MOVE)
    if (
      low.includes("guardian") || low.includes("shield") ||
      low.includes("protect") || low.includes("wall")
    ) mask |= 2; // Bit 1: GUARDIAN (BUILD)
    if (
      low.includes("harvest") || low.includes("sun") || low.includes("feed") ||
      low.includes("grow")
    ) mask |= 4; // Bit 2: HARVEST (FEED)
    return mask;
  },

  updateSemanticBonuses: (idx: number) => {
    const logic = MX.getLogic(idx);
    const hexHash = Array.from(logic).map((b) =>
      b.toString(16).padStart(2, "0")
    ).join("").toUpperCase();
    const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
    if (thought) {
      const bonuses = SEMANTIC_MEMBRANE.getBonuses(thought);
      // @ts-ignore: semanticBonuses is a custom buffer added in Era 36
      Atomics.store(MX.semanticBonuses, idx, bonuses);
    }
  },

  readVoxelPopuli: async (rootPath: string): Promise<string[]> => {
    const thoughts: string[] = [];

    // --- 1. Scan The Ecological Mood ---
    let parasiteCount = 0;
    let builderCount = 0;
    let totalEnergy = 0;

    const active = MX.getActiveIndices();
    for (const i of active) {
      const logic = MX.getLogic(i);
      if (logic[1] > 128) parasiteCount++;
      else builderCount++;
      totalEnergy += MX.getEnergy(i);
    }

    const avgEnergy = active.length > 0 ? (totalEnergy / active.length) : 0;

    let mood = "ECOLOGICAL MOOD: Balanced.";
    if (parasiteCount > builderCount * 2) {
      mood =
        "CRITICAL WARNING: The ecosystem is devouring itself! Too many aggressive parasites.";
    } else if (builderCount > parasiteCount * 3 && avgEnergy < 50) {
      mood = "SYSTEM ALERT: The matrix is starving. Builders lack nutrients.";
    } else if (builderCount > parasiteCount * 2) {
      mood =
        "HARMONY: The ecosystem is constructive and building mycelial bonds.";
    }
    thoughts.push(`[SYSTEM_STATE] Active Entities: ${active.length}. ${mood}`);

    // --- 2. Scan Textual Memories ---
    try {
      // @ts-ignore: Deno types might not be resolved perfectly
      for await (const entry of Deno.readDir(rootPath)) {
        if (entry.isFile && entry.name.endsWith(".md")) {
          // @ts-ignore: Deno types might not be resolved perfectly
          const content = await Deno.readTextFile(`${rootPath}/${entry.name}`);
          const thoughtMatch = content.match(/# Thought\n([\s\S]+?)$/m);
          if (thoughtMatch) thoughts.push(thoughtMatch[1].trim());
        }
      }
    } catch { /* NOOP */ }
    return thoughts;
  },

  /**
   * ERA 46: Oracle Priority Queue
   * Returns the English thoughts of the most resonant atoms.
   */
  readOracleQueue: (count: number): string[] => {
    const topIndices = MX.getTopResonantIndices(count);
    const thoughts: string[] = [];
    for (const idx of topIndices) {
      const logic = MX.getLogic(idx);
      const hexHash = Array.from(logic).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
      if (thought) thoughts.push(thought);
    }
    return thoughts;
  },

  scanDigitalRuins: (): string[] => {
    const ruins: string[] = [];
    // @ts-ignore: structureGrid exists in MX
    const grid = MX.structureGrid;
    // @ts-ignore: memoryGrid exists in MX
    const memory = MX.memoryGrid;

    const GRID_W = 70;
    const GRID_H = 40;

    for (let i = 0; i < GRID_CELLS; i++) {
      const cell = grid[i];
      const density = (cell >> 8) & 0xFF; // Pack: [Density (8 bits) | Type (8 bits)]

      if (density > 50 && density < 150) {
        // Potential Archaelogical Site (Moderate density = Ruins)
        const bytecode = memory.subarray(i * 8, i * 8 + 8);
        const hasMemory = Array.from(bytecode).some((b: number) => b !== 0);

        if (hasMemory) {
          const hexHash = Array.from(bytecode).map((b: number) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();
          const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);

          const x = i % GRID_W;
          const y = Math.floor(i / GRID_W);

          if (thought) {
            ruins.push(
              `Found preserved logic at [${x},${y}]: "${thought}" (Genome: ${hexHash})`,
            );
          } else {
            ruins.push(
              `Found ancient ruins at [${x},${y}] with unknown genome: ${hexHash}`,
            );
          }
        }
      }
    }
    return ruins.slice(0, 5);
  },
};

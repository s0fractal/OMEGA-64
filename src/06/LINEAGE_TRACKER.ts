import { STATE_MATRIX } from "@generated";
import { LOGGER } from "@generated";
import { AKASHA_CODEX } from "@06/AKASHA_CODEX.ts";

export type MemeticStats = {
  firstAppearance: number;
  peakAdoption: number;
  cumulativeLifespan: number;
  cumulativeEnergy: number;
  frameCount: number;
};

export const LINEAGE_TRACKER = {
  registry: new Map<string, MemeticStats>(),
  lastScanTick: 0,

  toHex: (bytes: Uint8Array): string => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  },

  updateMetrics: (currentTick: number) => {
    const currentAdoption = new Map<string, { count: number; energy: number }>();
    let activeNodes = 0;

    for (let i = 0; i < STATE_MATRIX.MAX_ATOMS; i++) {
        if (STATE_MATRIX.getId(i) === 0n) continue;
        activeNodes++;
        const genomeBytes = STATE_MATRIX.getInstructions(i);
        // Track the first 8 bytes as the core "Plasmid/Meme" signature for brevity,
        // or the entire 64 bytes. We will use the first 8 bytes (16 hex chars) as the Meme ID
        // since the Oracle drops 8-byte plasmids.
        const memeId = LINEAGE_TRACKER.toHex(genomeBytes.subarray(0, 8));
        
        const energy = STATE_MATRIX.getEnergy(i);

        const current = currentAdoption.get(memeId) ?? { count: 0, energy: 0 };
        current.count += 1;
        current.energy += energy;
        currentAdoption.set(memeId, current);
    }

    if (activeNodes === 0) return;

    for (const [memeId, current] of currentAdoption.entries()) {
        const stats = LINEAGE_TRACKER.registry.get(memeId) ?? {
            firstAppearance: currentTick,
            peakAdoption: 0,
            cumulativeLifespan: 0,
            cumulativeEnergy: 0,
            frameCount: 0
        };

        if (current.count > stats.peakAdoption) {
            stats.peakAdoption = current.count;
        }
        
        // Extrapolate lifespan assuming updateMetrics is called periodically (e.g. 100 ticks)
        const ticksPassed = currentTick - LINEAGE_TRACKER.lastScanTick;
        const tickDelta = ticksPassed > 0 && ticksPassed <= 1000 ? ticksPassed : 100;

        stats.cumulativeLifespan += current.count * tickDelta;
        stats.cumulativeEnergy += current.energy * tickDelta;
        stats.frameCount += 1;

        LINEAGE_TRACKER.registry.set(memeId, stats);
    }
    
    LINEAGE_TRACKER.lastScanTick = currentTick;
  },

  closeEpoch: (currentTick: number): { dominantMeme: string, destructiveMeme: string } => {
    if (LINEAGE_TRACKER.registry.size === 0) {
      return { dominantMeme: "NONE", destructiveMeme: "NONE" };
    }

    let dominantMeme = "NONE";
    let maxAdoption = -1;

    let destructiveMeme = "NONE";
    let lowestROI = Infinity;
    
    for (const [memeId, stats] of LINEAGE_TRACKER.registry.entries()) {
        if (stats.peakAdoption > maxAdoption) {
            maxAdoption = stats.peakAdoption;
            dominantMeme = memeId;
        }

        // To be considered destructive, it must have had some impact (adoption > 5)
        if (stats.peakAdoption > 5 && stats.cumulativeLifespan > 0) {
            const energyROI = stats.cumulativeEnergy / stats.cumulativeLifespan;
            if (energyROI < lowestROI) {
                lowestROI = energyROI;
                destructiveMeme = memeId;
            }
        }
    }

    // Reset registry for the next epoch to measure per-epoch performance
    LINEAGE_TRACKER.registry.clear();

    LOGGER.info(`📊 [PSYCHOHISTORY] Epoch closed at tick ${currentTick}. Dominant: ${dominantMeme}, Destructive: ${destructiveMeme}`);
    return { dominantMeme, destructiveMeme };
  }
};

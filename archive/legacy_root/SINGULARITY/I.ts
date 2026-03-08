// SINGULARITY/I.ts
// WAVE IMMUNE SYSTEM

import { WaveNode } from "./S.ts";

export const IMMUNE = {
  validate: (node: WaveNode): boolean => {
    // A. Entropy Integrity Check
    const isStable = node.r >= 0n && node.r <= 65535n;

    // B. Phase Check
    const hasPhase = node.theta !== undefined;

    if (!isStable || !hasPhase) {
      console.warn("🛡️ IMMUNE: Node Rejected - Out of Phase");
      return false;
    }

    return true;
  },
};

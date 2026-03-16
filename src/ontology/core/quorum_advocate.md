---
id: QUORUM_ADVOCATE
type: module
description: Migrated from src/07/02/QUORUM_ADVOCATE.ts
tags:
  - core
  - host
deps:
  - LOGGER
  - TYPES
min_level: 7
vars:
  - LOGGER
  - MX
extra_symbols:
  - QuorumAdvocate
---

### TypeScript

```typescript
// OMEGA-64 | QUORUM_ADVOCATE.ts | Stage 24: Stigmergic Synthesis

/**
 * QuorumAdvocate evaluates local group coherence and biases the GATE system.
 * It detects "Quorum" conditions when atoms of similar lineage or phase
 * cluster together to perform coordinated actions.
 */
export class QuorumAdvocate {
  /**
   * Evaluates the collective "Strength" of a group of atoms.
   * This is used to lower the energy threshold for OP_BUILD or other
   * collective intents.
   */
  public evaluateQuorum(indices: number[]): number {
    if (indices.length < 2) return 0;

    let totalResonace = 0;
    let totalWisdom = 0;

    for (const idx of indices) {
      totalResonace += MX.getResonance(idx);
      // Wisdom will eventually be pulled from LINEAGE_TRACKER
      totalWisdom += 100;
    }

    const avgResonance = totalResonace / indices.length;

    // Quorum Strength is a function of density and internal coherence
    const strength = (indices.length * avgResonance) / 1000;

    return Math.min(strength, 1.0);
  }

  /**
   * Decides if a collective action (e.g. delegated build) should be
   * fast-tracked through the GATE.
   */
  public recommendAdmission(quorumStrength: number): boolean {
    // High quorum strength ( > 0.7) suggests a coordinated structural intent
    return quorumStrength > 0.7;
  }
}
```

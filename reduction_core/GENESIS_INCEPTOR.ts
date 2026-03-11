// OMEGA-64 | GENESIS_INCEPTOR.ts | Stage 22: Adaptive Genesis & Drift Response
import { GENESIS_PROGRAMS } from "./GENESIS_BOOT.ts";
import { REIFIED_PROGRAMS } from "./GENESIS_REIFIED.ts";
import { LOGGER } from "../00_substrate/mod.ts";

export interface InceptiveProgram {
  bytecode: number[];
  metadata?: {
    ancestorHash?: bigint;
    roleHint?: number;
  };
}

/**
 * GenesisInceptor manages the selection of bytecode for new atomic entities.
 * It prioritizes reified relics from the shadow laboratory.
 */
export class GenesisInceptor {
  /**
   * Selects a program for a new spawn.
   * @param roleId Hint for the desired role (1: Guardian, 2: Architect, etc.)
   */
  public selectProgram(roleId?: number): InceptiveProgram {
    const reifiedKeys = Object.keys(REIFIED_PROGRAMS);

    // 1. Check for reified programs first (Evolutionary priority)
    if (reifiedKeys.length > 0) {
      // Simple heuristic: pick a random reified program or one matching role hint
      const pickedKey =
        reifiedKeys[Math.floor(Math.random() * reifiedKeys.length)];
      LOGGER.debug(`[INCEPTOR] Selected reified program: ${pickedKey}`);
      return {
        bytecode: REIFIED_PROGRAMS[pickedKey],
        metadata: { ancestorHash: BigInt("0x" + pickedKey.substring(0, 16)) }, // Pseudo-hash
      };
    }

    // 2. Fallback to canonical genesis programs
    if (roleId === 1) return { bytecode: GENESIS_PROGRAMS["guardian_base"] };
    if (roleId === 2) return { bytecode: GENESIS_PROGRAMS["architect_base"] };

    // Default replicator
    return { bytecode: GENESIS_PROGRAMS["replicator_base"] };
  }
}

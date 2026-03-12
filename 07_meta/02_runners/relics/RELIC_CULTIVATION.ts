// OMEGA-64 | RELIC_CULTIVATION.ts | Stage 21: The Doll Fork
import * as OFFSETS from "@00";
import { DollFork } from "../doll_fork/DOLL_FORK_MATRIX.ts";
import { LOGGER } from "@00";

export type Relic = {
  id: string;
  bytecode: number[];
  role: number;
  resonance: number;
  energy: number;
  extractedAtTick: number;
};

/**
 * RelicCultivator identifies stable, high-resonance evolutionary patterns in the shadow matrix.
 */
export class RelicCultivator {
  private fork: DollFork;

  constructor(fork: DollFork) {
    this.fork = fork;
  }

  /**
   * Scans the shadow matrix for atoms that meet 'relic' criteria.
   * Criteria: energy > 500, resonance > 200, non-zero bytecode.
   */
  public cultivateRelics(tick: number): Relic[] {
    const relics: Relic[] = [];
    const views = this.fork.views;

    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      const energy = views.energies[i];
      const resonance = views.resonances[i];
      const atomId = views.ids[i];

      if (atomId !== 0n && energy > 500 && resonance > 200) {
        const bytecode = Array.from(
          views.logic.slice(i * 8, (i + 1) * 8),
        ) as number[];

        // Basic check: is bytecode non-zero?
        if (bytecode.some((b) => b !== 0)) {
          relics.push({
            id: `relic_${tick}_${i}_${atomId}`,
            bytecode,
            role: views.roles[i],
            resonance,
            energy,
            extractedAtTick: tick,
          });
        }
      }
    }

    if (relics.length > 0) {
      LOGGER.info(
        `[RELIC CULTIVATOR] Extracted ${relics.length} potential relics at tick ${tick}`,
      );
    }

    return relics;
  }

  /**
   * Persists relics to the semantic sandbox for future reification.
   */
  public async persistRelics(relics: Relic[]): Promise<void> {
    for (const relic of relics) {
      const path = `./@07/02_runners/sandbox/relic_${relic.id}.json`;
      await Deno.writeTextFile(path, JSON.stringify(relic, null, 2));
      LOGGER.info(`[RELIC CULTIVATOR] Saved relic to ${path}`);
    }
  }
}

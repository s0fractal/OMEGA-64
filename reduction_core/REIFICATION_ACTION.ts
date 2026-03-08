// OMEGA-64 | REIFICATION_ACTION.ts | Stage 21: The Doll Fork
import { Relic } from "./relics/RELIC_CULTIVATION.ts";
import { LOGGER } from "../LOGGER.ts";

/**
 * ReificationAction promotes a relic from the sandbox to the canonical GENESIS pool.
 */
export class ReificationAction {
  private genesisPath = "./reduction_core/GENESIS_REIFIED.ts";

  /**
   * Promotes a relic JSON file to the GENESIS_REIFIED.ts registry.
   */
  public async reify(relicId: string): Promise<void> {
    const sandboxPath = `./reduction_core/sandbox/relic_${relicId}.json`;
    
    try {
      const relicData = await Deno.readTextFile(sandboxPath);
      const relic: Relic = JSON.parse(relicData);
      
      LOGGER.info(`[REIFICATION] Promoting relic ${relic.id} to canonical pool...`);
      
      // Load or create the reified registry
      let content = "";
      try {
        content = await Deno.readTextFile(this.genesisPath);
      } catch {
        content = "// OMEGA-64 | GENESIS_REIFIED.ts | Cultivated Relics\nexport const REIFIED_PROGRAMS: Record<string, number[]> = {};\n";
      }
      
      // Add the relic to the registry (simple string append for now, or use a more robust parser if needed)
      // Since it's a generated file, we can just replace the object content or append
      const entry = `\nREIFIED_PROGRAMS["${relic.id}"] = ${JSON.stringify(relic.bytecode)};`;
      
      // Basic check to see if it already exists
      if (content.includes(`REIFIED_PROGRAMS["${relic.id}"]`)) {
        LOGGER.warn(`[REIFICATION] Relic ${relic.id} already exists in registry. Skipping.`);
        return;
      }
      
      await Deno.writeTextFile(this.genesisPath, content + entry);
      LOGGER.info(`[REIFICATION] Relic ${relic.id} successfully reified in ${this.genesisPath}`);
      
    } catch (err) {
      LOGGER.error(`[REIFICATION ERROR] Failed to reify relic ${relicId}:`, err);
      throw err;
    }
  }
}

if (import.meta.main) {
  const relicId = Deno.args[0];
  if (!relicId) {
    console.error("Usage: deno run -A REIFICATION_ACTION.ts <relic_id_without_prefix>");
    Deno.exit(1);
  }
  const action = new ReificationAction();
  await action.reify(relicId);
}

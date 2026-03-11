import { ensureDir, move, walk } from "jsr:@std/fs";
import { join, dirname, basename, extname } from "jsr:@std/path";

const LAYERS = [
  "00_substrate",
  "01_physics",
  "02_metabolism",
  "03_governance",
  "04_noosphere",
  "05_exocortex",
  "06_akasha",
  "63_necropolis",
  "tests"
];

// Mapping overrides to precisely enforce the specification
const mapping: Record<string, string> = {};

const classify = (file: string): string => {
  const b = basename(file);
  if (mapping[b]) return mapping[b];

  if (b.startsWith("test_") || b.endsWith("_test.ts") || b === "wasm_layout_guard.ts" || b === "verify_offsets.ts") return "tests";
  
  // 00_substrate
  if (['OFFSETS.ts', 'STATE_MATRIX.ts', 'SHIMS.ts', 'ENV_PARSE.ts', 'ATOM_INDEX.ts', 'LOGGER.ts', 'PRNG.ts', 'STATE_SNAPSHOT.ts'].includes(b)) return '00_substrate';
  
  // 01_physics
  if (['PHYSICS_ENGINE.ts', 'SPATIAL_HASH.ts', 'STRUCTURE_ENGINE.ts', 'GLYPH_BUFFER.ts', 'MATRIX_ENGINE.ts', 'ECOLOGY_ENGINE.ts'].includes(b)) return '01_physics';

  // 02_metabolism
  if (['PULSE.ts', 'PULSE_WORKER.ts', 'GENOMES.ts', 'IMMUNE.ts', 'RIBOSOME.ts', 'RIBOSOME_TICK.ts', 'LAMBDA_VM.ts', 'ENZYME_DIGEST.ts', 'RECOVERY.ts', 'REFLECTION_ENGINE.ts', 'SNAP.ts', 'HOLOGRAM_INJECTOR.ts', 'HOLOGRAM_MODULE.ts', 'HORMONE_BUFFER.ts', 'HORMONE_BUFFER_RUNTIME.ts'].includes(b)) return '02_metabolism';

  // 03_governance
  if (b.startsWith("GATE") || b.startsWith("GENETIC_LEDGER") || b.startsWith("GENERIC_LEDGER") || b.includes("PROMOTION") || ['RUNTIME_POLICY.ts', 'SOVEREIGNTY_ENGINE.ts', 'CONTROL_INTENT_QUEUE.ts', 'DAEMON_INGRESS_POLICY.ts', 'ATOMIC_LEDGER.ts', 'PREDICTION_MARKET.ts', 'AUDIT_ENGINE.ts'].includes(b)) return '03_governance';

  // 04_noosphere
  if (b.startsWith("P2P_") || ['SWARM_NEXUS.ts', 'BOOTSTRAP_HUB.ts', 'SWARM_NODE.ts'].includes(b)) return '04_noosphere';

  // 05_exocortex
  if (['SOVEREIGN_ORACLE.ts', 'LLM_SYNAPSE.ts', 'SEMANTIC_MEMBRANE.ts', 'llm_soul.ts', 'avatar_bot.ts', 'AVATAR_ENGINE.ts'].includes(b)) return '05_exocortex';

  // 06_akasha
  if (['AKASHA_CODEX.ts', 'LINEAGE_TRACKER.ts', 'PANOPTICON_SERVER.ts', 'TELEMETRY_STREAM.ts', 'PHYSIOLOGY_SNAPSHOT.ts', 'CONTINUUM.ts', 'SNAP_ENGINE.ts', 'OBSERVER_UI.ts', 'OBSERVER_LAB.ts', 'MUTATION_TELEMETRY.ts', 'AKASHA_SERVER.ts', 'OMEGA_DAEMON.ts', 'TUI_DASHBOARD.ts', 'SERVE_DASHBOARD.ts', 'SNAPSHOT_ENGINE.ts'].includes(b)) return '06_akasha';

  // 63_necropolis
  if (['ZERO_IOPS.ts', 'LONGRUN_CANARY.ts', 'LONGRUN_DAEMON_AUDIT.ts', 'COLDSTART_BOOTSTRAP.ts', 'FORCE_BOOTSTRAP.ts', 'run_ecosystem.ts', 'trigger_singularity.ts', 'nightly_soak.ts', 'debug_tick.ts'].concat(['diag_replicate.ts', 'diag_replicate2.ts', 'diag_replicate3.ts']).includes(b)) return '63_necropolis';

  // Root or unclassified (keep null to leave at root)
  return 'root';
};

async function main() {
  for (const l of LAYERS) {
    await ensureDir(l);
  }

  // 1. Gather all TS files
  const tsFiles = [];
  for await (const entry of walk(".", { exts: [".ts"], skip: [/^\./, /^sigma_core/, /^omega_vm/, /^omega_wasm/, /^tests/, /^e\//, /^o\//, /^archive\//, /^assembly\//, /^\d{2}_/] })) {
    if (entry.isFile && entry.name !== "phase52.ts" && entry.name !== "export_core.ts" && entry.name !== "build_wasm.ts" && entry.name !== "SYSTEM_START.ts" && !entry.name.startsWith("gen_rust") && !entry.name.startsWith("export_rust") && !entry.name.startsWith("fix_") && entry.name !== "dump_waste.ts" && entry.name !== "mod.ts") {
      tsFiles.push(entry.path);
    }
  }

  // Also include SWARM_NEXUS.ts and BOOTSTRAP_HUB.ts from network/
  try {
    for await (const entry of walk("network", { exts: [".ts"] })) {
      tsFiles.push(entry.path);
    }
  } catch (e) {}
  
  // Include existing tests to move them
  try {
    for await (const entry of walk(".", { exts: [".ts"], match: [/^test_/] })) {
      if (!entry.path.startsWith("tests/")) tsFiles.push(entry.path);
    }
  } catch (e) {}

  const fileMap = new Map<string, string>(); // basename -> new layer
  const relocationMap = new Map<string, string>(); // oldPath -> newPath

  // Move files physically
  for (const path of tsFiles) {
    const b = basename(path);
    const layer = classify(b);
    if (layer !== 'root') {
      const dest = join(layer, b);
      fileMap.set(b, layer);
      relocationMap.set(path, dest);
      console.log(`Moving ${path} -> ${dest}`);
      await move(path, dest, { overwrite: true });
    } else {
      fileMap.set(b, 'root');
    }
  }

  // Pre-seed known locations (for tests and sub-imports)
  for await (const entry of walk(".", { exts: [".ts"] })) {
    for (const l of LAYERS) {
      if (entry.path.startsWith(`${l}/`)) {
        fileMap.set(entry.name, l);
      }
    }
  }

  // 2. Generate mod.ts for layers 00-06 and 63
  for (const layer of LAYERS.filter(l => l !== 'tests')) {
    const exports = [];
    for await (const entry of walk(layer, { exts: [".ts"], maxDepth: 1 })) {
      if (entry.name !== "mod.ts") {
        exports.push(`export * from "./${entry.name}";`);
      }
    }
    if (exports.length > 0) {
      await Deno.writeTextFile(join(layer, "mod.ts"), exports.join("\n") + "\n");
    } else {
      await Deno.writeTextFile(join(layer, "mod.ts"), "// Empty layer\n");
    }
  }

  // 3. Rewrite Imports
  // We'll walk ALL .ts files in the repository
  const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/|network\/)([^"']+)["']/g;
  
  for await (const entry of walk(".", { exts: [".ts"], skip: [/^\./, /^sigma_core/, /^omega_vm/, /^omega_wasm/, /^e\//, /^archive\//, /^assembly\//] })) {
    const content = await Deno.readTextFile(entry.path);
    const currentLayerMatch = entry.path.split("/");
    const isRoot = currentLayerMatch.length === 1;
    const currentLayer = isRoot ? 'root' : currentLayerMatch[0];
    
    let edited = false;
    const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
      // Remove .ts just for checking
      let importedName = basename(importedPath);
      if (!importedName.endsWith(".ts")) importedName += ".ts";

      const targetLayer = fileMap.get(importedName);

      if (!targetLayer) {
        // Unknown, leave it alone
        return match;
      }

      let newRel = "";
      if (isRoot) {
        if (targetLayer === 'root') newRel = `./${importedName}`;
        else newRel = `./${targetLayer}/mod.ts`;
      } else {
        if (targetLayer === 'root') {
          newRel = `../${importedName}`;
        } else if (currentLayer === targetLayer) {
          // Intra-layer: direct
          newRel = `./${importedName}`;
        } else {
          // Inter-layer: through mod.ts
          newRel = `../${targetLayer}/mod.ts`;
        }
      }

      edited = true;
      return `${keyword} "${newRel}"`;
    });

    if (edited) {
      await Deno.writeTextFile(entry.path, newContent);
    }
  }

  // Generate Architecture Guard
  const guardCode = `
import { walk } from "jsr:@std/fs";
import { assert } from "jsr:@std/assert";

const LAYERS = [
  "00_substrate",
  "01_physics",
  "02_metabolism",
  "03_governance",
  "04_noosphere",
  "05_exocortex",
  "06_akasha"
];

Deno.test("topology: architecture guard - strict acyclic descent", async () => {
  const IMPORT_REGEX = /from\\s+["']\\.\\.\\/(\\d{2}_[^/]+)\\/mod\\.ts["']/g;

  for (let i = 0; i < LAYERS.length; i++) {
    const layer = LAYERS[i];
    const allowed = LAYERS.slice(0, i + 1); // Layer can import itself and anything below it

    for await (const entry of walk(layer, { exts: [".ts"] })) {
      const content = await Deno.readTextFile(entry.path);
      let match;
      while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const targetLayer = match[1];
        if (!allowed.includes(targetLayer)) {
          throw new Error(\`Topological Breach! \${entry.path} is importing from \${targetLayer}. A layer may only import from layers at or below its own level.\`);
        }
      }
    }
  }
});
`;
  await Deno.writeTextFile("tests/architecture_guard.ts", guardCode.trim());
  console.log("Migration Complete.");
}

main();

import { ensureDir, move, walk } from "jsr:@std/fs";
import { join, basename } from "jsr:@std/path";

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const classify = (file: string): string => {
  const b = basename(file);

  if (b.startsWith("test_") || b.endsWith("_test.ts") || b === "wasm_layout_guard.ts" || b === "verify_offsets.ts") return "tests";
  
  if (['OFFSETS.ts', 'STATE_MATRIX.ts', 'SHIMS.ts', 'ENV_PARSE.ts', 'ATOM_INDEX.ts', 'LOGGER.ts', 'PRNG.ts', 'STATE_SNAPSHOT.ts'].includes(b)) return '00_substrate';
  if (['PHYSICS_ENGINE.ts', 'SPATIAL_HASH.ts', 'STRUCTURE_ENGINE.ts', 'GLYPH_BUFFER.ts', 'MATRIX_ENGINE.ts', 'ECOLOGY_ENGINE.ts'].includes(b)) return '01_physics';
  if (['PULSE.ts', 'PULSE_WORKER.ts', 'GENOMES.ts', 'IMMUNE.ts', 'RIBOSOME.ts', 'RIBOSOME_TICK.ts', 'LAMBDA_VM.ts', 'ENZYME_DIGEST.ts', 'RECOVERY.ts', 'REFLECTION_ENGINE.ts', 'SNAP.ts', 'HOLOGRAM_INJECTOR.ts', 'HOLOGRAM_MODULE.ts', 'HORMONE_BUFFER.ts', 'HORMONE_BUFFER_RUNTIME.ts'].includes(b)) return '02_metabolism';
  if (b.startsWith("GATE") || b.startsWith("GENETIC_LEDGER") || b.startsWith("GENERIC_LEDGER") || b.includes("PROMOTION") || ['RUNTIME_POLICY.ts', 'SOVEREIGNTY_ENGINE.ts', 'CONTROL_INTENT_QUEUE.ts', 'DAEMON_INGRESS_POLICY.ts', 'ATOMIC_LEDGER.ts', 'PREDICTION_MARKET.ts', 'AUDIT_ENGINE.ts'].includes(b)) return '03_governance';
  if (b.startsWith("P2P_") || ['SWARM_NEXUS.ts', 'BOOTSTRAP_HUB.ts', 'SWARM_NODE.ts'].includes(b)) return '04_noosphere';
  if (['SOVEREIGN_ORACLE.ts', 'LLM_SYNAPSE.ts', 'SEMANTIC_MEMBRANE.ts', 'llm_soul.ts', 'avatar_bot.ts', 'AVATAR_ENGINE.ts'].includes(b)) return '05_exocortex';
  if (['AKASHA_CODEX.ts', 'LINEAGE_TRACKER.ts', 'PANOPTICON_SERVER.ts', 'TELEMETRY_STREAM.ts', 'PHYSIOLOGY_SNAPSHOT.ts', 'CONTINUUM.ts', 'SNAP_ENGINE.ts', 'OBSERVER_UI.ts', 'OBSERVER_LAB.ts', 'MUTATION_TELEMETRY.ts', 'AKASHA_SERVER.ts', 'OMEGA_DAEMON.ts', 'TUI_DASHBOARD.ts', 'SERVE_DASHBOARD.ts', 'SNAPSHOT_ENGINE.ts'].includes(b)) return '06_akasha';
  if (['ZERO_IOPS.ts', 'LONGRUN_CANARY.ts', 'LONGRUN_DAEMON_AUDIT.ts', 'COLDSTART_BOOTSTRAP.ts', 'FORCE_BOOTSTRAP.ts', 'run_ecosystem.ts', 'trigger_singularity.ts', 'nightly_soak.ts', 'debug_tick.ts'].concat(['diag_replicate.ts', 'diag_replicate2.ts', 'diag_replicate3.ts']).includes(b)) return '63_necropolis';

  return 'root';
};

async function main() {
  for (const l of LAYERS) {
    await ensureDir(l);
  }

  const files = [];
  for await (const dirEntry of Deno.readDir(".")) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".ts")) {
      files.push(dirEntry.name);
    }
  }

  try {
    for await (const dirEntry of Deno.readDir("network")) {
      if (dirEntry.isFile && dirEntry.name.endsWith(".ts")) {
        files.push("network/" + dirEntry.name);
      }
    }
  } catch(e) {}

  let cnt = 0;
  for (const file of files) {
    if (file === "phase52.ts" || file === "phase52_fix.ts" || file.startsWith("fix_") || file.startsWith("gen_rust") || file.startsWith("export_rust")) continue;

    const b = basename(file);
    const layer = classify(b);
    if (layer !== "root") {
      const dest = join(layer, b);
      console.log(`Moving ${file} -> ${dest}`);
      await move(file, dest, { overwrite: true });
      cnt++;
    }
  }
  
  // Re-generate mod.ts correctly
  for (const layer of LAYERS.filter(l => l !== 'tests')) {
    const exports = [];
    for await (const entry of Deno.readDir(layer)) {
      if (entry.isFile && entry.name.endsWith(".ts") && entry.name !== "mod.ts") {
        exports.push(`export * from "./${entry.name}";`);
      }
    }
    if (exports.length > 0) {
      await Deno.writeTextFile(join(layer, "mod.ts"), exports.join("\n") + "\n");
    } else {
      await Deno.writeTextFile(join(layer, "mod.ts"), "// Empty layer\n");
    }
  }
  
  console.log(`Moved ${cnt} root files.`);
}
main();

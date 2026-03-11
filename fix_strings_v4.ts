import { walk } from "jsr:@std/fs";

const fileMap = {
  "PULSE.ts": "02_metabolism",
  "PULSE_WORKER.ts": "02_metabolism",
  "STATE_MATRIX.ts": "00_substrate",
  "SNAP.ts": "02_metabolism",
  "SNAPSHOT_ENGINE.ts": "06_akasha",

  "RIBOSOME.ts": "02_metabolism",
  "REFLECTION_ENGINE.ts": "02_metabolism",
  "SYSTEM_START.ts": "root",
  "RIBOSOME_TICK.ts": "02_metabolism",
  "GATE.ts": "03_governance",
  "SPATIAL_HASH.ts": "01_physics",
  "MUTATION_TELEMETRY.ts": "06_akasha",
  "SOVEREIGN_ORACLE.ts": "05_exocortex",
  "CONTROL_INTENT_QUEUE.ts": "03_governance",
  "DAEMON_INGRESS_POLICY.ts": "03_governance",
  "PHYSICS_ENGINE.ts": "01_physics",
  "STRUCTURE_ENGINE.ts": "01_physics",
  "LLM_SYNAPSE.ts": "05_exocortex",
  "SEMANTIC_MEMBRANE.ts": "05_exocortex",
  "AKASHA_CODEX.ts": "06_akasha",
  "ENV_PARSE.ts": "00_substrate",
  "ATOM_INDEX.ts": "00_substrate",
  "OFFSETS.ts": "00_substrate"
};

let count = 0;
for await (const entry of walk("tests", { exts: [".ts"] })) {
  let content = await Deno.readTextFile(entry.path);
  let original = content;

  for (const [filename, layer] of Object.entries(fileMap)) {
    if (layer === "root" || layer === "tests") continue;
    
    // Replace "FILENAME.ts" with "LAYER/FILENAME.ts"
    const r1 = new RegExp(`(["'\`])(${filename})(["'\`])`, 'g');
    content = content.replace(r1, `$1${layer}/$2$3`);
  }

  if (content !== original) {
    await Deno.writeTextFile(entry.path, content);
    console.log(`Updated ${entry.path}`);
    count++;
  }
}
console.log(`Fixed ${count} tests.`);

// Also fix OMEGA_CORE_LOGIC_MD which might have wrong references now?

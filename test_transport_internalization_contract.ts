const OFFSETS_PATH = "OFFSETS.ts";
const STATE_MATRIX_PATH = "STATE_MATRIX.ts";
const GLYPH_BUFFER_PATH = "GLYPH_BUFFER.ts";
const CONTROL_QUEUE_PATH = "CONTROL_INTENT_QUEUE.ts";
const AVATAR_ENGINE_PATH = "AVATAR_ENGINE.ts";
const PULSE_PATH = "PULSE.ts";
const SYSTEM_START_PATH = "SYSTEM_START.ts";
const ASSEMBLY_PATH = "assembly/index.ts";
const ROADMAP_PATH = "REDUCTION_METABOLISM_ROADMAP.md";
const TRANSITION_PATH = "docs/migration/OMEGA_TRANSITION_PLAN.md";

type Violation = {
  file: string;
  reason: string;
};

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  violations: Violation[],
) => {
  if (!source.includes(snippet)) {
    violations.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const [
    offsets,
    stateMatrix,
    glyphBuffer,
    controlQueue,
    avatar,
    pulse,
    system,
    assembly,
    roadmap,
    transition,
  ] = await Promise.all([
    Deno.readTextFile(OFFSETS_PATH),
    Deno.readTextFile(STATE_MATRIX_PATH),
    Deno.readTextFile(GLYPH_BUFFER_PATH),
    Deno.readTextFile(CONTROL_QUEUE_PATH),
    Deno.readTextFile(AVATAR_ENGINE_PATH),
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(ASSEMBLY_PATH),
    Deno.readTextFile(ROADMAP_PATH),
    Deno.readTextFile(TRANSITION_PATH),
  ]);

  requireSnippet(
    offsets,
    "GLYPH_HEADER_OFFSET",
    OFFSETS_PATH,
    "Offsets must reserve shared lattice space for glyph header transport",
    violations,
  );
  requireSnippet(
    offsets,
    "GLYPH_PAYLOAD_OFFSET",
    OFFSETS_PATH,
    "Offsets must reserve shared lattice payload space for glyph transport",
    violations,
  );
  requireSnippet(
    stateMatrix,
    "glyphHeaders",
    STATE_MATRIX_PATH,
    "State matrix must expose glyph header view",
    violations,
  );
  requireSnippet(
    stateMatrix,
    "glyphPayload",
    STATE_MATRIX_PATH,
    "State matrix must expose glyph payload view",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "depositPheromone",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must support pheromone deposits",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "depositPlasmid",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must support plasmid deposits",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "tick:",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must support host decay/diffusion ticks",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "STATE_MATRIX.signalGrid",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must internalize signal grid as an internal emission source",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "STATE_MATRIX.memoryGrid",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must internalize memory grid as an internal emission source",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "emitAtomPheromone",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must support atom-driven pheromone emission",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "emitAtomPlasmid",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must support atom-driven plasmid emission",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "atomRolePheromone",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must expose role-shaped pheromone emission counters",
    violations,
  );
  requireSnippet(
    glyphBuffer,
    "atomRolePlasmid",
    GLYPH_BUFFER_PATH,
    "Glyph buffer must expose role-shaped plasmid emission counters",
    violations,
  );
  requireSnippet(
    avatar,
    "GLYPH_BUFFER.depositPheromone",
    AVATAR_ENGINE_PATH,
    "Avatar pheromone ingress must seed internal glyph transport",
    violations,
  );
  requireSnippet(
    controlQueue,
    "GLYPH_BUFFER.depositPlasmid",
    CONTROL_QUEUE_PATH,
    "Plasmid ingress must seed internal glyph transport",
    violations,
  );
  requireSnippet(
    pulse,
    "GLYPH_BUFFER.tick(currentTick)",
    PULSE_PATH,
    "Host lock must advance internal glyph transport",
    violations,
  );
  requireSnippet(
    pulse,
    "emitInternalGlyphsFromActiveAtoms(currentTick, activeIdx)",
    PULSE_PATH,
    "Host lock must allow active atoms to seed glyph transport internally",
    violations,
  );
  requireSnippet(
    pulse,
    "STATE_MATRIX.ROLE_GUARDIAN",
    PULSE_PATH,
    "Internal glyph emission policy must be role-aware",
    violations,
  );
  requireSnippet(
    pulse,
    "STATE_MATRIX.ROLE_ARCHITECT",
    PULSE_PATH,
    "Internal glyph emission policy must shape plasmid secretion by role",
    violations,
  );
  requireSnippet(
    system,
    "glyph_transport",
    SYSTEM_START_PATH,
    "Telemetry or physiology observer surfaces must expose glyph transport state",
    violations,
  );
  requireSnippet(
    assembly,
    "GLYPH_HEADER_OFF",
    ASSEMBLY_PATH,
    "WASM runtime must know glyph buffer offset",
    violations,
  );
  requireSnippet(
    assembly,
    "getGlyphInfluence",
    ASSEMBLY_PATH,
    "WASM trophism must read glyph influence",
    violations,
  );
  requireSnippet(
    roadmap,
    "Stage 5                         | in progress",
    ROADMAP_PATH,
    "Roadmap must mark Stage 5 as in progress once internal glyph transport is live",
    violations,
  );
  requireSnippet(
    transition,
    "GLYPH_BUFFER",
    TRANSITION_PATH,
    "Transition plan must describe the internal glyph buffer path",
    violations,
  );

  if (violations.length > 0) {
    console.error("[transport-internalization] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[transport-internalization] contract guard passed.");
};

await main();

const ASSEMBLY_PATH = "src/ontology/core/pulse_orchestrator.md";
const WORKER_PATH = "src/02/PULSE_WORKER.ts";
const PULSE_PATH = "src/02/PULSE.ts";
const SYSTEM_PATH = "src/07/02/SYSTEM_START.ts";

type Violation = {
  file: string;
  reason: string;
};

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  out: Violation[],
) => {
  if (!source.includes(snippet)) {
    out.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const [assembly, worker, pulse, system] = await Promise.all([
    Deno.readTextFile(ASSEMBLY_PATH),
    Deno.readTextFile(WORKER_PATH),
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_PATH),
  ]);

  requireSnippet(
    assembly,
    "spatialHashOverflowCount",
    ASSEMBLY_PATH,
    "WASM kernel must track spatial hash overflow count",
    violations,
  );
  requireSnippet(
    assembly,
    "spatialHashMaxCellCount",
    ASSEMBLY_PATH,
    "WASM kernel must track spatial hash max cell occupancy",
    violations,
  );
  requireSnippet(
    assembly,
    "get_spatial_hash_overflow_count",
    ASSEMBLY_PATH,
    "WASM kernel must export overflow metric",
    violations,
  );
  requireSnippet(
    assembly,
    "get_spatial_hash_max_cell_count",
    ASSEMBLY_PATH,
    "WASM kernel must export max cell metric",
    violations,
  );

  requireSnippet(
    worker,
    "get_spatial_hash_overflow_count_fn",
    WORKER_PATH,
    "Worker must bind spatial hash overflow export",
    violations,
  );
  requireSnippet(
    worker,
    "overflowCount",
    WORKER_PATH,
    "Worker HASH_DONE payload must include overflow count",
    violations,
  );
  requireSnippet(
    worker,
    "maxCellCount",
    WORKER_PATH,
    "Worker HASH_DONE payload must include max cell count",
    violations,
  );

  requireSnippet(
    pulse,
    "getSpatialHashState",
    PULSE_PATH,
    "Pulse runtime must expose spatial hash runtime guard",
    violations,
  );
  requireSnippet(
    pulse,
    "overflowRatio",
    PULSE_PATH,
    "Pulse runtime must compute spatial hash overflow ratio",
    violations,
  );
  requireSnippet(
    pulse,
    'type: "BUILD_SPATIAL_HASH"',
    PULSE_PATH,
    "Pulse tick must gather spatial hash telemetry every build",
    violations,
  );

  requireSnippet(
    system,
    "spatial_hash_guard",
    SYSTEM_PATH,
    "Telemetry endpoint must expose spatial hash guard section",
    violations,
  );

  if (violations.length > 0) {
    console.error("[spatial-hash-guard] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[spatial-hash-guard] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

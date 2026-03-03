type ExportManifest = {
  core_entry_files: string[];
};

type Violation = {
  file: string;
  reason: string;
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";
const TELEMETRY_PATH = "MUTATION_TELEMETRY.ts";
const PULSE_PATH = "PULSE.ts";
const ORACLE_PATH = "SOVEREIGN_ORACLE.ts";

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

  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const manifest = JSON.parse(manifestRaw) as ExportManifest;
  const coreFiles = Array.isArray(manifest.core_entry_files)
    ? manifest.core_entry_files
    : [];
  if (!coreFiles.includes(TELEMETRY_PATH)) {
    violations.push({
      file: MANIFEST_PATH,
      reason: `core_entry_files must include ${TELEMETRY_PATH}`,
    });
  }

  const telemetrySource = await Deno.readTextFile(TELEMETRY_PATH);
  requireSnippet(
    telemetrySource,
    "OMEGA_MUTATION_TELEMETRY",
    TELEMETRY_PATH,
    "Telemetry module must expose env-gated switch",
    violations,
  );
  requireSnippet(
    telemetrySource,
    "flushIfDue",
    TELEMETRY_PATH,
    "Telemetry module must provide periodic flush",
    violations,
  );

  const pulse = await Deno.readTextFile(PULSE_PATH);
  requireSnippet(
    pulse,
    'import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";',
    PULSE_PATH,
    "PULSE must import mutation telemetry",
    violations,
  );
  requireSnippet(
    pulse,
    'lane: "internal_host"',
    PULSE_PATH,
    "PULSE must record internal host lane mutations",
    violations,
  );
  requireSnippet(
    pulse,
    'lane: "canonical_gate"',
    PULSE_PATH,
    "PULSE must mark canonical gate audit lane",
    violations,
  );
  requireSnippet(
    pulse,
    "MUTATION_TELEMETRY.flushIfDue(currentTick);",
    PULSE_PATH,
    "PULSE must flush mutation telemetry periodically",
    violations,
  );

  const oracle = await Deno.readTextFile(ORACLE_PATH);
  requireSnippet(
    oracle,
    'import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";',
    ORACLE_PATH,
    "Oracle must import mutation telemetry",
    violations,
  );
  requireSnippet(
    oracle,
    'lane: "internal_oracle"',
    ORACLE_PATH,
    "Oracle writes must be tagged as internal_oracle lane",
    violations,
  );
  requireSnippet(
    oracle,
    'kind: "oracle_head_mutation"',
    ORACLE_PATH,
    "Oracle must track genome head rewrites",
    violations,
  );
  requireSnippet(
    oracle,
    'kind: "oracle_whisper_broadcast"',
    ORACLE_PATH,
    "Oracle must track memory-grid whisper writes",
    violations,
  );
  if (oracle.includes("console.")) {
    violations.push({
      file: ORACLE_PATH,
      reason: "Oracle runtime path must use LOGGER instead of console.*",
    });
  }

  if (violations.length > 0) {
    console.error("[mutation-telemetry] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[mutation-telemetry] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

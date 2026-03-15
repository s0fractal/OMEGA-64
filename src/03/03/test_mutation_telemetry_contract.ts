import { resolveSourcePath } from "../../resolve_source.ts";
import { parse } from "jsr:@std/jsonc";
type ExportManifest = {
  core_entry_files: string[];
};

type Violation = {
  file: string;
  reason: string;
};

const MANIFEST_PATH = "deno.jsonc";
const TELEMETRY_PATH = await resolveSourcePath("MUTATION_TELEMETRY.ts");
const PULSE_PATH = await resolveSourcePath("PULSE.ts");
const ORACLE_PATH = await resolveSourcePath("SOVEREIGN_ORACLE.ts");
const POLICY_PATH = await resolveSourcePath("runtime_policy.md");

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
  const manifest = parse(manifestRaw).omega as ExportManifest;
  const coreFilesRaw = Array.isArray(manifest.core_entry_files)
    ? manifest.core_entry_files
    : [];
  
  const coreFiles: string[] = [];
  for (const name of coreFilesRaw) {
    try {
      coreFiles.push(await resolveSourcePath(name));
    } catch {
      coreFiles.push(name);
    }
  }

  if (!coreFiles.includes(TELEMETRY_PATH)) {
    violations.push({
      file: MANIFEST_PATH,
      reason: `core_entry_files must include ${TELEMETRY_PATH}`,
    });
  }

  const telemetrySource = await Deno.readTextFile(TELEMETRY_PATH);
  const policySource = await Deno.readTextFile(POLICY_PATH);
  requireSnippet(
    policySource,
    "OMEGA_MUTATION_TELEMETRY",
    POLICY_PATH,
    "Telemetry module must expose env-gated switch",
    violations,
  );
  requireSnippet(
    telemetrySource,
    "RUNTIME_POLICY.telemetry.enabled",
    TELEMETRY_PATH,
    "Telemetry module must source enabled switch from runtime policy",
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
    "akashaDelegate",
    PULSE_PATH,
    "PULSE must use the akasha delegate for telemetry",
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
    "akashaDelegate?.flushMutationTelemetry(currentTick);",
    PULSE_PATH,
    "PULSE must flush mutation telemetry periodically via delegate",
    violations,
  );

  const oracle = await Deno.readTextFile(ORACLE_PATH);
  requireSnippet(
    oracle,
    'delegate?.recordTelemetry',
    ORACLE_PATH,
    "Oracle must use the akasha delegate for telemetry",
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

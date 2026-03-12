import { evaluateArchitectPlasmidReduction, normalizeArchitectPlasmidExecutionMode } from "@02";
import { STATE_MATRIX } from "@00";

const RUNTIME_POLICY_PATH = "03_governance/RUNTIME_POLICY.ts";
const PULSE_PATH = "02_metabolism/PULSE.ts";
const SYSTEM_START_PATH = "07_meta/02_runners/SYSTEM_START.ts";
const ROADMAP_PATH = "63_necropolis/old/docs/REDUCTION_METABOLISM_ROADMAP.md";
const TRANSITION_PATH = "63_necropolis/old/docs/docs/migration/OMEGA_TRANSITION_PLAN.md";
const BRIDGE_PATH = "02_metabolism/PULSE.ts";

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
    runtimePolicy,
    pulse,
    system,
    roadmap,
    transition,
    bridge,
  ] = await Promise.all([
    Deno.readTextFile(RUNTIME_POLICY_PATH),
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(ROADMAP_PATH),
    Deno.readTextFile(TRANSITION_PATH),
    Deno.readTextFile(BRIDGE_PATH),
  ]);

  requireSnippet(
    runtimePolicy,
    "OMEGA_ARCHITECT_PLASMID_EXECUTION_MODE",
    RUNTIME_POLICY_PATH,
    "Runtime policy must expose an architect plasmid execution mode knob",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "architectPlasmidExecutionMode",
    RUNTIME_POLICY_PATH,
    "Architect plasmid execution mode must be surfaced in pulse policy",
    violations,
  );
  requireSnippet(
    pulse,
    "architectPlasmidAllowedByExecutionMode",
    PULSE_PATH,
    "PULSE must route architect plasmid emission through the Stage 8 bridge",
    violations,
  );
  requireSnippet(
    pulse,
    "getArchitectPlasmidHybridState",
    PULSE_PATH,
    "PULSE must expose architect plasmid hybrid telemetry",
    violations,
  );
  requireSnippet(
    system,
    "architect_plasmid_hybrid",
    SYSTEM_START_PATH,
    "Observer telemetry must surface architect plasmid hybrid state",
    violations,
  );
  requireSnippet(
    bridge,
    "evaluateArchitectPlasmidReduction",
    BRIDGE_PATH,
    "Bridge file must expose bounded architect reduction evaluation",
    violations,
  );
  requireSnippet(
    roadmap,
    "architect plasmid emission",
    ROADMAP_PATH,
    "Roadmap must document the second hybrid slit",
    violations,
  );
  requireSnippet(
    transition,
    "architect plasmid emission",
    TRANSITION_PATH,
    "Transition plan must document the second hybrid slit",
    violations,
  );

  if (normalizeArchitectPlasmidExecutionMode(undefined) !== "shadow-reduce") {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Default architect plasmid mode must be shadow-reduce for safe rollout",
    });
  }

  const emit = evaluateArchitectPlasmidReduction({
    script: STATE_MATRIX.getArchitectScript(),
    neuralCoherence: 200,
  });
  if (
    emit.status !== "ok" || emit.branch !== "emit" ||
    emit.plasmidAllowed !== true || emit.buildCount < 1
  ) {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Canonical architect script must stay on the emit branch and allow plasmid emission",
    });
  }

  const suppress = evaluateArchitectPlasmidReduction({
    script: STATE_MATRIX.getGuardianScript(),
    neuralCoherence: 200,
  });
  if (
    suppress.status !== "ok" || suppress.branch !== "suppress" ||
    suppress.plasmidAllowed !== false || suppress.buildCount !== 0
  ) {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Guardian stable branch must suppress architect plasmid emission under coherent fields",
    });
  }

  const fallback = evaluateArchitectPlasmidReduction({
    script: new Uint8Array([0xFF, 0, 0]),
    neuralCoherence: 200,
  });
  if (fallback.status !== "fallback") {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Unmapped architect scripts must fail open through explicit fallback",
    });
  }

  if (violations.length > 0) {
    console.error("[architect-plasmid-hybrid] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[architect-plasmid-hybrid] contract guard passed.");
};

await main();

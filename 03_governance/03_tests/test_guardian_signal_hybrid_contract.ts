import { evaluateGuardianSignalReduction, normalizeGuardianSignalExecutionMode } from "../../02_metabolism/mod.ts";
import { STATE_MATRIX } from "../../00_substrate/mod.ts";

const RUNTIME_POLICY_PATH = "03_governance/RUNTIME_POLICY.ts";
const PULSE_PATH = "02_metabolism/PULSE.ts";
const SYSTEM_START_PATH = "07_meta/02_runners/SYSTEM_START.ts";
const ROADMAP_PATH = "REDUCTION_METABOLISM_ROADMAP.md";
const TRANSITION_PATH = "docs/migration/OMEGA_TRANSITION_PLAN.md";
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
    "OMEGA_GUARDIAN_SIGNAL_EXECUTION_MODE",
    RUNTIME_POLICY_PATH,
    "Runtime policy must expose a guardian signal execution mode knob",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "guardianSignalExecutionMode",
    RUNTIME_POLICY_PATH,
    "Guardian signal execution mode must be surfaced in pulse policy",
    violations,
  );
  requireSnippet(
    pulse,
    "guardianPheromoneAllowedByExecutionMode",
    PULSE_PATH,
    "PULSE must route guardian pheromone emission through the Stage 8 bridge",
    violations,
  );
  requireSnippet(
    pulse,
    "getGuardianSignalHybridState",
    PULSE_PATH,
    "PULSE must expose guardian signal hybrid telemetry",
    violations,
  );
  requireSnippet(
    system,
    "guardian_signal_hybrid",
    SYSTEM_START_PATH,
    "Observer telemetry must surface guardian hybrid state",
    violations,
  );
  requireSnippet(
    bridge,
    "evaluateGuardianSignalReduction",
    BRIDGE_PATH,
    "Bridge file must expose bounded guardian reduction evaluation",
    violations,
  );
  requireSnippet(
    roadmap,
    "Stage 8+                        | in progress",
    ROADMAP_PATH,
    "Roadmap must mark Stage 8 as in progress once the first slit exists",
    violations,
  );
  requireSnippet(
    transition,
    "guardian pheromone emission",
    TRANSITION_PATH,
    "Transition plan must document the chosen first hybrid slit",
    violations,
  );

  if (normalizeGuardianSignalExecutionMode(undefined) !== "shadow-reduce") {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Default guardian signal mode must be shadow-reduce for safe rollout",
    });
  }

  const stable = evaluateGuardianSignalReduction({
    script: STATE_MATRIX.getGuardianScript(),
    neuralCoherence: 200,
  });
  if (
    stable.status !== "ok" || stable.branch !== "stable" ||
    stable.signalAllowed !== true || stable.buildCount !== 0
  ) {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Stable guardian branch must stay signaling-only and allow pheromone emission",
    });
  }

  const repair = evaluateGuardianSignalReduction({
    script: STATE_MATRIX.getGuardianScript(),
    neuralCoherence: 0,
  });
  if (
    repair.status !== "ok" || repair.branch !== "repair" ||
    repair.signalAllowed !== false || repair.buildCount < 1
  ) {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Low-coherence guardian branch must enter repair mode and suppress pheromone emission",
    });
  }

  const fallback = evaluateGuardianSignalReduction({
    script: new Uint8Array([0xFF, 0, 0]),
    neuralCoherence: 200,
  });
  if (fallback.status !== "fallback") {
    violations.push({
      file: BRIDGE_PATH,
      reason:
        "Unmapped guardian scripts must fail closed into explicit fallback",
    });
  }

  if (violations.length > 0) {
    console.error("[guardian-signal-hybrid] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[guardian-signal-hybrid] contract guard passed.");
};

await main();

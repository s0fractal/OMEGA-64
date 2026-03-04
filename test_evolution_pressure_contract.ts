const PULSE_PATH = "PULSE.ts";
const POLICY_PATH = "RUNTIME_POLICY.ts";

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
  const [pulse, policy] = await Promise.all([
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(POLICY_PATH),
  ]);

  requireSnippet(
    policy,
    "OMEGA_NOVELTY_PRESSURE",
    POLICY_PATH,
    "Runtime policy must expose novelty pressure env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_SYMBIOSIS_PRESSURE",
    POLICY_PATH,
    "Runtime policy must expose symbiosis pressure env hook",
    violations,
  );
  requireSnippet(
    policy,
    "noveltyPressure: pulseNoveltyPressure",
    POLICY_PATH,
    "Runtime policy pulse section must export novelty pressure value",
    violations,
  );
  requireSnippet(
    policy,
    "symbiosisPressure: pulseSymbiosisPressure",
    POLICY_PATH,
    "Runtime policy pulse section must export symbiosis pressure value",
    violations,
  );

  requireSnippet(
    pulse,
    "applyEvolutionPressureTerms",
    PULSE_PATH,
    "Pulse host-lock phase must define deterministic evolution pressure pass",
    violations,
  );
  requireSnippet(
    pulse,
    "NOVELTY_PRESSURE",
    PULSE_PATH,
    "Pulse must source novelty pressure coefficient from runtime policy",
    violations,
  );
  requireSnippet(
    pulse,
    "SYMBIOSIS_PRESSURE",
    PULSE_PATH,
    "Pulse must source symbiosis pressure coefficient from runtime policy",
    violations,
  );
  requireSnippet(
    pulse,
    "evolution_pressure_adjust",
    PULSE_PATH,
    "Pulse pressure pass must report telemetry for host-side adjustments",
    violations,
  );
  requireSnippet(
    pulse,
    "applyEvolutionPressureTerms(currentTick, activeIdx);",
    PULSE_PATH,
    "Pulse tick must apply evolution pressure terms in host-lock window",
    violations,
  );

  if (violations.length > 0) {
    console.error("[evolution-pressure] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[evolution-pressure] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

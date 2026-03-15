import { resolveSourcePath } from "../../resolve_source.ts";
const POLICY_PATH = await resolveSourcePath("runtime_policy.md");
const PULSE_PATH = await resolveSourcePath("PULSE.ts");

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
  const [policy, pulse] = await Promise.all([
    Deno.readTextFile(POLICY_PATH),
    Deno.readTextFile(PULSE_PATH),
  ]);

  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_ENABLE",
    POLICY_PATH,
    "Runtime policy must expose homeostasis enable env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_TARGET_ENERGY",
    POLICY_PATH,
    "Runtime policy must expose homeostasis target energy env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_BAND",
    POLICY_PATH,
    "Runtime policy must expose homeostasis band env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_MAX_DELTA",
    POLICY_PATH,
    "Runtime policy must expose homeostasis max delta env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_OVERFLOW_THRESHOLD",
    POLICY_PATH,
    "Runtime policy must expose homeostasis overflow threshold env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_STARVATION_FLOOR",
    POLICY_PATH,
    "Runtime policy must expose homeostasis starvation floor env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_BASE_TAX",
    POLICY_PATH,
    "Runtime policy must expose homeostasis base tax env hook",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_HOMEOSTASIS_SUBSIDY_ENABLE",
    POLICY_PATH,
    "Runtime policy must expose homeostasis subsidy toggle env hook",
    violations,
  );
  requireSnippet(
    policy,
    "homeostasis:",
    POLICY_PATH,
    "Runtime policy pulse section must export homeostasis block",
    violations,
  );

  requireSnippet(
    pulse,
    "applyEnergyHomeostasisTerms",
    PULSE_PATH,
    "Pulse host-lock phase must define deterministic homeostasis pass",
    violations,
  );
  requireSnippet(
    pulse,
    "HOMEOSTASIS_POLICY",
    PULSE_PATH,
    "Pulse must source homeostasis coefficients from runtime policy",
    violations,
  );
  requireSnippet(
    pulse,
    "HOMEOSTASIS_BASE_TAX",
    PULSE_PATH,
    "Pulse homeostasis pass must apply explicit base tax policy",
    violations,
  );
  requireSnippet(
    pulse,
    "HOMEOSTASIS_SUBSIDY_ENABLED",
    PULSE_PATH,
    "Pulse homeostasis pass must gate subsidy path via policy",
    violations,
  );
  requireSnippet(
    pulse,
    "energy_homeostasis_adjust",
    PULSE_PATH,
    "Pulse homeostasis pass must report telemetry adjustments",
    violations,
  );
  requireSnippet(
    pulse,
    "applyEnergyHomeostasisTerms(",
    PULSE_PATH,
    "Pulse tick must apply homeostasis in host-lock window",
    violations,
  );

  if (violations.length > 0) {
    console.error("[homeostasis-contract] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[homeostasis-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

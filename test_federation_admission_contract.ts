const QUEUE_PATH = "CONTROL_INTENT_QUEUE.ts";
const POLICY_PATH = "RUNTIME_POLICY.ts";
const SYSTEM_PATH = "SYSTEM_START.ts";
const UI_PATH = "ui/index.html";

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

  const [queue, policy, system, ui] = await Promise.all([
    Deno.readTextFile(QUEUE_PATH),
    Deno.readTextFile(POLICY_PATH),
    Deno.readTextFile(SYSTEM_PATH),
    Deno.readTextFile(UI_PATH),
  ]);

  requireSnippet(
    queue,
    "evaluateFederateAdmission",
    QUEUE_PATH,
    "Control queue must evaluate federated ingress before enqueue",
    violations,
  );
  requireSnippet(
    queue,
    "FEDERATION_ADMISSION_REJECTED",
    QUEUE_PATH,
    "Control queue must expose reject status for unsafe federation ingress",
    violations,
  );
  requireSnippet(
    queue,
    "federation_admission_hybridize",
    QUEUE_PATH,
    "Control queue telemetry must track hybridized ingress",
    violations,
  );
  requireSnippet(
    queue,
    "getFederationAdmissionState",
    QUEUE_PATH,
    "Control queue must expose federation admission latest/history state",
    violations,
  );

  requireSnippet(
    policy,
    "OMEGA_FEDERATION_ADMISSION_ENABLE",
    POLICY_PATH,
    "Runtime policy must expose federation admission enable env gate",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_FEDERATION_HYBRIDIZE_ENABLE",
    POLICY_PATH,
    "Runtime policy must expose federation hybridization env gate",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_FEDERATION_DEGRADE_ENERGY_RATIO",
    POLICY_PATH,
    "Runtime policy must expose federation degrade energy ratio env gate",
    violations,
  );

  requireSnippet(
    system,
    "federation_admission",
    SYSTEM_PATH,
    "System telemetry must expose federation admission envelope",
    violations,
  );
  requireSnippet(
    system,
    '"/federate/admission"',
    SYSTEM_PATH,
    "System API must expose federation admission endpoint",
    violations,
  );

  requireSnippet(
    ui,
    "human-federation-admission",
    UI_PATH,
    "UI human channel must render federation admission line",
    violations,
  );
  requireSnippet(
    ui,
    "buildFederationAdmissionSummary",
    UI_PATH,
    "UI must summarize federation admission decisions",
    violations,
  );

  if (violations.length > 0) {
    console.error("[federation-admission] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[federation-admission] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

const QUEUE_PATH = "CONTROL_INTENT_QUEUE.ts";
const POLICY_PATH = "RUNTIME_POLICY.ts";
const P2P_PATH = "P2P_FEDERATION.ts";
const SYSTEM_PATH = "SYSTEM_START.ts";
const DAEMON_PATH = "OMEGA_DAEMON.ts";
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

  const [queue, policy, p2p, system, daemon, ui] = await Promise.all([
    Deno.readTextFile(QUEUE_PATH),
    Deno.readTextFile(POLICY_PATH),
    Deno.readTextFile(P2P_PATH),
    Deno.readTextFile(SYSTEM_PATH),
    Deno.readTextFile(DAEMON_PATH),
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
    queue,
    "behaviorInvariantDistance",
    QUEUE_PATH,
    "Control queue must score federated ingress against behavior invariants",
    violations,
  );
  requireSnippet(
    queue,
    "PEER_BEHAVIOR_PROFILE_MISSING",
    QUEUE_PATH,
    "Control queue must account for missing peer behavior profile",
    violations,
  );
  requireSnippet(
    queue,
    "localBehaviorInvariant",
    QUEUE_PATH,
    "Federation admission snapshot must preserve local behavior invariant",
    violations,
  );
  requireSnippet(
    queue,
    "parseCodexProfile",
    QUEUE_PATH,
    "Control queue must parse peer codex profile",
    violations,
  );
  requireSnippet(
    queue,
    "codexDistance",
    QUEUE_PATH,
    "Control queue must score codex lineage distance",
    violations,
  );
  requireSnippet(
    queue,
    "PEER_CODEX_PROFILE_MISSING",
    QUEUE_PATH,
    "Control queue must account for missing peer codex profile",
    violations,
  );
  requireSnippet(
    queue,
    "localCodexLabel",
    QUEUE_PATH,
    "Federation admission snapshot must preserve local codex lineage label",
    violations,
  );
  requireSnippet(
    queue,
    "FederationPolicyFragment",
    QUEUE_PATH,
    "Control queue must define explicit policy-fragment type",
    violations,
  );
  requireSnippet(
    queue,
    "collapsePolicyRatios",
    QUEUE_PATH,
    "Control queue must collapse policy fragments into tax/subsidy ratios",
    violations,
  );
  requireSnippet(
    queue,
    "policyEnergyRatio",
    QUEUE_PATH,
    "Federation admission snapshot must export policy energy ratio",
    violations,
  );
  requireSnippet(
    queue,
    "federation_policy_fragment_applied",
    QUEUE_PATH,
    "Control queue telemetry must track applied policy fragments",
    violations,
  );

  requireSnippet(
    p2p,
    "behaviorProfile",
    P2P_PATH,
    "Federation egress packets must carry behavior profile metadata",
    violations,
  );
  requireSnippet(
    p2p,
    "captureBehaviorFrame",
    P2P_PATH,
    "Federation egress must source behavior profile from semantic membrane",
    violations,
  );
  requireSnippet(
    p2p,
    "codexProfile",
    P2P_PATH,
    "Federation egress packets must carry codex lineage profile",
    violations,
  );
  requireSnippet(
    p2p,
    "lookupLineageProfile",
    P2P_PATH,
    "Federation egress must source codex lineage profile from codex index",
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
    system,
    "localBehavior",
    SYSTEM_PATH,
    "System ingress must pass local behavior context into federation admission",
    violations,
  );
  requireSnippet(
    system,
    "localContext.codex",
    SYSTEM_PATH,
    "System ingress must pass local codex lineage context into federation admission",
    violations,
  );
  requireSnippet(
    daemon,
    "federation_admission",
    DAEMON_PATH,
    "Daemon telemetry parser must consume federation admission envelope",
    violations,
  );
  requireSnippet(
    daemon,
    "federation_admission_vector",
    DAEMON_PATH,
    "Daemon invariant frame must emit federation admission vector",
    violations,
  );
  requireSnippet(
    daemon,
    "codexDistance",
    DAEMON_PATH,
    "Daemon invariant frame must retain codex-distance signal",
    violations,
  );
  requireSnippet(
    daemon,
    "policyRatio=",
    DAEMON_PATH,
    "Daemon invariant frame must include policy tax/subsidy ratio evidence",
    violations,
  );
  requireSnippet(
    daemon,
    "policyFragments",
    DAEMON_PATH,
    "Daemon telemetry parser must ingest policy fragment list",
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
  requireSnippet(
    ui,
    "codexΔ",
    UI_PATH,
    "UI federation summary must include codex distance projection",
    violations,
  );
  requireSnippet(
    ui,
    "fragments=",
    UI_PATH,
    "UI federation summary must include applied policy fragment count",
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

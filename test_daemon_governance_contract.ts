const SYSTEM_START_PATH = "SYSTEM_START.ts";
const CONTROL_QUEUE_PATH = "CONTROL_INTENT_QUEUE.ts";
const TELEMETRY_PATH = "MUTATION_TELEMETRY.ts";

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
  const system = await Deno.readTextFile(SYSTEM_START_PATH);
  const queue = await Deno.readTextFile(CONTROL_QUEUE_PATH);
  const telemetry = await Deno.readTextFile(TELEMETRY_PATH);

  requireSnippet(
    system,
    "DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW",
    SYSTEM_START_PATH,
    "Daemon ingress must enforce per-window action budget",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_SAFE_MIN_POPULATION",
    SYSTEM_START_PATH,
    "Daemon ingress must enforce safe-mode population floor",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_SAFE_MIN_AVG_ENERGY",
    SYSTEM_START_PATH,
    "Daemon ingress must enforce safe-mode energy floor",
    violations,
  );
  requireSnippet(
    system,
    "evaluatePlasmidPolicy",
    SYSTEM_START_PATH,
    "Daemon ingress must enforce plasmid opcode allowlist policy",
    violations,
  );
  requireSnippet(
    system,
    "queueDaemonAudit",
    SYSTEM_START_PATH,
    "Daemon ingress must queue deferred effect audits",
    violations,
  );
  requireSnippet(
    system,
    "evaluateInvariantAdmission",
    SYSTEM_START_PATH,
    "Daemon ingress must evaluate invariant drift before applying external actions",
    violations,
  );
  requireSnippet(
    system,
    "planInvariantIngress",
    SYSTEM_START_PATH,
    "Daemon ingress must degrade high-drift actions instead of hard-blocking",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_DEGRADED",
    SYSTEM_START_PATH,
    "Daemon ingress must audit degraded invariant admissions",
    violations,
  );
  requireSnippet(
    system,
    "AKASHA_CODEX.recordDaemonAdmission",
    SYSTEM_START_PATH,
    "Daemon ingress must publish degraded admission reasons into codex chronicles",
    violations,
  );
  requireSnippet(
    system,
    "setLatestDaemonAdmission",
    SYSTEM_START_PATH,
    "Daemon ingress must track latest admission state for telemetry observers",
    violations,
  );
  requireSnippet(
    system,
    "last_admission",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish latest admission summary",
    violations,
  );
  requireSnippet(
    system,
    "flushDaemonAuditEffects(",
    SYSTEM_START_PATH,
    "Daemon loop must flush deferred effect audits",
    violations,
  );
  requireSnippet(
    system,
    '"external_daemon"',
    SYSTEM_START_PATH,
    "Daemon inject route must enqueue intents with daemon source lane",
    violations,
  );

  requireSnippet(
    queue,
    "enqueuePlasmid",
    CONTROL_QUEUE_PATH,
    "Control queue must expose plasmid ingress lane",
    violations,
  );
  requireSnippet(
    queue,
    'source: "external_ingress" | "external_daemon"',
    CONTROL_QUEUE_PATH,
    "Control queue intents must track daemon vs ingress source",
    violations,
  );
  requireSnippet(
    queue,
    "telemetryLaneForSource",
    CONTROL_QUEUE_PATH,
    "Control queue apply path must preserve daemon telemetry lane",
    violations,
  );

  requireSnippet(
    telemetry,
    '"external_daemon"',
    TELEMETRY_PATH,
    "Mutation telemetry must support daemon lane tracking",
    violations,
  );

  if (violations.length > 0) {
    console.error("[daemon-governance] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[daemon-governance] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

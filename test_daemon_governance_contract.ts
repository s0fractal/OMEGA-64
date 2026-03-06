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
    "DAEMON_CODEX_LINEAGE_LONGEVITY_EPOCHS",
    SYSTEM_START_PATH,
    "Daemon ingress must codify Codex lineage longevity guard threshold",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_CODEX_LINEAGE_PEAK_SHARE",
    SYSTEM_START_PATH,
    "Daemon ingress must codify Codex lineage dominance guard threshold",
    violations,
  );
  requireSnippet(
    system,
    "codexLineageGuardScore",
    SYSTEM_START_PATH,
    "Daemon ingress must derive Codex lineage guard score in narrative context",
    violations,
  );
  requireSnippet(
    system,
    "codexLineageLabel",
    SYSTEM_START_PATH,
    "Daemon ingress must derive Codex lineage label in narrative context",
    violations,
  );
  requireSnippet(
    system,
    "CODEX_LINEAGE_GUARD_PLASMID",
    SYSTEM_START_PATH,
    "Daemon ingress must include Codex lineage pressure in plasmid admission reasons",
    violations,
  );
  requireSnippet(
    system,
    "codexLineageGuardReasons",
    SYSTEM_START_PATH,
    "Daemon telemetry must preserve codex lineage guard reasons in admission snapshots",
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
    "recordDaemonCodexAdmission(",
    SYSTEM_START_PATH,
    "Daemon ingress must route blocked/degraded admissions through a dedicated codex evidence helper",
    violations,
  );
  requireSnippet(
    system,
    "baseline.glyphTransport",
    SYSTEM_START_PATH,
    "Daemon admission evidence must include runtime glyph transport context",
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
    "DAEMON_ADMISSION_HISTORY_LIMIT",
    SYSTEM_START_PATH,
    "Daemon ingress must bound admission history memory",
    violations,
  );
  requireSnippet(
    system,
    "last_admission_history",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish recent admission history",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_PRESSURE_RING_HISTORY_LIMIT",
    SYSTEM_START_PATH,
    "Daemon governance surface must bound pressure-ring history memory",
    violations,
  );
  requireSnippet(
    system,
    "last_pressure_ring_history",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish recent pressure-ring history",
    violations,
  );
  requireSnippet(
    system,
    "last_policy_update",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish latest daemon-policy update",
    violations,
  );
  requireSnippet(
    system,
    "last_policy_history",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish recent daemon-policy history",
    violations,
  );
  requireSnippet(
    system,
    "ledger_max_plasmid_charge",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish ledger-owned plasmid-charge state",
    violations,
  );
  requireSnippet(
    system,
    "ledger_max_plasmid_charge_persistence",
    SYSTEM_START_PATH,
    "Daemon telemetry surface must publish plasmid-charge persistence state",
    violations,
  );
  requireSnippet(
    system,
    "/api/daemon-policy",
    SYSTEM_START_PATH,
    "Daemon governance surface must expose daemon-policy endpoint",
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
    "AKASHA_CODEX.recordDaemonEffect",
    SYSTEM_START_PATH,
    "Deferred daemon effect audits must publish effect chronicles into codex",
    violations,
  );
  requireSnippet(
    system,
    '"DAEMON_EFFECT_EVAL"',
    SYSTEM_START_PATH,
    "Deferred daemon effect audits must emit effect-evaluation audit events",
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
    system,
    "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
    SYSTEM_START_PATH,
    "Daemon ingress must enforce dynamic plasmid charge cap",
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

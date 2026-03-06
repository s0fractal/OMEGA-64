const SYSTEM_START_PATH = "SYSTEM_START.ts";
const POLICY_PATH = "DAEMON_INGRESS_POLICY.ts";
const AKASHA_SERVER_PATH = "AKASHA_SERVER.ts";
const LEDGER_RUNTIME_PATH = "DAEMON_PHEROMONE_LEDGER_RUNTIME.ts";
const LEDGER_PERSISTENCE_PATH = "DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts";

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

const requireAbsentSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  violations: Violation[],
) => {
  if (source.includes(snippet)) {
    violations.push({ file, reason: `${reason} (present: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const [system, policy, akasha, ledgerRuntime, ledgerPersistence] =
    await Promise.all([
      Deno.readTextFile(SYSTEM_START_PATH),
      Deno.readTextFile(POLICY_PATH),
      Deno.readTextFile(AKASHA_SERVER_PATH),
      Deno.readTextFile(LEDGER_RUNTIME_PATH),
      Deno.readTextFile(LEDGER_PERSISTENCE_PATH),
    ]);

  requireSnippet(
    ledgerRuntime,
    "applyDaemonPheromoneLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Daemon pheromone ledger runtime must provide apply path",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackDaemonPheromoneLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Daemon pheromone ledger runtime must provide rollback path",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "appendDaemonPheromoneLedgerRecordAndMaybeCompact",
    LEDGER_PERSISTENCE_PATH,
    "Daemon pheromone ledger persistence must append and compact durable history",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "hydrateDaemonPheromoneLedgerRuntime",
    LEDGER_PERSISTENCE_PATH,
    "Daemon pheromone ledger persistence must replay records into runtime state",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "DAEMON_PHEROMONE_LEDGER_SNAPSHOT_PATH",
    LEDGER_PERSISTENCE_PATH,
    "Daemon pheromone ledger persistence must expose canonical snapshot path",
    violations,
  );

  requireSnippet(
    policy,
    "syncDaemonIngressMaxPheromoneIntensity",
    POLICY_PATH,
    "Daemon ingress policy must expose runtime sync helper for max pheromone intensity",
    violations,
  );
  requireSnippet(
    policy,
    "resetDaemonIngressMaxPheromoneIntensity",
    POLICY_PATH,
    "Daemon ingress policy must expose reset helper for max pheromone intensity",
    violations,
  );
  requireAbsentSnippet(
    policy,
    "Object.freeze",
    POLICY_PATH,
    "Daemon ingress policy limits must not be frozen once ledger ownership is live",
    violations,
  );

  requireSnippet(
    system,
    "/api/daemon-policy",
    SYSTEM_START_PATH,
    "System runtime must expose daemon policy control endpoint",
    violations,
  );
  requireSnippet(
    system,
    "parseDaemonPolicyIngressEnvelope",
    SYSTEM_START_PATH,
    "System runtime must parse daemon policy ingress payload",
    violations,
  );
  requireSnippet(
    system,
    "applyDaemonPheromonePolicyLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route daemon max pheromone intensity through ledger apply path",
    violations,
  );
  requireSnippet(
    system,
    "rollbackDaemonPheromonePolicyLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route daemon max pheromone intensity through ledger rollback path",
    violations,
  );
  requireSnippet(
    system,
    "syncDaemonPheromonePolicyLedgerHydration",
    SYSTEM_START_PATH,
    "System runtime must hydrate daemon policy ledger state from persistence",
    violations,
  );
  requireSnippet(
    system,
    "ledger_max_pheromone_intensity",
    SYSTEM_START_PATH,
    "System runtime must expose ledger-owned daemon pheromone summary to observers",
    violations,
  );
  requireSnippet(
    system,
    "ledger_max_pheromone_intensity_persistence",
    SYSTEM_START_PATH,
    "System runtime must expose daemon pheromone persistence summary to observers",
    violations,
  );
  requireSnippet(
    system,
    "last_policy_update",
    SYSTEM_START_PATH,
    "System telemetry must expose latest daemon policy update",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_POLICY_ROLLBACK",
    SYSTEM_START_PATH,
    "System runtime must audit daemon policy rollback events distinctly",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
    SYSTEM_START_PATH,
    "System daemon ingress must enforce dynamic pheromone policy limit",
    violations,
  );

  requireSnippet(
    akasha,
    "proxyDaemonPolicy",
    AKASHA_SERVER_PATH,
    "Akasha server must proxy daemon-policy endpoint",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/daemon-policy",
    AKASHA_SERVER_PATH,
    "Akasha REST surface must expose daemon-policy endpoint",
    violations,
  );

  if (violations.length > 0) {
    console.error("[daemon-pheromone-ledger-path] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[daemon-pheromone-ledger-path] contract guard passed.");
};

await main();

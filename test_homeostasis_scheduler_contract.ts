const DAEMON_PATH = "OMEGA_DAEMON.ts";
const PULSE_PATH = "PULSE.ts";
const SYSTEM_START_PATH = "SYSTEM_START.ts";
const AKASHA_SERVER_PATH = "AKASHA_SERVER.ts";

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
  const [daemon, pulse, system, akasha] = await Promise.all([
    Deno.readTextFile(DAEMON_PATH),
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(AKASHA_SERVER_PATH),
  ]);

  requireSnippet(
    pulse,
    "getHomeostasisState",
    PULSE_PATH,
    "Pulse must expose runtime homeostasis state snapshot",
    violations,
  );
  requireSnippet(
    pulse,
    "updateHomeostasisPolicy",
    PULSE_PATH,
    "Pulse must expose runtime homeostasis policy update API",
    violations,
  );
  requireSnippet(
    pulse,
    "homeostasisBaseTaxRuntime",
    PULSE_PATH,
    "Pulse must hold mutable base-tax runtime overlay",
    violations,
  );
  requireSnippet(
    pulse,
    "homeostasisTargetEnergyRuntime",
    PULSE_PATH,
    "Pulse must hold mutable target-energy runtime overlay",
    violations,
  );

  requireSnippet(
    system,
    "/api/homeostasis",
    SYSTEM_START_PATH,
    "System runtime must expose homeostasis control endpoint",
    violations,
  );
  requireSnippet(
    system,
    "parseHomeostasisIngressEnvelope",
    SYSTEM_START_PATH,
    "System runtime must parse daemon homeostasis ingress payload",
    violations,
  );
  requireSnippet(
    system,
    "target_energy",
    SYSTEM_START_PATH,
    "System homeostasis ingress must support dynamic target-energy updates",
    violations,
  );
  requireSnippet(
    system,
    "daemon_homeostasis_update",
    SYSTEM_START_PATH,
    "System runtime must emit telemetry lane events for homeostasis updates",
    violations,
  );
  requireSnippet(
    system,
    "last_homeostasis_update",
    SYSTEM_START_PATH,
    "System telemetry must expose latest homeostasis update context",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_HOMEOSTASIS_HISTORY_LIMIT",
    SYSTEM_START_PATH,
    "System runtime must bound homeostasis update history memory",
    violations,
  );

  requireSnippet(
    daemon,
    "OMEGA_DAEMON_HOMEOSTASIS_ENABLE",
    DAEMON_PATH,
    "Daemon must expose env control for homeostasis scheduler",
    violations,
  );
  requireSnippet(
    daemon,
    "HOMEOSTASIS_URL",
    DAEMON_PATH,
    "Daemon must target homeostasis endpoint",
    violations,
  );
  requireSnippet(
    daemon,
    "maybeControlHomeostasis",
    DAEMON_PATH,
    "Daemon must execute homeostasis control pass per heartbeat",
    violations,
  );
  requireSnippet(
    daemon,
    "postHomeostasisUpdate",
    DAEMON_PATH,
    "Daemon must post homeostasis updates to runtime",
    violations,
  );
  requireSnippet(
    daemon,
    "HOMEOSTASIS_TARGET_CONTROL_ENABLE",
    DAEMON_PATH,
    "Daemon must expose target-energy control toggle for homeostasis scheduler",
    violations,
  );
  requireSnippet(
    daemon,
    "target_energy",
    DAEMON_PATH,
    "Daemon homeostasis payload must support target-energy updates",
    violations,
  );

  requireSnippet(
    akasha,
    "proxyHomeostasis",
    AKASHA_SERVER_PATH,
    "Akasha server must proxy homeostasis calls to system runtime",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/homeostasis",
    AKASHA_SERVER_PATH,
    "Akasha REST surface must expose homeostasis endpoint",
    violations,
  );

  if (violations.length > 0) {
    console.error("[homeostasis-scheduler] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[homeostasis-scheduler] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

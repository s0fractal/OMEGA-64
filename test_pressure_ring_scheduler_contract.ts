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
    "getEvolutionPressureState",
    PULSE_PATH,
    "Pulse must expose evolution pressure state snapshot",
    violations,
  );
  requireSnippet(
    pulse,
    "updateEvolutionPressureRing",
    PULSE_PATH,
    "Pulse must expose runtime pressure-ring update",
    violations,
  );
  requireSnippet(
    pulse,
    "applyEvolutionPressureRing",
    PULSE_PATH,
    "Pulse must maintain ring-derivation path for runtime updates",
    violations,
  );

  requireSnippet(
    system,
    "/api/pressure-ring",
    SYSTEM_START_PATH,
    "System start must expose pressure-ring control endpoint",
    violations,
  );
  requireSnippet(
    system,
    "parsePressureRingIngressEnvelope",
    SYSTEM_START_PATH,
    "System start must parse daemon pressure-ring ingress payloads",
    violations,
  );
  requireSnippet(
    system,
    "daemon_pressure_ring_update",
    SYSTEM_START_PATH,
    "System start must emit telemetry lane events for pressure-ring updates",
    violations,
  );
  requireSnippet(
    system,
    "latestPressureRingUpdate",
    SYSTEM_START_PATH,
    "System start telemetry must include latest pressure-ring update snapshot",
    violations,
  );

  requireSnippet(
    daemon,
    "OMEGA_DAEMON_PHASE_SEASONS_ENABLE",
    DAEMON_PATH,
    "Daemon must expose env control for phase-season scheduler",
    violations,
  );
  requireSnippet(
    daemon,
    "PHASE_SEASONS_STEP_RAD",
    DAEMON_PATH,
    "Daemon must expose tunable phase step",
    violations,
  );
  requireSnippet(
    daemon,
    "PRESSURE_RING_URL",
    DAEMON_PATH,
    "Daemon must target pressure-ring endpoint",
    violations,
  );
  requireSnippet(
    daemon,
    "maybeAdvancePhaseRing",
    DAEMON_PATH,
    "Daemon must run phase-ring advancement pass per heartbeat",
    violations,
  );
  requireSnippet(
    daemon,
    "postPressureRingUpdate",
    DAEMON_PATH,
    "Daemon must send pressure-ring updates to runtime",
    violations,
  );

  requireSnippet(
    akasha,
    "proxyPressureRing",
    AKASHA_SERVER_PATH,
    "Akasha server must proxy pressure-ring calls to system runtime",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/pressure-ring",
    AKASHA_SERVER_PATH,
    "Akasha REST surface must expose pressure-ring endpoint",
    violations,
  );

  if (violations.length > 0) {
    console.error("[pressure-ring-scheduler] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[pressure-ring-scheduler] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

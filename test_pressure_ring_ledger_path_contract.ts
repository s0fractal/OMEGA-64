const PULSE_PATH = "PULSE.ts";
const SYSTEM_START_PATH = "SYSTEM_START.ts";
const LEDGER_RUNTIME_PATH = "PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts";
const LEDGER_PERSISTENCE_PATH = "PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts";

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
  const [pulse, system, ledgerRuntime, ledgerPersistence] = await Promise.all([
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(LEDGER_RUNTIME_PATH),
    Deno.readTextFile(LEDGER_PERSISTENCE_PATH),
  ]);

  requireSnippet(
    ledgerRuntime,
    "applyPressureRingScaleLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Pressure-ring ledger runtime must provide apply path for scale",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackPressureRingScaleLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Pressure-ring ledger runtime must provide rollback path for scale",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackToken",
    LEDGER_RUNTIME_PATH,
    "Pressure-ring ledger runtime must mint rollback tokens",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "appendPressureRingScaleLedgerRecordAndMaybeCompact",
    LEDGER_PERSISTENCE_PATH,
    "Pressure-ring ledger persistence must append and compact durable history",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "hydratePressureRingScaleLedgerRuntime",
    LEDGER_PERSISTENCE_PATH,
    "Pressure-ring ledger persistence must replay records into runtime state",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "PRESSURE_RING_SCALE_LEDGER_SNAPSHOT_PATH",
    LEDGER_PERSISTENCE_PATH,
    "Pressure-ring ledger persistence must expose canonical snapshot path",
    violations,
  );

  requireSnippet(
    pulse,
    '"pulse.pressureRing.scale"',
    PULSE_PATH,
    "Pulse must route pressure-ring scale through genetic ledger key",
    violations,
  );
  requireSnippet(
    pulse,
    "pressureRingScalePersistence",
    PULSE_PATH,
    "Pulse genetic ledger snapshot must expose pressure-ring persistence summary",
    violations,
  );
  requireSnippet(
    pulse,
    "syncPressureRingScaleLedgerHydration",
    PULSE_PATH,
    "Pulse must hydrate pressure-ring ledger-owned state from persistence",
    violations,
  );
  requireAbsentSnippet(
    pulse,
    `update: {
      mode: "set" | "step";
      theta?: number;
      deltaTheta?: number;
      scale?: number;`,
    PULSE_PATH,
    "Pulse pressure-ring overlay must not expose ad-hoc scale path once ledger ownership is live",
    violations,
  );
  requireAbsentSnippet(
    pulse,
    "update.scale",
    PULSE_PATH,
    "Pulse pressure-ring overlay must not mutate scale outside genetic ledger route",
    violations,
  );

  requireSnippet(
    system,
    "rollback_token",
    SYSTEM_START_PATH,
    "System pressure-ring ingress must parse rollback tokens",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.applyGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route pressure-ring scale apply through ledger path",
    violations,
  );
  requireSnippet(
    system,
    'key: "pulse.pressureRing.scale"',
    SYSTEM_START_PATH,
    "System runtime must target the pressure-ring scale ledger key",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.rollbackGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route pressure-ring scale rollback through ledger path",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_PRESSURE_RING_ROLLBACK",
    SYSTEM_START_PATH,
    "System runtime must audit pressure-ring rollback events distinctly",
    violations,
  );
  requireSnippet(
    system,
    "ledger_scale_persistence",
    SYSTEM_START_PATH,
    "System runtime must expose pressure-ring ledger persistence summary to observers",
    violations,
  );

  if (violations.length > 0) {
    console.error("[pressure-ring-ledger-path] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[pressure-ring-ledger-path] contract guard passed.");
};

await main();

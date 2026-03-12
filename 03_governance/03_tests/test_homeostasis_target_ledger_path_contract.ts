const PULSE_PATH = "02_metabolism/PULSE.ts";
const SYSTEM_START_PATH = "07_meta/02_runners/SYSTEM_START.ts";
const LEDGER_RUNTIME_PATH = "HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts";
const LEDGER_PERSISTENCE_PATH = "HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts";

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
    "applyTargetEnergyLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Homeostasis target ledger runtime must provide apply path for target energy",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackTargetEnergyLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Homeostasis target ledger runtime must provide rollback path for target energy",
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
    "appendTargetEnergyLedgerRecordAndMaybeCompact",
    LEDGER_PERSISTENCE_PATH,
    "Homeostasis target ledger persistence must append and compact durable history",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "hydrateTargetEnergyLedgerRuntime",
    LEDGER_PERSISTENCE_PATH,
    "Homeostasis target ledger persistence must replay records into runtime state",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "TARGET_ENERGY_LEDGER_SNAPSHOT_PATH",
    LEDGER_PERSISTENCE_PATH,
    "Homeostasis target ledger persistence must expose canonical snapshot path",
    violations,
  );

  requireSnippet(
    pulse,
    '"pulse.homeostasis.targetEnergy"',
    PULSE_PATH,
    "Pulse must route target-energy through genetic ledger key",
    violations,
  );
  requireSnippet(
    pulse,
    "homeostasisTargetEnergyPersistence",
    PULSE_PATH,
    "Pulse genetic ledger snapshot must expose target-energy persistence summary",
    violations,
  );
  requireSnippet(
    pulse,
    "syncHomeostasisTargetEnergyLedgerHydration",
    PULSE_PATH,
    "Pulse must hydrate target-energy ledger-owned state from persistence",
    violations,
  );
  requireAbsentSnippet(
    pulse,
    "targetEnergy?: number;",
    PULSE_PATH,
    "Pulse homeostasis overlay must not expose ad-hoc targetEnergy path once ledger ownership is live",
    violations,
  );
  requireAbsentSnippet(
    pulse,
    "update.targetEnergy",
    PULSE_PATH,
    "Pulse homeostasis overlay must not mutate targetEnergy outside genetic ledger route",
    violations,
  );

  requireSnippet(
    system,
    "rollback_token",
    SYSTEM_START_PATH,
    "System homeostasis ingress must parse rollback tokens",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.applyGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route target-energy apply through ledger path",
    violations,
  );
  requireSnippet(
    system,
    'key: "pulse.homeostasis.targetEnergy"',
    SYSTEM_START_PATH,
    "System runtime must target the target-energy ledger key",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.rollbackGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route target-energy rollback through ledger path",
    violations,
  );
  requireSnippet(
    system,
    "target_energy_rollback_token",
    SYSTEM_START_PATH,
    "System runtime must expose target-energy rollback token in homeostasis snapshots",
    violations,
  );
  requireSnippet(
    system,
    "ledger_target_energy_persistence",
    SYSTEM_START_PATH,
    "System runtime must expose target-energy ledger persistence summary to observers",
    violations,
  );

  if (violations.length > 0) {
    console.error("[homeostasis-target-ledger-path] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[homeostasis-target-ledger-path] contract guard passed.");
};

await main();

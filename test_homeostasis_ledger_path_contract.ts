const PULSE_PATH = "PULSE.ts";
const SYSTEM_START_PATH = "SYSTEM_START.ts";
const LEDGER_RUNTIME_PATH = "GENETIC_LEDGER_RUNTIME.ts";
const LEDGER_PERSISTENCE_PATH = "GENETIC_LEDGER_PERSISTENCE.ts";

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
  const [pulse, system, ledgerRuntime, ledgerPersistence] = await Promise.all([
    Deno.readTextFile(PULSE_PATH),
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(LEDGER_RUNTIME_PATH),
    Deno.readTextFile(LEDGER_PERSISTENCE_PATH),
  ]);

  requireSnippet(
    ledgerRuntime,
    "applyBaseTaxLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Ledger runtime must provide apply path for baseTax",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackBaseTaxLedgerRuntimeUpdate",
    LEDGER_RUNTIME_PATH,
    "Ledger runtime must provide rollback path for baseTax",
    violations,
  );
  requireSnippet(
    ledgerRuntime,
    "rollbackToken",
    LEDGER_RUNTIME_PATH,
    "Ledger runtime must mint rollback tokens",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "appendBaseTaxLedgerRecord",
    LEDGER_PERSISTENCE_PATH,
    "Ledger persistence module must append records to durable history",
    violations,
  );
  requireSnippet(
    ledgerPersistence,
    "hydrateBaseTaxLedgerRuntime",
    LEDGER_PERSISTENCE_PATH,
    "Ledger persistence module must replay records into runtime state",
    violations,
  );

  requireSnippet(
    pulse,
    "applyGeneticLedgerUpdate",
    PULSE_PATH,
    "Pulse must expose ledger-owned apply path",
    violations,
  );
  requireSnippet(
    pulse,
    "rollbackGeneticLedgerUpdate",
    PULSE_PATH,
    "Pulse must expose ledger-owned rollback path",
    violations,
  );
  requireSnippet(
    pulse,
    "genetic_ledger_update",
    PULSE_PATH,
    "Pulse must emit telemetry for ledger apply",
    violations,
  );
  requireSnippet(
    pulse,
    "genetic_ledger_rollback",
    PULSE_PATH,
    "Pulse must emit telemetry for ledger rollback",
    violations,
  );
  requireSnippet(
    pulse,
    "hydrateGeneticLedgerRuntime",
    PULSE_PATH,
    "Pulse must hydrate ledger-owned state from persistence",
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
    "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
    SYSTEM_START_PATH,
    "System homeostasis ingress must keep rollback payloads explicit",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.applyGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route baseTax apply through ledger path",
    violations,
  );
  requireSnippet(
    system,
    "PULSE.rollbackGeneticLedgerUpdate",
    SYSTEM_START_PATH,
    "System runtime must route baseTax rollback through ledger path",
    violations,
  );
  requireSnippet(
    system,
    "DAEMON_HOMEOSTASIS_ROLLBACK",
    SYSTEM_START_PATH,
    "System runtime must audit rollback events distinctly",
    violations,
  );
  requireSnippet(
    system,
    "ledger_base_tax",
    SYSTEM_START_PATH,
    "System runtime must expose ledger-owned baseTax summary to observers",
    violations,
  );

  if (violations.length > 0) {
    console.error("[homeostasis-ledger-path] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[homeostasis-ledger-path] contract guard passed.");
};

await main();

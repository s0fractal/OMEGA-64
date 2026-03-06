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
  const [system, akasha] = await Promise.all([
    Deno.readTextFile(SYSTEM_START_PATH),
    Deno.readTextFile(AKASHA_SERVER_PATH),
  ]);

  requireSnippet(
    system,
    "/api/physiology",
    SYSTEM_START_PATH,
    "System runtime must expose physiology observer endpoint",
    violations,
  );
  requireSnippet(
    system,
    "capturePhysiologySnapshot",
    SYSTEM_START_PATH,
    "System runtime must build physiology snapshot from live state",
    violations,
  );
  requireSnippet(
    system,
    "ledger_base_tax",
    SYSTEM_START_PATH,
    "System physiology observer must expose ledger-owned base-tax summary",
    violations,
  );
  requireSnippet(
    system,
    "ledger_base_tax_persistence",
    SYSTEM_START_PATH,
    "System physiology observer must expose ledger persistence summary",
    violations,
  );
  requireSnippet(
    system,
    "ledger_pressure_ring_scale",
    SYSTEM_START_PATH,
    "System physiology observer must expose pressure-ring ledger summary",
    violations,
  );
  requireSnippet(
    system,
    "ledger_pressure_ring_scale_persistence",
    SYSTEM_START_PATH,
    "System physiology observer must expose pressure-ring ledger persistence summary",
    violations,
  );
  requireSnippet(
    akasha,
    "proxyPhysiology",
    AKASHA_SERVER_PATH,
    "Akasha server must proxy physiology observer endpoint",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/physiology",
    AKASHA_SERVER_PATH,
    "Akasha REST surface must expose physiology endpoint",
    violations,
  );

  if (violations.length > 0) {
    console.error("[physiology-api] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[physiology-api] contract guard passed.");
};

await main();

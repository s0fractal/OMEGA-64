const SYSTEM_START_PATH = "07_meta/02_runners/SYSTEM_START.ts";
const AKASHA_SERVER_PATH = "06_akasha/AKASHA_SERVER.ts";

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
    "/api/mutation-telemetry",
    SYSTEM_START_PATH,
    "System API must expose mutation telemetry observer endpoint",
    violations,
  );
  requireSnippet(
    system,
    "mutation_telemetry: MUTATION_TELEMETRY.snapshot()",
    SYSTEM_START_PATH,
    "System mutation telemetry endpoint must surface snapshot payload",
    violations,
  );
  requireSnippet(
    akasha,
    "/api/mutation-telemetry",
    AKASHA_SERVER_PATH,
    "Akasha server must proxy mutation telemetry endpoint",
    violations,
  );

  if (violations.length > 0) {
    console.error("[mutation-telemetry-api] contract violated.");
    for (const violation of violations) {
      console.error(` - ${violation.file}`);
      console.error(`   reason: ${violation.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[mutation-telemetry-api] contract guard passed.");
};

await main();

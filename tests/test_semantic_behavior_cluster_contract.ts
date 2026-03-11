const MEMBRANE_PATH = "05_exocortex/SEMANTIC_MEMBRANE.ts";
const SYSTEM_PATH = "SYSTEM_START.ts";
const DAEMON_PATH = "06_akasha/OMEGA_DAEMON.ts";

type Violation = {
  file: string;
  reason: string;
};

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  out: Violation[],
) => {
  if (!source.includes(snippet)) {
    out.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];
  const [membrane, system, daemon] = await Promise.all([
    Deno.readTextFile(MEMBRANE_PATH),
    Deno.readTextFile(SYSTEM_PATH),
    Deno.readTextFile(DAEMON_PATH),
  ]);

  requireSnippet(
    membrane,
    "BehaviorFingerprint",
    MEMBRANE_PATH,
    "Semantic membrane must define behavior fingerprint type",
    violations,
  );
  requireSnippet(
    membrane,
    "captureBehaviorFrame",
    MEMBRANE_PATH,
    "Semantic membrane must capture behavior frames from active atoms",
    violations,
  );
  requireSnippet(
    membrane,
    "getBehaviorClusters",
    MEMBRANE_PATH,
    "Semantic membrane must expose behavior cluster snapshot API",
    violations,
  );
  requireSnippet(
    membrane,
    "dominantBehaviorInvariant",
    MEMBRANE_PATH,
    "Semantic membrane must expose dominant behavior invariant signature",
    violations,
  );

  requireSnippet(
    system,
    "SEMANTIC_MEMBRANE.captureBehaviorFrame",
    SYSTEM_PATH,
    "System telemetry must trigger semantic behavior frame capture",
    violations,
  );
  requireSnippet(
    system,
    "behavior_clusters",
    SYSTEM_PATH,
    "System telemetry must expose behavior cluster envelope",
    violations,
  );
  requireSnippet(
    system,
    "behavior_invariant",
    SYSTEM_PATH,
    "System telemetry must expose dominant behavior invariant",
    violations,
  );

  requireSnippet(
    daemon,
    "behavior_clusters",
    DAEMON_PATH,
    "Daemon telemetry parser must consume behavior cluster context",
    violations,
  );
  requireSnippet(
    daemon,
    "behavior_cluster",
    DAEMON_PATH,
    "Daemon invariant frame must emit behavior-cluster signal",
    violations,
  );

  if (violations.length > 0) {
    console.error("[semantic-behavior-cluster] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[semantic-behavior-cluster] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

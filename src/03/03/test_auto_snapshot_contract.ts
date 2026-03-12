const POLICY_PATH = "src/03/RUNTIME_POLICY.ts";
const SYSTEM_PATH = "src/07/02/SYSTEM_START.ts";
const SNAPSHOT_ENGINE_PATH = "src/06/SNAPSHOT_ENGINE.ts";

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
  const [policy, system, snapshotEngine] = await Promise.all([
    Deno.readTextFile(POLICY_PATH),
    Deno.readTextFile(SYSTEM_PATH),
    Deno.readTextFile(SNAPSHOT_ENGINE_PATH),
  ]);

  requireSnippet(
    policy,
    "OMEGA_AUTO_SNAPSHOT_ENABLE",
    POLICY_PATH,
    "Runtime policy must expose env gate for auto snapshots",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_AUTO_SNAPSHOT_INTERVAL_TICKS",
    POLICY_PATH,
    "Runtime policy must expose env for snapshot interval ticks",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_AUTO_SNAPSHOT_RETENTION",
    POLICY_PATH,
    "Runtime policy must expose env for snapshot retention",
    violations,
  );
  requireSnippet(
    policy,
    "snapshot:",
    POLICY_PATH,
    "Runtime policy must export snapshot policy section",
    violations,
  );

  requireSnippet(
    snapshotEngine,
    "pruneSnapshots",
    SNAPSHOT_ENGINE_PATH,
    "Snapshot engine must expose retention pruning",
    violations,
  );
  requireSnippet(
    snapshotEngine,
    "retention",
    SNAPSHOT_ENGINE_PATH,
    "Snapshot engine export must support retention policy",
    violations,
  );
  requireSnippet(
    snapshotEngine,
    "reason",
    SNAPSHOT_ENGINE_PATH,
    "Snapshot engine export must annotate save reason",
    violations,
  );

  requireSnippet(
    system,
    "SNAPSHOT_POLICY",
    SYSTEM_PATH,
    "System loop must consume snapshot policy from runtime policy",
    violations,
  );
  requireSnippet(
    system,
    "maybeAutoSnapshot",
    SYSTEM_PATH,
    "System loop must expose auto snapshot scheduler",
    violations,
  );
  requireSnippet(
    system,
    "await maybeAutoSnapshot(tick);",
    SYSTEM_PATH,
    "System pulse loop must call auto snapshot scheduler each tick",
    violations,
  );
  requireSnippet(
    system,
    "snapshot_guard",
    SYSTEM_PATH,
    "Telemetry must expose auto snapshot guard status",
    violations,
  );

  if (violations.length > 0) {
    console.error("[auto-snapshot-contract] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[auto-snapshot-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

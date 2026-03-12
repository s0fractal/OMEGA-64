const FEDERATION_PATH = "04/P2P_FEDERATION.ts";
const SYSTEM_PATH = "07/02/SYSTEM_START.ts";
const DAEMON_PATH = "06/OMEGA_DAEMON.ts";

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
  const [federation, system, daemon] = await Promise.all([
    Deno.readTextFile(FEDERATION_PATH),
    Deno.readTextFile(SYSTEM_PATH),
    Deno.readTextFile(DAEMON_PATH),
  ]);

  requireSnippet(
    federation,
    "RuleGenomeProfile",
    FEDERATION_PATH,
    "Federation layer must define rule-genome profile type",
    violations,
  );
  requireSnippet(
    federation,
    "localRuleGenome",
    FEDERATION_PATH,
    "Federation layer must expose local rule-genome profile",
    violations,
  );
  requireSnippet(
    federation,
    "observePeerRuleGenome",
    FEDERATION_PATH,
    "Federation layer must ingest peer rule-genome profiles",
    violations,
  );
  requireSnippet(
    federation,
    "getPeerRuleProfiles",
    FEDERATION_PATH,
    "Federation layer must expose peer rule-genome state",
    violations,
  );
  requireSnippet(
    federation,
    "ruleGenome: LOCAL_RULE_GENOME",
    FEDERATION_PATH,
    "Migrated atom packets must carry source rule-genome metadata",
    violations,
  );

  requireSnippet(
    system,
    "observePeerRuleGenome",
    SYSTEM_PATH,
    "System ingress must register peer rule-genome payloads",
    violations,
  );
  requireSnippet(
    system,
    "federation_rule_genome",
    SYSTEM_PATH,
    "System telemetry must expose federation rule-genome envelope",
    violations,
  );
  requireSnippet(
    system,
    "/peers/profiles",
    SYSTEM_PATH,
    "System API must expose federation peer rule-genome endpoint",
    violations,
  );

  requireSnippet(
    daemon,
    "federation_rule_genome",
    DAEMON_PATH,
    "Daemon telemetry parser must consume federation rule-genome envelope",
    violations,
  );
  requireSnippet(
    daemon,
    "federated_rule_pressure",
    DAEMON_PATH,
    "Daemon invariant frame must emit federated rule-pressure signal",
    violations,
  );

  if (violations.length > 0) {
    console.error("[federation-rule-genome] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[federation-rule-genome] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

type Violation = {
  file: string;
  reason: string;
};

const POLICY_PATH = "03/RUNTIME_POLICY.ts";
const ORACLE_PATH = "05/SOVEREIGN_ORACLE.ts";

const between = (source: string, start: string, end: string): string => {
  const startIdx = source.indexOf(start);
  if (startIdx < 0) return "";
  const endIdx = source.indexOf(end, startIdx + start.length);
  if (endIdx < 0) return source.slice(startIdx);
  return source.slice(startIdx, endIdx);
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
  const policy = await Deno.readTextFile(POLICY_PATH);
  const oracle = await Deno.readTextFile(ORACLE_PATH);

  requireSnippet(
    policy,
    "OMEGA_ORACLE_MUTATION_MODE",
    POLICY_PATH,
    "Runtime policy must expose oracle mutation mode env gate",
    violations,
  );
  requireSnippet(
    policy,
    '"stigmergic"',
    POLICY_PATH,
    "Runtime policy must default oracle mutation mode to stigmergic",
    violations,
  );
  requireSnippet(
    policy,
    "mutationMode:",
    POLICY_PATH,
    "Runtime policy must publish oracle mutation mode",
    violations,
  );

  requireSnippet(
    oracle,
    "ORACLE_MUTATION_MODE = RUNTIME_POLICY.oracle.mutationMode",
    ORACLE_PATH,
    "Oracle must source mutation mode from runtime policy",
    violations,
  );
  requireSnippet(
    oracle,
    'kind: "oracle_plasmid_injection"',
    ORACLE_PATH,
    "Oracle must define plasmid queue mutation kind",
    violations,
  );
  requireSnippet(
    oracle,
    'case "oracle_plasmid_injection":',
    ORACLE_PATH,
    "Oracle drain must apply plasmid mutations",
    violations,
  );
  requireSnippet(
    oracle,
    "oracle_plasmid_injection",
    ORACLE_PATH,
    "Oracle must emit plasmid telemetry",
    violations,
  );

  const consultBlock = between(oracle, "consultOracle:", "broadcastWhisper:");
  requireSnippet(
    consultBlock,
    'ORACLE_MUTATION_MODE === "direct"',
    ORACLE_PATH,
    "Consult path must preserve direct compatibility mode",
    violations,
  );
  requireSnippet(
    consultBlock,
    'kind: "oracle_plasmid_injection"',
    ORACLE_PATH,
    "Consult path must enqueue plasmid injection in stigmergic mode",
    violations,
  );
  requireSnippet(
    consultBlock,
    'kind: "oracle_head_mutation"',
    ORACLE_PATH,
    "Consult path must still support direct head mutation mode",
    violations,
  );

  if (violations.length > 0) {
    console.error("[oracle-plasmid-mode] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[oracle-plasmid-mode] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

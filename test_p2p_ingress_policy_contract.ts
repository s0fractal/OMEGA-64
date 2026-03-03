type Violation = {
  reason: string;
};

const P2P_PATH = "P2P_SYNAPSE.ts";

const main = async () => {
  const violations: Violation[] = [];
  const source = await Deno.readTextFile(P2P_PATH);

  if (!source.includes("x-omega-control-token")) {
    violations.push({
      reason: "P2P synapse must accept canonical x-omega-control-token header",
    });
  }
  if (!source.includes("x-omega-mutate-token")) {
    violations.push({
      reason: "P2P synapse must keep legacy x-omega-mutate-token compatibility",
    });
  }
  if (!source.includes("OMEGA_P2P_MUTATE_ENABLE")) {
    violations.push({
      reason: "P2P synapse must expose dedicated enable env gate",
    });
  }
  if (!source.includes("OMEGA_SYSTEM_CONTROL_ENABLE")) {
    violations.push({
      reason: "P2P synapse must support system control gate fallback",
    });
  }
  if (!source.includes("OMEGA_P2P_MUTATE_TOKEN")) {
    violations.push({
      reason: "P2P synapse must expose dedicated token env gate",
    });
  }
  if (!source.includes("OMEGA_SYSTEM_CONTROL_TOKEN")) {
    violations.push({
      reason: "P2P synapse must support system token fallback",
    });
  }
  if (!source.includes("parseEnvBool(") || !source.includes("false")) {
    violations.push({
      reason:
        "P2P mutate enable must use canonical env bool parser with default-closed posture",
    });
  }
  if (!source.includes('from "./ENV_PARSE.ts"')) {
    violations.push({
      reason: "P2P synapse must source env parsing from ENV_PARSE.ts",
    });
  }
  if (source.includes("STATE_MATRIX")) {
    violations.push({
      reason: "P2P synapse must not mutate runtime STATE_MATRIX directly",
    });
  }

  if (violations.length > 0) {
    console.error("[p2p-ingress-policy] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[p2p-ingress-policy] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

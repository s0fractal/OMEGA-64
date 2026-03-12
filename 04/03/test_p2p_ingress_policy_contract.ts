type Violation = {
  reason: string;
};

const P2P_PATH = "04/P2P_SYNAPSE.ts";
const POLICY_PATH = "03/RUNTIME_POLICY.ts";

const main = async () => {
  const violations: Violation[] = [];
  const source = await Deno.readTextFile(P2P_PATH);
  const policy = await Deno.readTextFile(POLICY_PATH);

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
  if (!policy.includes("OMEGA_P2P_MUTATE_ENABLE")) {
    violations.push({
      reason: "P2P synapse must expose dedicated enable env gate",
    });
  }
  if (!policy.includes("OMEGA_SYSTEM_CONTROL_ENABLE")) {
    violations.push({
      reason: "P2P synapse must support system control gate fallback",
    });
  }
  if (!policy.includes("OMEGA_P2P_MUTATE_TOKEN")) {
    violations.push({
      reason: "P2P synapse must expose dedicated token env gate",
    });
  }
  if (!policy.includes("OMEGA_SYSTEM_CONTROL_TOKEN")) {
    violations.push({
      reason: "P2P synapse must support system token fallback",
    });
  }
  if (!source.includes("RUNTIME_POLICY.p2p.mutateEnabled")) {
    violations.push({
      reason: "P2P mutate enable must come from runtime policy",
    });
  }
  if (!source.includes("RUNTIME_POLICY.p2p.mutateToken")) {
    violations.push({
      reason: "P2P mutate token must come from runtime policy",
    });
  }
  if (!source.includes('@03"')) {
    violations.push({
      reason: "P2P synapse must source ingress policy from RUNTIME_POLICY.ts",
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

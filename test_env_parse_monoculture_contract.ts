type FileExpectation = {
  file: string;
  requiresPolicyAccess: string;
};

type Violation = {
  file: string;
  reason: string;
};

const TARGETS: FileExpectation[] = [
  { file: "PULSE.ts", requiresPolicyAccess: "RUNTIME_POLICY.pulse" },
  { file: "SYSTEM_START.ts", requiresPolicyAccess: "RUNTIME_POLICY.system" },
  {
    file: "P2P_FEDERATION.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.federation",
  },
  { file: "P2P_SYNAPSE.ts", requiresPolicyAccess: "RUNTIME_POLICY.p2p" },
  { file: "AKASHA_SERVER.ts", requiresPolicyAccess: "RUNTIME_POLICY.akasha" },
  {
    file: "MUTATION_TELEMETRY.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.telemetry",
  },
  {
    file: "CONTROL_INTENT_QUEUE.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.controlIntent",
  },
  {
    file: "SOVEREIGN_ORACLE.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.oracle",
  },
];

const main = async () => {
  const violations: Violation[] = [];

  for (const target of TARGETS) {
    const source = await Deno.readTextFile(target.file);
    if (!source.includes('from "./RUNTIME_POLICY.ts"')) {
      violations.push({
        file: target.file,
        reason: "must import runtime policy from RUNTIME_POLICY.ts",
      });
    }
    if (!source.includes(target.requiresPolicyAccess)) {
      violations.push({
        file: target.file,
        reason: `expected policy access: ${target.requiresPolicyAccess}`,
      });
    }
    if (source.includes('from "./ENV_PARSE.ts"')) {
      violations.push({
        file: target.file,
        reason: "env parser helpers should be consumed through RUNTIME_POLICY",
      });
    }
    if (/\bconst\s+parseBool\b/u.test(source)) {
      violations.push({
        file: target.file,
        reason: "inline parseBool helper must not be reintroduced",
      });
    }
    if (/\bconst\s+parseBoundedInt\b/u.test(source)) {
      violations.push({
        file: target.file,
        reason: "inline parseBoundedInt helper must not be reintroduced",
      });
    }
    if (source.includes("Deno.env.get(")) {
      violations.push({
        file: target.file,
        reason: "runtime module must not read env directly",
      });
    }
  }

  const runtimePolicy = await Deno.readTextFile("RUNTIME_POLICY.ts");
  if (!runtimePolicy.includes('from "./ENV_PARSE.ts"')) {
    violations.push({
      file: "RUNTIME_POLICY.ts",
      reason: "must import canonical parser helpers from ENV_PARSE.ts",
    });
  }
  if (!runtimePolicy.includes("logFingerprintOnce")) {
    violations.push({
      file: "RUNTIME_POLICY.ts",
      reason: "must expose logFingerprintOnce API",
    });
  }
  if (!runtimePolicy.includes("fingerprint")) {
    violations.push({
      file: "RUNTIME_POLICY.ts",
      reason: "must expose runtime policy fingerprint",
    });
  }
  if (!runtimePolicy.includes("Deno.env.get(")) {
    violations.push({
      file: "RUNTIME_POLICY.ts",
      reason: "must be the central env-read location",
    });
  }

  if (violations.length > 0) {
    console.error("[env-parse-monoculture] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[env-parse-monoculture] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

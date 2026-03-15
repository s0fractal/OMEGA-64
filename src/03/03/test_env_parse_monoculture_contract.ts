type FileExpectation = {
  file: string;
  requiresPolicyAccess: string;
};

type Violation = {
  file: string;
  reason: string;
};

const TARGETS: FileExpectation[] = [
  { file: "src/_/04/PULSE.ts", requiresPolicyAccess: "RUNTIME_POLICY.pulse" },
  { file: "src/07/02/SYSTEM_START.ts", requiresPolicyAccess: "RUNTIME_POLICY.system" },
  {
    file: "src/_/04/P2P_FEDERATION.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.federation",
  },
  { file: "src/04/P2P_SYNAPSE.ts", requiresPolicyAccess: "RUNTIME_POLICY.p2p" },
  { file: "src/06/AKASHA_SERVER.ts", requiresPolicyAccess: "RUNTIME_POLICY.akasha" },
  {
    file: "src/_/06/MUTATION_TELEMETRY.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.telemetry",
  },
  {
    file: "src/03/CONTROL_INTENT_QUEUE.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.controlIntent",
  },
  {
    file: "src/_/05/SOVEREIGN_ORACLE.ts",
    requiresPolicyAccess: "RUNTIME_POLICY.oracle",
  },
];

const main = async () => {
  const violations: Violation[] = [];

  for (const target of TARGETS) {
    const source = await Deno.readTextFile(target.file);
    if (!source.includes('@03"') && !source.includes('./RUNTIME_POLICY.ts"') && !source.includes('@03/RUNTIME_POLICY.ts"')) {
      violations.push({
        file: target.file,
        reason: "must import runtime policy from RUNTIME_POLICY.ts / 03_governance",
      });
    }
    if (!source.includes(target.requiresPolicyAccess)) {
      violations.push({
        file: target.file,
        reason: `expected policy access: ${target.requiresPolicyAccess}`,
      });
    }
    if (source.includes('parseEnvBool') && (!source.includes('@03/RUNTIME_POLICY.ts') && !source.includes('@03'))) {
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

  const runtimePolicy = await Deno.readTextFile("src/03/RUNTIME_POLICY.ts");
  if (!runtimePolicy.includes('@00"')) {
    violations.push({
      file: "src/03/RUNTIME_POLICY.ts",
      reason: "must import canonical parser helpers from ENV_PARSE.ts/00_substrate",
    });
  }
  if (!runtimePolicy.includes("logFingerprintOnce")) {
    violations.push({
      file: "src/03/RUNTIME_POLICY.ts",
      reason: "must expose logFingerprintOnce API",
    });
  }
  if (!runtimePolicy.includes("fingerprint")) {
    violations.push({
      file: "src/03/RUNTIME_POLICY.ts",
      reason: "must expose runtime policy fingerprint",
    });
  }
  if (!runtimePolicy.includes("Deno.env.get(")) {
    violations.push({
      file: "src/03/RUNTIME_POLICY.ts",
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

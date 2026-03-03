type FileExpectation = {
  file: string;
  requiresBool: boolean;
  requiresBoundedInt: boolean;
};

type Violation = {
  file: string;
  reason: string;
};

const TARGETS: FileExpectation[] = [
  { file: "PULSE.ts", requiresBool: true, requiresBoundedInt: true },
  { file: "SYSTEM_START.ts", requiresBool: true, requiresBoundedInt: false },
  { file: "P2P_FEDERATION.ts", requiresBool: true, requiresBoundedInt: true },
  { file: "P2P_SYNAPSE.ts", requiresBool: true, requiresBoundedInt: false },
  {
    file: "MUTATION_TELEMETRY.ts",
    requiresBool: true,
    requiresBoundedInt: true,
  },
  {
    file: "CONTROL_INTENT_QUEUE.ts",
    requiresBool: false,
    requiresBoundedInt: true,
  },
  {
    file: "SOVEREIGN_ORACLE.ts",
    requiresBool: false,
    requiresBoundedInt: true,
  },
];

const main = async () => {
  const violations: Violation[] = [];

  for (const target of TARGETS) {
    const source = await Deno.readTextFile(target.file);
    if (!source.includes('from "./ENV_PARSE.ts"')) {
      violations.push({
        file: target.file,
        reason: "must import env parser helpers from ENV_PARSE.ts",
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
    if (target.requiresBool && !source.includes("parseEnvBool(")) {
      violations.push({
        file: target.file,
        reason: "expected parseEnvBool usage",
      });
    }
    if (target.requiresBoundedInt && !source.includes("parseEnvBoundedInt(")) {
      violations.push({
        file: target.file,
        reason: "expected parseEnvBoundedInt usage",
      });
    }
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

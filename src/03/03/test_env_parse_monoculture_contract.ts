import { resolveSourcePath } from "../../resolve_source.ts";

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
    let resolvedPath = "";
    try {
      resolvedPath = await resolveSourcePath(target.file);
    } catch (e) {
      console.warn(`[env-parse-monoculture] Warning: Could not find file ${target.file}`);
      continue;
    }
    const source = await Deno.readTextFile(resolvedPath);
    if (!source.includes('@generated"')) {
      violations.push({
        file: target.file,
        reason: "must import runtime policy from @generated",
      });
    }
    if (!source.includes(target.requiresPolicyAccess)) {
      violations.push({
        file: target.file,
        reason: `expected policy access: ${target.requiresPolicyAccess}`,
      });
    }
    if (source.includes('parseEnvBool') && !source.includes('@generated')) {
      violations.push({
        file: target.file,
        reason: "env parser helpers should be consumed through @generated",
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

  let runtimePolicyPath = "";
  try {
    runtimePolicyPath = await resolveSourcePath("runtime_policy.md");
    const runtimePolicy = await Deno.readTextFile(runtimePolicyPath);
    if (!runtimePolicy.includes('export const RUNTIME_POLICY = {')) {
      violations.push({
        file: "@generated",
        reason: "must export RUNTIME_POLICY",
      });
    }
    if (!runtimePolicy.includes("logFingerprintOnce:")) {
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
        file: "@generated",
        reason: "must be the central env-read location",
      });
    }
  } catch (e) {
    console.warn(`[env-parse-monoculture] Warning: Could not find @generated`);
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

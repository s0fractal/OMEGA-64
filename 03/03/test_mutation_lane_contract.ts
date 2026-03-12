import { parse } from "jsr:@std/jsonc";
type ExportManifest = {
  context_files: string[];
};

type Violation = {
  file: string;
  reason: string;
};

const MANIFEST_PATH = "deno.jsonc";
const AKASHA_PATH = "06/AKASHA_SERVER.ts";
const P2P_PATH = "04/P2P_SYNAPSE.ts";
const FEDERATION_PATH = "04/P2P_FEDERATION.ts";
const SYSTEM_PATH = "07/02/SYSTEM_START.ts";
const RUNTIME_POLICY_PATH = "03/RUNTIME_POLICY.ts";
const SYSTEM_CONTROLLED_POST_PATHS = [
  "/crisis",
  "/federate",
  "/snapshot/export",
  "/snapshot/import",
  "/mutate",
  "/avatar",
] as const;
const SYSTEM_CONTROLLED_POST_QUEUE_CALLS: Record<
  typeof SYSTEM_CONTROLLED_POST_PATHS[number],
  string | null
> = {
  "/crisis": "enqueueCrisis",
  "/federate": "enqueueFederate",
  "/snapshot/export": null,
  "/snapshot/import": "enqueueSnapshotImport",
  "/mutate": "enqueueMutate",
  "/avatar": "enqueueAvatar",
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

  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const manifest = parse(manifestRaw).omega as ExportManifest;
  const context = Array.isArray(manifest.context_files)
    ? manifest.context_files
    : [];

  const akasha = await Deno.readTextFile(AKASHA_PATH);
  const p2p = await Deno.readTextFile(P2P_PATH);
  const federation = await Deno.readTextFile(FEDERATION_PATH);
  const system = await Deno.readTextFile(SYSTEM_PATH);
  const runtimePolicy = await Deno.readTextFile(RUNTIME_POLICY_PATH);

  // External ingress must not bind wide-open by default.
  requireSnippet(
    runtimePolicy,
    `"127.0.0.1"`,
    RUNTIME_POLICY_PATH,
    "Runtime policy must preserve loopback defaults",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "OMEGA_AKASHA_HOST",
    RUNTIME_POLICY_PATH,
    "Runtime policy must track Akasha host env gate",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "OMEGA_P2P_HOST",
    RUNTIME_POLICY_PATH,
    "Runtime policy must track P2P host env gate",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "OMEGA_SYSTEM_HOST",
    RUNTIME_POLICY_PATH,
    "Runtime policy must track system host env gate",
    violations,
  );
  requireSnippet(
    akasha,
    "RUNTIME_POLICY.akasha.host",
    AKASHA_PATH,
    "Akasha host must come from runtime policy",
    violations,
  );
  requireSnippet(
    p2p,
    "RUNTIME_POLICY.p2p.host",
    P2P_PATH,
    "P2P host must come from runtime policy",
    violations,
  );
  requireSnippet(
    system,
    "RUNTIME_POLICY.system.host",
    SYSTEM_PATH,
    "System host must come from runtime policy",
    violations,
  );
  requireSnippet(
    akasha,
    "Deno.serve({ hostname: HOST, port: PORT }",
    AKASHA_PATH,
    "Akasha must bind explicit hostname",
    violations,
  );
  requireSnippet(
    p2p,
    "Deno.serve({ hostname: HOST, port: PORT }",
    P2P_PATH,
    "P2P must bind explicit hostname",
    violations,
  );
  requireSnippet(
    system,
    "Deno.serve({ hostname: HOST, port: UI_PORT }",
    SYSTEM_PATH,
    "System server must bind explicit hostname",
    violations,
  );

  // /mutate must be operator-gated and path-confined.
  requireSnippet(
    p2p,
    "MUTATE_ENABLED",
    P2P_PATH,
    "P2P mutate lane must be explicitly gated",
    violations,
  );
  requireSnippet(
    p2p,
    "MUTATE_TOKEN",
    P2P_PATH,
    "P2P mutate lane must support token auth",
    violations,
  );
  requireSnippet(
    p2p,
    "targetPath.startsWith(ROOT_PREFIX)",
    P2P_PATH,
    "P2P writes must be confined to root prefix",
    violations,
  );
  requireSnippet(
    runtimePolicy,
    "OMEGA_FEDERATION_ENABLE",
    RUNTIME_POLICY_PATH,
    "Federation migration must be opt-in via env gate",
    violations,
  );
  requireSnippet(
    federation,
    "if (!FEDERATION_ENABLED) return;",
    FEDERATION_PATH,
    "Federation runtime paths must short-circuit when disabled",
    violations,
  );
  requireSnippet(
    federation,
    "x-omega-control-token",
    FEDERATION_PATH,
    "Federation must forward control token for /federate",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_ENABLE",
    SYSTEM_PATH,
    "System control plane must be explicitly gated",
    violations,
  );
  requireSnippet(
    system,
    "x-omega-control-token",
    SYSTEM_PATH,
    "System control plane must support token auth",
    violations,
  );
  requireSnippet(
    system,
    "requireControlAuth(req)",
    SYSTEM_PATH,
    "System mutating routes must call control auth",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE",
    SYSTEM_PATH,
    "System mutating routes must enqueue intents via control queue",
    violations,
  );
  for (const path of SYSTEM_CONTROLLED_POST_PATHS) {
    const marker = `if (url.pathname === "${path}" && req.method === "POST") {`;
    const start = system.indexOf(marker);
    if (start < 0) {
      violations.push({
        file: SYSTEM_PATH,
        reason: `Expected controlled POST route marker for ${path}`,
      });
      continue;
    }
    const block = system.slice(start, start + 400);
    if (!block.includes("requireControlAuth(req)")) {
      violations.push({
        file: SYSTEM_PATH,
        reason: `POST route ${path} must enforce requireControlAuth(req)`,
      });
    }
    const queueCall = SYSTEM_CONTROLLED_POST_QUEUE_CALLS[path];
    if (queueCall && !block.includes(queueCall)) {
      violations.push({
        file: SYSTEM_PATH,
        reason:
          `POST route ${path} must enqueue via CONTROL_INTENT_QUEUE.${queueCall}(...)`,
      });
    }
    if (queueCall && block.includes("STATE_MATRIX.set")) {
      violations.push({
        file: SYSTEM_PATH,
        reason:
          `POST route ${path} must not apply STATE_MATRIX writes directly`,
      });
    }
  }

  // External ingress must not mutate runtime state directly.
  for (
    const [file, source] of [
      [AKASHA_PATH, akasha],
      [P2P_PATH, p2p],
    ] as const
  ) {
    if (source.includes("STATE_MATRIX")) {
      violations.push({
        file,
        reason: "External ingress must not import/use STATE_MATRIX directly",
      });
    }
    if (source.includes("GATE.")) {
      violations.push({
        file,
        reason: "External ingress must not call gate internals directly",
      });
    }
  }

  if (violations.length > 0) {
    console.error("[mutation-lane] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[mutation-lane] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});

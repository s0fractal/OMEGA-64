type ExportManifest = {
  context_files: string[];
};

type Violation = {
  file: string;
  reason: string;
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";
const REQUIRED_DOC = "MUTATION_LANES.md";
const AKASHA_PATH = "AKASHA_SERVER.ts";
const P2P_PATH = "P2P_SYNAPSE.ts";

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
  const manifest = JSON.parse(manifestRaw) as ExportManifest;
  const context = Array.isArray(manifest.context_files)
    ? manifest.context_files
    : [];
  if (!context.includes(REQUIRED_DOC)) {
    violations.push({
      file: MANIFEST_PATH,
      reason: `context_files must include ${REQUIRED_DOC}`,
    });
  }

  const akasha = await Deno.readTextFile(AKASHA_PATH);
  const p2p = await Deno.readTextFile(P2P_PATH);

  // External ingress must not bind wide-open by default.
  requireSnippet(
    akasha,
    `"127.0.0.1"`,
    AKASHA_PATH,
    "Akasha host default must be loopback",
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
    `"127.0.0.1"`,
    P2P_PATH,
    "P2P host default must be loopback",
    violations,
  );
  requireSnippet(
    p2p,
    "Deno.serve({ hostname: HOST, port: PORT }",
    P2P_PATH,
    "P2P must bind explicit hostname",
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

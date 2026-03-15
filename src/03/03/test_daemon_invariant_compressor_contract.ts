const DAEMON_PATH = "src/_/06/OMEGA_DAEMON.ts";

const requireSnippet = (
  source: string,
  snippet: string,
  reason: string,
  violations: string[],
) => {
  if (!source.includes(snippet)) {
    violations.push(`${reason} (missing snippet: ${snippet})`);
  }
};

const main = async () => {
  const violations: string[] = [];
  const daemon = await Deno.readTextFile(DAEMON_PATH);

  requireSnippet(
    daemon,
    "InvariantFrame",
    "daemon must define invariant frame type",
    violations,
  );
  requireSnippet(
    daemon,
    "buildInvariantFrame",
    "daemon must build deterministic invariant frame from telemetry/context",
    violations,
  );
  requireSnippet(
    daemon,
    "loadInvariantHistory",
    "daemon must load invariant continuity memory",
    violations,
  );
  requireSnippet(
    daemon,
    "saveInvariantHistory",
    "daemon must persist invariant continuity memory",
    violations,
  );
  requireSnippet(
    daemon,
    "daemon_invariants.json",
    "daemon must persist invariant history on disk by default",
    violations,
  );
  requireSnippet(
    daemon,
    "invariant_frame",
    "daemon must provide invariant frame to LLM context",
    violations,
  );
  requireSnippet(
    daemon,
    "recent_invariant_history",
    "daemon must provide invariant history trail to LLM context",
    violations,
  );
  requireSnippet(
    daemon,
    "Invariant Compressor",
    "daemon prompt must frame LLM as invariant compressor",
    violations,
  );
  requireSnippet(
    daemon,
    "[MYCELIUM:INVARIANT]",
    "daemon must emit invariant log stream",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[daemon-invariant-compressor] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[daemon-invariant-compressor] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

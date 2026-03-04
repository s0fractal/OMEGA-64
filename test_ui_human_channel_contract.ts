const UI_PATH = "ui/index.html";

const requireSnippet = (
  source: string,
  snippet: string,
  reason: string,
  violations: string[],
) => {
  if (!source.includes(snippet)) {
    violations.push(`${reason} (missing: ${snippet})`);
  }
};

const main = async () => {
  const violations: string[] = [];
  const ui = await Deno.readTextFile(UI_PATH);

  requireSnippet(
    ui,
    'id="human-channel"',
    "UI must render dedicated human channel block",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-explain-btn"',
    "UI must render explain trigger button",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-drift-btn"',
    "UI must render drift trigger button",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-drift-explanation"',
    "UI must render drift explanation surface",
    violations,
  );
  requireSnippet(
    ui,
    "buildHumanExplanation",
    "UI must synthesize human-readable explanation",
    violations,
  );
  requireSnippet(
    ui,
    "buildDriftExplanation",
    "UI must synthesize human-readable drift explanation",
    violations,
  );
  requireSnippet(
    ui,
    "DRIFT_LOOKBACK_MS",
    "UI must define drift lookback window constant",
    violations,
  );
  requireSnippet(
    ui,
    "fetchJson('/api/telemetry')",
    "UI human channel must consume runtime telemetry endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "fetchJson('/codex/narrative?limit=4')",
    "UI human channel must consume codex narrative endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "inferDominantSpeciesLabel",
    "UI human channel must map dominant genome to species label",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[ui-human-channel-contract] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[ui-human-channel-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

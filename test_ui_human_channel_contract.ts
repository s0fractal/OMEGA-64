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
    "buildHumanExplanation",
    "UI must synthesize human-readable explanation",
    violations,
  );
  requireSnippet(
    ui,
    "fetch('/api/telemetry')",
    "UI human channel must consume runtime telemetry endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "fetch('/codex/narrative?limit=4')",
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

const UI_PATH = "src/63/00/index.html";

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
    "let codexNarrative =",
    "UI must maintain local codex narrative state",
    violations,
  );
  requireSnippet(
    ui,
    "/codex/narrative?limit=4",
    "UI must poll codex narrative endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "Narrative Chronicle",
    "UI codex panel must render narrative chronicle rows",
    violations,
  );
  requireSnippet(
    ui,
    "Shared Center",
    "UI codex panel must render shared center row from invariant archive",
    violations,
  );
  requireSnippet(
    ui,
    "Top Degrade Reasons",
    "UI codex panel must render top degrade reasons from daemon admission history",
    violations,
  );
  requireSnippet(
    ui,
    "codex-mood",
    "UI codex panel must render narrative mood badge",
    violations,
  );
  requireSnippet(
    ui,
    "inferSharedCenterLabel",
    "UI codex panel must infer shared center across narrative/snapshot invariants",
    violations,
  );
  requireSnippet(
    ui,
    "buildTopDegradeReasonsSummary",
    "UI codex panel must aggregate top degrade reasons from daemon admission history",
    violations,
  );
  requireSnippet(
    ui,
    "/codex/invariants?limit=6",
    "UI codex panel must poll codex invariants endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "escapeHtml",
    "UI codex panel must escape dynamic narrative/species text",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[ui-codex-narrative-contract] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[ui-codex-narrative-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

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
    'id="human-spatial-hash"',
    "UI must render dedicated spatial-hash guard surface",
    violations,
  );
  requireSnippet(
    ui,
    "currentSpatialHashGuard",
    "UI must parse spatial-hash guard telemetry envelope",
    violations,
  );
  requireSnippet(
    ui,
    "buildSpatialHashSummary",
    "UI must synthesize spatial-hash saturation summary",
    violations,
  );
  requireSnippet(
    ui,
    "renderHumanSpatialHash",
    "UI must render spatial-hash summary in human channel pass",
    violations,
  );
  requireSnippet(
    ui,
    "spatial_hash_guard",
    "UI must consume spatial-hash telemetry block",
    violations,
  );
  requireSnippet(
    ui,
    "renderHumanSpatialHash();",
    "UI human channel refresh must include spatial-hash rendering",
    violations,
  );

  if (violations.length > 0) {
    throw new Error(
      `[ui-spatial-hash-guard-contract] contract violations:\n${
        violations.map((v) => `- ${v}`).join("\n")
      }`,
    );
  }

  console.log("[ui-spatial-hash-guard-contract] contract guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

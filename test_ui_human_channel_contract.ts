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
    'id="human-drift-breakdown"',
    "UI must render drift breakdown surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-drift-risk"',
    "UI must render drift risk-summary surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-drift-sparkline"',
    "UI must render drift sparkline surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-drift-severity"',
    "UI must render drift severity badge surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="drift-halo"',
    "UI must render scene halo overlay surface",
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
    "score=",
    "UI drift mode must expose component score breakdown",
    violations,
  );
  requireSnippet(
    ui,
    "buildDriftSparkline",
    "UI drift mode must expose drift trend sparkline synthesis",
    violations,
  );
  requireSnippet(
    ui,
    "buildDriftRiskSummary",
    "UI drift mode must expose compact risk-summary synthesis",
    violations,
  );
  requireSnippet(
    ui,
    "applyDriftSeverityBadge",
    "UI must map drift analysis to LOW/MID/HIGH badge states",
    violations,
  );
  requireSnippet(
    ui,
    "applyDriftHalo",
    "UI must map drift severity to atmospheric halo state",
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
    'fetchJson("/api/telemetry")',
    "UI human channel must consume runtime telemetry endpoint",
    violations,
  );
  requireSnippet(
    ui,
    'fetchJson("/codex/narrative?limit=4")',
    "UI human channel must consume codex narrative endpoint",
    violations,
  );
  requireSnippet(
    ui,
    "inferDominantSpeciesLabel",
    "UI human channel must map dominant genome to species label",
    violations,
  );
  requireSnippet(
    ui,
    "inferSharedCenterLabel",
    "UI human channel must map codex invariant archive to shared center label",
    violations,
  );
  requireSnippet(
    ui,
    "inferDominantInvariantVector",
    "UI human channel must expose dominant invariant vector cue",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-daemon-admission"',
    "UI must render daemon admission status surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-daemon-history"',
    "UI must render daemon admission history surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-phase-ring-summary"',
    "UI must render phase ring summary surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-phase-ring-vector"',
    "UI must render phase ring vector surface",
    violations,
  );
  requireSnippet(
    ui,
    'id="human-phase-ring-update"',
    "UI must render phase ring update surface",
    violations,
  );
  requireSnippet(
    ui,
    "buildDaemonAdmissionSummary",
    "UI human channel must summarize daemon admission severity and reason",
    violations,
  );
  requireSnippet(
    ui,
    "daemon_governance",
    "UI human channel must consume daemon governance telemetry context",
    violations,
  );
  requireSnippet(
    ui,
    "daemonAdmissionSeverity",
    "UI human channel must derive admission severity for visual pressure mapping",
    violations,
  );
  requireSnippet(
    ui,
    "selectHumanHaloSeverity",
    "UI halo must combine drift and daemon admission severity",
    violations,
  );
  requireSnippet(
    ui,
    "currentDaemonAdmissionHistory",
    "UI must derive daemon admission history from telemetry",
    violations,
  );
  requireSnippet(
    ui,
    "buildDaemonAdmissionHistorySummary",
    "UI must render compact daemon admission history summary",
    violations,
  );
  requireSnippet(
    ui,
    "last_admission_history",
    "UI must consume daemon admission history from telemetry",
    violations,
  );
  requireSnippet(
    ui,
    "currentPulsePressure",
    "UI must derive pulse pressure envelope from telemetry",
    violations,
  );
  requireSnippet(
    ui,
    "buildPhaseRingSummary",
    "UI must synthesize human-readable phase ring summary",
    violations,
  );
  requireSnippet(
    ui,
    "buildPhaseRingVector",
    "UI must synthesize human-readable phase ring vector",
    violations,
  );
  requireSnippet(
    ui,
    "buildPhaseRingUpdateSummary",
    "UI must synthesize human-readable daemon phase-ring update summary",
    violations,
  );
  requireSnippet(
    ui,
    "renderHumanPhaseRing",
    "UI must render phase ring surfaces during human channel refresh",
    violations,
  );
  requireSnippet(
    ui,
    "pulse_pressure",
    "UI must consume pulse pressure telemetry context",
    violations,
  );
  requireSnippet(
    ui,
    "last_pressure_ring_update",
    "UI must consume daemon last pressure-ring update context",
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

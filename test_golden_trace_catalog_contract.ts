import {
  GOLDEN_TRACE_CATALOG,
  goldenTraceArtifactPaths,
  goldenTraceById,
} from "./verification/golden_trace_catalog.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(
    GOLDEN_TRACE_CATALOG.length === 18,
    "[golden_trace_catalog] expected 18 baseline scenarios",
  );

  const ids = new Set(GOLDEN_TRACE_CATALOG.map((trace) => trace.id));
  expect(ids.size === 18, "[golden_trace_catalog] ids must be unique");

  const first = goldenTraceById("gt01_coldstart_seeded_swarm");
  expect(first !== null, "[golden_trace_catalog] gt01 must exist");
  expect(
    first?.daemonEnabled === false,
    "[golden_trace_catalog] gt01 must be daemon-off",
  );

  const daemonCase = goldenTraceById("gt06_daemon_admission_case");
  expect(
    daemonCase?.daemonEnabled === true,
    "[golden_trace_catalog] gt06 must be daemon-on",
  );

  const daemonBlock = goldenTraceById("gt07_daemon_policy_block");
  expect(
    daemonBlock?.daemonEnabled === true,
    "[golden_trace_catalog] gt07 must be daemon-on",
  );

  const structureIntent = goldenTraceById("gt08_structure_intent_visibility");
  expect(
    structureIntent?.daemonEnabled === false,
    "[golden_trace_catalog] gt08 must be daemon-off",
  );

  const collectiveTransport = goldenTraceById("gt09_collective_transport");
  expect(
    collectiveTransport?.daemonEnabled === false,
    "[golden_trace_catalog] gt09 must be daemon-off",
  );

  const shareTransfer = goldenTraceById("gt10_share_transfer");
  expect(
    shareTransfer?.daemonEnabled === false,
    "[golden_trace_catalog] gt10 must be daemon-off",
  );

  const collectiveBanking = goldenTraceById("gt11_collective_banking");
  expect(
    collectiveBanking?.daemonEnabled === false,
    "[golden_trace_catalog] gt11 must be daemon-off",
  );

  const collectiveSynchrony = goldenTraceById("gt12_collective_synchrony");
  expect(
    collectiveSynchrony?.daemonEnabled === false,
    "[golden_trace_catalog] gt12 must be daemon-off",
  );

  const structureLock = goldenTraceById("gt13_structure_lock_progress");
  expect(
    structureLock?.daemonEnabled === false,
    "[golden_trace_catalog] gt13 must be daemon-off",
  );

  const structureBuild = goldenTraceById("gt14_structure_charge_resolution");
  expect(
    structureBuild?.daemonEnabled === false,
    "[golden_trace_catalog] gt14 must be daemon-off",
  );

  const structureCompetition = goldenTraceById(
    "gt15_structure_charge_competition",
  );
  expect(
    structureCompetition?.daemonEnabled === false,
    "[golden_trace_catalog] gt15 must be daemon-off",
  );

  const runtimeBuild = goldenTraceById("gt16_runtime_build_materialization");
  expect(
    runtimeBuild?.daemonEnabled === false,
    "[golden_trace_catalog] gt16 must be daemon-off",
  );

  const runtimeBuildCompetition = goldenTraceById(
    "gt17_runtime_build_competition",
  );
  expect(
    runtimeBuildCompetition?.daemonEnabled === false,
    "[golden_trace_catalog] gt17 must be daemon-off",
  );

  const runtimeBuildStaleLock = goldenTraceById("gt18_runtime_build_stale_lock");
  expect(
    runtimeBuildStaleLock?.daemonEnabled === false,
    "[golden_trace_catalog] gt18 must be daemon-off",
  );

  const paths = goldenTraceArtifactPaths("gt04_plasmid_inject");
  expect(
    paths.traceJson ===
      "verification/traces/gt04_plasmid_inject/trace.json",
    "[golden_trace_catalog] trace artifact path mismatch",
  );
  expect(
    paths.notesMd.endsWith("/notes.md"),
    "[golden_trace_catalog] notes artifact must end with notes.md",
  );

  console.log(
    `[golden_trace_catalog] contract guard passed. scenarios=${GOLDEN_TRACE_CATALOG.length}`,
  );
};

main();

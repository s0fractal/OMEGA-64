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
    GOLDEN_TRACE_CATALOG.length === 9,
    "[golden_trace_catalog] expected 9 baseline scenarios",
  );

  const ids = new Set(GOLDEN_TRACE_CATALOG.map((trace) => trace.id));
  expect(ids.size === 9, "[golden_trace_catalog] ids must be unique");

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

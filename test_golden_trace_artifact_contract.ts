import {
  GOLDEN_TRACE_CATALOG,
  goldenTraceArtifactPaths,
} from "./verification/golden_trace_catalog.ts";

const TRACE_RUNTIME_MODE = "legacy-runtime/api-observer-harness";
const STRUCTURE_INTENT_RUNTIME_MODE = "standalone-structure-intent-capture";
const COLLECTIVE_TRANSPORT_RUNTIME_MODE =
  "standalone-collective-transport-capture";
const SHARE_TRANSFER_RUNTIME_MODE = "standalone-share-transfer-capture";

const main = async () => {
  for (const trace of GOLDEN_TRACE_CATALOG) {
    const paths = goldenTraceArtifactPaths(trace.id);
    for (
      const file of [
        paths.traceJson,
        paths.codexSnapshotJson,
        paths.invariantsJson,
        paths.notesMd,
      ]
    ) {
      const stat = await Deno.stat(file);
      if (!stat.isFile) {
        throw new Error(`[golden_trace_artifacts] missing file: ${file}`);
      }
    }

    const traceJson = JSON.parse(
      await Deno.readTextFile(paths.traceJson),
    ) as Record<string, unknown>;
    if (traceJson.trace_id !== trace.id) {
      throw new Error(
        `[golden_trace_artifacts] trace id mismatch for ${trace.id}: ${String(traceJson.trace_id)}`,
      );
    }
    const expectedRuntimeMode = trace.id === "gt08_structure_intent_visibility"
      ? STRUCTURE_INTENT_RUNTIME_MODE
      : trace.id === "gt09_collective_transport"
      ? COLLECTIVE_TRANSPORT_RUNTIME_MODE
      : trace.id === "gt10_share_transfer"
      ? SHARE_TRANSFER_RUNTIME_MODE
      : TRACE_RUNTIME_MODE;
    if (traceJson.runtime_mode !== expectedRuntimeMode) {
      throw new Error(
        `[golden_trace_artifacts] runtime mode mismatch for ${trace.id}: ${String(traceJson.runtime_mode)}`,
      );
    }
  }

  console.log(
    `[golden_trace_artifacts] contract guard passed. scenarios=${GOLDEN_TRACE_CATALOG.length}`,
  );
};

await main();

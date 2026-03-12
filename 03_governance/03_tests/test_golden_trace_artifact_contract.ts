import {
  GOLDEN_TRACE_CATALOG,
  goldenTraceArtifactPaths,
} from "../../verification/golden_trace_catalog.ts";

const TRACE_RUNTIME_MODE = "legacy-runtime/api-observer-harness";
const STRUCTURE_INTENT_RUNTIME_MODE = "standalone-structure-intent-capture";
const COLLECTIVE_TRANSPORT_RUNTIME_MODE =
  "standalone-collective-transport-capture";
const COLLECTIVE_BANKING_RUNTIME_MODE = "standalone-collective-banking-capture";
const COLLECTIVE_SYNCHRONY_RUNTIME_MODE =
  "standalone-collective-synchrony-capture";
const SHARE_TRANSFER_RUNTIME_MODE = "standalone-share-transfer-capture";
const STRUCTURE_LOCK_RUNTIME_MODE = "standalone-structure-lock-capture";
const STRUCTURE_CHARGE_RUNTIME_MODE = "standalone-structure-charge-capture";
const STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE =
  "standalone-structure-charge-competition-capture";
const STRUCTURE_BUILD_RUNTIME_MODE = "worker-runtime-structure-build-capture";
const STRUCTURE_BUILD_COMPETITION_RUNTIME_MODE =
  "worker-runtime-structure-build-competition-capture";
const STRUCTURE_BUILD_LOCK_RUNTIME_MODE =
  "worker-runtime-structure-build-stale-lock-capture";
const TENSEGRITY_KINEMATICS_RUNTIME_MODE = "standalone-tensegrity-capture";
const BIND_RESOLUTION_RUNTIME_MODE = "standalone-bind-capture";
const QUORUM_SYNC_RUNTIME_MODE = "standalone-quorum-sync-capture";
const INTENT_RESOLUTION_RUNTIME_MODE = "standalone-intent-resolution-capture";
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
        `[golden_trace_artifacts] trace id mismatch for ${trace.id}: ${
          String(traceJson.trace_id)
        }`,
      );
    }
    const expectedRuntimeMode = trace.id === "gt08_structure_intent_visibility"
      ? STRUCTURE_INTENT_RUNTIME_MODE
      : trace.id === "gt09_collective_transport"
      ? COLLECTIVE_TRANSPORT_RUNTIME_MODE
      : trace.id === "gt11_collective_banking"
      ? COLLECTIVE_BANKING_RUNTIME_MODE
      : trace.id === "gt12_collective_synchrony"
      ? COLLECTIVE_SYNCHRONY_RUNTIME_MODE
      : trace.id === "gt10_share_transfer"
      ? SHARE_TRANSFER_RUNTIME_MODE
      : trace.id === "gt13_structure_lock_progress"
      ? STRUCTURE_LOCK_RUNTIME_MODE
      : trace.id === "gt14_structure_charge_resolution"
      ? STRUCTURE_CHARGE_RUNTIME_MODE
      : trace.id === "gt15_structure_charge_competition"
      ? STRUCTURE_CHARGE_COMPETITION_RUNTIME_MODE
      : trace.id === "gt16_runtime_build_materialization"
      ? STRUCTURE_BUILD_RUNTIME_MODE
      : trace.id === "gt17_runtime_build_competition"
      ? STRUCTURE_BUILD_COMPETITION_RUNTIME_MODE
      : trace.id === "gt18_runtime_build_stale_lock"
      ? STRUCTURE_BUILD_LOCK_RUNTIME_MODE
      : trace.id === "gt19_tensegrity_kinematics"
      ? TENSEGRITY_KINEMATICS_RUNTIME_MODE
      : trace.id === "gt20_bind_resolution"
      ? BIND_RESOLUTION_RUNTIME_MODE
      : trace.id === "gt21_quorum_sync"
      ? QUORUM_SYNC_RUNTIME_MODE
      : trace.id === "gt22_intent_resolution"
      ? INTENT_RESOLUTION_RUNTIME_MODE
      : TRACE_RUNTIME_MODE;
    if (traceJson.runtime_mode !== expectedRuntimeMode) {
      throw new Error(
        `[golden_trace_artifacts] runtime mode mismatch for ${trace.id}: ${
          String(traceJson.runtime_mode)
        }`,
      );
    }
  }

  console.log(
    `[golden_trace_artifacts] contract guard passed. scenarios=${GOLDEN_TRACE_CATALOG.length}`,
  );
};

await main();

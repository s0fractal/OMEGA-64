import { buildExportFileList } from "./export_core.ts";

const FORBIDDEN_EXPORT_PATHS: RegExp[] = [
  /^test_.*\.ts$/u,
  /^tests\//u,
  /^archive\//u,
  /^e\//u,
  /^node_modules\//u,
  /^build\//u,
  /^dist\//u,
  /^coverage\//u,
  /^\.git\//u,
  /^OMEGA_CORE_LOGIC\.md$/u,
  /^export_core\.ts$/u,
  /^diag_.*\.ts$/u,
  /^fix_.*\.ts$/u,
  /^WORKER_.*\.(json|md)$/u,
  /\.bak$/u,
];

const REQUIRED_RUNTIME_SURFACE = [
  "AKASHA_SIGNALING.ts",
  "assembly/index.ts",
  "build_wasm.ts",
  "wasm_layout_guard.ts",
  "SYSTEM_START.ts",
  "CONTROL_INTENT_QUEUE.ts",
  "PULSE.ts",
  "PULSE_WORKER.ts",
  "STATE_MATRIX.ts",
  "OFFSETS.ts",
  "ENV_PARSE.ts",
  "RUNTIME_POLICY.ts",
  "DAEMON_INGRESS_POLICY.ts",
  "GATE.ts",
  "AKASHA_CODEX.ts",
  "GATE_VALIDATOR.ts",
  "GATE_MERGER.ts",
  "GATE_BUDGET.ts",
  "GATE_LEDGER.ts",
  "STATE_SNAPSHOT.ts",
  "SHIMS.ts",
  "SOVEREIGNTY_ENGINE.ts",
  "SOVEREIGN_ORACLE.ts",
  "MUTATION_TELEMETRY.ts",
  "SNAPSHOT_ENGINE.ts",
  "LOGGER.ts",
] as const;

const isForbidden = (path: string): boolean =>
  FORBIDDEN_EXPORT_PATHS.some((pattern) => pattern.test(path));

const main = async () => {
  const { files } = await buildExportFileList();
  const fileSet = new Set(files);

  const leaked = files.filter((file) => isForbidden(file));
  if (leaked.length > 0) {
    throw new Error(
      `[export-file-set] forbidden files leaked into export set:\n${
        leaked.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const missingRuntimeSurface = REQUIRED_RUNTIME_SURFACE.filter((file) =>
    !fileSet.has(file)
  );
  if (missingRuntimeSurface.length > 0) {
    throw new Error(
      `[export-file-set] required runtime files missing from export set:\n${
        missingRuntimeSurface.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  console.log(
    `[export-file-set] export set guard passed. files=${files.length}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

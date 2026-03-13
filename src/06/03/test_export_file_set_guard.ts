import { buildExportFileList } from "@07/02/export_core.ts";

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
  "src/06/AKASHA_SIGNALING.ts",
  "src/00/01/assembly/index.ts",
  "src/00/07/build_wasm.ts",
  "src/00/03/wasm_layout_guard.ts",
  "src/07/02/SYSTEM_START.ts",
  "src/03/CONTROL_INTENT_QUEUE.ts",
  "src/02/PULSE.ts",
  "src/02/PULSE_WORKER.ts",
  "src/00/STATE_MATRIX.ts",
  "src/00/ENV_PARSE.ts",
  "src/03/RUNTIME_POLICY.ts",
  "src/03/DAEMON_INGRESS_POLICY.ts",
  "src/01/GLYPH_BUFFER.ts",
  "src/03/GATE.ts",
  "src/06/AKASHA_CODEX.ts",
  "src/03/GATE_VALIDATOR.ts",
  "src/03/GATE_MERGER.ts",
  "src/03/GATE_BUDGET.ts",
  "src/03/GATE_LEDGER.ts",
  "src/00/STATE_SNAPSHOT.ts",
  "src/00/SHIMS.ts",
  "src/03/SOVEREIGNTY_ENGINE.ts",
  "src/05/SOVEREIGN_ORACLE.ts",
  "src/06/MUTATION_TELEMETRY.ts",
  "src/06/SNAPSHOT_ENGINE.ts",
  "src/00/LOGGER.ts",
] as const;

const isForbidden = (path: string): boolean => {
  if (path === "src/00/03/wasm_layout_guard.ts") return false;
  return FORBIDDEN_EXPORT_PATHS.some((pattern) => pattern.test(path));
};

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

import { buildExportFileList } from "../export_core.ts";

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
  "06_akasha/AKASHA_SIGNALING.ts",
  "assembly/index.ts",
  "build_wasm.ts",
  "tests/wasm_layout_guard.ts",
  "SYSTEM_START.ts",
  "03_governance/CONTROL_INTENT_QUEUE.ts",
  "02_metabolism/PULSE.ts",
  "02_metabolism/PULSE_WORKER.ts",
  "00_substrate/STATE_MATRIX.ts",
  "00_substrate/OFFSETS.ts",
  "00_substrate/ENV_PARSE.ts",
  "03_governance/RUNTIME_POLICY.ts",
  "03_governance/DAEMON_INGRESS_POLICY.ts",
  "01_physics/GLYPH_BUFFER.ts",
  "03_governance/GATE.ts",
  "06_akasha/AKASHA_CODEX.ts",
  "03_governance/GATE_VALIDATOR.ts",
  "03_governance/GATE_MERGER.ts",
  "03_governance/GATE_BUDGET.ts",
  "03_governance/GATE_LEDGER.ts",
  "00_substrate/STATE_SNAPSHOT.ts",
  "00_substrate/SHIMS.ts",
  "03_governance/SOVEREIGNTY_ENGINE.ts",
  "05_exocortex/SOVEREIGN_ORACLE.ts",
  "06_akasha/MUTATION_TELEMETRY.ts",
  "06_akasha/SNAPSHOT_ENGINE.ts",
  "00_substrate/LOGGER.ts",
] as const;

const isForbidden = (path: string): boolean => {
  if (path === "tests/wasm_layout_guard.ts") return false;
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

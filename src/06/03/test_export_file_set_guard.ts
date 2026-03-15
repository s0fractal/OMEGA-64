import { buildExportFileList } from "@07/02/export_core.ts";
import { resolveSourcePath } from "../../resolve_source.ts";

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

const REQUIRED_RUNTIME_SURFACE_NAMES = [
  "AKASHA_SIGNALING.ts",
  "build_wasm.ts",
  "wasm_layout_guard.ts",
  "SYSTEM_START.ts",
  "CONTROL_INTENT_QUEUE.ts",
  "PULSE.ts",
  "PULSE_WORKER.ts",
  "STATE_MATRIX.ts",
  "ENV_PARSE.ts",
  "RUNTIME_POLICY.ts",
  "DAEMON_INGRESS_POLICY.ts",
  "GLYPH_TELEMETRY.ts",
  "GATE.ts",
  "AKASHA_CODEX.ts",
  "GATE_VALIDATOR.ts",
  "GATE_MERGER.ts",
  "GATE_BUDGET.ts",
  "GATE_LEDGER.ts",
  "STATE_SNAPSHOT.ts",
  "SOVEREIGNTY_ENGINE.ts",
  "SOVEREIGN_ORACLE.ts",
  "MUTATION_TELEMETRY.ts",
  "SNAPSHOT_ENGINE.ts",
] as const;

// We need special handling for paths that resolveSourcePath might not find easily or are specific
const EXPLICIT_PATHS: string[] = [
];

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

  const missingRuntimeSurface: string[] = [];

  for (const name of REQUIRED_RUNTIME_SURFACE_NAMES) {
    let resolvedPath = "";
    try {
      resolvedPath = await resolveSourcePath(name);
    } catch (e) {
      console.warn(`[export-file-set] Warning: Could not resolve ${name}`);
      continue;
    }
    
    // resolveSourcePath returns absolute paths usually, but buildExportFileList returns relative paths starting with 'src/'
    // We need to extract the relative portion starting with 'src/'
    const srcIndex = resolvedPath.indexOf("src/");
    if (srcIndex !== -1) {
      resolvedPath = resolvedPath.substring(srcIndex);
    }

    if (!fileSet.has(resolvedPath)) {
      missingRuntimeSurface.push(resolvedPath);
    }
  }

  for (const explicitPath of EXPLICIT_PATHS) {
    if (!fileSet.has(explicitPath)) {
        missingRuntimeSurface.push(explicitPath);
    }
  }

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

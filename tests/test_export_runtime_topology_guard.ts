import { buildExportFileList } from "../export_core.ts";

const FORBIDDEN_PATHS: RegExp[] = [
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

const REQUIRED_RUNTIME_CLOSURE_FILES = [
  "SYSTEM_START.ts",
  "02_metabolism/PULSE.ts",
  "03_governance/CONTROL_INTENT_QUEUE.ts",
  "00_substrate/STATE_MATRIX.ts",
  "03_governance/GATE.ts",
] as const;

const isForbidden = (path: string): boolean =>
  FORBIDDEN_PATHS.some((pattern) => pattern.test(path));

const main = async () => {
  const {
    files,
    runtimeRoots,
    runtimeClosureFiles,
    nonRuntimeCodeFiles,
    runtimeSupportCodeFiles,
    experimentalCodeFiles,
  } = await buildExportFileList();

  const exportSet = new Set(files);
  const runtimeClosureSet = new Set(runtimeClosureFiles);

  if (runtimeRoots.length === 0) {
    throw new Error("[export-runtime-topology] runtime roots cannot be empty");
  }
  if (runtimeClosureFiles.length === 0) {
    throw new Error(
      "[export-runtime-topology] runtime closure cannot be empty",
    );
  }

  const missingRuntimeRoots = runtimeRoots.filter((file) =>
    !exportSet.has(file)
  );
  if (missingRuntimeRoots.length > 0) {
    throw new Error(
      `[export-runtime-topology] runtime roots missing from export set:\n${
        missingRuntimeRoots.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const missingRuntimeClosure = runtimeClosureFiles.filter((file) =>
    !exportSet.has(file)
  );
  if (missingRuntimeClosure.length > 0) {
    throw new Error(
      `[export-runtime-topology] runtime closure file missing from export set:\n${
        missingRuntimeClosure.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const requiredMissing = REQUIRED_RUNTIME_CLOSURE_FILES.filter((file) =>
    !runtimeClosureSet.has(file)
  );
  if (requiredMissing.length > 0) {
    throw new Error(
      `[export-runtime-topology] required runtime closure files missing:\n${
        requiredMissing.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const forbiddenRuntimeClosure = runtimeClosureFiles.filter((f) =>
    isForbidden(f)
  );
  if (forbiddenRuntimeClosure.length > 0) {
    throw new Error(
      `[export-runtime-topology] forbidden path leaked into runtime closure:\n${
        forbiddenRuntimeClosure.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const leakedRoots = nonRuntimeCodeFiles.filter((f) =>
    runtimeRoots.includes(f)
  );
  if (leakedRoots.length > 0) {
    throw new Error(
      `[export-runtime-topology] runtime roots cannot be classified as non-runtime code:\n${
        leakedRoots.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }
  const classified = new Set([
    ...runtimeSupportCodeFiles,
    ...experimentalCodeFiles,
  ]);
  const unclassified = nonRuntimeCodeFiles.filter((f) => !classified.has(f));
  if (unclassified.length > 0) {
    throw new Error(
      `[export-runtime-topology] non-runtime code files must be classified:\n${
        unclassified.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  console.log(
    `[export-runtime-topology] runtime topology guard passed. roots=${runtimeRoots.length} closure=${runtimeClosureFiles.length} nonRuntimeCode=${nonRuntimeCodeFiles.length} support=${runtimeSupportCodeFiles.length} experimental=${experimentalCodeFiles.length}`,
  );
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

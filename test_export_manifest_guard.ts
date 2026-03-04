type ExportManifest = {
  era: string;
  runtime_root_files?: string[];
  runtime_support_files?: string[];
  experimental_files?: string[];
  core_entry_files: string[];
  required_additional_files: string[];
  context_files: string[];
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";
const REQUIRED_CONTEXT_FILES = ["ARCHITECTURE_ACTIVE.md"];
const REQUIRED_RUNTIME_ROOT_FILES = [
  "SYSTEM_START.ts",
  "PULSE.ts",
  "AKASHA_SERVER.ts",
  "OMEGA_DAEMON.ts",
];
const REQUIRED_RUNTIME_SUPPORT_FILES = [
  "build_wasm.ts",
  "wasm_layout_guard.ts",
];
const REQUIRED_EXPERIMENTAL_FILES = [
  "LAMBDA_VM.ts",
];
const FORBIDDEN_CONTEXT_FILES = ["ARCHITECTURE.md", "GEMINI.md"];

const EXCLUDE_PATTERNS: RegExp[] = [
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

const isExcluded = (path: string): boolean =>
  EXCLUDE_PATTERNS.some((pattern) => pattern.test(path));

const ensureStringArray = (
  value: unknown,
  field: string,
): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`[manifest] ${field} must be an array`);
  }
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error(`[manifest] ${field} must contain only strings`);
    }
    const p = item.trim();
    if (!p || p.startsWith("/") || p.includes("..")) {
      throw new Error(`[manifest] ${field} has invalid path: ${item}`);
    }
    if (isExcluded(p)) {
      throw new Error(`[manifest] ${field} includes excluded path: ${p}`);
    }
    out.push(p);
  }
  return out;
};

const assertUnique = (items: string[], field: string): void => {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item)) {
      throw new Error(`[manifest] ${field} has duplicate path: ${item}`);
    }
    seen.add(item);
  }
};

const assertFilesExist = async (
  items: string[],
  field: string,
): Promise<void> => {
  const missing: string[] = [];
  for (const item of items) {
    try {
      const stat = await Deno.stat(item);
      if (!stat.isFile) missing.push(item);
    } catch {
      missing.push(item);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `[manifest] ${field} missing on disk:\n${
        missing.map((m) => `- ${m}`).join("\n")
      }`,
    );
  }
};

const main = async () => {
  const raw = await Deno.readTextFile(MANIFEST_PATH);
  const parsed = JSON.parse(raw) as ExportManifest;

  if (typeof parsed.era !== "string" || parsed.era.trim().length === 0) {
    throw new Error("[manifest] era must be a non-empty string");
  }

  const core = ensureStringArray(parsed.core_entry_files, "core_entry_files");
  const runtimeRoots = ensureStringArray(
    parsed.runtime_root_files,
    "runtime_root_files",
  );
  const runtimeSupport = ensureStringArray(
    parsed.runtime_support_files,
    "runtime_support_files",
  );
  const experimental = ensureStringArray(
    parsed.experimental_files,
    "experimental_files",
  );
  const required = ensureStringArray(
    parsed.required_additional_files,
    "required_additional_files",
  );
  const context = ensureStringArray(parsed.context_files, "context_files");

  if (core.length === 0) {
    throw new Error("[manifest] core_entry_files cannot be empty");
  }
  if (runtimeRoots.length === 0) {
    throw new Error("[manifest] runtime_root_files cannot be empty");
  }

  assertUnique(runtimeRoots, "runtime_root_files");
  assertUnique(runtimeSupport, "runtime_support_files");
  assertUnique(experimental, "experimental_files");
  assertUnique(core, "core_entry_files");
  assertUnique(required, "required_additional_files");
  assertUnique(context, "context_files");

  for (const root of REQUIRED_RUNTIME_ROOT_FILES) {
    if (!runtimeRoots.includes(root)) {
      throw new Error(
        `[manifest] runtime_root_files missing required runtime root: ${root}`,
      );
    }
  }
  for (const supportFile of REQUIRED_RUNTIME_SUPPORT_FILES) {
    if (!runtimeSupport.includes(supportFile)) {
      throw new Error(
        `[manifest] runtime_support_files missing required support file: ${supportFile}`,
      );
    }
  }
  for (const experimentalFile of REQUIRED_EXPERIMENTAL_FILES) {
    if (!experimental.includes(experimentalFile)) {
      throw new Error(
        `[manifest] experimental_files missing required file: ${experimentalFile}`,
      );
    }
  }

  for (const requiredContext of REQUIRED_CONTEXT_FILES) {
    if (!context.includes(requiredContext)) {
      throw new Error(
        `[manifest] context_files missing required active doc: ${requiredContext}`,
      );
    }
  }
  for (const forbiddenContext of FORBIDDEN_CONTEXT_FILES) {
    if (context.includes(forbiddenContext)) {
      throw new Error(
        `[manifest] context_files includes legacy doc: ${forbiddenContext}`,
      );
    }
  }

  const runtimeRootSet = new Set(runtimeRoots);
  const coreSet = new Set(core);
  const missingRootInCore = runtimeRoots.filter((x) => !coreSet.has(x));
  if (missingRootInCore.length > 0) {
    throw new Error(
      `[manifest] core_entry_files missing runtime roots:\n${
        missingRootInCore.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }
  const extraCoreEntries = core.filter((x) => !runtimeRootSet.has(x));
  if (extraCoreEntries.length > 0) {
    throw new Error(
      `[manifest] core_entry_files must not include non-runtime roots:\n${
        extraCoreEntries.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  const overlap = required.filter((x) => coreSet.has(x));
  if (overlap.length > 0) {
    throw new Error(
      `[manifest] required_additional_files overlaps core_entry_files:\n${
        overlap.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }
  const runtimeSupportSet = new Set(runtimeSupport);
  const overlapSupportExperimental = experimental.filter((x) =>
    runtimeSupportSet.has(x)
  );
  if (overlapSupportExperimental.length > 0) {
    throw new Error(
      `[manifest] runtime_support_files overlaps experimental_files:\n${
        overlapSupportExperimental.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }
  const supportInRoots = runtimeSupport.filter((x) => runtimeRootSet.has(x));
  if (supportInRoots.length > 0) {
    throw new Error(
      `[manifest] runtime_support_files overlaps runtime_root_files:\n${
        supportInRoots.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }
  const experimentalInRoots = experimental.filter((x) =>
    runtimeRootSet.has(x)
  );
  if (experimentalInRoots.length > 0) {
    throw new Error(
      `[manifest] experimental_files overlaps runtime_root_files:\n${
        experimentalInRoots.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

  await assertFilesExist(runtimeRoots, "runtime_root_files");
  await assertFilesExist(runtimeSupport, "runtime_support_files");
  await assertFilesExist(experimental, "experimental_files");
  await assertFilesExist(core, "core_entry_files");
  await assertFilesExist(required, "required_additional_files");
  await assertFilesExist(context, "context_files");

  const exporter = await Deno.readTextFile("export_core.ts");
  if (!exporter.includes(MANIFEST_PATH)) {
    throw new Error(
      "[manifest] export_core.ts does not reference CORE_ARCH_MANIFEST.json",
    );
  }
  if (!/loadManifest/u.test(exporter)) {
    throw new Error("[manifest] export_core.ts must load manifest at runtime");
  }
  if (!exporter.includes("Manifest SHA256")) {
    throw new Error("[manifest] export_core.ts must emit manifest provenance");
  }
  if (!/renderCoreExport/u.test(exporter)) {
    throw new Error("[manifest] export_core.ts must expose renderCoreExport");
  }
  if (!exporter.includes("Runtime Closure Files")) {
    throw new Error(
      "[manifest] export_core.ts must emit runtime closure provenance",
    );
  }
  if (!exporter.includes("Runtime-Support Code Files")) {
    throw new Error(
      "[manifest] export_core.ts must emit runtime-support classification provenance",
    );
  }
  if (!exporter.includes("Experimental Code Files")) {
    throw new Error(
      "[manifest] export_core.ts must emit experimental classification provenance",
    );
  }

  console.log("[manifest] CORE_ARCH_MANIFEST guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

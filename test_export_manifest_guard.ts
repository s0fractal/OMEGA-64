type ExportManifest = {
  era: string;
  core_entry_files: string[];
  required_additional_files: string[];
  context_files: string[];
};

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";

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
  const required = ensureStringArray(
    parsed.required_additional_files,
    "required_additional_files",
  );
  const context = ensureStringArray(parsed.context_files, "context_files");

  if (core.length === 0) {
    throw new Error("[manifest] core_entry_files cannot be empty");
  }

  assertUnique(core, "core_entry_files");
  assertUnique(required, "required_additional_files");
  assertUnique(context, "context_files");

  const coreSet = new Set(core);
  const overlap = required.filter((x) => coreSet.has(x));
  if (overlap.length > 0) {
    throw new Error(
      `[manifest] required_additional_files overlaps core_entry_files:\n${
        overlap.map((x) => `- ${x}`).join("\n")
      }`,
    );
  }

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

  console.log("[manifest] CORE_ARCH_MANIFEST guard passed.");
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});

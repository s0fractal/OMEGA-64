// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 69)
// Builds OMEGA_CORE_LOGIC.md from the active architecture graph.
// Guards against accidental export drift (tests/archive artifacts).

import { dirname, extname, join, normalize } from "jsr:@std/path";

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

const IMPORT_RE =
  /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["'](\.[^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(\s*["'](\.[^"']+)["']\s*\)/g;

const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

const isExcluded = (path: string): boolean =>
  EXCLUDE_PATTERNS.some((pattern) => pattern.test(path));

const uniqueSorted = (items: Iterable<string>): string[] =>
  Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));

type ExportManifest = {
  era: string;
  runtime_root_files?: string[];
  runtime_support_files?: string[];
  experimental_files?: string[];
  core_entry_files: string[];
  required_additional_files: string[];
  context_files: string[];
};

type LoadedManifest = {
  era: string;
  runtimeRootFiles: string[];
  runtimeSupportFiles: string[];
  experimentalFiles: string[];
  coreEntryFiles: string[];
  requiredArchFiles: string[];
  contextFiles: string[];
};

type ExportProvenance = {
  manifestSha256: string;
  exportSetSha256: string;
  gitCommit: string;
};

const hasTestLikeName = (path: string): boolean =>
  /^test_.*\.ts$/u.test(path) || /^tests\//u.test(path);

const parseManifestStringArray = (
  value: unknown,
  fieldName: string,
): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${MANIFEST_PATH}:${fieldName} must be an array`);
  }
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error(
        `${MANIFEST_PATH}:${fieldName} must contain only strings`,
      );
    }
    const normalized = normalize(item.trim());
    if (
      !normalized || normalized.startsWith("/") || normalized.includes("..")
    ) {
      throw new Error(
        `${MANIFEST_PATH}:${fieldName} has invalid path "${item}"`,
      );
    }
    if (isExcluded(normalized)) {
      throw new Error(
        `${MANIFEST_PATH}:${fieldName} includes excluded path "${normalized}"`,
      );
    }
    if (hasTestLikeName(normalized)) {
      throw new Error(
        `${MANIFEST_PATH}:${fieldName} includes test path "${normalized}"`,
      );
    }
    out.push(normalized);
  }
  return uniqueSorted(out);
};

const loadManifest = async (): Promise<LoadedManifest> => {
  const raw = await Deno.readTextFile(MANIFEST_PATH);
  const parsed = JSON.parse(raw) as ExportManifest;

  const era = typeof parsed?.era === "string" ? parsed.era.trim() : "";
  if (!era) {
    throw new Error(`${MANIFEST_PATH}: era must be a non-empty string`);
  }

  const coreEntryFiles = parseManifestStringArray(
    parsed?.core_entry_files,
    "core_entry_files",
  );
  const runtimeRootFiles = parsed?.runtime_root_files === undefined
    ? coreEntryFiles
    : parseManifestStringArray(
      parsed.runtime_root_files,
      "runtime_root_files",
    );
  const runtimeSupportFiles = parseManifestStringArray(
    parsed?.runtime_support_files,
    "runtime_support_files",
  );
  const experimentalFiles = parseManifestStringArray(
    parsed?.experimental_files,
    "experimental_files",
  );
  const requiredAdditional = parseManifestStringArray(
    parsed?.required_additional_files,
    "required_additional_files",
  );
  const contextFiles = parseManifestStringArray(
    parsed?.context_files,
    "context_files",
  );

  if (coreEntryFiles.length === 0) {
    throw new Error(`${MANIFEST_PATH}: core_entry_files cannot be empty`);
  }
  if (runtimeRootFiles.length === 0) {
    throw new Error(`${MANIFEST_PATH}: runtime_root_files cannot be empty`);
  }
  const coreEntrySet = new Set(coreEntryFiles);
  const runtimeRootSet = new Set(runtimeRootFiles);
  const missingRootInCore = runtimeRootFiles.filter((f) => !coreEntrySet.has(f));
  if (missingRootInCore.length > 0) {
    throw new Error(
      `${MANIFEST_PATH}: core_entry_files must include all runtime_root_files:\n${
        missingRootInCore.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const extraCoreEntries = coreEntryFiles.filter((f) => !runtimeRootSet.has(f));
  if (extraCoreEntries.length > 0) {
    throw new Error(
      `${MANIFEST_PATH}: core_entry_files may only contain runtime_root_files:\n${
        extraCoreEntries.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const runtimeSupportSet = new Set(runtimeSupportFiles);
  const overlapSupportExperimental = experimentalFiles.filter((f) =>
    runtimeSupportSet.has(f)
  );
  if (overlapSupportExperimental.length > 0) {
    throw new Error(
      `${MANIFEST_PATH}: runtime_support_files overlaps experimental_files:\n${
        overlapSupportExperimental.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const supportInRoots = runtimeSupportFiles.filter((f) =>
    runtimeRootSet.has(f)
  );
  if (supportInRoots.length > 0) {
    throw new Error(
      `${MANIFEST_PATH}: runtime_support_files overlaps runtime_root_files:\n${
        supportInRoots.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const experimentalInRoots = experimentalFiles.filter((f) =>
    runtimeRootSet.has(f)
  );
  if (experimentalInRoots.length > 0) {
    throw new Error(
      `${MANIFEST_PATH}: experimental_files overlaps runtime_root_files:\n${
        experimentalInRoots.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const requiredArchFiles = uniqueSorted([
    ...coreEntryFiles,
    ...runtimeSupportFiles,
    ...experimentalFiles,
    ...requiredAdditional,
  ]);
  return {
    era,
    runtimeRootFiles,
    runtimeSupportFiles,
    experimentalFiles,
    coreEntryFiles,
    requiredArchFiles,
    contextFiles,
  };
};

const parseLocalImportSpecifiers = (source: string): string[] => {
  const specs = new Set<string>();

  for (const regex of [IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(source)) !== null) {
      specs.add(match[1]);
    }
  }

  return uniqueSorted(specs);
};

const resolveLocalImport = async (
  fromFile: string,
  specifier: string,
): Promise<string | null> => {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) return null;

  const base = normalize(join(dirname(fromFile), specifier));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.md`,
    `${base}.html`,
  ];

  for (const candidate of uniqueSorted(candidates)) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
};

const languageFor = (file: string): string => {
  const ext = extname(file);
  if (ext === ".ts" || ext === ".tsx") return "typescript";
  if (ext === ".html") return "html";
  if (ext === ".json") return "json";
  return "markdown";
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
};

const readGitCommit = async (): Promise<string> => {
  try {
    const cmd = new Deno.Command("git", {
      args: ["rev-parse", "--short=12", "HEAD"],
      stdout: "piped",
      stderr: "null",
    });
    const { code, stdout } = await cmd.output();
    if (code !== 0) return "unknown";
    const value = new TextDecoder().decode(stdout).trim();
    return value.length > 0 ? value : "unknown";
  } catch {
    return "unknown";
  }
};

const collectDependencyClosure = async (
  entryFiles: string[],
): Promise<{ files: string[]; missing: string[] }> => {
  const queue = [...entryFiles];
  const visited = new Set<string>();
  const missing = new Set<string>();

  while (queue.length > 0) {
    const file = normalize(queue.shift()!);
    if (visited.has(file) || isExcluded(file)) continue;

    if (!(await fileExists(file))) {
      missing.add(file);
      continue;
    }

    visited.add(file);
    if (extname(file) !== ".ts" && extname(file) !== ".tsx") continue;

    const source = await Deno.readTextFile(file);
    const localSpecs = parseLocalImportSpecifiers(source);
    for (const specifier of localSpecs) {
      const resolved = await resolveLocalImport(file, specifier);
      if (!resolved || isExcluded(resolved) || visited.has(resolved)) continue;
      queue.push(resolved);
    }
  }

  return { files: uniqueSorted(visited), missing: uniqueSorted(missing) };
};

export const buildExportFileList = async (): Promise<
  {
    files: string[];
    era: string;
    runtimeRoots: string[];
    runtimeClosureFiles: string[];
    nonRuntimeCodeFiles: string[];
    runtimeSupportCodeFiles: string[];
    experimentalCodeFiles: string[];
  }
> => {
  const manifest = await loadManifest();
  const { files: closureFiles, missing: closureMissing } =
    await collectDependencyClosure(manifest.coreEntryFiles);
  const {
    files: runtimeClosureFiles,
    missing: runtimeClosureMissing,
  } = await collectDependencyClosure(manifest.runtimeRootFiles);

  if (closureMissing.length > 0) {
    throw new Error(
      `Missing core dependency files:\n${
        closureMissing.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  if (runtimeClosureMissing.length > 0) {
    throw new Error(
      `Missing runtime-root dependency files:\n${
        runtimeClosureMissing.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const missingRequiredPaths: string[] = [];
  for (const file of manifest.requiredArchFiles) {
    if (!(await fileExists(file))) {
      missingRequiredPaths.push(file);
    }
  }
  if (missingRequiredPaths.length > 0) {
    throw new Error(
      `Required architecture files missing on disk:\n${
        missingRequiredPaths.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const missingContextPaths: string[] = [];
  for (const file of manifest.contextFiles) {
    if (!(await fileExists(file))) {
      missingContextPaths.push(file);
    }
  }
  if (missingContextPaths.length > 0) {
    throw new Error(
      `Context files missing on disk:\n${
        missingContextPaths.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const combined = new Set<string>(closureFiles);
  for (
    const file of [...manifest.requiredArchFiles, ...manifest.contextFiles]
  ) {
    combined.add(file);
  }

  const files = uniqueSorted(combined).filter((f) => !isExcluded(f));
  const runtimeClosureSet = new Set(runtimeClosureFiles);
  const nonRuntimeCodeFiles = files.filter((f) =>
    [".ts", ".tsx"].includes(extname(f)) && !runtimeClosureSet.has(f)
  );
  const nonRuntimeCodeSet = new Set(nonRuntimeCodeFiles);
  const runtimeSupportCodeFiles = manifest.runtimeSupportFiles.filter((f) =>
    nonRuntimeCodeSet.has(f)
  );
  const experimentalCodeFiles = manifest.experimentalFiles.filter((f) =>
    nonRuntimeCodeSet.has(f)
  );
  const classifiedSet = new Set([
    ...runtimeSupportCodeFiles,
    ...experimentalCodeFiles,
  ]);
  const unclassifiedNonRuntimeCodeFiles = nonRuntimeCodeFiles.filter((f) =>
    !classifiedSet.has(f)
  );
  const missingRequired = manifest.requiredArchFiles.filter((f) =>
    !files.includes(f)
  );
  if (missingRequired.length > 0) {
    throw new Error(
      `Required architecture files missing from export:\n${
        missingRequired.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const leaked = files.filter((f) => isExcluded(f));
  if (leaked.length > 0) {
    throw new Error(
      `Excluded files leaked into export set:\n${
        leaked.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const missingSupportFromExport = manifest.runtimeSupportFiles.filter((f) =>
    !files.includes(f)
  );
  if (missingSupportFromExport.length > 0) {
    throw new Error(
      `runtime_support_files missing from export set:\n${
        missingSupportFromExport.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const missingExperimentalFromExport = manifest.experimentalFiles.filter((f) =>
    !files.includes(f)
  );
  if (missingExperimentalFromExport.length > 0) {
    throw new Error(
      `experimental_files missing from export set:\n${
        missingExperimentalFromExport.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const staleSupportFiles = manifest.runtimeSupportFiles.filter((f) =>
    runtimeClosureSet.has(f)
  );
  if (staleSupportFiles.length > 0) {
    throw new Error(
      `runtime_support_files leaked into active runtime closure:\n${
        staleSupportFiles.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  const staleExperimentalFiles = manifest.experimentalFiles.filter((f) =>
    runtimeClosureSet.has(f)
  );
  if (staleExperimentalFiles.length > 0) {
    throw new Error(
      `experimental_files leaked into active runtime closure:\n${
        staleExperimentalFiles.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }
  if (unclassifiedNonRuntimeCodeFiles.length > 0) {
    throw new Error(
      `Unclassified non-runtime code files detected. Add them to runtime_support_files or experimental_files:\n${
        unclassifiedNonRuntimeCodeFiles.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  return {
    files,
    era: manifest.era,
    runtimeRoots: manifest.runtimeRootFiles,
    runtimeClosureFiles,
    nonRuntimeCodeFiles: uniqueSorted(nonRuntimeCodeFiles),
    runtimeSupportCodeFiles: uniqueSorted(runtimeSupportCodeFiles),
    experimentalCodeFiles: uniqueSorted(experimentalCodeFiles),
  };
};

const buildExportProvenance = async (
  era: string,
  files: string[],
): Promise<ExportProvenance> => {
  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const [manifestSha256, exportSetSha256, gitCommit] = await Promise.all([
    sha256Hex(manifestRaw),
    sha256Hex(`${era}\n${files.join("\n")}`),
    readGitCommit(),
  ]);
  return { manifestSha256, exportSetSha256, gitCommit };
};

export const renderCoreExport = async (): Promise<
  {
    output: string;
    files: string[];
    era: string;
    provenance: ExportProvenance;
    runtimeRoots: string[];
    runtimeClosureFiles: string[];
    nonRuntimeCodeFiles: string[];
    runtimeSupportCodeFiles: string[];
    experimentalCodeFiles: string[];
  }
> => {
  const {
    files,
    era,
    runtimeRoots,
    runtimeClosureFiles,
    nonRuntimeCodeFiles,
    runtimeSupportCodeFiles,
    experimentalCodeFiles,
  } = await buildExportFileList();
  const provenance = await buildExportProvenance(era, files);

  let output = `# OMEGA-64 | CORE LOGIC (ERA ${era}: THE COHERENT LATTICE)\n\n`;
  output += `*Generated: ${new Date().toISOString()}*\n`;
  output += `*Exported Files: ${files.length}*\n`;
  output += `*Runtime Roots: ${runtimeRoots.length}*\n`;
  output += `*Runtime Closure Files: ${runtimeClosureFiles.length}*\n`;
  output += `*Non-Runtime Code Files: ${nonRuntimeCodeFiles.length}*\n`;
  output += `*Runtime-Support Code Files: ${runtimeSupportCodeFiles.length}*\n`;
  output += `*Experimental Code Files: ${experimentalCodeFiles.length}*\n`;
  output += `*Manifest SHA256: ${provenance.manifestSha256}*\n`;
  output += `*Export Set SHA256: ${provenance.exportSetSha256}*\n`;
  output += `*Git Commit: ${provenance.gitCommit}*\n\n---\n\n`;

  output += `## ACTIVE RUNTIME ROOTS\n\n`;
  for (const file of runtimeRoots) {
    output += `- ${file}\n`;
  }
  output += `\n---\n\n`;

  output += `## ACTIVE RUNTIME CLOSURE\n\n`;
  for (const file of runtimeClosureFiles) {
    output += `- ${file}\n`;
  }
  output += `\n---\n\n`;

  output += `## NON-RUNTIME CODE FILES (ALL)\n\n`;
  if (nonRuntimeCodeFiles.length === 0) {
    output += `- none\n`;
  } else {
    for (const file of nonRuntimeCodeFiles) {
      output += `- ${file}\n`;
    }
  }
  output += `\n---\n\n`;

  output += `## NON-RUNTIME CODE FILES | RUNTIME-SUPPORT\n\n`;
  if (runtimeSupportCodeFiles.length === 0) {
    output += `- none\n`;
  } else {
    for (const file of runtimeSupportCodeFiles) {
      output += `- ${file}\n`;
    }
  }
  output += `\n---\n\n`;

  output += `## NON-RUNTIME CODE FILES | EXPERIMENTAL\n\n`;
  if (experimentalCodeFiles.length === 0) {
    output += `- none\n`;
  } else {
    for (const file of experimentalCodeFiles) {
      output += `- ${file}\n`;
    }
  }
  output += `\n---\n\n`;

  for (const file of files) {
    const content = await Deno.readTextFile(file);
    output += `## FILE: ${file}\n\n`;
    output += `\`\`\`${languageFor(file)}\n${content}\n\`\`\`\n\n---\n\n`;
  }

  return {
    output,
    files,
    era,
    provenance,
    runtimeRoots,
    runtimeClosureFiles,
    nonRuntimeCodeFiles,
    runtimeSupportCodeFiles,
    experimentalCodeFiles,
  };
};

async function exportCore() {
  const rendered = await renderCoreExport();
  const { output, files, provenance } = rendered;
  await Deno.writeTextFile("OMEGA_CORE_LOGIC.md", output);
  console.log(
    `✅ OMEGA_CORE_LOGIC.md updated. files=${files.length} testsExcluded=true architectureGuard=true commit=${provenance.gitCommit}`,
  );
}

if (import.meta.main) {
  await exportCore();
}

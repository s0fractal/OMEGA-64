// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 69)
// Builds OMEGA_CORE_LOGIC.md from the active architecture graph.
// Guards against accidental export drift (tests/archive artifacts).

import { dirname, extname, join, normalize } from "@std/path/mod.ts";

const CORE_ENTRY_FILES = [
  "SYSTEM_START.ts",
  "PULSE.ts",
  "PULSE_WORKER.ts",
  "STATE_MATRIX.ts",
  "GATE.ts",
  "STATE_SNAPSHOT.ts",
  "RIBOSOME.ts",
  "RIBOSOME_TICK.ts",
  "IMMUNE.ts",
  "LAMBDA_VM.ts",
  "SPATIAL_HASH.ts",
  "PHYSICS_ENGINE.ts",
  "ECOLOGY_ENGINE.ts",
  "SOVEREIGNTY_ENGINE.ts",
  "SOVEREIGN_ORACLE.ts",
  "LLM_SYNAPSE.ts",
  "SEMANTIC_MEMBRANE.ts",
  "SNAP.ts",
  "SNAPSHOT_ENGINE.ts",
  "BREATH.ts",
  "MATRIX_ENGINE.ts",
  "STRUCTURE_ENGINE.ts",
  "PREDICTION_MARKET.ts",
  "P2P_FEDERATION.ts",
  "P2P_SYNAPSE.ts",
  "AVATAR_ENGINE.ts",
  "REFLECTION_ENGINE.ts",
  "AUDIT_ENGINE.ts",
  "OBSERVER_UI.ts",
  "RECOVERY.ts",
  "PRNG.ts",
  "OFFSETS.ts",
  "mod.ts",
  "SHIMS.ts",
];

const REQUIRED_ARCH_FILES = [
  ...CORE_ENTRY_FILES,
  "worker_gate_thresholds.ts",
  "worker_determinism_capture.ts",
  "worker_resilience_capture.ts",
  "worker_seeded_swarm.ts",
  "worker_trend_math.ts",
  "worker_trend_baseline.ts",
];

const CONTEXT_FILES = [
  "ARCHITECTURE.md",
  "README.md",
  "GEMINI.md",
  "WASM_MIGRATION_RFC.md",
  "WASM_THREADSAFE_ROADMAP.md",
  "AKASHA_SERVER.ts",
  "AKASHA_UI.html",
  "OBSERVER_LAB.ts",
  "ui/index.html",
];

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

const buildExportFileList = async (): Promise<string[]> => {
  const { files: closureFiles, missing: closureMissing } =
    await collectDependencyClosure(CORE_ENTRY_FILES);

  if (closureMissing.length > 0) {
    throw new Error(
      `Missing core dependency files:\n${
        closureMissing.map((f) => `- ${f}`).join("\n")
      }`,
    );
  }

  const combined = new Set<string>(closureFiles);
  for (const file of [...REQUIRED_ARCH_FILES, ...CONTEXT_FILES]) {
    if (isExcluded(file)) continue;
    if (await fileExists(file)) combined.add(file);
  }

  const files = uniqueSorted(combined).filter((f) => !isExcluded(f));
  const missingRequired = REQUIRED_ARCH_FILES.filter((f) => !files.includes(f));
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

  return files;
};

async function exportCore() {
  const files = await buildExportFileList();

  let output = "# OMEGA-64 | CORE LOGIC (ERA 69: THE COHERENT LATTICE)\n\n";
  output += `*Generated: ${new Date().toISOString()}*\n`;
  output += `*Exported Files: ${files.length}*\n\n---\n\n`;

  for (const file of files) {
    const content = await Deno.readTextFile(file);
    output += `## FILE: ${file}\n\n`;
    output += `\`\`\`${languageFor(file)}\n${content}\n\`\`\`\n\n---\n\n`;
  }

  await Deno.writeTextFile("OMEGA_CORE_LOGIC.md", output);
  console.log(
    `✅ OMEGA_CORE_LOGIC.md updated. files=${files.length} testsExcluded=true architectureGuard=true`,
  );
}

if (import.meta.main) {
  await exportCore();
}

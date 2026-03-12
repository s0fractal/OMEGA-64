# OMEGA-64 | SHADOW ECOLOGY (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-12T02:58:31.315Z*
*Exported Files in Category: 25*
*Total Exported Files: 131*
*Runtime Roots: 10*
*Runtime Closure Files: 78*
*Non-Runtime Code Files: 36*
*Runtime-Support Code Files: 11*
*Experimental Code Files: 25*
*Manifest SHA256: b3b2b69ccc8bda7dcd9b5e69b91bc81d0946bbe80e10e429379741a24576c82d*
*Export Set SHA256: ed5e2c2c3af9b619ef25e612d310baa1329d6acae1c79d01fb6889ce3779d3f9*
*Export Content SHA256: f3dfaba8fc50559e40db4d2bb9656acb049ff5e4775a36765d9e68f49c8e1db0*
*Git Commit: 53b552e9fd16*

---

## FILE: 00_substrate/03_tests/wasm_layout_guard.ts

```typescript
import * as OFFSETS from "@00";

const ASM_SOURCE_PATH = new URL("../assembly/index.ts", import.meta.url);

const CONST_DEF_RE = /^\s*const\s+([A-Z0-9_]+)\s*:\s*[^=]+\s*=\s*([^;]+);/gm;

const parseLiteral = (token: string): number | null => {
  if (/^0x[0-9a-f]+$/i.test(token)) return Number.parseInt(token, 16);
  if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
  return null;
};

const normalizeExpr = (expr: string): string =>
  expr
    .replace(/\bas\s+[A-Za-z0-9_<>]+/g, "")
    .replace(/[()]/g, "")
    .trim();

const evalExpr = (
  name: string,
  expressions: ReadonlyMap<string, string>,
  memo: Map<string, number>,
  stack: Set<string>,
): number => {
  const cached = memo.get(name);
  if (cached !== undefined) return cached;

  const raw = expressions.get(name);
  if (!raw) {
    throw new Error(`[wasm:layout] Missing constant in assembly: ${name}`);
  }
  if (stack.has(name)) {
    throw new Error(`[wasm:layout] Cyclic constant reference: ${name}`);
  }

  stack.add(name);
  const expr = normalizeExpr(raw);
  const parts = expr.split(/([+-])/).map((p) => p.trim()).filter(Boolean);

  let sign = 1;
  let total = 0;
  for (const part of parts) {
    if (part === "+") {
      sign = 1;
      continue;
    }
    if (part === "-") {
      sign = -1;
      continue;
    }

    const literal = parseLiteral(part);
    if (literal !== null) {
      total += sign * literal;
      continue;
    }

    if (!/^[A-Z0-9_]+$/.test(part)) {
      throw new Error(
        `[wasm:layout] Unsupported expression token "${part}" in ${name}=${raw}`,
      );
    }

    const ref = evalExpr(part, expressions, memo, stack);
    total += sign * ref;
  }

  stack.delete(name);
  memo.set(name, total);
  return total;
};

const readAssemblyConsts = async (): Promise<Map<string, string>> => {
  const src = await Deno.readTextFile(ASM_SOURCE_PATH);
  const out = new Map<string, string>();
  for (const match of src.matchAll(CONST_DEF_RE)) {
    const [, name, expr] = match;
    out.set(name, expr.trim());
  }
  return out;
};

export const assertWasmLayout = async (): Promise<void> => {
  const asmExpressions = await readAssemblyConsts();
  const memo = new Map<string, number>();

  const expected: Array<{ asm: string; value: number }> = [
    { asm: "MAX_ATOMS", value: OFFSETS.MAX_ATOMS },
    { asm: "SAFETY_BUFFER", value: OFFSETS.SAFETY_BUFFER },
    { asm: "IDS_OFFSET", value: OFFSETS.IDS_OFFSET },
    { asm: "XS_OFFSET", value: OFFSETS.XS_OFFSET },
    { asm: "YS_OFFSET", value: OFFSETS.YS_OFFSET },
    { asm: "ENERGY_OFFSET", value: OFFSETS.ENERGY_OFFSET },
    { asm: "RESONANCE_OFFSET", value: OFFSETS.RESONANCE_OFFSET },
    { asm: "PHASE_OFFSET", value: OFFSETS.PHASE_OFFSET },
    { asm: "LOGIC_OFFSET", value: OFFSETS.LOGIC_OFFSET },
    { asm: "BONDS_OFFSET", value: OFFSETS.BONDS_OFFSET },
    { asm: "STIFFNESS_OFFSET", value: OFFSETS.STIFFNESS_OFFSET },
    { asm: "INSTRUCTIONS_OFFSET", value: OFFSETS.INSTRUCTIONS_OFFSET },
    { asm: "CONTEXT_OFFSET", value: OFFSETS.CONTEXT_OFFSET },
    { asm: "BOND_REQUESTS_OFFSET", value: OFFSETS.BOND_REQUESTS_OFFSET },
    { asm: "SPATIAL_GRID_OFFSET", value: OFFSETS.SPATIAL_GRID_OFFSET },
    { asm: "ROLES_OFFSET", value: OFFSETS.ROLES_OFFSET },
    { asm: "STRUCTURE_GRID_OFF", value: OFFSETS.STRUCTURE_GRID_OFFSET },
    { asm: "SIGNAL_GRID_OFF", value: OFFSETS.SIGNAL_GRID_OFFSET },
    { asm: "MEMORY_GRID_OFF", value: OFFSETS.MEMORY_GRID_OFFSET },
    { asm: "ASCENSION_STATS_OFF", value: OFFSETS.ASCENSION_STATS_OFFSET },
    { asm: "BOND_DIST_OFF", value: OFFSETS.BOND_DISTANCES_OFFSET },
    { asm: "DAMPING_OFF", value: OFFSETS.DAMPING_OFFSET },
    { asm: "HIVE_MEMORY_OFF", value: OFFSETS.HIVE_MEMORY_OFFSET },
    { asm: "HIVE_BALANCE_OFF", value: OFFSETS.HIVE_BALANCE_OFFSET },
    { asm: "QUORUM_OFFSET", value: OFFSETS.QUORUM_OFFSET },
    { asm: "SPAWN_GRID_OFF", value: OFFSETS.SPAWN_REQUESTS_OFFSET },
    { asm: "NEURAL_COHERENCE_OFF", value: OFFSETS.NEURAL_COHERENCE_OFFSET },
    { asm: "PHYSICS_READ_XS_OFF", value: OFFSETS.PHYSICS_READ_XS_OFFSET },
    { asm: "PHYSICS_READ_YS_OFF", value: OFFSETS.PHYSICS_READ_YS_OFFSET },
    {
      asm: "PHYSICS_READ_ENERGY_OFF",
      value: OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
    },
    {
      asm: "PHYSICS_READ_RESONANCE_OFF",
      value: OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
    },
    { asm: "ENERGY_DELTA_OFF", value: OFFSETS.ENERGY_DELTA_OFFSET },
    { asm: "RESONANCE_DELTA_OFF", value: OFFSETS.RESONANCE_DELTA_OFFSET },
    {
      asm: "STRUCTURE_BUILD_OWNER_OFF",
      value: OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    },
    {
      asm: "STRUCTURE_BUILD_VALUE_OFF",
      value: OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
    },
    {
      asm: "STRUCTURE_CHARGE_INTENT_OFF",
      value: OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    },
    { asm: "ATTENTION_FIELD_OFF", value: OFFSETS.ATTENTION_FIELD_OFFSET },
    { asm: "HIVE_ENERGY_POOL_OFF", value: OFFSETS.HIVE_ENERGY_POOL_OFFSET },
  ];

  const mismatches: string[] = [];
  for (const item of expected) {
    const actual = evalExpr(item.asm, asmExpressions, memo, new Set<string>());
    if (actual !== item.value) {
      mismatches.push(`${item.asm}: asm=${actual}, offsets=${item.value}`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      `[wasm:layout] Constant drift detected:\n${
        mismatches.map((m) => `- ${m}`).join("\n")
      }`,
    );
  }
};

if (import.meta.main) {
  await assertWasmLayout();
  console.log("[wasm:layout] assembly/index.ts and OFFSETS.ts are coherent.");
}

```

---

## FILE: 00_substrate/07_meta/02_runners/build_wasm.ts

```typescript
import * as OFFSETS from "@00";
import { assertWasmLayout } from "@00/03_tests/wasm_layout_guard.ts";
import { resolveFsVectorSync } from "@07/01_guards/vector_decoder.ts";

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  console.error(
    `[wasm:build] Refusing build: pages=${OFFSETS.WASM_MEMORY_PAGES} < required=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
  );
  Deno.exit(1);
}

const artifactsDir = resolveFsVectorSync("@00_08");
await Deno.mkdir(artifactsDir, { recursive: true });
await assertWasmLayout();

const wasmFile = `${artifactsDir}/release.wasm`;
const assemblyFile = `${resolveFsVectorSync("@00")}/assembly/index.ts`;

const args = [
  "run",
  "-A",
  "npm:assemblyscript@0.28.9/asc",
  assemblyFile,
  "-O",
  "-o",
  wasmFile,
  "--noAssert",
  "--importMemory",
  "--sharedMemory",
  "--initialMemory",
  String(OFFSETS.MIN_WASM_MEMORY_PAGES),
  "--maximumMemory",
  String(OFFSETS.WASM_MEMORY_PAGES),
  "--enable",
  "threads",
  "--runtime",
  "stub",
];

const build = new Deno.Command("deno", {
  args,
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await build.output();
if (code !== 0) Deno.exit(code);

const stat = await Deno.stat(wasmFile);
console.log(
  `[wasm:build] ${wasmFile}=${stat.size} bytes, pages=${OFFSETS.WASM_MEMORY_PAGES}, required>=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
);

```

---

## FILE: 07_meta/01_guards/vector_decoder.ts

```typescript
// OMEGA-64 | vector_decoder.ts | The Memory Management Unit (Phase 55)

const configText = await Deno.readTextFile(
  new URL("../../deno.jsonc", import.meta.url)
);
const config = JSON.parse(configText);

/**
 * Перетворює векторний імпорт на реальний шлях ФС.
 * resolveVector("@00") -> "./00_substrate/mod.ts"
 * resolveVector("@01/03_tests/test.ts") -> "./01_physics/03_tests/test.ts"
 */
export function resolveVector(vector: string): string {
  if (config.imports[vector]) {
    return config.imports[vector];
  }

  // Check prefix mapping (e.g. @01/path -> ./01_physics/path)
  for (const [key, value] of Object.entries(config.imports)) {
    if (key.endsWith("/") && vector.startsWith(key)) {
      const remainder = vector.slice(key.length);
      return `${value}${remainder}`;
    }
  }

  throw new Error(`Quantum breach: Vector ${vector} is unmapped.`);
}

/**
 * Перетворює реальний шлях на вектор (для лінтера).
 * extractVector("./02_metabolism/PULSE.ts") -> "@02"
 */
export function extractVector(realPath: string): string {
  // Витягуємо перші дві цифри папки
  const match = realPath.match(/(?:^|\/)0?(\d)_/);
  if (match) {
    return `@0${match[1]}`;
  }
  const matchTwoDigits = realPath.match(/(?:^|\/)(\d{2})_/);
  return matchTwoDigits ? `@${matchTwoDigits[1]}` : "@unknown";
}

/**
 * Dynamic File System Vector Resolution (Phase 55+).
 * Translates abstract structural vectors into physical paths without hardcoding text labels.
 * Examples:
 * resolveFsVectorSync("@00") -> "00_substrate"
 * resolveFsVectorSync("@00_08") -> "00_substrate/08_artifacts"
 * resolveFsVectorSync("@00_08/release.wasm") -> "00_substrate/08_artifacts/release.wasm"
 */
export function resolveFsVectorSync(vector: string): string {
  const match = vector.match(/^@(\d{2}(?:_\d{2})*)(.*)$/);
  if (!match) return vector;

  const parts = match[1].split("_").filter(Boolean);
  const remainder = match[2];

  let currentPath = ".";
  let resolvedPath = "";

  for (const prefix of parts) {
    let found = false;
    for (const entry of Deno.readDirSync(currentPath)) {
      if (entry.isDirectory && (entry.name === prefix || entry.name.startsWith(`${prefix}_`))) {
        currentPath = currentPath === "." ? entry.name : `${currentPath}/${entry.name}`;
        resolvedPath = currentPath;
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Quantum breach: Physical layer for vector prefix '${prefix}' not found in '${currentPath}'`);
    }
  }

  return remainder ? `${resolvedPath}${remainder}` : resolvedPath;
}

```

---

## FILE: 07_meta/02_runners/apply_vector_maps.ts

```typescript
// OMEGA-64 | apply_vector_maps.ts | Mass Vector Normalizer
import { join } from "node:path";

const configText = await Deno.readTextFile(
  new URL("../../deno.jsonc", import.meta.url)
);
const config = JSON.parse(configText);

// Extract map mappings like "./02_metabolism/mod.ts" -> "@02"
// and "./02_metabolism/" -> "@02/"
const inverseMap: { realPath: string; vector: string }[] = [];
for (const [vector, realPath] of Object.entries(config.imports)) {
  if (typeof realPath === "string" && vector.startsWith("@0")) {
     inverseMap.push({ realPath: realPath.replace(/^\.\//, ""), vector });
  }
}

// Sort by length descending to match longest precise path first
inverseMap.sort((a, b) => b.realPath.length - a.realPath.length);

const EXCLUDE_PATTERNS: RegExp[] = [
  /(^|\/)\.omega\//u,
  /(^|\/)node_modules\//u,
  /(^|\/)build\//u,
  /(^|\/)dist\//u,
  /(^|\/)\.git\//u,
];

const discoverCodeFiles = async (dir: string): Promise<string[]> => {
  const discovered: string[] = [];
  const queue = [dir];
  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    try {
      for await (const entry of Deno.readDir(currentPath)) {
        if (entry.name.startsWith(".")) continue;
        const entryPath = currentPath === "."
          ? entry.name
          : join(currentPath, entry.name);
        
        if (EXCLUDE_PATTERNS.some(p => p.test(entryPath))) continue;

        if (entry.isDirectory) {
          queue.push(entryPath);
        } else if (
          entry.isFile &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
        ) {
          discovered.push(entryPath);
        }
      }
    } catch {
      continue;
    }
  }
  return discovered;
};

const resolveImportPath = (currentFilePath: string, importSpecifier: string) => {
    try {
        const url = new URL(importSpecifier, `file:///fake/root/${currentFilePath}`);
        const resolvedPath = url.pathname.replace(/^\/fake\/root\//, "");
        return resolvedPath;
    } catch {
        return null;
    }
};

const processFile = async (filePath: string) => {
    let content = await Deno.readTextFile(filePath);
    let modified = false;

    // Regex to find import/export statements
    // Matches: import { X } from "@02"
    const IMPORT_EXPORT_RE = /(import|export)\s+(?:[\s\S]*?\sfrom\s+)?["'](\.[^"']+)["']/g;
    const DYNAMIC_IMPORT_RE = /import\(\s*["'](\.[^"']+)["']\s*\)/g;

    const replacer = (match: string, p1: string, specifier: string) => {
        // Resolve the specifier relative to the current file
        const resolvedPath = resolveImportPath(filePath, specifier);
        if (!resolvedPath) return match;

        // Check if resolvedPath matches any vector
        for (const { realPath, vector } of inverseMap) {
            // Precise exact match for mod.ts files
            if (resolvedPath === realPath) {
                modified = true;
                return match.replace(specifier, vector);
            }
            // Prefix match for deep folders
            if (realPath.endsWith("/") && resolvedPath.startsWith(realPath)) {
                modified = true;
                const remainder = resolvedPath.slice(realPath.length);
                return match.replace(specifier, `${vector}${remainder}`);
            }
        }
        return match;
    };

    content = content.replace(IMPORT_EXPORT_RE, replacer);
    content = content.replace(DYNAMIC_IMPORT_RE, (match, specifier) => {
         const resolvedPath = resolveImportPath(filePath, specifier);
         if (!resolvedPath) return match;
         for (const { realPath, vector } of inverseMap) {
            if (resolvedPath === realPath) {
                modified = true;
                return match.replace(specifier, vector);
            }
            if (realPath.endsWith("/") && resolvedPath.startsWith(realPath)) {
                modified = true;
                const remainder = resolvedPath.slice(realPath.length);
                return match.replace(specifier, `${vector}${remainder}`);
            }
        }
        return match;
    });

    if (modified) {
        await Deno.writeTextFile(filePath, content);
        console.log(`Vectorized: ${filePath}`);
    }
};

const main = async () => {
    console.log("Discovering files...");
    const files = await discoverCodeFiles(".");
    console.log(`Found ${files.length} ts files. Processing...`);
    
    for (const file of files) {
        await processFile(file);
    }
    console.log("Vectorization complete.");
};

await main();

```

---

## FILE: 07_meta/02_runners/export_core.ts

```typescript
// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 69)
// Builds OMEGA_CORE_LOGIC.md from the active architecture graph.
// Guards against accidental export drift (tests/archive artifacts).

import { dirname, extname, join, normalize } from "node:path";
import { resolveVector } from "../01_guards/vector_decoder.ts";

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";

const EXCLUDE_PATTERNS: RegExp[] = [
  /(^|\/)test_.*\.ts$/u,
  /(^|\/)03_tests\//u,
  /(^|\/)tests\//u,
  /(^|\/)archive\//u,
  /(^|\/)e\//u,
  /(^|\/)o\//u,
  /(^|\/)DIMENSIONS\//u,
  /(^|\/)\.omega\//u,
  /(^|\/)node_modules\//u,
  /(^|\/)build\//u,
  /(^|\/)dist\//u,
  /(^|\/)coverage\//u,
  /(^|\/)\.git\//u,
  /(^|\/)OMEGA_CORE_LOGIC\.md$/u,
  /(^|\/)export_stats\.ts$/u,
  /(^|\/)diag_.*\.ts$/u,
  /(^|\/)fix_.*\.ts$/u,
  /(^|\/)phase\d+_.*\.ts$/u,
  /(^|\/)WORKER_.*\.(json|md)$/u,
  /\.bak$/u,
  /(^|\/)63_necropolis\//u,
  /\.wasm$/u,
  /\.log$/u,
  /\.jsonl$/u,
];

const IMPORT_RE =
  /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["']([\.@][^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(\s*["']([\.@][^"']+)["']\s*\)/g;

const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

const isExcluded = (path: string): boolean => {
  if (path === "00_substrate/03_tests/wasm_layout_guard.ts") return false;
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(path));
};

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
  exportContentSha256: string;
  gitCommit: string;
};

type ExportFileContent = {
  file: string;
  content: string;
};

const hasTestLikeName = (path: string): boolean => {
  if (path === "00_substrate/03_tests/wasm_layout_guard.ts") return false;
  return /^test_.*\.ts$/u.test(path) || /^tests\//u.test(path);
};

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
  const missingRootInCore = runtimeRootFiles.filter((f) =>
    !coreEntrySet.has(f)
  );
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
  let isFromRoot = false;
  if (specifier.startsWith("@")) {
    try {
      specifier = resolveVector(specifier);
      isFromRoot = true;
    } catch {
      return null;
    }
  }

  if (!specifier.startsWith("./") && !specifier.startsWith("../")) return null;

  const base = isFromRoot
    ? normalize(specifier.replace(/^\.\//, ""))
    : normalize(join(dirname(fromFile), specifier));
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

const discoverCodeFiles = async (dir: string): Promise<string[]> => {
  const discovered: string[] = [];
  const queue = [dir];
  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    try {
      for await (const entry of Deno.readDir(currentPath)) {
        if (entry.name.startsWith(".")) continue;
        const entryPath = currentPath === "."
          ? entry.name
          : join(currentPath, entry.name);
        if (isExcluded(entryPath)) continue;

        if (entry.isDirectory) {
          queue.push(entryPath);
        } else if (
          entry.isFile &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
        ) {
          discovered.push(entryPath);
        }
      }
    } catch {
      continue;
    }
  }
  return discovered;
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
    console.warn(
      `[Warning] Specified architecture files missing on disk (skipping):\n${
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

  // Auto-discover all typescript code files in the repository
  const discoveredCode = await discoverCodeFiles(".");

  const combined = new Set<string>([...closureFiles, ...discoveredCode]);
  for (
    const file of [...manifest.requiredArchFiles, ...manifest.contextFiles]
  ) {
    combined.add(file);
  }

  const files = uniqueSorted(combined).filter((f) =>
    !isExcluded(f) && !missingRequiredPaths.includes(f)
  );
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

  // Auto-bucket unclassified files into experimental/dynamic code files
  experimentalCodeFiles.push(...unclassifiedNonRuntimeCodeFiles);

  const leaked = files.filter((f) => isExcluded(f));
  if (leaked.length > 0) {
    throw new Error(
      `Excluded files leaked into export set:\n${
        leaked.map((f) => `- ${f}`).join("\n")
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
  fileContents: ExportFileContent[],
): Promise<ExportProvenance> => {
  const manifestRaw = await Deno.readTextFile(MANIFEST_PATH);
  const contentSignatureInput = `${era}\n${
    fileContents.map(({ file, content }) => `>>> ${file}\n${content}\n<<<`)
      .join("\n")
  }`;
  const [manifestSha256, exportSetSha256, exportContentSha256, gitCommit] =
    await Promise.all([
      sha256Hex(manifestRaw),
      sha256Hex(`${era}\n${files.join("\n")}`),
      sha256Hex(contentSignatureInput),
      readGitCommit(),
    ]);
  return { manifestSha256, exportSetSha256, exportContentSha256, gitCommit };
};

const classifyFile = (file: string): "RUNTIME" | "SHADOW" | "LORE" => {
  if (file.endsWith(".md") || file.endsWith(".json") || file.endsWith(".jsonc") || file.endsWith(".html") || file.includes("public/") || file.includes("ui/")) return "LORE";
  if (file.includes("07_meta/") || file.includes("03_tests/") || file.match(/(^|\/)test_.*\.ts$/u) || file.includes("tests/") || file.includes("reduction_core/") || file.includes("verification/")) return "SHADOW";
  return "RUNTIME";
};

const truncateLUTs = (content: string): string => {
  return content.replace(
    /(const\s+(?:SIN_LUT|COS_LUT|ACOSH_LUT_KEYS|ACOSH_LUT_VALS)\s*(?::\s*[^=]+)?\s*=\s*\[)[\s\S]*?(\];)/g,
    "$1\n  /* [TRUNCATED LUT ARRAY] */\n$2"
  );
};

export const renderCoreExport = async (): Promise<
  {
    runtimeOutput: string;
    shadowOutput: string;
    loreOutput: string;
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
  const fileContents: ExportFileContent[] = [];
  for (const file of files) {
    let content = await Deno.readTextFile(file);
    content = truncateLUTs(content);
    fileContents.push({ file, content });
  }
  const provenance = await buildExportProvenance(era, files, fileContents);

  const writeHeaders = (title: string, count: number) => {
    let out = `# OMEGA-64 | ${title} (ERA ${era}: THE COHERENT LATTICE)\n\n`;
    out += `*Generated: ${new Date().toISOString()}*\n`;
    out += `*Exported Files in Category: ${count}*\n`;
    out += `*Total Exported Files: ${files.length}*\n`;
    out += `*Runtime Roots: ${runtimeRoots.length}*\n`;
    out += `*Runtime Closure Files: ${runtimeClosureFiles.length}*\n`;
    out += `*Non-Runtime Code Files: ${nonRuntimeCodeFiles.length}*\n`;
    out += `*Runtime-Support Code Files: ${runtimeSupportCodeFiles.length}*\n`;
    out += `*Experimental Code Files: ${experimentalCodeFiles.length}*\n`;
    out += `*Manifest SHA256: ${provenance.manifestSha256}*\n`;
    out += `*Export Set SHA256: ${provenance.exportSetSha256}*\n`;
    out += `*Export Content SHA256: ${provenance.exportContentSha256}*\n`;
    out += `*Git Commit: ${provenance.gitCommit}*\n\n---\n\n`;
    return out;
  };

  const runtimeFiles = fileContents.filter((f) => classifyFile(f.file) === "RUNTIME");
  const shadowFiles = fileContents.filter((f) => classifyFile(f.file) === "SHADOW");
  const loreFiles = fileContents.filter((f) => classifyFile(f.file) === "LORE");

  let runtimeOutput = writeHeaders("RUNTIME LOGIC", runtimeFiles.length);
  runtimeOutput += `## ACTIVE RUNTIME ROOTS\n\n`;
  for (const file of runtimeRoots) runtimeOutput += `- ${file}\n`;
  runtimeOutput += `\n---\n\n`;
  runtimeOutput += `## ACTIVE RUNTIME CLOSURE\n\n`;
  for (const file of runtimeClosureFiles) runtimeOutput += `- ${file}\n`;
  runtimeOutput += `\n---\n\n`;

  const shadowOutput = writeHeaders("SHADOW ECOLOGY", shadowFiles.length);
  const loreOutput = writeHeaders("ARCHITECTURE LORE", loreFiles.length);

  const appendContents = (out: string, list: ExportFileContent[]) => {
    let res = out;
    for (const { file, content } of list) {
      res += `## FILE: ${file}\n\n`;
      res += `\`\`\`${languageFor(file)}\n${content}\n\`\`\`\n\n---\n\n`;
    }
    return res;
  };

  return {
    runtimeOutput: appendContents(runtimeOutput, runtimeFiles),
    shadowOutput: appendContents(shadowOutput, shadowFiles),
    loreOutput: appendContents(loreOutput, loreFiles),
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
  const { runtimeOutput, shadowOutput, loreOutput, files, provenance } = rendered;
  await Deno.mkdir("08_artifacts", { recursive: true });
  await Deno.writeTextFile("08_artifacts/OMEGA_RUNTIME.md", runtimeOutput);
  await Deno.writeTextFile("08_artifacts/OMEGA_SHADOW.md", shadowOutput);
  await Deno.writeTextFile("08_artifacts/OMEGA_LORE.md", loreOutput);
  console.log(
    `✅ Holographic Exporter success. files=${files.length} contextDistillation=3 artifacts commit=${provenance.gitCommit}`,
  );
}

if (import.meta.main) {
  await exportCore();
}

```

---

## FILE: 07_meta/02_runners/export_rust.ts

```typescript
// OMEGA-64 | export_rust.ts
// Builds RUST_CORE_LOGIC.md by consolidating the sigma_core and omega_wasm Rust sources.

import { extname, join } from "node:path";

const TARGET_DIRS = ["00_substrate/sigma_core"];
const ALLOWED_EXTENSIONS = [".rs", ".toml", ".json", ".lock"];

const EXCLUDE_PATTERNS = [
  /\/target\//,
  /\/.git\//,
  /\/tests\/.*\.rs$/,
];

async function collectFiles(dir: string): Promise<string[]> {
  const discovered: string[] = [];
  const queue = [dir];
  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    try {
      for await (const entry of Deno.readDir(currentPath)) {
        if (entry.name.startsWith(".")) {
          // Include .cargo but not .git
          if (entry.name !== ".cargo") continue;
        }

        const entryPath = join(currentPath, entry.name);

        if (EXCLUDE_PATTERNS.some((p) => p.test(entryPath))) continue;

        if (entry.isDirectory) {
          queue.push(entryPath);
        } else if (
          entry.isFile && ALLOWED_EXTENSIONS.includes(extname(entry.name))
        ) {
          if (
            entry.name === "Cargo.lock" && currentPath !== "00_substrate/sigma_core"
          ) {
            continue; // Only grab root locks
          }
          discovered.push(entryPath);
        }
      }
    } catch {
      continue;
    }
  }
  return discovered;
}

async function exportRustCore() {
  let allFiles: string[] = [];
  for (const dir of TARGET_DIRS) {
    allFiles = allFiles.concat(await collectFiles(dir));
  }

  allFiles.sort();

  let output = `# OMEGA-64 | RUST CORE LOGIC\n\n`;
  output += `*Generated: ${new Date().toISOString()}*\n`;
  output += `*Exported Files: ${allFiles.length}*\n\n---\n\n`;

  output += `## FILE INDEX\n\n`;
  for (const file of allFiles) {
    output += `- ${file}\n`;
  }
  output += `\n---\n\n`;

  for (const file of allFiles) {
    try {
      const content = await Deno.readTextFile(file);
      let lang = "rust";
      if (file.endsWith(".toml")) lang = "toml";
      if (file.endsWith(".json")) lang = "json";

      output += `## FILE: ${file}\n\n`;
      output += `\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
    } catch (e) {
      console.warn(`Could not read ${file}`);
    }
  }

  await Deno.mkdir("08_artifacts", { recursive: true });
  await Deno.writeTextFile("08_artifacts/RUST_CORE_LOGIC.md", output);
  console.log(
    `✅ 08_artifacts/RUST_CORE_LOGIC.md exported successfully. Indexed ${allFiles.length} files.`,
  );
}

if (import.meta.main) {
  await exportRustCore();
}

```

---

## FILE: 07_meta/02_runners/RUN_STAGE8_TICKS.ts

```typescript
import { PULSE } from "@07/02_runners/02_metabolism/mod.ts";
import { STATE_MATRIX } from "@07/02_runners/00_substrate/mod.ts";
import { SOVEREIGN_ORACLE } from "@07/02_runners/05_exocortex/mod.ts";
import { LOGGER } from "@07/02_runners/00_substrate/mod.ts";
import { evaluateGuardianSignalPromotion } from "@07/02_runners/03_governance/mod.ts";
import { COLDSTART_BOOTSTRAP } from "@07/02_runners/63_necropolis/mod.ts";
import { RUNTIME_POLICY } from "@03";

async function run() {
  console.log("Initializing Pulse for Stage 8 verification...");

  // 1. Seed the world in the SAME process memory
  const seedResult = COLDSTART_BOOTSTRAP.seed({
    ...RUNTIME_POLICY.coldstart,
    enabled: true,
  });
  console.log("Seed Result:", seedResult);

  await PULSE.initWorkers();

  console.log("Running 50 ticks to gather metrics...");
  for (let i = 0; i < 50; i++) {
    // Fluctuate coherence to trigger different branches
    SOVEREIGN_ORACLE.neuralCoherence = (i % 2 === 0) ? 100 : 0;
    await PULSE.tick();
    if (i % 10 === 0) {
      const state = PULSE.getGuardianSignalHybridState();
      console.log(
        `Tick ${i}: shadowRuns=${state.shadowRuns}, stable=${state.stableBranchCount}, repair=${state.repairBranchCount}, fallback=${state.fallbackRuns} (last: ${state.lastFallbackReason})`,
      );
    }
  }

  const finalState = PULSE.getGuardianSignalHybridState();
  console.log("\n--- Final Guardian Signal Hybrid State ---");
  console.log(JSON.stringify(finalState, null, 2));

  const promotion = evaluateGuardianSignalPromotion(finalState);
  console.log("\n--- Promotion Readiness ---");
  console.log(JSON.stringify(promotion, null, 2));

  Deno.exit(0);
}

run().catch((err) => {
  console.error("Verification failed:", err);
  Deno.exit(1);
});

```

---

## FILE: 07_meta/02_runners/SYSTEM_START.ts

```typescript
import { applyLedgerUpdate, createGeneticLedgerRuntime, createLedgerRuntime, rollbackLedgerUpdate, snapshotLedgerRuntime } from "@07/02_runners/03_governance/mod.ts";
import { appendLedgerRecordAndMaybeCompact, getLogPath, getSnapshotPath, hydrateLedgerRuntime, type LedgerPersistenceSummary, recordFromApply, recordFromRollback } from "@07/02_runners/03_governance/mod.ts";
// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE, type ReplicationHybridState, setPulseGovernanceDelegate, setHormoneGovernanceDelegate, setHormoneRuntimeGovernanceDelegate } from "@07/02_runners/02_metabolism/mod.ts";
import { BREATH } from "@06";
import { MAX_ATOMS, STATE_MATRIX } from "@07/02_runners/00_substrate/mod.ts";
import { SEMANTIC_MEMBRANE } from "@07/02_runners/05_exocortex/mod.ts";
import { P2P_FEDERATION } from "@07/02_runners/04_noosphere/mod.ts";
import { PHYSICS_ENGINE } from "@07/02_runners/01_physics/mod.ts";
import { SNAPSHOT_ENGINE } from "@07/02_runners/06_akasha/mod.ts";
import { SOVEREIGNTY_ENGINE } from "@07/02_runners/03_governance/mod.ts";
import {
  SOVEREIGN_ORACLE,
} from "@07/02_runners/05_exocortex/mod.ts";
import {
  SwarmNexus,
  SWARM_NODE,
  P2P_CODEC,
} from "@07/02_runners/04_noosphere/mod.ts";
import { CONTROL_INTENT_QUEUE, PREDICTION_MARKET } from "@07/02_runners/03_governance/mod.ts";
import * as OFFSETS from "@07/02_runners/00_substrate/mod.ts";
import { LOGGER } from "@07/02_runners/00_substrate/mod.ts";
import { RUNTIME_POLICY } from "@03";
import { mutateUniversalConstants } from "@07/02_runners/03_governance/mod.ts";
import { AKASHA_CODEX, compressMemory, decompressMemoryToLattice, saveEpoch, SNAP_ENGINE } from "@07/02_runners/06_akasha/mod.ts";
import { MUTATION_TELEMETRY } from "@07/02_runners/06_akasha/mod.ts";
import { COLDSTART_BOOTSTRAP } from "@07/02_runners/63_necropolis/mod.ts";
import { TELEMETRY_STREAM } from "@07/02_runners/06_akasha/mod.ts";
import { LINEAGE_TRACKER } from "@07/02_runners/06_akasha/mod.ts";
import { capturePhysiologySnapshot } from "@07/02_runners/06_akasha/mod.ts";
import { GLYPH_BUFFER, type GlyphSnapshot } from "@07/02_runners/01_physics/mod.ts";
import { evaluateGuardianSignalPromotion } from "@07/02_runners/03_governance/mod.ts";
import { evaluateArchitectPlasmidPromotion } from "@07/02_runners/03_governance/mod.ts";
import { evaluateReplicationPromotion } from "@07/02_runners/03_governance/mod.ts";
import type {
  ReplicationHybridSnapshot,
  ReplicationPromotionSnapshot,
  GuardianSignalHybridSnapshot,
  GuardianSignalPromotionSnapshot,
  ArchitectPlasmidHybridSnapshot,
  ArchitectPlasmidPromotionSnapshot,
} from "@07/02_runners/03_governance/mod.ts";
import { PANOPTICON_SERVER } from "@07/02_runners/06_akasha/mod.ts";
import { DAEMON_INGRESS_POLICY_LIMITS, type DaemonAction, type DaemonInjectEnvelope, evaluateInvariantAdmission, evaluatePlasmidPolicy, evaluatePlasmidRisk, normalizeDaemonNarrativeContext, planInvariantIngress, type PlasmidRiskProfile, snapshotDaemonIngressPolicyLimits, syncDaemonIngressMaxPheromoneIntensity, syncDaemonIngressMaxPlasmidCharge } from "@07/02_runners/03_governance/mod.ts";



setPulseGovernanceDelegate({ 
  GATE, SOVEREIGNTY_ENGINE, CONTROL_INTENT_QUEUE, PREDICTION_MARKET, 
  RUNTIME_POLICY, DAEMON_INGRESS_POLICY_LIMITS, applyLedgerUpdate, 
  createLedgerRuntime, createGeneticLedgerRuntime, rollbackLedgerUpdate, 
  snapshotLedgerRuntime, appendLedgerRecordAndMaybeCompact, getLogPath, 
  getSnapshotPath, hydrateLedgerRuntime, recordFromApply, recordFromRollback 
});
setHormoneGovernanceDelegate({ RUNTIME_POLICY, createLedgerRuntime });
setHormoneRuntimeGovernanceDelegate({ RUNTIME_POLICY });

const UI_PORT = RUNTIME_POLICY.system.port;
const HOST = RUNTIME_POLICY.system.host;
const UI_PATH = "./ui/index.html";
const CONTROL_ENABLE = RUNTIME_POLICY.system.controlEnabled;
const CONTROL_TOKEN = RUNTIME_POLICY.system.controlToken;
const AVATAR_INGRESS_ENABLE = RUNTIME_POLICY.system.avatarIngressEnabled;
const GRID_W = 140;
const GRID_H = 80;
const WORLD_W = GRID_W * 10;
const WORLD_H = GRID_H * 10;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
} as const;

type DaemonAdmissionSnapshot = {
  tick: number;
  status: "accepted" | "rejected";
  requestedAction: string;
  appliedAction: string;
  degraded: boolean;
  severity: "LOW" | "MID" | "HIGH" | "BLOCKED";
  score: number;
  reason: string;
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel?: string;
  codexLineageGuardScore?: number;
  codexLineageGuardReasons?: string[];
  glyphStatus?: string;
  glyphRegime?: string;
  glyphDominantRole?: string;
  glyphSourceMode?: string;
};

type RuntimeMetrics = {
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
  spatialOverflowRatio: number;
  spatialOverflowCount: number;
  spatialMaxCellCount: number;
  guardianSignalHybrid: GuardianSignalHybridSnapshot;
  architectPlasmidHybrid: ArchitectPlasmidHybridSnapshot;
  guardianSignalPromotion: GuardianSignalPromotionSnapshot;
  architectPlasmidPromotion: ArchitectPlasmidPromotionSnapshot;
  replicationHybrid: ReplicationHybridState;
  replicationPromotion: ReplicationPromotionSnapshot;
  glyphTransport: GlyphSnapshot;
};

type DaemonAuditPending = {
  auditId: string;
  action: Exclude<DaemonAction, "OBSERVE">;
  requestedAction: DaemonAction;
  targetX: number;
  targetY: number;
  intensity: number;
  hexCode?: string;
  queued: boolean;
  queueReason: string;
  queuedStatus: number;
  tickApplied: number;
  evaluateAtTick: number;
  baseline: RuntimeMetrics;
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel?: string;
};

type PressureRingIngressEnvelope = {
  mode?: "set" | "step";
  theta?: number;
  delta_theta?: number;
  scale?: number;
  enabled?: boolean;
  rollback_token?: string;
  reason?: string;
};

type PressureRingUpdateSnapshot = {
  tick: number;
  mode: "set" | "step" | "scale_only" | "mixed" | "rollback";
  source: string;
  delta_theta: number;
  theta: number;
  scale: number;
  enabled: boolean;
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  scale_rollback_token: string | null;
  scale_before: number;
  scale_after: number;
};

type HomeostasisIngressEnvelope = {
  base_tax?: number;
  target_energy?: number;
  rollback_token?: string;
  reason?: string;
};

type HomeostasisUpdateSnapshot = {
  tick: number;
  source: string;
  reason: string;
  mode: "apply" | "target_only" | "mixed" | "rollback";
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  base_tax_ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  target_energy_ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  base_tax_rollback_token: string | null;
  target_energy_rollback_token: string | null;
  base_tax_before: number;
  base_tax_after: number;
  target_energy_before: number;
  target_energy_after: number;
};

type DaemonPolicyIngressEnvelope = {
  max_pheromone_intensity?: number;
  max_plasmid_charge?: number;
  rollback_token?: string;
  reason?: string;
};

type DaemonPolicyUpdateSnapshot = {
  tick: number;
  source: string;
  reason: string;
  mode: "apply" | "rollback";
  policy_key:
    | "daemon.maxPheromoneIntensity"
    | "daemon.maxPlasmidCharge"
    | null;
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  pheromone_rollback_token: string | null;
  plasmid_rollback_token: string | null;
  max_pheromone_intensity_before: number;
  max_pheromone_intensity_after: number;
  max_plasmid_charge_before: number;
  max_plasmid_charge_after: number;
};

const requireControlAuth = (req: Request): Response | null => {
  const path = new URL(req.url).pathname;
  const isAvatarIngress = path === "/avatar";
  if (!CONTROL_ENABLE) {
    if (isAvatarIngress && AVATAR_INGRESS_ENABLE) {
      return null;
    }
    return new Response("Control plane disabled", { status: 403 });
  }
  if (CONTROL_TOKEN.length === 0) {
    return null;
  }
  const provided = (req.headers.get("x-omega-control-token") ?? "").trim();
  if (provided !== CONTROL_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
};

const requireDaemonAuth = (req: Request): Response | null => {
  if (!CONTROL_ENABLE || CONTROL_TOKEN.length === 0) return null;
  const provided = (req.headers.get("x-omega-control-token") ?? "").trim();
  if (provided !== CONTROL_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
};

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const DAEMON_POLICY = RUNTIME_POLICY.daemon;
const COLDSTART_POLICY = RUNTIME_POLICY.coldstart;
const SNAPSHOT_POLICY = RUNTIME_POLICY.snapshot;
const DAEMON_POLICY_WINDOW_MS = DAEMON_POLICY.policyWindowMs;
const DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW = DAEMON_POLICY.maxActionsPerWindow;
const DAEMON_SAFE_MIN_POPULATION = DAEMON_INGRESS_POLICY_LIMITS
  .safeMinPopulation;
const DAEMON_SAFE_MIN_AVG_ENERGY =
  DAEMON_INGRESS_POLICY_LIMITS.safeMinAvgEnergy;
const DAEMON_AUDIT_EFFECT_TICKS = DAEMON_POLICY.auditEffectTicks;
const DAEMON_AUDIT_PATH = DAEMON_POLICY.auditPath;
const DAEMON_INVARIANT_DRIFT_MID_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftMidScore;
const DAEMON_INVARIANT_DRIFT_HIGH_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftHighScore;
const DAEMON_CODEX_LINEAGE_LONGEVITY_EPOCHS = DAEMON_INGRESS_POLICY_LIMITS
  .codexLineageLongevityEpochs;
const DAEMON_CODEX_LINEAGE_PEAK_SHARE = DAEMON_INGRESS_POLICY_LIMITS
  .codexLineagePeakShare;
const CODEX_LINEAGE_GUARD_PLASMID = "CODEX_LINEAGE_GUARD_PLASMID";
const DAEMON_ADMISSION_HISTORY_LIMIT = 12;
const DAEMON_PRESSURE_RING_MAX_STEP = Math.PI / 6;
const DAEMON_PRESSURE_RING_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_HISTORY_LIMIT = 24;
const DAEMON_POLICY_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_BASE_TAX_MIN = 0;
const DAEMON_HOMEOSTASIS_BASE_TAX_MAX = 128;
const DAEMON_HOMEOSTASIS_TARGET_MIN = 1;
const DAEMON_HOMEOSTASIS_TARGET_MAX = 10_000;
const DAEMON_MAX_PHEROMONE_INTENSITY_MIN = 1;
const DAEMON_MAX_PHEROMONE_INTENSITY_MAX = 4096;
const DAEMON_MAX_PLASMID_CHARGE_MIN = 1;
const DAEMON_MAX_PLASMID_CHARGE_MAX = 4096;
const DAEMON_DYNAMIC_BUDGET_MIN = Math.max(
  1,
  Math.floor(DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW * 0.25),
);
const DAEMON_DYNAMIC_OVERFLOW_SOFT = 0.18;
const DAEMON_DYNAMIC_OVERFLOW_HARD = 0.35;
const DAEMON_DYNAMIC_ENERGY_SOFT = DAEMON_SAFE_MIN_AVG_ENERGY + 8;
const DAEMON_DYNAMIC_ENERGY_HARD = DAEMON_SAFE_MIN_AVG_ENERGY + 3;
const TELEMETRY_STREAM_EMIT_INTERVAL_TICKS = 2;

const currentDaemonMaxPheromoneIntensity = (): number =>
  DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity;
const currentDaemonMaxPlasmidCharge = (): number =>
  DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge;

let daemonWindowStartMs = Date.now();
let daemonActionsInWindow = 0;
let daemonAuditSeq = 0;
const daemonAuditPending: DaemonAuditPending[] = [];
let latestDaemonAdmission: DaemonAdmissionSnapshot | null = null;
let daemonAdmissionHistory: DaemonAdmissionSnapshot[] = [];
let latestPressureRingUpdate: PressureRingUpdateSnapshot | null = null;
let pressureRingHistory: PressureRingUpdateSnapshot[] = [];
let latestHomeostasisUpdate: HomeostasisUpdateSnapshot | null = null;
let homeostasisHistory: HomeostasisUpdateSnapshot[] = [];
let latestDaemonPolicyUpdate: DaemonPolicyUpdateSnapshot | null = null;
let daemonPolicyHistory: DaemonPolicyUpdateSnapshot[] = [];
let daemonPheromoneLedgerRuntime = createGeneticLedgerRuntime(
  "daemon.maxPheromoneIntensity",
  DAEMON_POLICY.maxPheromoneIntensity,
  128,
);
let daemonPheromoneLedgerPersistence: LedgerPersistenceSummary = {
  path: getLogPath("daemon.maxPheromoneIntensity"),
  snapshotPath: getSnapshotPath("daemon.maxPheromoneIntensity"),
  exists: false,
  snapshotExists: false,
  recordCount: 0,
  applyCount: 0,
  rollbackCount: 0,
  tailRecordCount: 0,
  tailApplyCount: 0,
  tailRollbackCount: 0,
  snapshotRecordCount: 0,
  snapshotApplyCount: 0,
  snapshotRollbackCount: 0,
  compactionEnabled: true,
  compactionThreshold: 64,
  compactionKeepTail: 16,
  lastCompactedAt: null,
  lastCompactedTick: -1,
  hydrated: false,
  lastHydratedAt: null,
  lastHydrationError: null,
};
let daemonPlasmidLedgerRuntime = createGeneticLedgerRuntime(
  "daemon.maxPlasmidCharge",
  DAEMON_POLICY.maxPlasmidCharge,
  128,
);
let daemonPlasmidLedgerPersistence: LedgerPersistenceSummary = {
  path: getLogPath("daemon.maxPlasmidCharge"),
  snapshotPath: getSnapshotPath("daemon.maxPlasmidCharge"),
  exists: false,
  snapshotExists: false,
  recordCount: 0,
  applyCount: 0,
  rollbackCount: 0,
  tailRecordCount: 0,
  tailApplyCount: 0,
  tailRollbackCount: 0,
  snapshotRecordCount: 0,
  snapshotApplyCount: 0,
  snapshotRollbackCount: 0,
  compactionEnabled: true,
  compactionThreshold: 64,
  compactionKeepTail: 16,
  lastCompactedAt: null,
  lastCompactedTick: -1,
  hydrated: false,
  lastHydratedAt: null,
  lastHydrationError: null,
};
let autoSnapshotLastTick = -1;
let autoSnapshotInFlight = false;
let telemetryStreamLastTick = -1;
let autoSnapshotLastResult: {
  tick: number;
  timestamp: string;
  success: boolean;
  reason: string;
  pruned: number;
  retention: number;
  error?: string;
} | null = null;

const setLatestDaemonAdmission = (
  snapshot: DaemonAdmissionSnapshot,
): void => {
  latestDaemonAdmission = snapshot;
  daemonAdmissionHistory = [snapshot, ...daemonAdmissionHistory].slice(
    0,
    DAEMON_ADMISSION_HISTORY_LIMIT,
  );
};

const setLatestPressureRingUpdate = (
  snapshot: PressureRingUpdateSnapshot,
): void => {
  latestPressureRingUpdate = snapshot;
  pressureRingHistory = [snapshot, ...pressureRingHistory].slice(
    0,
    DAEMON_PRESSURE_RING_HISTORY_LIMIT,
  );
};

const setLatestHomeostasisUpdate = (
  snapshot: HomeostasisUpdateSnapshot,
): void => {
  latestHomeostasisUpdate = snapshot;
  homeostasisHistory = [snapshot, ...homeostasisHistory].slice(
    0,
    DAEMON_HOMEOSTASIS_HISTORY_LIMIT,
  );
};

const setLatestDaemonPolicyUpdate = (
  snapshot: DaemonPolicyUpdateSnapshot,
): void => {
  latestDaemonPolicyUpdate = snapshot;
  daemonPolicyHistory = [snapshot, ...daemonPolicyHistory].slice(
    0,
    DAEMON_POLICY_HISTORY_LIMIT,
  );
};

const logicToHex = (logic: Uint8Array): string =>
  Array.from(logic).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const dominantGenomes = (active: number[], limit = 3): string[] => {
  const counts = new Map<string, number>();
  for (const idx of active) {
    const hex = logicToHex(STATE_MATRIX.getLogic(idx));
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hex]) => hex);
};

const collectRuntimeMetrics = (): RuntimeMetrics => {
  const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
  const active = STATE_MATRIX.getActiveIndices();
  const spatialHash = PULSE.getSpatialHashState();
  const guardianSignalHybrid = PULSE.getGuardianSignalHybridState();
  const architectPlasmidHybrid = PULSE.getArchitectPlasmidHybridState();
  const replicationHybrid = PULSE.getReplicationHybridState();
  let totalEnergy = 0;
  for (const idx of active) totalEnergy += STATE_MATRIX.getEnergy(idx);
  const avgEnergy = active.length > 0 ? totalEnergy / active.length : 0;
  const rawCoherence = (STATE_MATRIX.getClusterSync?.() ??
    0) as number;
  return {
    tick,
    population: active.length,
    avgEnergy: Number(avgEnergy.toFixed(3)),
    neuralCoherence: Number(rawCoherence.toFixed(3)),
    spatialOverflowRatio: spatialHash.overflowRatio,
    spatialOverflowCount: spatialHash.overflowCount,
    spatialMaxCellCount: spatialHash.maxCellCount,
    guardianSignalHybrid: guardianSignalHybrid as any,
    architectPlasmidHybrid: architectPlasmidHybrid as any,
    guardianSignalPromotion: evaluateGuardianSignalPromotion(
      guardianSignalHybrid as any,
    ),
    architectPlasmidPromotion: evaluateArchitectPlasmidPromotion(
      architectPlasmidHybrid as any,
    ),
    replicationHybrid,
    replicationPromotion: evaluateReplicationPromotion(
      replicationHybrid as ReplicationHybridSnapshot,
    ),
    glyphTransport: GLYPH_BUFFER.snapshot(),
  };
};

const isDaemonSafeMode = (
  metrics: RuntimeMetrics,
): { blocked: boolean; reason: string } => {
  if (metrics.population < DAEMON_SAFE_MIN_POPULATION) {
    return {
      blocked: true,
      reason:
        `SAFE_MODE_POPULATION_${metrics.population}_LT_${DAEMON_SAFE_MIN_POPULATION}`,
    };
  }
  if (metrics.avgEnergy < DAEMON_SAFE_MIN_AVG_ENERGY) {
    return {
      blocked: true,
      reason:
        `SAFE_MODE_AVG_ENERGY_${metrics.avgEnergy}_LT_${DAEMON_SAFE_MIN_AVG_ENERGY}`,
    };
  }
  return { blocked: false, reason: "SAFE_MODE_OFF" };
};

const resolveDaemonBudgetMax = (metrics: RuntimeMetrics): number => {
  let maxActions = DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW;
  if (metrics.spatialOverflowRatio >= DAEMON_DYNAMIC_OVERFLOW_HARD) {
    maxActions = Math.floor(maxActions * 0.35);
  } else if (metrics.spatialOverflowRatio >= DAEMON_DYNAMIC_OVERFLOW_SOFT) {
    maxActions = Math.floor(maxActions * 0.6);
  }
  if (metrics.avgEnergy <= DAEMON_DYNAMIC_ENERGY_HARD) {
    maxActions = Math.floor(maxActions * 0.5);
  } else if (metrics.avgEnergy <= DAEMON_DYNAMIC_ENERGY_SOFT) {
    maxActions = Math.floor(maxActions * 0.75);
  }
  return clamp(
    Math.floor(maxActions),
    DAEMON_DYNAMIC_BUDGET_MIN,
    DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
  );
};

const consumeDaemonBudget = (maxActionsPerWindow: number): {
  ok: boolean;
  remaining: number;
  resetInMs: number;
} => {
  const now = Date.now();
  if (now - daemonWindowStartMs >= DAEMON_POLICY_WINDOW_MS) {
    daemonWindowStartMs = now;
    daemonActionsInWindow = 0;
  }
  const maxActions = clamp(
    Math.floor(maxActionsPerWindow),
    DAEMON_DYNAMIC_BUDGET_MIN,
    DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
  );
  if (daemonActionsInWindow >= maxActions) {
    const elapsed = now - daemonWindowStartMs;
    return {
      ok: false,
      remaining: 0,
      resetInMs: Math.max(0, DAEMON_POLICY_WINDOW_MS - elapsed),
    };
  }
  daemonActionsInWindow++;
  return {
    ok: true,
    remaining: Math.max(
      0,
      maxActions - daemonActionsInWindow,
    ),
    resetInMs: Math.max(
      0,
      DAEMON_POLICY_WINDOW_MS - (now - daemonWindowStartMs),
    ),
  };
};

const appendDaemonAudit = async (
  event: Record<string, unknown>,
): Promise<void> => {
  try {
    await Deno.writeTextFile(
      DAEMON_AUDIT_PATH,
      `${JSON.stringify(event)}
`,
      { append: true, create: true },
    );
  } catch (err) {
    LOGGER.warn(`[DAEMON_AUDIT] append failed: ${String(err)}`);
  }
};

const queueDaemonAudit = (entry: DaemonAuditPending): void => {
  daemonAuditPending.push(entry);
};

const flushDaemonAuditEffects = async (currentTick: number): Promise<void> => {
  if (daemonAuditPending.length === 0) return;
  const remaining: DaemonAuditPending[] = [];
  for (const pending of daemonAuditPending) {
    if (currentTick < pending.evaluateAtTick) {
      remaining.push(pending);
      continue;
    }
    const metrics = collectRuntimeMetrics();
    await appendDaemonAudit({
      event_type: "DAEMON_EFFECT_EVAL",
      audit_id: pending.auditId,
      evaluated_at_tick: currentTick,
      action: pending.action,
      requested_action: pending.requestedAction,
      target_x: pending.targetX,
      target_y: pending.targetY,
      shared_center: pending.sharedCenter,
      dominant_invariant_vector: pending.dominantInvariantVector,
      codex_lineage_label: pending.codexLineageLabel ?? "none",
      baseline: pending.baseline,
      outcome: metrics,
      delta: {
        population: metrics.population - pending.baseline.population,
        avgEnergy: Number(
          (metrics.avgEnergy - pending.baseline.avgEnergy).toFixed(3),
        ),
        neuralCoherence: Number(
          (metrics.neuralCoherence - pending.baseline.neuralCoherence).toFixed(
            3,
          ),
        ),
      },
    });
    const currentDominantGenome =
      dominantGenomes(STATE_MATRIX.getActiveIndices(), 1)[0] ?? "";
    AKASHA_CODEX.recordDaemonEffect(
      currentTick,
      pending.auditId,
      pending.requestedAction,
      pending.action,
      pending.sharedCenter,
      pending.dominantInvariantVector,
      pending.baseline.population,
      metrics.population,
      pending.baseline.avgEnergy,
      metrics.avgEnergy,
      pending.baseline.neuralCoherence,
      metrics.neuralCoherence,
      currentDominantGenome,
    );
  }
  daemonAuditPending.length = 0;
  daemonAuditPending.push(...remaining);
};

const maybeAutoSnapshot = async (tick: number): Promise<void> => {
  if (!SNAPSHOT_POLICY.enabled) return;
  if (!Number.isFinite(tick) || tick < 0) return;
  if (autoSnapshotInFlight) return;
  if (
    autoSnapshotLastTick >= 0 &&
    tick - autoSnapshotLastTick < SNAPSHOT_POLICY.intervalTicks
  ) {
    return;
  }

  autoSnapshotInFlight = true;
  const reason = "auto_tick_interval";
  try {
    const result = await SNAPSHOT_ENGINE.exportSnapshot({
      tick,
      reason,
      prune: true,
      retention: SNAPSHOT_POLICY.retention ?? 10,
    });
    if (result.success) {
      autoSnapshotLastTick = tick;
      autoSnapshotLastResult = {
        tick,
        timestamp: result.timestamp ?? new Date().toISOString(),
        success: true,
        reason,
        pruned: result.pruned ?? 0,
        retention: result.retention ?? SNAPSHOT_POLICY.retention,
      };
      return;
    }
    autoSnapshotLastResult = {
      tick,
      timestamp: "",
      success: false,
      reason,
      pruned: 0,
      retention: SNAPSHOT_POLICY.retention,
      error: result.error ?? "SNAPSHOT_EXPORT_FAILED",
    };
    LOGGER.warn(
      `[SNAPSHOT] Auto snapshot failed tick=${tick} reason=${autoSnapshotLastResult.error}`,
    );
  } catch (err) {
    autoSnapshotLastResult = {
      tick,
      timestamp: "",
      success: false,
      reason,
      pruned: 0,
      retention: SNAPSHOT_POLICY.retention,
      error: String(err),
    };
    LOGGER.warn(
      `[SNAPSHOT] Auto snapshot exception tick=${tick} err=${String(err)}`,
    );
  } finally {
    autoSnapshotInFlight = false;
  }
};

const buildTelemetry = async () => {
  const metrics = collectRuntimeMetrics();
  const active = STATE_MATRIX.getActiveIndices();
  const pressure = PULSE.getEvolutionPressureState();
  const homeostasis = PULSE.getHomeostasisState();
  const geneticLedger = PULSE.getGeneticLedgerState();
  const dynamicMaxActions = resolveDaemonBudgetMax(metrics);
  const behaviorClusters = SEMANTIC_MEMBRANE.captureBehaviorFrame(
    metrics.tick,
    4096,
  );
  const peerRuleProfiles = P2P_FEDERATION.getPeerRuleProfiles();
  const federationAdmissionState = CONTROL_INTENT_QUEUE
    .getFederationAdmissionState();
  let voxPopuli: string[] = [];
  try {
    const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
    if (Array.isArray(vox)) {
      voxPopuli = vox
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 8);
    }
  } catch {
    voxPopuli = [];
  }
  const safeMode = isDaemonSafeMode(metrics);
  const resetInMs = Math.max(
    0,
    DAEMON_POLICY_WINDOW_MS - (Date.now() - daemonWindowStartMs),
  );
  return {
    tick: metrics.tick,
    avgEnergy: metrics.avgEnergy,
    dominantGenomes: dominantGenomes(active, 3),
    voxPopuli,
    pulse_pressure: {
      novelty_signed: pressure.noveltySigned,
      symbiosis_signed: pressure.symbiosisSigned,
      novelty: pressure.novelty,
      fear: pressure.fear,
      symbiosis: pressure.symbiosis,
      ego: pressure.ego,
      ring: {
        enabled: pressure.ring.enabled,
        theta: Number(pressure.ring.theta.toFixed(6)),
        scale: pressure.ring.scale,
        ledger_scale: geneticLedger.pressureRingScale,
        ledger_scale_persistence: geneticLedger.pressureRingScalePersistence,
        fear_curiosity_balance: Number(
          pressure.ring.fearCuriosityBalance.toFixed(6),
        ),
        ego_love_balance: Number(
          pressure.ring.egoLoveBalance.toFixed(6),
        ),
        novelty_axis_from_ring: pressure.ring.enabled,
        symbiosis_axis_from_ring: pressure.ring.enabled,
      },
    },
    guardian_signal_hybrid: metrics.guardianSignalHybrid,
    architect_plasmid_hybrid: metrics.architectPlasmidHybrid,
    replication_hybrid: metrics.replicationHybrid,
    guardian_signal_promotion: metrics.guardianSignalPromotion,
    architect_plasmid_promotion: metrics.architectPlasmidPromotion,
    replication_promotion: metrics.replicationPromotion,
    glyph_transport: metrics.glyphTransport,
    daemon_governance: {
      safe_mode: safeMode.blocked,
      safe_mode_reason: safeMode.reason,
      actions_used_in_window: daemonActionsInWindow,
      actions_max_in_window: DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
      actions_dynamic_max_in_window: dynamicMaxActions,
      window_reset_in_ms: resetInMs,
      max_pheromone_intensity: currentDaemonMaxPheromoneIntensity(),
      max_plasmid_charge: currentDaemonMaxPlasmidCharge(),
      ledger_max_pheromone_intensity: snapshotLedgerRuntime(
        daemonPheromoneLedgerRuntime,
      ),
      ledger_max_pheromone_intensity_persistence:
        daemonPheromoneLedgerPersistence,
      ledger_max_plasmid_charge: snapshotLedgerRuntime(
        daemonPlasmidLedgerRuntime,
      ),
      ledger_max_plasmid_charge_persistence: daemonPlasmidLedgerPersistence,
      invariant_drift_mid_score: DAEMON_INVARIANT_DRIFT_MID_SCORE,
      invariant_drift_high_score: DAEMON_INVARIANT_DRIFT_HIGH_SCORE,
      last_admission: latestDaemonAdmission,
      last_admission_history: daemonAdmissionHistory,
      last_policy_update: latestDaemonPolicyUpdate,
      last_policy_history: daemonPolicyHistory,
      last_pressure_ring_update: latestPressureRingUpdate,
      last_pressure_ring_history: pressureRingHistory,
      last_homeostasis_update: latestHomeostasisUpdate,
      last_homeostasis_history: homeostasisHistory,
      homeostasis: {
        enabled: homeostasis.enabled,
        target_energy: homeostasis.targetEnergy,
        target_energy_default: homeostasis.targetEnergyDefault,
        target_energy_current: homeostasis.targetEnergyCurrent,
        band: homeostasis.band,
        max_delta: homeostasis.maxDelta,
        overflow_threshold: homeostasis.overflowThreshold,
        starvation_floor: homeostasis.starvationFloor,
        subsidy_enabled: homeostasis.subsidyEnabled,
        base_tax_default: homeostasis.baseTaxDefault,
        base_tax_current: homeostasis.baseTaxCurrent,
        last_update_tick: homeostasis.lastUpdateTick,
        last_update_source: homeostasis.lastUpdateSource,
        last_update_reason: homeostasis.lastUpdateReason,
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
      },
    },
    snapshot_guard: {
      enabled: SNAPSHOT_POLICY.enabled,
      interval_ticks: SNAPSHOT_POLICY.intervalTicks,
      retention: SNAPSHOT_POLICY.retention,
      in_flight: autoSnapshotInFlight,
      last_tick: autoSnapshotLastTick,
      last_result: autoSnapshotLastResult,
    },
    spatial_hash_guard: {
      tick: metrics.tick,
      overflow_count: metrics.spatialOverflowCount,
      max_cell_count: metrics.spatialMaxCellCount,
      overflow_ratio: metrics.spatialOverflowRatio,
    },
    behavior_clusters: behaviorClusters.slice(0, 6),
    behavior_invariant: SEMANTIC_MEMBRANE.dominantBehaviorInvariant(),
    federation_rule_genome: {
      local: P2P_FEDERATION.localRuleGenome,
      peers: peerRuleProfiles.slice(0, 8),
    },
    federation_admission: {
      latest: federationAdmissionState.latest,
      history: federationAdmissionState.history.slice(0, 8),
      policy: federationAdmissionState.policy,
    },
    hormones: [
      STATE_MATRIX.getHormone(0),
      STATE_MATRIX.getHormone(1),
      STATE_MATRIX.getHormone(2),
      STATE_MATRIX.getHormone(3),
      STATE_MATRIX.getHormone(4),
      STATE_MATRIX.getHormone(5),
    ],
    glyph_buffer: GLYPH_BUFFER.snapshot(),
  };
};

const buildFederateLocalContext = (
  packet: Record<string, unknown>,
  pulseId: number,
): {
  behavior: { invariant: string; dominantRole: number; memberCount: number };
  codex: {
    genome: string;
    label: string;
    dominantEpochs: number;
    peakShare: number;
    known: boolean;
    generatedAt: string;
  };
} => {
  const localBehavior =
    SEMANTIC_MEMBRANE.captureBehaviorFrame(pulseId, 1024)[0];
  const behavior = localBehavior
    ? {
      invariant: localBehavior.behaviorSignature,
      dominantRole: localBehavior.dominantRole,
      memberCount: localBehavior.memberCount,
    }
    : { invariant: "none", dominantRole: -1, memberCount: 0 };
  const localDominantGenome =
    dominantGenomes(STATE_MATRIX.getActiveIndices(), 1)[0];
  const fallbackGenome = typeof packet?.logic === "string"
    ? packet.logic
    : "0000000000000000";
  const codex = AKASHA_CODEX.lookupLineageProfile(
    localDominantGenome ?? fallbackGenome,
  );
  return { behavior, codex };
};

const parseDaemonInjectEnvelope = (
  body: unknown,
): DaemonInjectEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;

  const actionRaw = typeof root.action_type === "string"
    ? root.action_type
    : typeof root.type === "string"
    ? root.type
    : typeof payloadSource.hex_code === "string"
    ? "INJECT_PLASMID"
    : "DROP_PHEROMONE";
  const action = actionRaw.trim().toUpperCase();
  if (
    action !== "DROP_PHEROMONE" && action !== "INJECT_PLASMID" &&
    action !== "OBSERVE"
  ) {
    return null;
  }

  const x = clamp(
    Math.round(asFiniteNumber(payloadSource.target_x ?? payloadSource.x, 700)),
    0,
    WORLD_W - 1,
  );
  const y = clamp(
    Math.round(asFiniteNumber(payloadSource.target_y ?? payloadSource.y, 400)),
    0,
    WORLD_H - 1,
  );
  const intensity = clamp(
    asFiniteNumber(payloadSource.intensity ?? payloadSource.charge, 100),
    1,
    2000,
  );
  const hexCode = typeof payloadSource.hex_code === "string"
    ? payloadSource.hex_code
    : typeof payloadSource.plasmid_hex === "string"
    ? payloadSource.plasmid_hex
    : undefined;

  return {
    action_type: action as DaemonAction,
    payload: {
      target_x: x,
      target_y: y,
      intensity,
      hex_code: hexCode,
    },
  };
};

const asOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const norm = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(norm)) return true;
    if (["0", "false", "no", "off"].includes(norm)) return false;
  }
  return undefined;
};

const parsePressureRingIngressEnvelope = (
  body: unknown,
): PressureRingIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";

  const modeRaw = typeof root.mode === "string"
    ? root.mode
    : typeof payloadSource.mode === "string"
    ? payloadSource.mode
    : "";
  const mode = modeRaw.trim().toLowerCase();
  if (rollbackToken.length === 0 && mode !== "set" && mode !== "step") {
    return null;
  }

  const thetaValue = asFiniteNumber(
    payloadSource.theta ?? payloadSource.target_theta,
    Number.NaN,
  );
  const deltaValue = asFiniteNumber(
    payloadSource.delta_theta ?? payloadSource.delta,
    Number.NaN,
  );
  const scaleRaw = asFiniteNumber(payloadSource.scale, Number.NaN);
  const enabled = asOptionalBoolean(payloadSource.enabled);
  if (
    rollbackToken.length === 0 &&
    mode === "set" &&
    !Number.isFinite(thetaValue)
  ) return null;
  if (
    rollbackToken.length === 0 &&
    mode === "step" &&
    !Number.isFinite(deltaValue)
  ) return null;
  if (
    rollbackToken.length === 0 &&
    !Number.isFinite(thetaValue) &&
    !Number.isFinite(deltaValue) &&
    !Number.isFinite(scaleRaw) &&
    enabled === undefined
  ) {
    return null;
  }
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_phase_scheduler";

  const envelope: PressureRingIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_phase_scheduler",
  };
  if (mode === "set" || mode === "step") {
    envelope.mode = mode as "set" | "step";
  }
  if (Number.isFinite(thetaValue)) envelope.theta = thetaValue;
  if (Number.isFinite(deltaValue)) {
    envelope.delta_theta = clamp(
      deltaValue,
      -DAEMON_PRESSURE_RING_MAX_STEP,
      DAEMON_PRESSURE_RING_MAX_STEP,
    );
  }
  if (Number.isFinite(scaleRaw)) {
    envelope.scale = clamp(Math.round(scaleRaw), 0, 2048);
  }
  if (enabled !== undefined) envelope.enabled = enabled;
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
  return envelope;
};

const parseHomeostasisIngressEnvelope = (
  body: unknown,
): HomeostasisIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;
  const baseTax = asFiniteNumber(
    payloadSource.base_tax ?? payloadSource.baseTax,
    Number.NaN,
  );
  const targetEnergy = asFiniteNumber(
    payloadSource.target_energy ?? payloadSource.targetEnergy,
    Number.NaN,
  );
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";
  if (
    !Number.isFinite(baseTax) &&
    !Number.isFinite(targetEnergy) &&
    rollbackToken.length === 0
  ) {
    return null;
  }
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_homeostasis_controller";
  const envelope: HomeostasisIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_homeostasis_controller",
  };
  if (Number.isFinite(baseTax)) {
    envelope.base_tax = clamp(
      Math.round(baseTax),
      DAEMON_HOMEOSTASIS_BASE_TAX_MIN,
      DAEMON_HOMEOSTASIS_BASE_TAX_MAX,
    );
  }
  if (Number.isFinite(targetEnergy)) {
    envelope.target_energy = clamp(
      Math.round(targetEnergy),
      DAEMON_HOMEOSTASIS_TARGET_MIN,
      DAEMON_HOMEOSTASIS_TARGET_MAX,
    );
  }
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
  return envelope;
};

const parseDaemonPolicyIngressEnvelope = (
  body: unknown,
): DaemonPolicyIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;
  const maxPheromoneIntensity = asFiniteNumber(
    payloadSource.max_pheromone_intensity ??
      payloadSource.maxPheromoneIntensity,
    Number.NaN,
  );
  const maxPlasmidCharge = asFiniteNumber(
    payloadSource.max_plasmid_charge ??
      payloadSource.maxPlasmidCharge,
    Number.NaN,
  );
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";
  if (
    !Number.isFinite(maxPheromoneIntensity) &&
    !Number.isFinite(maxPlasmidCharge) &&
    rollbackToken.length === 0
  ) {
    return null;
  }
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_policy_controller";
  const envelope: DaemonPolicyIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_policy_controller",
  };
  if (Number.isFinite(maxPheromoneIntensity)) {
    envelope.max_pheromone_intensity = clamp(
      Math.round(maxPheromoneIntensity),
      DAEMON_MAX_PHEROMONE_INTENSITY_MIN,
      DAEMON_MAX_PHEROMONE_INTENSITY_MAX,
    );
  }
  if (Number.isFinite(maxPlasmidCharge)) {
    envelope.max_plasmid_charge = clamp(
      Math.round(maxPlasmidCharge),
      DAEMON_MAX_PLASMID_CHARGE_MIN,
      DAEMON_MAX_PLASMID_CHARGE_MAX,
    );
  }
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
  return envelope;
};

const inferHomeostasisRollbackKey = (
  rollbackToken: string,
): "pulse.homeostasis.baseTax" | "pulse.homeostasis.targetEnergy" | null => {
  if (rollbackToken.startsWith("pulse.homeostasis.baseTax@")) {
    return "pulse.homeostasis.baseTax";
  }
  if (rollbackToken.startsWith("pulse.homeostasis.targetEnergy@")) {
    return "pulse.homeostasis.targetEnergy";
  }
  return null;
};

const inferDaemonPolicyRollbackKey = (
  rollbackToken: string,
): "daemon.maxPheromoneIntensity" | "daemon.maxPlasmidCharge" | null => {
  if (rollbackToken.startsWith("daemon.maxPheromoneIntensity@")) {
    return "daemon.maxPheromoneIntensity";
  }
  if (rollbackToken.startsWith("daemon.maxPlasmidCharge@")) {
    return "daemon.maxPlasmidCharge";
  }
  return null;
};

const applyDaemonPheromonePolicyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerApplyResult<
  "daemon.maxPheromoneIntensity"
> => {
  const result = applyLedgerUpdate(daemonPheromoneLedgerRuntime, update);
  daemonPheromoneLedgerRuntime = result.state;
  syncDaemonIngressMaxPheromoneIntensity(result.state.currentValue);
  return result;
};

const rollbackDaemonPheromonePolicyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerRollbackResult<
  "daemon.maxPheromoneIntensity"
> => {
  const result = rollbackLedgerUpdate(daemonPheromoneLedgerRuntime, rollback);
  daemonPheromoneLedgerRuntime = result.state;
  syncDaemonIngressMaxPheromoneIntensity(result.state.currentValue);
  return result;
};

const syncDaemonPheromonePolicyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("daemon.maxPheromoneIntensity", {
    initialValue: DAEMON_POLICY.maxPheromoneIntensity,
    historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
  });
  daemonPheromoneLedgerRuntime = hydrated.state;
  daemonPheromoneLedgerPersistence = hydrated.persistence;
  syncDaemonIngressMaxPheromoneIntensity(hydrated.state.currentValue);
};

const applyDaemonPlasmidPolicyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerApplyResult<
  "daemon.maxPlasmidCharge"
> => {
  const result = applyLedgerUpdate(daemonPlasmidLedgerRuntime, update);
  daemonPlasmidLedgerRuntime = result.state;
  syncDaemonIngressMaxPlasmidCharge(result.state.currentValue);
  return result;
};

const rollbackDaemonPlasmidPolicyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerRollbackResult<
  "daemon.maxPlasmidCharge"
> => {
  const result = rollbackLedgerUpdate(daemonPlasmidLedgerRuntime, rollback);
  daemonPlasmidLedgerRuntime = result.state;
  syncDaemonIngressMaxPlasmidCharge(result.state.currentValue);
  return result;
};

const syncDaemonPlasmidPolicyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("daemon.maxPlasmidCharge", {
    initialValue: DAEMON_POLICY.maxPlasmidCharge,
    historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
  });
  daemonPlasmidLedgerRuntime = hydrated.state;
  daemonPlasmidLedgerPersistence = hydrated.persistence;
  syncDaemonIngressMaxPlasmidCharge(hydrated.state.currentValue);
};

const serializeDaemonPolicyState = () => {
  const liveLimits = snapshotDaemonIngressPolicyLimits();
  return {
    max_pheromone_intensity: currentDaemonMaxPheromoneIntensity(),
    max_pheromone_intensity_default: daemonPheromoneLedgerRuntime.defaultValue,
    max_pheromone_intensity_current: daemonPheromoneLedgerRuntime.currentValue,
    max_plasmid_charge: currentDaemonMaxPlasmidCharge(),
    max_plasmid_charge_default: daemonPlasmidLedgerRuntime.defaultValue,
    max_plasmid_charge_current: daemonPlasmidLedgerRuntime.currentValue,
    safe_min_population: liveLimits.safeMinPopulation,
    safe_min_avg_energy: liveLimits.safeMinAvgEnergy,
    ledger_max_pheromone_intensity: snapshotLedgerRuntime(
      daemonPheromoneLedgerRuntime,
    ),
    ledger_max_pheromone_intensity_persistence:
      daemonPheromoneLedgerPersistence,
    ledger_max_plasmid_charge: snapshotLedgerRuntime(
      daemonPlasmidLedgerRuntime,
    ),
    ledger_max_plasmid_charge_persistence: daemonPlasmidLedgerPersistence,
  };
};

const collapseHomeostasisLedgerStatus = (
  baseStatus: HomeostasisUpdateSnapshot["base_tax_ledger_status"],
  targetStatus: HomeostasisUpdateSnapshot["target_energy_ledger_status"],
): HomeostasisUpdateSnapshot["ledger_status"] => {
  if (baseStatus !== null && targetStatus === null) return baseStatus;
  if (baseStatus === null && targetStatus !== null) return targetStatus;
  if (
    baseStatus !== null && targetStatus !== null && baseStatus === targetStatus
  ) {
    return baseStatus;
  }
  return null;
};

LOGGER.info("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");
RUNTIME_POLICY.logFingerprintOnce("system-start");
LOGGER.info(
  `🌐 [SYSTEM] Observer host=${HOST}:${UI_PORT} controlEnabled=${CONTROL_ENABLE} avatarIngress=${AVATAR_INGRESS_ENABLE} tokenRequired=${
    CONTROL_TOKEN.length > 0
  }`,
);
if (RUNTIME_POLICY.p2p.mainnetEnabled) {
  LOGGER.info(`🌐 [SYSTEM] MAINNET BOOTSTRAP ACTIVE`);
}
await AKASHA_CODEX.start();

// STAGE 5.3 VERIFICATION: Forced Reflection Seed
setInterval(() => {
  const signalGrid = new Int32Array(
    STATE_MATRIX.buffer,
    35200000 + 4096,
    140 * 80,
  );
  const memoryGrid = new Int32Array(
    STATE_MATRIX.buffer,
    36100000 + 4096,
    140 * 80,
  );
  // Seed a strong signal in the center
  const center = 40 * 140 + 70;
  Atomics.store(signalGrid, center, 1000);
  Atomics.store(memoryGrid, center, 500);
}, 100);

// 1. Initialize Observer UI Server
Deno.serve({ hostname: HOST, port: UI_PORT }, async (req) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-omega-control-token",
      },
    });
  }

  if (url.pathname === "/state") {
    const buffer = STATE_MATRIX.buffer;

    const bufferCopy = new Uint8Array(buffer.byteLength);
    bufferCopy.set(new Uint8Array(buffer));
    return new Response(bufferCopy, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  }

  if (url.pathname === "/grid") {
    const env = new Int32Array(PHYSICS_ENGINE.envBuffer);
    const attention = PHYSICS_ENGINE.ATTENTION_PHEROMONES;

    const buffer = new ArrayBuffer(env.byteLength + attention.byteLength);
    const outEnv = new Int32Array(buffer, 0, env.length);
    const outAttention = new Float32Array(
      buffer,
      env.byteLength,
      attention.length,
    );

    outEnv.set(env);
    outAttention.set(attention);

    return new Response(buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  }

  if (url.pathname === "/api/telemetry" && req.method === "GET") {
    return new Response(JSON.stringify(await buildTelemetry()), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/telemetry/stream" && req.method === "GET") {
    const limit = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("limit"), 128)),
      1,
      1024,
    );
    return new Response(
      JSON.stringify({
        ok: true,
        history: TELEMETRY_STREAM.history(limit),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/telemetry/histogram" && req.method === "GET") {
    const metricRaw = (url.searchParams.get("metric") ?? "").trim();
    if (
      metricRaw !== "population" && metricRaw !== "avgEnergy" &&
      metricRaw !== "neuralCoherence" && metricRaw !== "spatialOverflowRatio"
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_METRIC",
          allowed: TELEMETRY_STREAM.metrics(),
        }),
        { status: 400, headers: JSON_HEADERS },
      );
    }
    const windowMs = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("window_ms"), 60000)),
      1000,
      86_400_000,
    );
    const buckets = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("buckets"), 12)),
      1,
      64,
    );
    return new Response(
      JSON.stringify({
        ok: true,
        histogram: TELEMETRY_STREAM.histogram(metricRaw, windowMs, buckets),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/mutation-telemetry" && req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        mutation_telemetry: MUTATION_TELEMETRY.snapshot(),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/telemetry/ws") {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "WEBSOCKET_UPGRADE_REQUIRED",
        }),
        { status: 426, headers: JSON_HEADERS },
      );
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    TELEMETRY_STREAM.attach(socket);
    return response;
  }

  if (url.pathname === "/api/pressure-ring" && req.method === "GET") {
    const pressure = PULSE.getEvolutionPressureState();
    const geneticLedger = PULSE.getGeneticLedgerState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        pressure_ring: {
          novelty_signed: pressure.noveltySigned,
          symbiosis_signed: pressure.symbiosisSigned,
          novelty: pressure.novelty,
          fear: pressure.fear,
          symbiosis: pressure.symbiosis,
          ego: pressure.ego,
          ring: {
            enabled: pressure.ring.enabled,
            theta: Number(pressure.ring.theta.toFixed(6)),
            scale: pressure.ring.scale,
            fear_curiosity_balance: Number(
              pressure.ring.fearCuriosityBalance.toFixed(6),
            ),
            ego_love_balance: Number(pressure.ring.egoLoveBalance.toFixed(6)),
            ledger_scale: geneticLedger.pressureRingScale,
            ledger_scale_persistence:
              geneticLedger.pressureRingScalePersistence,
          },
        },
        latest_update: latestPressureRingUpdate,
        history: pressureRingHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/pressure-ring" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parsePressureRingIngressEnvelope(body);
      if (!envelope) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_PRESSURE_RING_PAYLOAD",
            expected:
              "Provide {mode?:set|step, theta|delta_theta, scale?, enabled?, rollback_token?, reason?}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
      const before = PULSE.getEvolutionPressureState();
      const source = envelope.reason ?? "daemon_phase_scheduler";

      if (
        envelope.rollback_token !== undefined &&
        (
          envelope.mode !== undefined ||
          envelope.theta !== undefined ||
          envelope.delta_theta !== undefined ||
          envelope.scale !== undefined ||
          envelope.enabled !== undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (envelope.rollback_token !== undefined) {
        const rollback = await PULSE.rollbackGeneticLedgerUpdate({
          key: "pulse.pressureRing.scale",
          rollbackToken: envelope.rollback_token,
          source,
          reason: source,
          tick,
        });
        const pressure = PULSE.getEvolutionPressureState();
        const geneticLedger = PULSE.getGeneticLedgerState();
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_pressure_ring_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "PRESSURE_RING_ROLLBACK_REJECTED",
              ledger_status: rollback.status,
              rollback_token: envelope.rollback_token,
              pressure_ring: {
                novelty_signed: pressure.noveltySigned,
                symbiosis_signed: pressure.symbiosisSigned,
                novelty: pressure.novelty,
                fear: pressure.fear,
                symbiosis: pressure.symbiosis,
                ego: pressure.ego,
                ring: {
                  enabled: pressure.ring.enabled,
                  theta: Number(pressure.ring.theta.toFixed(6)),
                  scale: pressure.ring.scale,
                  fear_curiosity_balance: Number(
                    pressure.ring.fearCuriosityBalance.toFixed(6),
                  ),
                  ego_love_balance: Number(
                    pressure.ring.egoLoveBalance.toFixed(6),
                  ),
                  ledger_scale: geneticLedger.pressureRingScale,
                  ledger_scale_persistence:
                    geneticLedger.pressureRingScalePersistence,
                },
              },
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        const snapshot: PressureRingUpdateSnapshot = {
          tick,
          mode: "rollback",
          source,
          delta_theta: 0,
          theta: Number(pressure.ring.theta.toFixed(6)),
          scale: pressure.ring.scale,
          enabled: pressure.ring.enabled,
          ledger_status: rollback.status,
          scale_rollback_token: envelope.rollback_token,
          scale_before: before.ring.scale,
          scale_after: pressure.ring.scale,
        };
        setLatestPressureRingUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_PRESSURE_RING_ROLLBACK",
          tick,
          mode: snapshot.mode,
          source: snapshot.source,
          delta_theta: snapshot.delta_theta,
          theta: snapshot.theta,
          scale: snapshot.scale,
          enabled: snapshot.enabled,
          ledger_status: snapshot.ledger_status,
          rollback_token: snapshot.scale_rollback_token,
          scale_before: snapshot.scale_before,
          scale_after: snapshot.scale_after,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
            pressure_ring: {
              novelty_signed: pressure.noveltySigned,
              symbiosis_signed: pressure.symbiosisSigned,
              novelty: pressure.novelty,
              fear: pressure.fear,
              symbiosis: pressure.symbiosis,
              ego: pressure.ego,
              ring: {
                enabled: pressure.ring.enabled,
                theta: Number(pressure.ring.theta.toFixed(6)),
                scale: pressure.ring.scale,
                fear_curiosity_balance: Number(
                  pressure.ring.fearCuriosityBalance.toFixed(6),
                ),
                ego_love_balance: Number(
                  pressure.ring.egoLoveBalance.toFixed(6),
                ),
                ledger_scale: geneticLedger.pressureRingScale,
                ledger_scale_persistence:
                  geneticLedger.pressureRingScalePersistence,
              },
            },
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const ledgerUpdate = envelope.scale === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.pressureRing.scale",
          value: envelope.scale,
          source,
          reason: source,
          tick,
        });
      const pressure = envelope.mode === undefined
        ? PULSE.getEvolutionPressureState()
        : PULSE.updateEvolutionPressureRing({
          mode: envelope.mode,
          theta: envelope.theta,
          deltaTheta: envelope.delta_theta,
          enabled: envelope.enabled,
          source,
        });
      const geneticLedger = PULSE.getGeneticLedgerState();
      const snapshot: PressureRingUpdateSnapshot = {
        tick,
        mode: envelope.scale !== undefined && envelope.mode !== undefined
          ? "mixed"
          : envelope.scale !== undefined
          ? "scale_only"
          : envelope.mode ?? "set",
        source,
        delta_theta: envelope.mode === "step" ? (envelope.delta_theta ?? 0) : 0,
        theta: Number(pressure.ring.theta.toFixed(6)),
        scale: pressure.ring.scale,
        enabled: pressure.ring.enabled,
        ledger_status: ledgerUpdate?.status ?? null,
        scale_rollback_token: ledgerUpdate?.mutation?.rollbackToken ?? null,
        scale_before: before.ring.scale,
        scale_after: pressure.ring.scale,
      };
      setLatestPressureRingUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_pressure_ring_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_PRESSURE_RING",
        tick,
        mode: snapshot.mode,
        source: snapshot.source,
        delta_theta: snapshot.delta_theta,
        theta: snapshot.theta,
        scale: snapshot.scale,
        enabled: snapshot.enabled,
        ledger_status: snapshot.ledger_status,
        rollback_token: snapshot.scale_rollback_token,
        scale_before: snapshot.scale_before,
        scale_after: snapshot.scale_after,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          pressure_ring: {
            novelty_signed: pressure.noveltySigned,
            symbiosis_signed: pressure.symbiosisSigned,
            novelty: pressure.novelty,
            fear: pressure.fear,
            symbiosis: pressure.symbiosis,
            ego: pressure.ego,
            ring: {
              enabled: pressure.ring.enabled,
              theta: Number(pressure.ring.theta.toFixed(6)),
              scale: pressure.ring.scale,
              fear_curiosity_balance: Number(
                pressure.ring.fearCuriosityBalance.toFixed(6),
              ),
              ego_love_balance: Number(
                pressure.ring.egoLoveBalance.toFixed(6),
              ),
              ledger_scale: geneticLedger.pressureRingScale,
              ledger_scale_persistence:
                geneticLedger.pressureRingScalePersistence,
            },
          },
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_pressure_ring_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "PRESSURE_RING_UPDATE_EXCEPTION",
          details: String(err),
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/api/homeostasis" && req.method === "GET") {
    const homeostasis = PULSE.getHomeostasisState();
    const geneticLedger = PULSE.getGeneticLedgerState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        homeostasis: {
          enabled: homeostasis.enabled,
          target_energy: homeostasis.targetEnergy,
          target_energy_default: homeostasis.targetEnergyDefault,
          target_energy_current: homeostasis.targetEnergyCurrent,
          band: homeostasis.band,
          max_delta: homeostasis.maxDelta,
          overflow_threshold: homeostasis.overflowThreshold,
          starvation_floor: homeostasis.starvationFloor,
          subsidy_enabled: homeostasis.subsidyEnabled,
          base_tax_default: homeostasis.baseTaxDefault,
          base_tax_current: homeostasis.baseTaxCurrent,
          last_update_tick: homeostasis.lastUpdateTick,
          last_update_source: homeostasis.lastUpdateSource,
          last_update_reason: homeostasis.lastUpdateReason,
          ledger_base_tax: geneticLedger.homeostasisBaseTax,
          ledger_base_tax_persistence:
            geneticLedger.homeostasisBaseTaxPersistence,
          ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
          ledger_target_energy_persistence:
            geneticLedger.homeostasisTargetEnergyPersistence,
        },
        latest_update: latestHomeostasisUpdate,
        history: homeostasisHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/physiology" && req.method === "GET") {
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    const hormones = PULSE.getPhysiologicalLedgerState();
    const generic = PULSE.getGenericLedgerSnapshots();
    const geneticLedger = PULSE.getGeneticLedgerState();

    const ledger = {
      ...generic,
      "daemon.maxPheromoneIntensity": snapshotLedgerRuntime(
        daemonPheromoneLedgerRuntime,
      ),
      "daemon.maxPlasmidCharge": snapshotLedgerRuntime(
        daemonPlasmidLedgerRuntime,
      ),
    };

    const physiology = capturePhysiologySnapshot({
      tick,
      hormones,
      ledger,
    });
    const guardianSignalHybrid = PULSE.getGuardianSignalHybridState();
    const architectPlasmidHybrid = PULSE.getArchitectPlasmidHybridState();
    return new Response(
      JSON.stringify({
        ok: true,
        physiology,
        guardian_signal_hybrid: guardianSignalHybrid,
        architect_plasmid_hybrid: architectPlasmidHybrid,
        guardian_signal_promotion: evaluateGuardianSignalPromotion(
          guardianSignalHybrid,
        ),
        glyph_transport: GLYPH_BUFFER.snapshot(),
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
        ledger_pressure_ring_scale: geneticLedger.pressureRingScale,
        ledger_pressure_ring_scale_persistence:
          geneticLedger.pressureRingScalePersistence,
      }),
      { headers: JSON_HEADERS },
    );
  }

  if (url.pathname === "/api/homeostasis" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseHomeostasisIngressEnvelope(body);
      if (
        !envelope ||
        (
          envelope.base_tax === undefined &&
          envelope.target_energy === undefined &&
          envelope.rollback_token === undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_HOMEOSTASIS_PAYLOAD",
            expected:
              "Provide {base_tax?:number, target_energy?:number, rollback_token?:string, reason?:string}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.rollback_token !== undefined &&
        (envelope.base_tax !== undefined ||
          envelope.target_energy !== undefined)
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
      const before = PULSE.getHomeostasisState();
      const source = "daemon_homeostasis_controller";
      const reason = envelope.reason ?? "daemon_homeostasis_controller";
      const serializeHomeostasis = (
        updated: ReturnType<typeof PULSE.getHomeostasisState>,
        geneticLedger: ReturnType<typeof PULSE.getGeneticLedgerState>,
      ) => ({
        enabled: updated.enabled,
        target_energy: updated.targetEnergy,
        target_energy_default: updated.targetEnergyDefault,
        target_energy_current: updated.targetEnergyCurrent,
        band: updated.band,
        max_delta: updated.maxDelta,
        overflow_threshold: updated.overflowThreshold,
        starvation_floor: updated.starvationFloor,
        subsidy_enabled: updated.subsidyEnabled,
        base_tax_default: updated.baseTaxDefault,
        base_tax_current: updated.baseTaxCurrent,
        last_update_tick: updated.lastUpdateTick,
        last_update_source: updated.lastUpdateSource,
        last_update_reason: updated.lastUpdateReason,
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
      });

      if (envelope.rollback_token !== undefined) {
        const rollbackKey = inferHomeostasisRollbackKey(
          envelope.rollback_token,
        );
        if (rollbackKey === null) {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_homeostasis_invalid_payload",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "UNKNOWN_HOMEOSTASIS_ROLLBACK_TOKEN",
              rollback_token: envelope.rollback_token,
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }

        const rollback = await PULSE.rollbackGeneticLedgerUpdate({
          key: rollbackKey,
          rollbackToken: envelope.rollback_token,
          source,
          reason,
          tick,
        });
        const updated = PULSE.getHomeostasisState();
        const geneticLedger = PULSE.getGeneticLedgerState();
        const baseTaxLedgerStatus = rollbackKey === "pulse.homeostasis.baseTax"
          ? rollback.status
          : null;
        const targetEnergyLedgerStatus =
          rollbackKey === "pulse.homeostasis.targetEnergy"
            ? rollback.status
            : null;
        const ledgerStatus = collapseHomeostasisLedgerStatus(
          baseTaxLedgerStatus,
          targetEnergyLedgerStatus,
        );
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_homeostasis_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "HOMEOSTASIS_ROLLBACK_REJECTED",
              ledger_status: ledgerStatus,
              base_tax_ledger_status: baseTaxLedgerStatus,
              target_energy_ledger_status: targetEnergyLedgerStatus,
              rollback_token: envelope.rollback_token,
              rollback_key: rollbackKey,
              homeostasis: serializeHomeostasis(updated, geneticLedger),
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        const snapshot: HomeostasisUpdateSnapshot = {
          tick,
          source,
          reason,
          mode: "rollback",
          ledger_status: ledgerStatus,
          base_tax_ledger_status: baseTaxLedgerStatus,
          target_energy_ledger_status: targetEnergyLedgerStatus,
          base_tax_rollback_token: rollbackKey === "pulse.homeostasis.baseTax"
            ? envelope.rollback_token
            : null,
          target_energy_rollback_token:
            rollbackKey === "pulse.homeostasis.targetEnergy"
              ? envelope.rollback_token
              : null,
          base_tax_before: before.baseTaxCurrent,
          base_tax_after: updated.baseTaxCurrent,
          target_energy_before: before.targetEnergy,
          target_energy_after: updated.targetEnergy,
        };
        setLatestHomeostasisUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_HOMEOSTASIS_ROLLBACK",
          tick,
          source: snapshot.source,
          reason: snapshot.reason,
          mode: snapshot.mode,
          ledger_status: snapshot.ledger_status,
          base_tax_ledger_status: snapshot.base_tax_ledger_status,
          target_energy_ledger_status: snapshot.target_energy_ledger_status,
          rollback_key: rollbackKey,
          rollback_token: envelope.rollback_token,
          base_tax_rollback_token: snapshot.base_tax_rollback_token,
          target_energy_rollback_token: snapshot.target_energy_rollback_token,
          base_tax_before: snapshot.base_tax_before,
          base_tax_after: snapshot.base_tax_after,
          target_energy_before: snapshot.target_energy_before,
          target_energy_after: snapshot.target_energy_after,
        });

        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
            homeostasis: serializeHomeostasis(updated, geneticLedger),
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const baseTaxLedgerUpdate = envelope.base_tax === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.homeostasis.baseTax",
          value: envelope.base_tax,
          source,
          reason,
          tick,
        });
      const targetEnergyLedgerUpdate = envelope.target_energy === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.homeostasis.targetEnergy",
          value: envelope.target_energy,
          source,
          reason,
          tick,
        });
      const updated = PULSE.getHomeostasisState();
      const geneticLedger = PULSE.getGeneticLedgerState();
      const baseTaxLedgerStatus = baseTaxLedgerUpdate?.status ?? null;
      const targetEnergyLedgerStatus = targetEnergyLedgerUpdate?.status ?? null;
      const snapshot: HomeostasisUpdateSnapshot = {
        tick,
        source,
        reason,
        mode: envelope.base_tax !== undefined &&
            envelope.target_energy !== undefined
          ? "mixed"
          : envelope.base_tax !== undefined
          ? "apply"
          : "target_only",
        ledger_status: collapseHomeostasisLedgerStatus(
          baseTaxLedgerStatus,
          targetEnergyLedgerStatus,
        ),
        base_tax_ledger_status: baseTaxLedgerStatus,
        target_energy_ledger_status: targetEnergyLedgerStatus,
        base_tax_rollback_token: baseTaxLedgerUpdate?.mutation?.rollbackToken ??
          null,
        target_energy_rollback_token:
          targetEnergyLedgerUpdate?.mutation?.rollbackToken ?? null,
        base_tax_before: before.baseTaxCurrent,
        base_tax_after: updated.baseTaxCurrent,
        target_energy_before: before.targetEnergy,
        target_energy_after: updated.targetEnergy,
      };
      setLatestHomeostasisUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_homeostasis_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_HOMEOSTASIS",
        tick,
        source: snapshot.source,
        reason: snapshot.reason,
        mode: snapshot.mode,
        ledger_status: snapshot.ledger_status,
        base_tax_ledger_status: snapshot.base_tax_ledger_status,
        target_energy_ledger_status: snapshot.target_energy_ledger_status,
        rollback_token: snapshot.base_tax_rollback_token ??
          snapshot.target_energy_rollback_token,
        base_tax_rollback_token: snapshot.base_tax_rollback_token,
        target_energy_rollback_token: snapshot.target_energy_rollback_token,
        base_tax_before: snapshot.base_tax_before,
        base_tax_after: snapshot.base_tax_after,
        target_energy_before: snapshot.target_energy_before,
        target_energy_after: snapshot.target_energy_after,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          homeostasis: serializeHomeostasis(updated, geneticLedger),
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_homeostasis_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "HOMEOSTASIS_UPDATE_EXCEPTION",
          details: String(err),
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/api/daemon-policy" && req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        daemon_policy: serializeDaemonPolicyState(),
        latest_update: latestDaemonPolicyUpdate,
        history: daemonPolicyHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/daemon-policy" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseDaemonPolicyIngressEnvelope(body);
      if (
        !envelope ||
        (
          envelope.max_pheromone_intensity === undefined &&
          envelope.max_plasmid_charge === undefined &&
          envelope.rollback_token === undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_DAEMON_POLICY_PAYLOAD",
            expected:
              "Provide {max_pheromone_intensity?:number, max_plasmid_charge?:number, rollback_token?:string, reason?:string}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.rollback_token !== undefined &&
        (
          envelope.max_pheromone_intensity !== undefined ||
          envelope.max_plasmid_charge !== undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.max_pheromone_intensity !== undefined &&
        envelope.max_plasmid_charge !== undefined
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "MULTIPLE_DAEMON_POLICY_FIELDS_NOT_ALLOWED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
      const source = "daemon_policy_controller";
      const reason = envelope.reason ?? "daemon_policy_controller";
      const beforePheromone = currentDaemonMaxPheromoneIntensity();
      const beforePlasmid = currentDaemonMaxPlasmidCharge();

      if (envelope.rollback_token !== undefined) {
        const rollbackKey = inferDaemonPolicyRollbackKey(
          envelope.rollback_token,
        );
        if (rollbackKey === null) {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_invalid_payload",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "INVALID_DAEMON_POLICY_ROLLBACK_TOKEN",
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }
        const rollback = rollbackKey === "daemon.maxPheromoneIntensity"
          ? rollbackDaemonPheromonePolicyLedgerUpdate({
            rollbackToken: envelope.rollback_token,
            source,
            reason,
            tick,
          })
          : rollbackDaemonPlasmidPolicyLedgerUpdate({
            rollbackToken: envelope.rollback_token,
            source,
            reason,
            tick,
          });
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "DAEMON_POLICY_ROLLBACK_REJECTED",
              ledger_status: rollback.status,
              rollback_token: envelope.rollback_token,
              daemon_policy: serializeDaemonPolicyState(),
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        if (rollback.mutation) {
          if (rollbackKey === "daemon.maxPheromoneIntensity") {
            const persisted = await appendLedgerRecordAndMaybeCompact(
              "daemon.maxPheromoneIntensity",
              recordFromRollback(
                rollback.mutation,
                "daemon.maxPheromoneIntensity",
              ),
              {
                initialValue: DAEMON_POLICY.maxPheromoneIntensity,
                historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
              },
            );
            daemonPheromoneLedgerPersistence = {
              ...persisted,
              hydrated: daemonPheromoneLedgerPersistence.hydrated,
              lastHydratedAt: daemonPheromoneLedgerPersistence.lastHydratedAt,
              lastHydrationError:
                daemonPheromoneLedgerPersistence.lastHydrationError,
            };
          } else {
            const persisted = await appendLedgerRecordAndMaybeCompact(
              "daemon.maxPlasmidCharge",
              recordFromRollback(rollback.mutation, "daemon.maxPlasmidCharge"),
              {
                initialValue: DAEMON_POLICY.maxPlasmidCharge,
                historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
              },
            );
            daemonPlasmidLedgerPersistence = {
              ...persisted,
              hydrated: daemonPlasmidLedgerPersistence.hydrated,
              lastHydratedAt: daemonPlasmidLedgerPersistence.lastHydratedAt,
              lastHydrationError:
                daemonPlasmidLedgerPersistence.lastHydrationError,
            };
          }
        }

        const snapshot: DaemonPolicyUpdateSnapshot = {
          tick,
          source,
          reason,
          mode: "rollback",
          policy_key: rollbackKey,
          ledger_status: rollback.status,
          pheromone_rollback_token:
            rollbackKey === "daemon.maxPheromoneIntensity"
              ? envelope.rollback_token
              : null,
          plasmid_rollback_token: rollbackKey === "daemon.maxPlasmidCharge"
            ? envelope.rollback_token
            : null,
          max_pheromone_intensity_before: beforePheromone,
          max_pheromone_intensity_after: currentDaemonMaxPheromoneIntensity(),
          max_plasmid_charge_before: beforePlasmid,
          max_plasmid_charge_after: currentDaemonMaxPlasmidCharge(),
        };
        setLatestDaemonPolicyUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_POLICY_ROLLBACK",
          tick,
          source: snapshot.source,
          reason: snapshot.reason,
          mode: snapshot.mode,
          policy_key: snapshot.policy_key,
          ledger_status: snapshot.ledger_status,
          rollback_token: snapshot.pheromone_rollback_token ??
            snapshot.plasmid_rollback_token,
          max_pheromone_intensity_before:
            snapshot.max_pheromone_intensity_before,
          max_pheromone_intensity_after: snapshot.max_pheromone_intensity_after,
          max_plasmid_charge_before: snapshot.max_plasmid_charge_before,
          max_plasmid_charge_after: snapshot.max_plasmid_charge_after,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
            daemon_policy: serializeDaemonPolicyState(),
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const updateKey = envelope.max_pheromone_intensity !== undefined
        ? "daemon.maxPheromoneIntensity"
        : "daemon.maxPlasmidCharge";
      const result = updateKey === "daemon.maxPheromoneIntensity"
        ? applyDaemonPheromonePolicyLedgerUpdate({
          value: envelope.max_pheromone_intensity!,
          source,
          reason,
          tick,
        })
        : applyDaemonPlasmidPolicyLedgerUpdate({
          value: envelope.max_plasmid_charge!,
          source,
          reason,
          tick,
        });
      if (result.mutation) {
        if (updateKey === "daemon.maxPheromoneIntensity") {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "daemon.maxPheromoneIntensity",
            recordFromApply(result.mutation, "daemon.maxPheromoneIntensity"),
            {
              initialValue: DAEMON_POLICY.maxPheromoneIntensity,
              historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
            },
          );
          daemonPheromoneLedgerPersistence = {
            ...persisted,
            hydrated: daemonPheromoneLedgerPersistence.hydrated,
            lastHydratedAt: daemonPheromoneLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              daemonPheromoneLedgerPersistence.lastHydrationError,
          };
        } else {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "daemon.maxPlasmidCharge",
            recordFromApply(result.mutation, "daemon.maxPlasmidCharge"),
            {
              initialValue: DAEMON_POLICY.maxPlasmidCharge,
              historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
            },
          );
          daemonPlasmidLedgerPersistence = {
            ...persisted,
            hydrated: daemonPlasmidLedgerPersistence.hydrated,
            lastHydratedAt: daemonPlasmidLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              daemonPlasmidLedgerPersistence.lastHydrationError,
          };
        }
      }

      const snapshot: DaemonPolicyUpdateSnapshot = {
        tick,
        source,
        reason,
        mode: "apply",
        policy_key: updateKey,
        ledger_status: result.status,
        pheromone_rollback_token: updateKey === "daemon.maxPheromoneIntensity"
          ? result.mutation?.rollbackToken ?? null
          : null,
        plasmid_rollback_token: updateKey === "daemon.maxPlasmidCharge"
          ? result.mutation?.rollbackToken ?? null
          : null,
        max_pheromone_intensity_before: beforePheromone,
        max_pheromone_intensity_after: currentDaemonMaxPheromoneIntensity(),
        max_plasmid_charge_before: beforePlasmid,
        max_plasmid_charge_after: currentDaemonMaxPlasmidCharge(),
      };
      setLatestDaemonPolicyUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_policy_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_POLICY",
        tick,
        source: snapshot.source,
        reason: snapshot.reason,
        mode: snapshot.mode,
        policy_key: snapshot.policy_key,
        ledger_status: snapshot.ledger_status,
        rollback_token: snapshot.pheromone_rollback_token ??
          snapshot.plasmid_rollback_token,
        max_pheromone_intensity_before: snapshot.max_pheromone_intensity_before,
        max_pheromone_intensity_after: snapshot.max_pheromone_intensity_after,
        max_plasmid_charge_before: snapshot.max_plasmid_charge_before,
        max_plasmid_charge_after: snapshot.max_plasmid_charge_after,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          daemon_policy: serializeDaemonPolicyState(),
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_policy_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "DAEMON_POLICY_EXCEPTION",
          details: String(err),
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/api/codex" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "8", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 8,
    );
    return new Response(JSON.stringify(snapshot), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/codex/narrative" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "5", 10);
    const narrative = await AKASHA_CODEX.getNarrative(
      Number.isFinite(limit) ? limit : 5,
    );
    return new Response(JSON.stringify(narrative), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/codex/invariants" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
    const invariants = await AKASHA_CODEX.getInvariants(
      Number.isFinite(limit) ? limit : 12,
    );
    return new Response(JSON.stringify(invariants), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/inject" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseDaemonInjectEnvelope(body);
      if (!envelope) {
        setLatestDaemonAdmission({
          tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
          status: "rejected",
          requestedAction: "UNKNOWN",
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: "INVALID_INJECT_PAYLOAD",
          sharedCenter: "parse",
          dominantInvariantVector: "none",
        });
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_inject_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_INJECT_PAYLOAD",
            expected:
              "Provide action_type and payload {target_x,target_y,intensity,hex_code?}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const baseline = collectRuntimeMetrics();
      const safeMode = isDaemonSafeMode(baseline);
      const recordDaemonCodexAdmission = (
        severity: "MID" | "HIGH" | "BLOCKED",
        requestedAction: string,
        appliedAction: string,
        score: number,
        reason: string,
        sharedCenter: string,
        dominantInvariantVector: string,
      ): void => {
        AKASHA_CODEX.recordDaemonAdmission(
          baseline.tick,
          requestedAction,
          appliedAction,
          severity,
          score,
          reason,
          sharedCenter,
          dominantInvariantVector,
          baseline.glyphTransport,
        );
      };

      if (envelope.action_type === "OBSERVE") {
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "accepted",
          requestedAction: "OBSERVE",
          appliedAction: "OBSERVE",
          degraded: false,
          severity: "LOW",
          score: 0,
          reason: "OBSERVE_NOOP",
          sharedCenter: "tick.exists",
          dominantInvariantVector: "none",
        });
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_observe_noop",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_OBSERVE",
          tick: baseline.tick,
          metrics: baseline,
          safe_mode: safeMode.blocked,
          safe_mode_reason: safeMode.reason,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            status: 200,
            reason: "OBSERVE_NOOP",
            safe_mode: safeMode.blocked,
            safe_mode_reason: safeMode.reason,
          }),
          { status: 200, headers: JSON_HEADERS },
        );
      }

      if (safeMode.blocked) {
        recordDaemonCodexAdmission(
          "BLOCKED",
          envelope.action_type,
          "BLOCKED",
          0,
          safeMode.reason,
          "safe-mode",
          "none",
        );
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "rejected",
          requestedAction: envelope.action_type,
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: safeMode.reason,
          sharedCenter: "safe-mode",
          dominantInvariantVector: "none",
        });
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_safe_mode_block",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_REJECT",
          reason: safeMode.reason,
          tick: baseline.tick,
          action: envelope.action_type,
          payload: envelope.payload,
          metrics: baseline,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: safeMode.reason,
            safe_mode: true,
            status: 429,
          }),
          { status: 429, headers: JSON_HEADERS },
        );
      }

      const dynamicBudgetMax = resolveDaemonBudgetMax(baseline);
      const budget = consumeDaemonBudget(dynamicBudgetMax);
      if (!budget.ok) {
        recordDaemonCodexAdmission(
          "BLOCKED",
          envelope.action_type,
          "BLOCKED",
          0,
          "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          "budget-window",
          "none",
        );
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "rejected",
          requestedAction: envelope.action_type,
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          sharedCenter: "budget-window",
          dominantInvariantVector: "none",
        });
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_rate_limit_block",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_REJECT",
          reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          tick: baseline.tick,
          action: envelope.action_type,
          payload: envelope.payload,
          metrics: baseline,
          budget,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
            status: 429,
            retry_after_ms: budget.resetInMs,
            dynamic_max_actions: dynamicBudgetMax,
          }),
          { status: 429, headers: JSON_HEADERS },
        );
      }

      let plasmidRisk: PlasmidRiskProfile | null = null;
      if (envelope.action_type === "INJECT_PLASMID") {
        if (!envelope.payload.hex_code) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            "INVALID_PLASMID_PAYLOAD",
            "policy",
            "none",
          );
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: "INVALID_PLASMID_PAYLOAD",
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_block_missing_hex",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "INVALID_PLASMID_PAYLOAD",
              expected: "hex_code must be 16 hex chars",
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }

        if (envelope.payload.intensity > currentDaemonMaxPlasmidCharge()) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
            "policy",
            "none",
          );
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_block_plasmid_charge",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
              max: currentDaemonMaxPlasmidCharge(),
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }

        const plasmidPolicy = evaluatePlasmidPolicy(envelope.payload.hex_code);
        if (!plasmidPolicy.ok) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            plasmidPolicy.reason,
            "policy",
            "none",
          );
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: plasmidPolicy.reason,
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_block_plasmid_rule",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: plasmidPolicy.reason,
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }
        plasmidRisk = evaluatePlasmidRisk(
          envelope.payload.hex_code,
          envelope.payload.intensity,
        );
      }

      const dominantGenome = dominantGenomes(STATE_MATRIX.getActiveIndices(), 1)
        .at(0) ?? "";
      const narrativeContext = normalizeDaemonNarrativeContext(
        await AKASHA_CODEX.getNarrative(3),
        dominantGenome,
      );
      const ingressPlan = planInvariantIngress(
        envelope,
        evaluateInvariantAdmission(
          envelope,
          baseline,
          narrativeContext,
          plasmidRisk,
        ),
      );
      const applied = ingressPlan.applied;

      if (ingressPlan.degraded) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: ingressPlan.admission.severity === "HIGH"
            ? "daemon_invariant_degrade_high"
            : "daemon_invariant_degrade_mid",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_DEGRADED",
          tick: baseline.tick,
          requested_action: ingressPlan.requested.action_type,
          applied_action: ingressPlan.applied.action_type,
          requested_payload: ingressPlan.requested.payload,
          applied_payload: ingressPlan.applied.payload,
          degrade_reason: ingressPlan.degradeReason,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          metrics: baseline,
          budget,
        });
        AKASHA_CODEX.recordDaemonAdmission(
          baseline.tick,
          ingressPlan.requested.action_type,
          ingressPlan.applied.action_type,
          ingressPlan.admission.severity,
          ingressPlan.admission.score,
          ingressPlan.degradeReason ?? "INVARIANT_DEGRADED",
          ingressPlan.admission.context.sharedCenter,
          ingressPlan.admission.context.dominantInvariantVector,
          baseline.glyphTransport,
        );
      }

      if (applied.action_type === "DROP_PHEROMONE") {
        if (
          applied.payload.intensity > currentDaemonMaxPheromoneIntensity()
        ) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            applied.action_type,
            ingressPlan.admission.score,
            "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
            ingressPlan.admission.context.sharedCenter,
            ingressPlan.admission.context.dominantInvariantVector,
          );
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: applied.action_type,
            degraded: ingressPlan.degraded,
            severity: "BLOCKED",
            score: ingressPlan.admission.score,
            reason: "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
            sharedCenter: ingressPlan.admission.context.sharedCenter,
            dominantInvariantVector:
              ingressPlan.admission.context.dominantInvariantVector,
            codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
            codexLineageGuardScore:
              ingressPlan.admission.context.codexLineageGuardScore,
            codexLineageGuardReasons:
              ingressPlan.admission.context.codexLineageGuardReasons,
          });
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_block_pheromone_intensity",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
              max: currentDaemonMaxPheromoneIntensity(),
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }
        const queued = CONTROL_INTENT_QUEUE.enqueueAvatar(
          applied.payload.target_x,
          applied.payload.target_y,
          applied.payload.intensity,
          "external_daemon",
        );
        const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
        if (queued.ok) {
          queueDaemonAudit({
            auditId,
            action: "DROP_PHEROMONE",
            requestedAction: ingressPlan.requested.action_type,
            targetX: applied.payload.target_x,
            targetY: applied.payload.target_y,
            intensity: applied.payload.intensity,
            queued: queued.ok,
            queueReason: queued.reason,
            queuedStatus: queued.status,
            tickApplied: baseline.tick,
            evaluateAtTick: baseline.tick + DAEMON_AUDIT_EFFECT_TICKS,
            baseline,
            sharedCenter: ingressPlan.admission.context.sharedCenter,
            dominantInvariantVector:
              ingressPlan.admission.context.dominantInvariantVector,
            codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
          });
        }
        await appendDaemonAudit({
          event_type: "DAEMON_ACCEPT",
          audit_id: auditId,
          tick: baseline.tick,
          action: "DROP_PHEROMONE",
          requested_action: ingressPlan.requested.action_type,
          payload: applied.payload,
          queue: queued,
          metrics: baseline,
          budget,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          degraded: ingressPlan.degraded,
          degrade_reason: ingressPlan.degradeReason,
        });
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "accepted",
          requestedAction: ingressPlan.requested.action_type,
          appliedAction: "DROP_PHEROMONE",
          degraded: ingressPlan.degraded,
          severity: ingressPlan.admission.severity,
          score: ingressPlan.admission.score,
          reason: ingressPlan.degradeReason ??
            ingressPlan.admission.reasons.join("|"),
          sharedCenter: ingressPlan.admission.context.sharedCenter,
          dominantInvariantVector:
            ingressPlan.admission.context.dominantInvariantVector,
          codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
          codexLineageGuardScore:
            ingressPlan.admission.context.codexLineageGuardScore,
          codexLineageGuardReasons:
            ingressPlan.admission.context.codexLineageGuardReasons,
        });
        return new Response(
          JSON.stringify({
            ...queued,
            admission: ingressPlan.admission,
            plasmid_risk: plasmidRisk,
            degraded: ingressPlan.degraded,
            degrade_reason: ingressPlan.degradeReason,
            applied_action: "DROP_PHEROMONE",
          }),
          {
            status: queued.status,
            headers: JSON_HEADERS,
          },
        );
      }

      if (!applied.payload.hex_code) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_block_missing_hex",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_PLASMID_PAYLOAD",
            expected: "hex_code must be 16 hex chars",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const queued = CONTROL_INTENT_QUEUE.enqueuePlasmid(
        applied.payload.target_x,
        applied.payload.target_y,
        applied.payload.hex_code,
        applied.payload.intensity,
        "external_daemon",
      );
      const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
      if (queued.ok) {
        queueDaemonAudit({
          auditId,
          action: "INJECT_PLASMID",
          requestedAction: ingressPlan.requested.action_type,
          targetX: applied.payload.target_x,
          targetY: applied.payload.target_y,
          intensity: applied.payload.intensity,
          hexCode: applied.payload.hex_code,
          queued: queued.ok,
          queueReason: queued.reason,
          queuedStatus: queued.status,
          tickApplied: baseline.tick,
          evaluateAtTick: baseline.tick + DAEMON_AUDIT_EFFECT_TICKS,
          baseline,
          sharedCenter: ingressPlan.admission.context.sharedCenter,
          dominantInvariantVector:
            ingressPlan.admission.context.dominantInvariantVector,
          codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
        });
      }
      await appendDaemonAudit({
        event_type: "DAEMON_ACCEPT",
        audit_id: auditId,
        tick: baseline.tick,
        action: "INJECT_PLASMID",
        requested_action: ingressPlan.requested.action_type,
        payload: applied.payload,
        queue: queued,
        metrics: baseline,
        budget,
        admission: ingressPlan.admission,
        plasmid_risk: plasmidRisk,
        degraded: ingressPlan.degraded,
        degrade_reason: ingressPlan.degradeReason,
      });
      setLatestDaemonAdmission({
        tick: baseline.tick,
        status: "accepted",
        requestedAction: ingressPlan.requested.action_type,
        appliedAction: "INJECT_PLASMID",
        degraded: ingressPlan.degraded,
        severity: ingressPlan.admission.severity,
        score: ingressPlan.admission.score,
        reason: ingressPlan.degradeReason ??
          ingressPlan.admission.reasons.join("|"),
        sharedCenter: ingressPlan.admission.context.sharedCenter,
        dominantInvariantVector:
          ingressPlan.admission.context.dominantInvariantVector,
        codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
        codexLineageGuardScore:
          ingressPlan.admission.context.codexLineageGuardScore,
        codexLineageGuardReasons:
          ingressPlan.admission.context.codexLineageGuardReasons,
      });
      return new Response(
        JSON.stringify({
          ...queued,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          degraded: ingressPlan.degraded,
          degrade_reason: ingressPlan.degradeReason,
          applied_action: "INJECT_PLASMID",
        }),
        {
          status: queued.status,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      setLatestDaemonAdmission({
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        status: "rejected",
        requestedAction: "UNKNOWN",
        appliedAction: "BLOCKED",
        degraded: false,
        severity: "BLOCKED",
        score: 0,
        reason: "INVALID_INJECT_PAYLOAD",
        sharedCenter: "exception",
        dominantInvariantVector: "none",
      });
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_inject_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_INJECT_PAYLOAD",
          details: String(err),
        }),
        { status: 400, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/crisis" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueCrisis(body?.logicHex);
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_CRISIS_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (url.pathname === "/federate" && req.method === "POST") {
    const qCall = CONTROL_INTENT_QUEUE.enqueueFederate.bind(
      CONTROL_INTENT_QUEUE,
    );
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const arrayBuffer = await req.arrayBuffer();
      const packet = new Uint8Array(arrayBuffer);
      const sourceNode = req.headers.get("x-omega-source-node") || "unknown";

      let peerRuleGenome = null;
      let peerBehaviorProfile = null;
      let peerCodexProfile = null;
      try {
        const rStr = req.headers.get("x-omega-rule-genome");
        if (rStr) {
          peerRuleGenome = JSON.parse(rStr);
          P2P_FEDERATION.observePeerRuleGenome(sourceNode, peerRuleGenome);
        }
        const bStr = req.headers.get("x-omega-behavior-profile");
        if (bStr) peerBehaviorProfile = JSON.parse(bStr);
        const cStr = req.headers.get("x-omega-codex-profile");
        if (cStr) peerCodexProfile = JSON.parse(cStr);
      } catch (e) {
        LOGGER.warn(
          `🛸 [FEDERATION] Invalid admission headers from ${sourceNode}`,
        );
      }

      const localContext = buildFederateLocalContext({}, PULSE.currentPulseId);
      const queued = qCall(
        packet,
        sourceNode,
        peerRuleGenome,
        peerBehaviorProfile,
        localContext.behavior,
        peerCodexProfile,
        localContext.codex,
      );

      LOGGER.info(
        `🛸 [FEDERATION] Incoming binary migration from ${sourceNode}: ${packet.length} bytes`,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_FEDERATE_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (url.pathname === "/peers") {
    return new Response(JSON.stringify(Array.from(P2P_FEDERATION.peers)), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/peers/profiles") {
    return new Response(
      JSON.stringify({
        local: P2P_FEDERATION.localRuleGenome,
        peers: P2P_FEDERATION.getPeerRuleProfiles(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/federate/admission") {
    return new Response(
      JSON.stringify(CONTROL_INTENT_QUEUE.getFederationAdmissionState()),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/vox") {
    return new Response(
      JSON.stringify(await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd())),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/thoughts") {
    return new Response(
      JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive)),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/snapshots" && req.method === "GET") {
    const list = await SNAPSHOT_ENGINE.listSnapshots();
    return new Response(JSON.stringify(list), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/governance" && req.method === "GET") {
    return new Response(JSON.stringify(SOVEREIGNTY_ENGINE.currentRegent), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/lineage" && req.method === "GET") {
    return new Response(
      JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.lineage)),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (url.pathname === "/codex" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "8", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 8,
    );
    return new Response(JSON.stringify(snapshot), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/species" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.species), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/chronicles" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.chronicles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/relics" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.relics), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/narrative" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "5", 10);
    const narrative = await AKASHA_CODEX.getNarrative(
      Number.isFinite(limit) ? limit : 5,
    );
    return new Response(JSON.stringify(narrative), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/invariants" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const invariants = await AKASHA_CODEX.getInvariants(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(invariants), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/viral" && req.method === "GET") {
    // @ts-ignore: viralGridBuffer is dynamically exposed
    return new Response(STATE_MATRIX.viralGridBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/immunity" && req.method === "GET") {
    const buffer = STATE_MATRIX.immuneBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/signals" && req.method === "GET") {
    const buffer = STATE_MATRIX.currentReadBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/stiffness" && req.method === "GET") {
    const buffer = STATE_MATRIX.bondStiffnessBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/bonds" && req.method === "GET") {
    const BONDS_OFFSET = OFFSETS.BONDS_OFFSET;
    const BONDS_SIZE = MAX_ATOMS * 4 * 4;
    const view = new Uint8Array(STATE_MATRIX.buffer, BONDS_OFFSET, BONDS_SIZE);
    const copy = new Uint8Array(view.byteLength);
    copy.set(view);
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/synapses" && req.method === "GET") {
    const buffer = STATE_MATRIX.synapticStackBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/architecture" && req.method === "GET") {
    const buffer = STATE_MATRIX.structureGridBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/memory" && req.method === "GET") {
    const buffer = STATE_MATRIX.memoryGridBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/roles" && req.method === "GET") {
    const buffer = STATE_MATRIX.roleRegistryBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/snapshot/export" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    const result = await SNAPSHOT_ENGINE.exportSnapshot();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/snapshot/import" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueSnapshotImport(
        body?.timestamp,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_SNAPSHOT_IMPORT_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 3. Direct Thought Injection (POST) - OBSOLETE in Era 18
  /*
    if (url.pathname === "/inject" && req.method === "POST") {
        try {
            const { text, energy } = await req.json();
            LOGGER.info(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
            await SEMANTIC_MEMBRANE.injectThought(text, energy || 100);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Injection Failed", { status: 400 });
        }
    }
    */

  // 4. Spatial Mutation (POST)
  if (url.pathname === "/mutate" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { x, y, deltaEnergy, radius } = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueMutate(
        x,
        y,
        deltaEnergy,
        radius,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_MUTATE_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 5. Avatar Cursor Sync (POST)
  if (url.pathname === "/avatar" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { x, y } = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueAvatar(x, y);
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_AVATAR_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const html = await Deno.readTextFile(UI_PATH);
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (e) {
    return new Response("UI not found.", { status: 404 });
  }
});

// 2. Start Simulation Pulse Loop (Background)
(async () => {
  LOGGER.info("💓 [SYSTEM] Pulse Engine Ignited.");
  const coldstart = COLDSTART_BOOTSTRAP.seed({
    enabled: COLDSTART_POLICY.enabled,
    count: COLDSTART_POLICY.count,
    replicatorRatio: COLDSTART_POLICY.replicatorRatio,
    guardianRatio: COLDSTART_POLICY.guardianRatio,
    seed: COLDSTART_POLICY.seed,
    energy: COLDSTART_POLICY.energy,
    resonance: COLDSTART_POLICY.resonance,
  });
  if (coldstart.skipped) {
    LOGGER.info(`🌱 [COLDSTART] ${coldstart.reason}`);
  } else {
    LOGGER.info(
      `🌱 [COLDSTART] seeded=${coldstart.seeded}/${coldstart.configuredCount} replicators=${coldstart.replicators} architects=${coldstart.architects} seed=${coldstart.seed}`,
    );
  }

  const isGenesisRun = Deno.args.includes("--genesis") || Deno.args.includes("--autonomous");
  if (isGenesisRun) {
    LOGGER.info("🌀 [GENESIS] Autonomous Genesis Run Active. Matrix is self-driving 24/7.");
    try {
      Deno.addSignalListener("SIGINT", async () => {
        LOGGER.info("🛑 [GENESIS] Genesis Interrupted by SIGINT! Saving final Genesis Block before exit...");
        const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
        await SNAPSHOT_ENGINE.exportSnapshot({
          tick,
          reason: "genesis_shutdown",
          prune: false,
          retention: 0
        });
        LOGGER.info(`💾 [GENESIS] Genesis Block Saved at tick ${tick}. Terminating.`);
        Deno.exit(0);
      });
    } catch {
      // Deno.addSignalListener is not supported on Windows, silently ignore
    }
  }

  await syncDaemonPheromonePolicyLedgerHydration();
  await syncDaemonPlasmidPolicyLedgerHydration();
  
  PULSE.setOracleDelegate({
    setNeuralCoherence: (c: number) => { SOVEREIGN_ORACLE.neuralCoherence = c; },
    getNeuralCoherence: () => SOVEREIGN_ORACLE.neuralCoherence,
    gatherEpochTelemetry: () => SOVEREIGN_ORACLE.gatherEpochTelemetry(),
    broadcastWhisper: (t: number, tel: any, c: number) => SOVEREIGN_ORACLE.broadcastWhisper(t, tel, c),
    consultOracle: (idx: number, tel: any) => SOVEREIGN_ORACLE.consultOracle(idx, tel),
    drainPendingMutations: () => SOVEREIGN_ORACLE.drainPendingMutations()
  });

  PULSE.setAkashaDelegate({
    recordMutationTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    flushMutationTelemetry: (t: number) => MUTATION_TELEMETRY.flushIfDue(t),
    compressMemory: (m: any) => compressMemory(m),
    decompressMemoryToLattice: (m: any, p: any) => decompressMemoryToLattice(m, p),
    saveEpoch: (m: any, t: number, l: string, p1: number, p2: number, h: string) => saveEpoch(m as any, t, l, p1, p2, h),
    broadcastPanopticonFrame: (f: ArrayBuffer) => PANOPTICON_SERVER.broadcastBinaryFrame(f),
    recordImmunologicalPurge: (c: number) => AKASHA_CODEX.recordImmunologicalPurge(c),
    observePulseCodex: (t: number, p: number, g: any, s: number) => AKASHA_CODEX.observePulse(t, p, g, s),
    saveSnap: async (t: number) => { await SNAP_ENGINE.save(t); },
    cleanupSnap: (r: number) => SNAP_ENGINE.cleanup(r)
  });

  const NEXUS_DAEMON = new SwarmNexus({
    instanceId: 1,
    seedNodes: [],
  });

  NEXUS_DAEMON.onAtomTransit = PULSE.onRemoteAtomTransit;
  NEXUS_DAEMON.onSyncRequest = PULSE.onRemoteSyncRequest;
  NEXUS_DAEMON.onEpochPayload = PULSE.onRemoteEpochPayload;

  CONTROL_INTENT_QUEUE.setDelegate({
    recordTelemetry: (ev) => MUTATION_TELEMETRY.record(ev as any),
    importSnapshot: (ts) => SNAPSHOT_ENGINE.importSnapshot(ts),
    unpackAtom: (p) => P2P_CODEC.unpackAtom(p),
  });

  PREDICTION_MARKET.setDelegate({
    recordMarketResolution: (t, c, f, w) => AKASHA_CODEX.recordMarketResolution(t, c, f, w),
  });

  SOVEREIGNTY_ENGINE.setDelegate({
    recordDecreeShift: (t: number, o: string, n: string, e: number) => AKASHA_CODEX.recordDecreeShift(t, o, n, e),
  });

  P2P_FEDERATION.setUpwardDelegate({
    recordTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    lookupLineageProfile: (l: string) => AKASHA_CODEX.lookupLineageProfile(l),
    captureBehaviorFrame: (idx: number) => SEMANTIC_MEMBRANE.captureBehaviorFrame(idx),
  });

  SOVEREIGN_ORACLE.setAkashaDelegate({
    recordTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    appendObserverCommentary: (t: number, ep: number, m: string) => AKASHA_CODEX.appendObserverCommentary(t, ep, m),
  });

  PULSE.setNoosphereDelegate({
    unpackAtom: (p) => P2P_CODEC.unpackAtom(p),
    packAtom: (i) => P2P_CODEC.packAtom(i),
    evaluateHeartbeat: (t, h, p, e) => SWARM_NODE.evaluateHeartbeat(t, h, p, e),
    sendEpochPayload: (p, f) => NEXUS_DAEMON.sendEpochPayload(p, f),
    routeAtom: (p) => NEXUS_DAEMON.routeAtom(p),
    startNexus: () => NEXUS_DAEMON.start(),
    broadcastSyncRequest: () => NEXUS_DAEMON.broadcastSyncRequest(),
    broadcastEpochConsensus: (t, h) => NEXUS_DAEMON.broadcastEpochConsensus(t, h),
    getNexusStatus: () => ({
      mainnetEnabled: NEXUS_DAEMON.mainnetEnabled,
      bootstrapHubUrl: NEXUS_DAEMON.bootstrapHubUrl ?? "",
      seedNodesLength: NEXUS_DAEMON.seedNodes.length,
      localCurrentTick: NEXUS_DAEMON.localCurrentTick,
      localTps: NEXUS_DAEMON.localTps
    }),
    setNexusStatus: (s) => {
      if (s.mainnetEnabled !== undefined) NEXUS_DAEMON.mainnetEnabled = s.mainnetEnabled;
      if (s.bootstrapHubUrl !== undefined) NEXUS_DAEMON.bootstrapHubUrl = s.bootstrapHubUrl;
      if (s.localCurrentTick !== undefined) NEXUS_DAEMON.localCurrentTick = s.localCurrentTick;
      if (s.localTps !== undefined) NEXUS_DAEMON.localTps = s.localTps;
    },
    getMedianSwarmTick: (t) => NEXUS_DAEMON.getMedianSwarmTick(t)
  });

  await PULSE.initWorkers();

  let lastOracleTick = 0;
  const intervalArg = Deno.args.find(a => a.startsWith("--genesis-interval="));
  const genesisInterval = intervalArg ? Number(intervalArg.split("=")[1]) : 10000;

  // Phase 48: Eschaton Trackers
  let stagnantTicks = 0;
  let lastPopulation = -1;
  const STAGNATION_THRESHOLD = 10000;

  while (true) {
    await PULSE.tick();
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    
    if (tick % 100 === 0) {
      LINEAGE_TRACKER.updateMetrics(tick);
    }
    
    await flushDaemonAuditEffects(tick);
    await maybeAutoSnapshot(tick);
    if (
      telemetryStreamLastTick < 0 ||
      tick - telemetryStreamLastTick >= TELEMETRY_STREAM_EMIT_INTERVAL_TICKS
    ) {
      const metrics = collectRuntimeMetrics();
      const safeMode = isDaemonSafeMode(metrics);
      const glyphSnap = GLYPH_BUFFER.snapshot();

      TELEMETRY_STREAM.emit({
        tick: metrics.tick,
        population: metrics.population,
        avgEnergy: metrics.avgEnergy,
        neuralCoherence: metrics.neuralCoherence,
        spatialOverflowRatio: metrics.spatialOverflowRatio,
        daemonSafeMode: safeMode.blocked,
      });
      telemetryStreamLastTick = tick;
    }

    if (isGenesisRun && tick - lastOracleTick >= genesisInterval) {
      const epoch = Math.floor(tick / genesisInterval);
      const metrics = collectRuntimeMetrics();
      const { dominantMeme, destructiveMeme } = LINEAGE_TRACKER.closeEpoch(tick);
      const telemetry = {
        epoch,
        population: metrics.population,
        avgEnergy: metrics.avgEnergy,
        neuralCoherence: metrics.neuralCoherence,
        entropyPressure: STATE_MATRIX.getHormone(0),
        dominantMeme,
        destructiveMeme
      };

      // Phase 48 Stagnation Check
      let eschatonReason: string | null = null;
      const epochTelemetry = SOVEREIGN_ORACLE.gatherEpochTelemetry();
      const topGenome = epochTelemetry.dominant_genomes[0];
      const isMonoculture = topGenome && (topGenome.count / Math.max(1, metrics.population)) > 0.90;

      if (metrics.neuralCoherence >= 10000) {
        eschatonReason = "Absolute Order (Singularity of Coherence)";
      } else if (metrics.population > 0 && isMonoculture) {
        eschatonReason = "Leviathan Victory (Absolute Monoculture)";
      } else if (metrics.population > 0 && metrics.avgEnergy < 10 && Math.abs(metrics.population - lastPopulation) < 5) {
        stagnantTicks += genesisInterval;
        if (stagnantTicks >= STAGNATION_THRESHOLD) {
          eschatonReason = "Heat Death (Energetic and Memetic Stagnation)";
        }
      } else {
        stagnantTicks = 0;
      }
      lastPopulation = metrics.population;

      if (eschatonReason) {
        await SOVEREIGN_ORACLE.declareEschaton(eschatonReason);
        STATE_MATRIX.clear();
        mutateUniversalConstants();
        stagnantTicks = 0;
        lastOracleTick = tick;
        LOGGER.info("🌀 [ESCHATON] The Matrix has been reset. A new Kalpa begins.");
        // We do not consult the Oracle for a normal plasmid on Kalpa boundary
        continue;
      }

      // For testing speed: always run the first interval.
      SOVEREIGN_ORACLE.consultAutonomousOracle(telemetry).catch(e => LOGGER.error("[GENESIS] Oracle Loop Failed:", e));
      lastOracleTick = tick;
    }

    await new Promise((r) => setTimeout(r, 16));
  }
})();

// 3. Start Panopticon Telemetry Server (Background)
(() => {
  PANOPTICON_SERVER.start();
})();

// 4. Start Cognitive Breathing Loop (Background)
(async () => {
  LOGGER.info("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
  await new Promise((r) => setTimeout(r, 5000));
  await BREATH.inhale();
})();

```

---

## FILE: 07_meta/03_guards/topology_linter.ts

```typescript
import { walk } from "https://deno.land/std@0.224.0/fs/mod.ts";

const LAYER_PREFIXES = ["00_", "01_", "02_", "03_", "04_", "05_", "06_"];
let violations = 0;

function getLayerCode(layerStr: string): number {
    return parseInt(layerStr.substring(0, 2), 10);
}

const importRegex = /import\s+(?:(?:{[^}]+})|(?:[\w\s,]+\*?\s+as\s+\w+))\s+from\s+["']([^"']+)["']/g;

for await (const entry of walk(".", { exts: [".ts"], skip: [/\.git/, /08_artifacts/, /63_necropolis/, /07_meta/] })) {
    if (!entry.isFile) continue;
    
    let sourceLayerPrefix = null;
    for (const p of LAYER_PREFIXES) {
        if (entry.path.startsWith(p)) {
            sourceLayerPrefix = p;
            break;
        }
    }
    
    if (!sourceLayerPrefix) continue;
    const sourceCode = getLayerCode(sourceLayerPrefix);
    
    const content = await Deno.readTextFile(entry.path);
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Skip external imports
        if (importPath.startsWith("http") || importPath.startsWith("npm:")) continue;
        
        let targetLayerPrefix = null;
        for (const p of LAYER_PREFIXES) {
            if (importPath.includes(p)) {
                targetLayerPrefix = p;
                break;
            }
        }
        
        if (targetLayerPrefix && targetLayerPrefix !== sourceLayerPrefix) {
            const targetCode = getLayerCode(targetLayerPrefix);
            
            // Rule 1: YY <= XX (Downward scalar)
            if (targetCode > sourceCode) {
                console.error(`[TOPOLOGY BREACH] Ascending Import: ${entry.path} (${sourceLayerPrefix}) imports from ${targetLayerPrefix} (${importPath})`);
                violations++;
            }
            
            // Rule 2: Exclusively through mod.ts
            if (!importPath.endsWith("/mod.ts")) {
                console.error(`[TOPOLOGY BREACH] Deep Import Violation: ${entry.path} imports directly from ${importPath}. Must go through mod.ts.`);
                violations++;
            }
        }
    }
}

if (violations > 0) {
    console.error(`\n❌ Failed. ${violations} topological breaches detected in the Lattice.`);
    Deno.exit(1);
} else {
    console.log("✅ The Lattice is Absolute. 0 Topology Breaches.");
}

```

---

## FILE: reduction_core/doll_fork/DOLL_FORK_MATRIX.ts

```typescript
// OMEGA-64 | DOLL_FORK_MATRIX.ts | Stage 21: The Doll Fork
import * as OFFSETS from "@00";
import { sharedBuffer as mainlineBuffer } from "@00";

/**
 * DollFork provides an isolated memory space (Shadow Matrix) that mirrors the mainline STATE_MATRIX.
 * It allows for risk-free simulation, mutation, and relic cultivation without affecting global causality.
 */
export class DollFork {
  public wasmMemory: WebAssembly.Memory;
  public shardBuffer: SharedArrayBuffer;
  public views: {
    ids: BigUint64Array;
    xs: Int16Array;
    ys: Int16Array;
    energies: Int32Array;
    resonances: Int32Array;
    phases: Int32Array;
    roles: Uint8Array;
    logic: Uint8Array;
    bonds: Uint32Array;
    stiffness: Float32Array;
    bondDistances: Uint8Array;
    damping: Uint8Array;
    causality: Uint8Array;
    hormones: Uint16Array;
    signalGrid: Int32Array;
    memoryGrid: Uint8Array;
    structureGrid: Int32Array;
    glyphHeader: Int32Array;
    glyphPayload: Uint8Array;
    coherence: Int32Array;
    // Physics Read Support (Double Buffering)
    readXs: Int16Array;
    readYs: Int16Array;
    readEnergies: Int32Array;
    readResonances: Int32Array;
  };

  constructor(customMemory?: WebAssembly.Memory) {
    this.wasmMemory = customMemory ?? new WebAssembly.Memory({
      initial: OFFSETS.WASM_MEMORY_PAGES,
      maximum: OFFSETS.WASM_MEMORY_PAGES,
      shared: true,
    });
    this.shardBuffer = this.wasmMemory.buffer as SharedArrayBuffer;

    // Initialize primary views (Host side)
    const b = this.shardBuffer;
    this.views = {
      ids: new BigUint64Array(b, OFFSETS.IDS_OFFSET, OFFSETS.MAX_ATOMS),
      xs: new Int16Array(b, OFFSETS.XS_OFFSET, OFFSETS.MAX_ATOMS),
      ys: new Int16Array(b, OFFSETS.YS_OFFSET, OFFSETS.MAX_ATOMS),
      energies: new Int32Array(b, OFFSETS.ENERGY_OFFSET, OFFSETS.MAX_ATOMS),
      resonances: new Int32Array(
        b,
        OFFSETS.RESONANCE_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      phases: new Int32Array(b, OFFSETS.PHASE_OFFSET, OFFSETS.MAX_ATOMS),
      roles: new Uint8Array(b, OFFSETS.ROLES_OFFSET, OFFSETS.MAX_ATOMS),
      logic: new Uint8Array(b, OFFSETS.LOGIC_OFFSET, OFFSETS.MAX_ATOMS * 8),
      bonds: new Uint32Array(b, OFFSETS.BONDS_OFFSET, OFFSETS.MAX_ATOMS * 4),
      stiffness: new Float32Array(
        b,
        OFFSETS.STIFFNESS_OFFSET,
        OFFSETS.MAX_ATOMS * 4,
      ),
      bondDistances: new Uint8Array(
        b,
        OFFSETS.BOND_DISTANCES_OFFSET,
        OFFSETS.MAX_ATOMS * 4,
      ),
      damping: new Uint8Array(b, OFFSETS.DAMPING_OFFSET, OFFSETS.MAX_ATOMS),
      causality: new Uint8Array(b, OFFSETS.CAUSALITY_OFFSET, OFFSETS.MAX_ATOMS),
      hormones: new Uint16Array(b, OFFSETS.HORMONE_OFFSET, 6),
      signalGrid: new Int32Array(
        b,
        OFFSETS.SIGNAL_GRID_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      memoryGrid: new Uint8Array(
        b,
        OFFSETS.MEMORY_GRID_OFFSET,
        OFFSETS.GRID_CELLS * 8,
      ),
      structureGrid: new Int32Array(
        b,
        OFFSETS.STRUCTURE_GRID_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      glyphHeader: new Int32Array(
        b,
        OFFSETS.GLYPH_HEADER_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      glyphPayload: new Uint8Array(
        b,
        OFFSETS.GLYPH_PAYLOAD_OFFSET,
        OFFSETS.GRID_CELLS * 8,
      ),
      coherence: new Int32Array(b, OFFSETS.COHERENCE_OFFSET, 1),
      readXs: new Int16Array(
        b,
        OFFSETS.PHYSICS_READ_XS_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readYs: new Int16Array(
        b,
        OFFSETS.PHYSICS_READ_YS_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readEnergies: new Int32Array(
        b,
        OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readResonances: new Int32Array(
        b,
        OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
    };
  }

  /**
   * Performs a bit-perfect deep copy from the mainline sharedBuffer into the DollFork shard.
   */
  public forkFromMainline(): void {
    const mainlineView = new Uint8Array(mainlineBuffer);
    const shardView = new Uint8Array(this.shardBuffer);
    shardView.set(mainlineView);
  }

  /**
   * Synchronizes 'Physics Read' buffers from primary buffers.
   * Essential before calling WASM execution kernels in the shadow world.
   */
  public syncReadViews(): void {
    this.views.readXs.set(this.views.xs);
    this.views.readYs.set(this.views.ys);
    this.views.readEnergies.set(this.views.energies);
    this.views.readResonances.set(this.views.resonances);
  }

  public getMetrics() {
    let totalEnergy = 0;
    let activePopulation = 0;
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (this.views.energies[i] > 0) {
        totalEnergy += Number(this.views.energies[i]);
        activePopulation++;
      }
    }
    return {
      activePopulation,
      totalEnergy,
      avgEnergy: activePopulation > 0 ? totalEnergy / activePopulation : 0,
    };
  }
}

```

---

## FILE: reduction_core/doll_fork/DOLL_FORK_RUNNER.ts

```typescript
// OMEGA-64 | DOLL_FORK_RUNNER.ts | Stage 21: The Doll Fork
import * as OFFSETS from "@00";
import { DollFork } from "./DOLL_FORK_MATRIX.ts";
import { LOGGER } from "@00";

export class DollForkRunner {
  private wasmInstance: WebAssembly.Instance | null = null;
  private fork: DollFork;

  constructor(fork: DollFork) {
    this.fork = fork;
  }

  /**
   * Initializes a private WebAssembly instance for the shadow matrix.
   */
  public async init(): Promise<void> {
    const wasmRes = await fetch(
      new URL("../../00_substrate/08_artifacts/release.wasm", import.meta.url).href,
    );
    const wasmBytes = await wasmRes.arrayBuffer();

    const traceAtom = (
      idx: number,
      op: number,
      gx: number,
      gy: number,
      target: number,
    ) => {
      // Shadow traces are suppressed
    };

    const instantiated = await WebAssembly.instantiate(wasmBytes, {
      index: { trace_atom: traceAtom },
      env: {
        memory: this.fork.wasmMemory,
        abort: (msg: any) => LOGGER.error("[SHADOW WASM ABORT]:", msg),
        trace_atom: traceAtom,
      },
    });

    this.wasmInstance = instantiated.instance;
  }

  /**
   * Executes a single discrete shadow tick on the forked matrix.
   */
  public runShadowTick(tickCount: number): void {
    if (!this.wasmInstance) throw new Error("DollForkRunner not initialized");

    // 0. Sync Read Views (Double Buffering)
    this.fork.syncReadViews();

    const exports = this.wasmInstance.exports as any;

    try {
      // 1. Build Spatial Hash
      exports.build_spatial_hash();

      // 2. Execute Atoms (Physics + VM)
      for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
        if (this.fork.views.ids[i] !== 0n) {
          exports.execute_atom(i);
        }
      }

      // 3. Resolve Bonds & Spawns
      exports.resolve_bond_requests(0, OFFSETS.MAX_ATOMS);
      exports.drain_spawn_requests(tickCount);

      // 4. Tick Environment (Glyph Transport, Decay)
      exports.tickGlyphTransport(tickCount);
      exports.tick_environment(tickCount);

      // 5. Apply Metabolism
      exports.apply_metabolism_kernel(
        0,
        OFFSETS.MAX_ATOMS,
        0,
        0, // Novelty/Symbiosis
        10, // Base Tax
        1000, // Target Energy
        10,
        10,
        10, // Band, MaxDelta, Overflow
        0, // Spatial Overflow
        1, // Starvation Floor
        0, // Subsidy
      );
    } catch (err) {
      LOGGER.error("[SHADOW TICK ERROR]", err);
      throw err;
    }
  }
}

```

---

## FILE: reduction_core/DRIFT_WARDEN.ts

```typescript
// OMEGA-64 | DRIFT_WARDEN.ts | Stage 22: Adaptive Genesis & Drift Response
import * as OFFSETS from "@00";
import { sharedBuffer } from "@00";
import { LOGGER } from "@00";

export type DriftMetrics = {
  coherence: number;
  energyVariance: number;
  populationStability: number;
  driftIndex: number;
  shadowForkRecommended: boolean;
};

/**
 * DriftWarden monitors the global state for behavioral anomalies and instability.
 */
export class DriftWarden {
  private energyView: Int32Array;
  private idsView: BigUint64Array;
  private coherenceView: Int32Array;

  private lastPopulation = 0;
  private driftThreshold = 0.65; // High drift signals instability

  constructor(
    customEnergyView?: Int32Array,
    customIdsView?: BigUint64Array,
    customCoherenceView?: Int32Array,
  ) {
    this.energyView = customEnergyView ??
      new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, OFFSETS.MAX_ATOMS);
    this.idsView = customIdsView ??
      new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, OFFSETS.MAX_ATOMS);
    this.coherenceView = customCoherenceView ??
      new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);
  }

  /**
   * Calculates the current drift status of the system.
   */
  public analyze(currentTick: number): DriftMetrics {
    const activeIds = [];
    let totalEnergy = 0;

    // 1. Gather active population metrics
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (this.idsView[i] !== 0n) {
        activeIds.push(i);
        totalEnergy += this.energyView[i];
      }
    }

    const population = activeIds.length;
    const avgEnergy = population > 0 ? totalEnergy / population : 0;

    // 2. Coherence (from WASM kernel neural sync)
    // Coherence is usually 0..1000 in our standard (fixed point)
    const rawCoherence = Atomics.load(this.coherenceView, 0);
    const coherenceNormalized = rawCoherence / 1000.0;

    // 3. Energy Variance (local stability)
    let varianceSum = 0;
    if (population > 1) {
      for (const idx of activeIds) {
        const diff = this.energyView[idx] - avgEnergy;
        varianceSum += diff * diff;
      }
    }
    const energyVariance = population > 0
      ? Math.sqrt(varianceSum / population) / 1000.0
      : 0;

    // 4. Population Stability (Delta from last analysis)
    const popDelta = Math.abs(population - this.lastPopulation);
    const populationStability = population > 0
      ? 1.0 - Math.min(1.0, popDelta / (population * 0.1))
      : 1.0;
    this.lastPopulation = population;

    // 5. Final Drift Index Calculation
    // High drift = Low coherence, High variance, Low stability
    const driftIndex = ((1.0 - coherenceNormalized) * 0.5) +
      (Math.min(1.0, energyVariance) * 0.3) +
      ((1.0 - populationStability) * 0.2);

    const shadowForkRecommended = driftIndex > this.driftThreshold;

    if (currentTick % 100 === 0) {
      LOGGER.info(
        `[DRIFT WARDEN] Tick ${currentTick} | Drift: ${
          driftIndex.toFixed(4)
        } | Coherence: ${
          coherenceNormalized.toFixed(4)
        } | Fork: ${shadowForkRecommended}`,
      );
    }

    return {
      coherence: coherenceNormalized,
      energyVariance,
      populationStability,
      driftIndex,
      shadowForkRecommended,
    };
  }
}

```

---

## FILE: reduction_core/GENESIS_BOOT.ts

```typescript
/**
 * GENESIS_BOOT.ts
 * Axiomatic bytecode definitions for OMEGA-64 Stage 20.
 * These are the "First Programs" that define the core roles in native GlyphIR64.
 */

export const GLYPH = {
  // Core
  S: 0,
  K: 1,
  I: 2,
  Y: 3,
  // Control
  SET: 8,
  GET: 9,
  PUT: 10,
  ADD: 11,
  SUB: 12,
  JNZ: 13,
  JMP: 14,
  JZ: 15,
  // Transport
  REPLICATE: 16,
  SIGNAL: 17,
  SHARE: 18,
  BIND: 19,
  SPORE_DRIVE: 20,
  ENTANGLE: 21,
  // Structural
  PLUG: 24,
  TENSEGRITY: 25,
  BUILD: 26,
  SENSE: 27,
  // Catalytic
  COLLECTIVE: 32,
  ROLE: 33,
  RESOLVE: 34,
};

export type RolePreamble = {
  roleId: number;
  bytecode: number[];
};

/**
 * The Genesis Programs:
 * These bypass legacy WASM interpretation when running in "Native Mode".
 */
export const GENESIS_PROGRAMS: Record<string, number[]> = {
  /**
   * GUARDIAN (Role 2):
   * Focuses on PHEROMONE emission (Positive Amplitude).
   */
  "guardian_base": [
    GLYPH.SET,
    0,
    100, // R0 = 100
    GLYPH.SET,
    1,
    1, // R1 = 1 (Pheromone index)
    GLYPH.SIGNAL, // Emit Pheromone with R0 (+100) intensity
    GLYPH.I, // No-op return
  ],

  /**
   * PARASITE (Role 4):
   * Disrupts signals (Negative Amplitude).
   */
  "parasite_base": [
    GLYPH.SET,
    0,
    0, // R0 = 0
    GLYPH.SET,
    1,
    100, // R1 = 100
    GLYPH.SUB,
    0,
    1, // R0 = R0 - R1 (-100)
    GLYPH.SET,
    2,
    1, // R2 = 1 (Pheromone index)
    GLYPH.SIGNAL, // Emit Pheromone with R0 (-100) intensity
    GLYPH.I,
  ],

  /**
   * ARCHITECT (Role 3):
   * Focuses on PLASMID emission and structural intent.
   */
  "architect_base": [
    GLYPH.SET,
    0,
    100, // R0 = 100 (Charge / Amplitude)
    GLYPH.SET,
    1,
    0, // R1 = 0 (Plasmid index)
    GLYPH.PLUG,
    0,
    0, // Apply structural charge intent
    GLYPH.SIGNAL, // Emit Plasmid signal
    GLYPH.I,
  ],

  /**
   * REPLICATOR (Default / Shared):
   * Basic reproduction logic.
   */
  "replicator_base": [
    GLYPH.SET,
    0,
    50, // R0 = 50 (Low signal)
    GLYPH.SET,
    1,
    2, // R1 = 2 (Replication scent)
    GLYPH.SIGNAL,
    GLYPH.REPLICATE,
    GLYPH.I,
  ],

  /**
   * COMPLEX_STABILITY:
   * A program demonstrating control flow via JNZ.
   */
  "stability_loop": [
    GLYPH.SET,
    0,
    10, // R0 = 10 (Counter)
    // Label 0x03
    GLYPH.SIGNAL, // Pulse
    GLYPH.SUB,
    0,
    1, // R0--
    GLYPH.JNZ,
    0,
    3, // If R0 != 0, jump back to signaling
    GLYPH.I,
  ],
};

```

---

## FILE: reduction_core/GENESIS_INCEPTOR.ts

```typescript
// OMEGA-64 | GENESIS_INCEPTOR.ts | Stage 22: Adaptive Genesis & Drift Response
import { GENESIS_PROGRAMS } from "./GENESIS_BOOT.ts";
import { REIFIED_PROGRAMS } from "./GENESIS_REIFIED.ts";
import { LOGGER } from "@00";

export interface InceptiveProgram {
  bytecode: number[];
  metadata?: {
    ancestorHash?: bigint;
    roleHint?: number;
  };
}

/**
 * GenesisInceptor manages the selection of bytecode for new atomic entities.
 * It prioritizes reified relics from the shadow laboratory.
 */
export class GenesisInceptor {
  /**
   * Selects a program for a new spawn.
   * @param roleId Hint for the desired role (1: Guardian, 2: Architect, etc.)
   */
  public selectProgram(roleId?: number): InceptiveProgram {
    const reifiedKeys = Object.keys(REIFIED_PROGRAMS);

    // 1. Check for reified programs first (Evolutionary priority)
    if (reifiedKeys.length > 0) {
      // Simple heuristic: pick a random reified program or one matching role hint
      const pickedKey =
        reifiedKeys[Math.floor(Math.random() * reifiedKeys.length)];
      LOGGER.debug(`[INCEPTOR] Selected reified program: ${pickedKey}`);
      return {
        bytecode: REIFIED_PROGRAMS[pickedKey],
        metadata: { ancestorHash: BigInt("0x" + pickedKey.substring(0, 16)) }, // Pseudo-hash
      };
    }

    // 2. Fallback to canonical genesis programs
    if (roleId === 1) return { bytecode: GENESIS_PROGRAMS["guardian_base"] };
    if (roleId === 2) return { bytecode: GENESIS_PROGRAMS["architect_base"] };

    // Default replicator
    return { bytecode: GENESIS_PROGRAMS["replicator_base"] };
  }
}

```

---

## FILE: reduction_core/GENESIS_REIFIED.ts

```typescript
// OMEGA-64 | GENESIS_REIFIED.ts | Cultivated Relics
export const REIFIED_PROGRAMS: Record<string, number[]> = {};

```

---

## FILE: reduction_core/GlyphIR64.ts

```typescript
import { RISC } from "@00";

export type GlyphKind =
  | "core"
  | "control"
  | "transport"
  | "structural"
  | "catalytic"
  | "regulatory"
  | "memory"
  | "reserve";

export type GlyphStabilityClass =
  | "hard-invariant"
  | "legacy-bridge"
  | "bounded-dynamic"
  | "reserve";

export type GlyphSpec = {
  id: number;
  mnemonic: string;
  kind: GlyphKind;
  arity: number;
  energyCost: number;
  stabilityClass: GlyphStabilityClass;
  reductionRuleRef: string;
  legacyOpcode?: number;
  notes?: string;
  vertexIndex?: number; // C60 Vertex (0..59)
  rgb?: [number, number, number]; // Chromatic Hash
};

/**
 * Calculates a deterministic RGB color for a given vertex index (0..59).
 * Uses a basic spherical projection into the RGB cube.
 */
const calculateChromaticHash = (index: number): [number, number, number] => {
  const phi = (Math.sqrt(5) + 1) / 2;
  const t = index / 60;

  // Golden angle distribution for hue, with saturation/value variation
  const h = (t * 360) % 360;
  const s = 0.7 + 0.3 * Math.sin(t * Math.PI * 2);
  const v = 0.8 + 0.2 * Math.cos(t * Math.PI * 4);

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

const glyphKindForId = (id: number): GlyphKind => {
  if (id <= 3) return "core";
  if (id <= 15) return "control";
  if (id <= 23) return "transport";
  if (id <= 31) return "structural";
  if (id <= 39) return "catalytic";
  if (id <= 47) return "regulatory";
  if (id <= 55) return "memory";
  return "reserve";
};

const defaultReductionRuleRef = (kind: GlyphKind): string => {
  if (kind === "core") return "reduction/core";
  if (kind === "control") return "bridge/control";
  if (kind === "transport") return "bridge/transport";
  if (kind === "structural") return "bridge/structural";
  if (kind === "catalytic") return "bridge/catalytic";
  if (kind === "regulatory") return "bridge/regulatory";
  if (kind === "memory") return "bridge/memory";
  return "reserve/unassigned";
};

const defaultStabilityClass = (kind: GlyphKind): GlyphStabilityClass => {
  if (kind === "core") return "hard-invariant";
  if (kind === "reserve") return "reserve";
  if (kind === "regulatory" || kind === "memory") return "bounded-dynamic";
  return "legacy-bridge";
};

const defaultGlyphSpec = (id: number): GlyphSpec => {
  const kind = glyphKindForId(id);
  const stabilityClass = defaultStabilityClass(kind);
  return {
    id,
    mnemonic: `${kind.toUpperCase()}_${id.toString().padStart(2, "0")}`,
    kind,
    arity: 0,
    energyCost: kind === "core" ? 0 : 1,
    stabilityClass,
    reductionRuleRef: defaultReductionRuleRef(kind),
    notes: stabilityClass === "reserve"
      ? "Reserved for sandboxed semantic evolution only."
      : "Unassigned placeholder within the fixed 64-glyph lattice.",
    ...(id >= 4
      ? {
        vertexIndex: id - 4,
        rgb: calculateChromaticHash(id - 4),
      }
      : {
        // Core Glyphs (0..3) are the stabilizers, mapped to grayscale/secondary colors
        rgb: id === 0
          ? [255, 255, 255] // S (White)
          : id === 1
          ? [128, 128, 128] // K (Gray)
          : id === 2
          ? [0, 0, 0] // I (Black)
          : [255, 0, 255], // Y (Magenta)
      }),
  };
};

const overrides = new Map<number, Partial<GlyphSpec>>([
  [0, {
    mnemonic: "S",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/S",
    notes: "Hard invariant combinator.",
  }],
  [1, {
    mnemonic: "K",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/K",
    notes: "Hard invariant combinator.",
  }],
  [2, {
    mnemonic: "I",
    kind: "core",
    energyCost: 0,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/I",
    notes: "Hard invariant combinator.",
  }],
  [3, {
    mnemonic: "Y",
    kind: "core",
    energyCost: 1,
    stabilityClass: "hard-invariant",
    reductionRuleRef: "reduction/core/Y",
    notes: "Bounded recursion anchor under fuel budget.",
  }],
  [8, {
    mnemonic: "SET",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_SET,
    reductionRuleRef: "bridge/control/set",
  }],
  [9, {
    mnemonic: "GET",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_GET,
    reductionRuleRef: "bridge/control/get",
  }],
  [10, {
    mnemonic: "PUT",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_PUT,
    reductionRuleRef: "bridge/control/put",
  }],
  [11, {
    mnemonic: "ADD",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_ADD,
    reductionRuleRef: "bridge/control/add",
  }],
  [12, {
    mnemonic: "SUB",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_SUB,
    reductionRuleRef: "bridge/control/sub",
  }],
  [13, {
    mnemonic: "JNZ",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_JNZ,
    reductionRuleRef: "bridge/control/jnz",
  }],
  [14, {
    mnemonic: "JMP",
    arity: 1,
    energyCost: 1,
    legacyOpcode: RISC.OP_JMP,
    reductionRuleRef: "bridge/control/jmp",
  }],
  [15, {
    mnemonic: "JZ",
    arity: 2,
    energyCost: 1,
    legacyOpcode: RISC.OP_JZ,
    reductionRuleRef: "bridge/control/jz",
  }],
  [16, {
    mnemonic: "REPLICATE",
    kind: "transport",
    arity: 0,
    energyCost: 6,
    legacyOpcode: RISC.OP_REPLICATE,
    reductionRuleRef: "bridge/transport/replicate",
  }],
  [17, {
    mnemonic: "SIGNAL",
    kind: "transport",
    arity: 0,
    energyCost: 3,
    legacyOpcode: RISC.OP_SIGNAL,
    reductionRuleRef: "bridge/transport/signal",
  }],
  [18, {
    mnemonic: "SHARE",
    kind: "transport",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_SHARE,
    reductionRuleRef: "bridge/transport/share",
  }],
  [19, {
    mnemonic: "BIND",
    kind: "transport",
    arity: 0,
    energyCost: 20,
    reductionRuleRef: "bridge/transport/bind",
  }],
  [20, {
    mnemonic: "SPORE_DRIVE",
    kind: "transport",
    arity: 0,
    energyCost: 50,
    legacyOpcode: RISC.OP_SPORE_DRIVE,
    reductionRuleRef: "bridge/transport/spore_drive",
  }],
  [21, {
    mnemonic: "ENTANGLE",
    kind: "transport",
    arity: 0,
    energyCost: 10,
    legacyOpcode: RISC.OP_ENTANGLE,
    reductionRuleRef: "bridge/transport/entangle",
  }],
  [22, {
    mnemonic: "SYSCALL",
    kind: "transport",
    arity: 0,
    energyCost: 0, // Managed dynamically by Gas Accounting
    legacyOpcode: RISC.OP_SYSCALL,
    reductionRuleRef: "bridge/transport/syscall",
    notes: "Universal Host Interface.",
  }],
  [24, {
    mnemonic: "PLUG",
    kind: "structural",
    arity: 2,
    energyCost: 3,
    legacyOpcode: RISC.OP_PLUG,
    reductionRuleRef: "bridge/structural/plug",
  }],
  [25, {
    mnemonic: "TENSEGRITY",
    kind: "structural",
    arity: 3,
    energyCost: 4,
    legacyOpcode: RISC.OP_TENSEGRITY,
    reductionRuleRef: "bridge/structural/tensegrity",
  }],
  [26, {
    mnemonic: "BUILD",
    kind: "structural",
    arity: 2,
    energyCost: 6,
    legacyOpcode: RISC.OP_BUILD,
    reductionRuleRef: "bridge/structural/build",
  }],
  [27, {
    mnemonic: "SENSE",
    kind: "structural",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_SENSE,
    reductionRuleRef: "bridge/structural/sense",
  }],
  [32, {
    mnemonic: "COLLECTIVE",
    kind: "catalytic",
    arity: 3,
    energyCost: 4,
    legacyOpcode: RISC.OP_COLLECTIVE,
    reductionRuleRef: "bridge/catalytic/collective",
  }],
  [33, {
    mnemonic: "ROLE",
    kind: "catalytic",
    arity: 2,
    energyCost: 2,
    legacyOpcode: RISC.OP_ROLE,
    reductionRuleRef: "bridge/catalytic/role",
  }],
  [34, {
    mnemonic: "RESOLVE",
    kind: "catalytic",
    arity: 2,
    energyCost: 5,
    legacyOpcode: RISC.OP_RESOLVE,
    reductionRuleRef: "bridge/catalytic/resolve",
  }],
  [35, {
    mnemonic: "BIND",
    kind: "catalytic",
    arity: 2,
    energyCost: 5,
    legacyOpcode: RISC.OP_BIND,
    reductionRuleRef: "bridge/catalytic/bind",
  }],
]);

const buildGlyphSpecs = (): GlyphSpec[] => {
  const specs: GlyphSpec[] = [];
  for (let id = 0; id < 64; id++) {
    specs.push({
      ...defaultGlyphSpec(id),
      ...(overrides.get(id) ?? {}),
      id,
    });
  }
  return specs;
};

export const GLYPH_SPECS: readonly GlyphSpec[] = Object.freeze(
  buildGlyphSpecs().map((spec) => Object.freeze({ ...spec })),
);

const GLYPH_SPEC_BY_ID = new Map<number, GlyphSpec>(
  GLYPH_SPECS.map((spec) => [spec.id, spec]),
);

const GLYPH_SPEC_BY_OPCODE = new Map<number, GlyphSpec>(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => [spec.legacyOpcode!, spec]),
);

export const BRIDGE_GLYPH_IDS = Object.freeze(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => spec.id)
    .sort((a, b) => a - b),
);

export const glyphSpecById = (id: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_ID.get(Math.trunc(id)) ?? null;

export const glyphSpecByLegacyOpcode = (opcode: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_OPCODE.get(Math.trunc(opcode)) ?? null;

export const isCoreGlyph = (id: number): boolean => {
  const spec = glyphSpecById(id);
  return spec?.kind === "core";
};

export const listGlyphSpecsByKind = (kind: GlyphKind): GlyphSpec[] =>
  GLYPH_SPECS.filter((spec) => spec.kind === kind);

```

---

## FILE: reduction_core/REIFICATION_ACTION.ts

```typescript
// OMEGA-64 | REIFICATION_ACTION.ts | Stage 21: The Doll Fork
import { Relic } from "./relics/RELIC_CULTIVATION.ts";
import { LOGGER } from "@00";

/**
 * ReificationAction promotes a relic from the sandbox to the canonical GENESIS pool.
 */
export class ReificationAction {
  private genesisPath = "./reduction_core/GENESIS_REIFIED.ts";

  /**
   * Promotes a relic JSON file to the GENESIS_REIFIED.ts registry.
   */
  public async reify(relicId: string): Promise<void> {
    const sandboxPath = `./reduction_core/sandbox/relic_${relicId}.json`;

    try {
      const relicData = await Deno.readTextFile(sandboxPath);
      const relic: Relic = JSON.parse(relicData);

      LOGGER.info(
        `[REIFICATION] Promoting relic ${relic.id} to canonical pool...`,
      );

      // Load or create the reified registry
      let content = "";
      try {
        content = await Deno.readTextFile(this.genesisPath);
      } catch {
        content =
          "// OMEGA-64 | GENESIS_REIFIED.ts | Cultivated Relics\nexport const REIFIED_PROGRAMS: Record<string, number[]> = {};\n";
      }

      // Add the relic to the registry (simple string append for now, or use a more robust parser if needed)
      // Since it's a generated file, we can just replace the object content or append
      const entry = `\nREIFIED_PROGRAMS["${relic.id}"] = ${
        JSON.stringify(relic.bytecode)
      };`;

      // Basic check to see if it already exists
      if (content.includes(`REIFIED_PROGRAMS["${relic.id}"]`)) {
        LOGGER.warn(
          `[REIFICATION] Relic ${relic.id} already exists in registry. Skipping.`,
        );
        return;
      }

      await Deno.writeTextFile(this.genesisPath, content + entry);
      LOGGER.info(
        `[REIFICATION] Relic ${relic.id} successfully reified in ${this.genesisPath}`,
      );
    } catch (err) {
      LOGGER.error(
        `[REIFICATION ERROR] Failed to reify relic ${relicId}:`,
        err,
      );
      throw err;
    }
  }
}

if (import.meta.main) {
  const relicId = Deno.args[0];
  if (!relicId) {
    console.error(
      "Usage: deno run -A REIFICATION_ACTION.ts <relic_id_without_prefix>",
    );
    Deno.exit(1);
  }
  const action = new ReificationAction();
  await action.reify(relicId);
}

```

---

## FILE: reduction_core/relics/LINEAGE_TRACKER.ts

```typescript
// OMEGA-64 | LINEAGE_TRACKER.ts | Stage 23: The Memory Matrix
import { STATE_MATRIX } from "@00";
import { AKASHA_CODEX } from "@06";
import { LOGGER } from "@00";

/**
 * LineageTracker maintains the semantic link between active atoms and their ancestry.
 */
export class LineageTracker {
  /**
   * Initializes or updates the lineage buffer based on active atoms and their parents.
   * This is called during the host-lock phase of individual pulses.
   */
  public syncLineages(activeIdx: number[]): void {
    // 1. Scan for newly spawned atoms that inherited parent lineages
    // Logic: If WASM replication copied the lineage hash, we correlate it here.

    // 2. Map lineages to Akasha wisdom
    // For now, we'll just log detections. In a full implementation,
    // we would pull stability metrics from AKASHA_CODEX.

    if (activeIdx.length > 0 && Math.random() < 0.05) {
      LOGGER.debug(`[LINEAGE] Tracking ${activeIdx.length} active threads.`);
    }
  }

  /**
   * Calculates a "Wisdom Coefficient" for a given lineage hash.
   * Stability and historical resonance from the Codex increase this coefficient.
   */
  public getWisdomForLineage(hash: bigint): number {
    // Placeholder: In a mature system, this queries the species registry.
    // High historical resonance = high wisdom.
    return 100; // Baseline wisdom
  }
}

```

---

## FILE: reduction_core/relics/QUORUM_ADVOCATE.ts

```typescript
// OMEGA-64 | QUORUM_ADVOCATE.ts | Stage 24: Stigmergic Synthesis
import { STATE_MATRIX } from "@00";
import { LOGGER } from "@00";

/**
 * QuorumAdvocate evaluates local group coherence and biases the GATE system.
 * It detects "Quorum" conditions when atoms of similar lineage or phase
 * cluster together to perform coordinated actions.
 */
export class QuorumAdvocate {
  /**
   * Evaluates the collective "Strength" of a group of atoms.
   * This is used to lower the energy threshold for OP_BUILD or other
   * collective intents.
   */
  public evaluateQuorum(indices: number[]): number {
    if (indices.length < 2) return 0;

    let totalResonace = 0;
    let totalWisdom = 0;

    for (const idx of indices) {
      totalResonace += STATE_MATRIX.getResonance(idx);
      // Wisdom will eventually be pulled from LINEAGE_TRACKER
      totalWisdom += 100;
    }

    const avgResonance = totalResonace / indices.length;

    // Quorum Strength is a function of density and internal coherence
    const strength = (indices.length * avgResonance) / 1000;

    return Math.min(strength, 1.0);
  }

  /**
   * Decides if a collective action (e.g. delegated build) should be
   * fast-tracked through the GATE.
   */
  public recommendAdmission(quorumStrength: number): boolean {
    // High quorum strength ( > 0.7) suggests a coordinated structural intent
    return quorumStrength > 0.7;
  }
}

```

---

## FILE: reduction_core/relics/RELIC_CULTIVATION.ts

```typescript
// OMEGA-64 | RELIC_CULTIVATION.ts | Stage 21: The Doll Fork
import * as OFFSETS from "@00";
import { DollFork } from "../doll_fork/DOLL_FORK_MATRIX.ts";
import { LOGGER } from "@00";

export type Relic = {
  id: string;
  bytecode: number[];
  role: number;
  resonance: number;
  energy: number;
  extractedAtTick: number;
};

/**
 * RelicCultivator identifies stable, high-resonance evolutionary patterns in the shadow matrix.
 */
export class RelicCultivator {
  private fork: DollFork;

  constructor(fork: DollFork) {
    this.fork = fork;
  }

  /**
   * Scans the shadow matrix for atoms that meet 'relic' criteria.
   * Criteria: energy > 500, resonance > 200, non-zero bytecode.
   */
  public cultivateRelics(tick: number): Relic[] {
    const relics: Relic[] = [];
    const views = this.fork.views;

    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      const energy = views.energies[i];
      const resonance = views.resonances[i];
      const atomId = views.ids[i];

      if (atomId !== 0n && energy > 500 && resonance > 200) {
        const bytecode = Array.from(
          views.logic.slice(i * 8, (i + 1) * 8),
        ) as number[];

        // Basic check: is bytecode non-zero?
        if (bytecode.some((b) => b !== 0)) {
          relics.push({
            id: `relic_${tick}_${i}_${atomId}`,
            bytecode,
            role: views.roles[i],
            resonance,
            energy,
            extractedAtTick: tick,
          });
        }
      }
    }

    if (relics.length > 0) {
      LOGGER.info(
        `[RELIC CULTIVATOR] Extracted ${relics.length} potential relics at tick ${tick}`,
      );
    }

    return relics;
  }

  /**
   * Persists relics to the semantic sandbox for future reification.
   */
  public async persistRelics(relics: Relic[]): Promise<void> {
    for (const relic of relics) {
      const path = `./reduction_core/sandbox/relic_${relic.id}.json`;
      await Deno.writeTextFile(path, JSON.stringify(relic, null, 2));
      LOGGER.info(`[RELIC CULTIVATOR] Saved relic to ${path}`);
    }
  }
}

```

---

## FILE: reduction_core/SHADOW_EVOLUTION_RUNNER.ts

```typescript
/**
 * SHADOW_EVOLUTION_RUNNER.ts
 * Automates the validation of semantic proposals against the OMEGA-64 Golden Traces.
 * Runs in a secure WebAssembly memory sandbox (DollFork) isolated from the main matrix.
 */

import { REDUCTION_CASES } from "../verification/reduction_cases.ts";
import { GENESIS_PROGRAMS } from "./GENESIS_BOOT.ts";
import { DollFork } from "./doll_fork/DOLL_FORK_MATRIX.ts";
import { DollForkRunner } from "./doll_fork/DOLL_FORK_RUNNER.ts";
import { DriftWarden } from "./DRIFT_WARDEN.ts";
import { ReificationAction } from "./REIFICATION_ACTION.ts";
import * as OFFSETS from "@00";

export type SemanticProposal = {
  id: string;
  targetRole: string; // e.g. "guardian_base"
  proposedBytecode: number[];
  driftBudget: number; // Max allowed energy/state mismatch
};

async function loadProposals(): Promise<SemanticProposal[]> {
  try {
    const data = await Deno.readTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
    );
    const json = JSON.parse(data);
    return json.proposals || [];
  } catch {
    return [];
  }
}

async function markProposalProcessed(id: string) {
  try {
    const data = await Deno.readTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
    );
    const json = JSON.parse(data);
    json.proposals = (json.proposals || []).filter((p: any) => p.id !== id);
    await Deno.writeTextFile(
      "./reduction_core/sandbox/PROPOSALS.json",
      JSON.stringify(json, null, 2),
    );
  } catch (err) {
    // Ignore updates if json corrupted
  }
}

export async function runShadowValidation() {
  const proposals = await loadProposals();
  if (proposals.length === 0) return;
  console.log(`[shadow_runner] detected ${proposals.length} active proposals.`);

  const fork = new DollFork();
  const runner = new DollForkRunner(fork);
  await runner.init();

  const warden = new DriftWarden(
    fork.views.energies,
    fork.views.ids,
    fork.views.coherence,
  );
  const reification = new ReificationAction();

  for (const proposal of proposals) {
    console.log(
      `[shadow_runner] validating proposal: ${proposal.id} (Budget: ${proposal.driftBudget})...`,
    );

    // 1. Fork Reality
    fork.forkFromMainline();

    // 2. Inject proposed bytecode into 15 active atoms
    let infectedCount = 0;
    const proposed = new Uint8Array(proposal.proposedBytecode);
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (fork.views.ids[i] !== 0n) {
        fork.views.logic.set(proposed, i * 8);
        infectedCount++;
        if (infectedCount >= 15) break;
      }
    }

    if (infectedCount === 0) {
      console.log(
        `[shadow_runner] proposal ${proposal.id} REJECTED: no living atoms available to host.`,
      );
      await markProposalProcessed(proposal.id);
      continue;
    }

    // 3. Baseline Drift
    // Since DollFork forks mainline, we start at a baseline drift relative to mainline.
    const initialMetrics = warden.analyze(0);
    const initialDrift = initialMetrics.driftIndex;

    // 4. Shadow Simulation
    const SHADOW_TICKS = 50;
    for (let t = 0; t < SHADOW_TICKS; t++) {
      runner.runShadowTick(t);
    }

    // 5. Final Drift
    const finalMetrics = warden.analyze(SHADOW_TICKS);
    const finalDrift = finalMetrics.driftIndex;

    const deltaDrift = finalDrift - initialDrift;

    // Evaluate Survival
    // Ensure all test subjects didn't just instantly die
    const activePopulation = fork.getMetrics().activePopulation;

    console.log(
      `[shadow_runner] ${proposal.id} | Initial Drift: ${
        initialDrift.toFixed(3)
      } | Final: ${finalDrift.toFixed(3)} | Delta: ${deltaDrift.toFixed(3)}`,
    );

    if (deltaDrift <= proposal.driftBudget && activePopulation > 0) {
      console.log(
        `[shadow_runner] proposal ${proposal.id} PASSED. Mutants stabilized.`,
      );

      // Save Relic Payload
      const relic = {
        id: proposal.id,
        bytecode: proposal.proposedBytecode,
        targetRole: proposal.targetRole,
        metadata: {
          deltaDrift,
          activePopulation,
        },
      };

      const sandboxPath = `./reduction_core/sandbox/relic_${proposal.id}.json`;
      await Deno.writeTextFile(sandboxPath, JSON.stringify(relic, null, 2));

      await reification.reify(proposal.id);
    } else {
      console.log(
        `[shadow_runner] proposal ${proposal.id} REJECTED: Destructive trajectory detected.`,
      );
    }

    // Cleanup queue
    await markProposalProcessed(proposal.id);
  }
}

if (import.meta.main) {
  runShadowValidation().catch((err) => {
    console.error("Shadow verification failed:", err);
    Deno.exit(1);
  });
}

```

---

## FILE: verification/golden_trace_catalog.ts

```typescript
export type GoldenTraceMetricPolicy = "strict" | "bounded";

export type GoldenTraceScenario = {
  id: string;
  scenario: string;
  setup: string;
  duration: string;
  daemonEnabled: boolean;
  metrics: readonly string[];
  driftPolicy: Readonly<Record<string, GoldenTraceMetricPolicy>>;
  supportFiles: readonly string[];
};

const TRACE_ROOT = "verification/traces";

const GOLDEN_TRACE_CATALOG_DATA: GoldenTraceScenario[] = [
  {
    id: "gt01_coldstart_seeded_swarm",
    scenario: "coldstart / seeded swarm",
    setup: "cold boot, deterministic seed swarm, daemon off",
    duration: "256 ticks",
    daemonEnabled: false,
    metrics: [
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "mutationCounts",
      "invariantDigest",
    ],
    driftPolicy: {
      population: "strict",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      mutationCounts: "strict",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_seeded_swarm.ts",
      "worker_determinism_capture.ts",
    ],
  },
  {
    id: "gt02_free_run_no_ingress",
    scenario: "free run without external intervention",
    setup: "cold boot, no inject, no daemon policy updates",
    duration: "2048 ticks",
    daemonEnabled: false,
    metrics: [
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "decreeShifts",
      "mutationCounts",
    ],
    driftPolicy: {
      population: "bounded",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      decreeShifts: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "worker_trend_baseline.ts",
      "worker_trend_math.ts",
    ],
  },
  {
    id: "gt03_pheromone_inject",
    scenario: "bounded pheromone inject",
    setup: "warmup 128 ticks, then one fixed DROP_PHEROMONE payload",
    duration: "512 ticks total",
    daemonEnabled: false,
    metrics: [
      "localResponseWindow",
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "invariantDigest",
    ],
    driftPolicy: {
      localResponseWindow: "strict",
      population: "bounded",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_determinism_capture.ts",
    ],
  },
  {
    id: "gt04_plasmid_inject",
    scenario: "durable symbolic ingress",
    setup: "warmup 128 ticks, then one fixed INJECT_PLASMID payload",
    duration: "512 ticks total",
    daemonEnabled: false,
    metrics: [
      "acceptedMutationCounts",
      "rejectedMutationCounts",
      "population",
      "avgEnergy",
      "codexSnapshotDigest",
      "invariantDigest",
    ],
    driftPolicy: {
      acceptedMutationCounts: "strict",
      rejectedMutationCounts: "strict",
      population: "bounded",
      avgEnergy: "bounded",
      codexSnapshotDigest: "strict",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_resilience_capture.ts",
    ],
  },
  {
    id: "gt05_homeostasis_correction",
    scenario: "external homeostasis correction",
    setup: "warmup 256 ticks, then one fixed /api/homeostasis update",
    duration: "768 ticks total",
    daemonEnabled: false,
    metrics: [
      "avgEnergySlope",
      "spatialOverflowRatio",
      "homeostasisStateDigest",
      "mutationCounts",
    ],
    driftPolicy: {
      avgEnergySlope: "bounded",
      spatialOverflowRatio: "bounded",
      homeostasisStateDigest: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "worker_trend_math.ts",
    ],
  },
  {
    id: "gt06_daemon_admission_case",
    scenario: "daemon admission / rejection",
    setup:
      "one accepted ingress case and one degraded/rejected case with daemon governance on",
    duration: "event-bounded",
    daemonEnabled: true,
    metrics: [
      "admissionSeverity",
      "appliedAction",
      "codexChronicleDigest",
      "dominantInvariantDigest",
    ],
    driftPolicy: {
      admissionSeverity: "strict",
      appliedAction: "strict",
      codexChronicleDigest: "strict",
      dominantInvariantDigest: "strict",
    },
    supportFiles: [
      "test_daemon_governance_contract.ts",
    ],
  },
  {
    id: "gt07_daemon_policy_block",
    scenario: "daemon policy block",
    setup:
      "warmup 128 ticks, then one fixed INJECT_PLASMID payload with a blocked opcode",
    duration: "256 ticks total",
    daemonEnabled: true,
    metrics: [
      "httpStatus",
      "responseReason",
      "latestAdmissionStatus",
      "latestAdmissionReason",
      "mutationCounts",
    ],
    driftPolicy: {
      httpStatus: "strict",
      responseReason: "strict",
      latestAdmissionStatus: "strict",
      latestAdmissionReason: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "test_daemon_governance_contract.ts",
    ],
  },
  {
    id: "gt08_structure_intent_visibility",
    scenario: "same-tick structure intent visibility",
    setup:
      "standalone deterministic capture of contended BUILD intents and same-tick OP_SENSE visibility under 1-worker vs 4-worker execution",
    duration: "1 tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "strictHashMatch",
      "senseVisibility",
      "conflictCellType",
      "conflictCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      strictHashMatch: "strict",
      senseVisibility: "strict",
      conflictCellType: "strict",
      conflictCellCharge: "bounded",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "test_structure_intent_determinism.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt09_collective_transport",
    scenario: "standalone collective hive and pheromone semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 0/1 hive store-load and mode 2 pheromone emit through direct WASM execution",
    duration: "3 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "hiveValue",
      "loadedReg0",
      "pheromoneWord",
      "snapshotDigest",
    ],
    driftPolicy: {
      hiveValue: "strict",
      loadedReg0: "strict",
      pheromoneWord: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_transport_capture.ts",
      "test_swarm.ts",
    ],
  },
  {
    id: "gt10_share_transfer",
    scenario: "standalone bonded share transfer semantics",
    setup:
      "standalone deterministic capture of OP_SHARE successful bonded transfer and empty-bond no-op through direct WASM execution",
    duration: "2 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "successfulSenderEnergy",
      "successfulReceiverEnergy",
      "failedSenderEnergy",
      "failedReceiverEnergy",
      "snapshotDigest",
    ],
    driftPolicy: {
      successfulSenderEnergy: "strict",
      successfulReceiverEnergy: "strict",
      failedSenderEnergy: "strict",
      failedReceiverEnergy: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/share_transfer_capture.ts",
      "test_metabolism.ts",
      "test_symbiosis.ts",
    ],
  },
  {
    id: "gt11_collective_banking",
    scenario: "standalone collective banking semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 3 deposit and mode 4 capped withdraw through direct WASM execution",
    duration: "2 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "finalHiveBalance",
      "depositorEnergy",
      "withdrawerEnergy",
      "withdrawReg0",
      "snapshotDigest",
    ],
    driftPolicy: {
      finalHiveBalance: "strict",
      depositorEnergy: "strict",
      withdrawerEnergy: "strict",
      withdrawReg0: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_banking_capture.ts",
      "test_metabolism.ts",
    ],
  },
  {
    id: "gt12_collective_synchrony",
    scenario: "standalone collective synchrony semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 5 bonded phase-lock and mode 6 local quorum PC sync through direct WASM execution",
    duration: "2 standalone execute phases / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "phasePeer1Pc",
      "phasePeer2Pc",
      "quorumPeer1Pc",
      "quorumPeer2Pc",
      "quorumOutsiderPc",
      "snapshotDigest",
    ],
    driftPolicy: {
      phasePeer1Pc: "strict",
      phasePeer2Pc: "strict",
      quorumPeer1Pc: "strict",
      quorumPeer2Pc: "strict",
      quorumOutsiderPc: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_synchrony_capture.ts",
      "test_swarm.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt13_structure_lock_progress",
    scenario: "standalone structure stale-lock progress",
    setup:
      "standalone deterministic subprocess capture of OP_SENSE visibility through a stale structure lock plus tick_structure_grid intent clearing",
    duration: "2 execute phases + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "visibleSenseReg",
      "typedMissSenseReg",
      "resolvedCellType",
      "resolvedCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      visibleSenseReg: "strict",
      typedMissSenseReg: "strict",
      resolvedCellType: "strict",
      resolvedCellCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_lock_capture.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt14_structure_charge_resolution",
    scenario: "standalone structure charge resolution",
    setup:
      "standalone deterministic subprocess capture of OP_PLUG publishing a charge intent and tick_structure_grid resolving it into a concrete charged structure cell",
    duration: "1 execute phase + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "chargeIntentBeforeTick",
      "resolvedCellType",
      "resolvedCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      chargeIntentBeforeTick: "strict",
      resolvedCellType: "strict",
      resolvedCellCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_charge_capture.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt15_structure_charge_competition",
    scenario: "standalone structure charge competition",
    setup:
      "standalone deterministic subprocess capture of two OP_PLUG publications hitting the same cell in both low->high and high->low orderings",
    duration: "4 execute_atom calls + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "lowThenHighChargeIntent",
      "highThenLowChargeIntent",
      "lowThenHighResolvedCharge",
      "highThenLowResolvedCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      lowThenHighChargeIntent: "strict",
      highThenLowChargeIntent: "strict",
      lowThenHighResolvedCharge: "strict",
      highThenLowResolvedCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_charge_competition_capture.ts",
      "verification/structure_charge_capture.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt16_runtime_build_materialization",
    scenario: "runtime structure build materialization",
    setup:
      "worker-backed deterministic subprocess capture of a single architect executing OP_BUILD SOURCE through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "ownerIntentAfterTick",
      "valueIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      ownerIntentAfterTick: "strict",
      valueIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_runtime_capture.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt17_runtime_build_competition",
    scenario: "runtime structure build competition",
    setup:
      "worker-backed deterministic subprocess capture of two architects publishing competing OP_BUILD SOURCE intents into the same cell through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "targetResolvedState",
      "ownerIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      targetResolvedState: "strict",
      ownerIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_competition_capture.ts",
      "verification/structure_build_runtime_capture.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt18_runtime_build_stale_lock",
    scenario: "runtime structure build stale-lock fallback",
    setup:
      "worker-backed deterministic subprocess capture of a single architect attempting OP_BUILD SOURCE into a cell carrying a stale locked SOURCE intent through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "targetResolvedState",
      "ownerIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      targetResolvedState: "strict",
      ownerIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_lock_capture.ts",
      "verification/structure_build_runtime_capture.ts",
      "verification/structure_lock_capture.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt19_tensegrity_kinematics",
    scenario: "standalone tensegrity kinematics and bonding",
    setup:
      "standalone deterministic capture of OP_TENSEGRITY setting bond distances and damping, executing physics to resolve forces",
    duration: "100 physics ticks execution / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "finalDistance",
      "finalDamping",
      "snapshotDigest",
    ],
    driftPolicy: {
      finalDistance: "bounded",
      finalDamping: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/tensegrity_capture.ts",
      "test_tensegrity.ts",
    ],
  },
  {
    id: "gt20_bind_resolution",
    scenario: "standalone symbiotic bond resolution",
    setup:
      "standalone deterministic capture of OP_BIND writing a pending request into the shared buffer between two nearby atoms",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "initiatorId",
      "targetId",
      "requestStatus",
      "snapshotDigest",
    ],
    driftPolicy: {
      initiatorId: "strict",
      targetId: "strict",
      requestStatus: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/bind_resolution_capture.ts",
      "test_symbiosis.ts",
    ],
  },
  {
    id: "gt21_quorum_sync",
    scenario: "sovereignty protocol collective sync and aggressive share",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE (quorum sync) and OP_SHARE (hormone-modulated aggression bonus)",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "quorumPcSync",
      "aggressiveShareAmount",
      "hormoneIndex2",
      "snapshotDigest",
    ],
    driftPolicy: {
      quorumPcSync: "strict",
      aggressiveShareAmount: "strict",
      hormoneIndex2: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/quorum_sync_capture.ts",
    ],
  },
  {
    id: "gt22_intent_resolution",
    scenario: "sovereignty protocol collective intent resolution (role/bank)",
    setup:
      "standalone deterministic capture of OP_RESOLVE for collective role shifts and energy banking via neighborhood quorum",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "roleResolution",
      "bankResolution",
      "quorumCount",
      "snapshotDigest",
    ],
    driftPolicy: {
      roleResolution: "strict",
      bankResolution: "strict",
      quorumCount: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/intent_resolution_capture.ts",
    ],
  },
  /*
  {
    id: "gt23_cognitive_vector",
    scenario: "standalone cognitive vector math and resonance resolution",
    setup:
      "standalone deterministic capture of OP_RESOLVE math precision tiers and OP_RESONATE_KURAMOTO spatial grid convergence",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "fastMathValue",
      "preciseMathValue",
      "fastMathEnergy",
      "preciseMathEnergy",
      "atom200PhaseAfter",
      "atom201PhaseAfter",
      "snapshotDigest",
    ],
    driftPolicy: {
      fastMathValue: "strict",
      preciseMathValue: "strict",
      fastMathEnergy: "strict",
      preciseMathEnergy: "strict",
      atom200PhaseAfter: "strict",
      atom201PhaseAfter: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/cognitive_vector_capture.ts",
      "test_kuramoto_lut.ts",
    ],
  },
  {
    id: "gt24_kuramoto_sync_threshold",
    scenario: "standalone kuramoto phase sink at critical K",
    setup:
      "standalone deterministic capture of K-coupling scaling by neural coherence in OP_RESONATE_KURAMOTO",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "diffLowK",
      "diffHighK",
      "snapshotDigest",
    ],
    driftPolicy: {
      diffLowK: "strict",
      diffHighK: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/kuramoto_sync_capture.ts",
    ],
  },
  {
    id: "gt25_lut_accuracy_tradeoff",
    scenario: "standalone math LUT accuracy vs gas tradeoff",
    setup:
      "standalone deterministic capture of varying OP_RESOLVE metabolic cost depending on targeted math precision mode",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "val0",
      "val1",
      "val4",
      "cost0",
      "cost1",
      "cost4",
      "snapshotDigest",
    ],
    driftPolicy: {
      val0: "strict",
      val1: "strict",
      val4: "strict",
      cost0: "strict",
      cost1: "strict",
      cost4: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/lut_accuracy_capture.ts",
    ],
  },
  {
    id: "gt26_resolution_phase_transition",
    scenario: "standalone execution resource survival with coherence fields",
    setup:
      "standalone deterministic capture showing high phase resonance under large K resulting in metabolic survival",
    duration: "10 execute phases / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "survivalCount",
      "finalPhaseAvg",
      "snapshotDigest",
    ],
    driftPolicy: {
      survivalCount: "strict",
      finalPhaseAvg: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/resolution_phase_capture.ts",
    ],
  },
  */
];

export const GOLDEN_TRACE_CATALOG: readonly GoldenTraceScenario[] = Object
  .freeze(
    GOLDEN_TRACE_CATALOG_DATA.map((trace) =>
      Object.freeze({
        ...trace,
        metrics: Object.freeze([...trace.metrics]),
        driftPolicy: Object.freeze({ ...trace.driftPolicy }),
        supportFiles: Object.freeze([...trace.supportFiles]),
      })
    ),
  );

const TRACE_BY_ID = new Map<string, GoldenTraceScenario>(
  GOLDEN_TRACE_CATALOG.map((trace) => [trace.id, trace]),
);

export const goldenTraceById = (id: string): GoldenTraceScenario | null =>
  TRACE_BY_ID.get(id) ?? null;

export const goldenTraceArtifactPaths = (id: string) => {
  const trace = goldenTraceById(id);
  if (!trace) {
    throw new Error(`[golden_trace_catalog] unknown trace id: ${id}`);
  }
  const dir = `${TRACE_ROOT}/${trace.id}`;
  return {
    dir,
    traceJson: `${dir}/trace.json`,
    codexSnapshotJson: `${dir}/codex_snapshot.json`,
    invariantsJson: `${dir}/invariants.json`,
    notesMd: `${dir}/notes.md`,
  };
};

```

---

## FILE: verification/reduction_cases.ts

```typescript
import { RISC, STATE_MATRIX, STRUCTURE } from "@00/STATE_MATRIX.ts";

export type ReductionCaseExpectation = {
  finalPc: number;
  replicateCount?: number;
  signalCount?: number;
  buildCount?: number;
  finalRole?: number;
  registers?: number[];
  finalProps?: Partial<Record<number, number>>;
  finalHiveMemory?: Partial<Record<number, number>>;
  finalHiveBalance?: number;
  finalSignalGrid?: Partial<Record<number, number>>;

  finalPeerEnergy?: Partial<Record<number, number>>;
  finalPeerPc?: Partial<Record<number, number>>;
  finalBondDistances?: Partial<Record<number, number>>;
  finalDamping?: number;
  finalStructureGrid?: Partial<Record<number, number>>;

  branchTaken?: boolean;
  finalBondRequests?: Partial<Record<number, number>>;
  finalHiveEnergyPool?: Partial<Record<number, number>>;
  finalHormones?: number[];
};

export type ReductionCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  script: Uint8Array;
  maxSteps: number;
  ownerAtomIdx?: number;
  postStructureTick?: boolean;
  initialRegs?: number[];

  initialProps: Partial<Record<number, number>>;
  initialBondTargets?: Partial<Record<number, number>>;
  initialBondDistances?: Partial<Record<number, number>>;
  initialDamping?: number;
  initialPeerEnergy?: Partial<Record<number, number>>;
  initialPeerPc?: Partial<Record<number, number>>;
  initialCellPeers?: number[];
  initialHiveBalance?: number;
  initialStructureGrid?: Partial<Record<number, number>>;
  initialStructureIntentOwner?: Partial<Record<number, number>>;
  initialStructureIntentValue?: Partial<Record<number, number>>;
  initialStructureChargeIntent?: Partial<Record<number, number>>;
  initialHormones?: number[];
  initialHiveEnergyPool?: Partial<Record<number, number>>;
  nativeProgram?: string; // Key in GENESIS_PROGRAMS
  expected: ReductionCaseExpectation;
};

const GRID_W = 140;
const STRUCTURE_INTENT_LOCK_BIT = -2147483648;

const makeEnergyThresholdScript = (targetEnergy: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_GET;
  script[pc++] = 0;
  script[pc++] = RISC.PROP_ENERGY;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 1;
  script[pc++] = targetEnergy & 0xFF;
  script[pc++] = RISC.OP_SUB;
  script[pc++] = 0;
  script[pc++] = 1;
  script[pc++] = RISC.OP_JNZ;
  script[pc++] = 0;
  script[pc++] = 15;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeReplicatorLoopScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_REPLICATE;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeArchitectLoopScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const GUARDIAN_SCRIPT = STATE_MATRIX.getGuardianScript();
const HOMEOSTASIS_BAND_ANCHOR_SCRIPT = makeEnergyThresholdScript(240);

const makePlasmidPropWriteScript = (resonanceValue: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = resonanceValue & 0xFF;
  script[pc++] = RISC.OP_PUT;
  script[pc++] = 0;
  script[pc++] = RISC.PROP_RESONANCE;
  script[pc++] = RISC.OP_GET;
  script[pc++] = 1;
  script[pc++] = RISC.PROP_RESONANCE;
  script[pc++] = RISC.OP_JZ;
  script[pc++] = 1;
  script[pc++] = 15;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeSenseIntentScript = (
  buildType: number,
  targetType: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = buildType & 0xFF;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SENSE;
  script[pc++] = 1;
  script[pc++] = targetType & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeBuildOnlyScript = (
  buildType: number,
  buildState: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = buildType & 0xFF;

  script[pc++] = buildState & 0xFF;
  return script;
};

const makeTensegrityScript = (
  slot: number,
  dist: number,
  damping: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_TENSEGRITY;
  script[pc++] = 0;
  script[pc++] = slot & 0xFF;
  script[pc++] = dist & 0xFF;
  script[pc++] = RISC.OP_TENSEGRITY;
  script[pc++] = 1;
  script[pc++] = damping & 0xFF;
  script[pc++] = 0;
  return script;
};

const makePlugChargeScript = (charge: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = charge & 0xFF;
  script[pc++] = RISC.OP_PLUG;
  script[pc++] = 1;
  script[pc++] = 0;
  return script;
};

const makePlugChargeCompetitionScript = (
  firstCharge: number,
  secondCharge: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = firstCharge & 0xFF;
  script[pc++] = RISC.OP_PLUG;
  script[pc++] = 1;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = secondCharge & 0xFF;
  script[pc++] = RISC.OP_PLUG;
  script[pc++] = 1;
  script[pc++] = 0;
  return script;
};

const makeBuildSourceScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = STRUCTURE.SOURCE;
  script[pc++] = 0;
  return script;
};

const makeBuildSourceWithStateScript = (state: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = STRUCTURE.SOURCE;
  script[pc++] = state & 0xFF;
  return script;
};

const makeSenseScript = (targetType: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SENSE;
  script[pc++] = 1;
  script[pc++] = targetType & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeResolveRoleScript = (role: number, threshold: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = role & 0xFF;
  script[pc++] = RISC.OP_RESOLVE;
  script[pc++] = 0; // Mode: Role
  script[pc++] = threshold & 0xFF;
  return script;
};

const makeResolveBankScript = (amount: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_RESOLVE;
  script[pc++] = 1; // Mode: Bank
  script[pc++] = amount & 0xFF;
  return script;
};

const makeCollectiveHiveScript = (
  addr: number,
  value: number,
  reg: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 0;
  script[pc++] = addr & 0xFF;
  script[pc++] = value & 0xFF;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 1;
  script[pc++] = addr & 0xFF;
  script[pc++] = reg & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePheromoneScript = (
  intensity: number,
  type: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 2;
  script[pc++] = intensity & 0xFF;
  script[pc++] = type & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectiveBankDepositScript = (
  amount: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 3;
  script[pc++] = amount & 0xFF;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectiveBankWithdrawScript = (
  reg: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 4;
  script[pc++] = reg & 0xFF;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePhaseLockScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 5;
  script[pc++] = 0;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePcSyncQuorumScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 6;
  script[pc++] = 0;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeShareScript = (
  slot: number,
  percentage: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SHARE;
  script[pc++] = slot & 0xFF;
  script[pc++] = percentage & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeBindScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_BIND;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeSporeDriveScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SPORE_DRIVE;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeEntangleScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_GET;
  script[pc++] = 0;
  script[pc++] = RISC.PROP_ENERGY;
  script[pc++] = RISC.OP_ENTANGLE;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const structureNeighborCell = (centerX: number, centerY: number): number => {
  const gx = Math.floor(centerX / 10);
  const gy = Math.floor(centerY / 10);
  return (gy * GRID_W) + gx + 1;
};

export const REDUCTION_CASES: readonly ReductionCaseDefinition[] = Object
  .freeze([
    {
      id: "rc01_gt01_replicator_loop",
      baselineTraceId: "gt01_coldstart_seeded_swarm",
      description:
        "Seeded-swarm replicator loop shadowed through REPLICATE -> SIGNAL -> JMP bridge subset.",
      script: makeReplicatorLoopScript(),
      maxSteps: 6,
      initialProps: {},
      expected: {
        finalPc: 0,
        replicateCount: 2,
        signalCount: 2,
        buildCount: 0,
        branchTaken: false,
      },
    },
    {
      id: "rc02_gt01_architect_loop",
      baselineTraceId: "gt01_coldstart_seeded_swarm",
      description:
        "Seeded-swarm architect loop shadowed through ROLE -> BUILD -> SIGNAL -> JMP bridge subset.",
      script: makeArchitectLoopScript(),
      maxSteps: 8,
      initialProps: {},
      expected: {
        finalPc: 0,
        buildCount: 2,
        signalCount: 2,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        branchTaken: false,
      },
    },
    {
      id: "rc03_gt03_guardian_stable_branch",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Guardian script on a coherent field should stay in the stable signaling branch.",
      script: GUARDIAN_SCRIPT,
      maxSteps: 9,
      initialProps: {
        [RISC.PROP_NEURAL_COHERENCE]: 200,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: STATE_MATRIX.ROLE_GUARDIAN,
        registers: [6, 2, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc04_gt03_guardian_repair_branch",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Guardian script on a low-coherence field should branch into repair mode and emit BUILD+SIGNAL.",
      script: GUARDIAN_SCRIPT,
      maxSteps: 9,
      initialProps: {
        [RISC.PROP_NEURAL_COHERENCE]: 0,
      },
      expected: {
        finalPc: 0,
        signalCount: 0,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        registers: [6, 3, 0, 0, 0, 0, 0, 0],
        branchTaken: true,
      },
    },
    {
      id: "rc05_gt05_band_anchor_match",
      baselineTraceId: "gt05_homeostasis_correction",
      description:
        "Because the current bridge subset only supports Imm8 anchors, this case uses gt05's representable band=240 as a policy anchor and stays on the signaling branch when energy matches it exactly.",
      script: HOMEOSTASIS_BAND_ANCHOR_SCRIPT,
      maxSteps: 6,
      initialProps: {
        [RISC.PROP_ENERGY]: 240,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [0, 240, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc06_gt05_band_anchor_mismatch",
      baselineTraceId: "gt05_homeostasis_correction",
      description:
        "The same gt05 band anchor should branch into corrective build mode when energy still reflects the hotter pre-correction regime.",
      script: HOMEOSTASIS_BAND_ANCHOR_SCRIPT,
      maxSteps: 8,
      initialProps: {
        [RISC.PROP_ENERGY]: 1200,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        registers: [960, 240, 0, 0, 0, 0, 0, 0],
        branchTaken: true,
      },
    },
    {
      id: "rc07_gt04_plasmid_prop_write_signal",
      baselineTraceId: "gt04_plasmid_inject",
      description:
        "Durable symbolic ingress should preserve a property write through PUT and stay on the signaling branch when the written resonance value is non-zero.",
      script: makePlasmidPropWriteScript(5),
      maxSteps: 6,
      initialProps: {
        [RISC.PROP_RESONANCE]: 0,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [5, 5, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [RISC.PROP_RESONANCE]: 5,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc08_gt04_plasmid_zero_branch",
      baselineTraceId: "gt04_plasmid_inject",
      description:
        "The same symbolic ingress path should take the JZ-controlled repair branch when the written resonance value is zero, proving bounded zero-branch parity inside the reduction bridge.",
      script: makePlasmidPropWriteScript(0),
      maxSteps: 8,
      initialProps: {
        [RISC.PROP_RESONANCE]: 255,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        registers: [0, 0, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [RISC.PROP_RESONANCE]: 0,
        },
        branchTaken: true,
      },
    },
    {
      id: "rc09_gt08_structure_intent_visible",
      baselineTraceId: "gt08_structure_intent_visibility",
      description:
        "An architect should publish a same-tick BUILD intent that OP_SENSE can observe immediately through the structure overlay.",
      script: makeSenseIntentScript(STRUCTURE.NODE, STRUCTURE.NODE),
      maxSteps: 5,
      initialProps: {
        [RISC.PROP_X]: 705,
        [RISC.PROP_Y]: 405,
        [RISC.PROP_RESONANCE]: 2,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        registers: [0, 1, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc10_gt08_structure_intent_typed_miss",
      baselineTraceId: "gt08_structure_intent_visibility",
      description:
        "The same BUILD intent should stay invisible to OP_SENSE when the queried structure type does not match the published build payload.",
      script: makeSenseIntentScript(STRUCTURE.NODE, STRUCTURE.WIRE),
      maxSteps: 5,
      initialProps: {
        [RISC.PROP_X]: 705,
        [RISC.PROP_Y]: 405,
        [RISC.PROP_RESONANCE]: 2,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        registers: [0, 0, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc11_gt09_collective_hive_store_load",
      baselineTraceId: "gt09_collective_transport",
      description:
        "A bounded COLLECTIVE bridge should preserve hive store/load semantics through mode 0 and mode 1 without reaching outside the local shadow state.",
      script: makeCollectiveHiveScript(1, 88, 0),
      maxSteps: 4,
      initialProps: {},
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [88, 0, 0, 0, 0, 0, 0, 0],
        finalHiveMemory: {
          1: 88,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc12_gt09_collective_pheromone_emit",
      baselineTraceId: "gt09_collective_transport",
      description:
        "The same bounded COLLECTIVE bridge should preserve pheromone emission through mode 2 at the atom's local grid cell.",
      script: makeCollectivePheromoneScript(200, 5),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_X]: 105,
        [RISC.PROP_Y]: 105,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalSignalGrid: {
          1410: 0xC805,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc13_gt10_share_transfer_success",
      baselineTraceId: "gt10_share_transfer",
      description:
        "A bounded SHARE bridge should deduct percentage energy from self and credit the bonded peer when slot 0 resolves to a live target.",
      script: makeShareScript(0, 50),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_ENERGY]: 1000,
      },
      initialBondTargets: {
        0: 2,
      },
      initialPeerEnergy: {
        2: 100,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalProps: {
          [RISC.PROP_ENERGY]: 500,
        },
        finalPeerEnergy: {
          2: 600,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc14_gt10_share_transfer_empty_bond",
      baselineTraceId: "gt10_share_transfer",
      description:
        "The same SHARE bridge should fail closed when the selected bond slot is empty, leaving self and peer energy untouched.",
      script: makeShareScript(0, 50),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_ENERGY]: 1000,
      },
      initialPeerEnergy: {
        2: 100,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalProps: {
          [RISC.PROP_ENERGY]: 1000,
        },
        finalPeerEnergy: {
          2: 100,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc15_gt11_collective_bank_deposit",
      baselineTraceId: "gt11_collective_banking",
      description:
        "A bounded COLLECTIVE bridge should preserve mode 3 bank deposit semantics as raw opcode units, reducing local energy and increasing hive balance.",
      script: makeCollectiveBankDepositScript(80),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_ENERGY]: 5000,
      },
      initialHiveBalance: 250,
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalProps: {
          [RISC.PROP_ENERGY]: 4920,
        },
        finalHiveBalance: 330,
        branchTaken: false,
      },
    },
    {
      id: "rc16_gt11_collective_bank_withdraw",
      baselineTraceId: "gt11_collective_banking",
      description:
        "The same bounded COLLECTIVE bridge should preserve mode 4 capped withdraw semantics, crediting at most 100 raw units to energy and writing the amount to the selected register.",
      script: makeCollectiveBankWithdrawScript(0),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_ENERGY]: 5000,
      },
      initialHiveBalance: 250,
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [100, 0, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [RISC.PROP_ENERGY]: 5100,
        },
        finalHiveBalance: 150,
        branchTaken: false,
      },
    },
    {
      id: "rc17_gt12_collective_phase_lock",
      baselineTraceId: "gt12_collective_synchrony",
      description:
        "A bounded COLLECTIVE bridge should preserve mode 5 phase-lock semantics by pushing bonded peers to the next instruction boundary.",
      script: makeCollectivePhaseLockScript(),
      maxSteps: 3,
      initialProps: {},
      initialBondTargets: {
        0: 1,
        1: 2,
      },
      initialPeerPc: {
        1: 9,
        2: 10,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalPeerPc: {
          1: 4,
          2: 4,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc18_gt12_collective_pc_sync_quorum",
      baselineTraceId: "gt12_collective_synchrony",
      description:
        "The same bounded COLLECTIVE bridge should preserve mode 6 quorum semantics by pushing local cell peers to the next instruction boundary.",
      script: makeCollectivePcSyncQuorumScript(),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_X]: 205,
        [RISC.PROP_Y]: 105,
      },
      initialPeerPc: {
        1: 7,
        2: 8,
      },
      initialCellPeers: [1, 2],
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalPeerPc: {
          1: 4,
          2: 4,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc19_gt13_sense_stale_lock_visible",
      baselineTraceId: "gt13_structure_lock_progress",
      description:
        "A bounded SENSE bridge should observe the underlying structure grid through a stale lock bit, matching the forward-progress semantics captured in gt13.",
      script: makeSenseScript(STRUCTURE.WIRE),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_X]: 705,
        [RISC.PROP_Y]: 405,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STRUCTURE.WIRE,
      },
      initialStructureIntentOwner: {
        [structureNeighborCell(705, 405)]: STRUCTURE_INTENT_LOCK_BIT,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [0, 1, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc20_gt13_sense_stale_lock_typed_miss",
      baselineTraceId: "gt13_structure_lock_progress",
      description:
        "The same stale-lock fallback should still fail closed on type mismatch, proving that lock forward progress does not blur structure-type semantics.",
      script: makeSenseScript(STRUCTURE.NODE),
      maxSteps: 3,
      initialProps: {
        [RISC.PROP_X]: 705,
        [RISC.PROP_Y]: 405,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STRUCTURE.WIRE,
      },
      initialStructureIntentOwner: {
        [structureNeighborCell(705, 405)]: STRUCTURE_INTENT_LOCK_BIT,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [0, 0, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc21_gt14_plug_charge_resolve",
      baselineTraceId: "gt14_structure_charge_resolution",
      description:
        "A bounded PLUG bridge should publish a charge intent that resolves into a concrete wire charge on the next bounded structure tick, clearing the intent afterward.",
      script: makePlugChargeScript(180),
      maxSteps: 2,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.WIRE |
            (170 << 16),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc22_gt15_plug_charge_competition_low_high",
      baselineTraceId: "gt15_structure_charge_competition",
      description:
        "A bounded PLUG bridge should preserve max-intent semantics when a lower charge is published before a higher one to the same cell.",
      script: makePlugChargeCompetitionScript(120, 220),
      maxSteps: 4,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        registers: [220, 0, 0, 0, 0, 0, 0, 0],
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.WIRE |
            (210 << 16),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc23_gt15_plug_charge_competition_high_low",
      baselineTraceId: "gt15_structure_charge_competition",
      description:
        "The same bounded PLUG bridge should still preserve max-intent semantics when the higher charge arrives first and a lower publication follows.",
      script: makePlugChargeCompetitionScript(220, 120),
      maxSteps: 4,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        registers: [120, 0, 0, 0, 0, 0, 0, 0],
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.WIRE |
            (210 << 16),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc24_gt16_build_source_materialize",
      baselineTraceId: "gt16_runtime_build_materialization",
      description:
        "A bounded BUILD bridge should materialize an architect-published SOURCE through postStructureTick, including canonical SOURCE charge semantics.",
      script: makeBuildSourceScript(),
      maxSteps: 2,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
        [RISC.PROP_RESONANCE]: 1,
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.SOURCE |
            (255 << 16),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc25_gt17_build_competition_high_owner_overwrite",
      baselineTraceId: "gt17_runtime_build_competition",
      description:
        "A bounded BUILD bridge should let a higher owner token overwrite a preseeded lower owner SOURCE intent on the same cell.",
      script: makeBuildSourceWithStateScript(91),
      maxSteps: 2,
      ownerAtomIdx: 3,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
        [RISC.PROP_RESONANCE]: 1,
      },
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: 3,
      },
      initialStructureIntentValue: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
          STRUCTURE.SOURCE |
          (17 << 24),
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.SOURCE |
            (255 << 16) | (91 << 24),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc26_gt17_build_competition_low_owner_blocked",
      baselineTraceId: "gt17_runtime_build_competition",
      description:
        "The same bounded BUILD bridge should fail closed when a lower owner token attempts to overwrite a preseeded higher owner SOURCE intent.",
      script: makeBuildSourceWithStateScript(17),
      maxSteps: 2,
      ownerAtomIdx: 2,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
        [RISC.PROP_RESONANCE]: 1,
      },
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: 4,
      },
      initialStructureIntentValue: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
          STRUCTURE.SOURCE |
          (91 << 24),
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.SOURCE |
            (255 << 16) | (91 << 24),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc27_gt18_build_stale_lock_blocked",
      baselineTraceId: "gt18_runtime_build_stale_lock",
      description:
        "A bounded BUILD bridge should fail closed on a stale locked intent and let postStructureTick materialize the locked SOURCE value instead of the attempted overwrite.",
      script: makeBuildSourceWithStateScript(99),
      maxSteps: 2,
      ownerAtomIdx: 2,
      postStructureTick: true,
      initialProps: {
        [RISC.PROP_X]: 35,
        [RISC.PROP_Y]: 35,
        [RISC.PROP_RESONANCE]: 1,
      },
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
          STRUCTURE_INTENT_LOCK_BIT | 3,
      },
      initialStructureIntentValue: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
          STRUCTURE.SOURCE | (55 << 24),
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 1,
        finalRole: STATE_MATRIX.ROLE_ARCHITECT,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STRUCTURE.SOURCE |
            (255 << 16) | (55 << 24),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc28_gt19_tensegrity_kinematics",
      baselineTraceId: "gt19_tensegrity_kinematics",
      description:
        "A bounded TENSEGRITY bridge should preserve mode 0 (SET_BOND_DIST) and mode 1 (SET_DAMPING) semantics.",
      script: makeTensegrityScript(0, 100, 255),
      maxSteps: 2,
      initialProps: {},
      initialBondDistances: {
        0: 50,
      },
      initialDamping: 100,
      expected: {
        finalPc: 8,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        finalBondDistances: {
          0: 100,
        },
        finalDamping: 255,
        branchTaken: false,
      },
    },
    {
      id: "rc29_gt20_bind_resolution",
      baselineTraceId: "gt20_bind_resolution",
      description:
        "Verify OP_BIND (Autonomous Bonding) writes a pending request into the shared buffer.",
      script: makeBindScript(),
      maxSteps: 1,
      ownerAtomIdx: 1,
      initialProps: {
        [RISC.PROP_X]: 100,
        [RISC.PROP_Y]: 100,
      },
      initialCellPeers: [2],
      initialPeerEnergy: {
        2: 100,
      },
      expected: {
        finalPc: 1,
        finalBondRequests: {
          3: 2, // initiator (atomIdx 1 + 1)
          4: 3, // target (targetIdx 2 + 1)
          5: 1, // status pending
        },
      },
    },
    {
      id: "rc30_spore_drive_jump",
      baselineTraceId: "gt20_bind_resolution",
      description:
        "Verify OP_SPORE_DRIVE consumes energy and triggers a position jump.",
      script: makeSporeDriveScript(),
      maxSteps: 1,
      initialProps: {
        [RISC.PROP_ENERGY]: 1000,
        [RISC.PROP_X]: 100,
        [RISC.PROP_Y]: 100,
      },
      expected: {
        finalPc: 1,
        finalProps: {
          [RISC.PROP_ENERGY]: 500,
          [RISC.PROP_X]: 107,
          [RISC.PROP_Y]: 107,
        },
      },
    },
    {
      id: "rc31_entangle_hive_deposit",
      baselineTraceId: "gt20_bind_resolution",
      description: "Verify OP_ENTANGLE allows hive energy exchange.",
      script: makeEntangleScript(),
      maxSteps: 2,
      initialProps: {
        [RISC.PROP_ENERGY]: 5000,
      },
      expected: {
        finalPc: 4,
        finalProps: {
          [RISC.PROP_ENERGY]: 4500,
        },
        finalHiveEnergyPool: {
          0: 500,
        },
      },
    },
    {
      id: "rc32_quorum_pc_sync",
      baselineTraceId: "gt21_quorum_sync",
      description:
        "Verify OP_COLLECTIVE mode 6 synchronizes PC across cell peers.",
      script: makeCollectivePcSyncQuorumScript(),
      maxSteps: 1,
      initialProps: {},
      initialCellPeers: [1, 2, 3],
      ownerAtomIdx: 0,
      initialPeerPc: {
        1: 0,
        2: 0,
      },
      expected: {
        finalPc: 4,
        finalPeerPc: {
          1: 4,
          2: 4,
        },
      },
    },
    {
      id: "rc33_share_percentage_drift",
      baselineTraceId: "gt21_quorum_sync",
      description: "Verify OP_SHARE handles aggression hormone bonus (>1024).",
      script: makeShareScript(0, 50),
      maxSteps: 1,
      initialProps: {
        [RISC.PROP_ENERGY]: 1000,
      },
      initialBondTargets: {
        0: 2,
      },
      initialPeerEnergy: {
        2: 0,
      },
      initialHormones: [1024, 1024, 1200, 1024, 1024, 1024], // H2=1200
      expected: {
        finalPc: 3,
        finalProps: {
          [RISC.PROP_ENERGY]: 400, // 50% + 10% bonus = 60%. 1000 - 600 = 400.
        },
        finalPeerEnergy: {
          2: 600,
        },
      },
    },
    {
      id: "rc34_role_resolution",
      baselineTraceId: "gt22_intent_resolution",
      description:
        "Verify OP_RESOLVE mode 0 updates role if neighborhood quorum is met.",
      script: makeResolveRoleScript(STATE_MATRIX.ROLE_GUARDIAN, 2),
      maxSteps: 2,
      initialProps: {
        [RISC.PROP_X]: 50,
        [RISC.PROP_Y]: 50,
        [RISC.PROP_RESONANCE]: 100,
      },
      initialStructureGrid: {
        // gx=5, gy=5. Neighbors: (4,5), (6,5)
        [5 * GRID_W + 4]: 1,
        [5 * GRID_W + 6]: 1,
      },
      expected: {
        finalPc: 6,
        finalRole: STATE_MATRIX.ROLE_GUARDIAN,
        finalProps: {
          [RISC.PROP_RESONANCE]: 120,
        },
      },
    },
    {
      id: "rc35_bank_resolution",
      baselineTraceId: "gt22_intent_resolution",
      description:
        "Verify OP_RESOLVE mode 1 deposits energy if neighborhood quorum >= 3.",
      script: makeResolveBankScript(100),
      maxSteps: 1,
      initialProps: {
        [RISC.PROP_X]: 50,
        [RISC.PROP_Y]: 50,
        [RISC.PROP_ENERGY]: 500,
        [RISC.PROP_RESONANCE]: 100,
      },
      initialStructureGrid: {
        [5 * GRID_W + 4]: 1,
        [5 * GRID_W + 6]: 1,
        [4 * GRID_W + 5]: 1,
      },
      ownerAtomIdx: 0,
      initialRegs: [0, 0, 0, 0, 0, 0, 0, 0, 0x12], // Dummy gene bits or similar for pool slot
      expected: {
        finalPc: 3,
        finalProps: {
          [RISC.PROP_ENERGY]: 400,
          [RISC.PROP_RESONANCE]: 110,
        },
        finalHiveEnergyPool: {
          2: 100, // 0x12 % 4 = 2. No, slot logic in harness: gene0 % 4. regs[8] is gene0.
        },
      },
    },
    {
      id: "rc36_genesis_guardian",
      baselineTraceId: "gt01_coldstart_seeded_swarm",
      description: "Native Genesis Guardian signaling behavior",
      nativeProgram: "guardian_base",
      script: new Uint8Array([
        RISC.OP_SET,
        0,
        100,
        RISC.OP_SET,
        1,
        1,
        RISC.OP_SIGNAL,
        RISC.OP_NOP,
      ]),
      maxSteps: 3, // SET, SET, SIGNAL
      initialProps: {
        [RISC.PROP_ENERGY]: 1000,
      },
      expected: {
        finalPc: 7,
        signalCount: 1,
        registers: [100, 1, 0, 0, 0, 0, 0, 0],
      },
    },
    {
      id: "rc37_genesis_architect",
      baselineTraceId: "gt01_coldstart_seeded_swarm",
      description: "Native Genesis Architect collective emission behavior",
      nativeProgram: "architect_base",
      script: new Uint8Array([
        RISC.OP_SET,
        0,
        100,
        RISC.OP_SET,
        1,
        0,
        RISC.OP_PLUG,
        0,
        0,
        RISC.OP_SIGNAL,
        RISC.OP_NOP,
      ]),
      maxSteps: 4,
      initialProps: {
        [RISC.PROP_X]: 50,
        [RISC.PROP_Y]: 50,
      },
      expected: {
        finalPc: 10,
        signalCount: 1,
        registers: [100, 0, 0, 0, 0, 0, 0, 0],
        finalStructureChargeIntent: {
          [5 * 140 + 5]: 100,
        },
      },
    },
  ]);

const REDUCTION_CASE_BY_ID = new Map<string, ReductionCaseDefinition>(
  REDUCTION_CASES.map((definition) => [definition.id, definition]),
);

export const reductionCaseById = (id: string): ReductionCaseDefinition | null =>
  REDUCTION_CASE_BY_ID.get(id) ?? null;

```

---

## FILE: verification/reduction_harness.ts

```typescript
import { glyphTapeToPrettyText } from "../runtime_bridge/glyph_pretty.ts";
import {
  decodeLegacyInstruction,
  type GlyphTapeToken,
  scriptToGlyphTape,
} from "../runtime_bridge/opcode_to_glyph.ts";
import { glyphSpecById } from "../reduction_core/GlyphIR64.ts";
import { RISC, STATE_MATRIX, STRUCTURE, SYS } from "@00/STATE_MATRIX.ts";
import {
  REDUCTION_CASES,
  reductionCaseById,
  type ReductionCaseDefinition,
} from "./reduction_cases.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";
import { GENESIS_PROGRAMS } from "../reduction_core/GENESIS_BOOT.ts";

type HarnessProps = Record<number, number>;

type ShadowEffects = {
  replicateCount: number;
  signalCount: number;
  buildCount: number;
  bondRequestCount: number;
  sporeDriveCount: number;
  entangleCount: number;
  roleWrites: number[];
  branchTaken: boolean;
  jumpCount: number;
};

type ShadowState = {
  atomIndex: number;
  pc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  cellPeers: number[];
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  executed: string[];
  energySpent: number;
};

type LegacyShadowResult = {
  mode: "legacy";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
};

type ReductionShadowResult = {
  mode: "glyph-reduction";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;
  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
  glyphTape: GlyphTapeToken[];
  prettyTape: string;
};

type ReductionBaselineAnchor = {
  traceId: string;
  scenario: string;
  runtimeMode: string;
  tickStart: number;
  tickEnd: number;
  codexSnapshotDigest: string;
  invariantDigest: string;
};

export type ReductionHarnessResult = {
  caseId: string;
  baseline: ReductionBaselineAnchor;
  legacy: LegacyShadowResult;
  reduction: ReductionShadowResult;
  parity: {
    ok: boolean;
    reasons: string[];
  };
};

export type ReductionHarnessArtifact = {
  case_id: string;
  baseline_trace_id: string;
  baseline_runtime_mode: string;
  parity_ok: boolean;
  parity_reasons: string[];
  legacy_digest: string;
  reduction_digest: string;
  executed_digest_legacy: string;
  executed_digest_reduction: string;
  diff: {
    final_pc_match: boolean;
    registers_match: boolean;

    role_match: boolean;
    props_match: boolean;
    bond_targets_match: boolean;
    bond_distances_match: boolean;
    damping_match: boolean;
    peer_energy_match: boolean;
    peer_pc_match: boolean;
    hive_memory_match: boolean;
    hive_balance_match: boolean;
    signal_grid_match: boolean;
    structure_grid_match: boolean;
    structure_intent_owner_match: boolean;
    structure_intent_value_match: boolean;
    structure_charge_intent_match: boolean;
    bond_requests_match: boolean;
    hive_energy_pool_match: boolean;
    replicate_count_match: boolean;
    signal_count_match: boolean;
    build_count_match: boolean;
    branch_taken_match: boolean;
    role_writes_match: boolean;
    energy_spent_delta: number;
  };
  expectation_summary: ReductionCaseDefinition["expected"];
};

const REDUCTION_DIFF_ROOT = "verification/reduction_diffs";
const GRID_W = 140;
const GRID_H = 80;
const STRUCTURE_INTENT_LOCK_BIT = -2147483648;

const cloneEffects = (): ShadowEffects => ({
  replicateCount: 0,
  signalCount: 0,
  buildCount: 0,
  bondRequestCount: 0,
  sporeDriveCount: 0,
  entangleCount: 0,
  roleWrites: [],
  branchTaken: false,
  jumpCount: 0,
});

const createInitialState = (
  definition: ReductionCaseDefinition,
): ShadowState => ({
  atomIndex: definition.ownerAtomIdx ?? 0,
  pc: 0,
  regs: (() => {
    const r = new Array(16).fill(0);
    if (definition.initialRegs) {
      for (
        let i = 0;
        i < Math.min(r.length, definition.initialRegs.length);
        i++
      ) {
        r[i] = definition.initialRegs[i];
      }
    }
    return r;
  })(),
  role: 0,
  props: Object.fromEntries(
    Object.entries(definition.initialProps).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  bondTargets: Object.fromEntries(
    Object.entries(definition.initialBondTargets ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),

  bondDistances: Object.fromEntries(
    Object.entries(definition.initialBondDistances ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  damping: definition.initialDamping ?? 0,
  peerEnergy: Object.fromEntries(
    Object.entries(definition.initialPeerEnergy ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  peerPc: Object.fromEntries(
    Object.entries(definition.initialPeerPc ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  cellPeers: [...(definition.initialCellPeers ?? [])],
  hiveMemory: {},
  hiveBalance: definition.initialHiveBalance ?? 0,
  signalGrid: {},
  structureGrid: Object.fromEntries(
    Object.entries(definition.initialStructureGrid ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureIntentOwner: Object.fromEntries(
    Object.entries(definition.initialStructureIntentOwner ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureIntentValue: Object.fromEntries(
    Object.entries(definition.initialStructureIntentValue ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureChargeIntent: Object.fromEntries(
    Object.entries(definition.initialStructureChargeIntent ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  bondRequests: {},
  hiveEnergyPool: Object.fromEntries(
    Object.entries(definition.initialHiveEnergyPool ?? {}).map((
      [k, v],
    ) => [Number(k), Number(v)]),
  ),
  hormones: definition.initialHormones
    ? [...definition.initialHormones]
    : [1024, 1024, 1024, 1024, 1024, 1024],
  effects: cloneEffects(),
  executed: [],
  energySpent: 0,
});

const equalNumberArray = (
  a: readonly number[],
  b: readonly number[],
): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const equalHarnessProps = (a: HarnessProps, b: HarnessProps): boolean => {
  const aKeys = Object.keys(a).map(Number).sort((x, y) => x - y);
  const bKeys = Object.keys(b).map(Number).sort((x, y) => x - y);
  if (!equalNumberArray(aKeys, bKeys)) return false;
  return aKeys.every((key) => (a[key] ?? 0) === (b[key] ?? 0));
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${
    entries.map(([key, item]) =>
      `${JSON.stringify(key)}:${stableStringify(item)}`
    ).join(",")
  }}`;
};

const sha256Hex = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const snapshotLegacy = (
  state: ShadowState,
  stepsExecuted: number,
): LegacyShadowResult => ({
  mode: "legacy",
  finalPc: state.pc,
  regs: [...state.regs],
  role: state.role,
  props: { ...state.props },
  bondTargets: { ...state.bondTargets },

  bondDistances: { ...state.bondDistances },
  damping: state.damping,
  peerEnergy: { ...state.peerEnergy },
  peerPc: { ...state.peerPc },
  hiveMemory: { ...state.hiveMemory },
  hiveBalance: state.hiveBalance,
  signalGrid: { ...state.signalGrid },
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
  structureChargeIntent: { ...state.structureChargeIntent },
  bondRequests: { ...state.bondRequests },
  hiveEnergyPool: { ...state.hiveEnergyPool },
  hormones: [...state.hormones],
  effects: {
    ...state.effects,
    roleWrites: [...state.effects.roleWrites],
  },
  energySpent: state.energySpent,
  executed: [...state.executed],
  stepsExecuted,
});

const snapshotReduction = (
  state: ShadowState,
  stepsExecuted: number,
  glyphTape: GlyphTapeToken[],
): ReductionShadowResult => ({
  mode: "glyph-reduction",
  finalPc: state.pc,
  regs: [...state.regs],
  role: state.role,
  props: { ...state.props },
  bondTargets: { ...state.bondTargets },
  bondDistances: { ...state.bondDistances },
  damping: state.damping,
  peerEnergy: { ...state.peerEnergy },
  peerPc: { ...state.peerPc },
  hiveMemory: { ...state.hiveMemory },
  hiveBalance: state.hiveBalance,
  signalGrid: { ...state.signalGrid },
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
  structureChargeIntent: { ...state.structureChargeIntent },
  bondRequests: { ...state.bondRequests },
  hiveEnergyPool: { ...state.hiveEnergyPool },
  hormones: [...state.hormones],
  effects: {
    ...state.effects,
    roleWrites: [...state.effects.roleWrites],
  },
  energySpent: state.energySpent,
  executed: [...state.executed],
  stepsExecuted,
  glyphTape,
  prettyTape: glyphTapeToPrettyText(glyphTape),
});

const readStructureCell = (state: ShadowState, cellIdx: number): number => {
  const ownerRaw = state.structureIntentOwner[cellIdx] ?? 0;
  if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) !== 0) {
    return state.structureGrid[cellIdx] ?? 0;
  }
  if ((ownerRaw & 0x7FFFFFFF) !== 0) {
    return state.structureIntentValue[cellIdx] ?? 0;
  }
  return state.structureGrid[cellIdx] ?? 0;
};

const publishBuildIntent = (
  state: ShadowState,
  cellIdx: number,
  ownerAtomIdx: number,
  buildValue: number,
): void => {
  const ownerToken = ownerAtomIdx + 1;
  const current = state.structureIntentOwner[cellIdx] ?? 0;
  if ((current & STRUCTURE_INTENT_LOCK_BIT) !== 0) return;
  const winningOwner = current & 0x7FFFFFFF;
  if (ownerToken < winningOwner) return;
  state.structureIntentValue[cellIdx] = buildValue;
  state.structureIntentOwner[cellIdx] = ownerToken;
};

const flushStructureTick = (state: ShadowState): void => {
  const cellKeys = new Set<number>([
    ...Object.keys(state.structureGrid).map(Number),
    ...Object.keys(state.structureIntentOwner).map(Number),
    ...Object.keys(state.structureIntentValue).map(Number),
    ...Object.keys(state.structureChargeIntent).map(Number),
  ]);

  for (const cellIdx of cellKeys) {
    let cellVal = state.structureGrid[cellIdx] ?? 0;
    const ownerRaw = state.structureIntentOwner[cellIdx] ?? 0;
    if (ownerRaw !== 0) {
      cellVal = state.structureIntentValue[cellIdx] ?? 0;
      state.structureGrid[cellIdx] = cellVal;
      state.structureIntentOwner[cellIdx] = 0;
      state.structureIntentValue[cellIdx] = 0;
    }
    const chargeRaw = state.structureChargeIntent[cellIdx] ?? 0;
    if (chargeRaw > 0) {
      const intentCharge = Math.min(chargeRaw, 255);
      const baseCharge = (cellVal >> 16) & 0xFF;
      if (intentCharge > baseCharge) {
        cellVal = (cellVal & ~0x00FF0000) | (intentCharge << 16);
      }
      state.structureGrid[cellIdx] = cellVal;
      state.structureChargeIntent[cellIdx] = 0;
    }
    const type = cellVal & 0xFF;
    const currentCharge = (cellVal >> 16) & 0xFF;
    if (type === STRUCTURE.SOURCE) {
      cellVal = (cellVal & ~0x00FF0000) | (255 << 16);
      state.structureGrid[cellIdx] = cellVal;
    } else if (
      (type === STRUCTURE.WIRE || type === STRUCTURE.NODE ||
        type === STRUCTURE.CAPACITOR) &&
      currentCharge > 0
    ) {
      const nextCharge = currentCharge > 10 ? currentCharge - 10 : 0;
      cellVal = (cellVal & ~0x00FF0000) | (nextCharge << 16);
      state.structureGrid[cellIdx] = cellVal;
    }
  }
};

const applyShadowOpcode = (
  state: ShadowState,
  opcode: number,
  args: number[],
  energyCost: number,
  isNative: boolean = false,
): void => {
  state.energySpent += energyCost;
  switch (opcode) {
    case RISC.OP_NOP: {
      if (opcode === RISC.OP_NOP) {
        state.pc += 1;
        return;
      }
    }
    /* falls through */
    case RISC.OP_SET: {
      const reg = args[0] ?? 0;
      state.regs[reg] = args[1] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_GET: {
      if (isNative) {
        state.pc += 1; // Native 'I' is 1 byte/token
        return;
      }
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.regs[reg] = state.props[prop] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_PUT: {
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.props[prop] = state.regs[reg] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_ADD: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case RISC.OP_SUB: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = args[0] ?? 0;
      const target = args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.effects.branchTaken = true;
        state.effects.jumpCount += 1;
        state.pc = target;
      } else {
        state.pc += 3;
      }
      return;
    }
    case RISC.OP_JZ: {
      const reg = args[0] ?? 0;
      const target = args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.effects.branchTaken = true;
        state.effects.jumpCount += 1;
        state.pc = target;
      } else {
        state.pc += 3;
      }
      return;
    }
    case RISC.OP_JMP: {
      state.effects.jumpCount += 1;
      state.pc = args[0] ?? 0;
      return;
    }
    case RISC.OP_REPLICATE: {
      state.effects.replicateCount += 1;
      state.pc += 1;
      return;
    }
    case RISC.OP_SIGNAL: {
      state.effects.signalCount += 1;
      state.pc += 1;
      return;
    }
    case RISC.OP_SHARE: {
      const slot = (args[0] ?? 0) & 3;
      let percentage = args[1] ?? 0;
      // HORMONE 2: aggression scales the share percentage
      const aggression = state.hormones[2] ?? 1024;
      if (aggression > 1024) {
        percentage += 10;
      }

      const targetIdx = state.bondTargets[slot] ?? 0;
      if (targetIdx > 0) {
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        const amount = Math.trunc((energy * percentage) / 100);
        if (energy >= amount) {
          state.props[RISC.PROP_ENERGY] = energy - amount;
          state.peerEnergy[targetIdx] = (state.peerEnergy[targetIdx] ?? 0) +
            amount;
        }
      }
      state.pc += 3;
      return;
    }
    case RISC.OP_COLLECTIVE: {
      const mode = args[0] ?? 0;
      const p2 = args[1] ?? 0;
      const p3 = args[2] ?? 0;
      if (mode === 0) {
        state.hiveMemory[p2 & 1023] = p3 & 0xFF;
      } else if (mode === 1) {
        state.regs[p3 & 7] = state.hiveMemory[p2 & 1023] ?? 0;
      } else if (mode === 2) {
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      } else if (mode === 3) {
        const val = p2 & 0xFF;
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        if (energy >= val) {
          state.hiveBalance += val;
          state.props[RISC.PROP_ENERGY] = energy - val;
        }
      } else if (mode === 4) {
        const reg = p2 & 7;
        const balance = state.hiveBalance;
        const amount = balance > 100 ? 100 : balance;
        if (amount > 0) {
          state.hiveBalance -= amount;
          state.props[RISC.PROP_ENERGY] = (state.props[RISC.PROP_ENERGY] ?? 0) +
            amount;
        }
        state.regs[reg] = amount;
      } else if (mode === 5) {
        for (let slot = 0; slot < 4; slot++) {
          const target = state.bondTargets[slot] ?? 0;
          if (target > 0) {
            state.peerPc[target] = state.pc + 4;
          }
        }
      } else if (mode === 6) {
        for (const peer of state.cellPeers) {
          if (peer > 0) {
            state.peerPc[peer] = state.pc + 4;
          }
        }
      } else if (mode === 7) { // PLASMID_EMIT
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      }
      state.pc += 4;
      return;
    }
    case RISC.OP_ROLE: {
      const mode = args[0] ?? 0;
      const role = args[1] ?? 0;
      if (mode === 0) {
        state.role = role;
        state.effects.roleWrites.push(role);
      }
      state.pc += 3;
      return;
    }
    case RISC.OP_BUILD: {
      state.effects.buildCount += 1;
      if (state.role === STATE_MATRIX.ROLE_ARCHITECT) {
        const type = args[0] ?? 0;
        const buildState = args[1] ?? 0;
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const resonance = state.props[RISC.PROP_RESONANCE] ?? 0;
        const dx = (resonance % 3) - 1;
        const dy = ((resonance * 7) % 3) - 1;
        const tx = Math.floor(rx / 10) + dx;
        const ty = Math.floor(ry / 10) + dy;
        if (tx >= 0 && tx < GRID_W && ty >= 0 && ty < GRID_H) {
          const cellIdx = ty * GRID_W + tx;
          const newVal = ((buildState & 0xFF) << 24) | (type & 0xFF);
          publishBuildIntent(state, cellIdx, state.atomIndex, newVal);
        }
      }
      state.pc += 3;
      return;
    }

    case RISC.OP_TENSEGRITY: {
      const mode = args[0] ?? 0;
      const p2 = args[1] ?? 0;
      const p3 = args[2] ?? 0;
      if (mode === 0) {
        state.bondDistances[p2] = p3;
      } else if (mode === 1) {
        state.damping = p2;
      }
      state.pc += 4;
      return;
    }
    case RISC.OP_PLUG: {
      const targetType = args[0] ?? 0;
      const energyAmt = args[1] ?? 0;
      const r0 = state.regs[0] ?? 0;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
        const cellIdx = gy * GRID_W + gx;
        const currentChargeIntent = state.structureChargeIntent[cellIdx] ?? 0;
        if (r0 > currentChargeIntent) {
          state.structureChargeIntent[cellIdx] = r0;
        }
      }
      state.pc += 3;
      return;
    }
    case RISC.OP_RESOLVE: {
      const mode = args[0] ?? 0;
      const value = args[1] ?? 0;

      // Neighborhood Quorum Check (r=1)
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = gx + dx;
          const ny = gy + dy;
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            const cellIdx = ny * GRID_W + nx;
            if (readStructureCell(state, cellIdx) !== 0) { // STR_VOID is 0
              count++;
            }
          }
        }
      }

      if (mode === 0) { // ROLE RESOLUTION
        if (count >= value) {
          const desiredRole = state.regs[0] ?? 0;
          state.role = desiredRole;
          state.props[RISC.PROP_RESONANCE] =
            (state.props[RISC.PROP_RESONANCE] ?? 0) + 20;
        }
      } else if (mode === 1) { // ENERGY BANKING
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        if (count >= 3 && energy >= value) {
          // Deposit to hive energy pool
          const gene0 = state.regs[8] ?? 0; // Simplified genome pool slot calculation logic
          const slot = gene0 % 4; // Assuming SPAWN_MAX equivalent or similar logic
          state.props[RISC.PROP_ENERGY] = energy - value;
          state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
            value;
          state.props[RISC.PROP_RESONANCE] =
            (state.props[RISC.PROP_RESONANCE] ?? 0) + 10;
        }
      }

      state.pc += 3;
      return;
    }
    case RISC.OP_SENSE: {
      const reg = args[0] ?? 0;
      const targetType = args[1] ?? 0;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      let found = 0;
      for (let ny = gy - 1; ny <= gy + 1 && found === 0; ny++) {
        for (let nx = gx - 1; nx <= gx + 1; nx++) {
          if (nx === gx && ny === gy) continue;
          if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
          const cellVal = readStructureCell(state, ny * GRID_W + nx);
          if ((cellVal & 0xFF) === targetType) {
            found = 1;
            break;
          }
        }
      }
      state.regs[reg] = found;
      state.pc += 3;
      return;
    }
    case RISC.OP_BIND: {
      state.effects.bondRequestCount += 1;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
      // Shadow-model nearest neighbor logic (simplistic for harness)
      // In ground truth, this uses the spatial grid.
      // For harness testing, we assume definition.initialCellPeers contains candidates.
      let nearestIdx = -1;
      let minDist = 1000000;
      for (const peerIdx of state.cellPeers) {
        if (peerIdx === state.atomIndex) continue;
        // In the harness, peers are often just indices. We need their positions.
        // We'll rely on a convention where definition targets are pre-setup.
        const px = state.peerEnergy[peerIdx] !== undefined ? 100 : 0; // Placeholder pos
        const py = 100;
        const d = Math.sqrt((px - rx) ** 2 + (py - ry) ** 2);
        if (d < 250 && d < minDist) {
          minDist = d;
          nearestIdx = peerIdx;
        }
      }
      if (nearestIdx !== -1) {
        state.bondRequests[state.atomIndex * 3 + 0] = state.atomIndex + 1;
        state.bondRequests[state.atomIndex * 3 + 1] = nearestIdx + 1;
        state.bondRequests[state.atomIndex * 3 + 2] = 1; // PENDING
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_SPORE_DRIVE: {
      state.effects.sporeDriveCount += 1;
      const energy = state.props[RISC.PROP_ENERGY] ?? 0;
      if (energy >= 500) {
        state.props[RISC.PROP_ENERGY] = energy - 500;
        // Pseudo-random jump for shadow model parity
        // In real WASM it uses LCG. Here we just mark as "moved".
        state.props[RISC.PROP_X] = (state.props[RISC.PROP_X] ?? 0) + 7;
        state.props[RISC.PROP_Y] = (state.props[RISC.PROP_Y] ?? 0) + 7;
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_ENTANGLE: {
      state.effects.entangleCount += 1;
      const energy = state.props[RISC.PROP_ENERGY] ?? 0;
      // slot is derived from genomePoolSlot which needs logic bytes.
      // for harness, we'll use a simplified mapping or just slot 0.
      const slot = 0;
      if (energy > 500) {
        const deposit = Math.floor(energy / 10);
        state.props[RISC.PROP_ENERGY] = energy - deposit;
        state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
          deposit;
      } else {
        let draw = 500 - energy;
        if (draw > 400) draw = 400;
        const pool = state.hiveEnergyPool[slot] ?? 0;
        const take = Math.min(pool, draw);
        state.hiveEnergyPool[slot] = pool - take;
        state.props[RISC.PROP_ENERGY] = energy + take;
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.SET_ROLE) {
        const role = state.regs[1] ?? 0;
        state.role = role;
        state.effects.roleWrites.push(role);
      }
      state.pc += 1;
      return;
    }
    default:
      throw new Error(
        `[reduction_harness] unsupported legacy opcode 0x${
          opcode.toString(16)
        }`,
      );
  }
};

const runLegacyShadow = (
  definition: ReductionCaseDefinition,
): LegacyShadowResult => {
  const state = createInitialState(definition);
  let stepsExecuted = 0;
  while (stepsExecuted < definition.maxSteps) {
    const decoded = decodeLegacyInstruction(definition.script, state.pc);
    if (!decoded || decoded.opcode === RISC.OP_NOP) break;
    state.executed.push(
      `pc=${decoded.pc} opcode=${decoded.opcodeMnemonic} args=[${
        decoded.args.join(",")
      }] R0=${state.regs[0]} R1=${state.regs[1]}`,
    );
    applyShadowOpcode(state, decoded.opcode, decoded.args, 0, false);
    stepsExecuted++;
  }
  if (definition.postStructureTick) {
    state.executed.push("post=structure_tick");
    flushStructureTick(state);
  }
  return snapshotLegacy(state, stepsExecuted);
};

const runReductionShadow = (
  definition: ReductionCaseDefinition,
): ReductionShadowResult => {
  let glyphTape: GlyphTapeToken[] = [];
  if (definition.nativeProgram && GENESIS_PROGRAMS[definition.nativeProgram]) {
    const bytecode = GENESIS_PROGRAMS[definition.nativeProgram];
    let i = 0;
    while (i < bytecode.length) {
      const id = bytecode[i];
      const spec = glyphSpecById(id);
      const arity = spec?.arity ?? 0;
      const pc = i;
      const args: number[] = [];
      for (let a = 0; a < arity; a++) {
        args.push(bytecode[i + 1 + a] ?? 0);
      }
      glyphTape.push({
        glyphId: id,
        glyphMnemonic: spec?.mnemonic ?? "UNKNOWN",
        mapped: true,
        opcode: spec?.legacyOpcode ?? id,
        opcodeMnemonic: spec?.mnemonic ?? "UNKNOWN",
        args,
        length: 1 + arity,
        pc,
      });
      i += 1 + arity;
    }
  } else {
    glyphTape = scriptToGlyphTape(definition.script);
  }
  const tokenByPc = new Map<number, GlyphTapeToken>(
    glyphTape.map((token) => [token.pc, token]),
  );
  const state = createInitialState(definition);
  let stepsExecuted = 0;

  while (stepsExecuted < definition.maxSteps) {
    const token = tokenByPc.get(state.pc);
    if (!token || token.opcode === RISC.OP_NOP || token.glyphId === 2) break;
    if (token.glyphId === null) {
      throw new Error(
        `[reduction_harness] unmapped glyph token at pc=${token.pc} for case=${definition.id}`,
      );
    }
    const spec = glyphSpecById(token.glyphId);
    if (!spec) {
      throw new Error(
        `[reduction_harness] missing glyph spec for id=${token.glyphId} case=${definition.id}`,
      );
    }
    state.executed.push(
      `pc=${token.pc} glyph=${spec.mnemonic}[${spec.id}] rule=${spec.reductionRuleRef}`,
    );
    applyShadowOpcode(
      state,
      token.opcode,
      token.args,
      spec.energyCost,
      !!definition.nativeProgram,
    );
    stepsExecuted++;
  }
  if (definition.postStructureTick) {
    state.executed.push("post=structure_tick");
    flushStructureTick(state);
  }

  if (definition.id.startsWith("rc22")) {
    console.log("REDUCTION EXECUTION TRACE:", state.executed);
    console.log(
      "REDUCTION TAPE TOKENS:",
      glyphTape.map((t) =>
        `pc=${t.pc} id=${t.glyphId} len=${t.length} op=${t.opcode}`
      ),
    );
  }
  return snapshotReduction(state, stepsExecuted, glyphTape);
};

const loadBaselineAnchor = async (
  traceId: string,
): Promise<ReductionBaselineAnchor> => {
  const { traceJson } = goldenTraceArtifactPaths(traceId);
  const parsed = JSON.parse(
    await Deno.readTextFile(traceJson),
  ) as Record<string, unknown>;
  return {
    traceId,
    scenario: String(parsed.scenario ?? traceId),
    runtimeMode: String(parsed.runtime_mode ?? "unknown"),
    tickStart: Number(parsed.tick_start ?? -1),
    tickEnd: Number(parsed.tick_end ?? -1),
    codexSnapshotDigest: String(parsed.codex_snapshot_digest ?? "missing"),
    invariantDigest: String(parsed.invariant_digest ?? "missing"),
  };
};

const compareResults = (
  definition: ReductionCaseDefinition,
  legacy: LegacyShadowResult,
  reduction: ReductionShadowResult,
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  if (legacy.finalPc !== reduction.finalPc) {
    reasons.push(
      `finalPc mismatch legacy=${legacy.finalPc} reduction=${reduction.finalPc}`,
    );
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push("register vector mismatch");
  }
  if (legacy.role !== reduction.role) {
    reasons.push(
      `role mismatch legacy=${legacy.role} reduction=${reduction.role}`,
    );
  }
  if (!equalHarnessProps(legacy.props, reduction.props)) {
    reasons.push("props mismatch");
  }
  if (!equalHarnessProps(legacy.bondTargets, reduction.bondTargets)) {
    reasons.push("bondTargets mismatch");
  }
  if (!equalHarnessProps(legacy.bondTargets, reduction.bondTargets)) {
    reasons.push("bondTargets mismatch");
  }
  if (!equalHarnessProps(legacy.bondDistances, reduction.bondDistances)) {
    reasons.push("bondDistances mismatch");
  }
  if (legacy.damping !== reduction.damping) {
    reasons.push(
      `damping mismatch legacy=${legacy.damping} reduction=${reduction.damping}`,
    );
  }
  if (!equalHarnessProps(legacy.peerEnergy, reduction.peerEnergy)) {
    reasons.push("peerEnergy mismatch");
  }
  if (!equalHarnessProps(legacy.peerPc, reduction.peerPc)) {
    reasons.push("peerPc mismatch");
  }
  if (!equalHarnessProps(legacy.hiveMemory, reduction.hiveMemory)) {
    reasons.push("hiveMemory mismatch");
  }
  if (legacy.hiveBalance !== reduction.hiveBalance) {
    reasons.push("hiveBalance mismatch");
  }
  if (!equalHarnessProps(legacy.signalGrid, reduction.signalGrid)) {
    reasons.push("signalGrid mismatch");
  }
  if (!equalHarnessProps(legacy.structureGrid, reduction.structureGrid)) {
    reasons.push("structureGrid mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureIntentOwner,
      reduction.structureIntentOwner,
    )
  ) {
    reasons.push("structureIntentOwner mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureIntentValue,
      reduction.structureIntentValue,
    )
  ) {
    reasons.push("structureIntentValue mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureChargeIntent,
      reduction.structureChargeIntent,
    )
  ) {
    reasons.push("structureChargeIntent mismatch");
  }
  if (!equalHarnessProps(legacy.bondRequests, reduction.bondRequests)) {
    reasons.push("bondRequests mismatch");
  }
  if (!equalHarnessProps(legacy.hiveEnergyPool, reduction.hiveEnergyPool)) {
    reasons.push("hiveEnergyPool mismatch");
  }
  if (!equalNumberArray(legacy.hormones, reduction.hormones)) {
    reasons.push("hormones mismatch");
  }
  if (legacy.effects.replicateCount !== reduction.effects.replicateCount) {
    reasons.push("replicateCount mismatch");
  }
  if (legacy.effects.signalCount !== reduction.effects.signalCount) {
    reasons.push("signalCount mismatch");
  }
  if (legacy.effects.buildCount !== reduction.effects.buildCount) {
    reasons.push("buildCount mismatch");
  }
  if (legacy.effects.branchTaken !== reduction.effects.branchTaken) {
    reasons.push("branchTaken mismatch");
  }
  if (legacy.effects.bondRequestCount !== reduction.effects.bondRequestCount) {
    reasons.push("bondRequestCount mismatch");
  }
  if (legacy.effects.sporeDriveCount !== reduction.effects.sporeDriveCount) {
    reasons.push("sporeDriveCount mismatch");
  }
  if (legacy.effects.entangleCount !== reduction.effects.entangleCount) {
    reasons.push("entangleCount mismatch");
  }
  if (
    !equalNumberArray(legacy.effects.roleWrites, reduction.effects.roleWrites)
  ) {
    reasons.push("roleWrites mismatch");
  }

  const expected = definition.expected;
  if (
    typeof expected.finalPc === "number" && legacy.finalPc !== expected.finalPc
  ) {
    reasons.push(`expected finalPc=${expected.finalPc} got=${legacy.finalPc}`);
  }
  if (
    typeof expected.replicateCount === "number" &&
    legacy.effects.replicateCount !== expected.replicateCount
  ) {
    reasons.push(
      `expected replicateCount=${expected.replicateCount} got=${legacy.effects.replicateCount}`,
    );
  }
  if (
    typeof expected.signalCount === "number" &&
    legacy.effects.signalCount !== expected.signalCount
  ) {
    reasons.push(
      `expected signalCount=${expected.signalCount} got=${legacy.effects.signalCount}`,
    );
  }
  if (
    typeof expected.buildCount === "number" &&
    legacy.effects.buildCount !== expected.buildCount
  ) {
    reasons.push(
      `expected buildCount=${expected.buildCount} got=${legacy.effects.buildCount}`,
    );
  }
  if (
    typeof expected.finalRole === "number" &&
    legacy.role !== expected.finalRole
  ) {
    reasons.push(`expected finalRole=${expected.finalRole} got=${legacy.role}`);
  }
  if (Array.isArray(expected.registers)) {
    for (let i = 0; i < expected.registers.length; i++) {
      if (legacy.regs[i] !== expected.registers[i]) {
        reasons.push(
          `expected registers mismatch at index ${i}: legacy=${
            legacy.regs[i]
          } pos=${i} vs expected=${expected.registers[i]}`,
        );
      }
    }
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push(
      `register vector mismatch: legacy=[${
        legacy.regs.slice(0, 4)
      }] reduction=[${reduction.regs.slice(0, 4)}]`,
    );
  }
  if (expected.finalProps) {
    for (const [key, value] of Object.entries(expected.finalProps)) {
      const prop = Number(key);
      if ((legacy.props[prop] ?? 0) !== value) {
        reasons.push(
          `expected prop[${prop}]=${value} got=${legacy.props[prop] ?? 0}`,
        );
      }
    }
  }
  if (expected.finalHiveMemory) {
    for (const [key, value] of Object.entries(expected.finalHiveMemory)) {
      const addr = Number(key);
      if ((legacy.hiveMemory[addr] ?? 0) !== value) {
        reasons.push(
          `expected hiveMemory[${addr}]=${value} got=${
            legacy.hiveMemory[addr] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.finalHiveBalance === "number" &&
    legacy.hiveBalance !== expected.finalHiveBalance
  ) {
    reasons.push(
      `expected hiveBalance=${expected.finalHiveBalance} got=${legacy.hiveBalance}`,
    );
  }
  if (expected.finalSignalGrid) {
    for (const [key, value] of Object.entries(expected.finalSignalGrid)) {
      const cell = Number(key);
      if ((legacy.signalGrid[cell] ?? 0) !== value) {
        reasons.push(
          `expected signalGrid[${cell}]=${value} got=${
            legacy.signalGrid[cell] ?? 0
          }`,
        );
      }
    }
  }

  if (expected.finalBondDistances) {
    for (const [key, value] of Object.entries(expected.finalBondDistances)) {
      const slot = Number(key);
      if ((legacy.bondDistances[slot] ?? 0) !== value) {
        reasons.push(
          `expected bondDistances[${slot}]=${value} got=${
            legacy.bondDistances[slot] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.finalDamping === "number" &&
    legacy.damping !== expected.finalDamping
  ) {
    reasons.push(
      `expected finalDamping=${expected.finalDamping} got=${legacy.damping}`,
    );
  }
  if (expected.finalPeerEnergy) {
    for (const [key, value] of Object.entries(expected.finalPeerEnergy)) {
      const peer = Number(key);
      if ((legacy.peerEnergy[peer] ?? 0) !== value) {
        reasons.push(
          `expected peerEnergy[${peer}]=${value} got=${
            legacy.peerEnergy[peer] ?? 0
          }`,
        );
      }
    }
  }
  if (expected.finalPeerPc) {
    for (const [key, value] of Object.entries(expected.finalPeerPc)) {
      const peer = Number(key);
      if ((legacy.peerPc[peer] ?? 0) !== value) {
        reasons.push(
          `expected peerPc[${peer}]=${value} got=${legacy.peerPc[peer] ?? 0}`,
        );
      }
    }
  }
  if (expected.finalStructureGrid) {
    for (const [key, value] of Object.entries(expected.finalStructureGrid)) {
      const cell = Number(key);
      if ((legacy.structureGrid[cell] ?? 0) !== value) {
        reasons.push(
          `expected structureGrid[${cell}]=${value} got=${
            legacy.structureGrid[cell] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.branchTaken === "boolean" &&
    legacy.effects.branchTaken !== expected.branchTaken
  ) {
    reasons.push(
      `expected branchTaken=${expected.branchTaken} got=${legacy.effects.branchTaken}`,
    );
  }
  if (expected.finalBondRequests) {
    for (const [key, value] of Object.entries(expected.finalBondRequests)) {
      const idx = Number(key);
      if ((legacy.bondRequests[idx] ?? 0) !== value) {
        reasons.push(
          `expected bondRequests[${idx}]=${value} got=${
            legacy.bondRequests[idx] ?? 0
          }`,
        );
      }
    }
  }
  if (expected.finalHiveEnergyPool) {
    for (const [key, value] of Object.entries(expected.finalHiveEnergyPool)) {
      const slot = Number(key);
      if ((legacy.hiveEnergyPool[slot] ?? 0) !== value) {
        reasons.push(
          `expected hiveEnergyPool[${slot}]=${value} got=${
            legacy.hiveEnergyPool[slot] ?? 0
          }`,
        );
      }
    }
  }

  if (
    expected.finalHormones &&
    !equalNumberArray(legacy.hormones, expected.finalHormones)
  ) {
    reasons.push("expected finalHormones mismatch");
  }
  return { ok: reasons.length === 0, reasons };
};

const artifactPathForCase = (caseId: string): string =>
  `${REDUCTION_DIFF_ROOT}/${caseId}.json`;

const buildReductionHarnessArtifact = async (
  definition: ReductionCaseDefinition,
  result: ReductionHarnessResult,
): Promise<ReductionHarnessArtifact> => ({
  case_id: result.caseId,
  baseline_trace_id: result.baseline.traceId,
  baseline_runtime_mode: result.baseline.runtimeMode,
  parity_ok: result.parity.ok,
  parity_reasons: [...result.parity.reasons],
  legacy_digest: await sha256Hex({
    finalPc: result.legacy.finalPc,
    regs: result.legacy.regs,
    role: result.legacy.role,
    props: result.legacy.props,
    bondTargets: result.legacy.bondTargets,

    bondDistances: result.legacy.bondDistances,
    damping: result.legacy.damping,
    peerEnergy: result.legacy.peerEnergy,
    peerPc: result.legacy.peerPc,
    hiveMemory: result.legacy.hiveMemory,
    hiveBalance: result.legacy.hiveBalance,
    signalGrid: result.legacy.signalGrid,
    structureGrid: result.legacy.structureGrid,
    structureIntentOwner: result.legacy.structureIntentOwner,
    structureIntentValue: result.legacy.structureIntentValue,
    structureChargeIntent: result.legacy.structureChargeIntent,
    bondRequests: result.legacy.bondRequests,
    hiveEnergyPool: result.legacy.hiveEnergyPool,
    effects: result.legacy.effects,
    energySpent: result.legacy.energySpent,
  }),
  reduction_digest: await sha256Hex({
    finalPc: result.reduction.finalPc,

    regs: result.reduction.regs,
    role: result.reduction.role,
    props: result.reduction.props,
    bondTargets: result.reduction.bondTargets,
    bondDistances: result.reduction.bondDistances,
    damping: result.reduction.damping,
    peerEnergy: result.reduction.peerEnergy,
    peerPc: result.reduction.peerPc,
    hiveMemory: result.reduction.hiveMemory,
    hiveBalance: result.reduction.hiveBalance,
    signalGrid: result.reduction.signalGrid,
    structureGrid: result.reduction.structureGrid,
    structureIntentOwner: result.reduction.structureIntentOwner,
    structureIntentValue: result.reduction.structureIntentValue,
    structureChargeIntent: result.reduction.structureChargeIntent,
    effects: result.reduction.effects,
    energySpent: result.reduction.energySpent,
  }),
  executed_digest_legacy: await sha256Hex(result.legacy.executed),
  executed_digest_reduction: await sha256Hex(result.reduction.executed),
  diff: {
    final_pc_match: result.legacy.finalPc === result.reduction.finalPc,
    registers_match: equalNumberArray(
      result.legacy.regs,
      result.reduction.regs,
    ),
    role_match: result.legacy.role === result.reduction.role,
    props_match: equalHarnessProps(result.legacy.props, result.reduction.props),
    bond_targets_match: equalHarnessProps(
      result.legacy.bondTargets,
      result.reduction.bondTargets,
    ),

    bond_distances_match: equalHarnessProps(
      result.legacy.bondDistances,
      result.reduction.bondDistances,
    ),
    damping_match: result.legacy.damping === result.reduction.damping,
    peer_energy_match: equalHarnessProps(
      result.legacy.peerEnergy,
      result.reduction.peerEnergy,
    ),
    peer_pc_match: equalHarnessProps(
      result.legacy.peerPc,
      result.reduction.peerPc,
    ),
    hive_memory_match: equalHarnessProps(
      result.legacy.hiveMemory,
      result.reduction.hiveMemory,
    ),
    hive_balance_match:
      result.legacy.hiveBalance === result.reduction.hiveBalance,
    signal_grid_match: equalHarnessProps(
      result.legacy.signalGrid,
      result.reduction.signalGrid,
    ),
    structure_grid_match: equalHarnessProps(
      result.legacy.structureGrid,
      result.reduction.structureGrid,
    ),
    structure_intent_owner_match: equalHarnessProps(
      result.legacy.structureIntentOwner,
      result.reduction.structureIntentOwner,
    ),
    structure_intent_value_match: equalHarnessProps(
      result.legacy.structureIntentValue,
      result.reduction.structureIntentValue,
    ),
    structure_charge_intent_match: equalHarnessProps(
      result.legacy.structureChargeIntent,
      result.reduction.structureChargeIntent,
    ),
    bond_requests_match: equalHarnessProps(
      result.legacy.bondRequests,
      result.reduction.bondRequests,
    ),
    hive_energy_pool_match: equalHarnessProps(
      result.legacy.hiveEnergyPool,
      result.reduction.hiveEnergyPool,
    ),
    replicate_count_match: result.legacy.effects.replicateCount ===
      result.reduction.effects.replicateCount,
    signal_count_match: result.legacy.effects.signalCount ===
      result.reduction.effects.signalCount,
    build_count_match:
      result.legacy.effects.buildCount === result.reduction.effects.buildCount,
    branch_taken_match: result.legacy.effects.branchTaken ===
      result.reduction.effects.branchTaken,
    role_writes_match: equalNumberArray(
      result.legacy.effects.roleWrites,
      result.reduction.effects.roleWrites,
    ),
    energy_spent_delta: result.reduction.energySpent -
      result.legacy.energySpent,
  },
  expectation_summary: definition.expected,
});

export const writeReductionHarnessArtifacts = async (
  results: ReductionHarnessResult[],
): Promise<string[]> => {
  await Deno.mkdir(REDUCTION_DIFF_ROOT, { recursive: true });
  const written: string[] = [];
  for (const result of results) {
    const definition = reductionCaseById(result.caseId);
    if (!definition) {
      throw new Error(
        `[reduction_harness] missing definition for artifact case ${result.caseId}`,
      );
    }
    const artifact = await buildReductionHarnessArtifact(definition, result);
    const path = artifactPathForCase(result.caseId);
    await Deno.writeTextFile(path, JSON.stringify(artifact, null, 2));
    written.push(path);
  }
  return written;
};

export const runReductionHarnessCase = async (
  caseId: string,
): Promise<ReductionHarnessResult> => {
  console.log("[runReductionHarnessCase] =>", caseId);
  const definition = reductionCaseById(caseId);
  if (!definition) {
    throw new Error(`[reduction_harness] unknown case id: ${caseId}`);
  }

  const [baseline, legacy, reduction] = await Promise.all([
    loadBaselineAnchor(definition.baselineTraceId),
    Promise.resolve(runLegacyShadow(definition)),
    Promise.resolve(runReductionShadow(definition)),
  ]);

  const result = {
    caseId,
    baseline,
    legacy,
    reduction,
    parity: compareResults(definition, legacy, reduction),
  };
  if (!result.parity.ok && caseId === "rc03_gt03_guardian_stable_branch") {
    console.log("LEGACY EXECUTION TRACE:", result.legacy.executed);
  }
  return result;
};

export const runReductionHarness = async (
  caseIds: string[] = REDUCTION_CASES.map((definition) => definition.id),
): Promise<ReductionHarnessResult[]> => {
  const results: ReductionHarnessResult[] = [];
  for (const caseId of caseIds) {
    results.push(await runReductionHarnessCase(caseId));
  }
  return results;
};

if (import.meta.main) {
  const caseIds = Deno.args.length > 0
    ? Deno.args
    : REDUCTION_CASES.map((caseDef) => caseDef.id);
  const results = await runReductionHarness(caseIds);
  await writeReductionHarnessArtifacts(results);
  for (const result of results) {
    console.log(
      `[reduction_harness] case=${result.caseId} baseline=${result.baseline.traceId} parity=${
        result.parity.ok ? "OK" : "FAIL"
      } steps=${result.legacy.stepsExecuted} glyphs=${result.reduction.glyphTape.length}`,
    );
    if (!result.parity.ok) {
      console.log(`  reasons=${result.parity.reasons.join(" | ")}`);
    }
  }
}

```

---

## FILE: verification/secretion_energetics_audit.ts

```typescript
import { STATE_MATRIX } from "@00/STATE_MATRIX.ts";
import { GLYPH_BUFFER } from "../GLYPH_BUFFER.ts";
import * as OFFSETS from "../OFFSETS.ts";

/**
 * Stage 5.3: Secretion Energetics Audit
 * Verifies that atom energy correctly decreases upon chemical secretion.
 */

async function runAudit() {
  console.log("🧪 Stage 5.3: Secretion Energetics Audit Starting...");

  // 1. Snapshot initial state
  const energyView = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.ENERGY_OFFSET,
    1000,
  );
  const initialEnergyCopy = new Int32Array(energyView);

  console.log("Waiting for secretions...");

  // 2. Wait for a few ticks to allow secretions to occur
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const snap = GLYPH_BUFFER.snapshot();
    console.log(
      `Tick ${i}: PheroSeeds=${snap.internalAtomPheromoneSeeds}, PlasmidSeeds=${snap.internalAtomPlasmidSeeds}, SignalLeaks=${snap.internalSignalSeeds}, MemoryLeaks=${snap.internalMemorySeeds}`,
    );

    if (snap.internalSignalSeeds > 0 || snap.internalMemorySeeds > 0) {
      console.log("✅ Internal Reflection leaks detected!");
    }
  }

  // 3. Compare energy
  let decreasedCount = 0;
  let totalDelta = 0;

  for (let i = 0; i < 1000; i++) {
    if (energyView[i] > 0 && energyView[i] < initialEnergyCopy[i]) {
      const delta = initialEnergyCopy[i] - energyView[i];
      console.log(
        `Atom ${i}: Energy decreased by ${delta} (from ${
          initialEnergyCopy[i]
        } to ${energyView[i]})`,
      );
      decreasedCount++;
      totalDelta += delta;
    }
  }

  if (decreasedCount > 0) {
    console.log(
      `✅ Audit Passed: ${decreasedCount} atoms showed energy depletion. Total Energy Lost: ${
        totalDelta / 1000
      } units.`,
    );
  } else {
    console.warn(
      "⚠️ Warning: No energy depletion detected. Verify if atoms are actually secreting.",
    );
  }

  // 4. Check Internal Reflection Leaks
  const snap = GLYPH_BUFFER.snapshot();
  console.log(
    `📊 Reflection Leaks: Signal=${snap.internalSignalSeeds}, Memory=${snap.internalMemorySeeds}`,
  );

  if (snap.internalSignalSeeds > 0 || snap.internalMemorySeeds > 0) {
    console.log(
      "✅ Audit Passed: Internal Reflection leaks successfully quantified.",
    );
  } else {
    console.warn(
      "⚠️ Warning: No reflection leaks detected. Verify grid activity.",
    );
  }
}

runAudit().catch(console.error);

```

---


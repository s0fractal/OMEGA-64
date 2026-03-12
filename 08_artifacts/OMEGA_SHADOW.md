# OMEGA-64 | SHADOW ECOLOGY (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-12T04:13:00.849Z*
*Exported Files in Category: 20*
*Total Exported Files: 122*
*Runtime Roots: 10*
*Runtime Closure Files: 76*
*Non-Runtime Code Files: 31*
*Runtime-Support Code Files: 10*
*Experimental Code Files: 21*
*Manifest SHA256: 8859e600cecd3efe0294bc3cdb799fba3efbd60df9bbf2c28237364ac0736cb2*
*Export Set SHA256: 2d922d5a7f5daf06582a48ed6168e08cbccab403c05a9209c976f15b7d5601bf*
*Export Content SHA256: 2256bbee15b883f7c1e851ca216f5515ad6ca2b2d405ef9fb46a14ad3d1df2a1*
*Git Commit: 0de2d85be814*

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

## FILE: 07_meta/01_guards/topology_linter.ts

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

## FILE: 07_meta/02_runners/doll_fork/DOLL_FORK_MATRIX.ts

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

## FILE: 07_meta/02_runners/doll_fork/DOLL_FORK_RUNNER.ts

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

## FILE: 07_meta/02_runners/DRIFT_WARDEN.ts

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

## FILE: 07_meta/02_runners/export_core.ts

```typescript
import { parse } from "jsr:@std/jsonc";
// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 69)
// Builds OMEGA_CORE_LOGIC.md from the active architecture graph.
// Guards against accidental export drift (tests/archive artifacts).

import { dirname, extname, join, normalize } from "node:path";
import { resolveVector } from "../01_guards/vector_decoder.ts";

const MANIFEST_PATH = "deno.jsonc";

const EXCLUDE_PATTERNS: RegExp[] = [
  /(^|\/)test_.*\.ts$/u,
  /(^|\/)03_tests\//u,
  /(^|\/)tests\//u,
  /(^|\/)DIMENSIONS\//u,
  /(^|\/)sandbox\//u,
  /(^|\/)relics\//u,
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
  const parsed = parse(raw).omega as ExportManifest;

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
  if (file.includes("07_meta/") || file.includes("03_tests/") || file.match(/(^|\/)test_.*\.ts$/u) || file.includes("tests/") || file.includes("reduction_core/") || file.includes("03_governance/03_tests/verification/")) return "SHADOW";
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

## FILE: 07_meta/02_runners/SHADOW_EVOLUTION_RUNNER.ts

```typescript
/**
 * SHADOW_EVOLUTION_RUNNER.ts
 * Automates the validation of semantic proposals against the OMEGA-64 Golden Traces.
 * Runs in a secure WebAssembly memory sandbox (DollFork) isolated from the main matrix.
 */

import { REDUCTION_CASES } from "../../03_governance/03_tests/verification/reduction_cases.ts";
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
      "./@07/02_runners/sandbox/PROPOSALS.json",
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
      "./@07/02_runners/sandbox/PROPOSALS.json",
    );
    const json = JSON.parse(data);
    json.proposals = (json.proposals || []).filter((p: any) => p.id !== id);
    await Deno.writeTextFile(
      "./@07/02_runners/sandbox/PROPOSALS.json",
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

      const sandboxPath = `./@07/02_runners/sandbox/relic_${proposal.id}.json`;
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

## FILE: 07_meta/04_transpilers/glyph_pretty.ts

```typescript
import { glyphSpecById } from "@07/04_transpilers/GlyphIR64.ts";
import type { GlyphTapeToken } from "./opcode_to_glyph.ts";

export const describeGlyphToken = (token: GlyphTapeToken): string => {
  const spec = token.glyphId === null ? null : glyphSpecById(token.glyphId);
  const glyphLabel = token.mapped && spec
    ? `${spec.mnemonic}[${spec.id}]`
    : `UNMAPPED(${token.opcodeMnemonic})`;
  const args = token.args.length > 0 ? ` args=[${token.args.join(",")}]` : "";
  const reductionRule = spec ? ` rule=${spec.reductionRuleRef}` : "";
  const energy = spec ? ` energy=${spec.energyCost}` : "";
  return `pc=${token.pc} opcode=${token.opcodeMnemonic} -> ${glyphLabel}${args}${energy}${reductionRule}`;
};

export const glyphTapeToLines = (tape: readonly GlyphTapeToken[]): string[] =>
  tape.map((token) => describeGlyphToken(token));

export const glyphTapeToPrettyText = (
  tape: readonly GlyphTapeToken[],
): string => glyphTapeToLines(tape).join("\n");

```

---

## FILE: 07_meta/04_transpilers/GlyphIR64.ts

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

## FILE: 07_meta/04_transpilers/opcode_to_glyph.ts

```typescript
import { RISC } from "@00/STATE_MATRIX.ts";
import { glyphSpecByLegacyOpcode } from "@07/04_transpilers/GlyphIR64.ts";

export type LegacyInstruction = {
  pc: number;
  opcode: number;
  opcodeMnemonic: string;
  length: number;
  args: number[];
};

export type GlyphTapeToken = LegacyInstruction & {
  glyphId: number | null;
  glyphMnemonic: string | null;
  mapped: boolean;
};

const OPCODE_NAMES = new Map<number, string>([
  [RISC.OP_NOP, "NOP"],
  [RISC.OP_SET, "SET"],
  [RISC.OP_GET, "GET"],
  [RISC.OP_PUT, "PUT"],
  [RISC.OP_ADD, "ADD"],
  [RISC.OP_SUB, "SUB"],
  [RISC.OP_JZ, "JZ"],
  [RISC.OP_JNZ, "JNZ"],
  [RISC.OP_JMP, "JMP"],
  [RISC.OP_REPLICATE, "REPLICATE"],
  [RISC.OP_SIGNAL, "SIGNAL"],
  [RISC.OP_BIND, "BIND"],
  [RISC.OP_SHARE, "SHARE"],
  [RISC.OP_TENSEGRITY, "TENSEGRITY"],
  [RISC.OP_COLLECTIVE, "COLLECTIVE"],
  [RISC.OP_ROLE, "ROLE"],
  [RISC.OP_BUILD, "BUILD"],
  [RISC.OP_SENSE, "SENSE"],
  [RISC.OP_SPORE_DRIVE, "SPORE_DRIVE"],
  [RISC.OP_ENTANGLE, "ENTANGLE"],
  [RISC.OP_PLUG, "PLUG"],
  [RISC.OP_RESOLVE, "RESOLVE"],
  [RISC.OP_SYSCALL, "SYSCALL"],
]);

const OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_NOP, 1],
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_PUT, 3],
  [RISC.OP_ADD, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_REPLICATE, 1],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_BIND, 1],
  [RISC.OP_SHARE, 3],
  [RISC.OP_PLUG, 3],
  [RISC.OP_TENSEGRITY, 4],
  [RISC.OP_COLLECTIVE, 4],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_SENSE, 3],
  [RISC.OP_SPORE_DRIVE, 1],
  [RISC.OP_ENTANGLE, 1],
  [RISC.OP_RESOLVE, 3],
  [RISC.OP_SYSCALL, 1],
]);

const opcodeName = (opcode: number): string =>
  OPCODE_NAMES.get(opcode) ?? `OP_0x${opcode.toString(16).toUpperCase()}`;

export const legacyOpcodeLength = (opcode: number): number =>
  OPCODE_LENGTHS.get(opcode) ?? 1;

export const decodeLegacyInstruction = (
  script: Uint8Array,
  pc: number,
): LegacyInstruction | null => {
  if (pc < 0 || pc >= script.length) return null;
  const opcode = script[pc] ?? RISC.OP_NOP;
  const length = legacyOpcodeLength(opcode);
  const args = Array.from(script.slice(pc + 1, pc + length));
  return {
    pc,
    opcode,
    opcodeMnemonic: opcodeName(opcode),
    length,
    args,
  };
};

type ScriptToGlyphOptions = {
  allowUnmapped?: boolean;
  maxSteps?: number;
};

export const scriptToGlyphTape = (
  script: Uint8Array,
  options: ScriptToGlyphOptions = {},
): GlyphTapeToken[] => {
  const allowUnmapped = options.allowUnmapped ?? false;
  const maxSteps = Math.max(1, Math.min(64, options.maxSteps ?? 64));
  const out: GlyphTapeToken[] = [];
  let pc = 0;
  let steps = 0;

  while (pc >= 0 && pc < script.length && steps < maxSteps) {
    const decoded = decodeLegacyInstruction(script, pc);
    if (!decoded) break;
    if (decoded.opcode === RISC.OP_NOP) break;

    const spec = glyphSpecByLegacyOpcode(decoded.opcode);
    if (!spec && !allowUnmapped) {
      throw new Error(
        `[opcode_to_glyph] unmapped legacy opcode at pc=${pc}: ${decoded.opcodeMnemonic}`,
      );
    }

    out.push({
      ...decoded,
      glyphId: spec?.id ?? null,
      glyphMnemonic: spec?.mnemonic ?? null,
      mapped: spec !== null,
    });

    pc += decoded.length;
    steps++;
  }

  return out;
};

```

---

## FILE: 07_meta/04_transpilers/REIFICATION_ACTION.ts

```typescript
// OMEGA-64 | REIFICATION_ACTION.ts | Stage 21: The Doll Fork
import { Relic } from "./relics/RELIC_CULTIVATION.ts";
import { LOGGER } from "@00";

/**
 * ReificationAction promotes a relic from the sandbox to the canonical GENESIS pool.
 */
export class ReificationAction {
  private genesisPath = "./@07/05_generators/GENESIS_REIFIED.ts";

  /**
   * Promotes a relic JSON file to the GENESIS_REIFIED.ts registry.
   */
  public async reify(relicId: string): Promise<void> {
    const sandboxPath = `./@07/02_runners/sandbox/relic_${relicId}.json`;

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

## FILE: 07_meta/05_generators/GENESIS_BOOT.ts

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

## FILE: 07_meta/05_generators/GENESIS_INCEPTOR.ts

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

## FILE: 07_meta/05_generators/GENESIS_REIFIED.ts

```typescript
// OMEGA-64 | GENESIS_REIFIED.ts | Cultivated Relics
export const REIFIED_PROGRAMS: Record<string, number[]> = {};

```

---


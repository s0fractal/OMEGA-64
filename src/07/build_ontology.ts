import { ensureDirSync, emptyDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse as parseYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";
import { walkSync } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { resolve, join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Load .env variables synchronously if available, ignoring missing keys
try {
  loadSync({ export: true });
} catch (e) {
  // Ignore missing vars error, defaults will be used
}

const CWD = Deno.cwd();

const SRC_ONTOLOGY_DIR = resolve(CWD, Deno.env.get("SRC_ONTOLOGY_DIR") || "src/ontology");
const GEN_DIR_TS = resolve(CWD, Deno.env.get("GEN_DIR_TS") || "src/_");
const GEN_DIR_RS = resolve(CWD, Deno.env.get("GEN_DIR_RS") || "src/00/sigma_core/src/ontology_gen");
const GEN_DIR_AS = resolve(CWD, Deno.env.get("GEN_DIR_AS") || "src/_as");

import { z } from "npm:zod@4.3.6";

const ALLOWED_TYPES = ["i32", "i64", "f32", "f64", "u8", "u16", "u32", "u64", "i16", "usize", "boolean", "bool", "void"] as const;

export const NodeTypeSchema = z.enum(["pure_fn", "module", "struct", "enum", "constants", "static_table", "memory_layout", "substrate_module", "documentation", "docs", "lore"]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const OntologyNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  description: z.string().optional(),
  deps: z.array(z.string()).nullable().default([]).transform(v => v === null ? [] : v),
  args: z.record(z.string(), z.string()).nullable().optional(),
  rsArgs: z.record(z.string(), z.string()).nullable().optional(),
  returns: z.string().nullable().optional(),
  asImports: z.array(z.string()).nullable().optional(),
  dataType: z.string().nullable().optional(),
  values: z.any().optional(),
  base_offset: z.string().nullable().optional(),
  regions: z.array(z.object({
    name: z.string(),
    size: z.any(),
    align: z.any(),
    offset: z.number().optional()
  })).nullable().optional(),
  vars: z.array(z.string()).nullable().default([]).transform(v => v === null ? [] : v),
  extra_symbols: z.array(z.string()).nullable().default([]).transform(v => v === null ? [] : v),
  optimization: z.enum(["inline", "hot", "cold"]).optional(),
  status: z.enum(["stable", "experimental", "deprecated"]).optional(),
  tests: z.array(z.any()).nullable().default([]).transform(v => v === null ? [] : v),
  tags: z.array(z.string()).nullable().default([]).transform(v => v === null ? [] : v),
  min_level: z.number().optional(),
  rust: z.string().optional(), // Raw rust code for substrate modules
});

const MIN_LEVEL_FOR_TAG: Record<string, number> = {
  "console": 4,
  "class": 5,
  "host": 6,
  "fs": 7,
};

export type OntologyNodeMeta = z.infer<typeof OntologyNodeSchema>;
interface TestDesc { inputs: any[]; expected: any; }

interface OntologyNode extends OntologyNodeMeta {
  rustCode?: string;
  tsCode?: string;
  asCode?: string;
  level: number;
  tests: any[];
  sourceFile?: string;
}

const ALLOWED_TYPES_RUNTIME = ["i32", "i64", "f32", "f64", "u8", "u16", "u32", "u64", "i16", "usize", "boolean", "bool", "void", "string", "any", "number"];

const nodes = new Map<string, OntologyNode>();
const extraSymbolsMap = new Map<string, string>();

try {
  for (const entry of walkSync(SRC_ONTOLOGY_DIR, { exts: [".md"], includeDirs: false })) {
    const raw = Deno.readTextFileSync(entry.path);
    
    // Parse YAML Frontmatter
    const yamlMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      console.warn(`[WARN] No YAML frontmatter found in ${entry.path}`);
      continue;
    }
    
    const yamlStr = yamlMatch[1];
    let meta: OntologyNodeMeta;
    try {
      meta = OntologyNodeSchema.parse(parseYaml(yamlStr));
    } catch (err: any) {
      console.error(`[FATAL] Schema validation failed for ${entry.path}:\n`, err.errors || err);
      Deno.exit(1);
    }
    
    if (meta.status === "deprecated") {
      console.warn(`[WARN] ⚠️ Node ${meta.id} (${entry.path}) is DEPRECATED.`);
    }
    
    const node: OntologyNode = {
      ...meta,
      tests: [],
      // Standardize the casing mapping from yaml schema
      base_offset: meta.base_offset,
      level: -1,
      sourceFile: entry.path.replace(SRC_ONTOLOGY_DIR, "").replace(/^\//, "")
    };

    if (meta.args) {
      for (const [key, val] of Object.entries(meta.args)) {
        node.args![key] = val as string;
      }
    }

    if (meta.tests && Array.isArray(meta.tests)) {
      for (const t of meta.tests) {
        if (Array.isArray(t) && t.length > 0) {
           const tCopy = [...t];
           const expected = tCopy.pop();
           node.tests!.push({ inputs: tCopy, expected });
        }
      }
    }

    if (node.type === "pure_fn") {
      // Validate types explicitly since Zod just checks strings here
      if (node.returns && !ALLOWED_TYPES_RUNTIME.includes(node.returns as any)) {
        console.error(`[FATAL] Invalid return type ${node.returns} in ${node.id}`);
        Deno.exit(1);
      }
      for (const [argName, argType] of Object.entries(node.args || {})) {
        if (!ALLOWED_TYPES_RUNTIME.includes(argType as any)) {
          console.error(`[FATAL] Invalid arg type ${argType} in ${node.id}`);
          Deno.exit(1);
        }
      }

      // Parse Code Blocks
      const rustMatch = raw.match(/```rust\n([\s\S]*?)```/);
      if (rustMatch) {
         node.rustCode = rustMatch[1].trim();
      } else if (!node.tags.includes("host") && !node.tags.includes("substrate")) {
         console.error(`[FATAL] Missing rust code block in pure_fn ${node.id}`);
         Deno.exit(1);
      }

      const tsMatch = raw.match(/```typescript\n([\s\S]*?)```/);
      if (!tsMatch) {
        console.error(`[FATAL] Missing typescript code block in pure_fn ${node.id}`);
        Deno.exit(1);
      }
      node.tsCode = tsMatch[1].trim();

      const asMatch = raw.match(/```(?:assemblyscript|assembly)\n([\s\S]*?)```/);
      if (asMatch) {
        node.asCode = asMatch[1].trim();
      }

    } else if (node.type === "module") {
      const tsMatch = raw.match(/```typescript\n([\s\S]*?)```/);
      if (tsMatch) node.tsCode = tsMatch[1].trim();

      const asMatch = raw.match(/```(?:assemblyscript|assembly)\n([\s\S]*?)```/);
      if (asMatch) node.asCode = asMatch[1].trim();

      const rustMatch = raw.match(/```rust\n([\s\S]*?)```/);
      if (rustMatch) node.rustCode = rustMatch[1].trim();

      if (!tsMatch && !asMatch && !rustMatch) {
        console.error(`[FATAL] Missing code block in module ${node.id}`);
        Deno.exit(1);
      }

    } else if (node.type === "static_table") {
      // Parse payload
      const payloadMatch = raw.match(/## payload:\s*(\[.*\])/);
      if (!payloadMatch) {
        console.error(`[FATAL] Missing payload array in static_table ${node.id}`);
        Deno.exit(1);
      }
      node.payload = JSON.parse(payloadMatch[1]);
    } else if (node.type === "substrate_module") {
      const rustMatch = raw.match(/```rust\n([\s\S]*?)```/);
      if (!rustMatch) {
        console.error(`[FATAL] Missing rust code block in substrate_module ${node.id}`);
        Deno.exit(1);
      }
      node.rust = rustMatch[1].trim();
    }

    if (node.extra_symbols) {
      for (const sym of node.extra_symbols) {
        extraSymbolsMap.set(sym, node.id);
      }
    }
    nodes.set(node.id, node);
  }
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) { throw e; }
}

// 2. Topological Sort (DAG)
function computeLevel(id: string, visited: Set<string>, stack: Set<string>): number {
  let node = nodes.get(id);
  if (!node) {
    const parentId = extraSymbolsMap.get(id);
    if (parentId) {
      node = nodes.get(parentId);
    }
  }

  if (!node) {
    console.error(`[FATAL] Dependency ${id} not found.`);
    Deno.exit(1);
  }

  if (stack.has(node.id)) {
    console.error(`[FATAL] Cyclic dependency detected involving ${id}`);
    Deno.exit(1);
  }

  if (visited.has(node.id)) return node.level;

  stack.add(node.id);
  
  let maxDepLevel = node.min_level !== undefined ? (node.min_level - 1) : -1;
  for (const dep of node.deps) {
    const depLevel = computeLevel(dep, visited, stack);
    maxDepLevel = Math.max(maxDepLevel, depLevel);
  }
  
  node.level = maxDepLevel + 1;
  stack.delete(node.id);
  visited.add(node.id);

  // Semantic Firewall Check
  for (const tag of node.tags) {
    const minLevel = MIN_LEVEL_FOR_TAG[tag];
    if (minLevel !== undefined && node.level < minLevel) {
      console.error(`[FATAL] Semantic Firewall Violation: Node '${node.id}' has tag '${tag}' which requires minimum causality level ${minLevel}, but resolved to level ${node.level}.`);
      Deno.exit(1);
    }
  }

  // Regex Heuristics (Fallback Firewall)
  if (node.tsCode) {
    if (/\bconsole\./.test(node.tsCode) && node.level < MIN_LEVEL_FOR_TAG["console"]) {
      console.error(`[FATAL] Semantic Firewall Violation: Un-tagged 'console' usage detected in Node '${node.id}' at level ${node.level}. Must be at least level ${MIN_LEVEL_FOR_TAG["console"]}. Add tags: ["console"] or remove side-effect.`);
      Deno.exit(1);
    }
    if (/\bclass\s/.test(node.tsCode) && node.level < MIN_LEVEL_FOR_TAG["class"]) {
      console.error(`[FATAL] Semantic Firewall Violation: Un-tagged 'class' usage detected in Node '${node.id}' at level ${node.level}. Must be at least level ${MIN_LEVEL_FOR_TAG["class"]}. Add tags: ["class"] or use pure functions.`);
      Deno.exit(1);
    }
  }

  // Determinism Firewall
  if (node.type === "pure_fn" && !(node.tags.includes("host") || node.tags.includes("substrate"))) {
    const forbiddenMath = /Math\.(sin|cos|tan|acos|asin|atan|exp|log|round|ceil|floor|random)\b/;
    for (const codeStr of [node.tsCode, node.asCode, node.rustCode]) {
      if (codeStr) {
        const match = codeStr.match(forbiddenMath);
        if (match) {
          console.error(`[FATAL] Determinism Breach in Node '${node.id}': Detected non-deterministic host math ('${match[0]}'). Pure functions must use integer math, LUTs, or bitwise ops. If this is intentional UI/Host logic, add 'host' to the node's tags.`);
          Deno.exit(1);
        }
      }
    }
  }

  return node.level;
}

const visited = new Set<string>();
for (const id of nodes.keys()) {
  computeLevel(id, visited, new Set<string>());
}

let maxLevel = -1;
for (const node of nodes.values()) {
  maxLevel = Math.max(maxLevel, node.level);
}

// 2.5: Causality and Symbol Validation Pass
const symbolToNodeId = new Map<string, string>();
for (const node of nodes.values()) {
  symbolToNodeId.set(node.id, node.id); // The node's ID is always an exported symbol
  
  if (node.type === "enum" || node.type === "constants") {
    for (const key of Object.keys(node.values || {})) {
      symbolToNodeId.set(key, node.id);
    }
  } else if (node.type === "memory_layout") {
    for (const region of node.regions || []) {
      symbolToNodeId.set(`${region.name}_OFFSET`, node.id);
      symbolToNodeId.set(`${region.name}_OFF`, node.id);
      
      // Legacy Aliases
      if (region.name === "EVOLUTION") symbolToNodeId.set("INTENT_OFFSET", node.id);
      if (region.name === "INSTRUCTIONS") symbolToNodeId.set("GENOMES_OFFSET", node.id);
      if (region.name === "ASCENSION_STATS_RESERVED") {
          symbolToNodeId.set("ASCENSION_STATS_OFFSET", node.id);
          symbolToNodeId.set("ASCENSION_STATS_OFF", node.id);
      }
      if (region.name === "HORMONES") {
          symbolToNodeId.set("HORMONE_OFFSET", node.id);
          symbolToNodeId.set("HORMONE_OFF", node.id);
      }
      if (region.name === "SPAWN_REQUESTS") {
          symbolToNodeId.set("SPAWN_GRID_OFF", node.id);
          symbolToNodeId.set("SPAWN_HEAD_OFF", node.id);
          symbolToNodeId.set("SPAWN_DATA_OFF", node.id);
      }
    }
    symbolToNodeId.set("LATTICE_MEMORY_END", node.id);
    symbolToNodeId.set("MIN_WASM_MEMORY_PAGES", node.id);
    symbolToNodeId.set("WASM_MEMORY_BYTES", node.id);
    // Register any extra symbols explicitly declared (memory_layout)
    for (const sym of (node.extra_symbols || [])) {
      symbolToNodeId.set(sym, node.id);
    }
  } else if (node.type === "module" || node.type === "pure_fn") {
    // Register module's explicitly declared exports
    for (const sym of (node.extra_symbols || [])) {
      symbolToNodeId.set(sym, node.id);
    }
  }
}

// Validate that every imported var exists and is causally valid
for (const node of nodes.values()) {
  if (!node.vars || node.vars.length === 0) continue;
  
  for (const v of node.vars) {
    const sourceNodeId = symbolToNodeId.get(v);
    if (!sourceNodeId) {
       console.error(`[FATAL] Missing Symbol Registration: Node '${node.id}' attempts to import '${v}' via 'vars', but no node exports this symbol. Verify spelling or add the missing node.`);
       Deno.exit(1);
    }
    
    const sourceNode = nodes.get(sourceNodeId);
    if (!sourceNode) continue; // Should be impossible but satisfy types

    // Causality validation: The node providing the symbol MUST belong to a strictly lower level.
    // If it is at the SAME level, TS output will generate an invalid import path (e.g., pulling from the same level's mod.ts before it's formed, or circular dependency).
    if (sourceNode.level >= node.level) {
       console.error(`[FATAL] Causality Violation in '${node.id}': Found import of '${v}' which is provided by '${sourceNode.id}' at causality level ${sourceNode.level}.`);
       console.error(`  -> '${node.id}' is currently resolved to level ${node.level}.`);
       console.error(`  -> FIX: '${node.id}' must be at a higher level than '${sourceNode.id}'. Add '${sourceNode.id}' to the 'deps' array of '${node.id}', or manually set a higher 'min_level'.`);
       Deno.exit(1);
    }
  }
}

// 3. Constant Evaluation Pre-Pass Removed (Native Compile-time Math)

// 4. File Emission
// Wipe the entire generation directory to prevent stale files from lingering
// if an ontology node changes causality level.
emptyDirSync(GEN_DIR_TS);
emptyDirSync(GEN_DIR_RS);
emptyDirSync(GEN_DIR_AS);
ensureDirSync(GEN_DIR_RS); // Need at least the root for Rust

function formatLevel(lvl: number) {
  return lvl.toString().padStart(2, "0");
}

function mapRsType(t: string): string {
  if (t === "usize") return "usize";
  if (t === "i32") return "i32";
  if (t === "boolean" || t === "bool") return "bool";
  if (t === "void") return "()";
  // Attempt to pass through custom types literally (e.g. `&[u8; 64]`)
  return t;
}

function mapTsType(t: string): string {
  if (t === "i32" || t === "u32" || t === "f32" || t === "f64" || t === "u8" || t === "i8" || t === "i16" || t === "u16" || t === "usize") return "number";
  if (t === "i64" || t === "u64") return "bigint";
  if (t === "boolean" || t === "bool") return "boolean";
  if (t === "void") return "void";
  return t;
}

for (const node of nodes.values()) {
  const lvlStr = formatLevel(node.level);
  const dirPathTs = `${GEN_DIR_TS}/${lvlStr}`;
  const dirPathRs = `${GEN_DIR_RS}/${lvlStr}`;
  const dirPathAs = `${GEN_DIR_AS}/${lvlStr}`;
  ensureDirSync(dirPathTs);
  ensureDirSync(dirPathRs);
  ensureDirSync(dirPathAs);

  // Skip code generation entirely for documentation nodes
  if (node.type === "documentation" || node.type === "docs" || node.type === "lore") {
    continue;
  }

  // Generate TS
  let tsOut = ``;
  
  // Imports for TS
  if (node.level > 0) {
    const prevLevel = formatLevel(node.level - 1);
    
    const depsAsSymbols = (node.deps || []).filter(dep => {
       const depNode = nodes.get(dep);
       if (!depNode) return true;
       // Non-exported struct types
       if (depNode.type === "constants" && depNode.id !== "VmProps") return false;
       if (depNode.type === "memory_layout") return false;
       if (depNode.type === "documentation" || depNode.type === "docs" || depNode.type === "lore") return false;
       // We must implicitly include modules, pure_fns, enums, etc. because layers rely on them
       return true;
    });

    const importsToPull = Array.from(new Set([...(node.vars || []), ...depsAsSymbols]));
    if (importsToPull.length > 0) {
      tsOut += `import { ${importsToPull.join(", ")} } from "@g${prevLevel}";\n`;
    }
  }
  tsOut += `\n`;

  // Code for TS
  switch (node.type) {
    case "static_table":
      tsOut += `export const ${node.id}: number[] = [${node.payload?.join(", ")}];\n`;
      break;
    case "enum":
      tsOut += `// Enum: ${node.id}\n`;
      for (const [k, v] of Object.entries(node.values || {})) {
        tsOut += `export const ${k}: ${mapTsType(node.dataType || "u8")} = ${v};\n`;
      }
      tsOut += `export const ${node.id} = {\n`;
      for (const [k, v] of Object.entries(node.values || {})) {
        let shortKey = k;
        if (node.id === "VmSys" && k.startsWith("SYS_")) shortKey = k.slice(4);
        if (node.id === "StructureTypes" && k.startsWith("STR_")) shortKey = k.slice(4);
        tsOut += `  ${shortKey}: ${v},\n`;
      }
      // Add legacy mapped keys to preserve coherence directly in the emitted objects
      if (node.id === "VmOpcodes") {
        tsOut += `  ENTANGLE: ${node.values!["OP_HEBB"] || 138},\n`;
        tsOut += `  ROLE: ${node.values!["OP_SECRETE_PLASMID"] || 170},\n`;
      }
      tsOut += `} as const;\n`;
      break;
    case "constants":
      tsOut += `// Constants: ${node.id}\n`;
      for (const [k, def] of Object.entries(node.values || {})) {
        const v = (def as any).expr !== undefined ? (def as any).expr : (def as any).value;
        const tsType = mapTsType((def as any).type as string || "i32");
        tsOut += `export const ${k}: ${tsType} = ${v};\n`;
      }
      if (node.id === "VmProps") {
        tsOut += `export const ${node.id} = {\n`;
        for (const [k, def] of Object.entries(node.values || {})) {
          const v = (def as any).expr !== undefined ? (def as any).expr : (def as any).value;
          tsOut += `  ${k}: ${v},\n`;
        }
        tsOut += `} as const;\n`;
      }
      break;
    case "memory_layout":
      tsOut += `// Memory Layout: ${node.id}\n`;
      let curOffExpr = node.base_offset || "0";
      
      for (const region of node.regions || []) {
        // Offset alignment logic applied via bitwise macro evaluations native to TS
        const align = region.align || 1;
        if (align > 1) {
            curOffExpr = `((${curOffExpr}) + ${align} - 1) & ~(${align} - 1)`;
        }
        tsOut += `export const ${region.name}_OFFSET: number = ${curOffExpr};\n`;
        tsOut += `export const ${region.name}_OFF: number = ${region.name}_OFFSET;\n`;
        
        // Backwards aliases
        if (region.name === "EVOLUTION") tsOut += `export const INTENT_OFFSET: number = ${region.name}_OFFSET;\n`;
        if (region.name === "INSTRUCTIONS") tsOut += `export const GENOMES_OFFSET: number = ${region.name}_OFFSET;\n`;
        if (region.name === "ASCENSION_STATS_RESERVED") {
            tsOut += `export const ASCENSION_STATS_OFFSET: number = ${region.name}_OFFSET;\n`;
            tsOut += `export const ASCENSION_STATS_OFF: number = ${region.name}_OFFSET;\n`;
        }
        if (region.name === "HORMONES") {
            tsOut += `export const HORMONE_OFFSET: number = ${region.name}_OFFSET;\n`;
            tsOut += `export const HORMONE_OFF: number = ${region.name}_OFFSET;\n`;
        }
        if (region.name === "SPAWN_REQUESTS") {
            tsOut += `export const SPAWN_GRID_OFF: number = ${region.name}_OFFSET;\n`;
            tsOut += `export const SPAWN_HEAD_OFF: number = ${region.name}_OFFSET;\n`;
            tsOut += `export const SPAWN_DATA_OFF: number = ${region.name}_OFFSET + 8;\n`;
        }
        
        // Next offset starts after this size
        curOffExpr = `${region.name}_OFFSET + (${region.size})`;
      }
      tsOut += `export const LATTICE_MEMORY_END: number = ${curOffExpr};\n`;
      tsOut += `export const MIN_WASM_MEMORY_PAGES: number = Math.max(2600, Math.ceil((${curOffExpr}) / (64 * 1024)));\n`;
      tsOut += `export const WASM_MEMORY_BYTES: number = MIN_WASM_MEMORY_PAGES * (64 * 1024);\n`;

      tsOut += `
export function validateMemoryLayout(memorySize: number) {
  const regions = [
${(node.regions || []).map((r, i, arr) => {
  const nextOffset = i < arr.length - 1 ? `${arr[i+1].name}_OFFSET` : `LATTICE_MEMORY_END`;
  return `    { name: "${r.name}", offset: ${r.name}_OFFSET, expectedSize: ${nextOffset} - ${r.name}_OFFSET }`;
}).join(",\n")}
  ];
  let ok = true;
  const errors: string[] = [];
  
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    if (i < regions.length - 1) {
      if (region.offset + region.expectedSize !== regions[i+1].offset) {
        ok = false;
        errors.push(\`Gap or overlap after \${region.name}. offset=\${region.offset} size=\${region.expectedSize} next=\${regions[i+1].offset}\`);
      }
    }
  }
  
  if (LATTICE_MEMORY_END > memorySize) {
    ok = false;
    errors.push(\`Memory size (\${memorySize}) is too small for lattice (\${LATTICE_MEMORY_END})\`);
  }

  return { ok, errors, regions, latticeEnd: LATTICE_MEMORY_END };
}\n`;
      break;
    case "pure_fn":
      if (node.tags.includes("host") || node.tags.includes("substrate")) {
          tsOut += node.tsCode! + "\n";
      } else {
          tsOut = ""; // Skip TS generation for pure WASM functions
      }
      break;
    case "substrate_module":
      // Substrate modules are purely raw passthrough blocks, bypass AST args.
      break;
    case "module":
      // module type acts similarly to host pure_fn, no wrapper emitted
      tsOut += node.tsCode! + "\n";
      break;
    default:
      // No TS output for other types like 'struct'
      break;
  }
  
  if (node.type !== "substrate_module") {
    if (tsOut.trim()) {
      Deno.writeTextFileSync(`${dirPathTs}/${node.id}.ts`, `// SSoT: file://${Deno.cwd()}/src/ontology/${node.sourceFile}\n` + tsOut);
    }
  }

  // Generate RS
  let rsOut = ``;
  if (node.type === "substrate_module") {
    rsOut = `// Substrate Node: ${node.id}
// Level: ${node.level}
${node.description ? `// ${node.description}\n` : ""}\n`;
    rsOut += `#![allow(unused_imports)]\n`;
    if (node.level > 0) {
      const prevLevel = formatLevel(node.level - 1);
      rsOut += `use super::super::L${prevLevel}::*;\n`;
    }
    rsOut += `\n`;
    
    if (node.rust) {
      rsOut += node.rust;
    }
  } else {
    rsOut = `#![allow(unused_imports)]\n`;
    if (node.level > 0) {
      const prevLevel = formatLevel(node.level - 1);
      rsOut += `use super::super::L${prevLevel}::*;\n`;
    }
    rsOut += `\n`;

    if (node.type === "static_table") {
      rsOut += `pub const ${node.id}: [${mapRsType(node.dataType!)}; ${node.payload?.length}] = [${node.payload?.join(", ")}];\n`;
    } else if (node.type === "enum") {
      rsOut += `// Enum: ${node.id}\n`;
      for (const [k, v] of Object.entries(node.values || {})) {
        rsOut += `pub const ${k}: ${node.dataType || "u8"} = ${v};\n`;
      }
    } else if (node.type === "constants") {
      rsOut += `// Constants: ${node.id}\n`;
      for (const [k, def] of Object.entries(node.values || {})) {
        const v = (def as any).expr !== undefined ? (def as any).expr : (def as any).value;
        const rsType = mapRsType((def as any).type as string);
        let valStr = v.toString();
        if ((def as any).expr !== undefined) {
          valStr = `(${valStr}) as ${rsType}`;
        } else if (rsType.startsWith("f") && Number.isInteger(v)) {
          valStr += ".0";
        }
        rsOut += `pub const ${k}: ${rsType} = ${valStr};\n`;
      }
    } else if (node.type === "module") {
      // If a module contains Rust code, output it verbatim without wrapping
      if (node.rustCode) {
        rsOut += node.rustCode + "\n";
      }
    } else if (node.type === "memory_layout") {
      rsOut += `// Memory Layout: ${node.id}\n`;
      let curOffExpr = node.base_offset || "0";
      
      for (const region of node.regions || []) {
        const align = region.align || 1;
        if (align > 1) {
            curOffExpr = `((${curOffExpr}) + ${align} - 1) & !(${align} - 1)`;
        }
        rsOut += `pub const ${region.name}_OFFSET: usize = ${curOffExpr};\n`;
        rsOut += `pub const ${region.name}_OFF: usize = ${region.name}_OFFSET;\n`;
        
        // Backcompat aliases
        if (region.name === "EVOLUTION") rsOut += `pub const INTENT_OFFSET: usize = ${region.name}_OFFSET;\n`;
        if (region.name === "INSTRUCTIONS") rsOut += `pub const GENOMES_OFFSET: usize = ${region.name}_OFFSET;\n`;
        if (region.name === "ASCENSION_STATS_RESERVED") {
            rsOut += `pub const ASCENSION_STATS_OFFSET: usize = ${region.name}_OFFSET;\n`;
            rsOut += `pub const ASCENSION_STATS_OFF: usize = ${region.name}_OFFSET;\n`;
        }
        if (region.name === "SPAWN_REQUESTS") {
            rsOut += `pub const SPAWN_GRID_OFF: usize = ${region.name}_OFFSET;\n`;
            rsOut += `pub const SPAWN_HEAD_OFF: usize = ${region.name}_OFFSET;\n`;
            rsOut += `pub const SPAWN_DATA_OFF: usize = ${region.name}_OFFSET + 8;\n`;
        }
        
        curOffExpr = `${region.name}_OFFSET + (${region.size})`;
      }
      rsOut += `pub const LATTICE_MEMORY_END: usize = ${curOffExpr};\n`;
    } else if (node.type === "pure_fn") {
      if (node.rustCode === undefined) {
         if (node.tags.includes("host") || node.tags.includes("substrate")) {
            // Valid intentional omission for pure JS/host functions
            rsOut += `// Host-only function: ${node.id} omitted from Rust build.\n`;
         } else {
            console.error(`[FATAL] Missing rust code block in pure_fn ${node.id} during emit.`);
            Deno.exit(1);
         }
      } else {
         let rsArgStr = "";
         if (node.rsArgs) {
           rsArgStr = Object.entries(node.rsArgs).map(([k, v]) => `${k}: ${v}`).join(", ");
         } else {
           const rsArr = Array.isArray(node.args) ? node.args : 
                      (node.args ? Object.entries(node.args).map(([k,v]) => ({name:k, type:v})) : []);
           rsArgStr = rsArr.map((a: any) => `${a.name}: ${mapRsType(a.type as string)}`).join(", ");
         }
         if (node.rustCode.trim().startsWith("unimplemented!")) {
            // Handled manually by a substrate module, do not generate duplicate wrapper
            rsOut += `// Omitted: manual substrate implementation\n`;
         } else {
             if (node.optimization === "inline") {
               rsOut += `#[inline(always)]\n`;
             } else if (node.optimization === "cold") {
               rsOut += `#[cold]\n`;
             }
             rsOut += `pub fn ${node.id}(${rsArgStr}) -> ${mapRsType(node.returns as string || "void")} {\n`;
             rsOut += node.rustCode.split("\n").map(l => `    ${l}`).join("\n");
             rsOut += `\n}\n`;
         }
      }
    }
  }

  Deno.writeTextFileSync(`${dirPathRs}/${node.id}.rs`, `// SSoT: file://${Deno.cwd()}/src/ontology/${node.sourceFile}\n` + rsOut);
  
  // Generate AS
  let asOut = ``;
  const importLevel = formatLevel(node.level > 0 ? node.level - 1 : 0);
  if (node.asImports) {
    node.asImports.forEach(i => asOut += `${i}\n`);
  }
  // Collect all host-only symbols: extra_symbols from nodes tagged host or standalone
  // Use a global registry so transitive dependencies are covered
  const hostOnlySymbols = new Set<string>();
  for (const dep of (node.deps || [])) {
    const depNode = nodes.get(dep);
    if (depNode) {
      for (const sym of (depNode.extra_symbols || [])) hostOnlySymbols.add(sym);
    }
  }
  // Additionally filter vars whose owning node (found by id in the graph) is host/standalone
  const importsToPull: string[] = (node.vars || []).filter(v => {
    if (hostOnlySymbols.has(v)) return false;
    const varNode = nodes.get(v);
    if (varNode && (varNode.tags.includes("host") || varNode.tags.includes("standalone"))) return false;
    return true;
  });
  if (node.deps) {
    for (const dep of node.deps) {
      const depNode = nodes.get(dep);
      if (depNode && (depNode.type === "pure_fn" || depNode.type === "static_table" || (depNode.type === "module" && depNode.asCode))) {
        if (!importsToPull.includes(dep)) importsToPull.push(dep);
      }
    }
  }
  if (importsToPull.length > 0) {
    asOut += `import { ${importsToPull.join(", ")} } from "../${importLevel}/mod";\n`;
  }
  asOut += `\n`;

  if (node.type === "enum" || node.type === "constants" || node.type === "memory_layout" || node.type === "static_table") {
    const lines = tsOut.split("\n").filter(l => l.startsWith("export const") && !l.includes("{"));
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("MAX_ATOMS") && !line.includes("OFFSET")) {
           line = line.replace("number", "i32");
        }
        // AS specific overrides
        if (line.includes("MIN_WASM_MEMORY_PAGES") || line.includes("WASM_MEMORY_BYTES")) {
            line = line.replace("number", "i32");
            if (line.includes("MIN_WASM_MEMORY_PAGES")) {
                line = line.replace("Math.ceil(", "<i32>Math.ceil(").replace("Math.max(", "<i32>Math.max(");
            }
        } else if (line.includes("OFFSET") && !line.includes("number[]")) { // prevent generic regex matching arrays
            line = line.replace("number", "usize");
        } else if (line.includes("number[]")) {
            line = line.replace("number[]", "StaticArray<i32>");
        } else if (line.includes("number")) {
           // For TS it has 'number', in AS it needs specified types. Let's infer loosely
           const isU8 = /opcodes|props|types|roles/i.test(node.id);
           line = line.replace(/\bnumber\b/g, isU8 ? "u8" : "i32");
        }
        asOut += line + "\n";
    }
  } else if (node.type === "pure_fn") {
    const arr = Array.isArray(node.args) ? node.args : 
               (node.args ? Object.entries(node.args).map(([k,v]) => ({name:k, type:v})) : []);
    
    // Use assemblyscript code block if available, fallback to typescript code logic
    const logicCode = node.asCode || node.tsCode;
    const asArgStr = arr.map((a: any) => `${a.name}: ${a.type === 'boolean' ? 'bool' : a.type}`).join(", ");
    const asRet = (node.returns === 'boolean' || node.returns === 'bool') ? 'bool' : node.returns;
    const inlineDirective = node.optimization === "inline" ? "@inline\n" : (node.optimization === "cold" ? "" : "@inline\n"); // Default inline unless specified cold
    asOut += `${inlineDirective}export function ${node.id}(${asArgStr}): ${asRet} {\n${logicCode}\n}\n`;
  }
  
  if (node.type !== "substrate_module") {
    if (node.tags.includes("host") || node.tags.includes("substrate")) {
        Deno.writeTextFileSync(`${dirPathAs}/${node.id}.ts`, `// Host-only module: ${node.id} omitted from AssemblyScript build.\n`);
    } else if (node.type === "module" && node.asCode) {
        Deno.writeTextFileSync(`${dirPathAs}/${node.id}.ts`, `// SSoT: file://${Deno.cwd()}/src/ontology/${node.sourceFile}\n` + node.asCode);
    } else {
        Deno.writeTextFileSync(`${dirPathAs}/${node.id}.ts`, `// SSoT: file://${Deno.cwd()}/src/ontology/${node.sourceFile}\n` + asOut);
    }
  }
}

// 4. Aggregation (Facades)
let mainTsOut = `// AUTOGENERATED FACADE\n// deno-lint-ignore-file camelcase\n`;
let mainRsOut = `// AUTOGENERATED FACADE\n#[allow(non_snake_case)]\n#[allow(non_camel_case_types)]\n\n`;
let mainAsOut = `// AUTOGENERATED AS FACADE\n`;

for (let lvl = 0; lvl <= maxLevel; lvl++) {
  const lvlStr = formatLevel(lvl);
  const dirPathTs = `${GEN_DIR_TS}/${lvlStr}`;
  const dirPathRs = `${GEN_DIR_RS}/${lvlStr}`;
  const dirPathAs = `${GEN_DIR_AS}/${lvlStr}`;
  let lvlTsOut = `// AUTOGENERATED LEVEL FACADE\n// deno-lint-ignore-file camelcase\n`;
  let lvlRsOut = `// AUTOGENERATED LEVEL FACADE\n\n`;
  let lvlAsOut = `// AUTOGENERATED AS LEVEL FACADE\n`;
  
  if (lvl > 0) {
    const prevLvlStr = formatLevel(lvl - 1);
    lvlTsOut += `export * from "@g${prevLvlStr}";\n`;
    lvlRsOut += `pub use super::L${prevLvlStr}::*;\n\n`;
    lvlAsOut += `export * from "../${prevLvlStr}/mod";\n`;
  }

  const levelNodes = Array.from(nodes.values()).filter(n => n.level === lvl && n.type !== "documentation" && n.type !== "docs" && n.type !== "lore");
  
  const levelNodesNoSubstrate = levelNodes.filter(n => n.type !== "substrate_module");
  const levelNodesTs = levelNodesNoSubstrate.filter(n => {
    if (n.tags.includes("standalone")) return false;
    if (n.type === "pure_fn") {
      return n.tags.includes("host") || n.tags.includes("substrate");
    }
    return true;
  });
  
  // TS Mod file generation
  const tsModExports = levelNodesTs.map(n => {
    if (n.type === "enum" || n.type === "constants" || n.type === "memory_layout" || n.type === "static_table" || n.type === "module") {
      return `export * from "./${n.id}.ts";`;
    } else {
      return `export { ${n.id} } from "./${n.id}.ts";`;
    }
  }).join("\n");
  if (tsModExports) lvlTsOut += tsModExports + "\n";
  Deno.writeTextFileSync(`${dirPathTs}/mod.ts`, lvlTsOut);

  // RS Mod file generation
  const levelNodesRs = levelNodes.filter(n => !n.tags.includes("standalone"));
  const rsModExports = levelNodesRs.map(n => {
    // Substrate modules are purely rust, they are always included.
    return `#[path = "${n.id}.rs"]\npub mod ${n.id};\npub use ${n.id}::*;`;
  }).join("\n");
  if (rsModExports) lvlRsOut += rsModExports + "\n";
  Deno.writeTextFileSync(`${dirPathRs}/mod.rs`, lvlRsOut);

  // AS Mod file generation
  const levelNodesAs = levelNodes.filter(n => !n.tags.includes("standalone") && n.type !== "substrate_module" && !n.tags.includes("host") && !n.tags.includes("substrate"));
  const asModExports = levelNodesAs.map(n => {
    if (n.type === "enum" || n.type === "constants" || n.type === "memory_layout" || n.type === "static_table" || n.type === "module") {
      return `export * from "./${n.id}";`;
    } else {
      return `export { ${n.id} } from "./${n.id}";`;
    }
  }).join("\n");
  if (asModExports) lvlAsOut += asModExports + "\n";
  Deno.writeTextFileSync(`${dirPathAs}/mod.ts`, lvlAsOut);
  
  mainTsOut += `export * from "./${lvlStr}/mod.ts";\n`;
  mainRsOut += `#[path = "${lvlStr}/mod.rs"]\npub mod L${lvlStr};\n`;
  mainAsOut += `export * from "./${lvlStr}/mod";\n`;
}

// Re-export core topological state that lives outside the pure DAG
const resolveSysPath = (id: string) => {
  const n = nodes.get(id);
  return n ? `../_/${formatLevel(n.level)}/${id}.ts` : `../_/00/${id}.ts`;
};

mainTsOut += `const envAsDir = Deno.env.get("GEN_DIR_AS") || "src/_as";\n`;
mainTsOut += `const envAsName = Deno.env.get("AS_WASM_NAME") || "release.wasm";\n`;
mainTsOut += `const wasmFile = envAsDir.endsWith("/") ? envAsDir + envAsName : envAsDir + "/" + envAsName;\n`;
mainTsOut += `export const AS_WASM_PATH = new URL(wasmFile, import.meta.url.replace("src/_/mod.ts", ""));\n`;

mainAsOut += `// AS_WASM_PATH omitted as it is host-specific\n`;

Deno.writeTextFileSync(`${GEN_DIR_TS}/mod.ts`, mainTsOut);
Deno.writeTextFileSync(`${GEN_DIR_RS}/mod.rs`, mainRsOut);
Deno.writeTextFileSync(`${GEN_DIR_AS}/mod.ts`, mainAsOut);

// 5. Emission of tests
const testsDir = `${GEN_DIR_TS}/tests`;
ensureDirSync(testsDir);
for (const node of nodes.values()) {
  if (node.type === "pure_fn" && node.tests && node.tests.length > 0) {
    if (node.tags && (node.tags.includes("host") || node.tags.includes("substrate"))) {
      let testOut = `import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";\n`;
      testOut += `import { ${node.id} } from "../${formatLevel(node.level)}/${node.id}.ts";\n\n`;
      
      testOut += `Deno.test("Ontology Contract: ${node.id}", () => {\n`;
      for (let i = 0; i < node.tests.length; i++) {
          const t = node.tests[i];
          const args = t.inputs.join(", ");
          testOut += `  assertEquals(${node.id}(${args}), ${t.expected}, "Test case ${i} failed: fn(${args}) !== ${t.expected}");\n`;
      }
      testOut += `});\n`;
      Deno.writeTextFileSync(`${testsDir}/${node.id}.test.ts`, testOut);
    }
  }
}

console.log(`[Genesis Builder] Successfully compiled ontology into ${nodes.size} atoms and ${maxLevel + 1} Causality Layers.`);

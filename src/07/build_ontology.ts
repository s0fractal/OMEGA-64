import { ensureDirSync, emptyDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse as parseYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";
import { walkSync } from "https://deno.land/std@0.224.0/fs/walk.ts";

const SRC_ONTOLOGY_DIR = new URL("../ontology", import.meta.url).pathname;
const GEN_DIR_TS = new URL("../_", import.meta.url).pathname;
const GEN_DIR_RS = new URL("../00/sigma_core/src/ontology_gen", import.meta.url).pathname;
const GEN_DIR_AS = new URL("../_as", import.meta.url).pathname;

import { z } from "npm:zod@4.3.6";

const ALLOWED_TYPES = ["i32", "i64", "f32", "f64", "u8", "u16", "u32", "u64", "i16", "usize", "boolean", "bool", "void"] as const;

export const NodeTypeSchema = z.enum(["pure_fn", "struct", "enum", "constants", "static_table", "memory_layout", "substrate_module"]);
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
  optimization: z.enum(["inline", "hot", "cold"]).optional(),
  status: z.enum(["stable", "experimental", "deprecated"]).optional(),
  tests: z.array(z.any()).nullable().default([]).transform(v => v === null ? [] : v),
  rust: z.string().optional(), // Raw rust code for substrate modules
});

export type OntologyNodeMeta = z.infer<typeof OntologyNodeSchema>;

interface ArgDesc { name: string; type: string; }
interface TestDesc { inputs: any[]; expected: any; }

interface OntologyNode extends OntologyNodeMeta {
  payload?: any[];
  rustCode?: string;
  tsCode?: string;
  asCode?: string;
  level: number;
}

const ALLOWED_TYPES_RUNTIME = ["i32", "i64", "f32", "f64", "u8", "u16", "u32", "u64", "i16", "usize", "boolean", "bool", "void"];

const nodes = new Map<string, OntologyNode>();

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
      level: -1
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
      if (!rustMatch) {
        console.error(`[FATAL] Missing rust code block in pure_fn ${node.id}`);
        Deno.exit(1);
      }
      node.rustCode = rustMatch[1].trim();

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

    nodes.set(node.id, node);
  }
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) { throw e; }
}

// 2. Topological Sort (DAG)
function computeLevel(id: string, visited: Set<string>, stack: Set<string>): number {
  const node = nodes.get(id);
  if (!node) {
    console.error(`[FATAL] Dependency ${id} not found.`);
    Deno.exit(1);
  }

  if (stack.has(id)) {
    console.error(`[FATAL] Cyclic dependency detected involving ${id}`);
    Deno.exit(1);
  }

  if (visited.has(id)) return node.level;

  stack.add(id);
  
  let maxDepLevel = -1;
  for (const dep of node.deps) {
    const depLevel = computeLevel(dep, visited, stack);
    maxDepLevel = Math.max(maxDepLevel, depLevel);
  }
  
  node.level = maxDepLevel + 1;
  stack.delete(id);
  visited.add(id);
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

for (const node of nodes.values()) {
  const lvlStr = formatLevel(node.level);
  const dirPathTs = `${GEN_DIR_TS}/${lvlStr}`;
  const dirPathRs = `${GEN_DIR_RS}/${lvlStr}`;
  const dirPathAs = `${GEN_DIR_AS}/${lvlStr}`;
  ensureDirSync(dirPathTs);
  ensureDirSync(dirPathRs);
  ensureDirSync(dirPathAs);

  // Generate TS
  let tsOut = ``;
  
  // Imports for TS
  if (node.level > 0) {
    const prevLevel = formatLevel(node.level - 1);
    if (node.vars && node.vars.length > 0) {
      tsOut += `import { ${node.vars.join(", ")} } from "../${prevLevel}/mod.ts";\n`;
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
        tsOut += `export const ${k}: ${node.dataType || "u8"} = ${v};\n`;
      }
      break;
    case "constants":
      tsOut += `// Constants: ${node.id}\n`;
      for (const [k, def] of Object.entries(node.values || {})) {
        const v = (def as any).expr !== undefined ? (def as any).expr : (def as any).value;
        const tsType = ((def as any).type === "usize" || (def as any).type === "i32" || (def as any).type === "u8") ? "number" : (def as any).type;
        tsOut += `export const ${k}: ${tsType} = ${v};\n`;
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
      const nodeArgsArr = Array.isArray(node.args) ? node.args : 
                 (node.args ? Object.entries(node.args).map(([k,v]) => ({name:k, type:v})) : []);
      const nodeArgStr = nodeArgsArr.map((a: any) => `${a.name}: ${a.type}`).join(", ");
      tsOut += `export function ${node.id}(${nodeArgStr}): ${node.returns} {\n`;
      tsOut += node.tsCode!.split("\n").map(l => `  ${l}`).join("\n");
      tsOut += `\n}\n`;
      break;
    case "substrate_module":
      // Substrate modules are purely raw passthrough blocks, bypass AST args.
      break;
    default:
      // No TS output for other types like 'struct'
      break;
  }
  
  if (node.type !== "substrate_module") {
    Deno.writeTextFileSync(`${dirPathTs}/${node.id}.ts`, tsOut);
  }

  // Generate RS
  let rsOut = ``;
  if (node.type === "substrate_module") {
    rsOut = `// Substrate Node: ${node.id}
// Level: ${node.level}
${node.description ? `// ${node.description}\n` : ""}\n`;
    rsOut += `#[allow(unused_imports)]\n`;
    if (node.level > 0) {
      const prevLevel = formatLevel(node.level - 1);
      rsOut += `use super::super::L${prevLevel}::*;\n`;
    }
    rsOut += `\n`;
    
    if (node.rust) {
      rsOut += node.rust;
    }
  } else {
    rsOut = `#[allow(unused_imports)]\n`;
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
      let rsArgStr = "";
      if (node.rsArgs) {
        rsArgStr = Object.entries(node.rsArgs).map(([k, v]) => `${k}: ${v}`).join(", ");
      } else {
        const rsArr = Array.isArray(node.args) ? node.args : 
                   (node.args ? Object.entries(node.args).map(([k,v]) => ({name:k, type:v})) : []);
        rsArgStr = rsArr.map((a: any) => `${a.name}: ${mapRsType(a.type as string)}`).join(", ");
      }
      if (node.optimization === "inline") {
        rsOut += `#[inline(always)]\n`;
      }
      rsOut += `pub fn ${node.id}(${rsArgStr}) -> ${mapRsType(node.returns!)} {\n`;
      rsOut += node.rustCode!.split("\n").map(l => `    ${l}`).join("\n");
      rsOut += `\n}\n`;
    }
  }

  Deno.writeTextFileSync(`${dirPathRs}/${node.id}.rs`, rsOut);
  
  // Generate AS
  let asOut = ``;
  const importLevel = formatLevel(node.level > 0 ? node.level - 1 : 0);
  if (node.asImports) {
    node.asImports.forEach(i => asOut += `${i}\n`);
  }
  const importsToPull: string[] = [...(node.vars || [])];
  if (node.deps) {
    for (const dep of node.deps) {
      const depNode = nodes.get(dep);
      if (depNode && (depNode.type === "pure_fn" || depNode.type === "static_table")) {
        if (!importsToPull.includes(dep)) importsToPull.push(dep);
      }
    }
  }
  if (importsToPull.length > 0) {
    asOut += `import { ${importsToPull.join(", ")} } from "../${importLevel}/mod";\n`;
  }
  asOut += `\n`;

  if (node.type === "enum" || node.type === "constants" || node.type === "memory_layout" || node.type === "static_table") {
    const lines = tsOut.split("\n").filter(l => l.startsWith("export const"));
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
           line = line.replace(/\bnumber\b/g, (node.id.includes("OPCODES") || node.id.includes("PROPS") || node.id.includes("TYPES")) ? "u8" : "i32");
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
    Deno.writeTextFileSync(`${dirPathAs}/${node.id}.ts`, asOut);
  }
}

// 4. Aggregation (Facades)
let mainTsOut = `// AUTOGENERATED FACADE\n// deno-lint-ignore-file camelcase non-constant-macrom-case\n`;
let mainRsOut = `// AUTOGENERATED FACADE\n#[allow(non_snake_case)]\n#[allow(non_camel_case_types)]\n\n`;
let mainAsOut = `// AUTOGENERATED AS FACADE\n`;

for (let lvl = 0; lvl <= maxLevel; lvl++) {
  const lvlStr = formatLevel(lvl);
  const dirPathTs = `${GEN_DIR_TS}/${lvlStr}`;
  const dirPathRs = `${GEN_DIR_RS}/${lvlStr}`;
  const dirPathAs = `${GEN_DIR_AS}/${lvlStr}`;
  let lvlTsOut = `// AUTOGENERATED LEVEL FACADE\n// deno-lint-ignore-file camelcase non-constant-macrom-case\n`;
  let lvlRsOut = `// AUTOGENERATED LEVEL FACADE\n\n`;
  let lvlAsOut = `// AUTOGENERATED AS LEVEL FACADE\n`;
  
  if (lvl > 0) {
    const prevLvlStr = formatLevel(lvl - 1);
    lvlTsOut += `export * from "../${prevLvlStr}/mod.ts";\n`;
    lvlRsOut += `pub use super::L${prevLvlStr}::*;\n\n`;
    lvlAsOut += `export * from "../${prevLvlStr}/mod";\n`;
  }

  const levelNodes = Array.from(nodes.values()).filter(n => n.level === lvl);
  
  const levelNodesNoSubstrate = levelNodes.filter(n => n.type !== "substrate_module");
  
  // TS Mod file generation
  const tsModExports = levelNodesNoSubstrate.map(n => {
    if (n.type === "enum" || n.type === "constants" || n.type === "memory_layout" || n.type === "static_table") {
      return `export * from "./${n.id}.ts";`;
    } else {
      return `export { ${n.id} } from "./${n.id}.ts";`;
    }
  }).join("\n");
  if (tsModExports) lvlTsOut += tsModExports + "\n";
  Deno.writeTextFileSync(`${dirPathTs}/mod.ts`, lvlTsOut);

  // RS Mod file generation
  const rsModExports = levelNodes.map(n => {
    // Substrate modules are purely rust, they are always included.
    return `#[path = "${n.id}.rs"]\npub mod ${n.id};\npub use ${n.id}::*;`;
  }).join("\n");
  if (rsModExports) lvlRsOut += rsModExports + "\n";
  Deno.writeTextFileSync(`${dirPathRs}/mod.rs`, lvlRsOut);

  // AS Mod file generation
  const asModExports = levelNodesNoSubstrate.map(n => {
    if (n.type === "enum" || n.type === "constants" || n.type === "memory_layout" || n.type === "static_table") {
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
mainTsOut += `export * from "../00/STATE_MATRIX.ts";\n`;
mainTsOut += `export * from "../00/LOGGER.ts";\n`;
mainTsOut += `export * from "../00/SHIMS.ts";\n`;
mainTsOut += `export * from "../00/ATOM_INDEX.ts";\n`;
mainTsOut += `export * from "../00/STATE_SNAPSHOT.ts";\n`;
mainTsOut += `export * from "../00/ENV_PARSE.ts";\n`;
mainTsOut += `export * from "../00/PRNG.ts";\n`;
mainTsOut += `export { WASM_PATH } from "../00/mod.ts";\n`;

Deno.writeTextFileSync(`${GEN_DIR_TS}/mod.ts`, mainTsOut);
Deno.writeTextFileSync(`${GEN_DIR_RS}/mod.rs`, mainRsOut);
Deno.writeTextFileSync(`${GEN_DIR_AS}/mod.ts`, mainAsOut);

// 5. Emission of tests
const testsDir = `${GEN_DIR_TS}/tests`;
ensureDirSync(testsDir);
for (const node of nodes.values()) {
  if (node.type === "pure_fn" && node.tests && node.tests.length > 0) {
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

console.log(`[Genesis Builder] Successfully compiled ontology into ${nodes.size} atoms and ${maxLevel + 1} Causality Layers.`);

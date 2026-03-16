import { parse as parseYaml, stringify as stringifyYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

const CWD = Deno.cwd();
const SRC_ONTOLOGY_DIR = resolve(CWD, "src/ontology");
const TYPES_PATH = resolve(SRC_ONTOLOGY_DIR, "core/TYPES.md");

function extractTypes(tsCode: string): { types: string[]; names: string[]; remainingTs: string } {
  const extractedTypes: string[] = [];
  const extractedNames: string[] = [];
  let remainingTs = tsCode;

  // Find all export type|interface blocks
  const regex = /export\s+(?:type|interface)\s+(\w+)/g;
  let match;
  const blocksToProcess: { name: string; startIdx: number }[] = [];

  while ((match = regex.exec(tsCode)) !== null) {
    blocksToProcess.push({ name: match[1], startIdx: match.index });
  }

  // Sort backwards to avoid index shifts when removing
  for (const block of blocksToProcess.reverse()) {
    const startIdx = block.startIdx;
    let endIdx = -1;
    let braceCount = 0;
    let foundFirstBrace = false;

    for (let i = startIdx; i < tsCode.length; i++) {
      const char = tsCode[i];
      if (char === "{") {
        braceCount++;
        foundFirstBrace = true;
      } else if (char === "}") {
        braceCount--;
      }

      if (foundFirstBrace && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
      
      if (!foundFirstBrace && char === ";" && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }

    if (endIdx !== -1) {
      const fullBlock = tsCode.substring(startIdx, endIdx);
      extractedTypes.push(fullBlock.trim());
      extractedNames.push(block.name);
      
      const pre = remainingTs.substring(0, startIdx);
      const post = remainingTs.substring(endIdx);
      remainingTs = (pre.trimEnd() + "\n" + post.trimStart()).trim();
    }
  }

  return { types: extractedTypes.reverse(), names: extractedNames.reverse(), remainingTs };
}

function refactorFile(filePath: string, typesMdContent: { frontmatter: any, tsCode: string }) {
  const raw = Deno.readTextFileSync(filePath);
  const yamlMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!yamlMatch) return;

  const yamlStr = yamlMatch[1];
  const frontmatter = parseYaml(yamlStr) as any;
  
  const tsMatch = raw.match(/```typescript\n([\s\S]*?)```/);
  if (!tsMatch) return;

  const tsCode = tsMatch[1];
  const { types, names, remainingTs } = extractTypes(tsCode);

  if (types.length === 0) {
    console.log(`[SKIP] No types found in ${filePath}`);
    return;
  }

  console.log(`[REFACTOR] Found ${types.length} types in ${filePath}: ${names.join(", ")}`);

  // 1. Add types to TYPES.md
  for (let i = 0; i < types.length; i++) {
    const typeBlock = types[i];
    const name = names[i];
    
    if (!typesMdContent.tsCode.includes(`export interface ${name}`) && 
        !typesMdContent.tsCode.includes(`export type ${name}`)) {
      typesMdContent.tsCode += `\n\n${typeBlock}`;
      if (!typesMdContent.frontmatter.extra_symbols.includes(name)) {
        typesMdContent.frontmatter.extra_symbols.push(name);
      }
    }
  }

  // 2. Update source file frontmatter
  if (!frontmatter.deps) frontmatter.deps = [];
  if (!frontmatter.deps.includes("TYPES")) {
    frontmatter.deps.push("TYPES");
  }

  if (!frontmatter.vars) frontmatter.vars = [];
  for (const name of names) {
    if (!frontmatter.vars.includes(name)) {
      frontmatter.vars.push(name);
    }
  }

  // 3. Reconstruct source file
  const newYaml = stringifyYaml(frontmatter).trim();
  const newContent = `---\n${newYaml}\n---\n\n### TypeScript\n\n\`\`\`typescript\n${remainingTs}\n\`\`\`\n`;
  Deno.writeTextFileSync(filePath, newContent);
}

// Main Execution - Target specific file for dry run
const typesMdRaw = Deno.readTextFileSync(TYPES_PATH);
const typesMdYamlMatch = typesMdRaw.match(/^---\n([\s\S]*?)\n---/);
const typesMdTsMatch = typesMdRaw.match(/```typescript\n([\s\S]*?)```/);

if (!typesMdYamlMatch || !typesMdTsMatch) {
  console.error("Could not parse TYPES.md");
  Deno.exit(1);
}

const typesMdContent = {
  frontmatter: parseYaml(typesMdYamlMatch[1]) as any,
  tsCode: typesMdTsMatch[1].trim()
};

const TARGET_FILE = Deno.args[0];
if (!TARGET_FILE) {
  console.error("Please provide a file to refactor");
  Deno.exit(1);
}

refactorFile(resolve(CWD, TARGET_FILE), typesMdContent);

// Write back TYPES.md
const finalTypesYaml = stringifyYaml(typesMdContent.frontmatter).trim();
const finalTypesContent = `---\n${finalTypesYaml}\n---\n\n### TypeScript\n\n\`\`\`typescript\n${typesMdContent.tsCode}\n\`\`\`\n`;
Deno.writeTextFileSync(TYPES_PATH, finalTypesContent);

console.log("[OK] Auto-refactoring complete.");

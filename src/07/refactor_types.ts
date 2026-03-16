import { parse as parseYaml, stringify as stringifyYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";
import { walkSync } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

const CWD = Deno.cwd();
const SRC_ONTOLOGY_DIR = resolve(CWD, "src/ontology");
const TYPES_PATH = resolve(SRC_ONTOLOGY_DIR, "core/TYPES.md");

function extractTypes(tsCode: string): { types: string[]; names: string[]; remainingTs: string } {
  const extractedTypes: string[] = [];
  const extractedNames: string[] = [];
  let currentTs = tsCode;

  // Use a more restrictive regex to avoid matches in comments or strings
  // Must start at beginning of line (optional whitespace)
  const regex = /^\s*(?:export\s+)?(type|interface)\s+([A-Z]\w+)/gm;
  
  while (true) {
    const match = regex.exec(currentTs);
    if (!match) break;

    const startIdx = match.index;
    const name = match[2];
    
    // Safety check: skip common false positives
    if (["Role", "State", "Account", "Logic"].includes(name) && !currentTs.includes(`${name} = {`) && !currentTs.includes(`${name} {`)) {
        continue;
    }

    let endIdx = -1;
    let braceCount = 0;
    let foundFirstBrace = false;

    for (let i = startIdx; i < currentTs.length; i++) {
        const char = currentTs[i];
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

    if (endIdx === -1) {
        // Look for next newline if no braces or semicolon
        const nextNewline = currentTs.indexOf("\n", startIdx);
        if (nextNewline !== -1) endIdx = nextNewline + 1;
        else endIdx = currentTs.length;
    }

    if (endIdx !== -1) {
      let fullBlock = currentTs.substring(startIdx, endIdx).trim();
      
      // Cleanup the block if it's mostly empty or invalid
      if (fullBlock.length < 10) continue; 

      if (!fullBlock.startsWith("export ")) {
          fullBlock = "export " + fullBlock;
      }

      extractedTypes.push(fullBlock);
      extractedNames.push(name);
      
      const pre = currentTs.substring(0, startIdx);
      const post = currentTs.substring(endIdx);
      currentTs = (pre.trimEnd() + "\n" + post.trimStart()).trim();
      
      // Reset regex for next search on modified string
      regex.lastIndex = 0;
    } else {
        break; 
    }
  }

  // Final cleanup
  currentTs = currentTs.replace(/;\s*;/g, ";").replace(/\n{3,}/g, "\n\n").trim();
  return { types: extractedTypes, names: extractedNames, remainingTs: currentTs };
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

  let changed = false;

  if (types.length > 0) {
    console.log(`[REFACTOR] Found ${types.length} types in ${filePath}: ${names.join(", ")}`);
    changed = true;

    for (let i = 0; i < types.length; i++) {
        const typeBlock = types[i];
        const name = names[i];
        
        const alreadyExistsInTypes = typesMdContent.tsCode.split("\n").some(line => 
          line.trim().startsWith(`export interface ${name}`) || 
          line.trim().startsWith(`export type ${name}`)
        );

        if (!alreadyExistsInTypes) {
          typesMdContent.tsCode += `\n\n${typeBlock}`;
          if (!typesMdContent.frontmatter.extra_symbols.includes(name)) {
            typesMdContent.frontmatter.extra_symbols.push(name);
          }
        }

        if (!frontmatter.vars) frontmatter.vars = [];
        if (!frontmatter.vars.includes(name)) {
          frontmatter.vars.push(name);
        }
    }
  }

  // Sync frontmatter with TYPES.md
  if (frontmatter.extra_symbols) {
    const symbolsToRemove = frontmatter.extra_symbols.filter((s: string) => 
      typesMdContent.frontmatter.extra_symbols.includes(s) && s !== frontmatter.id
    );
    
    if (symbolsToRemove.length > 0) {
      console.log(`[CLEANUP] Removing ${symbolsToRemove.length} types from extra_symbols in ${filePath}`);
      frontmatter.extra_symbols = frontmatter.extra_symbols.filter((s: string) => !symbolsToRemove.includes(s));
      changed = true;
      
      if (!frontmatter.vars) frontmatter.vars = [];
      for (const s of symbolsToRemove) {
          if (!frontmatter.vars.includes(s)) frontmatter.vars.push(s);
      }
    }
  }

  if (changed || tsCode !== remainingTs) {
    if (!frontmatter.deps) frontmatter.deps = [];
    if (!frontmatter.deps.includes("TYPES")) frontmatter.deps.push("TYPES");

    const newYaml = stringifyYaml(frontmatter).trim();
    const tsHeaderMatch = tsCode.match(/\/\/ OMEGA-64 | [\w.]+ | Era \d+: .+/);
    let finalTs = remainingTs;
    if (tsHeaderMatch && !finalTs.startsWith(tsHeaderMatch[0])) {
        finalTs = `${tsHeaderMatch[0]}\n\n${finalTs}`;
    }

    // SURGICAL REPLACEMENT
    let newRaw = raw.replace(/^---\n[\s\S]*?\n---/, `---\n${newYaml}\n---`);
    newRaw = newRaw.replace(/```typescript\n[\s\S]*?```/, () => `\`\`\`typescript\n${finalTs}\n\`\`\``);
    
    Deno.writeTextFileSync(filePath, newRaw);
  }
}

// Main Execution
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

for (const entry of walkSync(SRC_ONTOLOGY_DIR, { exts: [".md"], includeDirs: false })) {
  if (entry.path === TYPES_PATH) continue;
  refactorFile(entry.path, typesMdContent);
}

const finalTypesYaml = stringifyYaml(typesMdContent.frontmatter).trim();
const finalTypesContent = `---\n${finalTypesYaml}\n---\n\n### TypeScript\n\n\`\`\`typescript\n${typesMdContent.tsCode}\n\`\`\`\n`;
Deno.writeTextFileSync(TYPES_PATH, finalTypesContent);

console.log("[OK] Auto-refactoring complete.");

import { parse as parseYaml, stringify as stringifyYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

const CWD = Deno.cwd();
const TYPES_PATH = resolve(CWD, "src/ontology/core/TYPES.md");

const raw = Deno.readTextFileSync(TYPES_PATH);
const yamlMatch = raw.match(/^---\n([\s\S]*?)\n---/);
const tsMatch = raw.match(/```typescript\n([\s\S]*?)```/);

if (!yamlMatch || !tsMatch) {
  console.error("Could not parse TYPES.md");
  Deno.exit(1);
}

const frontmatter = parseYaml(yamlMatch[1]) as any;
const tsCode = tsMatch[1];

const exportedSymbols: string[] = [];
// Match export type|interface|const|let
const regex = /\bexport\s+(?:type|interface|const|let)\s+(\w+)/g;
let match;
while ((match = regex.exec(tsCode)) !== null) {
  exportedSymbols.push(match[1]);
}

// Case insensitive sort for stability
exportedSymbols.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

// Remove duplicates
const uniqueSymbols = Array.from(new Set(exportedSymbols));

console.log(`Found ${uniqueSymbols.length} exported symbols in TYPES.md`);

frontmatter.extra_symbols = uniqueSymbols;

const newYaml = stringifyYaml(frontmatter).trim();
const newRaw = raw.replace(/^---\n([\s\S]*?)\n---/, `---\n${newYaml}\n---`);

Deno.writeTextFileSync(TYPES_PATH, newRaw);
console.log("[OK] TYPES.md registry synchronized.");

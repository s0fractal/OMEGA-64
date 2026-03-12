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

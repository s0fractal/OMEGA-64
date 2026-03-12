import { walk } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { dirname, join, relative, basename } from "https://deno.land/std@0.224.0/path/mod.ts";

const LAYER_PREFIXES = ["00_", "01_", "02_", "03_", "04_", "05_", "06_"];

function getLayer(path: string): string | null {
  for (const prefix of LAYER_PREFIXES) {
    if (path.includes(`/${prefix}`) || path.startsWith(prefix)) {
      const parts = path.split("/");
      for (const p of parts) {
        if (p.startsWith(prefix)) return p;
      }
    }
  }
  return null;
}

// 1. Build an index of all files
const fileMap = new Map<string, string>(); // basename -> act_path
const layerExports = new Map<string, string[]>();

for (const p of LAYER_PREFIXES) {
    for await (const entry of Deno.readDir(".")) {
        if (entry.isDirectory && entry.name.startsWith(p)) {
            layerExports.set(entry.name, []);
        }
    }
}

for await (const entry of walk(".", { exts: [".ts"], skip: [/\.git/, /08_artifacts/, /63_necropolis/, /07_meta/] })) {
  if (entry.isFile) {
    const bname = basename(entry.path);
    fileMap.set(bname, entry.path);
    const l = getLayer(entry.path);
    if (l && !entry.path.includes("03_tests")) {
        // add to mod.ts exports
        const list = layerExports.get(l) || [];
        // relative to layer root
        const rel = relative(l, entry.path).replace(/\\/g, "/");
        if (rel !== "mod.ts") {
           list.push(rel);
        }
        layerExports.set(l, list);
    }
  }
}

// 2. Generate mod.ts for each layer
for (const [layer, files] of layerExports.entries()) {
    let content = "";
    for (const f of files) {
        let imp = f.startsWith(".") ? f : `./${f}`;
        content += `export * from "${imp}";\n`;
    }
    Deno.writeTextFileSync(join(layer, "mod.ts"), content);
}

// 3. Rewrite all imports
const importRegex = /from\s+["']([^"']+)["']/g;
const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;

async function processFile(path: string) {
    let content = await Deno.readTextFile(path);
    const myLayer = getLayer(path);
    if (!myLayer) return; // ignore files outside layers

    let modified = false;

    function replacer(match: string, importPath: string, isDynamic: boolean) {
        if (importPath.startsWith("http") || importPath.startsWith("npm:")) return match;

        // Resolve absolute target file path
        let targetFile = basename(importPath);
        if (targetFile === "mod.ts") {
             // guess based on path
             const parts = importPath.split("/");
             if (parts.length >= 2) {
                 const dir = parts[parts.length - 2];
                 if (dir.match(/^\d\d_/)) {
                     targetFile = dir; // it's pointing to a layer
                 }
             }
        }
        if (!targetFile.endsWith(".ts")) {
             if (importPath.endsWith(".js") || importPath.endsWith(".json")) return match; 
             targetFile += ".ts"; // Deno extension 
        }

        const targetReal = fileMap.get(targetFile);
        if (!targetReal) return match; // fallback

        const targetLayer = getLayer(targetReal);
        
        if (targetLayer && targetLayer !== myLayer) {
             // inter-layer export through mod.ts
             const depth = path.split("/").length - 1; 
             const up = "../".repeat(depth);
             const newImport = `${up}${targetLayer}/mod.ts`;
             modified = true;
             return isDynamic ? `import("${newImport}")` : `from "${newImport}"`;
        } else if (targetLayer === myLayer) {
             // intra-layer export
             const pDir = dirname(path);
             let rel = relative(pDir, targetReal).replace(/\\/g, "/");
             if (!rel.startsWith(".")) rel = `./${rel}`;
             modified = true;
             return isDynamic ? `import("${rel}")` : `from "${rel}"`;
        }
        
        return match;
    }

    content = content.replace(importRegex, (m, p1) => replacer(m, p1, false));
    content = content.replace(dynamicImportRegex, (m, p1) => replacer(m, p1, true));

    if (modified) {
        await Deno.writeTextFile(path, content);
        console.log(`Rewrote imports in ${path}`);
    }
}

for await (const entry of walk(".", { exts: [".ts"], skip: [/\.git/] })) {
    if (entry.isFile && getLayer(entry.path)) {
        await processFile(entry.path);
    }
}

console.log("Rewrite complete.");

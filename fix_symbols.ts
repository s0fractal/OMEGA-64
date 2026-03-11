import { walk } from "jsr:@std/fs";

const symbolToLayer = new Map<string, string>();
const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const EXPORT_REGEX = /export\s+(?:const|function|class|type|interface|enum|let|var)\s+([A-Za-z0-9_]+)/g;
const EXPORT_ALL_REGEX = /export\s+\*\s+as\s+([A-Za-z0-9_]+)/g;
const EXPORT_LIST_REGEX = /export\s*\{\s*([^}]+)\s*\}/g;

async function buildMap() {
  for (const layer of LAYERS) {
    for await (const entry of walk(layer, { exts: [".ts"] })) {
      if (entry.name === "mod.ts") continue;
      const content = await Deno.readTextFile(entry.path);
      for (const match of content.matchAll(EXPORT_REGEX)) {
        symbolToLayer.set(match[1], layer);
      }
      for (const match of content.matchAll(EXPORT_ALL_REGEX)) {
        symbolToLayer.set(match[1], layer);
      }
      for (const match of content.matchAll(EXPORT_LIST_REGEX)) {
        const tokens = match[1].split(",");
        for (const t of tokens) {
           const cleanly = t.trim().split(" ")[0];
           if (cleanly && cleanly.length > 0) {
               symbolToLayer.set(cleanly, layer);
           }
        }
      }
    }
  }
}

async function fixImports() {
  const IMPORT_STATEMENT_REGEX = /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g;
  const DEFAULT_IMPORT_REGEX = /import\s+([A-Za-z0-9_]+)\s+from\s+["']([^"']+)["'];?/g;
  const NAMESPACE_IMPORT_REGEX = /import\s+\*\s+as\s+([A-Za-z0-9_]+)\s+from\s+["']([^"']+)["'];?/g;

  let fixedCount = 0;
  for await (const entry of walk(".", { exts: [".ts"], skip: [/(^\.git|^\.vscode|^\.gemini)/, /^sigma_core/] })) {
    if (entry.name === "fix_symbols.ts" || entry.name === "phase52.ts") continue;
    let content = await Deno.readTextFile(entry.path);
    let original = content;

    const layerOfCurrentFile = LAYERS.find(l => entry.path.startsWith(l + "/")) || "root";

    // Fix { A, B } imports
    content = content.replace(IMPORT_STATEMENT_REGEX, (match, importsStr, modulePath) => {
        if (!modulePath.includes("mod.ts") && !modulePath.includes("63_necropolis")) {
            return match; // don't touch if it's external or explicitly direct, unless pointing to 63
        }

        const symbols = importsStr.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        const layersToSymbols = new Map<string, string[]>();
        let unknownSymbols = [];

        for (const sym of symbols) {
            // "type Foo" mapping
            const cleanSym = sym.replace(/^type\s+/, "").split(/\s+as\s+/)[0]; 
            const layer = symbolToLayer.get(cleanSym);
            if (layer) {
                if (!layersToSymbols.has(layer)) layersToSymbols.set(layer, []);
                layersToSymbols.get(layer)!.push(sym);
            } else {
                unknownSymbols.push(sym);
            }
        }

        if (layersToSymbols.size === 0) return match;

        let replacement = "";
        for (const [layer, syms] of layersToSymbols.entries()) {
            let rel = "";
            if (layerOfCurrentFile === layer) rel = `./mod.ts`; 
            else if (layerOfCurrentFile === "root") {
                const depth = entry.path.split("/").length - 1;
                const up = depth > 0 ? "../".repeat(depth) : "./";
                rel = `${up}${layer}/mod.ts`;
            }
            else rel = `../${layer}/mod.ts`;

            // Avoid import {} from "./mod.ts" inside the exact same mod.ts
            if (entry.name === "mod.ts" && rel === "./mod.ts") continue;

            replacement += `import { ${syms.join(", ")} } from "${rel}";\n`;
        }

        if (unknownSymbols.length > 0) {
            replacement += `import { ${unknownSymbols.join(", ")} } from "${modulePath}";\n`;
        }
        
        return replacement.trim();
    });

    // Fix * as X imports
    content = content.replace(NAMESPACE_IMPORT_REGEX, (match, namespace, modulePath) => {
         if (!modulePath.includes("63_necropolis/mod.ts")) return match;
         // Usually namespace maps nicely to OFFSETS
         if (namespace === "OFFSETS") {
             let rel = layerOfCurrentFile === "root" ? "./00_substrate/mod.ts" : (layerOfCurrentFile === "00_substrate" ? "./mod.ts" : "../00_substrate/mod.ts");
             return `import * as ${namespace} from "${rel}";`;
         }
         return match;
    });

    // Fix default imports if any (like import CONFIG from ... )
    
    if (content !== original) {
        await Deno.writeTextFile(entry.path, content);
        fixedCount++;
        console.log(`Rewrote imports in ${entry.path}`);
    }
  }
  console.log(`Total rewritten files: ${fixedCount}`);
}

await buildMap();
await fixImports();

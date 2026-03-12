import { walk } from "https://deno.land/std@0.224.0/fs/mod.ts";

const LAYER_PREFIXES = ["00_", "01_", "02_", "03_", "04_", "05_", "06_"];
let violations = 0;

function getLayerCode(layerStr: string): number {
    return parseInt(layerStr.substring(0, 2), 10);
}

const importRegex = /import\s+(?:(?:{[^}]+})|(?:[\w\s,]+\*?\s+as\s+\w+))\s+from\s+["']([^"']+)["']/g;

for await (const entry of walk(".", { exts: [".ts"], skip: [/\.git/, /08/, /63/, /07/] })) {
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

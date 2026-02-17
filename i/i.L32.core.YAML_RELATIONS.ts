
// i.L32.core.YAML_RELATIONS.ts
// Populates 'relations' in YAML files:
// - attractor: VOID
// - use: [Imported Symbols]
// - used: [Consumers of this Symbol]

import { walk } from "jsr:@std/fs";

const ROOT = `${Deno.cwd()}/i`;
const RE_IMPORT = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+))\s+from\s+["']\.\/?([^"']+)["']/;
// Matches: import { A, B } from "./A.ts" OR import * as A from "./A.ts"

interface FileNode {
    path: string;
    basename: string;
    symbol: string;
    yamlPath: string;
    imports: string[]; // List of BASENAMES imported
    usedBy: string[]; // List of BASENAMES that import this
}

async function populateRelations() {
    console.log(`Scanning ${ROOT} for Relations...`);
    
    // 1. Build Registry of Files
    const registry = new Map<string, FileNode>(); // Basename -> Node
    
    // First pass: identify all .ts files and their symbols (assumed basename)
    for await (const entry of walk(ROOT, { includeDirs: false, ext: ["ts"] })) {
        const basename = entry.name.replace(/\.ts$/, "");
        const yamlPath = entry.path.replace(/\.ts$/, ".yaml");
        
        registry.set(basename, {
            path: entry.path,
            basename,
            symbol: basename, // Default symbol is basename
            yamlPath,
            imports: [],
            usedBy: []
        });
    }

    // 2. Parse Imports to build Graph
    for (const node of registry.values()) {
        try {
            const content = await Deno.readTextFile(node.path);
            const lines = content.split('\n');
            
            for (const line of lines) {
                const match = line.match(RE_IMPORT);
                if (match) {
                    const targetPath = match[3]; // "./NAME.ts" or "NAME.ts" or "NAME"
                    // Resolve basename of target
                    const targetBasename = targetPath.split('/').pop()?.replace(/\.ts$/, "") || "";
                    
                    if (registry.has(targetBasename)) {
                        node.imports.push(targetBasename);
                        // Add reverse link
                        registry.get(targetBasename)?.usedBy.push(node.basename);
                    }
                }
            }
        } catch (e) {
            console.error(`Error reading ${node.basename}:`, e);
        }
    }

    // 3. Update YAML files
    let updatedCount = 0;
    for (const node of registry.values()) {
        try {
            // Check if YAML exists
            let yamlContent = "";
            try {
                yamlContent = await Deno.readTextFile(node.yamlPath);
            } catch (e) {
                // If YAML doesn't exist, maybe skip or create? 
                // User said "fill relations", assuming YAML exists. 
                // We'll skip if no YAML to avoid cluttering pure TS files if any.
                continue;
            }

            // Parse existing YAML (simple split) or append
            // We want to ADD 'relations' section.
            // If it exists, replace it?
            
            // Let's filter out existing 'relations' block if any
            const lines = yamlContent.split('\n').filter(l => !l.startsWith('relations:') && !l.startsWith('  attractor:') && !l.startsWith('  use:') && !l.startsWith('  used:') && !l.trim().startsWith('- '));
            // Actually parsing YAML manually is fragile for block replacement.
            // But since we just generated them and they are flat specific keys, 
            // we can just reconstruct the file using the known keys + relations.
            
            // Better: Read keys we want to keep (vector, origin, symbol)
            // discard relations, rewrite.
            
            const newLines = lines.filter(l => l.trim() !== ""); // Remove empty lines
            
            newLines.push("relations:");
            newLines.push("  attractor: VOID");
            
            if (node.imports.length > 0) {
                newLines.push("  use:");
                // Unique imports
                [...new Set(node.imports)].forEach(imp => newLines.push(`    - ${imp}`));
            } else {
                 newLines.push("  use: []");
            }

            if (node.usedBy.length > 0) {
                newLines.push("  used:");
                 // Unique usedBy
                [...new Set(node.usedBy)].forEach(usr => newLines.push(`    - ${usr}`));
            } else {
                 newLines.push("  used: []");
            }

            await Deno.writeTextFile(node.yamlPath, newLines.join('\n') + '\n');
            updatedCount++;

        } catch (e) {
            console.error(`Error updating YAML for ${node.basename}:`, e);
        }
    }
    
    console.log(`Relations populated in ${updatedCount} files.`);
}

if (import.meta.main) {
    await populateRelations();
}


// i.L32.core.Q_MIGRATION.ts
// Migrates @omega.* annotations from TS files to sibling YAML files.

import { walk } from "jsr:@std/fs";

const ROOT = `${Deno.cwd()}/i`;
const RE_ANNOTATION = /@omega\.([a-zA-Z0-9_]+)\s+(.+)/g;

async function migrate() {
    console.log(`Scanning ${ROOT}...`);
    
    let count = 0;
    
    for await (const entry of walk(ROOT, { includeDirs: false, ext: ["ts"] })) {
        const content = await Deno.readTextFile(entry.path);
        const matches = [...content.matchAll(RE_ANNOTATION)];
        
        if (matches.length > 0) {
            const yamlData: Record<string, any> = {};
            
            for (const match of matches) {
                const key = match[1]; // e.g. "vector"
                let value = match[2]; // e.g. "32.27.00"
                
                // Try to parse numbers/booleans
                if (value === "true") value = true;
                else if (value === "false") value = false;
                else if (!isNaN(Number(value))) value = Number(value);
                
                yamlData[key] = value;
            }
            
            // Construct YAML content
            let yamlContent = "";
            for (const [k, v] of Object.entries(yamlData)) {
                yamlContent += `${k}: ${v}\n`;
            }
            
            // Save as .yaml
            const yamlPath = entry.path.replace(/\.ts$/, ".yaml");
            await Deno.writeTextFile(yamlPath, yamlContent);
            console.log(`Created ${yamlPath.split('/').pop()}`);
            
            // REMOVE Annotations from TS file
            const newContent = content.replace(RE_ANNOTATION, '').replace(/^\/\*\*[\s\n]*\*\/\s*/, ''); // Remove empty JSDoc if it becomes empty? 
            // Better regex to remove the lines.
            
            const lines = content.split('\n');
            const cleanLines = lines.filter(line => !line.includes('@omega.'));
            // Start from line 0?
            // The JSDoc might be left empty: /** \n */
            
            const cleanContent = cleanLines.join('\n').replace(/\/\*\*\s*\*\/\s*/g, '').trimStart();
            
            await Deno.writeTextFile(entry.path, cleanContent);
            console.log(`Cleaned ${entry.path.split('/').pop()}`);

            count++;
        }
    }
    
    console.log(`Migration Complete. Created ${count} YAML files.`);
}

if (import.meta.main) {
    await migrate();
}

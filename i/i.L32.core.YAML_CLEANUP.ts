
// i.L32.core.YAML_CLEANUP.ts
// Removes 'readonly' and 'load' keys from all YAML files in i/

import { walk } from "jsr:@std/fs";

const ROOT = `${Deno.cwd()}/i`;

async function cleanup() {
    console.log(`Scanning ${ROOT} for YAML cleanup...`);
    let count = 0;
    
    for await (const entry of walk(ROOT, { includeDirs: false, ext: ["yaml"] })) {
        const content = await Deno.readTextFile(entry.path);
        const lines = content.split('\n');
        
        const newLines = lines.filter(line => {
            const key = line.split(':')[0].trim();
            // Remove 'readonly' and 'load'
            return key !== 'readonly' && key !== 'load';
        });
        
        if (newLines.length !== lines.length) {
            await Deno.writeTextFile(entry.path, newLines.join('\n'));
            // console.log(`Cleaned ${entry.name}`);
            count++;
        }
    }
    
    console.log(`Cleanup Complete. Modified ${count} files.`);
}

if (import.meta.main) {
    await cleanup();
}

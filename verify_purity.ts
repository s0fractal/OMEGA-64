
// verify_purity.ts ⚛️⚖️
// The Mono-Line Enforcer

import { walk } from "https://deno.land/std/fs/walk.ts";

const ROOT = Deno.cwd();

async function verify() {
    console.log("⚛️ Verifying Mono-Line Purity...");
    let violations = 0;

    for await (const entry of walk(ROOT, { 
        match: [/i\.core\.[a-zA-Z0-9_]+\.ts$/], 
        skip: [/node_modules/, /\.git/, /i\.core\.ts$/] 
    })) {
        if (entry.name === "i.core.ts") continue;

        const content = await Deno.readTextFile(entry.path);
        const lines = content.trim().split("\n");
        
        // Strict Check: Must be exactly 1 line
        // (We allow empty file? No, atom must be 1 line)
        if (lines.length !== 1) {
            console.error(`❌ Violation: ${entry.path} has ${lines.length} lines.`);
            violations++;
        }
    }

    if (violations > 0) {
        console.error(`\n🚫 Purity Check Failed: ${violations} multi-line atoms found.`);
        Deno.exit(1);
    } else {
        console.log("✅ Purity Output: 100% Mono-Line Compliance.");
    }
}

if (import.meta.main) {
    verify();
}

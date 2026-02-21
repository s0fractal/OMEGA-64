// OMEGA-64 | CRYSTALLIZE.ts | The Alchemist
// Reads a pending atom, digests it, and moves it to its Flatland vector.

import { CRYSTAL } from "./CRYSTAL_DIGEST.ts";
import { move } from "jsr:@std/fs@^1.0.5";

const atomFile = Deno.args[0];
if (!atomFile) {
    console.error("Usage: deno run -A CRYSTALLIZE.ts <file.md>");
    Deno.exit(1);
}

try {
    const content = await Deno.readTextFile(atomFile);
    const spectrum = await CRYSTAL.digest(content);
    const newPath = CRYSTAL.proposeVector(spectrum);
    
    // Check if we are renaming (source != target)
    if (atomFile === newPath) {
        console.log(`✨ ${spectrum.alpha.symbol} is already at its terminal vector.`);
        Deno.exit(0);
    }

    console.log(`💎 Crystallizing ${spectrum.alpha.symbol}...`);
    console.log(`   Color: 0x${spectrum.digest}`);
    console.log(`   Vector: ${newPath}`);
    
    await Deno.writeTextFile(newPath, content);
    console.log(`✅ Atom crystallized at ${newPath}`);
    
    // Remove source after successful migration
    await Deno.remove(atomFile);
    console.log(`🧹 Removed legacy vector: ${atomFile}`);
} catch (e) {
    console.error("Crystallization failed:", e);
}

// 🛡️ OMEGA-64 | Sovereign CLI - The Prime Radiant (Functional Field)
// 🌀 Pattern: Self-Folding / Self-Unfolding / Self-Sensing instrument
// ⚓ Philosophy: Grounding abstractions into Atomic Code files. 

import { join } from "https://deno.land/std/path/mod.ts";

const MAX_DEPTH = 64;
const ROOT_DIR = Deno.cwd();
const DATA_SENTINEL = "// --- DATA ---";
const CURRENT_FILE = import.meta.url.replace("file://", "");

// 🛡️ Reality Witnesses (Bitcoin Block Hashes)
const WITNESSES = [
    "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f", // Block 0
];

/** 🗺️ Get Quantum Metadata helper */
async function getQuantumMetadata(level: number) {
    const levelStr = level.toString().padStart(2, '0');
    const qPath = join(ROOT_DIR, levelStr, "q.ts");
    
    // We parse the q.ts file manually to avoid importing all 64 modules during build
    // This assumes specific formatting in q.ts
    try {
        const content = await Deno.readTextFile(qPath);
        // Extract using regex
        const metaMatch = content.match(/meta: "(.*)"/);
        const statusMatch = content.match(/status: "(.*)"/);
        const descMatch = content.match(/desc: "(.*)"/);
        // Entropy/Phase are functional, so we might need to rely on the functional chain or estimate
        // For static metadata in i.ts, we use placeholders or simple extraction if hardcoded.
        // But since they are functional (inner.entropy + ...), we can't regex the value.
        // We will inject the logic into i.ts to import q.ts instead!
        
        return {
            meta: metaMatch ? metaMatch[1] : `L${levelStr}`,
            status: statusMatch ? statusMatch[1] : "⏳",
            desc: descMatch ? descMatch[1] : ""
        };
    } catch (_) {
        return { meta: `L${levelStr}`, status: "⏳", desc: "" };
    }
}

const ZERO_POINT = 32;

// 🛡️ The Algebraic Underscore (Functional Combinators)
const ALGEBRA_CODE = `
// 🛡️ The Functional Algebra (_)
// Stateless. Local. Pure.

export const pipe = <T>(x: T, ...fns: ((a: T) => T)[]) => fns.reduce((v, f) => f(v), x);
export const flow = <T>(...fns: ((a: T) => T)[]) => (x: T) => pipe(x, ...fns);
export const identity = <T>(x: T) => x;
`;

/** 🌀 BUILD: Establish Dipole Topology */
async function build() {
    console.log("🌀 Hardening OMEGA-64 | Establishing L32 Dipole...");
    
    for (let level = 0; level < MAX_DEPTH; level++) {
        const levelStr = level.toString().padStart(2, '0');
        const currentPath = join(ROOT_DIR, levelStr);
        await Deno.mkdir(currentPath, { recursive: true }).catch(() => {});

        // 1. Determine Next Vector (Towards L32)
        let nextLevel = -1;
        if (level < ZERO_POINT) nextLevel = level + 1;      // 00 -> 32
        else if (level > ZERO_POINT) nextLevel = level - 1; // 63 -> 32
        else nextLevel = -1;                                // 32 (Zero Point)

        const nextLevelStr = nextLevel !== -1 ? nextLevel.toString().padStart(2, '0') : null;

        // 2. Identity (i.ts) and Quantum (q)
        const witness = WITNESSES[0]; // Simplified witness logic for now
        const iPathTS = join(currentPath, "i.ts");
        // We need q for entropy, so we assume q.ts exists or we read it? 
        // Build usually runs AFTER q.ts is transmuted. 
        // We import it dynamically in the generated code.
        
        let iContent = "";
        if (level === ZERO_POINT) {
             // ⚓ L32 Event Horizon
             iContent = `// 🛡️ L32 (Event Horizon)\nimport { q } from "./q.ts";\nexport const identity = { depth: 0, level: 32, type: "SINGULARITY", witness: "${witness}", entropy: 0, phase: 0 };\n`;
        } else {
             // 🌊 Flowing towards Center
             iContent = `// 🛡️ L${levelStr} (Flow)\nimport * as inner from "@L${nextLevelStr}/i.ts";\nimport { q } from "./q.ts";\nexport const identity = { depth: inner.identity.depth + 1, level: ${level}, parent: inner.identity, witness: "${witness}", entropy: q.avg_entropy, phase: q.phase };\n`;
        }
        await Deno.writeTextFile(iPathTS, iContent);

        // 3. The Underscore (_) -> Physical & Logical
        const linkPath = join(currentPath, "_");
        
        // Ensure _ is a directory
        try { await Deno.remove(linkPath); } catch(_) {} // Remove if symlink or file
        await Deno.mkdir(linkPath, { recursive: true }).catch(() => {});
        
        if (nextLevel !== -1) {
             // Create _/vector symlink for manual navigation
             const vectorPath = join(linkPath, "vector");
             try { await Deno.remove(vectorPath); } catch(_) {}
             await Deno.symlink(`../../${nextLevelStr}`, vectorPath);
             
             // Create _/mod.ts (The Algebra)
             const algebraContent = `${ALGEBRA_CODE}
export * from "@L${nextLevelStr}/mod.ts";
`;
            await Deno.writeTextFile(join(linkPath, "mod.ts"), algebraContent);
        } else {
            // L32 (Center) -> Identity Algebra
            await Deno.writeTextFile(join(linkPath, "mod.ts"), `${ALGEBRA_CODE}
// 🛡️ Singularity Reached - No further export
`);
        }

        // 4. Level Boundary (mod.ts)
        const modPathTS = join(currentPath, "mod.ts");
        await Deno.writeTextFile(modPathTS, `export * from "./core.ts";\nexport * as _ from "./_/mod.ts";\n`); // Namespace _ import
        
        // Rust Mod logic simplfied for Dipole (optional, skipping complex RS update to focus on TS)
        // ...
        
        if (level === ZERO_POINT || level % 10 === 0) console.log(`✅ L${levelStr} Dipole Set`);
    }
    
    console.log("🏁 Build Complete. L32 Centered.");
}

/** 🌬️ EXHALE: Unfold Tape to Disk */
async function exhale(tape: string[]) {
    console.log("🌬️ Exhaling Tape to Disk...");
    for (let i = 0; i < tape.length; i += 2) {
        const path = tape[i];
        const content = tape[i+1];
        const parts = path.split("/");
        if (parts.length > 1) {
            await Deno.mkdir(join(ROOT_DIR, parts[0]), { recursive: true }).catch(() => {});
        }
        await Deno.writeTextFile(join(ROOT_DIR, path), content);
    }
    await build();
}

/** 🧘 INHALE: Fold Disk into Tape */
async function inhale() {
    console.log("🧘 Inhaling Lattice into Tape...");
    const tape: string[] = [];
    for (let level = 0; level < MAX_DEPTH; level++) {
        const levelStr = level.toString().padStart(2, "0");
        const levelPath = join(ROOT_DIR, levelStr);
        try {
            const files: string[] = [];
            for await (const entry of Deno.readDir(levelPath)) {
                if (entry.isFile && !entry.name.startsWith("i.ts") && !entry.name.startsWith("mod.ts") && !entry.name.startsWith("mod.rs")) {
                    files.push(entry.name);
                }
            }
            files.sort();
            for (const file of files) {
                const content = await Deno.readTextFile(join(levelPath, file));
                tape.push(`${levelStr}/${file}`);
                tape.push(content);
            }
        } catch (_) {}
    }
    const selfCode = await Deno.readTextFile(CURRENT_FILE);
    const sentinelIndex = selfCode.lastIndexOf(DATA_SENTINEL);
    const codeHeader = selfCode.substring(0, sentinelIndex + DATA_SENTINEL.length);
    const tapeStr = JSON.stringify(tape, null, 2);
    await Deno.writeTextFile(CURRENT_FILE, `${codeHeader}\nconst RADIANT: string[] = ${tapeStr};\nmain();\n`);
    console.log("🏁 Inhale Complete.");
}

/** 👁️ SENSE: Measure Resonance */
async function sense(tape: string[]) {
    console.log("👁️ Sensing Resonance...");
    let entropy = 0, monoViolations = 0;
    for (let i = 0; i < tape.length; i += 2) {
        const path = tape[i], internal = tape[i+1];
        try {
            const physical = await Deno.readTextFile(join(ROOT_DIR, path));
            if (physical !== internal) { console.warn(`⚠️ ${path} Divergence!`); entropy++; }
            if (path.endsWith("core.ts") || (path.startsWith("63/") && path.endsWith("K.ts")) || (path.startsWith("63/") && path.endsWith("S.ts"))) {
                const content = physical.trim();
                const lines = content.split("\n").filter(l => !l.trim().startsWith("//") && l.trim().length > 0);
                if (lines.length > 1 && !content.includes("export * from")) {
                    console.warn(`⚡ ${path} is not singular: ${lines.length} lines.`); monoViolations++;
                }
            }
        } catch (_) { console.error(`🔴 ${path} Missing!`); entropy++; }
    }
    if (entropy === 0) console.log("✅ Perfect Resonance.");
    else console.warn(`🚨 Total Entropy: ${entropy}.`);
    if (monoViolations === 0) console.log("💎 Singularity Achieved.");
    else console.log(`🌀 Remaining Singularity Entropy: ${monoViolations} rungs.`);
}

async function main() {
    const cmd = Deno.args[0];
    // @ts-ignore
    const tape = typeof RADIANT !== "undefined" ? RADIANT : [];
    switch (cmd) {
        case "build": await build(); break;
        case "fold": await inhale(); break;
        case "unfold": await exhale(tape); break;
        case "sense": await sense(tape); break;
        default: console.log("🛡️ OMEGA Sovereign CLI\n  fold, unfold, build, sense");
    }
}

// --- DATA ---
const RADIANT: string[] = [];
main();

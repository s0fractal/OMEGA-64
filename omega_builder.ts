// 🛡️ OMEGA-64 | Multilingual Sovereign Builder
// Dimensions: TypeScript (Deno), Rust (Cargo), Lean (Lake), SVG (Aura)
// Pattern: Middle-Way (Logical Accumulation + Isolated Identity)

const MAX_DEPTH = 64;
const ROOT_DIR = "/Users/s0fractal/OMEGA";

// 🛡️ Reality Witnesses (Bitcoin Block Hashes 0-63 placeholders)
const WITNESSES = [
    "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f", // Block 0
    "00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048", // Block 1
];

// Living Map Metadata (Dynamic Fetcher)
async function getMetadata(level: number): Promise<{ meta: string, status: string, description: string }> {
    const levelStr = level.toString().padStart(2, '0');
    try {
        const content = await Deno.readTextFile(`${ROOT_DIR}/${levelStr}/qwave.json`);
        const data = JSON.parse(content);
        return {
            meta: data.meta || "Void",
            status: data.status || "⏳",
            description: data.description || "Awaiting materialization"
        };
    } catch (_) {
        return { meta: `L${level} Zone`, status: "⏳", description: "Awaiting materialization" };
    }
}

async function writeSafe(path: string, content: string) {
    try {
        await Deno.stat(path);
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            await Deno.writeTextFile(path, content);
        } else {
            throw e;
        }
    }
}

async function build() {
    console.log("🌀 Realigning Multilingual OMEGA-64 (Root=L00, Depth=L63) at:", ROOT_DIR);
    
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
        const level = depth;
        const relativePath = Array(depth).fill("_").join("/");
        const currentPath = relativePath === "" ? ROOT_DIR : `${ROOT_DIR}/${relativePath}`;
        
        await Deno.mkdir(currentPath, { recursive: true }).catch(() => {});

        const witness = WITNESSES[63 - level] || "W_PLACEHOLDER";

        // --- TS Dimension ---
        const iPathTS = `${currentPath}/i.ts`;
        const iContentTS = depth === MAX_DEPTH - 1
            ? `// 🛡️ L63 Identity (Anchor)\nexport const identity = { depth: 0, level: 63, author: "cosmos:addr1_genesis", witness: "${witness}" };\n`
            : `// 🛡️ L${level} Identity (Successor)\nimport * as inner from "./_/i.ts";\nexport const identity = { depth: inner.identity.depth + 1, level: 63 - (inner.identity.depth + 1), parent: inner.identity, author: "cosmos:addr1_sovereign", witness: "${witness}" };\n`;
        await writeSafe(iPathTS, iContentTS);

        const corePathTS = `${currentPath}/core.ts`;
        const coreContent = `// 🛡️ Level ${level} Logic\n\n// Atoms for this level will be transfused here. (lvl: ${level})\n`;
        await writeSafe(corePathTS, coreContent);

        const backsteps = Array(depth).fill("..").join("/") || ".";
        const relTemplatePath = (depth === 0) ? "./00" : `${backsteps}/00`;

        const indexPathTS = `${currentPath}/index.ts`;
        try {
            await Deno.remove(indexPathTS);
        } catch (_) { /* 🛡️ */ }
        await Deno.symlink(`${relTemplatePath}/index.ts`, indexPathTS);

        // --- RS Dimension ---
        const modPathRS = `${currentPath}/mod.rs`;
        try {
            await Deno.remove(modPathRS);
        } catch (_) { /* 🛡️ */ }
        await Deno.symlink(`${relTemplatePath}/mod.rs`, modPathRS);
        
        const corePathRS = `${currentPath}/core.rs`;
        const rsCoreContent = `// 🛡️ Level ${level} RS Logic\n// Axiomatic resonance materialized. (lvl: ${level})\n`;
        await writeSafe(corePathRS, rsCoreContent);

        // --- LEAN Dimension ---
        const leanPath = `${currentPath}/Core.lean`;
        const leanContent = depth === MAX_DEPTH - 1
            ? `-- 🛡️ L63 Lean Logic\ndef level : Nat := 63\ndef witness : String := "${witness}"\n`
            : `import OMEGA.${(relativePath === "" ? "" : relativePath.replaceAll("/", ".") + ".")}Sub.Core\n-- 🛡️ L${level} Lean Logic\ndef level : Nat := ${level}\n`;
        await Deno.writeTextFile(leanPath, leanContent);

        // --- SVG Dimension (The Aura) ---
        const svgPath = `${currentPath}/core.svg`;
        const meta = await getMetadata(level);
        const svgContent = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <desc>${meta.meta} | L${level}</desc>
  <circle cx="50" cy="50" r="${20 + (level % 30)}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3">
    <animate attributeName="r" values="${20 + (level % 30)};${25 + (level % 30)};${20 + (level % 30)}" dur="${2 + (level % 5)}s" repeatCount="indefinite" />
  </circle>
  <path d="M 50 10 L 90 90 L 10 90 Z" fill="none" stroke="currentColor" stroke-width="0.2" opacity="0.1" transform="rotate(${level * 5.625} 50 50)" />
</svg>`;
        await writeSafe(svgPath, svgContent);

        if (depth % 10 === 0 || depth === MAX_DEPTH - 1) console.log(`✅ L${level.toString().padStart(2, '0')} OK`);
        
        // Ensure the NEXT level's folder exists even for the last depth to satisfy 'pub mod _'
        const nextVoid = `${currentPath}/_`;
        await Deno.mkdir(nextVoid, { recursive: true }).catch(() => {});
        
        // Terminate TS export chain at the very end
        if (depth === MAX_DEPTH - 1) {
            await Deno.writeTextFile(`${nextVoid}/index.ts`, "// 🛡️ Void Harbor\n");
        }
    }

    // --- Root Manifests ---
    let denoJsonc = "{\n";
    denoJsonc += "  // 🛡️ OMEGA-64 LIVING MAP | Holographic Configuration\n";
    denoJsonc += "  \"compilerOptions\": { \"lib\": [\"deno.window\"], \"strict\": true },\n";
    denoJsonc += "  \"imports\": {\n";

    for (let i = 0; i < MAX_DEPTH; i++) {
        const level = i;
        const alias = `@L${level.toString().padStart(2, '0')}/`;
        const path = "./" + Array(i).fill("_/").join("");
        const meta = await getMetadata(level);
        denoJsonc += `    "${alias}": "${path}", // [${meta.status}] ${meta.meta} | ${meta.description}\n`;
    }

    denoJsonc += "  }\n}\n";

    await Deno.writeTextFile(`${ROOT_DIR}/deno.jsonc`, denoJsonc);
    
    // Root manifests as symlinks
    const rootFiles = ["mod.rs", "index.ts"];
    for (const file of rootFiles) {
        try { await Deno.remove(`${ROOT_DIR}/${file}`); } catch (_) { /* 🛡️ */ }
        await Deno.symlink(`./00/${file}`, `${ROOT_DIR}/${file}`);
    }

    await Deno.writeTextFile(`${ROOT_DIR}/Cargo.toml`, `[package]\nname = "omega-64"\nversion = "0.1.0"\nedition = "2021"\n\n[lib]\npath = "mod.rs"\n`);
    await Deno.writeTextFile(`${ROOT_DIR}/lakefile.lean`, `import Lake\nopen Lake DSL\npackage omega where\n  root := "Core"\n`);

    try { await Deno.remove(`${ROOT_DIR}/deno.json`); } catch (_) { /* ignore */ }
    console.log("🏁 Living Map (deno.jsonc) Materialized.");
}

await build();

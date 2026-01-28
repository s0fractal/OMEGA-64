// 🛡️ OMEGA-64 | Diagnostic Builder
const MAX_DEPTH = 64;
const ROOT = "/Users/s0fractal/OMEGA";

async function build() {
    console.log(`Starting build in ${ROOT}`);
    for (let d = 0; d < MAX_DEPTH; d++) {
        const parts = Array(d).fill("_");
        const dir = [ROOT, ...parts].join("/");
        
        console.log(`[${d}] Creating: ${dir}`);
        await Deno.mkdir(dir, { recursive: true });
        
        const iPath = `${dir}/i.ts`;
        const content = d === MAX_DEPTH - 1 
            ? "export const depth = 0;" 
            : `import { depth as inner } from "./_/i.ts";\nexport const depth = inner + 1;`;
        
        await Deno.writeTextFile(iPath, content);
        
        // Verification check within the script
        try {
            const s = await Deno.stat(iPath);
            console.log(`--- Created ${iPath} (${s.size} bytes)`);
        } catch (e) {
            console.error(`--- FAILED to verify ${iPath}:`, e);
        }
    }
    console.log("🏁 Build sequence finished.");
}

await build();

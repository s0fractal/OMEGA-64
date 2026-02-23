import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";

const ROOT = Deno.cwd();

async function scanAtoms() {
    const atoms = [];
    for await (const entry of Deno.readDir(ROOT)) {
        if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
            try {
                const content = await Deno.readTextFile(entry.name);
                const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
                
                let alpha: any = {};
                if (frontmatterMatch) {
                    alpha = parseYaml(frontmatterMatch[1]);
                }
                
                const tParts = entry.name.split(".");
                const fullEigen = tParts[0];
                const symbol = tParts[1];
                
                // For display and classification, separate base and retro components
                const is128Bit = fullEigen.includes("_");
                const baseEigen = is128Bit ? fullEigen.split("_")[0] : fullEigen;
                const retroEigen = is128Bit ? fullEigen.split("_")[1] : null;

                const logic = baseEigen.slice(2, 10);
                const spatial = baseEigen.slice(10, 14);
                const quantum = baseEigen.slice(14, 18);

                let svg = svgMatch ? svgMatch[0] : null;
                let energy = alpha.energy !== undefined ? Number(alpha.energy) : 100;

                atoms.push({
                    filename: entry.name,
                    eigenvalue: fullEigen,
                    baseEigen: baseEigen,
                    retroEigen: retroEigen,
                    logic: logic,
                    spatial: spatial,
                    quantum: quantum,
                    symbol: symbol,
                    energy: energy,
                    svg: svg,
                    isDust: entry.name.includes(".DUST")
                });
            } catch (e) {
                console.error(`Failed to read atom ${entry.name}:`, e);
            }
        }
    }
    // Sort logic: live atoms first, sorted by energy
    return atoms.sort((a, b) => b.energy - a.energy);
}

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/api/atoms") {
        const atoms = await scanAtoms();
        return new Response(JSON.stringify(atoms), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }

    if (url.pathname === "/") {
        try {
            const html = await Deno.readTextFile("DASHBOARD.html");
            return new Response(html, {
                headers: { "Content-Type": "text/html" }
            });
        } catch {
            return new Response("DASHBOARD.html not found", { status: 404 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

console.log("🌟 Flatland Petri Dish Dashboard is running on http://localhost:8000");
serve(handler, { port: 8000 });

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

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

async function appendToAkasha(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, { append: true });
    } catch { /* ignore */ }
}

async function modifyEnergy(filename: string, amount: number): Promise<Response> {
    try {
        const content = await Deno.readTextFile(filename);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        
        if (!frontmatterMatch) {
            return new Response("Invalid atom format", { status: 400 });
        }
        
        const alpha = parseYaml(frontmatterMatch[1]) as any;
        const currentEnergy = alpha.energy !== undefined ? Number(alpha.energy) : 100;
        
        alpha.energy = Math.max(0, currentEnergy + amount);
        
        const newContent = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
        await Deno.writeTextFile(filename, newContent);
        
        if (alpha.energy === 0 && amount < 0) {
            await appendToAkasha(`⚡ HAND_OF_GOD: ${filename} was struck by lightning and disintegrated.`);
        } else if (amount > 0) {
            await appendToAkasha(`☀️ HAND_OF_GOD: ${filename} was blessed with +${amount} energy.`);
        }

        return new Response(JSON.stringify({ success: true, energy: alpha.energy }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    } catch (e) {
        return new Response("Atom not found or error", { status: 404 });
    }
}

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } });
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/feed/")) {
        const filename = decodeURIComponent(url.pathname.substring("/api/feed/".length));
        return await modifyEnergy(filename, 50);
    }
    
    if (req.method === "POST" && url.pathname.startsWith("/api/zap/")) {
        const filename = decodeURIComponent(url.pathname.substring("/api/zap/".length));
        return await modifyEnergy(filename, -50);
    }

    if (req.method === "POST" && url.pathname === "/api/zero-iops") {
        try {
            const process = new Deno.Command("deno", {
                args: ["run", "--allow-read", "--allow-write", "ZERO_IOPS.ts"],
            });
            await process.output();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        } catch (e) {
            return new Response("Zero-IOPS execution failed", { status: 500 });
        }
    }

    if (req.method === "GET" && url.pathname === "/api/akasha") {
        try {
            const logContent = await Deno.readTextFile("AKASHA.log");
            const lines = logContent.trim().split("\n").filter(l => l.length > 0).slice(-10); // last 10 events
            return new Response(JSON.stringify({ logs: lines }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        } catch {
            return new Response(JSON.stringify({ logs: [] }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
    }

    if (req.method === "GET" && url.pathname === "/api/atoms") {
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

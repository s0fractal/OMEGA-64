// e/TUI.ts
// A simple Terminal User Interface for Q-Space Physics
// Run with: deno run -A e/TUI.ts

import { parse } from "jsr:@std/yaml";

async function main() {
    console.clear();
    console.log("Loading Q-Space Data...");

    try {
        const text = await Deno.readTextFile("e/q_data.json");
        const data = JSON.parse(text);
        
        console.log(`\n🌌 Q-SPACE TUI DASHBOARD 🌌`);
        console.log(`Nodes: ${data.nodes.length} | Links: ${data.links ? data.links.length : 0}`);
        console.log("-".repeat(60));
        console.log(pad("ID", 30) + pad("L", 6) + pad("D", 6) + pad("Tens", 6) + "Forces (Attr/Rep/Orb/Spr)");
        console.log("-".repeat(80));

        // Sort by Tension (Mass/Deps) or Force Magnitude?
        // Let's sort by Displacement (L vs targetL if we had it, or just Tension)
        // Or sort by Total Force magnitude if we have it in debug.
        
        // Let's filter for interesting nodes (High tension or named nodes)
        const relevant = data.nodes
            .filter((n: any) => !n.isMirror && n.id.includes("core"))
            .sort((a: any, b: any) => (b.tension || 0) - (a.tension || 0))
            .slice(0, 20);

        for (const n of relevant) {
            const name = n.id.replace(/i\.L\d+\.core\./, "").replace(".ts", "");
            const L = n.L.toFixed(1);
            const D = n.D.toString();
            const T = (n.tension || 0).toString();
            
            let forceStr = "";
            if (n.debug) {
                const mag = (v: any) => Math.sqrt(v.x*v.x + v.y*v.y).toFixed(2);
                forceStr = `${mag(n.debug.attraction)} / ${mag(n.debug.repulsion)} / ${mag(n.debug.orbital)} / ${mag(n.debug.spring)}`;
            }

            console.log(pad(name, 30) + pad(L, 6) + pad(D, 6) + pad(T, 6) + forceStr);
        }
        console.log("-".repeat(80));
        console.log("Run 'deno run -A e/EXPORT_DATA.ts' to update physics.");

    } catch (e) {
        console.error("Error reading e/q_data.json", e);
    }
}

function pad(str: string, len: number) {
    return str.padEnd(len).substring(0, len);
}

main();

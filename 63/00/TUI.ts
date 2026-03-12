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

    console.log(
      "Nodes: " + data.nodes.length + " | Links: " +
        (data.links ? data.links.length : 0),
    );
    console.log("-".repeat(60));
    console.log(
      pad("ID", 25) + pad("Lev", 5) + pad("Rad", 5) + pad("D", 5) +
        pad("Ten", 5) + "Forces",
    );
    console.log("-".repeat(80));

    // Sort by Tension or Level
    const relevant = data.nodes
      .filter((n: any) => !n.isMirror && n.id.includes("core"))
      .sort((a: any, b: any) => (b.tension || 0) - (a.tension || 0))
      .slice(0, 20);

    for (const n of relevant) {
      const name = n.id.replace(/i\.L\d+\.core\./, "").replace(".ts", "");
      const Lev = (n.level || (64 - n.L)).toFixed(0);
      const Rad = n.L.toFixed(1);
      const D = n.D.toString();
      const T = (n.tension || 0).toString();

      let forceStr = "";
      if (n.debug) {
        const mag = (v: any) => Math.sqrt(v.x * v.x + v.y * v.y).toFixed(2);
        forceStr = `${mag(n.debug.attraction)}/${mag(n.debug.repulsion)}/${
          mag(n.debug.orbital)
        }/${mag(n.debug.spring)}`;
      }

      console.log(
        pad(name, 25) + pad(Lev, 5) + pad(Rad, 5) + pad(D, 5) + pad(T, 5) +
          forceStr,
      );
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

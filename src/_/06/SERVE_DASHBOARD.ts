// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/telemetry/serve_dashboard.md

import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "jsr:@std/yaml@^1.0.5";

const ROOT = Deno.cwd();

async function scanAtoms() {
  const atoms = [];
  for await (const entry of Deno.readDir(ROOT)) {
    if (
      entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")
    ) {
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

        const svg = svgMatch ? svgMatch[0] : null;
        const energy = alpha.energy !== undefined ? Number(alpha.energy) : 100;
        const x = alpha.x !== undefined
          ? Number(alpha.x)
          : Math.floor(Math.random() * 800) + 100;
        const y = alpha.y !== undefined
          ? Number(alpha.y)
          : Math.floor(Math.random() * 600) + 100;
        const bonds = alpha.bonds || [];
        const resonance = alpha.resonance || 0;
        const thought = alpha.thought || "WANDER";

        // --- CASTE CLASSIFICATION ---
        let caste = "NEUTRAL";
        if (resonance > 50) caste = "NUCLEUS";
        else if (logic.startsWith("1")) caste = "WORKER";
        else if (logic.startsWith("8")) caste = "GUARDIAN";
        else if (logic.startsWith("A")) caste = "ARCHIVIST";
        else if (symbol === "PARASITE") caste = "PARASITE";

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
          x: x,
          y: y,
          bonds: bonds,
          thought: thought,
          caste: caste,
          svg: svg,
          isDust: entry.name.includes(".DUST"),
          signals: alpha.signals || [],
          resonance: resonance,
          bondStrengths: alpha.bond_strengths || {},
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
    await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, {
      append: true,
    });
  } catch { /* ignore */ }
}

async function modifyEnergy(
  filename: string,
  amount: number,
  signalType?: string,
): Promise<Response> {
  try {
    const content = await Deno.readTextFile(filename);
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);

    if (!frontmatterMatch) {
      return new Response("Invalid atom format", { status: 400 });
    }

    const alpha = parseYaml(frontmatterMatch[1]) as any;
    const currentEnergy = alpha.energy !== undefined
      ? Number(alpha.energy)
      : 100;

    alpha.energy = Math.max(0, currentEnergy + amount);

    if (signalType) {
      alpha.signals = alpha.signals || [];
      alpha.signals.push({
        type: signalType,
        power: Math.abs(amount) / 2,
        origin: "OBSERVER",
      });
    }

    const newContent = content.replace(
      /^---\n[\s\S]+?\n---\n/,
      `---\n${stringifyYaml(alpha)}---\n`,
    );
    await Deno.writeTextFile(filename, newContent);

    if (alpha.energy === 0 && amount < 0) {
      await appendToAkasha(
        `⚡ HAND_OF_GOD: ${filename} was struck by lightning and disintegrated.`,
      );
    } else if (amount > 0) {
      await appendToAkasha(
        `☀️ HAND_OF_GOD: ${filename} was blessed with +${amount} energy.`,
      );
    }

    return new Response(
      JSON.stringify({ success: true, energy: alpha.energy }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (e) {
    return new Response("Atom not found or error", { status: 404 });
  }
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/feed/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/feed/".length),
    );
    return await modifyEnergy(filename, 50, "ENERGY");
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/zap/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/zap/".length),
    );
    return await modifyEnergy(filename, -50, "SHOCK");
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/bless/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/bless/".length),
    );
    await appendToAkasha(
      `✨ BLESSING: Observer healed ${filename} (+100 Energy)`,
    );
    return await modifyEnergy(filename, 100);
  }

  if (req.method === "POST" && url.pathname === "/api/forge") {
    try {
      const body = await req.json();
      const symbol = body.symbol?.toUpperCase().replace(/[^A-Z0-9_]/g, "") ||
        "ANOMALY";
      let logic =
        body.logic?.toUpperCase().replace(/[^0-9A-F]/g, "").padEnd(8, "0")
          .slice(0, 8) || "88880000";

      // If word is provided, hash it into logic
      if (body.word) {
        const encoder = new TextEncoder();
        const data = encoder.encode(body.word);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        logic = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
          .slice(0, 8).toUpperCase();
        console.log(`   [WORD_FORGE] '${body.word}' -> ${logic}`);
      }

      const energy = Number(body.energy) || 100;

      const eigen = `0x${logic}00000000`;
      const filename = `${eigen}.${symbol}.md`;

      const p = new Deno.Command("deno", {
        args: [
          "eval",
          `
                    import { injectHologram } from "@g12";
                    import { stringify } from "jsr:@std/yaml@^1.0.5";
                    const alpha = { eigenvalue: "${eigen}", energy: ${energy}, x: Math.floor(Math.random()*800)+100, y: Math.floor(Math.random()*600)+100, ex: [], thought: "BORN" };
                    let content = "---\\n" + stringify(alpha) + "---\\n\\nexport const ATOM = () => (x: any) => x;";
                    console.log(injectHologram(content, "${eigen}", "${symbol}"));
                `,
        ],
      });
      const out = await p.output();
      const forgedContent = new TextDecoder().decode(out.stdout);

      await Deno.writeTextFile(filename, forgedContent);
      await appendToAkasha(
        `⚒️ FORGE: Observer materialized '${
          body.word || symbol
        }' (${logic}) with ${energy} energy.`,
      );

      return new Response(JSON.stringify({ success: true, filename }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response("Forge failed", { status: 500 });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/transmute") {
    try {
      // Run mass transmutation logic (multiple pulse cycles)
      const process = new Deno.Command("deno", {
        args: ["run", "--allow-read", "--allow-write", "ZERO_IOPS.ts", "mass"],
      });
      await process.output();
      await appendToAkasha(
        `🌀 TRANSMUTE: Global Zero-IOPS reduction triggered by Observer.`,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response("Transmutation failed", { status: 500 });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/akasha") {
    let logs: string[] = [];
    let memory: any = { reservoir: [], utterances: [] };
    let sovereignty: any = {
      activeDecree: "NONE",
      regent: "NONE",
      legitimacy: 0,
      label: "DEMOCRACY",
    };

    try {
      const logContent = await Deno.readTextFile("AKASHA.log");
      logs = logContent.trim().split("\n").slice(-10);
    } catch { /* ignore */ }

    try {
      const memContent = await Deno.readTextFile("./AKASHA_MEM.json");
      memory = JSON.parse(memContent);
    } catch { /* ignore */ }

    try {
      const sovContent = await Deno.readTextFile("./SOVEREIGNTY.json");
      sovereignty = JSON.parse(sovContent);
    } catch { /* ignore */ }

    return new Response(JSON.stringify({ logs, ...memory, sovereignty }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/api/atoms") {
    const atoms = await scanAtoms();
    return new Response(JSON.stringify(atoms), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/") {
    try {
      const html = await Deno.readTextFile("63/old/ui/DASHBOARD.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch {
      return new Response("DASHBOARD.html not found", { status: 404 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

if (import.meta.main) {
  console.log(
    "🌟 Flatland Petri Dish Dashboard is running on http://localhost:8000",
  );
  serve(handler, { port: 8000 });
}

export const SERVE_DASHBOARD = {
};

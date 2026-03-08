// OMEGA-64 | HOLOGRAM_INJECTOR.ts
// Generates SVG Holograms for all Flatland Atoms

const ROOT = Deno.cwd();
const MARKER_START = "<!-- ∇ HOLOGRAM START ∇ -->";
const MARKER_END = "<!-- Δ HOLOGRAM END Δ -->";

function generateHologram(eigenvalue: string, symbol: string): string {
  const core = eigenvalue.replace("0x", "").toUpperCase();
  if (core.length !== 16) return "";

  const logicHex = core.slice(0, 8);
  const spatialHex = core.slice(8, 12);
  const quantumHex = core.slice(12, 16);

  const logicVal = parseInt(logicHex, 16);
  const spatialVal = parseInt(spatialHex, 16);
  const quantumVal = parseInt(quantumHex, 16);

  const resGroup = (quantumVal >> 4) & 0xFFF;
  const spin = (quantumVal >> 3) & 0x01;
  const phase = (quantumVal >> 1) & 0x03;

  // Mapping to visual properties
  const hue = Math.floor((resGroup / 4095) * 360);
  const compHue = (hue + 180) % 360;
  const rotationBase = phase * 90;
  const animDir = spin === 1 ? 360 : -360;

  // Geometry logic
  const sides = 3 + (logicVal % 6); // 3 to 8 sides
  const r1 = 15 + (spatialVal % 25);
  const r2 = 45 + ((spatialVal >> 4) % 30);

  // Create polygon points
  let pts1 = [];
  let pts2 = [];
  for (let i = 0; i < sides; i++) {
    let a = (i / sides) * Math.PI * 2;
    // Point up/down adjustment
    a -= Math.PI / 2;
    pts1.push(
      `${(100 + Math.cos(a) * r1).toFixed(1)},${
        (100 + Math.sin(a) * r1).toFixed(1)
      }`,
    );
    pts2.push(
      `${(100 + Math.cos(a) * r2).toFixed(1)},${
        (100 + Math.sin(a) * r2).toFixed(1)
      }`,
    );
  }

  const animDuration = Math.max(5, 10 + (spatialVal % 20));

  const svg = `
<div align="center">
${MARKER_START}
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_${core}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(${hue}, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_${core}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_${core})" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(${hue}, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="${rotationBase} 100 100" to="${
    rotationBase + animDir
  } 100 100" dur="${animDuration}s" repeatCount="indefinite" />
    
    <polygon points="${
    pts2.join(" ")
  }" fill="none" stroke="hsl(${compHue}, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="${
    pts1.join(" ")
  }" fill="none" stroke="hsl(${hue}, 80%, 60%)" stroke-width="2" filter="url(#glow_${core})"/>
    
    <circle cx="100" cy="100" r="${r1}" stroke="hsl(${hue}, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(${compHue}, 80%, 70%)" filter="url(#glow_${core})"/>
  
  <text x="100" y="105" fill="hsl(${hue}, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0x${
    core.slice(0, 4)
  }</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">${symbol}</text>
</svg>
${MARKER_END}
</div>`;
  return svg.trim();
}

async function run() {
  let count = 0;
  for await (const entry of Deno.readDir(ROOT)) {
    if (
      entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")
    ) {
      const filename = entry.name;
      const parts = filename.split(".");
      if (parts.length < 3) continue;

      const eigenvalue = parts[0];
      const symbol = parts[1];

      const content = await Deno.readTextFile(filename);
      const svgBlock = generateHologram(eigenvalue, symbol);

      let newContent = content;
      if (content.includes(MARKER_START) && content.includes(MARKER_END)) {
        const regex = new RegExp(
          `<div align="center">\\s*${MARKER_START}[\\s\\S]*?${MARKER_END}\\s*</div>`,
          "g",
        );
        newContent = content.replace(regex, svgBlock);

        if (newContent === content) {
          const backupRegex = new RegExp(
            `${MARKER_START}[\\s\\S]*?${MARKER_END}`,
            "g",
          );
          newContent = content.replace(backupRegex, svgBlock);
        }
      } else {
        const fmMatch = content.match(/^---\r?\n[\s\S]+?\r?\n---\r?\n/);
        if (fmMatch) {
          const insertPos = fmMatch[0].length;
          newContent = content.slice(0, insertPos) + "\n" + svgBlock + "\n\n" +
            content.slice(insertPos);
        }
      }

      if (newContent !== content) {
        await Deno.writeTextFile(filename, newContent);
        count++;
        console.log(`[HOLOGRAM] Rendered ${symbol} (${eigenvalue})`);
      }
    }
  }
  console.log(`\n[HOLOGRAM] Generator finished. Updated ${count} atoms.`);
}

if (import.meta.main) {
  await run();
}

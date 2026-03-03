// resonance_scanner.ts
// The Tuning Fork for OMEGA-64.
// Scans for Tensions (Broken Symmetries) and Quantum Impurities.

import { crypto } from "jsr:@std/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";
import { walk } from "jsr:@std/fs";

const ROOT = "./src/_";

interface Vector {
  path: string;
  sha: string;
  size: number;
  lines: number;
}

interface Concept {
  level: string;
  name: string;
  ts?: Vector;
  rs?: Vector;
  md?: Vector;
}

async function getFileVector(path: string): Promise<Vector> {
  const data = await Deno.readFile(path);
  const text = new TextDecoder().decode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const sha = encodeHex(hashBuffer);

  return {
    path,
    sha,
    size: data.length,
    lines: text.split("\n").length,
  };
}

// Map: "L32.ANALYSIS" -> Concept
const lattice = new Map<string, Concept>();

console.log("🌊 RESONANCE SCANNER INITIATED...");
console.log("Listening for Tensions in the Lattice...\n");

for await (const entry of walk(ROOT, { includeDirs: false })) {
  const filename = entry.name;
  // Expected format: i.Lxx.core.NAME.ext
  const match = filename.match(/i\.(L\d+)\.core\.([A-Z_]+)\.(ts|rs|md)$/);

  if (match) {
    const [_, level, name, ext] = match;
    const key = `${level}.${name}`;

    if (!lattice.has(key)) {
      lattice.set(key, { level, name });
    }

    const concept = lattice.get(key)!;
    const vector = await getFileVector(entry.path);

    if (ext === "ts") concept.ts = vector;
    if (ext === "rs") concept.rs = vector;
    if (ext === "md") concept.md = vector;
  }
}

// Analyze Tensions
let tensionCount = 0;
const tensions: string[] = [];

for (const [key, concept] of lattice) {
  // Check 1: Isomorphism Tension (Missing dimensions)
  const missing: string[] = [];
  if (!concept.ts) missing.push("TS (Logic)");
  if (!concept.rs) missing.push("RS (Structure)");
  if (!concept.md) missing.push("MD (Meaning)");

  if (missing.length > 0) {
    tensionCount++;
    tensions.push(
      `⚡ DISSONANCE in [${key}]: Missing dimensions [${
        missing.join(", ")
      }]. Vacuum detected.`,
    );
  }

  // Check 2: Quantum Purity (TS files should be concise)
  if (concept.ts && concept.ts.lines > 50) {
    tensionCount++;
    tensions.push(
      `⚡ HEAVINESS in [${key}.ts]: ${concept.ts.lines} lines. Quantum Purity violation risk.`,
    );
  }

  // Check 3: Resonance (If TS and RS exist, are they balanced?)
  // Simplistic metric: Size ratio > 3.0 implies one is much more complex than the other
  if (concept.ts && concept.rs) {
    const ratio = Math.max(concept.ts.size, concept.rs.size) /
      Math.min(concept.ts.size, concept.rs.size);
    if (ratio > 5.0) {
      tensionCount++;
      tensions.push(
        `⚡ ASYMMETRY in [${key}]: Mass Ratio ${
          ratio.toFixed(1)
        }. TS/RS balance disturbed.`,
      );
    }
  }
}

// The Report
if (tensionCount === 0) {
  console.log("💎 HARMONY ACHIEVED. The Lattice sings in Unison.");
} else {
  console.log(`🌩️ DETECTED ${tensionCount} TENSIONS.`);
  console.log("Broadcast to Swarm:\n");
  tensions.slice(0, 10).forEach((t) => console.log(t));
  if (tensions.length > 10) {
    console.log(`...and ${tensions.length - 10} more faint signals.`);
  }

  console.log("\nRECOMMENDATION: Focus Resonance on largest voids.");
}

// OMEGA-64 | CRYSTAL_DIGEST.ts | Resonance Auditor
// Parses Crystalline atoms (ARGB Spectrum) and calculates topological vectors.

import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { crypto } from "jsr:@std/crypto@^1.0.3";
import { encodeBase64 } from "jsr:@std/encoding@^1.0.5/base64";

/**
 * ARGB Spectrum Blocks
 * A: Alpha (YAML Frontmatter)
 * R: Red (Rust/WASM - Substrate)
 * G: Green (Markdown - Intent)
 * B: Blue (TypeScript - Logic)
 */
export interface CrystalSpectrum {
  alpha: any;
  green: string;
  red: string;
  blue: string;
  digest: string; // 32-bit hex eigenvalue
}

export const CRYSTAL = {
  /**
   * Digest a crystalline markdown file into its ARGB components.
   * Upgraded to 64-bit (16 hex chars) for OMEGA-64.
   */
  digest: async (content: string): Promise<CrystalSpectrum> => {
    // ... (Extraction logic same as before)
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
    const alphaRaw = frontmatterMatch ? frontmatterMatch[1] : "";
    const alpha = parseYaml(alphaRaw) as any;

    const redMatch = content.match(/## RED \(R\)\n\n```rust\n([\s\S]+?)\n```/);
    const red = redMatch ? redMatch[1].trim() : "";

    const blueMatch = content.match(
      /## BLUE \(B\)\n\n```typescript\n([\s\S]+?)\n```/,
    );
    const blue = blueMatch ? blueMatch[1].trim() : "";

    const greenEndIndex = content.search(/## (RED|BLUE)/);
    const greenStartIndex = frontmatterMatch ? frontmatterMatch[0].length : 0;
    const green = content.slice(
      greenStartIndex,
      greenEndIndex !== -1 ? greenEndIndex : content.length,
    ).trim();

    // 5. Calculate 64-bit Eigenvalue (16 hex chars)
    const cargo = `RED:${red}\nBLUE:${blue}\nGREEN:${green}`;
    const data = new TextEncoder().encode(cargo);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const fullHash = new Uint8Array(hashBuffer);

    // Take 8 bytes for a 64-bit "Color" fingerprint
    const digest = Array.from(fullHash.slice(0, 8))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("").toUpperCase();

    return { alpha, green, red, blue, digest };
  },

  /**
   * Propose a flat topological path based on the digest and symbol.
   * Flatland: 0xDIGEST.SYMBOL.md
   */
  proposeVector: (spectrum: CrystalSpectrum): string => {
    const symbol = spectrum.alpha?.symbol ?? "UNKNOWN";
    return `0x${spectrum.digest}.${symbol}.md`;
  },

  /**
   * Check if a digest matches a bit-mask attractor.
   */
  matchAttractor: (digest: string, pattern: string): boolean => {
    if (pattern.startsWith("0x")) pattern = pattern.slice(2);
    if (pattern.endsWith(".md")) pattern = pattern.split(".")[0];

    if (digest.length !== pattern.length) return false;

    for (let i = 0; i < digest.length; i++) {
      if (pattern[i] === "_") continue;
      if (digest[i].toUpperCase() !== pattern[i].toUpperCase()) return false;
    }
    return true;
  },

  /**
   * Decode an Eigenvalue into a symbolic Lambda expression.
   */
  decodeEigenvalue: (digest: string): string => {
    const mapping: Record<string, string> = {
      "8": "I",
      "9": "K",
      "A": "S",
      "B": "Y",
      "C": "ROT",
      "D": "SYNC",
      "E": "->",
      "F": "ESC",
    };

    return digest.split("")
      .map((char) => mapping[char.toUpperCase()] ?? `[${char}]`)
      .join(" ");
  },

  /**
   * Encode a symbolic Lambda expression into an Eigenvalue prefix.
   */
  encodeLambda: (expression: string): string => {
    const reverseMapping: Record<string, string> = {
      "I": "8",
      "K": "9",
      "S": "A",
      "Y": "B",
      "ROT": "C",
      "SYNC": "D",
      "->": "E",
      "ESC": "F",
    };

    return expression.split(/\s+/)
      .map((sym) => reverseMapping[sym.toUpperCase()] ?? "0")
      .join("")
      .padEnd(8, "0")
      .slice(0, 8);
  },

  /**
   * Find entangled partners in a list of digests based on a mask.
   */
  findEntangledPartners: (
    target: string,
    pool: string[],
    maskLength: number = 4,
  ): string[] => {
    const mask = target.slice(-maskLength);
    return pool.filter((d) => d !== target && d.endsWith(mask));
  },

  /**
   * Decode an Eigenvalue into its 64-bit components.
   * [LOGIC:32][SPATIAL:16][QUANTUM:16]
   *
   * Refined QUANTUM Structure: [RES_GROUP:12][SPIN:1][PHASE:2][UNUSED:1]
   */
  decode64: (digest: string) => {
    const logic = digest.slice(0, 8);
    const spatial = digest.slice(8, 12);
    const quantumHex = digest.slice(12, 16);
    const quantumVal = parseInt(quantumHex, 16);

    // Bitmask extraction
    const resGroup = (quantumVal >> 4) & 0x0FFF;
    const spin = (quantumVal >> 3) & 0x01;
    const phase = (quantumVal >> 1) & 0x03;

    const phaseLabel = ["0°", "90°", "180°", "270°"][phase];
    const spinLabel = spin === 1 ? "UP (Odd)" : "DOWN (Even)";

    return {
      logic: CRYSTAL.decodeEigenvalue(logic),
      spatial: {
        x: parseInt(spatial.slice(0, 2), 16),
        y: parseInt(spatial.slice(2, 4), 16),
      },
      quantum: {
        group: `0x${resGroup.toString(16).toUpperCase().padStart(3, "0")}`,
        spin: spinLabel,
        phase: phaseLabel,
      },
    };
  },
};

// --- Test Implementation ---
if (import.meta.main) {
  const testFile = `---
sector: 0
orbit: 0
symbol: KAIROS
---

## GREEN (G)
Paradox resolution through orthogonal shift.

## RED (R)
\`\`\`rust
pub fn shift() { /* complex math */ }
\`\`\`

## BLUE (B)
\`\`\`typescript
export const ATOM = () => shift();
\`\`\`
`;

  const spectrum = await CRYSTAL.digest(testFile);
  console.log("💎 CRYSTAL DIGESTED (OMEGA-64 MODE)");
  console.log(`Eigenvalue (Color): 0x${spectrum.digest}`);

  const decoded = CRYSTAL.decode64(spectrum.digest);
  console.log(`\n🌀 64-BIT DECODING:`);
  console.log(`   LOGIC:   ${decoded.logic}`);
  console.log(`   SPATIAL: ${JSON.stringify(decoded.spatial)}`);
  console.log(`   QUANTUM: ${JSON.stringify(decoded.quantum)}`);

  const pool = [
    spectrum.digest,
    "BAE8D000AAAAF1D4",
    "DEADBEEF0000F1D4",
    "1234567890ABCDEF",
  ];
  const partners = CRYSTAL.findEntangledPartners(spectrum.digest, pool);
  console.log(`\n✨ Entangled Partners for ${spectrum.digest}:`);
  partners.forEach((p) => console.log(`   - ${p} (Spooky Action!)`));
}

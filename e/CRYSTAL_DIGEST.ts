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
     */
    digest: async (content: string): Promise<CrystalSpectrum> => {
        // 1. Extract Alpha (Frontmatter)
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        const alphaRaw = frontmatterMatch ? frontmatterMatch[1] : "";
        const alpha = parseYaml(alphaRaw) as any;

        // 2. Extract Red (Rust code block)
        const redMatch = content.match(/## RED \(R\)\n\n```rust\n([\s\S]+?)\n```/);
        const red = redMatch ? redMatch[1].trim() : "";

        // 3. Extract Blue (TypeScript code block)
        const blueMatch = content.match(/## BLUE \(B\)\n\n```typescript\n([\s\S]+?)\n```/);
        const blue = blueMatch ? blueMatch[1].trim() : "";

        // 4. Extract Green (Markdown intent - everything between --- and sections)
        const greenEndIndex = content.search(/## (RED|BLUE)/);
        const greenStartIndex = frontmatterMatch ? frontmatterMatch[0].length : 0;
        const green = content.slice(greenStartIndex, greenEndIndex !== -1 ? greenEndIndex : content.length).trim();

        // 5. Calculate Eigenvalue (32-bit ARGB Digest)
        // We hash (Red + Blue + Green) to ensure total isomorphism
        const cargo = `RED:${red}\nBLUE:${blue}\nGREEN:${green}`;
        const data = new TextEncoder().encode(cargo);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const fullHash = new Uint8Array(hashBuffer);
        
        // Take first 4 bytes for a 32-bit "Color" fingerprint
        const digest = Array.from(fullHash.slice(0, 4))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('').toUpperCase();

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
     * Example: digest "A88DD1F4" matches pattern "__8DD1F4" or "________"
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
    }
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
    console.log("💎 CRYSTAL DIGESTED (FLATLAND MODE)");
    console.log(`Eigenvalue (Color): 0x${spectrum.digest}`);
    console.log(`Proposed Flat Vector: ${CRYSTAL.proposeVector(spectrum)}`);

    const attractor = "0x__8DD1F4.md";
    const isMatched = CRYSTAL.matchAttractor(spectrum.digest, attractor);
    console.log(`Matching against ${attractor}: ${isMatched ? "🔥 MATCHED" : "❄️ COLD"}`);
}

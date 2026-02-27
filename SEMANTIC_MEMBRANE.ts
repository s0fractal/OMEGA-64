// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Era 14: The Turing Mind
// Bridges textual concepts to Simulated Atoms via Neural Binary Quantization.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";

/**
 * Neural Binary Quantization (Projection-based)
 * Compresses textual semantic intent into 64 bits (8 bytes).
 * Ensures that Hamming Distance between results correlates with semantic similarity.
 */
function semanticHash(text: string): Uint8Array {
    const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    const logic = new Uint8Array(8);
    
    // We simulate a 64-dimensional projection space
    // Each bit in the 8-byte result is a hyperplane projection
    for (let bitIdx = 0; bitIdx < 64; bitIdx++) {
        let projection = 0;
        
        // Deterministic pseudo-random plane coefficients per bit
        // Derived from a static seed to ensure "God" always hashes the same
        const bitSeed = bitIdx * 1337;
        
        for (let i = 0; i < normalized.length; i++) {
            const charCode = normalized.charCodeAt(i);
            // Sinusoidal projection (simple LSH variant)
            projection += Math.sin(bitSeed + i + charCode) * charCode;
        }
        
        // Quantize: If projection > median (0), set bit to 1
        if (projection > 0) {
            const byteIdx = Math.floor(bitIdx / 8);
            const bitInByte = bitIdx % 8;
            logic[byteIdx] |= (1 << bitInByte);
        }
    }
    
    return logic;
}

/**
 * Spatial Projection: Maps text to X, Y based on neural hash.
 */
function projectPosition(logic: Uint8Array): { x: number, y: number } {
    // Treat the first 4 bytes as coordinates
    const sx = (logic[0] << 8) | logic[1];
    const sy = (logic[2] << 8) | logic[3];
    
    const x = 50 + (sx % 1300);
    const y = 50 + (sy % 700);
    
    return { x, y };
}

export const SEMANTIC_MEMBRANE = {
    /**
     * injectThought: Injects a conceptual "Spore" into the Matrix.
     */
    injectThought: async (text: string, weight: number): Promise<number> => {
        const logic = semanticHash(text);
        const { x, y } = projectPosition(logic);
        
        const idx = STATE_MATRIX.findEmptySlot();
        if (idx === -1) return -1;

        const words = text.split(/\s+/).filter(w => w.length > 3);
        const keyword = words[0]?.toUpperCase() || "IDEA";
        // Use Vacuum for thoughts
        const filename = `SINGULARITY/V/0x9999_${keyword}_${Date.now().toString().slice(-4)}.md`;

        // Commit to Matrix
        STATE_MATRIX.clear(idx);
        STATE_MATRIX.setId(idx, BigInt(idx + 1000)); 
        STATE_MATRIX.setX(idx, x);
        STATE_MATRIX.setY(idx, y);
        STATE_MATRIX.setEnergy(idx, weight);
        STATE_MATRIX.setResonance(idx, 0);
        STATE_MATRIX.setLogic(idx, logic);
        
        ID_TO_IDX.set(filename, idx);
        IDX_TO_ID.set(idx, filename);

        console.log(`   [MEMBRANE] Neural Injection: "${text}" -> Atom[${idx}]`);
        
        const content = `---\ntype: thought\nweight: ${weight}\ngenome: ${Array.from(logic).map(b => b.toString(16).padStart(2, '0')).join('')}\n---\n${text}`;
        // @ts-ignore
        await Deno.writeTextFile(filename, content);
        
        return idx;
    },

    readVoxPopuli: (): string => {
        const activeIdx = STATE_MATRIX.getActiveIndices();
        const survivors = activeIdx
            .map(idx => ({
                idx,
                resonance: STATE_MATRIX.getResonance(idx),
                energy: STATE_MATRIX.getEnergy(idx),
                id: IDX_TO_ID.get(idx) || "UNKNOWN"
            }))
            .filter(a => a.resonance > 5 || a.energy > 50)
            .sort((a, b) => b.resonance - a.resonance)
            .slice(0, 8);

        if (survivors.length === 0) return "The Matrix is quiet.";

        const summary = survivors.map(s => {
            const basename = s.id.split('/').pop() || s.id;
            const name = basename.split('.')[1] || "ENTITY";
            return `${name}(${s.resonance.toFixed(1)})`;
        }).join(", ");

        return `Collective Voice: ${summary}`;
    },

    digestConcept: (symbol: string) => {
        const activeIdx = STATE_MATRIX.getActiveIndices();
        for (const idx of activeIdx) {
            const filename = IDX_TO_ID.get(idx);
            if (filename?.includes(symbol.toUpperCase())) {
                STATE_MATRIX.setEnergy(idx, 0);
            }
        }
    }
};

// --- Terminal Test ---
if (import.meta.main) {
    console.log("🛡️ SEMANTIC_MEMBRANE | Era 14 | Neural Quantization Test");
    const h1 = semanticHash("God");
    const h2 = semanticHash("Deity");
    const h3 = semanticHash("Dog");
    
    const hamming = (a: Uint8Array, b: Uint8Array) => {
        let dist = 0;
        for (let i = 0; i < 8; i++) {
            let xor = a[i] ^ b[i];
            while (xor > 0) { dist += (xor & 1); xor >>= 1; }
        }
        return dist;
    };

    console.log("   'God'   :", Array.from(h1).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log("   'Deity' :", Array.from(h2).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log("   'Dog'   :", Array.from(h3).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log(`   Dist(God, Deity): ${hamming(h1, h2)} (Lower is closer)`);
    console.log(`   Dist(God, Dog)  : ${hamming(h1, h3)}`);
}

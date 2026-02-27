// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Era 9: The Cognitive Synapse
// Bridges textual concepts to Simulated Atoms via LSH-Lite hashing.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { RIBOSOME, ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

/**
 * LSH-Lite: Locality Sensitive Hashing for 8-byte Logic.
 * Aims to produce similar bytes for similar character distributions.
 */
function semanticHash(text: string): Uint8Array {
    const normalized = text.toLowerCase().replace(/[^a-z]/g, "");
    const logic = new Uint8Array(8);
    
    // Feature buckets (Syllabic/Char distribution)
    for (let i = 0; i < normalized.length; i++) {
        const charCode = normalized.charCodeAt(i);
        const bucket = charCode % 8;
        logic[bucket] = (logic[bucket] + charCode) % 256;
    }
    
    // Salt with length to reflect complexity
    logic[0] = (logic[0] ^ normalized.length) % 256;
    
    return logic;
}

/**
 * Spatial Projection: Maps text to X, Y based on hash.
 * Ensures semantically similar thoughts spawn in physical proximity.
 */
function projectPosition(logic: Uint8Array): { x: number, y: number } {
    const seedX = (logic[0] << 8) | logic[1];
    const seedY = (logic[2] << 8) | logic[3];
    
    // Map to normalized arena (50-1350, 50-750)
    const x = 50 + (seedX % 1300);
    const y = 50 + (seedY % 700);
    
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
        if (idx === -1) {
            console.error("   [MEMBRANE] Matrix Saturation: No empty slots for new thoughts.");
            return -1;
        }

        // Generate a filename/ID (e.g., i.L99.thought.WORD.md)
        const words = text.split(/\s+/).filter(w => w.length > 3);
        const keyword = words[0]?.toUpperCase() || "IDEA";
        const filename = `./i.L99.thought.${keyword}_${Date.now().toString().slice(-4)}.md`;

        // Commit to Matrix
        STATE_MATRIX.clear(idx);
        STATE_MATRIX.setId(idx, BigInt(idx + 1000)); // Internal virtual ID
        STATE_MATRIX.setX(idx, x);
        STATE_MATRIX.setY(idx, y);
        STATE_MATRIX.setEnergy(idx, weight);
        STATE_MATRIX.setResonance(idx, 0);
        STATE_MATRIX.setLogic(idx, logic);
        
        // Link to RIBOSOME mappings
        ID_TO_IDX.set(filename, idx);
        IDX_TO_ID.set(idx, filename);

        console.log(`   [MEMBRANE] Injected: "${text}" -> Atom[${idx}] at (${x},${y})`);
        
        // Persist the "Spore" to Flatland
        const content = `---\ntype: thought\nweight: ${weight}\norigin: semantic_membrane\n---\n${text}`;
        await Deno.writeTextFile(filename, content);
        
        return idx;
    },

    /**
     * readVoxPopuli: Extracts the "Collective Consciousness" status.
     * Finds high-resonance atoms and aggregates their conceptual symbols.
     */
    readVoxPopuli: (): string => {
        const activeIdx = STATE_MATRIX.getActiveIndices();
        const survivors = activeIdx
            .map(idx => ({
                idx,
                resonance: STATE_MATRIX.getResonance(idx),
                energy: STATE_MATRIX.getEnergy(idx),
                id: IDX_TO_ID.get(idx) || "UNKNOWN"
            }))
            .filter(a => a.resonance > 10 || a.energy > 80)
            .sort((a, b) => b.resonance - a.resonance)
            .slice(0, 10);

        if (survivors.length === 0) return "The Matrix is quiet.";

        const summary = survivors.map(s => {
            const parts = s.id.split(".");
            const name = parts[parts.length - 2] || "ENTITY";
            return `${name}(Resonance: ${s.resonance.toFixed(1)})`;
        }).join(", ");

        return `Collective Voice: ${summary}`;
    },

    /**
     * digestConcept: Forgets/Deletes a concept by setting energy to 0.
     */
    digestConcept: (symbol: string) => {
        const activeIdx = STATE_MATRIX.getActiveIndices();
        for (const idx of activeIdx) {
            const filename = IDX_TO_ID.get(idx);
            if (filename?.includes(symbol.toUpperCase())) {
                console.log(`   [MEMBRANE] Digesting concept: ${symbol}`);
                STATE_MATRIX.setEnergy(idx, 0); // Mark for DEATH in PULSE.ts
            }
        }
    }
};

// --- Terminal Test (Dry Run) ---
if (import.meta.main) {
    console.log("🛡️ SEMANTIC_MEMBRANE | Era 9 | Diagnostic Mode");
    const h1 = semanticHash("Life is computation");
    const h2 = semanticHash("Life is code");
    console.log("   H1:", Array.from(h1).map(b => b.toString(16).padStart(2, '0')).join(','));
    console.log("   H2:", Array.from(h2).map(b => b.toString(16).padStart(2, '0')).join(','));
    console.log("   Similarity Check: ", h1[1] === h2[1] ? "RESONANCE DETECTED" : "Divergent");
}

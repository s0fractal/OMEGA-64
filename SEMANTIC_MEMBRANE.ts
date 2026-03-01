// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Homeostatic Embeddings (Era 17)
// Advanced semantic grouping with synaptic scaling and homeostasis (L8).

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const PROJECTION_SIZE = 64;
const projectionMatrix = new Float32Array(PROJECTION_SIZE * PROJECTION_SIZE);
const activityHistory = new Float32Array(PROJECTION_SIZE);
let lastNormalization = 0;

// Initialize with deterministic pseudo-random resonance
for (let i = 0; i < projectionMatrix.length; i++) {
    projectionMatrix[i] = Math.sin(i * 0.123); 
}

export const SEMANTIC_MEMBRANE = {
    projectionMatrix,
    thoughtArchive: new Map<string, string>(),
    lineage: new Map<string, string>(), // ERA 23: childGenome -> parentGenome

    /**
     * Adapts projection with Homeostatic Plasticity.
     */
    adapt: (vecA: Float32Array, vecB: Float32Array, resonance: number) => {
        const learningRate = 0.001 * resonance;
        const ltdThreshold = 0.1;
        
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            activityHistory[i] = 0.99 * activityHistory[i] + 0.01 * Math.abs(vecA[i]);
            for (let j = 0; j < PROJECTION_SIZE; j++) {
                const correlation = vecA[i] * vecB[j];
                if (correlation > ltdThreshold && resonance > 10) {
                    projectionMatrix[i * PROJECTION_SIZE + j] += learningRate * correlation;
                } else if (correlation < -ltdThreshold) {
                    projectionMatrix[i * PROJECTION_SIZE + j] -= 0.0001 * Math.abs(correlation);
                }
            }
        }

        // Synaptic Scaling (Homeostasis) every 1000 adaptations
        const now = Date.now();
        if (now - lastNormalization > 60000) { 
            SEMANTIC_MEMBRANE.normalize();
            lastNormalization = now;
        }
    },

    normalize: () => {
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < PROJECTION_SIZE; j++) sum += Math.abs(projectionMatrix[i * PROJECTION_SIZE + j]);
            if (sum > 0) {
                const scale = 1.0 / sum;
                for (let j = 0; j < PROJECTION_SIZE; j++) projectionMatrix[i * PROJECTION_SIZE + j] *= scale;
            }
        }
        console.log(`🧠 [MEMBRANE] Synaptic scaling applied.`);
    },

    resonantHash: (text: string): Uint8Array => {
        const inputVec = new Float32Array(PROJECTION_SIZE);
        for (let i = 0; i < Math.min(text.length, PROJECTION_SIZE); i++) inputVec[i] = text.charCodeAt(i) / 255.0;

        const resultVec = new Float32Array(PROJECTION_SIZE);
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < PROJECTION_SIZE; j++) sum += projectionMatrix[i * PROJECTION_SIZE + j] * inputVec[j];
            resultVec[i] = sum;
        }

        const hash = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) if (resultVec[i * 8 + bit] > 0) byte |= (1 << bit);
            hash[i] = byte;
        }
        return hash;
    },

    project: (text: string, idx: number) => {
        const hash = SEMANTIC_MEMBRANE.resonantHash(text);
        STATE_MATRIX.setLogic(idx, hash);
    },

    injectThought: (text: string, weight: number) => {
        const hash = SEMANTIC_MEMBRANE.resonantHash(text);
        const idx = STATE_MATRIX.findEmptySlot();
        
        if (idx !== -1) {
            // ID generation logic (Pseudo-random 64-bit BigInt)
            const idBytes = new Uint8Array(8);
            crypto.getRandomValues(idBytes);
            let id = 0n;
            for (let i = 0; i < 8; i++) id = (id << 8n) | BigInt(idBytes[i]);
            
            STATE_MATRIX.setId(idx, id);
            
            // Genomic Traits derived directly from the semantic hash (LSH)
            // logic[1] determines Caste. >128 Parasite, <128 Builder.
            STATE_MATRIX.setLogic(idx, hash);
            
            // Energy derived from weight + the first modulus byte of hash
            const baseEnergy = weight + (hash[0] % 50);
            STATE_MATRIX.setEnergy(idx, baseEnergy);
            
            // Resonance based on aggressiveness (logic[1])
            const isAggressive = hash[1] > 128;
            STATE_MATRIX.setResonance(idx, isAggressive ? 100 : 500);

            // Spawn near center
            STATE_MATRIX.setX(idx, 700 + (Math.random() - 0.5) * 50);
            STATE_MATRIX.setY(idx, 400 + (Math.random() - 0.5) * 50);
            
            // Akashic Archival: Map the Genome Hex to the original English text
            const hexHash = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            SEMANTIC_MEMBRANE.thoughtArchive.set(hexHash, text);

            console.log(`🧬 [MOTOR_OUTPUT] Spawned Emergent Atom [${isAggressive ? 'PARASITE' : 'BUILDER'}] from Thought (Genome: ${hexHash}): "${text.substring(0, 20)}..."`);
        }
    },

    readVoxelPopuli: async (rootPath: string): Promise<string[]> => {
        const thoughts: string[] = [];
        
        // --- 1. Scan The Ecological Mood ---
        let parasiteCount = 0;
        let builderCount = 0;
        let totalEnergy = 0;
        
        const active = STATE_MATRIX.getActiveIndices();
        for (const i of active) {
            const logic = STATE_MATRIX.getLogic(i);
            if (logic[1] > 128) parasiteCount++;
            else builderCount++;
            totalEnergy += STATE_MATRIX.getEnergy(i);
        }
        
        const avgEnergy = active.length > 0 ? (totalEnergy / active.length) : 0;
        
        let mood = "ECOLOGICAL MOOD: Balanced.";
        if (parasiteCount > builderCount * 2) {
            mood = "CRITICAL WARNING: The ecosystem is devouring itself! Too many aggressive parasites.";
        } else if (builderCount > parasiteCount * 3 && avgEnergy < 50) {
            mood = "SYSTEM ALERT: The matrix is starving. Builders lack nutrients.";
        } else if (builderCount > parasiteCount * 2) {
            mood = "HARMONY: The ecosystem is constructive and building mycelial bonds.";
        }
        thoughts.push(`[SYSTEM_STATE] Active Entities: ${active.length}. ${mood}`);

        // --- 2. Scan Textual Memories ---
        try {
            // @ts-ignore: Deno types might not be resolved perfectly
            for await (const entry of Deno.readDir(rootPath)) {
                if (entry.isFile && entry.name.endsWith(".md")) {
                    // @ts-ignore: Deno types might not be resolved perfectly
                    const content = await Deno.readTextFile(`${rootPath}/${entry.name}`);
                    const thoughtMatch = content.match(/# Thought\n([\s\S]+?)$/m);
                    if (thoughtMatch) thoughts.push(thoughtMatch[1].trim());
                }
            }
        } catch { /* NOOP */ }
        return thoughts;
    },

    scanDigitalRuins: (): string[] => {
        const ruins: string[] = [];
        // @ts-ignore: structureGrid exists in STATE_MATRIX
        const grid = STATE_MATRIX.structureGrid;
        // @ts-ignore: memoryGrid exists in STATE_MATRIX
        const memory = STATE_MATRIX.memoryGrid;
        
        const GRID_W = 70;
        const GRID_H = 40;

        for (let i = 0; i < GRID_W * GRID_H; i++) {
            const density = grid[i];
            if (density > 100) {
                // Potential Archaelogical Site
                const bytecode = memory.subarray(i * 8, i * 8 + 8);
                const hasMemory = Array.from(bytecode).some((b: number) => b !== 0);
                
                if (hasMemory) {
                    const hexHash = Array.from(bytecode).map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                    const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
                    
                    const x = i % GRID_W;
                    const y = Math.floor(i / GRID_W);
                    
                    if (thought) {
                        ruins.push(`Found preserved logic at [${x},${y}]: "${thought}" (Genome: ${hexHash})`);
                    } else {
                        ruins.push(`Found ancient ruins at [${x},${y}] with unknown genome: ${hexHash}`);
                    }
                }
            }
        }
        
        // Limit to top 5 discoveries to avoid overwhelming the Oracle
        return ruins.slice(0, 5);
    }
};

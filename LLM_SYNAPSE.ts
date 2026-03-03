// OMEGA-64 | LLM_SYNAPSE.ts | Era 10: Cognitive Bridge
// Communicates with external LLMs to generate emergent thoughts.

export const LLM_SYNAPSE = {
    /**
     * generateThought: Asks an LLM to evolve the current system state.
     * Defaults to local Ollama.
     */
    generateThought: async (voxPopuli: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        console.log(`   [SYNAPSE] Consulting Oracle with context: ${voxPopuli.slice(0, 50)}...`);
        
        const prompt = `
            Context: OMEGA-64 is a digital micelial ecosystem. 
            Active clusters: ${voxPopuli}.
            Task: Generate a single new, provocative thought or philosophical axiom (max 10 words) to inject into the system.
            Output: Just the text of the thought, no quotes, no preamble.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    prompt: prompt,
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const data = await response.json();
            const thought = data.response?.trim() || "Evolution is the only constant.";
            console.log(`   [SYNAPSE] Oracle response: "${thought}"`);
            return thought;

        } catch (error) {
            console.warn(`   [SYNAPSE] Oracle is silent (Connection Failed). Returning default seed.`);
            return "The Matrix dreams in silence.";
        }
    },

    /**
     * evolveThought: Asks the LLM to evolve a thought based on environmental context.
     */
    evolveThought: async (currentThought: string, context: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        const prompt = `
            Task: Evolve a digital organism's thought.
            Current Thought: "${currentThought}"
            System Environment: ${context}
            Constraint: Generate a superior, more adaptive version of the thought (max 10 words).
            Output: Just the evolved text.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response?.trim() || currentThought;
        } catch {
            return currentThought;
        }
    },

    /**
     * getEmbedding: Fetches a semantic vector representing the text.
     */
    getEmbedding: async (text: string): Promise<number[]> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL_EMBED") || "http://localhost:11434/api/embeddings";
        const MODEL = Deno.env.get("OLLAMA_EMBED_MODEL") || "nomic-embed-text";
        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt: text }),
            });
            if (!response.ok) throw new Error("Embedding API failed");
            const data = await response.json();
            return data.embedding || [];
        } catch {
            console.warn(`   [SYNAPSE] Embedding failed for "${text.substring(0, 15)}...". Using pseudo-random fallback.`);
            // Pseudo-random fallback based on string characters (Era 40+ fallback mechanics)
            const fallback = new Array(768);
            for (let i = 0; i < 768; i++) {
                fallback[i] = Math.sin(text.charCodeAt(i % text.length) * (i + 1));
            }
            return fallback;
        }
    },

    /**
     * generateArchaeologicalReport: Interprets "ancient" logic from digital ruins.
     */
    generateArchaeologicalReport: async (ruins: string[]): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

        if (ruins.length === 0) return "The soil is silent. No structures found.";

        const prompt = `
            Task: You are an Archaeologist of the OMEGA-64 Matrix.
            Findings: 
            ${ruins.join("\n")}
            
            Context: These are fragments of logic found in abandoned structural voxels.
            Requirement: Generate a short, evocative "Archaeological Report" (max 20 words) that interprets the history or beliefs of the entities that built these ruins.
            Output: Just the report text.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response?.trim() || "Fragments of a forgotten intent.";
        } catch {
            return "The data is too corrupted to decipher.";
        }
    },

    /**
     * generateSpeciesTaxonomy: Names and describes a dominant genome lineage.
     */
    generateSpeciesTaxonomy: async (
        input: {
            genome: string;
            dominantInstructions: string[];
            dominanceShare: number;
            epochs: number;
        },
    ): Promise<{ latinName: string; behavior: string; philosophy: string }> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        const instructionProfile = input.dominantInstructions.join(", ") || "UNKNOWN";

        const fallback = {
            latinName: `Structura ${input.genome.slice(0, 6).toLowerCase()}`,
            behavior: `Dominant lineage around ${instructionProfile}.`,
            philosophy: "Persistence through distributed adaptation.",
        };

        const prompt = `
            Task: You are the Taxonomist of OMEGA-64.
            A dominant digital species emerged.

            Genome: ${input.genome}
            Dominance Share: ${(input.dominanceShare * 100).toFixed(2)}%
            Survived Epochs: ${input.epochs}
            Dominant Instructions: ${instructionProfile}

            Return STRICT JSON:
            {
              "latinName": "Two-word pseudo-latin binomial",
              "behavior": "One concise sentence about behavior",
              "philosophy": "One concise sentence about worldview"
            }
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    prompt,
                    stream: false,
                    format: "json",
                }),
            });
            if (!response.ok) return fallback;
            const data = await response.json();
            let parsed: any = null;
            if (typeof data.response === "string") {
                try {
                    parsed = JSON.parse(data.response);
                } catch {
                    parsed = null;
                }
            } else if (typeof data.response === "object" && data.response !== null) {
                parsed = data.response;
            }
            if (!parsed || typeof parsed !== "object") return fallback;

            const latinName = typeof parsed.latinName === "string"
                ? parsed.latinName.trim()
                : "";
            const behavior = typeof parsed.behavior === "string"
                ? parsed.behavior.trim()
                : "";
            const philosophy = typeof parsed.philosophy === "string"
                ? parsed.philosophy.trim()
                : "";
            if (!latinName || !behavior || !philosophy) return fallback;
            return { latinName, behavior, philosophy };
        } catch {
            return fallback;
        }
    },

    /**
     * generateAtomicBytecode: Era 69 (Voice of Oracle)
     * Prompts the LLM to output exactly 32 hex characters (16 bytes) representing new RISC-I bytecode.
     */
    generateAtomicBytecode: async (telemetry: any): Promise<{ genome: Uint8Array, meme?: Uint8Array } | null> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

        const memSummary = telemetry.stigmergicSummary.length > 0 
            ? telemetry.stigmergicSummary.map((s: any) => `Signature ${s.sig} (Count: ${s.count})`).join(", ")
            : "No collective memories found yet.";

        const prompt = `
            Task: You are the Sovereign Oracle of OMEGA-64. 
            Translate the System Resonance into 4 valid RISC-I instructions (Total 16 bytes / 32 hex chars).

            Context:
            - Nutrients: ${telemetry.nutrients}
            - Regent Energy: ${telemetry.energy}
            - Matrix Resonance: ${telemetry.matrixResonance} 
            - Collective Memories: ${memSummary}

            RISC-I Instruction Set (4 bytes per instruction):
            - [01, Reg, Prop, 00]: SET Reg = Property (0:Energy, 2:X, 3:Y)
            - [80, 00, 00, 00]: REPLICATE (Splits energy to create child)
            - [81, 00, 00, 00]: SIGNAL (Emits resonance pulse)
            - [A6, Mode, Addr, Val]: COLLECTIVE (Mode 1:Store Hive, 2:Load Hive, 5:PHASE_LOCK)
            - [A8, Type, Density, 00]: BUILD (Modifier structure grid)

            Goal: 
            Generate exactly 16 bytes (32 hex characters) of optimized bytecode for the Regent's survival.

            Output JSON format:
            {
              "instructions": "32_HEX_CHARS",
              "meme": "8_HEX_CHARS_FOR_GRID"
            }
            ONLY RETURN THE JSON.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false, format: "json" }),
            });
            const data = await response.json();
            let result: any = {};
            try {
                result = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
            } catch {
                const rawHex = data.response?.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
                if (rawHex && rawHex.length >= 32) {
                    result = { instructions: rawHex.substring(0, 32) };
                }
            }
            
            if (result.instructions && result.instructions.length >= 32) {
                const genome = new Uint8Array(16);
                for (let i = 0; i < 16; i++) {
                    genome[i] = parseInt(result.instructions.substring(i * 2, i * 2 + 2), 16);
                }
                
                let meme: Uint8Array | undefined;
                if (result.meme && result.meme.length >= 8) {
                    meme = new Uint8Array(4);
                    for (let i = 0; i < 4; i++) {
                        meme[i] = parseInt(result.meme.substring(i * 2, i * 2 + 2), 16);
                    }
                }
                
                return { genome, meme };
            }
        } catch(e) {
            console.warn("Oracle connection failed (LLM Offline). Stochastic Mutation.");
            const genome = new Uint8Array(16);
            // Default: SIGNAL + Replicate
            genome.set([0x81, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]);
            return { genome };
        }
        return null;
    }
};

// --- Diagnostic Mode ---
if (import.meta.main) {
    const testVox = "Collective Voice: ENTITY_A(15.2), RESONANCE_CORE(10.1)";
    const thought = await LLM_SYNAPSE.generateThought(testVox);
    console.log("TEST RESULT:", thought);
}

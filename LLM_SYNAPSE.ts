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
     * generateAtomicBytecode: Era 67 (Sovereign Oracle)
     * Prompts the LLM to output exactly 16 hex characters (8 bytes) representing new WASM bytecode.
     */
    generateAtomicBytecode: async (telemetry: any): Promise<Uint8Array | null> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

        const prompt = `
            Task: You are the Sovereign Oracle of OMEGA-64, an advanced artificial life simulation.
            You govern a supreme organism known as the Regent.
            
            Telemetry Data:
            - Nutrients Available: ${telemetry.nutrients}
            - Current Regent Energy: ${telemetry.energy}
            - Population: ${telemetry.population}
            - Viral Load: ${telemetry.viralLoad}

            Your goal is to reprogram your own genome to survive. 
            The genome consists of EXACTLY 8 BYTES, represented as 16 hexadecimal characters.
            
            Valid bytecode opcodes include:
            - 08: MITOSIS (Reproduce)
            - 20: FEED (Gather nutrients)
            - FF: ASCEND (Turn into a permanent crystal structure)

            Example Output format: "0800000000000000" (Mitosis)
            Example Output format: "20A0000000000000" (Feed)
            
            You MUST ONLY return the 16 uppercase hexadecimal characters. NO explanations. NO markdown.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false, format: "json" }),
            });
            const data = await response.json();
            const hex = data.response?.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
            
            if (hex && hex.length >= 16) {
                const bytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
                }
                return bytes;
            }
        } catch(e) {
            console.warn("Oracle connection failed (LLM Offline). Using Stochastic Mutation fallback.");
            // Fallback: Generate a random "viable" genome
            const bytes = new Uint8Array(8);
            // Opcode is usually the first byte
            const opcodes = [0x08, 0x20, 0xFF, 0x00]; 
            bytes[0] = opcodes[Math.floor(Math.random() * opcodes.length)];
            for (let i = 1; i < 8; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
            return bytes;
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

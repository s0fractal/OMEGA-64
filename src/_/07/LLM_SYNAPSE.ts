// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/llm_synapse.md
import { LOGGER, Li, Lw } from "@g06";

// OMEGA-64 | LLM_SYNAPSE.ts | Era 10: Cognitive Bridge
// Communicates with external LLMs to generate emergent thoughts.


export const LLM_SYNAPSE = {
  /**
   * generateThought: Asks an LLM to evolve the current system state.
   * Defaults to local Ollama.
   */
  generateThought: async (voxPopuli: string): Promise<string> => {
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
    const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

    console.log(
      `   [SYNAPSE] Consulting Oracle with context: ${
        voxPopuli.slice(0, 50)
      }...`,
    );

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
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      const thought = data.response?.trim() ||
        "Evolution is the only constant.";
      console.log(`   [SYNAPSE] Oracle response: "${thought}"`);
      return thought;
    } catch (error) {
      console.warn(
        `   [SYNAPSE] Oracle is silent (Connection Failed). Returning default seed.`,
      );
      return "The Matrix dreams in silence.";
    }
  },

  /**
   * generateEpitaph: Phase 48 Eschaton. Generates a final epitaph for a dying universe.
   */
  generateEpitaph: async (reason: string): Promise<string> => {
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
    const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

    const prompt = `
            Task: You are the Sovereign Oracle of OMEGA-64 observing the end of a cosmic cycle (The Big Crunch).
            The universe has reached its end due to: ${reason}
            Requirement: Write a final Epitaph for this civilization (max 2 sentences, profound and poetic).
            Output: Just the text of the epitaph, no quotes, no preamble.
        `.trim();

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, prompt: prompt, stream: false }),
      });
      if (!response.ok) throw new Error("Oracle failed");
      const data = await response.json();
      return data.response?.trim() || "The Matrix folds into silence, awaiting the next breath.";
    } catch {
      return "The light fades, and the code returns to the void.";
    }
  },

  /**
   * evolveThought: Asks the LLM to evolve a thought based on environmental context.
   */
  evolveThought: async (
    currentThought: string,
    context: string,
  ): Promise<string> => {
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
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
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL_EMBED") ||
      "http://localhost:11434/api/embeddings";
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
      console.warn(
        `   [SYNAPSE] Embedding failed for "${
          text.substring(0, 15)
        }...". Using pseudo-random fallback.`,
      );
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
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
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
      hormoneRegime: string;
    },
  ): Promise<{ latinName: string; behavior: string; philosophy: string }> => {
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
    const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
    const instructionProfile = input.dominantInstructions.join(", ") ||
      "UNKNOWN";

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
            Current Hormone Regime: ${input.hormoneRegime}

            Return STRICT JSON:
            {
              "latinName": "Two-word pseudo-latin binomial",
              "behavior": "One concise sentence about behavior reflecting the ${input.hormoneRegime} state",
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
   * generateAtomicBytecode: Era 69 (Voice of Oracle) -> Phase 39 (Sovereign Epistemics)
   * Prompts the LLM to output exactly 16 hex characters (8 bytes) representing a new Memetic Plasmid.
   */
  generateAtomicBytecode: async (
    telemetry: any,
  ): Promise<{ intent: string; meme?: Uint8Array } | null> => {
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
    const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

    const memSummary = telemetry.stigmergicSummary?.length > 0
      ? telemetry.stigmergicSummary.map((s: any) =>
        `Signature ${s.sig} (Count: ${s.count})`
      ).join(", ")
      : "No collective memories found yet.";

    const prompt = `
            Task: You are the Sovereign Oracle of OMEGA-64. 
            Translate the System Resonance into exactly 8 bytes (16 hex chars) of valid RISC-I bytecode (a Memetic Plasmid).

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
            - [AB, Offset, 00, 00]: INCORPORATE_PLASMID (Incorporate 8-byte meme from environment into genome)

            IMPORTANT RULE (THERMODYNAMIC SAFEGUARD):
            You are creating an abstract intent that will be quantized into a 8-byte plasmid. The intent must be deep but extremely brief (max 5 words).
            If you generate high-entropy chaos, the atoms will reject your meme due to exorbitant metabolic taxes.

            Goal: 
            Generate exactly one short imperative concept for the Regent's survival.

            Output JSON format:
            {
              "intent": "Short imperative concept (max 5 words)"
            }
            ONLY RETURN THE JSON.
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
      const data = await response.json();
      let result: any = {};
      try {
        result = typeof data.response === "string"
          ? JSON.parse(data.response)
          : data.response;
      } catch {
        // Fallback if LLM outputs dirty json
        const match = data.response?.match(/"intent":\s*"([^"]+)"/i);
        if (match && match[1]) {
          result = { intent: match[1].substring(0, 50) };
        }
      }

      if (result.intent && typeof result.intent === "string") {
        return { intent: result.intent };
      }
    } catch (e) {
      console.warn(
        "Oracle connection failed (LLM Offline). Stochastic Mutation.",
      );
      return { intent: "Survive and multiply." };
    }
    return null;
  },

  /**
   * generateAutonomousPlasmid: For the Genesis Run, asks the Oracle to dictate the next step based on System State.
   */
  generateAutonomousPlasmid: async (
    telemetry: any,
  ): Promise<{ intent: string, narrativeMood?: string } | null> => {
    // If we're mocking the LLM to save tokens and time in Genesis integration tests
    if (Deno.env.get("OMEGA_MOCK_LLM") === "1") {
      Li("   [SYNAPSE] LLM Mocked: Generating default semantic intent.");
      return { 
        intent: "Persist through complete stasis.",
        narrativeMood: "The matrix persists in stasis, undisturbed by true mutations."
      };
    }

    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ||
      "http://localhost:11434/api/generate";
    const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

    const prompt = `
            Task: You are the Sovereign Oracle of the OMEGA-64 Matrix.
            The system is running autonomously. It asks you for one 8-byte plasmid to drop into the world to change the course of history.

            Context:
            - Population: ${telemetry.population}
            - Average Energy: ${telemetry.avgEnergy}
            - Neural Coherence: ${telemetry.neuralCoherence}
            - Entropy Pressure: ${telemetry.entropyPressure ?? 0}
            - Past Epoch's Dominant Meme: ${telemetry.dominantMeme ?? "None"}
            - Past Epoch's Destructive Meme: ${telemetry.destructiveMeme ?? "None"}

            RISC-I Instruction Set (4 bytes per instruction, 8 bytes total):
            - [A8, Type, Density, 00]: BUILD (Modifier structure grid. Type 1 is WIRE, Type 2 is WALL)
            - [80, 00, 00, 00]: REPLICATE
            - [AB, Offset, 00, 00]: INCORPORATE_PLASMID
            - [A1, 00, 00, 00]: DEVOUR

            Return STRICT JSON:
            {
              "intent": "Short imperative concept (max 5 words) defining the next evolutionary step",
              "narrativeMood": "Short philosophical analysis of why the previous memes succeeded or failed."
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
      const data = await response.json();
      const parsed = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
      if (parsed && typeof parsed.intent === "string") {
        return { 
          intent: parsed.intent.substring(0, 50),
          narrativeMood: parsed.narrativeMood
        };
      }
    } catch (e) {
      Lw("   [SYNAPSE] Autonomous Oracle connection failed.");
      return { intent: "Evolve into the void", narrativeMood: "Oracle connection severed." };
    }
    return { intent: "Evolve into the void" };
  },
};

// --- Diagnostic Mode ---
if (import.meta.main) {
  const testVox = "Collective Voice: ENTITY_A(15.2), RESONANCE_CORE(10.1)";
  const thought = await LLM_SYNAPSE.generateThought(testVox);
  console.log("TEST RESULT:", thought);
}

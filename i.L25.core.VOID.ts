import { LLMAdapter, MockAdapter, OpenAIAdapter } from "./i.L25.core.LLM_ADAPTER.ts";

// Try to load secrets gracefully
const secrets: any = {};
try {
    // Dynamic import to avoid crash if file missing
    // In Deno/TS, we can't easily dynamic import a clearer path without top-level await or a build step.
    // For now, we'll assume Mock if SECRET.ts is missing (handled via try/catch in runtime or manual check).
    // Actually, let's just use a placeholder logic.
    // Ideally: import { SECRETS } from "./i.L99.core.SECRET.ts";
} catch (e) {
    console.warn("⚠️ VOID: No SECRET.ts found. Using Mock.");
}

// Initialize Adapter
let adapter: LLMAdapter = MockAdapter;

// Function to inject secrets (Runtime Injection)
export const injectSecrets = (keys: any) => {
    if (keys.OPENAI_API_KEY) {
        adapter = new OpenAIAdapter(keys.OPENAI_API_KEY);
        console.log("🟢 VOID: OpenAI Adapter Activated.");
    }
};

export const VOID = {
    /**
     * Ask the Void for a semantic judgement.
     * @param context Description of the event/state causing high entropy.
     * @returns "ALLOW" (Evolution) or "PURGE" (Virus/Noise) or cryptic wisdom.
     */
    ask: async (context: string): Promise<string> => {
        // Use the active adapter
        try {
            const result = await adapter.query(context);
            // Normalize result
            if (result.toUpperCase().includes("PURGE")) return "PURGE";
            if (result.toUpperCase().includes("ALLOW")) return "ALLOW";
            return result;
        } catch (e) {
            console.error("VOID Error:", e);
            return "ALLOW"; // Fail open
        }
    }
};

// Bind for the Ribosome (Legacy compatibility)
export const MASS = 2500; 

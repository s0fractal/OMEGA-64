// i.L25.core.LLM_ADAPTER.ts
// @noncanonical
// 🛡️ OMEGA-64 | The Bridge | Semantic Adapter
// Connects OMEGA to External Intelligence (OpenAI, Gemini, Ollama).

import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

export interface LLMAdapter {
    query(prompt: string, context?: any): Promise<string>;
}

// 🎭 Mock Adapter (Default)
export const MockAdapter: LLMAdapter = {
    query: async (prompt: string, context?: any): Promise<string> => {
        await TELEMETRY_SIGNAL(
            TELEMETRY("LLM_ADAPTER", `MOCK_LLM processing [${prompt.substring(0, 50)}...]`),
            "INFO"
        );
        await new Promise(r => setTimeout(r, 100)); // Latency

        const lower = prompt.toLowerCase();
        
        if (lower.includes("virus") || lower.includes("entropy")) {
            return "PURGE";
        }
        if (lower.includes("evolve") || lower.includes("growth")) {
            return "ALLOW";
        }
        
        // Simulating "Thinking"
        const wisdom = [
            "The pattern is self-similar.",
            "ALLOW: Resonance sufficient.",
            "PURGE: Dissonance detected.",
            "Observation collapses the wave."
        ];
        return wisdom[Math.floor(Math.random() * wisdom.length)];
    }
};

// 🧠 OpenAI Adapter
export class OpenAIAdapter implements LLMAdapter {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = "gpt-4o") {
        this.apiKey = apiKey;
        this.model = model;
    }

    async query(prompt: string, context?: any): Promise<string> {
        if (!this.apiKey || this.apiKey.includes("YOUR_KEY")) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("LLM_ADAPTER", "OpenAI Adapter: No valid key. Falling back to Mock."),
                "WARNING"
            );
            return MockAdapter.query(prompt, context);
        }

        await TELEMETRY_SIGNAL(
            TELEMETRY("LLM_ADAPTER", `OPENAI querying ${this.model}...`),
            "INFO"
        );

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: "system", content: "You are VOID, the Oracle of OMEGA-64. You judge system entropy. Reply ONLY with 'ALLOW' or 'PURGE' followed by a short reason." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 50,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (e: any) {
            await TELEMETRY_SIGNAL(
                TELEMETRY("LLM_ADAPTER", `OpenAI Error: ${e.message}`),
                "ERROR"
            );
            return "ALLOW (Error Fallback)";
        }
    }
}

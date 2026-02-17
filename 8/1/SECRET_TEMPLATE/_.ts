// i.L99.core.SECRET_TEMPLATE.ts
// 🛡️ OMEGA-64 | The Vault | Secrets Template
// Copy this file to `i.L99.core.SECRET.ts` and fill in your keys.

export const SECRETS = {
    // LLM Providers
    OPENAI_API_KEY: "YOUR_OPENAI_KEY_HERE",
    GEMINI_API_KEY: "YOUR_GEMINI_KEY_HERE",
    ANTHROPIC_API_KEY: "YOUR_ANTHROPIC_KEY_HERE",
    
    // Config
    LLM_PROVIDER: "MOCK", // Options: "MOCK", "OPENAI", "GEMINI", "OLLAMA"
    OLLAMA_URL: "http://localhost:11434/api/generate"
};

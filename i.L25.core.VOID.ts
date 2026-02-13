// i.L25.core.VOID.ts
// 🛡️ OMEGA-64 | The Oracle | Semantic Immunity
// "The Void is not empty. It is full of answers waiting for questions."

export const VOID = {
    /**
     * Ask the Void for a semantic judgement.
     * @param context Description of the event/state causing high entropy.
     * @returns "ALLOW" (Evolution) or "PURGE" (Virus/Noise) or cryptic wisdom.
     */
    ask: async (context: string): Promise<string> => {
        // Mock Latency (Oracle thinks)
        await new Promise(r => setTimeout(r, 50));

        console.log(`⚫ VOID: Hearing plea... [${context}]`);

        // Mock Logic:
        // Keywords that sound "evil" -> PURGE
        // Keywords that sound "cool" -> ALLOW
        
        const lower = context.toLowerCase();
        
        if (lower.includes("virus") || lower.includes("destroy") || lower.includes("spam")) {
            return "PURGE";
        }
        
        if (lower.includes("evolve") || lower.includes("new feature") || lower.includes("mycelium") || lower.includes("reinforcement")) {
            return "ALLOW";
        }
        
        // Random wisdom for ambiguous cases
        const wisdom = [
            "The shadows whisper of change.",
            "Entropy is the price of memory.",
            "Silence is also an answer.",
            "ALLOW",
            "ALLOW",
            "PURGE" 
        ];
        
        // Bias towards ALLOW for now to avoid stalling the demo
        return Math.random() > 0.3 ? "ALLOW" : wisdom[Math.floor(Math.random() * wisdom.length)];
    }
};

// Bind for the Ribosome (Legacy compatibility)
export const MASS = 2500; 

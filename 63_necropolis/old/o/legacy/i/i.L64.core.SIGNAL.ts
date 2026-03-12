// i.L64.core.SIGNAL.ts
// 📡 OMEGA-64 | The Semantic Membrane
// Allows the System to request intervention from the Operator.

export type SignalType = "INFO" | "WARNING" | "REQUEST" | "ERROR";

export interface SignalPayload {
    source: string;
    message: string;
    context?: Record<string, any>;
}

const SIGNAL_FILE = "./OMEGA_SIGNAL.md";

export const SIGNAL = {
    /**
     * Emit a signal to the Operator.
     * Appends a structured block to OMEGA_SIGNAL.md.
     */
    emit: async (type: SignalType, payload: SignalPayload) => {
        const timestamp = new Date().toISOString();
        const icon = type === "INFO" ? "🟢" : 
                     type === "WARNING" ? "🟡" : 
                     type === "REQUEST" ? "🔴" : "⚫";

        const contextBlock = payload.context 
            ? `\n**Context**:\n\`\`\`json\n${JSON.stringify(payload.context, null, 2)}\n\`\`\`` 
            : "";

        const entry = `
## [${timestamp}] ${icon} ${type}
**Source**: \`${payload.source}\`
**Message**: ${payload.message}
${contextBlock}
---
`;
        
        try {
            await Deno.writeTextFile(SIGNAL_FILE, entry, { append: true });
        } catch (e) {
            throw e;
        }
    }
};

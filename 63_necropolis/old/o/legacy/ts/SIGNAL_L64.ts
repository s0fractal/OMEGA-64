
/**
 * [7/7/SIGNAL/_.ts]
 * Inverted from Legacy L64 (Membrane).
 */
export const ATOM = () => {
    const SIGNAL_FILE = "./OMEGA_SIGNAL.md";

    return {
        emit: async (type: "INFO" | "WARNING" | "REQUEST" | "ERROR", payload: { source: string, message: string, context?: Record<string, any> }) => {
            const timestamp = new Date().toISOString();
            const icon = type === "INFO" ? "🟢" : 
                         type === "WARNING" ? "🟡" : 
                         type === "REQUEST" ? "🔴" : "⚫";

            const contextBlock = payload.context 
                ? `\n**Context**:\n\`\`\`json\n${JSON.stringify(payload.context, null, 2)}\n\`\`\`` 
                : "";

            const entry = `\n## [${timestamp}] ${icon} ${type}\n**Source**: \`${payload.source}\`\n**Message**: ${payload.message}${contextBlock}\n---\n`;
            
            await Deno.writeTextFile(SIGNAL_FILE, entry, { append: true });
        }
    };
};

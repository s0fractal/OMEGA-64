
/**
 * [3/7/AGENT_SIGNATURE/_.ts]
 * Inverted from Legacy L32. Level 31.
 */
export const ATOM = () => {
    const stableStringify = (value: unknown): string => {
        if (Array.isArray(value)) {
            return `[${value.map((v) => stableStringify(v)).join(",")}]`;
        }
        if (value && typeof value === "object") {
            const entries = Object.entries(value as Record<string, unknown>)
                .filter(([, v]) => typeof v !== "undefined")
                .sort(([a], [b]) => a.localeCompare(b));
            const body = entries
                .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
                .join(",");
            return `{${body}}`;
        }
        return JSON.stringify(value);
    };

    const toHex = (buffer: ArrayBuffer): string =>
        Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    return {
        stableStringify,
        toHex,
        canonicalProposalPayload: (proposal: any): string => stableStringify(proposal)
    };
};

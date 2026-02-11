// i.L99.core.CRYSTALLIZATION_CONFIG.ts
// OMEGA-64 | Canon Policy | Crystallization Runtime Defaults

export interface CrystallizationConfig {
    policyVersion: string;
    window: number;
    minSoftPasses: number;
    defaultRequiredWindows: number;
    projectionDriftMaxP95: number;
    projectionDriftTopLevels: number;
}

export const CRYSTALLIZATION_CONFIG: CrystallizationConfig = {
    policyVersion: "crystallization/v1",
    window: 512,
    minSoftPasses: 5,
    defaultRequiredWindows: 3,
    projectionDriftMaxP95: 1024,
    projectionDriftTopLevels: 8
};

const stableStringify = (value: unknown): string => {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
    }
    return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

const sha256Hex = async (input: string): Promise<string> => {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
};

export const CRYSTALLIZATION_POLICY = {
    canonicalPayload: (): string =>
        stableStringify({
            policyVersion: CRYSTALLIZATION_CONFIG.policyVersion,
            window: CRYSTALLIZATION_CONFIG.window,
            minSoftPasses: CRYSTALLIZATION_CONFIG.minSoftPasses,
            defaultRequiredWindows: CRYSTALLIZATION_CONFIG.defaultRequiredWindows,
            projectionDriftMaxP95: CRYSTALLIZATION_CONFIG.projectionDriftMaxP95,
            projectionDriftTopLevels: CRYSTALLIZATION_CONFIG.projectionDriftTopLevels
        }),

    hash: async (): Promise<string> => await sha256Hex(CRYSTALLIZATION_POLICY.canonicalPayload())
};

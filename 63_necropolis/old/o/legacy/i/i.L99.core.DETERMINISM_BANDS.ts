// i.L99.core.DETERMINISM_BANDS.ts
// OMEGA-64 | Determinism Band Map
// "Keep the address. Shift the lens."

export type DeterminismBand = "AX" | "OP" | "FL" | "PJ" | "DR" | "UNKNOWN";

export interface BandRange {
    band: DeterminismBand;
    min: number;
    max: number;
}

export const DETERMINISM_BANDS: BandRange[] = [
    { band: "AX", min: 60, max: 63 },
    { band: "OP", min: 48, max: 59 },
    { band: "FL", min: 32, max: 47 },
    { band: "PJ", min: 16, max: 31 },
    { band: "DR", min: 0, max: 15 }
];

export const levelToBand = (level: number): DeterminismBand => {
    for (const band of DETERMINISM_BANDS) {
        if (level >= band.min && level <= band.max) return band.band;
    }
    return "UNKNOWN";
};

export const atomIdToLevel = (atomId: string): number | null => {
    const match = atomId.match(/\bL([+-]?\d{1,2})\b/);
    if (!match) return null;
    const raw = match[1];
    const level = Number.parseInt(raw, 10);
    if (!Number.isFinite(level)) return null;
    if (level < 0 || level > 63) return null;
    return level;
};

export const atomIdToBand = (atomId: string): DeterminismBand => {
    const level = atomIdToLevel(atomId);
    if (level === null) return "UNKNOWN";
    return levelToBand(level);
};
